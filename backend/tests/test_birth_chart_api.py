import json

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_birth_chart_returns_response_envelope(monkeypatch, tmp_path):
    monkeypatch.setenv(
        "SAVED_BIRTH_CHARTS_PATH",
        str(tmp_path / "saved_birth_charts.json"),
    )

    response = client.post(
        "/api/v1/birth-chart",
        json={
            "name": "Test User",
            "location_name": "Shanghai, China",
            "birth_date": "1996-07-04",
            "birth_time": "09:10",
            "latitude": 31.2304,
            "longitude": 121.4737,
            "timezone_offset": 8,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["code"] == 0
    assert payload["data"]["profile"]["name"] == "Test User"
    assert payload["data"]["chart"]["lagna_sign"]
    assert isinstance(payload["data"]["chart"]["houses"], list)
    assert len(payload["data"]["chart"]["houses"]) == 12
    assert isinstance(payload["data"]["chart"]["planets"], list)
    assert payload["data"]["panchanga"]["nakshatra"]
    assert payload["data"]["panchanga"]["yoga"]
    assert "required_inputs" in payload["data"]["requirements"]
    assert "mahadasha" in payload["data"]["dasha"]
    assert "balance" in payload["data"]["dasha"]
    assert "upcoming" in payload["data"]["dasha"]
    assert "ashtakavarga" in payload["data"]["chart"]
    assert payload["data"]["meta"]["engine"] in {"jyotishganit", "fallback"}
    assert payload["data"]["storage"]["id"]
    assert payload["data"]["storage"]["saved_at"]

    saved_records = json.loads((tmp_path / "saved_birth_charts.json").read_text(encoding="utf-8"))
    assert len(saved_records) == 1
    assert saved_records[0]["profile_input"]["name"] == "Test User"
    assert saved_records[0]["profile_input"]["location_name"] == "Shanghai, China"
    assert saved_records[0]["chart_snapshot"]["profile"]["name"] == "Test User"


def test_birth_chart_returns_complete_house_cusp_fields(monkeypatch, tmp_path):
    monkeypatch.setenv(
        "SAVED_BIRTH_CHARTS_PATH",
        str(tmp_path / "saved_birth_charts.json"),
    )
    response = client.post(
        "/api/v1/birth-chart",
        json={
            "name": "Test User",
            "birth_date": "1996-07-04",
            "birth_time": "09:10",
            "latitude": 31.2304,
            "longitude": 121.4737,
            "timezone_offset": 8,
        },
    )

    assert response.status_code == 200
    houses = response.json()["data"]["chart"]["houses"]
    assert len(houses) == 12
    assert all(house["sign_degrees"] is not None for house in houses)
    assert all(house["nakshatra"] for house in houses)
    assert all(house["pada"] is not None for house in houses)


def test_birth_chart_validates_coordinates(monkeypatch, tmp_path):
    monkeypatch.setenv(
        "SAVED_BIRTH_CHARTS_PATH",
        str(tmp_path / "saved_birth_charts.json"),
    )
    response = client.post(
        "/api/v1/birth-chart",
        json={
            "birth_date": "1996-07-04",
            "birth_time": "09:10",
            "latitude": 108,
            "longitude": 121.4737,
            "timezone_offset": 8,
        },
    )

    assert response.status_code == 422


def test_health_endpoint():
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
