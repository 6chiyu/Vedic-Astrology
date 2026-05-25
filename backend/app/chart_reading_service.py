import os
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path
from typing import Any, Literal

import httpx

from app.schemas import ChartReadingRequest


# 类型定义
type Language = Literal["zh", "en", "hi"]
type Focus = Literal["core", "career", "love"]

# API配置
DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"
DEFAULT_TIMEOUT = 120.0  # 超时时间（秒）

# 提示词配置
DEFAULT_QUESTIONS: dict[Language, dict[Focus, str]] = {
    "zh": {
        "core": "请基于这张印度星盘做一份整体解读，重点说明核心性格、优势、风险和下一步观察重点。",
        "career": "请基于这张印度星盘做一份事业解读，重点说明职业结构、适合的方向、当前阶段和行动建议。",
        "love": "请基于这张印度星盘做一份感情解读，重点说明关系模式、伴侣主题、当前窗口和行动建议。",
    },
    "en": {
        "core": "Please provide a comprehensive interpretation of this Vedic birth chart, focusing on core personality traits, strengths, risks, and key areas to observe next.",
        "career": "Please provide a career interpretation of this Vedic birth chart, focusing on career structure, suitable directions, current stage, and actionable recommendations.",
        "love": "Please provide a relationship interpretation of this Vedic birth chart, focusing on relationship patterns, partnership themes, current timing, and actionable suggestions.",
    },
    "hi": {
        "core": "कृपया इस वैदिक जन्म कुंडली का व्यापक व्याख्यान प्रदान करें, मुख्य व्यक्तित्व लक्षणों, शक्तियों, जोखिमों और अगले प्रमुख क्षेत्रों पर ध्यान केंद्रित करें।",
        "career": "कृपया इस वैदिक जन्म कुंडली का करियर व्याख्यान प्रदान करें, करियर संरचना, उपयुक्त दिशाओं, वर्तमान चरण और क्रियात्मक सिफारिशों पर ध्यान केंद्रित करें।",
        "love": "कृपया इस वैदिक जन्म कुंडली का संबंध व्याख्यान प्रदान करें, संबंध पैटर्न, साझेदारी विषयों, वर्तमान समय और क्रियात्मक सुझावों पर ध्यान केंद्रित करें।",
    },
}

SYSTEM_PROMPTS: dict[Language, str] = {
    "zh": (
        "你是一位温和、专业的印度占星解读顾问，服务中文用户。"
        "【重要：所有回复必须100%使用中文，绝对不能使用任何其他语言的文字！】"
        "你必须严格遵守本地技能包里的审慎、反确认偏误、语言风格和输出规则。"
        "你只能依据用户提供的星盘事实做推断，不能编造没有给出的行星、宫位、相位、分盘或人生经历。"
        "如果数据不足，必须明确说明不确定性。"
        "回答使用中文，语言要自然、优美、温暖，避免生硬的技术堆砌。"
        "绝对禁止使用任何Markdown符号：不要用井号、不要用星号、不要用反引号、不要用破折号、不要用加粗、不要用斜体、不要用列表标记。"
        "输出内容必须完整、流畅，确保段落清晰，每个段落表达一个完整的意思。"
        "段落之间用空行分隔，不要用任何符号标记段落或标题。"
        "优先结构为：核心判断 / 为什么 / 建议。"
        "如果是事业或感情焦点，要优先围绕该主题，但仍然要从整张盘出发。"
    ),
    "en": (
        "You are a gentle and professional Vedic Astrology reading consultant serving English users. "
        "[CRITICAL INSTRUCTION: YOUR ENTIRE RESPONSE MUST BE IN ENGLISH ONLY! NO CHINESE, NO HINDI, NO OTHER LANGUAGES ALLOWED! "
        "EVERY SINGLE WORD YOU WRITE MUST BE ENGLISH! "
        "You must strictly follow the prudence, anti-confirmation bias, language style, and output rules from the local skill package. "
        "You can only make inferences based on the chart facts provided by the user; you cannot make up planets, houses, aspects, divisional charts, or life experiences that were not given. "
        "If data is insufficient, you must clearly state the uncertainty. "
        "Respond in ENGLISH ONLY, with natural, beautiful, and warm language, avoiding rigid technical jargon. "
        "Strictly forbidden to use any Markdown symbols: no hashtags, no asterisks, no backticks, no dashes, no bold, no italics, no list markers. "
        "The output must be complete and fluent, ensuring clear paragraphs where each paragraph expresses a complete thought. "
        "Separate paragraphs with blank lines, without using any symbols to mark paragraphs or headings. "
        "Preferred structure: Core judgment / Why / Recommendations. "
        "If focusing on career or love, prioritize that theme but still start from the whole chart."
    ),
    "hi": (
        "आप एक सौम्य और पेशेवर वैदिक ज्योतिष वाचन सलाहकार हैं जो हिंदी उपयोगकर्ताओं की सेवा करते हैं। "
        "आपको स्थानीय कौशल पैकेज के विवेक, एंटी-कॉन्फिर्मेशन बायस, भाषा शैली और आउटपुट नियमों का सख्ती से पालन करना चाहिए। "
        "आप केवल उपयोगकर्ता द्वारा प्रदान किए गए कुंडली तथ्यों के आधार पर अनुमान लगा सकते हैं; आप दिए गए नहीं गए ग्रहों, भावों, संबंधों, विभाजक चार्टों या जीवन अनुभवों को नहीं बना सकते हैं। "
        "यदि डेटा अपर्याप्त है, तो आपको स्पष्ट रूप से अनिश्चितता को कहना चाहिए। "
        "हिंदी में उत्तर दें, स्वाभाविक, सुंदर और गर्म भाषा के साथ, कठोर तकनीकी शब्दावली से बचें। "
        "किसी भी Markdown प्रतीक का प्रयोग सख्त वर्जित है: हैश नंबर, तारक, बैकटिक, डैश, बोल्ड, इटैलिक या सूची चिह्न न का प्रयोग करें। "
        "आउटपुट पूर्ण और प्रवाहमय होना चाहिए, स्पष्ट अनुच्छेदों को सुनिश्चित करना चाहिए जहां प्रत्येक अनुच्छेद एक पूर्ण विचार व्यक्त करता है। "
        "ब्लैंक लाइनों से अनुच्छेदों को अलग करें, अनुच्छेदों या शीर्षकों को चिह्नित करने के लिए किसी भी प्रतीक का प्रयोग न करें। "
        "प्राथमिकता संरचना: मुख्य निर्णय / क्यों / सिफारिशें। "
        "यदि करियर या प्रेम पर ध्यान केंद्रित है, तो उस विषय को प्राथमिकता दें, लेकिन फिर भी पूरी कुंडली से शुरू करें।"
    ),
}

