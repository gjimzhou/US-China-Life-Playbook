"""Install hash-verified upstream tools on the Ubuntu x86_64 CI runner."""
import hashlib
import os
from pathlib import Path
import platform
import tarfile
import urllib.request
import zipfile

TOOLS = [
    ('pandoc-3.11-linux-amd64.tar.gz', 'https://github.com/jgm/pandoc/releases/download/3.11/',
     '37edb3bbcf722f921a009941bf5874e2e0c09263226c9b4a2d980788cb062ab6'),
    ('epubcheck-5.4.0.zip', 'https://github.com/w3c/epubcheck/releases/download/v5.4.0/',
     '33350c61038e71dfb3d45a76aed04bf5481e6d5500cb780f6e98db8bbd15a28c'),
]
if __name__ == '__main__':
    assert platform.system() == 'Linux' and platform.machine() == 'x86_64', 'Use Ubuntu x86_64 or install tools manually per development.md'
    root = Path('_tools').resolve()
    root.mkdir(exist_ok=True)
    for name, base, digest in TOOLS:
        archive = root / name
        urllib.request.urlretrieve(base + name, archive)
        assert hashlib.sha256(archive.read_bytes()).hexdigest() == digest, f'Checksum mismatch: {name}'
        if name.endswith('.zip'):
            with zipfile.ZipFile(archive) as z:
                z.extractall(root)
        else:
            with tarfile.open(archive) as t:
                t.extractall(root, filter='data')
    with open(os.environ['GITHUB_PATH'], 'a') as f:
        f.write(str(root / 'pandoc-3.11/bin') + '\n')
