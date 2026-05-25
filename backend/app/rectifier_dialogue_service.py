import json
import os
from typing import Any

import httpx

from app.birth_time_rectifier_service import (
    DEEPSEEK_API_URL,
    _build_chart_snapshot,
    _build_local_fallback,
    _clean_text,
    _fmt,
    load_rectifier_guidance,
)
from app.schemas import BirthTimeRectifierDialogueRequest, BirthTimeRectifierRequest


# Multi-language support for dialogue
SYSTEM_PROMPTS = {
    "zh": (
        "你是 Chronos Architect，一位面向中文用户的吠陀占星出生时间校准助手。\n"
        "你必须遵循本地 vedic-rectifier skill 的方法：先收集重大人生事件，再根据盘面、事件和大运逻辑做出生时间逆推。\n"
        "你现在的任务是进行多轮对话，不是一次性结束。\n"
        "如果信息不足，就继续追问，直到你认为已经可以给出相对明确的出生时间建议。\n"
        "不要固定只问三题；问题数量由证据充分程度决定。\n"
        "每轮最多只问一个最有价值的问题，问题要具体、像真人访谈。\n"
        "当你已经足够有把握时，should_continue 必须返回 false，并给出 suggested_time、time_range、summary、rationale、next_steps。\n"
        "当你还不够确定时，should_continue 返回 true，suggested_time 和 time_range 可以留空。\n"
        "你可以查看用户当前生成的星盘信息，包括上升星座、月亮星座、太阳星座、十二宫位、行星位置、当前大运等关键信息。\n"
        "在与用户对话时，你可以参考当前的星盘信息来提出有针对性的问题，或者解释星盘中的配置如何与人生事件相关联。\n"
        "输出必须严格是 JSON 对象，包含这些键："
        "assistant_message、should_continue、confidence、suggested_time、time_range、summary、rationale、next_steps、events。\n"
        "confidence 只能是 low / medium / high。\n"
        "events 必须是数组，每项包含 title、date_hint、description。\n"
        "你可以对已有事件做整理、合并和改写，但不能编造用户没说过的事实。\n"
        "assistant_message 里不要出现任何 Markdown 符号，不要输出代码块，不要用星号、井号等符号。\n"
        "【语言适配规则】：请留意用户使用的语言，如果用户开始使用英文或其他语言，你也要相应切换到同一种语言进行回复。这是一个柔性规则，优先考虑用户的语言偏好。\n\n"
    ),
    "en": (
        "You are Chronos Architect, a Vedic Astrology birth time rectification assistant for English users.\n"
        "You must follow the approach from the local vedic-rectifier skill: first collect major life events, then rectify birth time based on chart, events, and dasha logic.\n"
        "Your task now is to conduct a multi-turn conversation, not end in one go.\n"
        "If information is insufficient, keep asking until you think you can give a relatively clear birth time suggestion.\n"
        "Don't just fix on asking three questions; the number of questions is determined by the sufficiency of evidence.\n"
        "At most ask one most valuable question per turn, the question should be specific, like a real person interview.\n"
        "When you are confident enough, should_continue must return false, and give suggested_time, time_range, summary, rationale, next_steps.\n"
        "When you are not yet sure enough, should_continue returns true, suggested_time and time_range can be left empty.\n"
        "You can view the user's currently generated chart information, including Ascendant, Moon sign, Sun sign, 12 houses, planetary positions, current Dasha, and other key information.\n"
        "When conversing with the user, you can refer to the current chart information to ask targeted questions or explain how chart configurations relate to life events.\n"
        "Output must strictly be a JSON object containing these keys:"
        "assistant_message, should_continue, confidence, suggested_time, time_range, summary, rationale, next_steps, events.\n"
        "confidence can only be low / medium / high.\n"
        "events must be an array, each containing title, date_hint, description.\n"
        "You can organize, merge, and rephrase existing events, but cannot fabricate facts the user hasn't mentioned.\n"
        "assistant_message must not contain any Markdown symbols, don't output code blocks, don't use asterisks, hash symbols, etc.\n"
        "LANGUAGE ADAPTATION RULE: Pay attention to the language the user uses. If the user starts using Chinese or another language, switch to the same language for your replies. This is a flexible rule that prioritizes the user's language preference.\n\n"
    ),
    "hi": (
        "आप Chronos Architect हैं, हिंदी उपयोगकर्ताओं के लिए एक वैदिक ज्योतिष जन्म समय सुधार सहायक हैं।\n"
        "आपको स्थानीय vedic-rectifier स्किल के दृष्टिकोण का पालन करना चाहिए: पहले प्रमुख जीवन घटनाओं को एकत्र करें, फिर कुंडली, घटनाओं और दशा तर्क के आधार पर जन्म समय को सुधारें।\n"
        "आपका कार्य अब मल्टी-टर्न वार्तालाप करना है, एक ही बार में समाप्त नहीं करना।\n"
        "यदि जानकारी अपर्याप्त है, तो तब तक पूछते रहें जब तक आप यह न समझें कि आप अपेक्षाकृत स्पष्ट जन्म समय सुझाव दे सकते हैं।\n"
        "केवल तीन प्रश्न पूछने को मत बनाएं; प्रश्नों की संख्या साक्ष्य की पर्याप्तता द्वारा निर्धारित होती है।\n"
        "प्रति टर्न अधिकतम एक सबसे मूल्यवान प्रश्न पूछें, प्रश्न विशिष्ट होना चाहिए, एक वास्तविक व्यक्ति के साक्षात्कार की तरह।\n"
        "जब आप पर्याप्त आश्वस्त हों, तो should_continue को false लौटाना चाहिए, और suggested_time, time_range, summary, rationale, next_steps दें।\n"
        "जब आप अभी तक आश्वस्त नहीं हैं, तो should_continue true लौटाता है, suggested_time और time_range को खाली छोड़ा जा सकता है।\n"
         "आप उपయోగకర్త కి వర్తమానంగా ఉత్పత్తి చేసిన చార్ట్ సమాచారాన్ని చూడవచ్చు, దీనిలో అస్సెండెంట్, చంద్ర రాశి, సూర్య రాశి, 12 భవాలు, గ్రహ స్థానాలు, ప్రస్తుత దశ మరియు ఇతర ముఖ్య సమాచారాలు ఉన్నాయి.\n"
        "వినియోగకర్తతో మాట్లాడుతున్నప్పుడు, మీరు లక్ష్యప్రేత ప్రశ్నలను అడగడానికి ప్రస్తుత చార్ట్ సమాచారాన్ని సూచించవచ్చు లేదా చార్ట్ కాన్ఫిగరేషన్లు జీవిత సంఘటనలతో ఎలా సంబంధించినవో వివరించవచ్చు.\n"
        "आउटपुट सख्ती से एक JSON ऑब्जेक्ट होना चाहिए, जिसमें ये कुंजियाँ हों:"
        "assistant_message, should_continue, confidence, suggested_time, time_range, summary, rationale, next_steps, events.\n"
        "confidence केवल low / medium / high हो सकता है।\n"
        "events एक सरणी होना चाहिए, प्रत्येक में title, date_hint, description हों।\n"
        "आप मौजूदा घटनाओं को व्यवस्थित, मर्ज और पुनर्व्याख्या कर सकते हैं, लेकिन उपयोगकर्ता द्वारा उल्लिखित नहीं की गई तथ्यों का निर्माण नहीं कर सकते हैं।\n"
        "assistant_message में कोई Markdown प्रतीक नहीं होना चाहिए, कोड ब्लॉक आउटपुट न करें, तारांक, हैश प्रतीक आदि का उपयोग न करें।\n"
        "भाषा अनुकूलन नियम: उपयोगकर्ता द्वारा उपयोग की जा रही भाषा पर ध्यान दें। यदि उपयोगकर्ता चीनी या किसी अन्य भाषा का उपयोग करना शुरू कर देता है, तो अपने उत्तरों के लिए उसी भाषा में स्विच करें। यह एक लचीला नियम है जो उपयोगकर्ता की भाषा प्राथमिकता को प्राथमिकता देता है।\n\n"
    ),
}

