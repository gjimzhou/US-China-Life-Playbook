"""Keep one stable, actionable maintenance issue; unchanged state is silent."""
from datetime import date, timedelta
import json
import os
from pathlib import Path
import urllib.request

MARKER = '<!-- playbook-maintenance-queue -->'
TITLE = '维护队列：到期与七天内待复核事项'

def issue_body(report):
    horizon = date.fromisoformat(report['as_of']) + timedelta(days=7)
    entries = [e for e in report['entries'] if date.fromisoformat(e['due']) <= horizon]
    if not entries:
        return None
    lines = [MARKER, '以下事项已到期或将在七天内到期。完成后提交证据记录并更新台账，工作流会同步本页。',
             '日期代表维护安排，不代表正文已失效；手动关闭不会替代复核。', '', '| 范围 | 到期日 | 最近结果 |', '|---|---|---|']
    for e in sorted(entries, key=lambda e: (e['due'], e['id'])):
        lines.append(f'| {e["scope"]} | {e["due"]} | {e.get("review_status", "未建立基线")} |')
    lines += ['', '[维护流程](https://github.com/gjimzhou/US-China-Life-Playbook/blob/main/docs/maintenance/maintenance-workflow.md) · [证据记录](https://github.com/gjimzhou/US-China-Life-Playbook/tree/main/maintenance/reviews)',
              '', '此页由程序维护；讨论请使用评论，避免把手写待办放在自动生成正文中。']
    return '\n'.join(lines)

def reconcile(api, repo, body):
    prefix = f'/repos/{repo}/issues'
    found = None
    page = 1
    while True:
        issues = api('GET', prefix + f'?state=all&per_page=100&page={page}')
        for issue in issues:
            if not issue.get('pull_request') and (issue.get('body') or '').startswith(MARKER):
                found = issue
                break
        if found or len(issues) < 100:
            break
        page += 1
    if found is None:
        if body:
            api('POST', prefix, {'title': TITLE, 'body': body})
        return
    patch = {}
    if body:
        if found['body'] != body:
            patch['body'] = body
        if found['state'] != 'open':
            patch['state'] = 'open'
    elif found['state'] == 'open':
        patch = {'state': 'closed', 'state_reason': 'completed'}
    if patch:
        api('PATCH', prefix + '/' + str(found['number']), patch)

if __name__ == '__main__':
    token = os.environ['GH_TOKEN']
    repo = os.environ['GITHUB_REPOSITORY']
    def api(method, path, payload=None):
        request = urllib.request.Request('https://api.github.com' + path,
            data=json.dumps(payload).encode() if payload is not None else None,
            headers={'Authorization': f'Bearer {token}', 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json'}, method=method)
        with urllib.request.urlopen(request) as response:
            return json.load(response)
    report = json.loads(Path('_maintenance/report.json').read_text())
    reconcile(api, repo, issue_body(report))
