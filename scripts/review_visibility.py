"""Expose existing review scope and evidence without certifying whole chapters."""
import json
from urllib.parse import quote
from maintenance_report import review_due

REPO = 'https://github.com/gjimzhou/US-China-Life-Playbook/blob/main/'
NOTICE = '以下仅列出已登记范围，不代表整章或关联清单全部核验；具体主张、适用条件与未决缺口请查看记录。复核日期是编辑安排，不是读者的法定期限。'

def attach_review_summaries(root, docs):
    registry = json.loads((root / 'maintenance/review-registry.json').read_text())
    for doc in docs:
        entries = [e for e in registry['entries'] if e['path'] == doc['path']]
        if not entries:
            continue
        lines = [NOTICE, '']
        for e in entries:
            state = {'complete': '登记范围已完成核验', 'partial': '最近仅部分核验，仍有缺口'}.get(e.get('review_status'), '尚未记录核验结果')
            lines.append('- **' + e['scope'] + '**：' + state + '。')
            if e.get('last_verified'):
                lines.append('  最近完整核验：' + e['last_verified'] + '。')
            else:
                lines.append('  尚无该登记范围的完整核验日期。')
            if e.get('last_review_attempt'):
                lines.append('  最近尝试：' + e['last_review_attempt'] + '。')
            lines.append('  计划复核日期：' + review_due(e).isoformat() + '。')
            if e.get('review_by_reason'):
                lines.append('  提前复核原因：' + e['review_by_reason'] + '。')
            record = e.get('latest_review_record') or e.get('review_record')
            if record:
                assert (root / record).is_file(), 'Missing review record: ' + record
                lines.append('  [查看逐项依据与未决缺口](' + REPO + quote(record) + ')。')
            if e.get('review_record') and e['review_record'] != record:
                assert (root / e['review_record']).is_file()
                lines.append('  [查看上次完整核验记录](' + REPO + quote(e['review_record']) + ')。')
            lines.append('')
        doc['reviewSummary'] = '\n'.join(lines)
