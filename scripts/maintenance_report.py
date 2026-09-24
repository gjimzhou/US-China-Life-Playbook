#!/usr/bin/env python3
"""Generate a review queue; never infer factual accuracy from dates or HTTP status."""
import argparse
import json
from datetime import date, timedelta
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]

def review_due(entry):
    if entry['last_verified']:
        return date.fromisoformat(entry['last_verified']) + timedelta(days=entry['interval_days'])
    return date.fromisoformat(entry['initial_review_by'])

def build_report(root, today):
    data = json.loads((root / 'maintenance/review-registry.json').read_text())
    assert data['schema_version'] == 1, 'Unsupported registry schema'
    weeks = data['rotation_weeks']
    assert isinstance(weeks, int) and weeks > 0
    bucket = ((today - date.fromisoformat(data['rotation_anchor'])).days // 7) % weeks
    ids, entries = set(), []
    for e in data['entries']:
        assert e['id'] not in ids, f"Duplicate id: {e['id']}"
        ids.add(e['id'])
        assert (root / e['path']).is_file(), e['path']
        assert e['scope'].strip() and isinstance(e['interval_days'], int) and e['interval_days'] > 0
        assert e['sources'] and all(urlparse(u).scheme == 'https' and urlparse(u).hostname for u in e['sources'])
        if e['last_verified']:
            assert date.fromisoformat(e['last_verified']) <= today, 'Future verification date'
            assert e['review_record'] and (root / e['review_record']).is_file(), 'Missing evidence record'
        if e.get('last_review_attempt'):
            assert date.fromisoformat(e['last_review_attempt']) <= today, 'Future review attempt'
            assert e.get('review_status') in ('partial', 'complete'), 'Invalid review status'
            assert e.get('latest_review_record') and (root / e['latest_review_record']).is_file(), 'Missing latest review record'
            if e['review_status'] == 'complete':
                assert e['last_verified'] == e['last_review_attempt'], 'Complete review needs verified date'
                assert e['review_record'] == e['latest_review_record'], 'Complete review needs evidence baseline'
        due = review_due(e)
        entries.append({**e, 'due': due.isoformat(), 'status': 'due' if due <= today else 'scheduled',
                        'baseline': 'recorded' if e['last_verified'] else 'not-established'})
    entries.sort(key=lambda e: (e['due'], e['interval_days'], e['id']))
    rotation = []
    for directory in ('book', 'checklists'):
        files = sorted(str(p.relative_to(root)) for p in (root / directory).glob('*.md'))
        rotation.extend(files[bucket::weeks])
    return {'as_of': today.isoformat(), 'rotation_week': bucket + 1, 'rotation_weeks': weeks,
            'entries': entries, 'rotation': rotation}

def markdown(report):
    lines = ['# Maintenance review queue', '', f"Generated for {report['as_of']} (UTC).", '',
             'This is a work queue, not a factual certification. New entries have no verified baseline; chapter dates were not copied into the tracker.', '',
             '| Scope | Due | State | Evidence baseline | Latest review | Source file |', '|---|---|---|---|---|---|']
    for e in report['entries']:
        latest = 'not attempted'
        if e.get('latest_review_record'):
            latest = f"[{e['last_review_attempt']} · {e['review_status']}](https://github.com/gjimzhou/US-China-Life-Playbook/blob/main/{e['latest_review_record']})"
        lines.append(f"| {e['scope']} | {e['due']} | {e['status']} | {e['baseline']} | {latest} | `{e['path']}` |")
    lines += ['', f"## Full-content rotation: {report['rotation_week']}/{report['rotation_weeks']}", '',
              'Inspect these files for untracked time-sensitive claims, jurisdiction gaps and outdated links. Add new recurring scopes to the registry. A rotation assignment is not a completed review.', '']
    lines += [f'- `{p}`' for p in report['rotation']]
    lines += ['', '## Execution', '', 'Use docs/maintenance-workflow.md. Check the separate External link report, record exact claims and effective dates, then submit reviewed changes through a branch. Never advance last_verified after an inaccessible or partial check.', '']
    return '\n'.join(lines)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--as-of', type=date.fromisoformat, default=date.today())
    parser.add_argument('--output-dir', type=Path, default=Path('_maintenance'))
    args = parser.parse_args()
    result = build_report(ROOT, args.as_of)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    (args.output_dir / 'report.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    (args.output_dir / 'report.md').write_text(markdown(result))
    print(f"{len(result['entries'])} tracked scopes; {sum(e['status'] == 'due' for e in result['entries'])} due; {len(result['rotation'])} rotation files")
