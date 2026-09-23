from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from app.api import audit, auth, dashboard, reports, roles, rules, transactions, users
<<<<<<< HEAD
from app.api import alerts as alerts_api
from app.api import investigations as investigations_api
from app.api import customer_risk as customer_risk_api
=======
>>>>>>> 7dc32d20311dacb615026cefea7a42666a4b94e1
from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.middleware import SecurityHeadersMiddleware
from app.models import (  # noqa: F401
    alerts,
    api_keys,
    customers,
    imports,
<<<<<<< HEAD
    investigations,
=======
>>>>>>> 7dc32d20311dacb615026cefea7a42666a4b94e1
    risk_explanation,
    rules as rules_model,
    security,
    token,
)
from app.models import transactions as transaction_models  # noqa: F401
from app.services.bootstrap import create_initial_admin
from app.services.rbac import seed_roles_and_permissions
from app.services.rules_engine import get_or_create_default_rules


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        seed_roles_and_permissions(db)
        create_initial_admin(db)
        get_or_create_default_rules(db)
    finally:
        db.close()

    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
    ],
)


app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.allowed_hosts,
)


app.add_middleware(
    SecurityHeadersMiddleware,
)


app.include_router(
    auth.router,
    prefix="/api",
)

app.include_router(
    users.router,
    prefix="/api",
)

app.include_router(
    roles.router,
    prefix="/api",
)

app.include_router(
    audit.router,
    prefix="/api",
)

app.include_router(
    transactions.router,
    prefix="/api",
)

app.include_router(
    transactions.risk_router,
    prefix="/api",
)

app.include_router(
    transactions.risk_lookup_router,
    prefix="/api",
)

app.include_router(
    rules.rules_router,
    prefix="/api",
)

app.include_router(
    rules.risk_explanation_router,
    prefix="/api",
)

app.include_router(
    dashboard.router,
    prefix="/api",
)

app.include_router(
    reports.router,
    prefix="/api",
)

<<<<<<< HEAD
app.include_router(
    alerts_api.router,
    prefix="/api",
)

app.include_router(
    investigations_api.router,
    prefix="/api",
)

app.include_router(
    customer_risk_api.router,
    prefix="/api",
)

=======
>>>>>>> 7dc32d20311dacb615026cefea7a42666a4b94e1

@app.get("/health")
def health_check():
    return {
        "status": "ok"
<<<<<<< HEAD
    }
=======
    }
>>>>>>> 7dc32d20311dacb615026cefea7a42666a4b94e1
