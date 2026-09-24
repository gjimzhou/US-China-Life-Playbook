import unittest
import json
from datetime import date, timedelta
from maintenance_report import ROOT, build_report, review_due

# Registry evolves; use its latest recorded date when checking rotation, not an older baseline.
REGISTRY = json.loads((ROOT / 'maintenance/review-registry.json').read_text())
AS_OF = max(date.fromisoformat(REGISTRY['rotation_anchor']), *(date.fromisoformat(e[k]) for e in REGISTRY['entries'] for k in ('last_verified', 'last_review_attempt') if e.get(k)))

class MaintenanceTests(unittest.TestCase):
    def test_due_boundary(self):
        e = {'last_verified': '2026-09-01', 'interval_days': 30}
        self.assertEqual(review_due(e), date(2026, 10, 1))
        e.update(last_verified=None, initial_review_by='2026-10-02')
        self.assertEqual(review_due(e), date(2026, 10, 2))

    def test_initial_baseline_and_due(self):
        report = build_report(ROOT, max(date(2026, 10, 1), AS_OF))
        for e in report['entries']:
            self.assertEqual(e['status'], 'due' if e['due'] <= report['as_of'] else 'scheduled')
            if not e['last_verified']:
                self.assertEqual(e['baseline'], 'not-established')

    def test_rotation_covers_every_file_once(self):
        start = AS_OF
        first = build_report(ROOT, start)
        files = [p for i in range(first['rotation_weeks'])
                 for p in build_report(ROOT, start + timedelta(weeks=i))['rotation']]
        expected = {str(p.relative_to(ROOT)) for d in ('book', 'checklists') for p in (ROOT / d).glob('*.md')}
        self.assertEqual(set(files), expected)
        self.assertEqual(len(files), len(set(files)))
        self.assertEqual(first['rotation'], build_report(ROOT, start + timedelta(weeks=first['rotation_weeks']))['rotation'])
