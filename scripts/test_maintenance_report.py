import unittest
from datetime import date, timedelta
from maintenance_report import ROOT, build_report, review_due

class MaintenanceTests(unittest.TestCase):
    def test_due_boundary(self):
        e = {'last_verified': '2026-09-01', 'interval_days': 30}
        self.assertEqual(review_due(e), date(2026, 10, 1))
        e.update(last_verified=None, initial_review_by='2026-10-02')
        self.assertEqual(review_due(e), date(2026, 10, 2))

    def test_initial_baseline_and_due(self):
        report = build_report(ROOT, date(2026, 10, 1))
        for e in report['entries']:
            self.assertEqual(e['status'], 'due' if e['due'] <= report['as_of'] else 'scheduled')
            if not e['last_verified']:
                self.assertEqual(e['baseline'], 'not-established')

    def test_rotation_covers_every_file_once(self):
        start = date(2026, 9, 21)
        first = build_report(ROOT, start)
        files = [p for i in range(first['rotation_weeks'])
                 for p in build_report(ROOT, start + timedelta(weeks=i))['rotation']]
        expected = {str(p.relative_to(ROOT)) for d in ('book', 'checklists') for p in (ROOT / d).glob('*.md')}
        self.assertEqual(set(files), expected)
        self.assertEqual(len(files), len(set(files)))
        self.assertEqual(first['rotation'], build_report(ROOT, start + timedelta(weeks=first['rotation_weeks']))['rotation'])