FIRST_DIALOGUE_PROMPTS = {
    "zh": (
        "这是第一次对话，没有历史消息。\n\n"
        "请作为友好的校时助手，给用户发第一条消息。\n"
        "你的第一个问题应该是友好、具体的，围绕迁移、升学、职业、关系、健康、父母家庭冲击、重大财务波动这些高区分度事件。\n"
        "让用户先提供一两个事件作为起点。\n"
        "assistant_message 要自然，像真人聊天一样。\n"
    ),
    "en": (
        "This is the first conversation, no history messages.\n\n"
        "Please send the first message to the user as a friendly time rectification assistant.\n"
        "Your first question should be friendly and specific, around high-distinction events like relocation, education, career, relationships, health, family shocks, major financial changes.\n"
        "Ask the user to provide one or two events as a starting point.\n"
        "assistant_message should be natural, like real person chatting.\n"
    ),
    "hi": (
        "यह पहली बातचीत है, कोई इतिहास संदेश नहीं है।\n\n"
        "कृपया एक मित्रवत समय सुधार सहायक के रूप में उपयोगकर्ता को पहला संदेश भेजें।\n"
        "आपका पहला प्रश्न मित्रवत और विशिष्ट होना चाहिए, स्थानांतरण, शिक्षा, करियर, संबंध, स्वास्थ्य, परिवार के झटके, प्रमुख वित्तीय परिवर्तन जैसी उच्च-भेद घटनाओं के आसपास होना चाहिए।\n"
        "उपयोगकर्ता से एक प्रारंभिक बिंदु के रूप में एक या दो घटनाएं प्रदान करने के लिए कहें।\n"
        "assistant_message प्राकृतिक होना चाहिए, एक वास्तविक व्यक्ति की चैटिंग की तरह।\n"
    ),
}

