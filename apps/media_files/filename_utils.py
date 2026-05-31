import re
from urllib.parse import unquote

_PERCENT_ENCODING = re.compile(r"%[0-9A-Fa-f]{2}")


def normalize_original_filename(name: str | None) -> str:
    """Return a human-readable filename (decode %22 etc. from storage paths)."""
    if not name:
        return "file"

    base = str(name).replace("\\", "/").split("/")[-1].strip()
    if not base:
        return "file"

    if _PERCENT_ENCODING.search(base):
        try:
            decoded = unquote(base)
            if decoded:
                return decoded
        except ValueError:
            pass

    return base