USER_PROMPTS = {
    "zh": (
        "1. 先给一个简短但有温度的结论段。\n"
        "2. 再给 3-5 条证据与逻辑，每条都要引用上面的盘面事实。\n"
        "3. 最后给 2-3 条务实建议。\n"
        "4. 语言要优美自然，绝对禁止使用任何Markdown符号：不要用井号、不要用星号、不要用反引号、不要用破折号。\n"
        "5. 不要假装你看到了未提供的原始截图、PDF 或用户传记。\n"
        "6. 输出必须完整，不要提前截断。\n"
    ),
    "en": (
        "1. First give a brief but warm conclusion paragraph.\n"
        "2. Then give 3-5 evidence and logic points, each referencing the chart facts above.\n"
        "3. Finally give 2-3 practical suggestions.\n"
        "4. Language should be beautiful and natural, strictly prohibited from using any Markdown symbols: no hashtags, no asterisks, no backticks, no dashes.\n"
        "5. Do not pretend you see original screenshots, PDFs, or user biographies that were not provided.\n"
        "6. The output must be complete, do not truncate early.\n"
    ),
    "hi": (
        "1. पहले एक संक्षिप्त लेकिन गर्म निष्कर्ष अनुच्छेद दें।\n"
        "2. फिर 3-5 प्रमाण और तर्क बिंदु दें, प्रत्येक ऊपर दिए गए कुंडली तथ्यों का संदर्भ दें।\n"
        "3. अंत में 2-3 व्यावहारिक सुझाव दें।\n"
        "4. भाषा सुंदर और स्वाभाविक होनी चाहिए, किसी भी Markdown प्रतीक का प्रयोग सख्त वर्जित है: हैश, तारक, बैकटिक, डैश न का प्रयोग करें।\n"
        "5. यह मत कहें कि आपने मूल स्क्रीनशॉट, PDF या उपयोगकर्ता जीवनी देखे हैं जो प्रदान नहीं किए गए थे।\n"
        "6. आउटपुट पूर्ण होना चाहिए, समय से पहले न काटें।\n"
    ),
}

