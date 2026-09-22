import csv
import io
import json
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.imports import CSVImportJob, ImportJobStatus
from app.models.transactions import Transaction, TransactionSource
from app.schemas.transactions import CustomerInput, TransactionCreate
from app.services.transactions import create_transaction_with_risk_check


REQUIRED_COLUMNS = [
    "transaction_id",
    "amount",
    "currency",
    "customer_id",
]

OPTIONAL_COLUMNS = [
    "customer_name",
    "customer_email",
    "merchant",
    "merchant_category",
    "location",
    "country",
    "device_id",
    "ip_address",
    "payment_method",
    "timestamp",
]


def parse_csv_rows(file_content: bytes) -> list[dict]:
    text_stream = io.StringIO(file_content.decode("utf-8-sig"))
    reader = csv.DictReader(text_stream)
    return list(reader)


def validate_row(row: dict, row_number: int) -> tuple[TransactionCreate | None, str | None]:
    missing = [
        column
        for column in REQUIRED_COLUMNS
        if not row.get(column)
    ]

    if missing:
        return None, f"Missing required fields: {', '.join(missing)}."

    try:
        amount = float(row["amount"])
    except (TypeError, ValueError):
        return None, f"Invalid amount value: '{row.get('amount')}'."

    if amount <= 0:
        return None, "Amount must be greater than zero."

    occurred_at = None

    timestamp_raw = row.get("timestamp")

    if timestamp_raw:
        try:
            occurred_at = datetime.fromisoformat(
                timestamp_raw.replace("Z", "+00:00")
            )
        except ValueError:
            return None, f"Invalid timestamp value: '{timestamp_raw}'."

    location = row.get("location") or ""
    city = None
    country = row.get("country")

    if location and "," in location:
        city_part, country_part = location.split(",", 1)
        city = city_part.strip()

        if not country:
            country = country_part.strip()

    try:
        data = TransactionCreate(
            transaction_ref=row["transaction_id"],
            customer=CustomerInput(
                customer_ref=row["customer_id"],
                name=row.get("customer_name") or row["customer_id"],
                email=row.get("customer_email"),
            ),
            amount=amount,
            currency=row.get("currency") or "USD",
            merchant=row.get("merchant"),
            merchant_category=row.get("merchant_category"),
            payment_method_type=row.get("payment_method"),
            device_id=row.get("device_id"),
            ip_address=row.get("ip_address"),
            city=city,
            country=country,
            occurred_at=occurred_at,
        )
    except Exception as exc:
        return None, str(exc)

    return data, None


def process_csv_import(
    db: Session,
    *,
    job: CSVImportJob,
    rows: list[dict],
    created_by_id: int | None,
) -> CSVImportJob:
    job.status = ImportJobStatus.PROCESSING
    job.total_rows = len(rows)
    db.commit()

    errors: list[dict] = []
    inserted = 0
    duplicates = 0

    for index, row in enumerate(rows, start=1):
        data, error = validate_row(row, index)

        if error:
            errors.append({"row_number": index, "reason": error})
            job.error_rows += 1
            job.processed_rows += 1
            continue

        existing = (
            db.query(Transaction)
            .filter(Transaction.transaction_ref == data.transaction_ref)
            .first()
        )

        if existing is not None:
            duplicates += 1
            job.duplicate_rows += 1
            job.processed_rows += 1
            continue

        try:
            create_transaction_with_risk_check(
                db,
                data=data,
                source=TransactionSource.CSV_IMPORT,
                created_by_id=created_by_id,
            )
            inserted += 1
            job.inserted_rows += 1
        except ValueError as exc:
            errors.append({"row_number": index, "reason": str(exc)})
            job.error_rows += 1
        except Exception as exc:
            db.rollback()
            errors.append({"row_number": index, "reason": f"Unexpected error: {exc}"})
            job.error_rows += 1

        job.processed_rows += 1

    job.errors = json.dumps(errors)
    job.status = ImportJobStatus.COMPLETED
    job.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(job)

    return job
