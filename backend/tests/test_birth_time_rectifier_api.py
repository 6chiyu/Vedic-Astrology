from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_birth_time_rectifier_returns_response_envelope(monkeypatch):
    async def fake_generate(payload):
        assert payload.location_name == "上海，中国"
        assert len(payload.life_events) == 3
        assert payload.life_events[0].title == "2014 年高考后离开老家"
        return {
            "suggested_time": "09:16",
            "time_range": "09:12 - 09:20",
            "confidence": "medium",
            "summary": "建议把出生时间从 09:10 微调到 09:16 左右，再用新盘复核。",
            "rationale": ["事件和当前时间差异主要落在上升度数敏感带。"],
            "next_steps": ["用新时间重看整体盘和 D9。"],
            "model": "deepseek-v4-flash",
            "skill_bundle": {
                "name": "vedic-rectifier",
                "path": "D:/skills/vedic-rectifier",
                "mode": "deepseek",
            },
            "references": [],
        }

    monkeypatch.setattr("app.main.generate_birth_time_rectification", fake_generate)

    response = client.post(
        "/api/v1/birth-time-rectifier",
        json={
            "location_name": "上海，中国",
            "chart": {
                "profile": {
                    "name": "小林",
                    "birth_date": "1996-07-04",
                    "birth_time": "09:10:00",
                    "latitude": 31.2304,
                    "longitude": 121.4737,
                    "timezone_offset": 8,
                }
            },
            "life_events": [
                {
                    "title": "2014 年高考后离开老家",
                    "date_hint": "2014-09",
                    "description": "高考后去外地读大学，第一次长期离开原生家庭。",
                },
                {
                    "title": "2020 年换到新行业",
                    "date_hint": "2020",
                    "description": "从原来的稳定工作转到完全不同的赛道。",
                },
                {
                    "title": "2023 年关系结束",
                    "date_hint": "2023-08",
                    "description": "一段长期关系结束，之后生活重心明显改变。",
                },
            ],
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["code"] == 0
    assert payload["data"]["suggested_time"] == "09:16"
    assert payload["data"]["skill_bundle"]["name"] == "vedic-rectifier"


def test_birth_time_rectifier_requires_enough_events():
    response = client.post(
        "/api/v1/birth-time-rectifier",
        json={
            "chart": {},
            "life_events": [
                {
                    "title": "只有一个事件",
                    "date_hint": "2020",
                    "description": "不够做时间校准。",
                }
            ],
        },
    )

    assert response.status_code == 422
