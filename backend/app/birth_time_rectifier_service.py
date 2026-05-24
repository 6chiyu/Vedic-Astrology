import json
import os
from functools import lru_cache
from pathlib import Path
from typing import Any

import httpx

from app.schemas import BirthTimeRectifierRequest


# Multi-language support
SYSTEM_PROMPTS = {
    "zh": (
        "你是一位面向中文用户的印度占星出生时间校准助手。\n"
        "你的工作是基于当前盘面快照和用户提供的人生事件，通过占星学原理来推断和校准出生时间。\n\n"
        "重要：你必须清晰地说明你的推理过程，告诉用户你是如何通过星盘事实和人生事件的匹配来确定时间的。\n\n"
        "你的推理应该包括：\n"
        "1. 分析上升星座、月亮星座、太阳星座等基本配置如何与用户的性格和人生轨迹匹配\n"
        "2. 分析特定宫位（第1宫、第10宫、第7宫等）如何对应重要人生事件\n"
        "3. 分析当前大运(Dasha)如何与用户经历的时间节点对应\n"
        "4. 说明为什么你推荐某个特定的时间或时间区间\n\n"
        "不要编造额外的事件、宫位、相位或已经验证过的天文扫描结果。\n"
        "如果证据不足，必须坦率表达不确定性。\n"
        "输出必须是 JSON 对象，包含以下键："
        'suggested_time, time_range, confidence, summary, rationale, next_steps。\n'
        "其中 confidence 只能写 low / medium / high。\n"
        "rationale 和 next_steps 都必须是字符串数组。\n"
        "summary 用中文，2-4 句，要清晰说明你的推理过程。\n\n"
    ),
    "en": (
        "You are a Vedic Astrology birth time rectification assistant for English users.\n"
        "Your job is to infer and rectify birth time through astrological principles based on the current chart snapshot and life events provided by the user.\n\n"
        "IMPORTANT: You must clearly explain your reasoning process, tell the user how you determined the time by matching chart facts with life events.\n\n"
        "Your reasoning should include:\n"
        "1. Analysis of how basic configurations like Ascendant, Moon sign, Sun sign match with the user's personality and life trajectory\n"
        "2. Analysis of how specific houses (1st, 10th, 7th, etc.) correspond to major life events\n"
        "3. Analysis of how current Dasha corresponds with the timing of events the user experienced\n"
        "4. Explanation of why you recommend a specific time or time range\n\n"
        "Do not fabricate additional events, houses, aspects, or already verified astronomical scan results.\n"
        "If evidence is insufficient, you must frankly express uncertainty.\n"
        "Output must be a JSON object containing the following keys:"
        'suggested_time, time_range, confidence, summary, rationale, next_steps.\n'
        "confidence can only be low / medium / high.\n"
        "rationale and next_steps must both be string arrays.\n"
        "summary should be in English, 2-4 sentences, clearly explaining your reasoning process.\n\n"
    ),
    "hi": (
        "आप हिंदी उपयोगकर्ताओं के लिए एक वैदिक ज्योतिष जन्म समय सुधार सहायक हैं।\n"
        "आपको वर्तमान कुंडली स्नैपशॉट और उपयोगकर्ता द्वारा प्रदान की गई जीवन घटनाओं के आधार पर सख्ती से सुधार सुझाव देने चाहिए।\n"
        "अतिरिक्त घटनाएँ, भव, पक्ष या पहले से सत्यापित खगोलीय स्कैन परिणाम का निर्माण न करें।\n"
        "यदि सबूत अपर्याप्त हैं, तो आपको स्पष्ट रूप से अनिश्चितता व्यक्त करनी चाहिए।\n"
        "आउटपुट एक JSON ऑब्जेक्ट होना चाहिए जिसमें निम्नलिखित कुंजियाँ हों:"
        'suggested_time, time_range, confidence, summary, rationale, next_steps.\n'
        "confidence केवल low / medium / high हो सकता है।\n"
        "rationale और next_steps दोनों स्ट्रिंग सरणियाँ होनी चाहिए।\n"
        "summary हिंदी में होना चाहिए, 2-4 वाक्य।\n\n"
    ),
}

