
from app.core.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.imports import CSVImportJob, ImportJobStatus
from app.services.csv_import import parse_csv_rows, process_csv_import


@celery_app.task(name="process_csv_import_job")
def process_csv_import_job_task(
    job_id: int,
    file_content_b64: str,
    created_by_id: int | None,
) -> dict:
    import base64

    db = SessionLocal()

    try:
        job = (
            db.query(CSVImportJob)
            .filter(CSVImportJob.id == job_id)
            .first()
        )

        if job is None:
            return {"error": "Import job not found."}

        try:
            file_content = base64.b64decode(file_content_b64)
            rows = parse_csv_rows(file_content)

            process_csv_import(
                db,
                job=job,
                rows=rows,
                created_by_id=created_by_id,
            )
        except Exception as exc:
            job.status = ImportJobStatus.FAILED
            job.errors = str(exc)
            db.commit()

        return {
            "job_id": job.id,
            "status": job.status.value,
            "inserted_rows": job.inserted_rows,
            "duplicate_rows": job.duplicate_rows,
            "error_rows": job.error_rows,
        }
    finally:
        db.close()