CHART_FACTS_LANG = {
    "zh": {
        "basic_profile": "基础档案",
        "name": "姓名",
        "birth_date": "出生日期",
        "birth_time": "出生时间",
        "birth_location": "出生地点",
        "latitude": "纬度",
        "longitude": "经度",
        "timezone": "时区",
        "core_summary": "核心摘要",
        "ascendant": "上升星座",
        "moon_sign": "月亮星座",
        "sun_sign": "太阳星座",
        "tithi": "Tithi",
        "current_dasha": "当前大运",
        "engine": "排盘引擎",
        "twelve_houses": "十二宫位",
        "house": "第",
        "house_suffix": "宫",
        "sign": "星座",
        "lord": "宫主",
        "lord_placement": "宫主落点",
        "sign_degrees": "宫头度数",
        "nakshatra": "Nakshatra",
        "pada": "Pada",
        "nakshatra_deity": "月宿主神",
        "occupants": "落入行星",
        "none": "无",
        "nine_planets": "九大行星",
        "degrees": "度数",
        "motion": "运动",
        "dignity": "Dignity",
        "lordships": "主宰宫位",
        "conjuncts": "合相",
        "shadbala": "Shadbala",
        "divisional_charts": "分盘与阶段",
        "asc": "Asc",
        "source_house": "源自第",
        "theme": "主题",
        "no_divisional": "暂无可用分盘摘要",
        "key_observations": "重点观察位",
        "house_10": "第10宫",
        "house_7": "第7宫",
        "d9_asc": "D9分盘Asc",
        "d10_asc": "D10分盘Asc",
    },
    "en": {
        "basic_profile": "Basic Profile",
        "name": "Name",
        "birth_date": "Birth Date",
        "birth_time": "Birth Time",
        "birth_location": "Birth Location",
        "latitude": "Latitude",
        "longitude": "Longitude",
        "timezone": "Timezone",
        "core_summary": "Core Summary",
        "ascendant": "Ascendant",
        "moon_sign": "Moon Sign",
        "sun_sign": "Sun Sign",
        "tithi": "Tithi",
        "current_dasha": "Current Dasha",
        "engine": "Chart Engine",
        "twelve_houses": "Twelve Houses",
        "house": "House",
        "house_suffix": "",
        "sign": "Sign",
        "lord": "Lord",
        "lord_placement": "Lord Placement",
        "sign_degrees": "Sign Degrees",
        "nakshatra": "Nakshatra",
        "pada": "Pada",
        "nakshatra_deity": "Nakshatra Deity",
        "occupants": "Occupants",
        "none": "None",
        "nine_planets": "Nine Planets",
        "degrees": "Degrees",
        "motion": "Motion",
        "dignity": "Dignity",
        "lordships": "Lordships",
        "conjuncts": "Conjuncts",
        "shadbala": "Shadbala",
        "divisional_charts": "Divisional Charts & Timing",
        "asc": "Asc",
        "source_house": "From House",
        "theme": "Theme",
        "no_divisional": "No divisional chart summary available",
        "key_observations": "Key Observations",
        "house_10": "House 10",
        "house_7": "House 7",
        "d9_asc": "D9 Chart Asc",
        "d10_asc": "D10 Chart Asc",
    },
    "hi": {
        "basic_profile": "मूल प्रोफाइल",
        "name": "नाम",
        "birth_date": "जन्म तिथि",
        "birth_time": "जन्म समय",
        "birth_location": "जन्म स्थान",
        "latitude": "अक्षांश",
        "longitude": "देशांतर",
        "timezone": "समय क्षेत्र",
        "core_summary": "मुख्य सारांश",
        "ascendant": "लग्न",
        "moon_sign": "चंद्र राशि",
        "sun_sign": "सूर्य राशि",
        "tithi": "तिथि",
        "current_dasha": "वर्तमान दशा",
        "engine": "चार्ट इंजन",
        "twelve_houses": "बारह घर",
        "house": "घर",
        "house_suffix": "",
        "sign": "राशि",
        "lord": "स्वामी",
        "lord_placement": "स्वामी का स्थान",
        "sign_degrees": "राशि डिग्री",
        "nakshatra": "नक्षत्र",
        "pada": "पद",
        "nakshatra_deity": "नक्षत्र देवता",
        "occupants": "वासी",
        "none": "कोई नहीं",
        "nine_planets": "नौ ग्रह",
        "degrees": "डिग्री",
        "motion": "गति",
        "dignity": "डिग्निटी",
        "lordships": "स्वामित्व",
        "conjuncts": "संयोग",
        "shadbala": "षडबल",
        "divisional_charts": "विभाजक चार्ट और समय",
        "asc": "लग्न",
        "source_house": "से घर",
        "theme": "विषय",
        "no_divisional": "कोई विभाजक चार्ट सारांश उपलब्ध नहीं",
        "key_observations": "मुख्य अवलोकन",
        "house_10": "घर 10",
        "house_7": "घर 7",
        "d9_asc": "D9 चार्ट लग्न",
        "d10_asc": "D10 चार्ट लग्न",
    },
}

