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
            if not target.is_relative_to(root) or not target.is_file():
                errors.append(f'Missing relative link: {doc["path"]} -> {href}')
                continue
            relative = target.relative_to(root).as_posix()
            if url.fragment and relative in by_path:
                anchors = {s['id'] for s in by_path[relative]['sections']}
                aliases = {a for s in by_path[relative]['sections'] for a in s['aliases']}
                if unquote(url.fragment) not in anchors | aliases:
                    errors.append(f'Missing fragment: {doc["path"]} -> {href}')
    for line in (root / doc['path']).read_text().splitlines():
        if re.match(r'^#{1,6}\s', line) and re.search(r'[A-Za-z]{3}', line) and not re.search(r'[\u4e00-\u9fff]', line):
            errors.append(f'Untranslated heading: {doc["path"]}: {line}')
app = (root / '_site/app.js').read_text()
assert repr(assets[0].name) in app, 'App and content bundle must use the same version'
assert "fetch('data.json')" not in app, 'Unversioned content request'
assert not errors, '\n'.join(errors)
print(f'Validated {len(docs)} documents: relative links, fragments, unique anchors, Chinese headings and content version')