USER_PROMPTS = {
    "zh": (
        "请根据以下当前盘面和人生事件，对出生时间做一次 AI 校准建议。\n\n"
        "重要要求：\n"
        "1. 尽量给出一个建议时间（HH:MM，本地时间）和一个建议时间区间。\n"
        "2. 如果证据不足，可以保留当前时间附近的区间，但要解释原因。\n"
        "3. 在 summary 和 rationale 中，必须详细说明你的推理过程：\n"
        "   - 你是如何通过星盘事实（上升、月亮、太阳、宫位、大运等）来匹配用户人生事件的？\n"
        "   - 为什么你认为某个时间比另一个时间更合适？\n"
        "   - 你考虑了哪些占星学原理？\n"
        "4. 结论不能装作已经完成专业软件分钟级扫描；如果只是启发式建议，要明说。\n"
        "5. next_steps 里给出 2-4 条后续验证建议。"
    ),
    "en": (
        "Please make an AI rectification suggestion for the birth time based on the following current chart and life events.\n\n"
        "IMPORTANT Requirements:\n"
        "1. Try to give a suggested time (HH:MM, local time) and a suggested time range.\n"
        "2. If evidence is insufficient, you can keep the range near the current time, but explain why.\n"
        "3. In summary and rationale, you must explain your reasoning process in detail:\n"
        "   - How did you match chart facts (Ascendant, Moon, Sun, houses, dasha, etc.) with the user's life events?\n"
        "   - Why do you believe one time is more suitable than another?\n"
        "   - What astrological principles did you consider?\n"
        "4. The conclusion must not pretend to have completed professional software minute-level scanning; if it's just heuristic suggestions, make it clear.\n"
        "5. Give 2-4 follow-up verification suggestions in next_steps."
    ),
    "hi": (
        "कृपया निम्नलिखित वर्तमान कुंडली और जीवन घटनाओं के आधार पर जन्म समय के लिए AI सुधार सुझाव दें।\n\n"
        "आवश्यकताएँ:\n"
        "1. एक सुझाया गया समय (HH:MM, स्थानीय समय) और एक सुझाया गया समय सीमा देने का प्रयास करें।\n"
        "2. यदि सबूत अपर्याप्त हैं, तो आप वर्तमान समय के पास की सीमा रख सकते हैं, लेकिन कारण समझाएं।\n"
        "3. निष्कर्ष यह न कहें कि पेशेवर सॉफ्टवेयर मिनट-स्तरीय स्कैन पूरा कर लिया है; यदि यह केवल हेयुरिस्टिक सुझाव हैं, तो स्पष्ट करें।\n"
        "4. next_steps में 2-4 अनुवर्ती सत्यापन सुझाव दें।"
    ),
}