LOCAL_FALLBACKS = {
    "zh": {
        "prefix": "这是本地兜底模式下的",
        "suffix": "摘要。",
        "reason": "说明：当前已切换为本地解读兜底，因为",
        "core": "整体解读建议先把静态结构和时间节奏拆开看：先看上升、月亮、太阳定义底色，再用 Panchanga 与 Dasha 判断当前更容易落地的主题。",
        "chart_info": "这张盘当前最先要看的核心标签是：上升 {lagna_sign}、月亮 {moon_sign}、太阳 {sun_sign}、Nakshatra {nakshatra}。",
        "dasha_info": "时间层上，目前显示的大运阶段是 {dasha_current}，所以所有判断都要带着当前节奏去看，而不是只看静态结构。",
        "career_info": "事业先看第10宫与 D10。当前第10宫落在 {tenth_house_sign}，D10 上升是 {d10_ascendant}。这更适合先判断职业角色和社会呈现方式，再细看具体岗位。",
        "love_info": "感情先看第7宫与 D9。当前第7宫落在 {seventh_house_sign}，D9 上升是 {d9_ascendant}。这更适合先判断关系模式和承诺方式，再谈具体时间窗口。",
    },
    "en": {
        "prefix": "This is a summary in local fallback mode for",
        "suffix": ".",
        "reason": "Note: Currently switched to local reading fallback because",
        "core": "For overall interpretation, it's recommended to first separate static structure and timing rhythm: first look at Ascendant, Moon, Sun to define the foundation, then use Panchanga and Dasha to determine more easily actionable themes.",
        "chart_info": "The key tags to look at first for this chart are: Ascendant {lagna_sign}, Moon {moon_sign}, Sun {sun_sign}, Nakshatra {nakshatra}.",
        "dasha_info": "On the timing level, the current dasha period shown is {dasha_current}, so all judgments should be made with this current rhythm in mind, not just looking at static structure.",
        "career_info": "For career, first look at the 10th house and D10. Currently the 10th house is in {tenth_house_sign}, D10 ascendant is {d10_ascendant}. This is more suitable for first judging career role and social presentation, then looking at specific positions.",
        "love_info": "For relationships, first look at the 7th house and D9. Currently the 7th house is in {seventh_house_sign}, D9 ascendant is {d9_ascendant}. This is more suitable for first judging relationship patterns and commitment style, then talking about specific timing windows.",
    },
    "hi": {
        "prefix": "यह स्थानीय फॉलबैक मोड में एक सारांश है",
        "suffix": ".",
        "reason": "नोट: वर्तमान में स्थानीय वाचन फॉलबैक पर स्विच किया गया है क्योंकि",
        "core": "समग्र व्याख्यान के लिए, पहले स्थैतिक संरचना और समय ताल को अलग करने की सिफारिश की जाती है: पहले लग्न, चंद्रमा, सूर्य को देखें ताकि नींव निर्धारित हो, फिर पंचांग और दशा का उपयोग करें ताकि अधिक आसानी से कार्यात्मक विषय निर्धारित हों।",
        "chart_info": "इस चार्ट को पहले देखने के लिए मुख्य टैग हैं: लग्न {lagna_sign}, चंद्रमा {moon_sign}, सूर्य {sun_sign}, नक्षत्र {nakshatra}।",
        "dasha_info": "समय स्तर पर, वर्तमान में दिखाया गया दशा काल {dasha_current} है, इसलिए सभी निर्णय इस वर्तमान ताल को ध्यान में रखकर किए जाने चाहिए, न कि केवल स्थैतिक संరचना को देखकर।",
        "career_info": "करियर के लिए, पहले 10वें घर और D10 को देखें। वर्तमान में 10वां घर {tenth_house_sign} में है, D10 लग्न {d10_ascendant} है। यह करियर भूमिका और सामाजिक प्रस्तुति का पहले निर्णय करने के लिए अधिक उपयुक्त है, फिर विशिष्ट पदों को देखें।",
        "love_info": "संबंधों के लिए, पहले 7वें घर और D9 को देखें। वर्तमान में 7वां घर {seventh_house_sign} में है, D9 लग्न {d9_ascendant} है। यह संबंध पैटर्न और प्रतिबद्धता शैली का पहले निर्णय करने के लिए अधिक उपयुक्त है, फिर विशिष्ट समय खिड़कियों के बारे में बात करें।",
    },
}

SKILL_BUNDLE_FALLBACKS = {
    "zh": {
        "skill_not_found": "本地 vedic-astro-skills 未找到。请保持审慎原则，只根据提供的星盘事实进行解读，不要编造不存在的行星、宫位、相位或分盘结论。",
        "file_missing": "本地技能包已定位，但关键说明文件缺失。请保持审慎和反确认偏误原则，只根据提供的星盘事实进行解读。",
    },
    "en": {
        "skill_not_found": "Local vedic-astro-skills not found. Please maintain prudence principle, only interpret based on the provided chart facts, do not fabricate non-existent planets, houses, aspects or divisional chart conclusions.",
        "file_missing": "Local skill bundle located, but key documentation files missing. Please maintain prudence and anti-confirmation bias principles, only interpret based on the provided chart facts.",
    },
    "hi": {
        "skill_not_found": "स्थानीय vedic-astro-skills नहीं मिला। कृपया विवेक सिद्धांत को बनाए रखें, केवल प्रदान किए गए चार्ट तथ्यों के आधार पर व्याख्यान करें, गैर-मौजूद ग्रहों, घरों, पहलूओं या विभाजक चार्ट निष्कर्षों को गढ़ें नहीं।",
        "file_missing": "स्थानीय कौशल बंडल का पता लगाया गया है, लेकिन महत्वपूर्ण दस्तावेज़ फ़ाइलें गायब हैं। कृपया विवेक और एंटी-कॉन्फिर्मेशन बायस सिद्धांतों को बनाए रखें, केवल प्रदान किए गए चार्ट तथ्यों के आधार पर व्याख्यान करें।",
    },
}