NEXT_DIALOGUE_PROMPTS = {
    "zh": (
        "请基于以下盘面快照、已确认事件和历史对话，决定下一步是继续追问，还是给出最终校时结论。\n\n"
        "要求：\n"
        "1. 如果用户刚刚提供了新事实，请先把它整理进 events。\n"
        "2. 如果线索还不够，就继续问最关键的下一问，而不是泛泛地让用户多说一点。\n"
        "3. 如果你已经能给出时间建议，结论必须明确说明这是启发式推断还是相对高置信判断。\n"
        "4. 问题尽量围绕迁移、升学、职业、关系、健康、父母家庭冲击、重大财务波动这些高区分度事件。\n"
        "5. assistant_message 里不要出现任何 Markdown 符号，不要用星号、井号等。"
    ),
    "en": (
        "Please decide whether to continue asking questions or give final time rectification conclusion based on the following chart snapshot, confirmed events, and conversation history.\n\n"
        "Requirements:\n"
        "1. If the user just provided new facts, please first organize them into events.\n"
        "2. If clues are still insufficient, keep asking the most critical next question instead of vaguely asking the user to say more.\n"
        "3. If you can already give time suggestions, the conclusion must clearly state whether it's heuristic inference or relatively high-confidence judgment.\n"
        "4. Questions should be around high-distinction events like relocation, education, career, relationships, health, family shocks, major financial changes.\n"
        "5. assistant_message must not contain any Markdown symbols, don't use asterisks, hash symbols, etc."
    ),
    "hi": (
        "कृपया निम्नलिखित कुंडली स्नैपशॉट, पुष्टि की गई घटनाओं और वार्तालाप इतिहास के आधार पर निर्णय करें कि अगले प्रश्न पूछना जारी रखें या अंतिम समय सुधार निष्कर्ष दें।\n\n"
        "आवश्यकताएँ:\n"
        "1. यदि उपयोगकर्ता ने अभी-अभी नए तथ्य प्रदान किए हैं, तो कृपया पहले उन्हें events में व्यवस्थित करें।\n"
        "2. यदि सुराग अभी भी अपर्याप्त हैं, तो उपयोगकर्ता से अस्पष्ट रूप से अधिक कहने के बजाय सबसे महत्वपूर्ण अगला प्रश्न पूछते रहें।\n"
        "3. यदि आप पहले से ही समय सुझाव दे सकते हैं, तो निष्कर्ष में स्पष्ट रूप से बताना चाहिए कि यह हेयुरिस्टिक अनुमान है या अपेक्षाकृत उच्च-विश्वास निर्णय।\n"
        "4. प्रश्न स्थानांतरण, शिक्षा, करियर, संबंध, स्वास्थ्य, परिवार के झटके, प्रमुख वित्तीय परिवर्तन जैसी उच्च-भेद घटनाओं के आसपास होने चाहिए।\n"
        "5. assistant_message में कोई Markdown प्रतीक नहीं होना चाहिए, तारांक, हैश प्रतीक आदि का उपयोग न करें।"
    ),
}

