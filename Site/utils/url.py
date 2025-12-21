def build_url(request, path: str | None):
    if not path:
        return None

    if request:
        return request.build_absolute_uri(path)
    return path
