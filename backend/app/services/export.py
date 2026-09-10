import csv
import io

from openpyxl import Workbook
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def export_to_csv(rows: list[dict], columns: list[str]) -> bytes:
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=columns)

    writer.writeheader()

    for row in rows:
        writer.writerow({column: row.get(column, "") for column in columns})

    return buffer.getvalue().encode("utf-8")


def export_to_excel(rows: list[dict], columns: list[str], sheet_name: str = "Report") -> bytes:
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = sheet_name

    sheet.append(columns)

    for row in rows:
        sheet.append([row.get(column, "") for column in columns])

    buffer = io.BytesIO()
    workbook.save(buffer)

    return buffer.getvalue()


def export_to_pdf(rows: list[dict], columns: list[str], title: str) -> bytes:
    buffer = io.BytesIO()
    document = SimpleDocTemplate(buffer, pagesize=letter)

    table_data = [columns]

    for row in rows:
        table_data.append([str(row.get(column, "")) for column in columns])

    table = Table(table_data, repeatRows=1)

    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1F2937")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTSIZE", (0, 0), (-1, -1), 7),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F3F4F6")]),
            ]
        )
    )

    document.build([table])

    return buffer.getvalue()