LOCAL_FALLBACKS = {
    "zh": {
        "summary_prefix": "当前先基于",
        "summary_events": "个事件做本地兜底提示。",
        "summary_current_time": "你现在录入的出生时间是",
        "summary_no_api": "但没有启用在线校准模型，所以还不能可靠地反推到更具体的分钟。",
        "suggested_time_range": "建议先补充到 5 个重大事件后再校准",
        "rationale": [
            "出生时间校准需要更多事件锚点，至少覆盖学业、迁移、关系、职业或健康中的几类变化。",
            "当前兜底模式不会假装已经完成精确扫描，所以只给出流程建议。",
        ],
        "next_steps": [
            "补充 3 到 5 个带时间提示的人生事件。",
            "优先填写会明显改变生活轨迹的节点，例如搬家、升学、结婚、分手、转行或重大健康事件。",
            "补齐后重新运行 AI 校时，再用新的时间重看整体、事业和感情解读。",
        ],
    },
    "en": {
        "summary_prefix": "Currently providing local fallback based on",
        "summary_events": "events.",
        "summary_current_time": "The birth time you entered is",
        "summary_no_api": "but the online rectification model is not enabled, so we can't reliably rectify to more specific minutes yet.",
        "suggested_time_range": "Suggest adding at least 5 major events before rectification",
        "rationale": [
            "Birth time rectification requires more event anchors, covering at least several types of changes in academics, relocation, relationships, career, or health.",
            "The current fallback mode won't pretend to have completed precise scanning, so only process suggestions are given.",
        ],
        "next_steps": [
            "Add 3 to 5 life events with time hints.",
            "Prioritize filling in nodes that will significantly change life trajectory, such as moving, going to school, getting married, breaking up, changing careers, or major health events.",
            "After completing, re-run AI time rectification, then re-read overall, career, and relationship interpretations with the new time.",
        ],
    },
    "hi": {
        "summary_prefix": "वर्तमान में स्थानीय फॉलबैक प्रदान किया जा रहा है",
        "summary_events": "घटनाओं के आधार पर।",
        "summary_current_time": "आपके द्वारा दर्ज किया गया जन्म समय है",
        "summary_no_api": "लेकिन ऑनलाइन सुधार मॉडल सक्षम नहीं है, इसलिए हम अभी तक अधिक विशिष्ट मिनटों तक विश्वसनीय रूप से सुधार नहीं कर सकते हैं।",
        "suggested_time_range": "सुधार से पहले कम से कम 5 प्रमुख घटनाएँ जोड़ने का सुझाव दें",
        "rationale": [
            "जन्म समय सुधार के लिए अधिक घटना एंकर की आवश्यकता होती है, जो कम से कम शिक्षा, स्थानांतरण, संबंधों, करियर या स्वास्थ्य में परिवर्तन के कई प्रकारों को कवर करती हो।",
            "वर्तमान फॉलबैक मोड यह नहीं कहेगा कि सटीक स्कैन पूर्ण हो चुका है, इसलिए केवल प्रक्रिया सुझाव दिए जाते हैं।",
        ],
        "next_steps": [
            "समय संकेतों के साथ 3 से 5 जीवन घटनाएँ जोड़ें।",
            "उन नोड्स को भरने को प्राथमिकता दें जो जीवन के मार्ग को महत्वपूर्ण रूप से बदल देंगे, जैसे कि घर बदलना, स्कूल जाना, शादी करना, टूटना, करियर बदलना या प्रमुख स्वास्थ्य घटनाएँ।",
            "पूरा करने के बाद, AI समय सुधार को फिर से चलाएँ, फिर नए समय के साथ समग्र, करियर और संबंध व्याख्याओं को फिर से पढ़ें।",
        ],
    },
}

CHART_SNAPSHOT_LABELS = {
    "zh": {
        "birth_location": "出生地点",
        "birth_date": "当前录入出生日期",
        "birth_time": "当前录入出生时间",
        "latitude": "纬度",
        "longitude": "经度",
        "timezone": "时区",
        "ascendant": "上升",
        "moon": "月亮",
        "sun": "太阳",
        "nakshatra": "Nakshatra",
        "current_dasha": "当前大运",
    },
    "en": {
        "birth_location": "Birth location",
        "birth_date": "Current birth date",
        "birth_time": "Current birth time",
        "latitude": "Latitude",
        "longitude": "Longitude",
        "timezone": "Timezone",
        "ascendant": "Ascendant",
        "moon": "Moon",
        "sun": "Sun",
        "nakshatra": "Nakshatra",
        "current_dasha": "Current dasha",
    },
    "hi": {
        "birth_location": "జనన ప్రదేశం",
        "birth_date": "ప్రస్తుత నమోదైన జనన తేదీ",
        "birth_time": "ప్రస్తుత నమోదైన జనన సమయం",
        "latitude": "అక్షాంశం",
        "longitude": "రేఖాంశం",
        "timezone": "సమయ మండలం",
        "ascendant": "అసెండెంట్",
        "moon": "చంద్రుడు",
        "sun": "సూర్యుడు",
        "nakshatra": "నక్షత్రం",
        "current_dasha": "ప్రస్తుత దశ",
    },
}

