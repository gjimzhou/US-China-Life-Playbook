import copy
import json
from pathlib import Path
import unittest
from unittest.mock import patch

from source_watch import (ROOT, MARKER, TITLE, advance, allowed_url, fingerprint,
                          issue_body, load_config, observe, restore, validate_state)
from sync_maintenance_issue import reconcile

A, B, C = 'a' * 64, 'b' * 64, 'c' * 64
EMPTY = {'schema_version': 1, 'sources': {}}
SOURCES = [{'id': 'test-page', 'accepted_sha256': A, 'url': 'https://www.cdc.gov/example',
            'owner': '维护者', 'scope': '测试范围'}]


def step(state=EMPTY, digest=A, error=None, sources=SOURCES):
    return advance(sources, state, {'test-page': {'error': error} if error else {'sha256': digest}})


class ExtractTests(unittest.TestCase):
    def page(self, value='100', extra=''):
        return f'<main><h1>Test</h1><p>{"policy text " * 50}{value}</p>{extra}</main>'

    def test_content_change_but_not_navigation_or_scripts(self):
        initial = fingerprint(self.page(), SOURCES[0]['url'])
        self.assertNotEqual(initial, fingerprint(self.page('200'), SOURCES[0]['url']))
        hidden = '<nav>changed navigation</nav><script>dynamicTimestamp()</script><form>feedback</form>'
        self.assertEqual(initial, fingerprint(self.page(extra=hidden), SOURCES[0]['url']))

    def test_whitespace_and_link_destinations(self):
        page = self.page(extra='<a href="/original.pdf">Notice</a>')
        digest = fingerprint(page, SOURCES[0]['url'])
        self.assertEqual(digest, fingerprint(page.replace('policy text', 'policy   \n text'), SOURCES[0]['url']))
        self.assertNotEqual(digest, fingerprint(page.replace('/original.pdf', '/new.pdf'), SOURCES[0]['url']))

    def test_error_page_or_changed_layout_is_not_a_new_baseline(self):
        for content in ['Access denied', '<main>Loading</main>', self.page() + self.page()]:
            with self.assertRaises(ValueError):
                fingerprint(content, SOURCES[0]['url'])

    def test_official_https_only(self):
        for url in ['http://www.cdc.gov/', 'https://cdc.gov.evil.test/', 'https://user@www.cdc.gov/', 'https://www.cdc.gov:444/']:
            self.assertFalse(allowed_url(url))
        self.assertTrue(allowed_url('https://www.uscis.gov/i-751'))

    def test_http_failure_does_not_fingerprint_an_error_body(self):
        from urllib.error import HTTPError
        with patch('source_watch.urllib.request.build_opener') as opener:
            opener.return_value.open.side_effect = HTTPError(SOURCES[0]['url'], 429, 'slow down', {}, None)
            self.assertEqual(observe(SOURCES[0]), {'error': 'http-429'})


