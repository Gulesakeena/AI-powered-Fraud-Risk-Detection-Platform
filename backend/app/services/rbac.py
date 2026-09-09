from sqlalchemy.orm import Session

from app.models.security import Permission, Role, UserRole


ROLE_PERMISSIONS = {
    UserRole.ADMIN: [
        "users.create",
        "users.read",
        "users.update",
        "users.delete",
        "users.manage_roles",
        "audit.read",

        "transactions.read",
        "transactions.create",
        "transactions.import",

        "dashboard.read",

        "reports.read",
        "reports.export",

        "rules.manage",

        "risk.read",

        "alerts.read",
        "alerts.review",
        "alerts.assign",

        "investigations.read",
        "investigations.manage",

        "fraud_network.read",

        "ai.investigate",
    ],

    UserRole.BUSINESS_MANAGER: [
        "users.read",

        "transactions.read",

        "dashboard.read",

        "reports.read",
        "reports.export",

        "rules.manage",

        "risk.read",

        "alerts.read",
        "alerts.review",
        "alerts.assign",

        "investigations.read",
        "investigations.manage",

        "fraud_network.read",

        "ai.investigate",
    ],

    UserRole.ANALYST: [
        "transactions.read",

        "dashboard.read",

        "reports.read",

        "risk.read",

        "alerts.read",
        "alerts.review",

        "investigations.read",
        "investigations.manage",

        "fraud_network.read",

        "ai.investigate",
    ],
}


def seed_roles_and_permissions(db: Session) -> None:
    all_permission_names = {
        permission
        for permissions in ROLE_PERMISSIONS.values()
        for permission in permissions
    }

    permission_objects = {}

    for permission_name in all_permission_names:
        permission = (
            db.query(Permission)
            .filter(Permission.name == permission_name)
            .first()
        )

        if permission is None:
            permission = Permission(
                name=permission_name,
                description=permission_name.replace(
                    ".",
                    " ",
                ).replace(
                    "_",
                    " ",
                ).title(),
            )

            db.add(permission)
            db.flush()

        permission_objects[permission_name] = permission

    for role_name, permission_names in ROLE_PERMISSIONS.items():
        role = (
            db.query(Role)
            .filter(Role.name == role_name)
            .first()
        )

        if role is None:
            role = Role(
                name=role_name,
            )

            db.add(role)
            db.flush()

        role.permissions = [
            permission_objects[name]
            for name in permission_names
        ]

    db.commit()