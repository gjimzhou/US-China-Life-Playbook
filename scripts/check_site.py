"""Check the generated public artifact and source links before deployment."""
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json
import re

root = Path(__file__).resolve().parents[1]
assets = list((root / '_site').glob('data.*.json'))
assert len(assets) == 1, 'Expected one versioned content bundle'
docs = json.loads(assets[0].read_text())
by_path = {d['path']: d for d in docs}
assert 'HOME.md' in by_path and len(by_path) == len(docs)
errors = []
for doc in docs:
    sections = doc['sections']
    ids = [s['id'] for s in sections]
    if len(ids) != len(set(ids)):
        errors.append(f'Duplicate anchors: {doc["path"]}')
    routes = [a for s in sections for a in [s['id'], *s['aliases']]]
    if len(routes) != len(set(routes)):
        errors.append(f'Ambiguous section routes: {doc["path"]}')
    for section in sections:
        for label, href in re.findall(r'\[([^\]]+)\]\(([^)]+)\)', section['markdown']):
            url = urlsplit(href)
            if url.scheme or url.netloc:
                continue
            source = root / doc['path']
            target = (source.parent / unquote(url.path)).resolve() if url.path else source
            if not target.is_relative_to(root):
                errors.append(f'Missing relative link: {doc["path"]} -> {href}')
                continue
            relative = target.relative_to(root).as_posix()
            if not target.is_file():
                public_target = root / '_site' / relative
                if relative.startswith('downloads/') and public_target.is_file():
                    continue
                errors.append(f'Missing relative link: {doc["path"]} -> {href}')
                continue
            if url.fragment and relative in by_path:
                anchors = {s['id'] for s in by_path[relative]['sections']}
                aliases = {a for s in by_path[relative]['sections'] for a in s['aliases']}
                if unquote(url.fragment) not in anchors | aliases:
                    errors.append(f'Missing fragment: {doc["path"]} -> {href}')
    for line in (root / doc['path']).read_text().splitlines():
        if re.match(r'^#{1,6}\s', line) and re.search(r'[A-Za-z]{3}', line) and not re.search(r'[\u4e00-\u9fff]', line):
            errors.append(f'Untranslated heading: {doc["path"]}: {line}')
expected_exports = [
    'US-China-Life-Playbook.epub',
    'US-China-Life-Playbook.pdf',
    'US-China-Life-Playbook.docx',
    'US-China-Life-Playbook.html',
    'US-China-Life-Playbook.md',
    'US-China-Life-Playbook-source-markdown.zip',
    'manifest.json',
    'SHA256SUMS.txt',
]
assert 'DOWNLOADS.md' in by_path, 'Downloads page missing from content bundle'
for name in expected_exports:
    p = root / '_site' / 'downloads' / name
    if not p.is_file() or p.stat().st_size == 0:
        errors.append(f'Missing export: downloads/{name}')
app = (root / '_site/app.js').read_text()
assert repr(assets[0].name) in app, 'App and content bundle must use the same version'
assert "fetch('data.json')" not in app, 'Unversioned content request'
assert not errors, '\n'.join(errors)
print(f'Validated {len(docs)} documents: relative links, fragments, unique anchors, Chinese headings and content version')

# Reader utility assets and RSS must be part of the public artifact.
from xml.etree import ElementTree as ET
for name in ['reader.js', 'services.json', 'updates.json', 'content-ids.json', 'feed.xml']:
    assert (root / '_site' / name).is_file(), f'Missing reader artifact: {name}'
feed = ET.parse(root / '_site/feed.xml')
assert feed.findall('./channel/item'), 'Missing curated feed entries'
assert 'application/rss+xml' in (root / '_site/index.html').read_text()
assert all(d.get('contentId') and all(s.get('contentId') for s in d['sections']) for d in docs)
