"""Build offline reader editions from the public Markdown source."""
from pathlib import Path
from datetime import datetime, timezone
from urllib.parse import unquote
import hashlib
import json
import os
import posixpath
import re
import shutil
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "_site" / "downloads"
WORK = ROOT / "_export"
TITLE = "中美双栖人生指南"
BASENAME = "US-China-Life-Playbook"
REPO_BLOB = "https://github.com/gjimzhou/US-China-Life-Playbook/blob/main/"


def heading_plain(text: str) -> str:
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text).replace("`", "")
    return text.strip()


def site_slug(text: str) -> str:
    import unicodedata
    plain = heading_plain(text).lower()
    slug = "".join(c for c in plain if c in "-_ " or unicodedata.category(c)[0] in "LN").replace(" ", "-")
    return slug or "section"


def doc_anchor(path: str) -> str:
    return "doc-" + hashlib.sha1(path.encode("utf-8")).hexdigest()[:12]


def checklist_order() -> list[str]:
    readme = (ROOT / "README.md").read_text()
    start = readme.find("## 可执行清单")
    end = readme.find("\n## ", start + 4)
    block = readme[start : end if end >= 0 else None]
    found = re.findall(r"\]\((checklists/[^)#]+\.md)(?:#[^)]+)?\)", block)
    seen, ordered = set(), []
    for item in found:
        if item not in seen and (ROOT / item).is_file():
            seen.add(item)
            ordered.append(item)
    for p in sorted((ROOT / "checklists").glob("*.md")):
        rel = p.relative_to(ROOT).as_posix()
        if rel not in seen:
            ordered.append(rel)
    return ordered


def export_paths() -> list[str]:
    paths = ["HOME.md", "DISCLAIMER.md"]
    paths += [p.relative_to(ROOT).as_posix() for p in sorted((ROOT / "book").glob("*.md"))]
    paths += checklist_order()
    paths += ["GLOSSARY.md", "METHODOLOGY.md", "references/source-policy.md"]
    return [p for p in paths if (ROOT / p).is_file()]


def build_anchor_maps(paths: list[str]):
    historical = json.loads((ROOT / "site" / "anchor-aliases.json").read_text())
    maps = {}
    for path in paths:
        text = (ROOT / path).read_text()
        seen = {}
        local_to_global = {}
        first_heading = True
        for line in text.splitlines():
            m = re.match(r"^(#{1,6})\s+(.+?)\s*$", line)
            if not m:
                continue
            slug = site_slug(m.group(2))
            n = seen.get(slug, 0)
            seen[slug] = n + 1
            local = slug + (f"-{n}" if n else "")
            global_id = doc_anchor(path) if first_heading else f"{doc_anchor(path)}--{local}"
            first_heading = False
            local_to_global[local] = global_id
        local_to_global.setdefault("s0", doc_anchor(path))
        for old, new in historical.get(path, {}).items():
            if new in local_to_global:
                local_to_global[old] = local_to_global[new]
        maps[path] = local_to_global
    return maps


def resolve_internal(current: str, href: str, paths: set[str], maps: dict[str, dict[str, str]]) -> str:
    if href.startswith("#"):
        frag = unquote(href[1:])
        return "#" + maps.get(current, {}).get(frag, doc_anchor(current))
    if re.match(r"^[a-z][a-z0-9+.-]*:", href, re.I) or href.startswith("//"):
        return href
    path_part, sep, frag = href.partition("#")
    if not path_part.endswith(".md"):
        return href
    target = posixpath.normpath(posixpath.join(posixpath.dirname(current), unquote(path_part)))
    if target in paths:
        if sep and frag:
            dest = maps.get(target, {}).get(unquote(frag), doc_anchor(target))
        else:
            dest = doc_anchor(target)
        return "#" + dest
    return REPO_BLOB + target + (("#" + frag) if sep else "")


def transform_doc(path: str, paths: set[str], maps: dict[str, dict[str, str]]) -> str:
    text = (ROOT / path).read_text()
    seen = {}
    first_heading = True
    out = []
    for line in text.splitlines():
        m = re.match(r"^(#{1,6})\s+(.+?)\s*$", line)
        if m:
            slug = site_slug(m.group(2))
            n = seen.get(slug, 0)
            seen[slug] = n + 1
            local = slug + (f"-{n}" if n else "")
            gid = doc_anchor(path) if first_heading else f"{doc_anchor(path)}--{local}"
            first_heading = False
            line = f"{m.group(1)} {m.group(2)} {{#{gid}}}"
        out.append(line)
    text = "\n".join(out)

    def repl(match):
        label, href = match.group(1), match.group(2)
        return f"[{label}]({resolve_internal(path, href, paths, maps)})"

    text = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", repl, text)
    return text.strip() + "\n"


def write_combined(paths: list[str]) -> Path:
    pathset = set(paths)
    maps = build_anchor_maps(paths)
    commit = os.getenv("GITHUB_SHA", "local")[:12]
    built = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    pieces = [
        "---",
        f'title: "{TITLE}"',
        'subtitle: "美国生活 · 中国连接 · 跨境家庭运行"',
        'lang: "zh-CN"',
        f'date: "{built}"',
        "---",
        "",
        f"> 离线阅读版 · 源码版本 `{commit}` · 生成日期 {built}",
        "",
    ]
    for i, path in enumerate(paths):
        if i:
            pieces += ["", '<div class="page-break"></div>', ""]
        pieces.append(transform_doc(path, pathset, maps))
    WORK.mkdir(parents=True, exist_ok=True)
    combined = WORK / f"{BASENAME}.md"
    combined.write_text("\n".join(pieces))
    return combined