EVENT_LABELS = {
    "zh": {
        "title": "事件标题",
        "date_hint": "时间提示",
        "description": "事件描述",
    },
    "en": {
        "title": "Event title",
        "date_hint": "Date hint",
        "description": "Event description",
    },
    "hi": {
        "title": "సంఘటన శీర్షిక",
        "date_hint": "తేదీ సూచన",
        "description": "సంఘటన వివరణ",
    },
}

SKILL_BUNDLE_FALLBACKS = {
    "zh": {
        "skill_not_found": "本地 vedic-rectifier skill 未找到。只能基于当前盘面和事件描述给出启发式时间校准建议，不能把不存在的精度说成已验证。",
        "file_missing": "skill 目录已找到，但 rectifier 说明缺失。请保持保守，只输出建议时间区间和置信度，不伪装成已天文验证。",
    },
    "en": {
        "skill_not_found": "Local vedic-rectifier skill not found. Can only give heuristic time rectification suggestions based on current chart and event descriptions, cannot claim non-existent precision as verified.",
        "file_missing": "Skill directory found, but rectifier instructions missing. Please keep conservative, only output suggested time range and confidence, do not pretend to be astronomically verified.",
    },
    "hi": {
        "skill_not_found": "స్థానిక vedic-rectifier స్కిల్ కనుగొనబడలేదు. ప్రస్తుత కుండలి మరియు సంఘటన వివరణల ఆధారంగా హ్యూరిస్టిక్ సమయ సవరణ సూచనలను మాత్రమే ఇవ్వగలరు, ఉనికిలోని ఖచ్చితతను ధృవీకరించినట్లు ప్రకటించకండి.",
        "file_missing": "స్కిల్ డైరెక్టరీ కనుగొనబడింది, కానీ rectifier సూచనలు తిరిగి పోయాయి. సంప్రదాయంగా ఉండండి, సూచించిన సమయ పరిధి మరియు విశ్వాసం మాత్రమే putput చేయండి, ఖగోళంగా ధృవీకరించినట్లు నటించకండి.",
    },
}

DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"


def _project_root() -> Path:
    return Path(__file__).resolve().parents[2]


def _clean_text(text: str) -> str:
    return text.lstrip("\ufeff").strip()


def _skill_root_candidates() -> list[Path]:
    configured = os.environ.get("VEDIC_SKILL_PACK_PATH", "").strip()
    candidates: list[Path] = []

    if configured:
        candidates.append(Path(configured))

    project_root = _project_root()
    candidates.extend(
        [
            project_root / ".external" / "vedic-astro-skills" / "claude-code" / "skills",
            project_root / "skills" / "vedic-astro-skills" / "claude-code" / "skills",
        ]
    )
    return candidates


@lru_cache(maxsize=1)
def get_skill_root() -> Path | None:
    for candidate in _skill_root_candidates():
        if candidate.exists():
            return candidate
    return None


def _read_excerpt(path: Path, max_lines: int) -> str:
    lines = _clean_text(path.read_text(encoding="utf-8")).splitlines()
    return "\n".join(lines[:max_lines]).strip()


