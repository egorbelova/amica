# ws/exceptions.py


class WSValidationError(Exception):
    """Исключение для ошибок валидации в WebSocket-логике"""

    pass


class WSPermissionError(Exception):
    """Нет прав на действие"""

    pass


class WSNotFoundError(Exception):
    """Объект не найден (чат, сообщение и т.д.)"""

    pass