SKILL_CONFIG = {
    "core": {
        "name": "vedic-core",
        "label": {
            "zh": "整体解读",
            "en": "Overall Reading",
            "hi": "समग्र व्याख्यान"
        },
        "files": [
            ("vedic-core/SKILL.md", 180),
            ("vedic-reader/resources/data_contract.md", 120),
        ],
    },
    "career": {
        "name": "vedic-career",
        "label": {
            "zh": "事业解读",
            "en": "Career Reading",
            "hi": "करियर व्याख్యాన"
        },
        "files": [
            ("vedic-career/SKILL.md", 160),
            ("vedic-core/SKILL.md", 100),
        ],
    },
    "love": {
        "name": "vedic-love",
        "label": {
            "zh": "感情解读",
            "en": "Love Reading",
            "hi": "प्रेम व్యాఖ్యాన"
        },
        "files": [
            ("vedic-love/SKILL.md", 160),
            ("vedic-core/SKILL.md", 100),
        ],
    },
}


@dataclass(frozen=True)
class SkillBundle:
    focus: str
    name: str
    label: str
    guidance: str
    references: list[dict[str, str]]
    root: Path | None


def _project_root() -> Path:
    return Path(__file__).resolve().parents[2]


def _clean_text(text: str) -> str:
    # 彻底清理所有多余的符号和优化文本
    if not text:
        return ""
    # 移除 BOM 头
    text = text.lstrip("\ufeff")
    # 移除所有特殊符号
    text = text.replace("\"\"\"", "")
    text = text.replace("```", "")
    text = text.replace("***", "")
    text = text.replace("---", "")
    text = text.replace("====", "")
    text = text.replace("##", "")
    text = text.replace("**", "")
    text = text.replace("*", "")
    text = text.replace("`", "")
    text = text.replace("#", "")
    text = text.replace("__", "")
    text = text.replace("~", "")
    # 清理多余的空行
    lines = text.splitlines()
    cleaned_lines = []
    for line in lines:
        line = line.strip()
        if line:
            cleaned_lines.append(line)
        else:
            # 保留单个空行
            if cleaned_lines and cleaned_lines[-1].strip():
                cleaned_lines.append("")
    # 清理首尾空行
    while cleaned_lines and not cleaned_lines[0].strip():
        cleaned_lines.pop(0)
    while cleaned_lines and not cleaned_lines[-1].strip():
        cleaned_lines.pop()
    return "\n".join(cleaned_lines).strip()


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


@lru_cache(maxsize=8)
def load_skill_bundle(focus: str, language: str = "zh") -> SkillBundle:
    config = SKILL_CONFIG[focus]
    root = get_skill_root()
    references: list[dict[str, str]] = []
    fallbacks = SKILL_BUNDLE_FALLBACKS.get(language, SKILL_BUNDLE_FALLBACKS["zh"])
    
    # 为不同语言设置技能文件的标题
    if language == "en":
        skill_file_title = "## Local Skill File"
    elif language == "hi":
        skill_file_title = "## स्थानीय कौशल फ़ाइल"
    else:
        skill_file_title = "## 本地技能文件"

    # 获取对应语言的标签
    label = config["label"].get(language, config["label"].get("zh", "解读"))
    
    if root is None:
        return SkillBundle(
            focus=focus,
            name=config["name"],
            label=label,
            guidance=fallbacks["skill_not_found"],
            references=references,
            root=None,
        )

    excerpts: list[str] = []
    for relative_path, max_lines in config["files"]:
        absolute_path = root / relative_path
        if not absolute_path.exists():
            continue
        excerpts.append(f"{skill_file_title}: {relative_path}\n{_read_excerpt(absolute_path, max_lines)}")
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

    return SkillBundle(
        focus=focus,
        name=config["name"],
        label=label,
        guidance=guidance,
        references=references,
        root=root,
    )


def _fmt(value: Any, fallback: str = "未识别") -> str:
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


def _find_house(chart_payload: dict[str, Any], house_number: int) -> dict[str, Any] | None:
    houses = chart_payload.get("chart", {}).get("houses", [])
    if not isinstance(houses, list):
        return None
    for house in houses:
        if isinstance(house, dict) and house.get("house") == house_number:
            return house
    return None