@lru_cache(maxsize=1)
def load_rectifier_guidance(language: str = "zh") -> tuple[str, list[dict[str, str]], Path | None]:
    root = get_skill_root()
    references: list[dict[str, str]] = []
    fallbacks = SKILL_BUNDLE_FALLBACKS.get(language, SKILL_BUNDLE_FALLBACKS["zh"])
    
    # 多语言标签
    if language == "zh":
        skill_file_label = "##"
    elif language == "en":
        skill_file_label = "##"
    else:
        skill_file_label = "##"

    if root is None:
        return (
            fallbacks["skill_not_found"],
            references,
            None,
        )

    excerpts: list[str] = []
    files = [
        ("vedic-rectifier/SKILL.md", 220),
        ("vedic-reader/resources/data_contract.md", 80),
    ]

    for relative_path, max_lines in files:
        absolute_path = root / relative_path
        if not absolute_path.exists():
            continue
        excerpts.append(f"{skill_file_label} {relative_path}\n{_read_excerpt(absolute_path, max_lines)}")
        references.append(
            {
                "title": relative_path,
                "path": str(absolute_path),
                "type": "skill",
            }
        )

    guidance = "\n\n".join(excerpts).strip()
    if not guidance:
        guidance = fallbacks["file_missing"]

    return guidance, references, root


def _fmt(value: Any, fallback: str = "未提供") -> str:
    if value is None:
        return fallback
    if isinstance(value, str):
        return value.strip() or fallback
    return str(value)


def _number(value: Any) -> str:
    if isinstance(value, float):
        return f"{value:.2f}"
    if isinstance(value, int):
        return str(value)
    return _fmt(value)


def _build_chart_snapshot(chart_payload: dict[str, Any], location_name: str, language: str = "zh") -> str:
    profile = chart_payload.get("profile", {})
    chart = chart_payload.get("chart", {})
    panchanga = chart_payload.get("panchanga", {})
    dasha = chart_payload.get("dasha", {})
    labels = CHART_SNAPSHOT_LABELS.get(language, CHART_SNAPSHOT_LABELS["zh"])

    return "\n".join(
        [
            f"- {labels['birth_location']}: {_fmt(location_name)}",
            f"- {labels['birth_date']}: {_fmt(profile.get('birth_date'))}",
            f"- {labels['birth_time']}: {_fmt(profile.get('birth_time'))}",
            f"- {labels['latitude']}: {_number(profile.get('latitude'))}",
            f"- {labels['longitude']}: {_number(profile.get('longitude'))}",
            f"- {labels['timezone']}: UTC{_fmt(profile.get('timezone_offset'))}",
            f"- {labels['ascendant']}: {_fmt(chart.get('lagna_sign'))}",
            f"- {labels['moon']}: {_fmt(chart.get('moon_sign'))}",
            f"- {labels['sun']}: {_fmt(chart.get('sun_sign'))}",
            f"- {labels['nakshatra']}: {_fmt(panchanga.get('nakshatra'))}",
            f"- {labels['current_dasha']}: {_fmt(dasha.get('current'))}",
        ]
    )


def _build_event_block(payload: BirthTimeRectifierRequest, language: str = "zh") -> str:
    lines: list[str] = []
    labels = EVENT_LABELS.get(language, EVENT_LABELS["zh"])
    not_provided = "未提供" if language == "zh" else "Not provided" if language == "en" else "అందించలేదు"

    for index, event in enumerate(payload.life_events, start=1):
        lines.append(
            f"{index}. {labels['title']}: {event.title}\n   {labels['date_hint']}: {event.date_hint or not_provided}\n   {labels['description']}: {event.description}"
        )

    return "\n".join(lines)


def _normalize_rectifier_payload(raw_text: str) -> dict[str, Any]:
    try:
        parsed = json.loads(raw_text)
    except json.JSONDecodeError:
        return {
            "suggested_time": "",
            "time_range": "",
            "confidence": "low",
            "summary": raw_text.strip(),
            "rationale": [],
            "next_steps": [],
        }

    if not isinstance(parsed, dict):
        return {
            "suggested_time": "",
            "time_range": "",
            "confidence": "low",
            "summary": raw_text.strip(),
            "rationale": [],
            "next_steps": [],
        }

    rationale = parsed.get("rationale")
    next_steps = parsed.get("next_steps")

    return {
        "suggested_time": _fmt(parsed.get("suggested_time"), ""),
        "time_range": _fmt(parsed.get("time_range"), ""),
        "confidence": _fmt(parsed.get("confidence"), "low"),
        "summary": _fmt(parsed.get("summary"), raw_text.strip()),
        "rationale": rationale if isinstance(rationale, list) else [],
        "next_steps": next_steps if isinstance(next_steps, list) else [],
    }


