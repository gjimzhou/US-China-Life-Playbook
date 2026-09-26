import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from check_release import check, EXPECTED
from sync_maintenance_issue import MARKER, issue_body, reconcile

class ReleaseSafety(unittest.TestCase):
    def test_artifact_integrity_and_version(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'docs/releases').mkdir(parents=True)
            for name in ['VERSION', 'HOME.md', 'DOWNLOADS.md', 'CHANGELOG.md', 'docs/releases/v1.2.1.md']:
                (root / name).write_text('v1.2.1')
            out = root / 'downloads'; out.mkdir()
            entries = []
            for name in sorted(EXPECTED):
                data = name.encode(); (out / name).write_bytes(data)
                entries.append({'name': name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
            (out / 'manifest.json').write_text(json.dumps({'version': 'v1.2.1', 'sourceCommit': 'abc', 'files': entries}))
            (out / 'SHA256SUMS.txt').write_text(''.join(f'{e["sha256"]}  {e["name"]}\n' for e in entries))
            check(root, 'v1.2.1', out, 'abc')
            with self.assertRaises(ValueError): check(root, 'v1.2.2')
            with self.assertRaises(ValueError): check(root, 'v1.2.1', out, 'wrong')
            (out / entries[0]['name']).write_text('tampered')
            with self.assertRaises(ValueError): check(root, 'v1.2.1', out, 'abc')

class MaintenanceSync(unittest.TestCase):
    def test_due_window_and_silent_unchanged_body(self):
        report = {'as_of': '2026-09-25', 'entries': [{'id': 'x', 'scope': 'Example', 'due': '2026-10-01'}]}
        body = issue_body(report)
        report['as_of'] = '2026-09-26'
        self.assertEqual(body, issue_body(report))
        report['entries'][0]['due'] = '2026-10-05'
        self.assertIsNone(issue_body(report))
    def test_create_noop_reopen_and_close(self):
        calls = []
        existing = []
        def api(method, path, payload=None):
            calls.append((method, payload))
            return existing if method == 'GET' else {}
        reconcile(api, 'o/r', MARKER + '\nwork')
        self.assertEqual(calls[-1][0], 'POST')
        existing.append({'number': 1, 'body': MARKER + '\nwork', 'state': 'open'})
        calls.clear(); reconcile(api, 'o/r', existing[0]['body'])
        self.assertEqual(len(calls), 1)
        reconcile(api, 'o/r', None)
        self.assertEqual(calls[-1][1]['state'], 'closed')
        existing[0]['state'] = 'closed'
        reconcile(api, 'o/r', existing[0]['body'])
        self.assertEqual(calls[-1][1]['state'], 'open')

if __name__ == '__main__': unittest.main()