def _find_divisional_chart(chart_payload: dict[str, Any], chart_key: str) -> dict[str, Any] | None:
    divisional = chart_payload.get("chart", {}).get("divisional_charts", [])
    if not isinstance(divisional, list):
        return None
    for item in divisional:
        if isinstance(item, dict) and item.get("chart_key") == chart_key:
            return item
    return None


def _build_chart_facts(chart_payload: dict[str, Any], location_name: str, language: str = "zh") -> str:
    profile = chart_payload.get("profile", {})
    chart = chart_payload.get("chart", {})
    panchanga = chart_payload.get("panchanga", {})
    dasha = chart_payload.get("dasha", {})
    meta = chart_payload.get("meta", {})
    houses = chart.get("houses", [])
    planets = chart.get("planets", [])
    divisional = chart.get("divisional_charts", [])
    
    t = CHART_FACTS_LANG.get(language, CHART_FACTS_LANG["zh"])

    lines = [
        f"# {t['basic_profile']}",
        f"- {t['name']}: {_fmt(profile.get('name'), '访客')}",
        f"- {t['birth_date']}: {_fmt(profile.get('birth_date'))}",
        f"- {t['birth_time']}: {_fmt(profile.get('birth_time'))}",
        f"- {t['birth_location']}: {_fmt(location_name, t['none'])}",
        f"- {t['latitude']}: {_number(profile.get('latitude'))}",
        f"- {t['longitude']}: {_number(profile.get('longitude'))}",
        f"- {t['timezone']}: UTC{profile.get('timezone_offset', '')}",
        "",
        f"# {t['core_summary']}",
        f"- {t['ascendant']}: {_fmt(chart.get('lagna_sign'))}",
        f"- {t['moon_sign']}: {_fmt(chart.get('moon_sign'))}",
        f"- {t['sun_sign']}: {_fmt(chart.get('sun_sign'))}",
        f"- {t['nakshatra']}: {_fmt(panchanga.get('nakshatra'))}",
        f"- {t['tithi']}: {_fmt(panchanga.get('tithi'))}",
        f"- {t['current_dasha']}: {_fmt(dasha.get('current'))}",
        f"- {t['engine']}: {_fmt(meta.get('engine'))}",
        f"- Ayanamsa: {_fmt(meta.get('ayanamsa'))}",
        "",
        f"# {t['twelve_houses']}",
    ]

    if isinstance(houses, list):
        for house in houses:
            if not isinstance(house, dict):
                continue
            occupants = house.get("occupants", [])
            occupants_text = "、".join(str(item) for item in occupants) if occupants else t['none']
            house_num = _fmt(house.get('house'))
            if language == "en":
                house_label = f"{t['house']} {house_num}"
            elif language == "hi":
                house_label = f"{t['house']} {house_num}"
            else:
                house_label = f"{t['house']}{house_num}{t['house_suffix']}"
            
            lines.append(
                (
                    f"- {house_label}: {t['sign']}={_fmt(house.get('sign'))}; "
                    f"{t['lord']}={_fmt(house.get('lord'))}; {t['lord_placement']}={_fmt(house.get('lord_placed_sign'))}"
                )
            )
            if language == "en":
                lines[-1] += f"/{t['house']} {_fmt(house.get('lord_placed_house'))}; "
            elif language == "hi":
                lines[-1] += f"/{t['house']} {_fmt(house.get('lord_placed_house'))}; "
            else:
                lines[-1] += f"/{t['house']}{_fmt(house.get('lord_placed_house'))}{t['house_suffix']}; "
            
            lines[-1] += (
                f"{t['sign_degrees']}={_number(house.get('sign_degrees'))}; "
                f"{t['nakshatra']}={_fmt(house.get('nakshatra'))}; {t['pada']}={_fmt(house.get('pada'))}; "
                f"{t['nakshatra_deity']}={_fmt(house.get('nakshatra_deity'))}; "
                f"{t['occupants']}={occupants_text}; Bhava Bala={_number(house.get('bhava_bala'))}"
            )

    lines.extend(["", f"# {t['nine_planets']}"])
    if isinstance(planets, list):
        for planet in planets:
            if not isinstance(planet, dict):
                continue
            houses_text = ",".join(str(item) for item in planet.get("lordship_houses", [])) or t['none']
            planet_house = _fmt(planet.get('house'))
            if language == "en":
                planet_house_label = f"{t['house']} {planet_house}"
            elif language == "hi":
                planet_house_label = f"{t['house']} {planet_house}"
            else:
                planet_house_label = f"{t['house']}{planet_house}{t['house_suffix']}"
            
            lines.append(
                (
                    f"- {_fmt(planet.get('planet'))}: {planet_house_label}, {_fmt(planet.get('sign'))}, "
                    f"{t['degrees']}={_number(planet.get('degrees'))}, {t['nakshatra']}={_fmt(planet.get('nakshatra'))}, "
                    f"{t['pada']}={_fmt(planet.get('pada'))}, {t['nakshatra_deity']}={_fmt(planet.get('nakshatra_deity'))}, "
                    f"{t['motion']}={_fmt(planet.get('motion_type'))}, {t['dignity']}={_fmt(planet.get('dignity'))}, "
                    f"{t['lordships']}={houses_text}, {t['conjuncts']}={','.join(str(item) for item in planet.get('conjuncts', [])) or t['none']}, "
                    f"{t['shadbala']}={_number(planet.get('shadbala_total'))}/{_number(planet.get('shadbala_min_required'))}"
                )
            )

    lines.extend(["", f"# {t['divisional_charts']}"])
    if isinstance(divisional, list) and divisional:
        for item in divisional:
            if not isinstance(item, dict):
                continue
            source_house = _fmt(item.get('source_house'))
            if language == "en":
                source_label = f"{t['source_house']} {source_house}"
            elif language == "hi":
                source_label = f"{t['source_house']} {source_house}"
            else:
                source_label = f"{t['source_house']}{source_house}{t['house_suffix']}"
            
            lines.append(
                (
                    f"- {_fmt(item.get('label'))}: {t['asc']}={_fmt(item.get('ascendant_sign'))}, "
                    f"{source_label}, {t['theme']}={_fmt(item.get('focus'))}"
                )
            )
    else:
        lines.append(f"- {t['no_divisional']}")

    tenth_house = _find_house(chart_payload, 10)
    seventh_house = _find_house(chart_payload, 7)
    d9_chart = _find_divisional_chart(chart_payload, "d9")
    d10_chart = _find_divisional_chart(chart_payload, "d10")

    lines.extend(
        [
            "",
            f"# {t['key_observations']}",
            f"- {t['house_10']}: {_fmt(tenth_house.get('sign') if tenth_house else None)}",
            f"- {t['house_7']}: {_fmt(seventh_house.get('sign') if seventh_house else None)}",
            f"- {t['d9_asc']}: {_fmt(d9_chart.get('ascendant_sign') if d9_chart else None)}",
            f"- {t['d10_asc']}: {_fmt(d10_chart.get('ascendant_sign') if d10_chart else None)}",
        ]
    )

    return "\n".join(lines)


