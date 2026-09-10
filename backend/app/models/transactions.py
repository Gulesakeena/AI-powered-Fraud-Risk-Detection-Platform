
import base64
import json

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.api_key_auth import get_transaction_actor
from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user, require_permission
from app.models.customers import Customer
from app.models.imports import CSVImportJob, ImportJobStatus
from app.models.security import User
from app.models.transactions import RiskLevel, Transaction, TransactionSource, TransactionStatus
from app.schemas.transactions import (
    CSVImportResponse,
    PaginatedTransactionsResponse,
    RiskCheckRequest,
    RiskCheckResponse,
    TransactionCreate,
    TransactionDetailResponse,
    TransactionResponse,
    TransactionRiskResponse,
    TransactionUpdate,
)
from app.services.csv_import import parse_csv_rows, process_csv_import
from app.services.customers import (
    apply_outcome_to_customer,
    get_or_create_customer,
)
from app.services.risk_scoring import evaluate_transaction_risk
from app.services.transactions import create_transaction_with_risk_check


router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"],
)


risk_router = APIRouter(
    prefix="/risk-check",
    tags=["Risk"],
)


risk_lookup_router = APIRouter(
    prefix="/risk",
    tags=["Risk"],
)


@router.post(
    "",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_transaction(
    data: TransactionCreate,
    db: Session = Depends(get_db),
    actor=Depends(get_transaction_actor),
):
    source = (
        TransactionSource.MANUAL
        if isinstance(actor, User)
        else TransactionSource.API
    )

    created_by_id = actor.id if isinstance(actor, User) else None

    try:
        transaction = create_transaction_with_risk_check(
            db,
            data=data,
            source=source,
            created_by_id=created_by_id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        )

    return TransactionResponse.from_model(transaction)


@router.get(
    "",
    response_model=PaginatedTransactionsResponse,
)
def list_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("transactions.read")),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=settings.DEFAULT_PAGE_SIZE, ge=1, le=settings.MAX_PAGE_SIZE),
    search: str | None = Query(default=None),
    risk_level: RiskLevel | None = Query(default=None),
    status_filter: TransactionStatus | None = Query(default=None, alias="status"),
    customer_ref: str | None = Query(default=None),
):
    query = db.query(Transaction)

    if search:
        like_pattern = f"%{search}%"
        query = query.join(Customer).filter(
            or_(
                Transaction.transaction_ref.ilike(like_pattern),
                Transaction.merchant.ilike(like_pattern),
                Customer.name.ilike(like_pattern),
                Customer.customer_ref.ilike(like_pattern),
            )
        )

    if risk_level:
        query = query.filter(Transaction.risk_level == risk_level)

    if status_filter:
        query = query.filter(Transaction.status == status_filter)

    if customer_ref:
        query = query.join(Customer, isouter=True).filter(
            Customer.customer_ref == customer_ref
        )

    total = query.count()

    items = (
        query.order_by(Transaction.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    total_pages = (total + page_size - 1) // page_size if total else 0

    return PaginatedTransactionsResponse(
        items=[TransactionResponse.from_model(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/{transaction_id}",
    response_model=TransactionDetailResponse,
)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("transactions.read")),
):
    transaction = (
        db.query(Transaction)
        .filter(Transaction.id == transaction_id)
        .first()
    )

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found.",
        )

    response = TransactionResponse.from_model(transaction).model_dump()
    response["customer"] = transaction.customer

    return TransactionDetailResponse(**response)


@router.patch(
    "/{transaction_id}",
    response_model=TransactionResponse,
)
def update_transaction(
    transaction_id: int,
    data: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("transactions.read")),
):
    transaction = (
        db.query(Transaction)
        .filter(Transaction.id == transaction_id)
        .first()
    )

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found.",
        )

    if data.status is not None:
        transaction.status = data.status

    if data.description is not None:
        transaction.description = data.description

    if data.outcome is not None and data.outcome != transaction.outcome:
        transaction.outcome = data.outcome

        customer = (
            db.query(Customer)
            .filter(Customer.id == transaction.customer_id)
            .first()
        )

        if customer is not None:
            apply_outcome_to_customer(
                db,
                customer=customer,
                outcome=data.outcome,
            )

    db.commit()
    db.refresh(transaction)

    return TransactionResponse.from_model(transaction)


