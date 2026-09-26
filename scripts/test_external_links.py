import http.client
import unittest
from unittest.mock import MagicMock, patch

from check_external_links import check_url


class ExternalLinks(unittest.TestCase):
    @patch('check_external_links.urllib.request.urlopen')
    def test_unicode_url_preserves_existing_escapes_and_query(self, urlopen):
        response = MagicMock()
        response.status = 200
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

    def test_invalid_url_is_reported(self):
        self.assertEqual(check_url('https://[invalid/', 1)['category'], 'warning')


if __name__ == '__main__':
    unittest.main()