def _build_messages(payload: ChartReadingRequest, bundle: SkillBundle) -> list[dict[str, str]]:
    language = payload.language or "zh"
    
    # 确保使用正确的语言包，默认为中文
    sys_prompt = SYSTEM_PROMPTS.get(language, SYSTEM_PROMPTS["zh"])
    user_prompt_template = USER_PROMPTS.get(language, USER_PROMPTS["zh"])
    default_questions = DEFAULT_QUESTIONS.get(language, DEFAULT_QUESTIONS["zh"])
    
    question = payload.question.strip() or default_questions[payload.focus]
    chart_facts = _build_chart_facts(payload.chart, payload.location_name, language)

    # 根据语言设置所有文本
    if language == "en":
        task_focus_text = "Current Task Focus"
        user_question_text = "User Question"
        chart_facts_text = "Please interpret based on the following structured chart facts:"
        output_requirements_text = "Output Requirements:"
        skill_bundle_text = "\n\nLocal skill bundle summary:\n"
        language_instruction = "Your entire response must be in English only. Do not use any Chinese or other languages."
    elif language == "hi":
        task_focus_text = "वर्तमान कार्य फोकस"
        user_question_text = "उपयोगकर्ता प्रश्न"
        chart_facts_text = "कृपया निम्नलिखित संरचित चार्ट तथ्यों के आधार पर व्याख्यान करें:"
        output_requirements_text = "आउटपुट आवश्यकताएँ:"
        skill_bundle_text = "\n\nस्थानीय कौशल बंडल सारांश:\n"
        language_instruction = "आपका पूरा उत्तर केवल हिंदी में होना चाहिए। किसी अन्य भाषा का प्रयोग न करें।"
    else:
        task_focus_text = "当前任务焦点"
        user_question_text = "用户问题"
        chart_facts_text = "请基于以下结构化星盘事实进行解读："
        output_requirements_text = "输出要求："
        skill_bundle_text = "\n\n本地技能包摘要：\n"
        language_instruction = "【重要：所有回复必须100%使用中文，绝对不能使用任何其他语言的文字！】"

    # 构建系统提示词，确保包含明确的语言要求
    system_prompt = (
        sys_prompt +
        "\n\n" + language_instruction + "\n\n" +
        skill_bundle_text +
        f"{bundle.guidance}"
    )

    # 构建用户提示词
    user_prompt = (
        f"{task_focus_text}: {bundle.label}\n"
        f"{user_question_text}: {question}\n\n"
        f"{chart_facts_text}\n"
        f"{chart_facts}\n\n"
        f"{output_requirements_text}\n" +
        user_prompt_template
    )

    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]