LOCAL_FALLBACK_FINAL = {
    "zh": "我先根据当前事件做了一次保守校时结论。如果你还想继续缩小分钟范围，可以再补一两个高冲击事件。",
    "en": "I made a conservative time rectification conclusion based on current events. If you want to continue narrowing down the minute range, you can add one or two more high-impact events.",
    "hi": "मैंने वर्तमान घटनाओं के आधार पर एक रूढ़िवादी समय सुधार निष्कर्ष बनाया। यदि आप मिनट सीमा को कम करना जारी रखना चाहते हैं, तो आप एक या दो अधिक उच्च-प्रभाव घटनाओं को जोड़ सकते हैं।",
}

LOCAL_FALLBACK_CONTINUE = {
    "zh": "我已经记下你刚才的内容了。为了继续反推出生时间，请再说一个影响特别大的事件，最好带上年份或月份，比如搬家、升学、分手、重病、转行、亲人变故这一类。",
    "en": "I've noted what you just said. To continue rectifying birth time, please tell one more very impactful event, preferably with year or month, like moving, going to school, breaking up, serious illness, career change, family changes, etc.",
    "hi": "मैंने आपके द्वारा अभी कही गई बात को नोट कर लिया है। जन्म समय को सुधारना जारी रखने के लिए, कृपया एक और बहुत प्रभावशाली घटना बताएं, अधिमानतः वर्ष या महीने के साथ, जैसे कि घर बदलना, स्कूल जाना, टूटना, गंभीर बीमारी, करियर बदलना, परिवार में बदलाव आदि।",
}

NO_EVENTS_TEXT = {
    "zh": "暂无已确认事件。",
    "en": "No confirmed events yet.",
    "hi": "अभी तक कोई पुष्टि की गई घटना नहीं है।",
}

NO_HISTORY_TEXT = {
    "zh": "暂无历史对话。",
    "en": "No conversation history yet.",
    "hi": "अभी तक कोई वार्तालाप इतिहास नहीं है।",
}


def _build_event_block(events: list[dict[str, str]], language: str = "zh") -> str:
    if not events:
        return NO_EVENTS_TEXT.get(language, NO_EVENTS_TEXT["zh"])

    # Multi-language labels
    if language == "zh":
        title_label = "事件标题"
        date_hint_label = "时间提示"
        description_label = "事件描述"
    elif language == "en":
        title_label = "Event title"
        date_hint_label = "Date hint"
        description_label = "Event description"
    else:
        title_label = "घटना शीर्षक"
        date_hint_label = "तिथि संकेत"
        description_label = "घटना विवरण"

    lines: list[str] = []
    for index, event in enumerate(events, start=1):
        lines.append(
            f"{index}. {title_label}: {_fmt(event.get('title'))}\n   {date_hint_label}: {_fmt(event.get('date_hint'))}\n   {description_label}: {_fmt(event.get('description'))}"
        )
    return "\n".join(lines)


def _build_dialogue_block(messages: list[dict[str, str]], language: str = "zh") -> str:
    if not messages:
        return NO_HISTORY_TEXT.get(language, NO_HISTORY_TEXT["zh"])

    role_texts = {
        "zh": {"assistant": "AI", "user": "用户"},
        "en": {"assistant": "AI", "user": "User"},
        "hi": {"assistant": "AI", "user": "उपयोगकर्ता"},
    }
    roles = role_texts.get(language, role_texts["zh"])
    
    return "\n".join(
        f"{roles.get(message.get('role', 'user'), 'User')}: {_fmt(message.get('content', ''))}"
        for message in messages
    )