def write_css() -> Path:
    css = WORK / "reader.css"
    css.write_text(r'''
:root { color-scheme: light; }
body { font-family: "Noto Serif CJK SC", "Noto Sans CJK SC", serif; color:#1d2f3a; line-height:1.75; max-width:46rem; margin:auto; padding:2rem; }
h1,h2,h3,h4 { font-family:"Noto Sans CJK SC",sans-serif; line-height:1.4; color:#15384a; break-after:avoid; }
h1 { font-size:2rem; margin-top:2.6rem; } h2 { font-size:1.45rem; margin-top:2rem; } h3 { font-size:1.15rem; }
a { color:#175a7c; text-decoration:none; } a:hover { text-decoration:underline; }
blockquote { border-left:.25rem solid #82a8bb; margin-left:0; padding:.25rem 1rem; background:#f4f7f8; }
table { border-collapse:collapse; width:100%; font-size:.92em; } th,td { border:1px solid #cad4da; padding:.45rem .6rem; vertical-align:top; } th { background:#f2f5f7; }
code { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:.92em; }
.page-break { break-before:page; page-break-before:always; }
nav#TOC { font-family:"Noto Sans CJK SC",sans-serif; }
@page { size:A4; margin:18mm 17mm 19mm 17mm; @bottom-center { content:counter(page); font-size:9pt; color:#667; } }
@media print { body { max-width:none; padding:0; } a { color:inherit; } }
'''.strip() + "\n")
    return css


def run(cmd: list[str]):
    print("+", " ".join(cmd))
    subprocess.run(cmd, cwd=ROOT, check=True)


def build_formats(combined: Path, css: Path):
    OUT.mkdir(parents=True, exist_ok=True)
    shutil.copy2(combined, OUT / f"{BASENAME}.md")
    common = ["pandoc", str(combined), "--from=markdown+task_lists+pipe_tables+strikeout", "--toc", "--toc-depth=2", "--metadata", f"title={TITLE}", "--metadata", "lang=zh-CN"]
    run(common + ["--css", str(css), "--split-level=1", "-o", str(OUT / f"{BASENAME}.epub")])
    run(common + ["-o", str(OUT / f"{BASENAME}.docx")])
    run(common + ["--standalone", "--embed-resources", "--css", str(css), "-o", str(OUT / f"{BASENAME}.html")])
    run(common + ["--pdf-engine=weasyprint", "--css", str(css), "-o", str(OUT / f"{BASENAME}.pdf")])


def build_source_zip():
    dest = OUT / f"{BASENAME}-source-markdown.zip"
    roots = [ROOT / "book", ROOT / "checklists", ROOT / "references", ROOT / "docs"]
    root_files = [ROOT / p for p in ["README.md", "HOME.md", "DISCLAIMER.md", "GLOSSARY.md", "METHODOLOGY.md", "STYLE.md", "CONTRIBUTING.md", "CHANGELOG.md", "DOWNLOADS.md"]]
    files = [p for d in roots if d.exists() for p in d.rglob("*.md")] + [p for p in root_files if p.exists()]
    with zipfile.ZipFile(dest, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for p in sorted(set(files)):
            zf.write(p, p.relative_to(ROOT).as_posix())


def manifest():
    entries = []
    for p in sorted(OUT.iterdir()):
        if p.name in {"manifest.json", "SHA256SUMS.txt"} or not p.is_file():
            continue
        data = p.read_bytes()
        entries.append({"name": p.name, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()})
    info = {
        "title": TITLE,
        "sourceCommit": os.getenv("GITHUB_SHA", "local"),
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "files": entries,
    }
    (OUT / "manifest.json").write_text(json.dumps(info, ensure_ascii=False, indent=2) + "\n")
    (OUT / "SHA256SUMS.txt").write_text("".join(f'{e["sha256"]}  {e["name"]}\n' for e in entries))


def verify():
    minimums = {
        f"{BASENAME}.epub": 20_000,
        f"{BASENAME}.pdf": 50_000,
        f"{BASENAME}.docx": 20_000,
        f"{BASENAME}.html": 50_000,
        f"{BASENAME}.md": 50_000,
        f"{BASENAME}-source-markdown.zip": 20_000,
    }
    for name, minimum in minimums.items():
        p = OUT / name
        if not p.is_file() or p.stat().st_size < minimum:
            raise RuntimeError(f"Export missing or too small: {name}")
    for name in [f"{BASENAME}.epub", f"{BASENAME}.docx"]:
        with zipfile.ZipFile(OUT / name) as zf:
            bad = zf.testzip()
            if bad:
                raise RuntimeError(f"Corrupt archive member in {name}: {bad}")
    if not (OUT / f"{BASENAME}.pdf").read_bytes().startswith(b"%PDF-"):
        raise RuntimeError("PDF signature missing")


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    if WORK.exists():
        shutil.rmtree(WORK)
    paths = export_paths()
    combined = write_combined(paths)
    css = write_css()
    build_formats(combined, css)
    build_source_zip()
    manifest()
    verify()
    print(f"Built {len(paths)} reader documents into {OUT}")


if __name__ == "__main__":
    main()
