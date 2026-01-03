# ws/constants.py
from enum import Enum


class WSMessageTypes(Enum):
    CHAT_MESSAGE = "chat_message"
    MESSAGE_REACTION = "message_reaction"
    MESSAGE_VIEWED = "message_viewed"
    SET_SESSION_LIFETIME = "set_session_lifetime"


class WSCloseCodes(Enum):
    SESSION_EXPIRED = 4003
    UNAUTHORIZED = 4001