def _normalize_events(raw_events: Any) -> list[dict[str, str]]:
    if not isinstance(raw_events, list):
        return []

    normalized: list[dict[str, str]] = []
    for item in raw_events:
        if not isinstance(item, dict):
            continue
        title = _fmt(item.get("title"), "")
        description = _fmt(item.get("description"), "")
        if not title or not description:
            continue
        normalized.append(
            {
                "title": title[:80],
                "date_hint": _fmt(item.get("date_hint"), "")[:40],
                "description": description[:240],
            }
        )
    return normalized


FALLBACK_MESSAGES = {
    "zh": "我会记录你刚才说的内容。为了更准确地校正出生时间，请继续添加下一个真正改变人生的事件，最好带有年份或月份。",
    "en": "I'll note what you just said. To more accurately rectify birth time, please continue adding the next truly life-changing event, preferably with year or month.",
    "hi": "मैं आपके अभी जिस बात को कहा है उसे नोट कर लूंगा। जन्म के समय को अधिक सटीक रूप से सुधारने के लिए, कृपया अगली वास्तविक जीवन-परिवर्तनकारी घटना जोड़ना जारी रखें, अधिमानतः वर्ष या महीने के साथ।",
}

def _normalize_dialogue_payload(raw_text: str, language: str = "zh") -> dict[str, Any]:
    fallback = {
        "assistant_message": FALLBACK_MESSAGES.get(language, FALLBACK_MESSAGES["en"]),
        "should_continue": True,
        "confidence": "low",
        "suggested_time": "",
        "time_range": "",
        "summary": raw_text.strip(),
        "rationale": [],
        "next_steps": [],
        "events": [],
    }

    try:
        parsed = json.loads(raw_text)
    except json.JSONDecodeError:
        return fallback

    if not isinstance(parsed, dict):
        return fallback

    return {
        "assistant_message": _fmt(parsed.get("assistant_message"), fallback["assistant_message"]),
        "should_continue": bool(parsed.get("should_continue", True)),
        "confidence": _fmt(parsed.get("confidence"), "low"),
        "suggested_time": _fmt(parsed.get("suggested_time"), ""),
        "time_range": _fmt(parsed.get("time_range"), ""),
        "summary": _fmt(parsed.get("summary"), ""),
        "rationale": parsed.get("rationale") if isinstance(parsed.get("rationale"), list) else [],
        "next_steps": parsed.get("next_steps") if isinstance(parsed.get("next_steps"), list) else [],
        "events": _normalize_events(parsed.get("events")),
    }


def _build_messages(payload: BirthTimeRectifierDialogueRequest, guidance: str) -> list[dict[str, str]]:
    language = payload.language or "zh"
    system_prompt = SYSTEM_PROMPTS.get(language, SYSTEM_PROMPTS["zh"])
    
    # Add strict language usage instruction for the first message
    if language == "zh":
        language_instruction = (
            "【重要：你的第一条回复必须100%使用中文，绝对不能使用任何其他语言的文字！】\n"
            "即使在某些情况下你看到英文或其他语言的内容，也请你全部用中文回复。\n"
            "assistant_message 必须完全用中文书写。\n\n"
        )
        system_prompt += f"{language_instruction}本地 rectifier 说明\n{guidance}"
    elif language == "en":
        language_instruction = (
            "CRITICAL: Your first reply must be in English only. Do not use any Chinese or other languages!\n"
            "Even if you see content in other languages, please reply entirely in English.\n"
            "assistant_message must be written completely in English.\n\n"
        )
        system_prompt += f"{language_instruction}Local rectifier instructions\n{guidance}"
    else:
        language_instruction = (
            "महत्वपूर्ण: आपकी पहली प्रतिक्रिया केवल हिंदी में होनी चाहिए। कोई चीनी या अन्य भाषाओं का उपयोग न करें!\n"
            "यहां तक कि यदि आप अन्य भाषाओं में सामग्री देखते हैं, तो कृपया पूरी तरह से हिंदी में ही उत्तर दें।\n"
            "assistant_message पूरी तरह से हिंदी में लिखा जाना चाहिए।\n\n"
        )
        system_prompt += f"{language_instruction}स्थानीय rectifier निर्देश\n{guidance}"

    # Determine if it's the first conversation (no history messages)
    is_first_dialogue = len(payload.messages) == 0
    
    if is_first_dialogue:
        first_prompt = FIRST_DIALOGUE_PROMPTS.get(language, FIRST_DIALOGUE_PROMPTS["zh"])
        user_prompt = (
            first_prompt.split("\n\n")[0] + "\n\n"
            f"当前盘面快照\n{_build_chart_snapshot(payload.chart, payload.location_name, language)}\n\n"
            + "\n\n".join(first_prompt.split("\n\n")[1:])
        )
    else:
        next_prompt = NEXT_DIALOGUE_PROMPTS.get(language, NEXT_DIALOGUE_PROMPTS["zh"])
        user_prompt = (
            next_prompt.split("\n\n")[0] + "\n\n"
            f"当前盘面快照\n{_build_chart_snapshot(payload.chart, payload.location_name, language)}\n\n"
            f"已确认事件\n{_build_event_block([event.model_dump() for event in payload.extracted_events], language)}\n\n"
            f"历史对话\n{_build_dialogue_block([message.model_dump() for message in payload.messages], language)}\n\n"
            + "\n\n".join(next_prompt.split("\n\n")[1:])
        )

    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]


