"""Focused regressions for reviewed links and export destinations."""
import json
from pathlib import Path
from build_exports import export_paths, build_anchor_maps, transform_doc
from legacy_routes import legacy_routes
root = Path(__file__).resolve().parents[1]
docs = json.loads(next((root/'_site').glob('data.*.json')).read_text())
lookup = {d['path']:d for d in docs}
history = json.loads((root/'site/anchor-aliases.json').read_text())
for path, doc in lookup.items():
    for old, target in legacy_routes(root, path).items():
        target = history.get(path, {}).get(target, target)
        matches = [s for s in doc['sections'] if old in s['aliases']]
        if target in {s['id'] for s in doc['sections']}:
            assert len(matches) == 1 and matches[0]['id'] == target, (path, old)
        else:
            assert not matches, (path, old, 'must not silently retarget')
paths = export_paths(); maps = build_anchor_maps(paths)
for path in paths: transform_doc(path, set(paths), maps)
print('Frozen legacy routes and every offline Markdown destination passed')

# A terminal dot belongs to this real Medicare URL, not sentence punctuation.
from check_external_links import collect_links
links = collect_links()
assert 'https://www.medicare.gov/coverage/travel-outside-the-u.s.' in links
assert 'https://www.medicare.gov/coverage/travel-outside-the-u.s' not in links
print('External URL punctuation preserved')
