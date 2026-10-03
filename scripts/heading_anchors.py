"""Shared heading normalization; existing URL whitespace semantics are intentional."""
import re
import unicodedata


def heading_plain(text: str, *, trim: bool = False) -> str:
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1", text).replace("`", "")
    return text.strip() if trim else text


def heading_slug(text: str, *, trim: bool = False) -> str:
    # Exports historically trim their headings; site/task/frozen routes do not.
    # Keep that distinction rather than changing existing public fragments.
    plain = heading_plain(text, trim=trim).lower()
    return "".join(
        c for c in plain if c in "-_ " or unicodedata.category(c)[0] in "LN"
    ).replace(" ", "-") or "section"
