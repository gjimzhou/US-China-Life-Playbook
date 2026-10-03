"""Lock existing fragment behavior before sharing normalization across builders."""
import unittest

from heading_anchors import heading_slug
from legacy_routes import slug as legacy_slug
from build_exports import heading_plain, site_slug


class HeadingAnchors(unittest.TestCase):
    def test_existing_fragment_examples(self):
        cases = {
            '医疗与 [Form I-9](https://www.uscis.gov/i-9) `2026`': '医疗与-form-i-9-2026',
            'A_B / C—D（中文）': 'a_b--cd中文',
            'É e\u0301 Ⅳ １': 'é-e-ⅳ-１',
            '***': 'section',
            '': 'section',
            '重复  空格': '重复--空格',
            '行\t内': '行内',
        }
        for source, expected in cases.items():
            with self.subTest(source=source):
                self.assertEqual(heading_slug(source), expected)
                self.assertEqual(legacy_slug(source), expected)
                self.assertEqual(site_slug(source), expected)

    def test_export_only_trims_boundary_whitespace(self):
        self.assertEqual(heading_slug('  医疗  '), '--医疗--')
        self.assertEqual(legacy_slug('  医疗  '), '--医疗--')
        self.assertEqual(site_slug('  医疗  '), '医疗')
        self.assertEqual(heading_slug('  '), '--')
        self.assertEqual(site_slug('  '), 'section')
        self.assertEqual(heading_plain(' [医疗](https://example.org) `I-9` '), '医疗 I-9')
