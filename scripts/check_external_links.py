"""Audit reader-facing external links without blocking the Pages deployment.

The checker deliberately distinguishes:
- broken: definitive 404/410 responses;
- blocked: common bot/auth/rate-limit responses such as 401/403/429;
- transient: timeouts, network failures, and 5xx responses;
- ok: successful responses, including redirects.

By default the script always exits 0 after producing a report. Use
--fail-on-broken when a strict manual check is desired.
"""

from __future__ import annotations

import argparse
import http.client
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
import re
import socket
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
MARKDOWN_LINK = re.compile(r"\[[^\]]+\]\((https?://[^)\s]+)\)")
BLOCKED_STATUS = {401, 403, 405, 406, 407, 418, 429}
BROKEN_STATUS = {404, 410}
TRANSIENT_STATUS = {408, 425, 500, 502, 503, 504}
USER_AGENT = (
    "US-China-Life-Playbook-link-health/1.0 "
    "(+https://github.com/gjimzhou/US-China-Life-Playbook)"
)


def source_files() -> list[Path]:
    files = sorted((ROOT / "book").glob("*.md"))
    files += sorted((ROOT / "checklists").glob("*.md"))
    files += [
        ROOT / "README.md",
        ROOT / "HOME.md",
        ROOT / "DOWNLOADS.md",
        ROOT / "DISCLAIMER.md",
        ROOT / "METHODOLOGY.md",
        ROOT / "STYLE.md",
        ROOT / "CONTRIBUTING.md",
        ROOT / "GLOSSARY.md",
        ROOT / "references" / "source-policy.md",
        ROOT / "references" / "citation-guide.md",
        ROOT / "references" / "editorial-status.md",
    ]
    return [p for p in files if p.is_file()]


def collect_links() -> dict[str, list[str]]:
    refs: dict[str, list[str]] = defaultdict(list)
    for path in source_files():
        rel = path.relative_to(ROOT).as_posix()
        text = path.read_text(encoding="utf-8")
        for url in MARKDOWN_LINK.findall(text):
            # Markdown already delimits the URL; punctuation can be part of its path.
            refs[url].append(rel)
    return dict(refs)


def classify_status(status: int) -> str:
    if 200 <= status < 400:
        return "ok"
    if status in BROKEN_STATUS:
        return "broken"
    if status in BLOCKED_STATUS:
        return "blocked"
    if status in TRANSIENT_STATUS or 500 <= status < 600:
        return "transient"
    return "warning"


def check_url(url: str, timeout: float) -> dict[str, object]:
    try:
        parts = urllib.parse.urlsplit(url)
        request_url = urllib.parse.urlunsplit((
            parts.scheme,
            parts.netloc.encode("idna").decode("ascii"),
            urllib.parse.quote(parts.path, safe="/%:@!$&'()*+,;=-._~"),
            urllib.parse.quote(parts.query, safe="/%?:@!$&'()*+,;=-._~"),
            "",
        ))
        request = urllib.request.Request(
            request_url,
            headers={
                "User-Agent": USER_AGENT,
                "Accept": "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8",
            },
            method="GET",
        )
        with urllib.request.urlopen(request, timeout=timeout) as response:
            status = int(getattr(response, "status", 200))
            final_url = response.geturl()
            return {
                "url": url,
                "category": classify_status(status),
                "status": status,
                "final_url": final_url,
                "detail": "",
            }
    except urllib.error.HTTPError as exc:
        status = int(exc.code)
        return {
            "url": url,
            "category": classify_status(status),
            "status": status,
            "final_url": getattr(exc, "url", url),
            "detail": str(exc.reason or ""),
        }
    except (urllib.error.URLError, TimeoutError, socket.timeout, OSError, http.client.HTTPException) as exc:
        reason = getattr(exc, "reason", exc)
        return {
            "url": url,
            "category": "transient",
            "status": None,
            "final_url": url,
            "detail": str(reason),
        }
    except (UnicodeError, ValueError) as exc:
        return {
            "url": url,
            "category": "warning",
            "status": None,
            "final_url": url,
            "detail": str(exc),
        }


def domain(url: str) -> str:
    return urllib.parse.urlsplit(url).netloc.lower()


def write_report(
    path: Path,
    refs: dict[str, list[str]],
    results: list[dict[str, object]],
) -> None:
    counts = Counter(str(r["category"]) for r in results)
    redirects = [r for r in results if r["category"] == "ok" and r["final_url"] != r["url"]]
    blocked_domains = Counter(domain(str(r["url"])) for r in results if r["category"] == "blocked")

    lines = [
        "# External link health report",
        "",
        f"Generated: {datetime.now(timezone.utc).isoformat(timespec='seconds')}",
        "",
        f"- Unique external links checked: **{len(results)}**",
        f"- OK: **{counts['ok']}**",
        f"- Definitively broken (404/410): **{counts['broken']}**",
        f"- Blocked / rate-limited / auth-gated: **{counts['blocked']}**",
        f"- Transient network / server failures: **{counts['transient']}**",
        f"- Other HTTP warnings: **{counts['warning']}**",
        f"- Redirected but reachable: **{len(redirects)}**",
        "",
        "Blocked and transient results are **not** treated as broken links. Government,",
        "financial, and anti-bot sites commonly return 403/429 to automated clients even",
        "when the page works in a normal browser.",
        "",
    ]

    for category, title in [
        ("broken", "Definitively broken links"),
        ("warning", "Other HTTP warnings"),
        ("transient", "Transient failures to recheck"),
    ]:
        items = [r for r in results if r["category"] == category]
        lines += [f"## {title}", ""]
        if not items:
            lines += ["None.", ""]
            continue
        for r in sorted(items, key=lambda x: str(x["url"])):
            status = r["status"] if r["status"] is not None else "network"
            sources = ", ".join(sorted(set(refs[str(r["url"])]))[:8])
            detail = f" — {r['detail']}" if r["detail"] else ""
            lines.append(f"- **{status}** {r['url']}{detail}")
            lines.append(f"  - Used in: {sources}")
        lines.append("")

    lines += ["## Blocked domains (informational)", ""]
    if blocked_domains:
        for host, count in blocked_domains.most_common():
            lines.append(f"- {host}: {count}")
    else:
        lines.append("None.")
    lines.append("")

    lines += ["## Reachable redirects worth reviewing", ""]
    if redirects:
        for r in sorted(redirects, key=lambda x: str(x["url"]))[:100]:
            lines.append(f"- {r['url']} → {r['final_url']}")
    else:
        lines.append("None.")
    lines.append("")

    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--report", default="link-health-report.md")
    parser.add_argument("--workers", type=int, default=12)
    parser.add_argument("--timeout", type=float, default=12.0)
    parser.add_argument("--fail-on-broken", action="store_true")
    args = parser.parse_args()

    refs = collect_links()
    results: list[dict[str, object]] = []
    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as pool:
        futures = {pool.submit(check_url, url, args.timeout): url for url in refs}
        for future in as_completed(futures):
            results.append(future.result())

    report = Path(args.report)
    write_report(report, refs, results)

    counts = Counter(str(r["category"]) for r in results)
    print(
        "External links:",
        len(results),
        "| ok:", counts["ok"],
        "| broken:", counts["broken"],
        "| blocked:", counts["blocked"],
        "| transient:", counts["transient"],
        "| warning:", counts["warning"],
    )
    print("Report:", report)

    if args.fail_on_broken and counts["broken"]:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
