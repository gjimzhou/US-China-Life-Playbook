"""Review summaries must never turn partial attempts into full verification."""
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from review_visibility import attach_review_summaries

class ReviewVisibilityTest(unittest.TestCase):
    def render(self, entry):
        with TemporaryDirectory() as td:
            root = Path(td)
            (root / 'maintenance').mkdir()
            (root / 'maintenance/review-registry.json').write_text(json.dumps({'entries':[entry]}))
            for record in ['old.md', 'latest.md']:
                (root / record).write_text('Evidence')
            docs = [{'path':'chapter.md'}, {'path':'untracked.md'}]
            attach_review_summaries(root, docs)
            self.assertNotIn('reviewSummary', docs[1])
            return docs[0]['reviewSummary']

    def entry(self, **changes):
        return dict(path='chapter.md', scope='限定范围', interval_days=30,
                    initial_review_by='2026-10-01', last_verified=None,
                    review_record=None, **changes)

    def test_partial_does_not_create_verified_date(self):
        text = self.render(self.entry(review_status='partial',last_review_attempt='2026-09-24',latest_review_record='latest.md'))
        self.assertIn('仍有缺口', text)
        self.assertIn('尚无该登记范围的完整核验日期', text)
        self.assertIn('计划复核日期：2026-10-01', text)
        self.assertNotIn('登记范围已完成核验', text)

    def test_partial_keeps_previous_complete_evidence_and_earlier_due(self):
        entry = self.entry(review_status='partial',last_review_attempt='2026-09-28',latest_review_record='latest.md',review_by='2026-10-01',review_by_reason='临时安排到期前检查')
        entry.update(last_verified='2026-09-24',review_record='old.md')
        text = self.render(entry)
        self.assertIn('最近完整核验：2026-09-24', text)
        self.assertIn('最近尝试：2026-09-28', text)
        self.assertIn('计划复核日期：2026-10-01', text)
        self.assertIn('/latest.md', text)
        self.assertIn('/old.md', text)
        self.assertIn('不代表整章或关联清单全部核验', text)

    def test_missing_evidence_fails_build(self):
        with self.assertRaises(AssertionError):
            self.render(self.entry(latest_review_record='missing.md'))

    def test_unattempted_is_not_an_error_or_complete(self):
        text = self.render(self.entry())
        self.assertIn('尚未记录核验结果', text)
        self.assertNotIn('登记范围已完成核验', text)

if __name__ == '__main__':
    unittest.main()