@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("transactions.read")),
):
    transaction = (
        db.query(Transaction)
        .filter(Transaction.id == transaction_id)
        .first()
    )

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found.",
        )

    db.delete(transaction)
    db.commit()

    return {"message": "Transaction deleted successfully."}


@router.post(
    "/import",
    response_model=CSVImportResponse,
)
async def import_transactions_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("transactions.import")),
    file: UploadFile = File(...),
):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are supported.",
        )

    content = await file.read()

    try:
        rows = parse_csv_rows(content)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to parse CSV file: {exc}",
        )

    job = CSVImportJob(
        filename=file.filename,
        total_rows=len(rows),
        created_by_id=current_user.id,
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    if len(rows) > settings.CSV_ASYNC_ROW_THRESHOLD:
        from app.tasks.csv_tasks import process_csv_import_job_task

        encoded_content = base64.b64encode(content).decode("utf-8")

        process_csv_import_job_task.delay(
            job.id,
            encoded_content,
            current_user.id,
        )

        return CSVImportResponse(
            job_id=job.id,
            status=ImportJobStatus.PENDING.value,
            total_rows=len(rows),
            processed_rows=0,
            inserted_rows=0,
            duplicate_rows=0,
            error_rows=0,
            errors=[],
            async_processing=True,
        )

    job = process_csv_import(
        db,
        job=job,
        rows=rows,
        created_by_id=current_user.id,
    )

    errors = json.loads(job.errors) if job.errors else []

    return CSVImportResponse(
        job_id=job.id,
        status=job.status.value,
        total_rows=job.total_rows,
        processed_rows=job.processed_rows,
        inserted_rows=job.inserted_rows,
        duplicate_rows=job.duplicate_rows,
        error_rows=job.error_rows,
        errors=errors,
        async_processing=False,
    )


@router.get(
    "/import/{job_id}",
    response_model=CSVImportResponse,
)
def get_import_job_status(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("transactions.import")),
):
    job = (
        db.query(CSVImportJob)
        .filter(CSVImportJob.id == job_id)
        .first()
    )

    if job is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Import job not found.",
        )

    errors = json.loads(job.errors) if job.errors else []

    return CSVImportResponse(
        job_id=job.id,
        status=job.status.value,
        total_rows=job.total_rows,
        processed_rows=job.processed_rows,
        inserted_rows=job.inserted_rows,
        duplicate_rows=job.duplicate_rows,
        error_rows=job.error_rows,
        errors=errors,
        async_processing=job.status == ImportJobStatus.PROCESSING,
    )


@risk_router.post(
    "",
    response_model=RiskCheckResponse,
)
def risk_check(
    data: RiskCheckRequest,
    db: Session = Depends(get_db),
    actor=Depends(get_transaction_actor),
):
    customer = get_or_create_customer(
        db,
        customer_ref=data.customer.customer_ref,
        name=data.customer.name,
        email=data.customer.email,
        phone=data.customer.phone,
    )

    from datetime import datetime

    result = evaluate_transaction_risk(
        db,
        customer=customer,
        amount=data.amount,
        device_id=data.device_id,
        ip_address=data.ip_address,
        country=data.country,
        occurred_at=data.occurred_at or datetime.utcnow(),
    )

    db.rollback()

    return RiskCheckResponse(
        risk_score=result.score,
        risk_level=result.level,
        decision=result.decision,
        risk_factors=result.factors,
    )


@risk_lookup_router.get(
    "/{transaction_id}",
    response_model=TransactionRiskResponse,
)
def get_transaction_risk(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("risk.read")),
):
    transaction = (
        db.query(Transaction)
        .filter(Transaction.id == transaction_id)
        .first()
    )

    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found.",
        )

    factors = (
        json.loads(transaction.risk_factors)
        if transaction.risk_factors
        else []
    )

    return TransactionRiskResponse(
        transaction_id=transaction.id,
        transaction_ref=transaction.transaction_ref,
        risk_score=transaction.risk_score,
        risk_level=transaction.risk_level,
        decision=transaction.decision,
        risk_factors=factors,
        outcome=transaction.outcome,
    )
