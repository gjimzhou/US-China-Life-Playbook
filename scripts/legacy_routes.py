"""Freeze ordinal links at the last audited release; never retarget by new order."""
import re
import subprocess
import unicodedata
BASELINE = '543c79b6a837d5d6d2980638d5e21f056f1a91e2'
def slug(text):
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text).replace('`', '')
    return ''.join(c for c in text.lower() if c in '-_ ' or unicodedata.category(c)[0] in 'LN').replace(' ', '-') or 'section'
def legacy_routes(root, path):
    result = subprocess.run(['git', 'show', f'{BASELINE}:{path}'], cwd=root, text=True, capture_output=True)
    if result.returncode:
        exists = subprocess.run(['git', 'cat-file', '-e', BASELINE], cwd=root, capture_output=True)
        if exists.returncode:
            raise RuntimeError('Legacy route baseline missing; fetch full Git history before building')
        return {}  # New document: no old ordinal links exist.
    seen, routes, ordinal = {}, {}, 0
    for line in result.stdout.splitlines():
        match = re.match(r'^(#{1,6}) (.+)', line)
        if not match: continue
        title = slug(match[2]); n = seen.get(title, 0); seen[title] = n + 1
        anchor = title + (f'-{n}' if n else '')
        if not routes: routes['s0'] = anchor
        if len(match[1]) == 2:
            ordinal += 1; routes[f's{ordinal}'] = anchor
    return routes
