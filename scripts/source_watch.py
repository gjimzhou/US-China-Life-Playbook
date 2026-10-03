"""Compare a few public official pages; never edit facts or verification dates."""
import argparse
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
import unicodedata
import urllib.error
import urllib.parse
import urllib.request

from sync_maintenance_issue import reconcile

ROOT = Path(__file__).resolve().parents[1]
MARKER = '<!-- playbook-official-source-watch -->'
TITLE = '官方来源变化：待人工复核'
HOSTS = {'cdc.gov', 'cms.gov', 'uscis.gov'}
LIMIT = 2 * 1024 * 1024
HASH = re.compile(r'[0-9a-f]{64}')


class PageText(HTMLParser):
    """Extract one main region, ignoring navigation, forms and executable text."""
    VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}
    SKIP = {'script', 'style', 'noscript', 'nav', 'footer', 'form', 'button'}

    def __init__(self, url):
        super().__init__(convert_charrefs=True)
        self.url, self.stack, self.parts, self.regions = url, [], [], 0

    def handle_starttag(self, tag, attrs):
        parent = self.stack[-1] if self.stack else ('', False, False)
        active = parent[1] or tag == 'main'
        skip = parent[2] or tag in self.SKIP
        if tag == 'main':
            self.regions += 1
        if active and not skip and tag == 'a':
            href = dict(attrs).get('href', '')
            if href and not href.startswith('#'):
                self.parts.append('[link:' + urllib.parse.urljoin(self.url, href) + ']')
        if tag not in self.VOID:
            self.stack.append((tag, active, skip))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        if self.stack and self.stack[-1][1] and not self.stack[-1][2]:
            self.parts.append(data)


def fingerprint(html, url):
    page = PageText(url)
    page.feed(html)
    text = ' '.join(unicodedata.normalize('NFKC', ' '.join(page.parts)).split())
    if page.regions != 1 or len(text) < 400 or len(text) > 250_000:
        raise ValueError('invalid-main-region')
    return hashlib.sha256(text.encode()).hexdigest()


def allowed_url(url):
    u = urllib.parse.urlsplit(url)
    return (u.scheme == 'https' and u.hostname and u.hostname.removeprefix('www.') in HOSTS
            and not u.username and not u.password and u.port in (None, 443))


class OfficialRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if not allowed_url(newurl):
            raise ValueError('redirect-outside-official-hosts')
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def observe(source):
    try:
        if not allowed_url(source['url']):
            raise ValueError('invalid-source-url')
        request = urllib.request.Request(source['url'])
        with urllib.request.build_opener(OfficialRedirect()).open(request, timeout=25) as response:
            if response.headers.get_content_type() != 'text/html':
                raise ValueError('unexpected-content-type')
            content = response.read(LIMIT + 1)
            if len(content) > LIMIT:
                raise ValueError('response-too-large')
            html = content.decode(response.headers.get_content_charset() or 'utf-8')
        return {'sha256': fingerprint(html, source['url'])}
    except urllib.error.HTTPError as error:
        return {'error': f'http-{error.code}'}
    except (OSError, ValueError) as error:
        # Do not copy remote response text or URLs with query data into public issues.
        return {'error': type(error).__name__}


def load_config(path):
    config = json.loads(path.read_text())
    if config.get('schema_version') != 1 or not 3 <= len(config.get('sources', [])) <= 5:
        raise ValueError('Expected 3–5 explicitly configured sources')
    ids = set()
    for source in config['sources']:
        if (not re.fullmatch(r'[a-z0-9-]+', source['id']) or source['id'] in ids
                or not allowed_url(source['url']) or not HASH.fullmatch(source['accepted_sha256'])
                or not source['scope'].strip() or not source['owner'].strip()):
            raise ValueError('Invalid source configuration')
        ids.add(source['id'])
    return config['sources']


def validate_state(state):
    if state.get('schema_version') != 1 or not isinstance(state.get('sources'), dict):
        raise ValueError('Invalid saved state; do not silently reset monitoring')
    for entry in state['sources'].values():
        if (not HASH.fullmatch(entry['accepted_sha256'])
                or not isinstance(entry['pending'], list) or len(entry['pending']) > 10
                or not all(HASH.fullmatch(h) for h in entry['pending'])
                or type(entry['failures']) is not int or not 0 <= entry['failures'] <= 2):
            raise ValueError('Invalid saved source state')
    return state


def advance(sources, previous, observations):
    validate_state(previous)
    state = {'schema_version': 1, 'sources': {}}
    for source in sources:
        key, accepted = source['id'], source['accepted_sha256']
        old = previous['sources'].get(key, {})
        pending = list(old.get('pending', [])) if old.get('accepted_sha256') == accepted else []
        result = observations[key]
        if 'sha256' in result:
            digest = result['sha256']
            if not HASH.fullmatch(digest):
                raise ValueError('Invalid observed digest')
            if digest != accepted and digest not in pending:
                pending = (pending + [digest])[-10:]
            failures, error = 0, None
        else:
            failures = min(2, old.get('failures', 0) + 1)
            error = result['error']
        state['sources'][key] = {'accepted_sha256': accepted, 'pending': pending,
                                 'failures': failures, 'error': error}
    return state