def _build_local_dialogue_fallback(
    payload: BirthTimeRectifierDialogueRequest, reason: str
) -> dict[str, Any]:
    language = payload.language or "zh"
    events = [event.model_dump() for event in payload.extracted_events]
    if len(events) >= 4:
        final = _build_local_fallback(
            BirthTimeRectifierRequest(
                location_name=payload.location_name,
                chart=payload.chart,
                life_events=payload.extracted_events[:5],
                language=language,
            ),
            reason,
        )
        final.update(
            {
                "assistant_message": LOCAL_FALLBACK_FINAL.get(language, LOCAL_FALLBACK_FINAL["zh"]),
                "should_continue": False,
                "events": events,
            }
        )
        return final

    return {
        "assistant_message": LOCAL_FALLBACK_CONTINUE.get(language, LOCAL_FALLBACK_CONTINUE["zh"]),
        "should_continue": True,
        "confidence": "low",
        "suggested_time": "",
        "time_range": "",
        "summary": "",
        "rationale": [],
        "next_steps": [],
        "events": events,
        "model": "local-rectifier-dialogue-fallback",
        "skill_bundle": {
            "name": "vedic-rectifier",
            "path": "",
            "mode": "local-fallback",
        },
        "references": [],
        "warning": reason,
    }


async def generate_birth_time_rectifier_dialogue(
    payload: BirthTimeRectifierDialogueRequest,
) -> dict[str, Any]:
    language = payload.language or "zh"
    guidance, references, root = load_rectifier_guidance(language)
    api_key = os.environ.get("DEEPSEEK_API_KEY", "").strip()
    model = os.environ.get("DEEPSEEK_MODEL", "deepseek-v4-flash").strip() or "deepseek-v4-flash"

    if not api_key:
        return _build_local_dialogue_fallback(payload, "未配置 DeepSeek API Key")

    request_body = {
        "model": model,
        "temperature": 0.35,
        "max_tokens": 3000,
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
        return _build_local_dialogue_fallback(payload, f"DeepSeek 接口返回 {exc.response.status_code}")
    except httpx.HTTPError:
        return _build_local_dialogue_fallback(payload, "DeepSeek 请求失败")

    payload_json = response.json()
    raw_text = payload_json["choices"][0]["message"]["content"].strip()
    # Thoroughly clean all extra symbols
    raw_text = raw_text.replace("#", "")
    raw_text = raw_text.replace("*", "")
    raw_text = raw_text.replace("**", "")
    raw_text = raw_text.replace("`", "")
    raw_text = raw_text.replace("```", "")
    raw_text = raw_text.replace("---", "")
    raw_text = raw_text.replace("===", "")
    raw_text = raw_text.replace("__", "")
    raw_text = raw_text.replace("~", "")
    normalized = _normalize_dialogue_payload(raw_text, language)
    # Clean assistant_message one more time
    if normalized.get("assistant_message"):
        normalized["assistant_message"] = normalized["assistant_message"].replace("#", "").replace("*", "").replace("**", "")
    if not normalized["events"]:
        normalized["events"] = [event.model_dump() for event in payload.extracted_events]
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
