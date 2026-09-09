import os
import sys
from pathlib import Path


# Make the backend folder importable so "app" can be found.
BACKEND_DIR = Path(__file__).resolve().parents[1]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


# Use a separate database for automated tests.
TEST_DB = BACKEND_DIR / "test_fraudshield.db"

if TEST_DB.exists():
    TEST_DB.unlink()


os.environ["DATABASE_URL"] = (
    f"sqlite:///{TEST_DB.as_posix()}"
)
os.environ["SECRET_KEY"] = (
    "test-secret-key-for-fraudshield-authentication-tests-2026"
)
os.environ["ADMIN_EMAIL"] = "admin@test.com"
os.environ["ADMIN_PASSWORD"] = "Admin_Test_2026_Strong!"
os.environ["ADMIN_FULL_NAME"] = "Test Administrator"
os.environ["ALLOWED_HOSTS"] = (
    "localhost,127.0.0.1,testserver"
)


from fastapi.testclient import TestClient

from app.main import app


ADMIN_LOGIN = {
    "email": "admin@test.com",
    "password": "Admin_Test_2026_Strong!",
}

MANAGER_USER = {
    "email": "manager@test.com",
    "full_name": "Business Manager",
    "password": "Manager_Test_2026_Strong!",
    "role": "BUSINESS_MANAGER",
}

ANALYST_USER = {
    "email": "analyst@test.com",
    "full_name": "Fraud Analyst",
    "password": "Analyst_Test_2026_Strong!",
    "role": "ANALYST",
}


def auth_header(token: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {token}"
    }


def test_complete_auth_and_rbac_flow():
    with TestClient(app) as client:
        # Health check.
        response = client.get("/health")

        assert response.status_code == 200
        assert response.json() == {
            "status": "ok"
        }

        # Admin login.
        response = client.post(
            "/api/auth/login",
            json=ADMIN_LOGIN,
        )

        assert response.status_code == 200

        admin_token = response.json()["access_token"]

        # Admin profile.
        response = client.get(
            "/api/users/me",
            headers=auth_header(admin_token),
        )

        assert response.status_code == 200
        assert response.json()["role"]["name"] == "ADMIN"

        # Admin creates Business Manager.
        response = client.post(
            "/api/users",
            json=MANAGER_USER,
            headers=auth_header(admin_token),
        )

        assert response.status_code == 201
        assert (
            response.json()["role"]["name"]
            == "BUSINESS_MANAGER"
        )

        # Admin creates Analyst.
        response = client.post(
            "/api/users",
            json=ANALYST_USER,
            headers=auth_header(admin_token),
        )

        assert response.status_code == 201
        assert response.json()["role"]["name"] == "ANALYST"

        # Business Manager login.
        response = client.post(
            "/api/auth/login",
            json={
                "email": MANAGER_USER["email"],
                "password": MANAGER_USER["password"],
            },
        )

        assert response.status_code == 200

        manager_token = response.json()["access_token"]

        # Manager may read users.
        response = client.get(
            "/api/users",
            headers=auth_header(manager_token),
        )

        assert response.status_code == 200

        # Manager may NOT create users.
        response = client.post(
            "/api/users",
            json={
                "email": "blocked@test.com",
                "full_name": "Blocked User",
                "password": "Blocked_Test_2026_Strong!",
                "role": "ANALYST",
            },
            headers=auth_header(manager_token),
        )

        assert response.status_code == 403
        assert response.json()["detail"] == (
            "Missing required permission: users.create"
        )

        # Manager may NOT read audit logs.
        response = client.get(
            "/api/audit-logs",
            headers=auth_header(manager_token),
        )

        assert response.status_code == 403

        # Analyst login.
        response = client.post(
            "/api/auth/login",
            json={
                "email": ANALYST_USER["email"],
                "password": ANALYST_USER["password"],
            },
        )

        assert response.status_code == 200

        analyst_token = response.json()["access_token"]

        # Analyst may access own profile.
        response = client.get(
            "/api/users/me",
            headers=auth_header(analyst_token),
        )

        assert response.status_code == 200
        assert response.json()["role"]["name"] == "ANALYST"

        # Analyst may NOT read all users.
        response = client.get(
            "/api/users",
            headers=auth_header(analyst_token),
        )

        assert response.status_code == 403

        # Analyst may NOT read audit logs.
        response = client.get(
            "/api/audit-logs",
            headers=auth_header(analyst_token),
        )

        assert response.status_code == 403

        # Invalid password must fail.
        response = client.post(
            "/api/auth/login",
            json={
                "email": ANALYST_USER["email"],
                "password": "WrongPassword123!",
            },
        )

        assert response.status_code == 401

        # Admin can read audit logs.
        response = client.get(
            "/api/audit-logs",
            headers=auth_header(admin_token),
        )

        assert response.status_code == 200

        actions = {
            log["action"]
            for log in response.json()
        }

        assert "LOGIN" in actions
        assert "USER_CREATED" in actions
        assert "LOGIN_FAILED" in actions

        # Logout must revoke the Admin JWT.
        response = client.post(
            "/api/auth/logout",
            headers=auth_header(admin_token),
        )

        assert response.status_code == 200

        # Revoked JWT must no longer work.
        response = client.get(
            "/api/users/me",
            headers=auth_header(admin_token),
        )

        assert response.status_code == 401
        assert response.json()["detail"] == (
            "This token has been revoked."
        )