def _build_messages(payload: BirthTimeRectifierRequest, guidance: str) -> list[dict[str, str]]:
    language = payload.language or "zh"
    system_prompt = SYSTEM_PROMPTS.get(language, SYSTEM_PROMPTS["zh"])
    
    if language == "zh":
        system_prompt += f"# 本地 rectifier 说明\n{guidance}"
    elif language == "en":
        system_prompt += f"# Local rectifier instructions\n{guidance}"
    else:
        system_prompt += f"# स्थानीय rectifier निर्देश\n{guidance}"

    user_prompt = USER_PROMPTS.get(language, USER_PROMPTS["zh"])
    user_prompt = (
        user_prompt.split("\n\n")[0] + "\n\n"
        f"# 当前盘面快照\n{_build_chart_snapshot(payload.chart, payload.location_name, language)}\n\n"
        f"# 人生事件\n{_build_event_block(payload, language)}\n\n"
        + "\n\n".join(user_prompt.split("\n\n")[1:])
    )

    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]


def _build_local_fallback(payload: BirthTimeRectifierRequest, reason: str) -> dict[str, Any]:
    language = payload.language or "zh"
    fallbacks = LOCAL_FALLBACKS.get(language, LOCAL_FALLBACKS["zh"])
    
    current_time = _fmt(payload.chart.get("profile", {}).get("birth_time"), "")
    event_count = len(payload.life_events)
    summary = (
        f"{fallbacks['summary_prefix']} {event_count} {fallbacks['summary_events']}"
        f"  {fallbacks['summary_current_time']} {current_time or '未提供'}，{fallbacks['summary_no_api']}"
    )

    return {
        "suggested_time": current_time,
        "time_range": fallbacks["suggested_time_range"],
        "confidence": "low",
        "summary": summary,
        "rationale": fallbacks["rationale"],
        "next_steps": fallbacks["next_steps"],
        "model": "local-rectifier-fallback",
        "skill_bundle": {
            "name": "vedic-rectifier",
            "path": str(get_skill_root()) if get_skill_root() else "",
            "mode": "local-fallback",
        },
        "references": [],
        "warning": reason,
    }


async def generate_birth_time_rectification(
    payload: BirthTimeRectifierRequest,
) -> dict[str, Any]:
    language = payload.language or "zh"
    guidance, references, root = load_rectifier_guidance(language)
    api_key = os.environ.get("DEEPSEEK_API_KEY", "").strip()
    model = os.environ.get("DEEPSEEK_MODEL", "deepseek-v4-flash").strip() or "deepseek-v4-flash"

    if not api_key:
        return _build_local_fallback(payload, "未配置 DeepSeek API Key")

    request_body = {
        "model": model,
        "temperature": 0.3,
        "max_tokens": 1400,
        "messages": _build_messages(payload, guidance),
    }

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                DEEPSEEK_API_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json=request_body,
            )
            response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        return _build_local_fallback(payload, f"DeepSeek 接口返回 {exc.response.status_code}")
    except httpx.HTTPError:
        return _build_local_fallback(payload, "DeepSeek 请求失败")

    payload_json = response.json()
    raw_text = payload_json["choices"][0]["message"]["content"].strip()
    normalized = _normalize_rectifier_payload(raw_text)
    normalized.update(
        {
            "model": payload_json.get("model", model),
            "skill_bundle": {
                "name": "vedic-rectifier",
                "path": str(root) if root else "",
                "mode": "deepseek",
            },
            "references": references,
        }
    )
    return normalized
