"""Refuse inconsistent versions or artifacts before publishing a fixed edition."""
import argparse
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = {f'US-China-Life-Playbook.{ext}' for ext in ('epub', 'pdf', 'docx', 'html', 'md')} | {'US-China-Life-Playbook-source-markdown.zip'}

def check(root, version, downloads=None, commit=None):
    if not re.fullmatch(r'v\d+\.\d+(?:\.\d+)?', version):
        raise ValueError('Invalid version')
    if (root / 'VERSION').read_text().strip() != version:
        raise ValueError('Requested version differs from VERSION')
    for name in ['HOME.md', 'DOWNLOADS.md', 'CHANGELOG.md', f'docs/releases/{version}.md']:
        if version not in (root / name).read_text():
            raise ValueError(f'Version missing from {name}')
    if downloads is None:
        return
    manifest = json.loads((downloads / 'manifest.json').read_text())
    if manifest.get('version') != version or manifest.get('sourceCommit') != commit:
        raise ValueError('Artifact version or source commit mismatch')
    entries = manifest['files']
    if len(entries) != len(EXPECTED) or {e['name'] for e in entries} != EXPECTED:
        raise ValueError('Unexpected or missing export files')
    checksums = []
    for entry in entries:
        data = (downloads / entry['name']).read_bytes()
        digest = hashlib.sha256(data).hexdigest()
        if len(data) != entry['bytes'] or digest != entry['sha256']:
            raise ValueError(f'Artifact checksum mismatch: {entry["name"]}')
        checksums.append(f'{digest}  {entry["name"]}\n')
    if (downloads / 'SHA256SUMS.txt').read_text() != ''.join(checksums):
        raise ValueError('Checksum list differs from manifest')

if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--version', required=True)
    p.add_argument('--downloads', type=Path)
    p.add_argument('--commit')
    args = p.parse_args()
    if args.downloads and not args.commit:
        p.error('--downloads requires --commit')
    check(ROOT, args.version, args.downloads, args.commit)
    print('Release request and supplied artifacts verified')
