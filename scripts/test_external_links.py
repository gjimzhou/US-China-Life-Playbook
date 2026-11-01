import http.client
import unittest
import json
import tempfile
from pathlib import Path
from unittest.mock import MagicMock, patch

from check_external_links import check_url, classify_destination, write_report, write_json_report, MARKDOWN_LINK


class ExternalLinks(unittest.TestCase):
    @patch('check_external_links.urllib.request.urlopen')
    def test_unicode_url_preserves_existing_escapes_and_query(self, urlopen):
        response = MagicMock()
        response.status = 200
        response.geturl.return_value = "https://example.org/"
        urlopen.return_value.__enter__.return_value = response
        url = 'https://example.org/中文/%20?q=生活&next=a%2Fb#章节'
        result = check_url(url, 1)
        request = urlopen.call_args.args[0]
        self.assertEqual(request.full_url, 'https://example.org/%E4%B8%AD%E6%96%87/%20?q=%E7%94%9F%E6%B4%BB&next=a%2Fb')
        self.assertEqual(result['url'], url)
        self.assertEqual(result['category'], 'ok')

    @patch('check_external_links.urllib.request.urlopen', side_effect=http.client.BadStatusLine('bad'))
    def test_bad_http_response_does_not_abort_report(self, urlopen):
        self.assertEqual(check_url('https://example.org/', 1)['category'], 'transient')

    def test_successful_gate_or_error_response_is_not_source_success(self):
        self.assertEqual(classify_destination(200, 'https://unblock.federalregister.gov/')[0], 'blocked')
        self.assertEqual(classify_destination(200, 'https://cs.mfa.gov.cn/error/')[0], 'warning')
        self.assertEqual(classify_destination(200, 'https://www.uscourts.gov/courts/apology/apology3.html')[0], 'warning')
        self.assertEqual(classify_destination(200, 'https://example.org/error-correction/')[0], 'ok')
        self.assertEqual(classify_destination(404, 'https://example.org/error/')[0], 'broken')
        self.assertEqual(classify_destination(403, 'https://example.org/article')[0], 'blocked')

    def test_reports_preserve_each_blocked_url_and_all_source_references(self):
        url = 'https://example.org/private'
        refs = {url: [f'book/{i}.md' for i in range(12)]}
        results = [dict(url=url, category='blocked', status=200,
                        final_url='https://unblock.federalregister.gov/', detail='access verification')]
        with tempfile.TemporaryDirectory() as tmp:
            md, data = Path(tmp) / 'report.md', Path(tmp) / 'report.json'
            write_report(md, refs, results)
            write_json_report(data, refs, results)
            report = md.read_text()
            self.assertIn(url, report)
            self.assertIn('access verification', report)
            self.assertIn(results[0]['final_url'], report)
            for source in refs[url]:
                self.assertIn(source, report)
            payload = json.loads(data.read_text())
            self.assertEqual(payload['counts'], {'blocked': 1})
            self.assertEqual(payload['results'][0]['sources'], sorted(refs[url]))
            self.assertEqual(payload['results'][0]['status'], 200)

    def test_legal_paragraph_parentheses_are_not_truncated(self):
        url = 'https://www.ecfr.gov/current/title-8/section-103.2#p-103.2(b)(8)'
        self.assertEqual(MARKDOWN_LINK.findall(f'[rule]({url})'), [url])

    def test_invalid_url_is_reported(self):
        self.assertEqual(check_url('https://[invalid/', 1)['category'], 'warning')


if __name__ == '__main__':
    unittest.main()
