from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_chart_reading_returns_response_envelope(monkeypatch):
    async def fake_generate(payload):
        assert payload.focus == "career"
        assert payload.chart["profile"]["name"] == "小林"
        return {
            "answer": "先稳住当前主线，再观察今年后半段的窗口切换。",
            "model": "deepseek-v4-flash",
            "focus": "career",
            "skill_bundle": {
                "name": "vedic-career",
                "path": "D:/skills/vedic-career",
                "mode": "deepseek",
            },
            "references": [],
        }

    monkeypatch.setattr("app.main.generate_chart_reading", fake_generate)

    response = client.post(
        "/api/v1/chart-reading",
        json={
            "focus": "career",
            "question": "这张盘更适合先稳住还是主动换方向？",
            "location_name": "上海市，中国",
            "chart": {
                "profile": {
                    "name": "小林",
                    "birth_date": "1996-07-04",
                    "birth_time": "09:10:00",
                    "latitude": 31.2304,
                    "longitude": 121.4737,
                    "timezone_offset": 8,
                },
                "chart": {
                    "lagna_sign": "Leo",
                    "moon_sign": "Capricorn",
                    "sun_sign": "Gemini",
                    "houses": [],
                    "planets": [],
                    "divisional_charts": [],
                },
                "panchanga": {
                    "nakshatra": "Dhanishta",
                    "tithi": "Krishna Chaturthi",
                    "yoga": "Priti",
                    "karana": "Bava",
                    "vaara": "Thursday",
                },
                "dasha": {
                    "current": "Jupiter / Venus / Venus",
                    "mahadasha": None,
                    "antardasha": None,
                    "pratyantardasha": None,
                },
                "meta": {
                    "engine": "jyotishganit",
                    "ayanamsa": "True Chitra Paksha",
                    "available_modules": ["D1", "D9", "D10"],
                    "report_scope": ["本命结构"],
                },
            },
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["code"] == 0
    assert payload["data"]["focus"] == "career"
    assert payload["data"]["model"] == "deepseek-v4-flash"
    assert payload["data"]["skill_bundle"]["name"] == "vedic-career"


def test_chart_reading_validates_focus():
    response = client.post(
        "/api/v1/chart-reading",
        json={
            "focus": "timing",
            "chart": {},
        },
    )

    assert response.status_code == 422
