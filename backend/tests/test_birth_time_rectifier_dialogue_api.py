from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_birth_time_rectifier_dialogue_returns_follow_up(monkeypatch):
    async def fake_generate(payload):
        assert payload.location_name == "武汉，中国"
        assert len(payload.messages) == 1
        return {
            "assistant_message": "你提到小学一年级搬去城里，这很好。接下来请讲一个感情或家庭关系上的重大节点，尽量带时间。",
            "should_continue": True,
            "confidence": "low",
            "suggested_time": "",
            "time_range": "",
            "summary": "",
            "rationale": [],
            "next_steps": [],
            "events": [
                {
                    "title": "童年迁移",
                    "date_hint": "小学一年级",
                    "description": "父母带你去城里上学，生活环境明显改变。",
                }
            ],
            "model": "deepseek-v4-flash",
            "skill_bundle": {
                "name": "vedic-rectifier",
                "path": "D:/skills/vedic-rectifier",
                "mode": "deepseek",
            },
            "references": [],
        }

    monkeypatch.setattr("app.main.generate_birth_time_rectifier_dialogue", fake_generate)

    response = client.post(
        "/api/v1/birth-time-rectifier/dialogue",
        json={
            "location_name": "武汉，中国",
            "chart": {
                "profile": {
                    "name": "小林",
                    "birth_date": "2006-05-08",
                    "birth_time": "09:10:00",
                    "latitude": 30.5928,
                    "longitude": 114.3055,
                    "timezone_offset": 8,
                }
            },
            "messages": [
                {
                    "role": "user",
                    "content": "我小学一年级时父母带我去城里上学。",
                }
            ],
            "extracted_events": [],
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["code"] == 0
    assert payload["data"]["should_continue"] is True
    assert payload["data"]["events"][0]["title"] == "童年迁移"


def test_birth_time_rectifier_dialogue_can_return_final_result(monkeypatch):
    async def fake_generate(payload):
        return {
            "assistant_message": "我已经有足够线索了，先给你一个当前最可信的时间结论。",
            "should_continue": False,
            "confidence": "medium",
            "suggested_time": "04:18",
            "time_range": "04:12 - 04:24",
            "summary": "综合迁移、升学和关系节点，当前时间更接近凌晨 4 点 18 分。",
            "rationale": ["多个节点都更贴近同一组上升度数变化。"],
            "next_steps": ["用新时间重看 D1 和 D9。"],
            "events": [
                {
                    "title": "童年迁移",
                    "date_hint": "小学一年级",
                    "description": "父母带你去城里上学。",
                }
            ],
            "model": "deepseek-v4-flash",
            "skill_bundle": {
                "name": "vedic-rectifier",
                "path": "D:/skills/vedic-rectifier",
                "mode": "deepseek",
            },
            "references": [],
        }

    monkeypatch.setattr("app.main.generate_birth_time_rectifier_dialogue", fake_generate)

    response = client.post(
        "/api/v1/birth-time-rectifier/dialogue",
        json={
            "location_name": "武汉，中国",
            "chart": {},
            "messages": [
                {"role": "assistant", "content": "先说一个迁移事件。"},
                {"role": "user", "content": "小学一年级搬去城里。"},
            ],
            "extracted_events": [
                {
                    "title": "童年迁移",
                    "date_hint": "小学一年级",
                    "description": "父母带你去城里上学。",
                }
            ],
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["data"]["should_continue"] is False
    assert payload["data"]["suggested_time"] == "04:18"
