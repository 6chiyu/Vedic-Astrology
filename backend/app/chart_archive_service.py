import json
import os
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

from app.schemas import BirthChartRequest


def _archive_path() -> Path:
    configured = os.environ.get("SAVED_BIRTH_CHARTS_PATH", "").strip()
    if configured:
        return Path(configured)
    return Path(__file__).resolve().parents[1] / "data" / "saved_birth_charts.json"


def _load_records(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []

    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []

    return payload if isinstance(payload, list) else []


def save_birth_chart_archive(
    payload: BirthChartRequest,
    chart_payload: dict[str, Any],
) -> dict[str, str]:
    path = _archive_path()
    path.parent.mkdir(parents=True, exist_ok=True)

    records = _load_records(path)
    saved_at = datetime.now(timezone.utc).isoformat()
    archive_id = str(uuid4())

    record = {
      "id": archive_id,
      "saved_at": saved_at,
      "profile_input": {
        "name": payload.name,
        "location_name": payload.location_name,
        "birth_date": payload.birth_date.isoformat(),
        "birth_time": payload.birth_time.strftime("%H:%M:%S"),
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "timezone_offset": payload.timezone_offset,
      },
      "chart_snapshot": deepcopy(chart_payload),
    }

    records.insert(0, record)
    path.write_text(
        json.dumps(records, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    return {"id": archive_id, "saved_at": saved_at}