def issue_body(sources, state):
    lines = [MARKER, '以下信号需要人工阅读原文并对照具体主张；页面变化不等于政策变化。',
             '程序不会改写正文、核验日期或到期任务。', '']
    actionable = False
    for source in sources:
        entry = state['sources'][source['id']]
        if not entry['pending'] and entry['failures'] < 2:
            continue
        actionable = True
        lines += [f'## {source["id"]}', f'- 来源：{source["url"]}',
                  f'- 人工负责范围：{source["owner"]}；{source["scope"]}']
        if entry['pending']:
            lines += [f'- 已接受文本指纹：`{entry["accepted_sha256"]}`',
                      '- 未复核变化指纹（最多保留最近10个）：']
            lines += [f'  - `{digest}`' for digest in entry['pending']]
        if entry['failures'] >= 2:
            lines += [f'- 连续两次或更多检查失败：`{entry["error"]}`；不要据此认定原文失效。']
        lines += ['']
    if not actionable:
        return None
    lines += ['复核后通过PR更新 `maintenance/source-watch.json` 的指纹，并记录事实核验的实际范围。',
              '变化即使随后消失仍保留待办；仅手动关闭Issue不能代替处理。访问故障恢复后自动移除故障提示。',
              '此页由程序维护；讨论请放评论，勿在正文保存手写待办。']
    return '\n'.join(lines)


def gh_json(path):
    result = subprocess.run(['gh', 'api', path], check=True, text=True, capture_output=True)
    return json.loads(result.stdout)


def restore(repo, current_run, current_attempt=1):
    def download(run_id):
        artifacts = gh_json(f'repos/{repo}/actions/runs/{int(run_id)}/artifacts')['artifacts']
        if any(a['name'] == 'source-watch-state' and not a['expired'] for a in artifacts):
            with tempfile.TemporaryDirectory() as directory:
                subprocess.run(['gh', 'run', 'download', str(int(run_id)), '--repo', repo,
                                '--name', 'source-watch-state', '--dir', directory], check=True)
                return validate_state(json.loads((Path(directory) / 'source-watch-state.json').read_text()))
        return None
    # A rerun may already have an unresolved signal in its prior attempt's artifact.
    if current_attempt > 1:
        restored = download(current_run)
        if restored is not None:
            return restored
    seen_trusted = current_attempt > 1
    for page in range(1, 11):
        runs = gh_json(f'repos/{repo}/actions/workflows/source-watch.yml/runs?branch=main&status=completed&per_page=100&page={page}')['workflow_runs']
        trusted = [r for r in runs if str(r['id']) != current_run and r['event'] in ('push', 'schedule', 'workflow_dispatch')]
        seen_trusted = seen_trusted or bool(trusted)
        for run in trusted:
            restored = download(run['id'])
            if restored is not None:
                return restored
        if len(runs) < 100:
            break
    else:
        raise ValueError('State search limit reached; do not silently reset monitoring')
    if seen_trusted:
        raise ValueError('Previous monitoring runs exist but no usable state artifact; investigate retention or failed uploads')
    return {'schema_version': 1, 'sources': {}}


def api(method, path, payload=None):
    command = ['gh', 'api', '--method', method, path.lstrip('/')]
    if payload is not None:
        command += ['--input', '-']
    result = subprocess.run(command, input=json.dumps(payload) if payload is not None else None,
                            check=True, text=True, capture_output=True)
    return json.loads(result.stdout)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--sync', action='store_true', help='Restore state and reconcile the issue; trusted main workflows only')
    parser.add_argument('--output-dir', type=Path, default=ROOT / '_maintenance/source-watch')
    args = parser.parse_args()
    sources = load_config(ROOT / 'maintenance/source-watch.json')
    if args.sync:
        if (os.environ.get('GITHUB_REF') != 'refs/heads/main'
                or os.environ.get('GITHUB_EVENT_NAME') not in ('push', 'schedule', 'workflow_dispatch')):
            raise ValueError('Issue writes require a trusted main workflow')
        previous = restore(os.environ['GITHUB_REPOSITORY'], os.environ['GITHUB_RUN_ID'],
                           int(os.environ.get('GITHUB_RUN_ATTEMPT', '1')))
    else:
        previous = {'schema_version': 1, 'sources': {}}
    observations = {s['id']: observe(s) for s in sources}
    state = advance(sources, previous, observations)
    body = issue_body(sources, state)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    (args.output_dir / 'source-watch-state.json').write_text(json.dumps(state, indent=2) + '\n')
    (args.output_dir / 'observations.json').write_text(json.dumps(observations, indent=2) + '\n')
    (args.output_dir / 'report.md').write_text(body or 'No actionable source signals. This does not certify factual accuracy.\n')
    print(json.dumps(observations, indent=2))
    if args.sync:
        reconcile(api, os.environ['GITHUB_REPOSITORY'], body, marker=MARKER, title=TITLE)


if __name__ == '__main__':
    main()
