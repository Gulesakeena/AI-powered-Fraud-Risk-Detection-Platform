import re


def validate_password_strength(password: str) -> str:
    if len(password) < 12:
        raise ValueError(
            "Password must be at least 12 characters long."
        )

    if not re.search(r"[A-Z]", password):
        raise ValueError(
            "Password must contain an uppercase letter."
        )

    if not re.search(r"[a-z]", password):
        raise ValueError(
            "Password must contain a lowercase letter."
        )

    if not re.search(r"\d", password):
        raise ValueError(
            "Password must contain a number."
        )

    if not re.search(r"[^A-Za-z0-9]", password):
        raise ValueError(
            "Password must contain a special character."
        )

    return password