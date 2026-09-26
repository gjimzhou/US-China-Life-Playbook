"""One validation entry point used locally and by all CI callers."""
import argparse
from pathlib import Path
import subprocess
import sys
import time
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
def run(*args):
    subprocess.run(args, cwd=ROOT, check=True)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--quick', action='store_true', help='Source and route checks only; not sufficient to publish')
    args = parser.parse_args()
    run(sys.executable, '-m', 'unittest', 'discover', '-s', 'scripts', '-p', 'test_*.py')
    for script in ['maintenance_report', 'build_site', 'check_review_regressions']:
        run(sys.executable, f'scripts/{script}.py')
    if args.quick:
        return
    with (ROOT / '_maintenance/browser-server.log').open('w') as log:
        server = subprocess.Popen([sys.executable, '-m', 'http.server', '8765', '--directory', '_site'], cwd=ROOT, stdout=log, stderr=log)
        try:
            for _ in range(50):
                if server.poll() is not None:
                    raise RuntimeError('Cannot start test server; free port 8765')
                try:
                    urllib.request.urlopen('http://127.0.0.1:8765/', timeout=1).close()
                    break
                except OSError:
                    time.sleep(0.1)
            else:
                raise RuntimeError('Test server did not become ready')
            run('npm', 'run', 'test:browser')
        finally:
            server.terminate()
            server.wait(timeout=10)
    run(sys.executable, 'scripts/build_exports.py')
    run(sys.executable, 'scripts/check_site.py')
    run('java', '-jar', str(ROOT / '_tools/epubcheck-5.4.0/epubcheck.jar'), str(ROOT / '_site/downloads/US-China-Life-Playbook.epub'))

if __name__ == '__main__':
    main()