class SignalTests(unittest.TestCase):
    def test_no_change_is_silent(self):
        state = step()
        self.assertIsNone(issue_body(SOURCES, state))
        self.assertEqual(state, step(state))

    def test_controlled_change_persists_until_reviewed(self):
        state = step(digest=B)
        body = issue_body(SOURCES, state)
        self.assertIn(B, body)
        self.assertEqual(body, issue_body(SOURCES, step(state, B)))
        # Even a reversion cannot silently erase an unreviewed change.
        self.assertEqual(body, issue_body(SOURCES, step(state, A)))
        revised = [{**SOURCES[0], 'accepted_sha256': B}]
        self.assertIsNone(issue_body(revised, step(state, B, sources=revised)))

    def test_controlled_failure_threshold_repeat_and_recovery(self):
        once = step(error='http-403')
        self.assertIsNone(issue_body(SOURCES, once))
        twice = step(once, error='http-403')
        body = issue_body(SOURCES, twice)
        self.assertIn('http-403', body)
        self.assertEqual(body, issue_body(SOURCES, step(twice, error='http-403')))
        self.assertIsNone(issue_body(SOURCES, step(twice)))

    def test_recovery_does_not_clear_pending_change(self):
        changed = step(digest=B)
        failed = step(step(changed, error='http-503'), error='http-503')
        recovered = step(failed, B)
        self.assertEqual(issue_body(SOURCES, changed), issue_body(SOURCES, recovered))

    def test_success_interrupts_consecutive_failures(self):
        state = step(step(error='http-429'))
        self.assertIsNone(issue_body(SOURCES, step(state, error='http-429')))

    def test_history_bounded_and_inputs_not_mutated(self):
        original = copy.deepcopy(EMPTY)
        state = EMPTY
        for i in range(15):
            state = step(state, f'{i:064x}')
        self.assertEqual(len(state['sources']['test-page']['pending']), 10)
        self.assertEqual(EMPTY, original)

    def test_config_and_state_validation(self):
        self.assertEqual(len(load_config(ROOT / 'maintenance/source-watch.json')), 3)
        with self.assertRaises(ValueError):
            validate_state({'schema_version': 2, 'sources': {}})
        with self.assertRaises(ValueError):
            validate_state({'schema_version': 1, 'sources': {'x': {'accepted_sha256': A, 'pending': [B], 'failures': 3}}})

    def test_issue_namespace_and_idempotence(self):
        calls, existing = [], []
        def api(method, path, payload=None):
            calls.append((method, payload))
            return existing if method == 'GET' else {}
        body = issue_body(SOURCES, step(digest=B))
        # The ordinary maintenance queue must not be overwritten.
        existing.append({'number': 7, 'body': '<!-- playbook-maintenance-queue -->', 'state': 'open'})
        reconcile(api, 'o/r', body, marker=MARKER, title=TITLE)
        self.assertEqual(calls[-1], ('POST', {'title': TITLE, 'body': body}))
        existing.append({'number': 8, 'body': body, 'state': 'open'})
        calls.clear()
        reconcile(api, 'o/r', body, marker=MARKER, title=TITLE)
        self.assertEqual(len(calls), 1)
        reconcile(api, 'o/r', None, marker=MARKER, title=TITLE)
        self.assertEqual(calls[-1][1]['state'], 'closed')


class RestoreTests(unittest.TestCase):
    def test_rerun_preserves_previous_attempt_pending_changes(self):
        expected = step(digest=B)
        def download(command, **kwargs):
            destination = Path(command[command.index('--dir') + 1])
            (destination / 'source-watch-state.json').write_text(json.dumps(expected))
        with patch('source_watch.gh_json', return_value={'artifacts': [{'name': 'source-watch-state', 'expired': False}]}), patch('source_watch.subprocess.run', side_effect=download):
            self.assertEqual(restore('o/r', '2', current_attempt=2), expected)

    def test_pagination_cannot_turn_existing_history_into_first_run(self):
        replies = [{'workflow_runs': [{'id': i, 'event': 'pull_request'} for i in range(100)]},
                   {'workflow_runs': [{'id': 101, 'event': 'schedule'}]}, {'artifacts': []}]
        with patch('source_watch.gh_json', side_effect=replies):
            with self.assertRaisesRegex(ValueError, 'no usable state'):
                restore('o/r', '200')

    def test_first_run_and_fork_runs_do_not_supply_state(self):
        with patch('source_watch.gh_json', return_value={'workflow_runs': [{'id': 1, 'event': 'pull_request'}]}):
            self.assertEqual(restore('o/r', '2'), EMPTY)

    def test_missing_artifact_never_silently_resets(self):
        with patch('source_watch.gh_json', side_effect=[{'workflow_runs': [{'id': 1, 'event': 'schedule'}]}, {'artifacts': []}]):
            with self.assertRaisesRegex(ValueError, 'no usable state'):
                restore('o/r', '2')

    def test_restore_artifact_and_skip_current_run(self):
        expected = step(digest=B)
        replies = [{'workflow_runs': [{'id': 2, 'event': 'push'}, {'id': 1, 'event': 'schedule'}]},
                   {'artifacts': [{'name': 'source-watch-state', 'expired': False}]}]
        def download(command, **kwargs):
            destination = Path(command[command.index('--dir') + 1])
            (destination / 'source-watch-state.json').write_text(json.dumps(expected))
        with patch('source_watch.gh_json', side_effect=replies), patch('source_watch.subprocess.run', side_effect=download):
            self.assertEqual(restore('o/r', '2'), expected)


if __name__ == '__main__':
    unittest.main()