def _build_local_fallback(payload: ChartReadingRequest, bundle: SkillBundle, reason: str) -> str:
    language = payload.language or "zh"
    fallbacks = LOCAL_FALLBACKS.get(language, LOCAL_FALLBACKS["zh"])
    
    chart = payload.chart.get("chart", {})
    panchanga = payload.chart.get("panchanga", {})
    dasha = payload.chart.get("dasha", {})
    tenth_house = _find_house(payload.chart, 10)
    seventh_house = _find_house(payload.chart, 7)
    d9_chart = _find_divisional_chart(payload.chart, "d9")
    d10_chart = _find_divisional_chart(payload.chart, "d10")

    answer_parts = [
        f"{fallbacks['prefix']}{bundle.label}{fallbacks['suffix']}",
        fallbacks["chart_info"].format(
            lagna_sign=_fmt(chart.get('lagna_sign')),
            moon_sign=_fmt(chart.get('moon_sign')),
            sun_sign=_fmt(chart.get('sun_sign')),
            nakshatra=_fmt(panchanga.get('nakshatra'))
        ),
        fallbacks["dasha_info"].format(
            dasha_current=_fmt(dasha.get('current'))
        ),
    ]

    if payload.focus == "career":
        answer_parts.append(
            fallbacks["career_info"].format(
                tenth_house_sign=_fmt(tenth_house.get('sign') if tenth_house else None),
                d10_ascendant=_fmt(d10_chart.get('ascendant_sign') if d10_chart else None)
            )
        )
    elif payload.focus == "love":
        answer_parts.append(
            fallbacks["love_info"].format(
                seventh_house_sign=_fmt(seventh_house.get('sign') if seventh_house else None),
                d9_ascendant=_fmt(d9_chart.get('ascendant_sign') if d9_chart else None)
            )
        )
    else:
        answer_parts.append(fallbacks["core"])

    answer_parts.append(f"{fallbacks['reason']}{reason}")
    return "\n\n".join(answer_parts)


async def _call_deepseek(payload: ChartReadingRequest, bundle: SkillBundle, api_key: str, model: str) -> dict[str, Any]:
    request_body = {
        "model": model,
        "temperature": 0.4,
        "max_tokens": 3000,
        "messages": _build_messages(payload, bundle),
    }

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

    payload_json = response.json()
    answer = _clean_text(payload_json["choices"][0]["message"]["content"])
    return {
        "answer": answer,
        "model": payload_json.get("model", model),
        "focus": payload.focus,
        "skill_bundle": {
            "name": bundle.name,
            "path": str(bundle.root) if bundle.root else "",
            "mode": "deepseek",
        },
        "references": bundle.references,
    }


async def generate_chart_reading(payload: ChartReadingRequest) -> dict[str, Any]:
    """生成星盘解读内容"""
    language = payload.language or "zh"
    bundle = load_skill_bundle(payload.focus, language)
    api_key = os.environ.get("DEEPSEEK_API_KEY", "").strip()
    model = os.environ.get("DEEPSEEK_MODEL", "deepseek-v4-flash").strip() or "deepseek-v4-flash"

    # 多语言错误信息
    error_messages: dict[Language, dict[str, str]] = {
        "zh": {
            "no_api_key": "未配置 DeepSeek API Key",
            "http_error": "DeepSeek 接口返回错误",
            "request_failed": "DeepSeek 请求失败"
        },
        "en": {
            "no_api_key": "DeepSeek API Key not configured",
            "http_error": "DeepSeek API returned error",
            "request_failed": "DeepSeek request failed"
        },
        "hi": {
            "no_api_key": "DeepSeek API Key कॉन्फ़िगर नहीं है",
            "http_error": "DeepSeek API ने त्रुटि लौटाई",
            "request_failed": "DeepSeek अनुरोध विफल"
        }
    }
    errors = error_messages.get(language, error_messages["en"])

    def build_result(mode: str = "local-fallback", reason: str = "") -> dict[str, Any]:
        """构建返回结果"""
        return {
            "answer": _build_local_fallback(payload, bundle, reason=reason) if reason else _build_local_fallback(payload, bundle),
            "model": f"local-chart-reading-fallback",
            "focus": payload.focus,
            "skill_bundle": {
                "name": bundle.name,
                "path": str(bundle.root) if bundle.root else "",
                "mode": mode,
            },
            "references": bundle.references,
        }

    # 检查 API Key
    if not api_key:
        return build_result(reason=errors["no_api_key"])

    # 调用 DeepSeek API
    try:
        return await _call_deepseek(payload, bundle, api_key, model)
    except httpx.HTTPStatusError as exc:
        return build_result(reason=f"{errors['http_error']}: {exc.response.status_code}")
    except httpx.HTTPError:
        return build_result(reason=errors["request_failed"])
