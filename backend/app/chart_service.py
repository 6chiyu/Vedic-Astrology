from datetime import datetime
from math import floor
from typing import Any, Dict

from app.schemas import BirthChartRequest


SIGNS = {
    "zh": [
        "白羊座",
        "金牛座",
        "双子座",
        "巨蟹座",
        "狮子座",
        "处女座",
        "天秤座",
        "天蝎座",
        "射手座",
        "摩羯座",
        "水瓶座",
        "双鱼座",
    ],
    "en": [
        "Aries",
        "Taurus",
        "Gemini",
        "Cancer",
        "Leo",
        "Virgo",
        "Libra",
        "Scorpio",
        "Sagittarius",
        "Capricorn",
        "Aquarius",
        "Pisces",
    ],
    "hi": [
        "Mesh",
        "Vrishabha",
        "Mithuna",
        "Karka",
        "Simha",
        "Kanya",
        "Tula",
        "Vrishchika",
        "Dhanu",
        "Makara",
        "Kumbha",
        "Meena",
    ],
}

PLANET_ORDER = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]

DIVISIONAL_CHART_LABELS = {
    "zh": {
        "d1": "本命盘",
        "d2": "Hora 财富与资源结构",
        "d3": "Drekkana 执行力与手足主题",
        "d4": "Chaturthamsa 家宅与根基",
        "d7": "Saptamsa 子女/延续主题",
        "d9": "Navamsa 婚姻与成熟结构",
        "d10": "Dasamsa 事业与社会角色",
        "d12": "Dvadasamsa 家族与原生脉络",
        "d16": "Shodasamsa 享受与舒适度",
        "d20": "Vimsamsa 精神与修行倾向",
        "d24": "Chaturvimshamsa 学习与知识结构",
        "d27": "Bhamsha 内在力量与韧性",
        "d30": "Trimsamsa 隐性缺口与压力主题",
        "d40": "Khavedamsa 母系与细微福德",
        "d45": "Akshavedamsa 父系与原生精微",
        "d60": "Shashtiamsa 深层业力与根底",
    },
    "en": {
        "d1": "Birth Chart",
        "d2": "Hora - Wealth & Resources",
        "d3": "Drekkana - Execution & Siblings",
        "d4": "Chaturthamsa - Home & Foundation",
        "d7": "Saptamsa - Children & Legacy",
        "d9": "Navamsa - Marriage & Maturity",
        "d10": "Dasamsa - Career & Social Role",
        "d12": "Dvadasamsa - Family & Roots",
        "d16": "Shodasamsa - Enjoyment & Comfort",
        "d20": "Vimsamsa - Spirituality & Practice",
        "d24": "Chaturvimshamsa - Learning & Knowledge",
        "d27": "Bhamsha - Inner Strength & Resilience",
        "d30": "Trimsamsa - Hidden Challenges & Stress",
        "d40": "Khavedamsa - Maternal Line & Blessings",
        "d45": "Akshavedamsa - Paternal Line & Subtleties",
        "d60": "Shashtiamsa - Deep Karma & Roots",
    },
    "hi": {
        "d1": "जन्म कुंडली",
        "d2": "होरा - संपत्ति और संसाधन",
        "d3": "द्रेक्कण - कार्यान्वयन और भाई-बहन",
        "d4": "चतुर्थांश - घर और नींव",
        "d7": "सप्तमांश - बच्चे और विरासत",
        "d9": "नवांश - विवाह और परिपक्वता",
        "d10": "दशमांश - करियर और सामाजिक भूमिका",
        "d12": "द्वादशांश - परिवार और जड़ें",
        "d16": "षोडशांश - आनंद और आराम",
        "d20": "विंशांश - आध्यात्मिकता और साधना",
        "d24": "चतुर्विंशांश - सीखना और ज्ञान",
        "d27": "भांश - आंतरिक शक्ति और लचीलापन",
        "d30": "त्रिंशांश - छिपी हुई चुनौतियाँ और तनाव",
        "d40": "खवेदांश - मातृ वंश और आशीर्वाद",
        "d45": "अक्षवेदांश - पितृ वंश और सूक्ष्मताएँ",
        "d60": "षष्ट्यंश - गहरा कर्म और जड़ें",
    },
}

DIVISIONAL_CHART_FOCUS = {
    "zh": {
        "d9": "用于补充关系、婚姻、承诺方式和成熟后的结构。",
        "d10": "用于补充事业路径、团队位置、职业角色与社会呈现。",
        "d7": "用于补充延续主题、子女议题与创造性输出。",
        "default": "用于补充更细分的人生主题。",
    },
    "en": {
        "d9": "For relationships, marriage, commitment style, and matured structure.",
        "d10": "For career path, team position, professional role, and social presentation.",
        "d7": "For legacy themes, children matters, and creative output.",
        "default": "For more detailed life themes.",
    },
    "hi": {
        "d9": "संबंधों, विवाह, प्रतिबद्धता शैली और परिपक्व संरचना के लिए।",
        "d10": "करियर पथ, टीम की स्थिति, पेशेवर भूमिका और सामाजिक प्रस्तुति के लिए।",
        "d7": "विरासत विषयों, बच्चों के मामलों और रचनात्मक आउटपुट के लिए।",
        "default": "अधिक विस्तृत जीवन विषयों के लिए।",
    },
}

REPORT_SCOPE = {
    "zh": [
        "本命结构",
        "十二宫位",
        "九大行星落点",
        "Panchanga 日历要素",
        "当前大运节奏",
        "Ashtakavarga 分值面板",
        "关系与事业分盘入口",
    ],
    "en": [
        "Birth Structure",
        "Twelve Houses",
        "Nine Planet Positions",
        "Panchanga Calendar Elements",
        "Current Dasha Rhythm",
        "Ashtakavarga Score Panel",
        "Relationship & Career Divisional Charts",
    ],
    "hi": [
        "जन्म संरचना",
        "बारह घर",
        "नौ ग्रहों की स्थिति",
        "पंचांग कैलेंडर तत्व",
        "वर्तमान दशा ताल",
        "अष्टकवर्ग स्कोर पैनल",
        "संबंध और करियर विभाजक चार्ट",
    ],
}

REQUIREMENTS = {
    "zh": {
        "required_inputs": [
            "出生日期",
            "出生时间",
            "出生地点",
            "经纬度",
            "时区",
        ],
        "accuracy_notes": [
            "印度星盘对出生时间敏感，分钟级误差就可能影响上升与宫位。",
            "地点需要落实到城市或坐标，时区错误会直接影响宫位与大运节奏。",
            "如果没有准确出生时间，更适合只看通用主题，不适合下细颗粒判断。",
        ],
        "what_it_generates": [
            "上升、月亮、太阳等核心识别项",
            "十二宫位与宫主信息",
            "九大行星落宫、落座与 Nakshatra",
            "Panchanga：tithi、nakshatra、yoga、karana、weekday",
            "Vimshottari Dasha 当前大运层级",
            "D9 / D10 等分盘入口",
        ],
    },
    "en": {
        "required_inputs": [
            "Birth Date",
            "Birth Time",
            "Birth Location",
            "Latitude & Longitude",
            "Timezone",
        ],
        "accuracy_notes": [
            "Vedic chart is sensitive to birth time - minute-level errors can affect ascendant and houses.",
            "Location needs to be city-level or coordinates; timezone errors directly impact houses and dasha timing.",
            "Without accurate birth time, focus on general themes rather than granular conclusions.",
        ],
        "what_it_generates": [
            "Core identifiers: Ascendant, Moon, Sun",
            "Twelve houses and lord information",
            "Nine planets' house, sign, and Nakshatra",
            "Panchanga: tithi, nakshatra, yoga, karana, weekday",
            "Current Vimshottari Dasha level",
            "D9 / D10 divisional chart access",
        ],
    },
    "hi": {
        "required_inputs": [
            "जन्म तिथि",
            "जन्म समय",
            "जन्म स्थान",
            "अक्षांश और देशांतर",
            "समय क्षेत्र",
        ],
        "accuracy_notes": [
            "वैदिक कुंडली जन्म समय के प्रति संवेदनशील है - मिनट स्तर की त्रुटि लग्न और घरों को प्रभावित कर सकती है।",
            "स्थान शहर-स्तर या निर्देशांक होना चाहिए; समय क्षेत्र की त्रुटि घरों और दशा समय को सीधे प्रभावित करती है।",
            "सटीक जन्म समय के बिना, सामान्य विषयों पर ध्यान दें, न कि सूक्ष्म निष्कर्षों पर।",
        ],
        "what_it_generates": [
            "मुख्य पहचानकर्ता: लग्न, चंद्रमा, सूर्य",
            "बारह घर और स्वामी जानकारी",
            "नौ ग्रहों का घर, राशि और नक्षत्र",
            "पंचांग: तिथि, नक्षत्र, योग, करण, वार",
            "वर्तमान विंशोत्तरी दशा स्तर",
            "D9 / D10 विभाजक चार्ट पहुँच",
        ],
    },
}

FALLBACK_CONTENT = {
    "zh": {
        "tithi": "第 {} 月相日",
        "yoga": "演示模式",
        "karana": "演示模式",
        "d9_focus": "用于补充关系、承诺与成熟后的相处结构。",
        "d10_focus": "用于补充事业角色、团队位置与社会呈现。",
        "report_scope": [
            "基础命盘结构",
            "十二宫位框架",
            "九大行星演示数据",
            "Panchanga 演示值",
            "Ashtakavarga 演示值",
            "Vimshottari Dasha 大运周期",
        ],
        "warning": "当前环境未启用 jyotishganit，结果仅用于流程验证。",
    },
    "en": {
        "tithi": "Lunar Day {}",
        "yoga": "Demo Mode",
        "karana": "Demo Mode",
        "d9_focus": "For relationships, commitment, and matured partnership structure.",
        "d10_focus": "For career role, team position, and social presentation.",
        "report_scope": [
            "Basic Chart Structure",
            "Twelve House Framework",
            "Nine Planet Demo Data",
            "Panchanga Demo Values",
            "Ashtakavarga Demo Values",
            "Vimshottari Dasha Cycle",
        ],
        "warning": "jyotishganit not enabled in current environment - results for process verification only.",
    },
    "hi": {
        "tithi": "चंद्र दिवस {}",
        "yoga": "डेमो मोड",
        "karana": "डेमो मोड",
        "d9_focus": "संबंधों, प्रतिबद्धता और परिपक्व साझेदारी संरचना के लिए।",
        "d10_focus": "करियर भूमिका, टीम की स्थिति और सामाजिक प्रस्तुति के लिए।",
        "report_scope": [
            "मूल कुंडली संरचना",
            "बारह घर का ढांचा",
            "नौ ग्रह डेमो डेटा",
            "पंचांग डेमो मान",
            "अष्टकवर्ग डेमो मान",
            "विंशोत्तरी दशा चक्र",
        ],
        "warning": "वर्तमान वातावरण में jyotishganit सक्षम नहीं है - परिणाम केवल प्रक्रिया सत्यापन के लिए।",
    },
}

NAKSHATRAS = [
    "Ashwini",
    "Bharani",
    "Krittika",
    "Rohini",
    "Mrigashira",
    "Ardra",
    "Punarvasu",
    "Pushya",
    "Ashlesha",
    "Magha",
    "Purva Phalguni",
    "Uttara Phalguni",
    "Hasta",
    "Chitra",
    "Swati",
    "Vishakha",
    "Anuradha",
    "Jyeshtha",
    "Mula",
    "Purva Ashadha",
    "Uttara Ashadha",
    "Shravana",
    "Dhanishta",
    "Shatabhisha",
    "Purva Bhadrapada",
    "Uttara Bhadrapada",
    "Revati",
]

VIMSHOTTARI_DASHA_YEARS = [
    9,   # Ashwini
    7,   # Bharani
    10,  # Krittika
    18,  # Rohini
    20,  # Mrigashira
    6,   # Ardra
    20,  # Punarvasu
    17,  # Pushya
    16,  # Ashlesha
    15,  # Magha
    12,  # Purva Phalguni
    20,  # Uttara Phalguni
    16,  # Hasta
    17,  # Chitra
    19,  # Swati
    18,  # Vishakha
    17,  # Anuradha
    16,  # Jyeshtha
    15,  # Mula
    12,  # Purva Ashadha
    20,  # Uttara Ashadha
    24,  # Shravana
    20,  # Dhanishta
    15,  # Shatabhisha
    20,  # Purva Bhadrapada
    24,  # Uttara Bhadrapada
    12,  # Revati
]

ENGLISH_SIGNS = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
]

SIGN_INDEX_BY_NAME = {name: index for index, name in enumerate(ENGLISH_SIGNS)}


def calculate_birth_chart(payload: BirthChartRequest) -> dict[str, Any]:
    birth_dt = datetime.combine(payload.birth_date, payload.birth_time)
    lang = payload.language

    try:
        return _calculate_with_jyotishganit(payload, birth_dt, lang)
    except Exception as exc:
        return _calculate_fallback(payload, birth_dt, str(exc), lang)


def _calculate_with_jyotishganit(payload: BirthChartRequest, birth_dt: datetime, lang: str) -> dict[str, Any]:
    from jyotishganit import calculate_birth_chart as calculate_engine_chart
    from jyotishganit import get_birth_chart_json

    chart = calculate_engine_chart(
        birth_date=birth_dt,
        latitude=payload.latitude,
        longitude=payload.longitude,
        timezone_offset=payload.timezone_offset,
        name=payload.name,
    )
    raw_chart = get_birth_chart_json(chart)
    houses = _extract_houses(raw_chart)
    planets = _extract_planets(raw_chart, houses)
    panchanga = _extract_panchanga(raw_chart)
    dasha = _extract_dasha(raw_chart)
    divisional_charts = _extract_divisional_charts(raw_chart, lang)
    ashtakavarga = _extract_ashtakavarga(raw_chart)
    ayanamsa = _extract_ayanamsa(raw_chart)

    return {
        "profile": _profile(payload),
        "requirements": _requirements_payload(lang),
        "chart": {
            "lagna_sign": _read_first(raw_chart, ["d1Chart.houses.0.sign", "d1_chart.houses.0.sign"], "未识别"),
            "moon_sign": _read_planet_sign(raw_chart, "Moon"),
            "sun_sign": _read_planet_sign(raw_chart, "Sun"),
            "houses": houses,
            "planets": planets,
            "divisional_charts": divisional_charts,
            "ashtakavarga": ashtakavarga,
            "raw": raw_chart,
        },
        "panchanga": panchanga,
        "dasha": dasha,
        "meta": {
            "engine": "jyotishganit",
            "ayanamsa": ayanamsa or "True Chitra Paksha",
            "available_modules": [
                "D1",
                "Panchanga",
                "Vimshottari Dasha",
                "Ashtakavarga",
                *[item.get("chart_key", "").upper() for item in divisional_charts if item.get("chart_key")],
            ],
            "report_scope": REPORT_SCOPE[lang],
        },
    }


def _calculate_fallback(payload: BirthChartRequest, birth_dt: datetime, reason: str, lang: str) -> dict[str, Any]:
    seed = (
        birth_dt.toordinal()
        + birth_dt.hour * 13
        + birth_dt.minute
        + floor((payload.latitude + 90) * 10)
        + floor((payload.longitude + 180) * 10)
    )
    lagna_index = seed % 12
    moon_index = (seed + birth_dt.month + birth_dt.day) % 12
    nakshatra_index = seed % 27
    houses = _fallback_houses(lagna_index, lang)
    planets = _fallback_planets(lagna_index, moon_index, birth_dt, lang)
    
    # 将行星分配到对应的宫位中
    house_occupants: dict[int, list[str]] = {}
    for planet in planets:
        house_num = planet.get("house")
        if isinstance(house_num, int):
            if house_num not in house_occupants:
                house_occupants[house_num] = []
            house_occupants[house_num].append(planet.get("planet", ""))
    
    for house in houses:
        house_num = house.get("house")
        if house_num in house_occupants:
            house["occupants"] = house_occupants[house_num]
    
    current_dasha = f"{NAKSHATRAS[nakshatra_index]} Mahadasha"
    
    dasha_info = _calculate_fallback_dasha(birth_dt, nakshatra_index)

    return {
        "profile": _profile(payload),
        "requirements": _requirements_payload(lang),
        "chart": {
            "lagna_sign": SIGNS[lang][lagna_index],
            "moon_sign": SIGNS[lang][moon_index],
            "sun_sign": SIGNS[lang][(birth_dt.month - 1) % 12],
            "houses": houses,
            "planets": planets,
            "ashtakavarga": _fallback_ashtakavarga(),
            "divisional_charts": [
                {
                    "chart_key": "d9",
                    "label": DIVISIONAL_CHART_LABELS[lang]["d9"],
                    "ascendant_sign": SIGNS[lang][(lagna_index + 3) % 12],
                    "source_house": 7,
                    "focus": FALLBACK_CONTENT[lang]["d9_focus"],
                },
                {
                    "chart_key": "d10",
                    "label": DIVISIONAL_CHART_LABELS[lang]["d10"],
                    "ascendant_sign": SIGNS[lang][(lagna_index + 5) % 12],
                    "source_house": 10,
                    "focus": FALLBACK_CONTENT[lang]["d10_focus"],
                },
            ],
        },
        "panchanga": {
            "nakshatra": NAKSHATRAS[nakshatra_index],
            "tithi": FALLBACK_CONTENT[lang]["tithi"].format((seed % 30) + 1),
            "yoga": FALLBACK_CONTENT[lang]["yoga"],
            "karana": FALLBACK_CONTENT[lang]["karana"],
            "vaara": birth_dt.strftime("%A"),
        },
        "dasha": dasha_info,
        "meta": {
            "engine": "fallback",
            "ayanamsa": "demo-only",
            "available_modules": ["D1", "Panchanga", "D9", "D10", "Ashtakavarga"],
            "report_scope": FALLBACK_CONTENT[lang]["report_scope"],
            "warning": FALLBACK_CONTENT[lang]["warning"],
            "fallback_reason": reason,
        },
    }


def _calculate_fallback_dasha(birth_dt: datetime, start_nakshatra_index: int) -> dict[str, Any]:
    from datetime import timedelta
    
    all_mahadashas = []
    current_index = start_nakshatra_index
    current_start = birth_dt.date()
    
    for _ in range(27):
        nakshatra_name = NAKSHATRAS[current_index]
        duration = VIMSHOTTARI_DASHA_YEARS[current_index]
        current_end = current_start + timedelta(days=duration * 365)
        
        all_mahadashas.append({
            "name": nakshatra_name,
            "start": current_start.isoformat(),
            "end": current_end.isoformat(),
            "duration": duration,
        })
        
        current_start = current_end
        current_index = (current_index + 1) % 27
    
    current_mahadasha = all_mahadashas[0]
    upcoming_mahadashas = all_mahadashas[1:6]
    
    return {
        "current": f"{current_mahadasha['name']} Mahadasha",
        "mahadasha": {
            "name": current_mahadasha["name"],
            "start": current_mahadasha["start"],
            "end": current_mahadasha["end"],
            "duration": current_mahadasha["duration"],
        },
        "antardasha": _generate_antardashas(current_mahadasha["name"], current_mahadasha["start"], current_mahadasha["duration"]),
        "pratyantardasha": None,
        "balance": {
            "current_mahadasha_years_remaining": current_mahadasha["duration"],
        },
        "upcoming": upcoming_mahadashas,
        "all": all_mahadashas,
    }


def _generate_antardashas(mahadasha_name: str, start_date: str, duration: int) -> list[dict[str, Any]]:
    from datetime import datetime, timedelta
    
    start_dt = datetime.fromisoformat(start_date)
    antardashas = []
    
    for i, nakshatra in enumerate(NAKSHATRAS):
        antardasha_duration = VIMSHOTTARI_DASHA_YEARS[i] / 9
        end_dt = start_dt + timedelta(days=antardasha_duration * 365)
        
        antardashas.append({
            "name": nakshatra,
            "start": start_dt.date().isoformat(),
            "end": end_dt.date().isoformat(),
            "duration": round(antardasha_duration, 2),
        })
        
        start_dt = end_dt
    
    return antardashas


def _profile(payload: BirthChartRequest) -> dict[str, Any]:
    return {
        "name": payload.name,
        "birth_date": payload.birth_date.isoformat(),
        "birth_time": payload.birth_time.strftime("%H:%M:%S"),
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "timezone_offset": payload.timezone_offset,
    }


def _requirements_payload(lang: str) -> dict[str, Any]:
    return REQUIREMENTS[lang]


def _extract_houses(raw_chart: dict[str, Any]) -> list[dict[str, Any]]:
    houses = _read_first(raw_chart, ["d1Chart.houses", "d1_chart.houses"], [])
    if not isinstance(houses, list):
        return []

    normalized: list[dict[str, Any]] = []
    for house in houses:
        if not isinstance(house, dict):
            continue
        occupants = house.get("occupants", [])
        occupant_names = [
            occupant.get("celestialBody") or occupant.get("planet")
            for occupant in occupants
            if isinstance(occupant, dict) and (occupant.get("celestialBody") or occupant.get("planet"))
        ]
        normalized.append(
            {
                "house": int(house.get("number", 0)),
                "sign": house.get("sign", "未识别"),
                "lord": house.get("lord", "未识别"),
                "lord_placed_sign": house.get("lordPlacedSign", ""),
                "lord_placed_house": house.get("lordPlacedHouse"),
                "nakshatra": house.get("nakshatra", ""),
                "pada": house.get("pada"),
                "nakshatra_deity": house.get("nakshatraDeity", ""),
                "sign_degrees": _safe_number(house.get("signDegrees")),
                "bhava_bala": _safe_number(house.get("bhavaBala")),
                "purposes": house.get("purposes", []),
                "occupants": occupant_names,
                "aspects_received": [
                    {
                        "planet": aspect.get("aspecting_planet", ""),
                        "type": aspect.get("aspect_type", ""),
                    }
                    for aspect in house.get("aspectsReceived", [])
                    if isinstance(aspect, dict)
                ],
            }
        )

    return _enrich_house_cusps(normalized)


def _extract_planets(raw_chart: dict[str, Any], houses: list[dict[str, Any]]) -> list[dict[str, Any]]:
    planet_map: dict[str, dict[str, Any]] = {}
    d1_houses = _read_first(raw_chart, ["d1Chart.houses", "d1_chart.houses"], [])

    if isinstance(d1_houses, list):
        for house in d1_houses:
            if not isinstance(house, dict):
                continue
            for occupant in house.get("occupants", []):
                if not isinstance(occupant, dict):
                    continue
                name = occupant.get("celestialBody") or occupant.get("planet")
                if not isinstance(name, str) or not name:
                    continue
                planet_map[name] = {
                    "planet": name,
                    "house": occupant.get("house") or house.get("number"),
                    "sign": occupant.get("sign", house.get("sign", "未识别")),
                    "degrees": _safe_number(occupant.get("signDegrees")),
                    "nakshatra": occupant.get("nakshatra", ""),
                    "pada": occupant.get("pada"),
                    "nakshatra_deity": occupant.get("nakshatraDeity", ""),
                    "motion_type": occupant.get("motion_type", ""),
                    "dignity": _read_nested(occupant, "dignities.dignity", ""),
                    "lordship_houses": occupant.get("hasLordshipHouses", []),
                    "conjuncts": occupant.get("conjuncts", []),
                    "aspects_gives": _normalize_aspects(_read_nested(occupant, "aspects.gives", [])),
                    "aspects_receives": _normalize_aspects(
                        _read_nested(occupant, "aspects.receives", []),
                        source_key="from_planet",
                        target_house_key="from_house",
                    ),
                    "shadbala_total": _safe_number(_read_nested(occupant, "shadbala.Shadbala.Total", None)),
                    "shadbala_rupas": _safe_number(_read_nested(occupant, "shadbala.Shadbala.Rupas", None)),
                    "shadbala_min_required": _safe_number(
                        _read_nested(occupant, "shadbala.Shadbala.MinRequired", None)
                    ),
                    "shadbala_meets_requirement": _read_nested(
                        occupant, "shadbala.Shadbala.MeetsRequirement", ""
                    ),
                }

    for house in houses:
        for planet_name in house.get("occupants", []):
            if planet_name not in planet_map:
                planet_map[planet_name] = {
                    "planet": planet_name,
                    "house": house.get("house"),
                    "sign": house.get("sign"),
                    "degrees": None,
                    "nakshatra": "",
                    "pada": None,
                    "nakshatra_deity": "",
                    "motion_type": "",
                    "dignity": "",
                    "lordship_houses": [],
                    "conjuncts": [],
                    "aspects_gives": [],
                    "aspects_receives": [],
                    "shadbala_total": None,
                    "shadbala_rupas": None,
                    "shadbala_min_required": None,
                    "shadbala_meets_requirement": "",
                }

    def sort_key(item: dict[str, Any]) -> tuple[int, str]:
        planet_name = item.get("planet", "")
        try:
            return (PLANET_ORDER.index(planet_name), planet_name)
        except ValueError:
            return (len(PLANET_ORDER), planet_name)

    return sorted(planet_map.values(), key=sort_key)


def _extract_panchanga(raw_chart: dict[str, Any]) -> dict[str, Any]:
    return {
        "nakshatra": _read_nested(raw_chart, "panchanga.nakshatra", "未识别"),
        "tithi": _read_nested(raw_chart, "panchanga.tithi", "未识别"),
        "yoga": _read_nested(raw_chart, "panchanga.yoga", "未识别"),
        "karana": _read_nested(raw_chart, "panchanga.karana", "未识别"),
        "vaara": _read_nested(raw_chart, "panchanga.vaara", "未识别"),
    }


def _extract_dasha(raw_chart: dict[str, Any]) -> dict[str, Any]:
    current = _read_nested(raw_chart, "dashas.current", None)
    balance = _read_nested(raw_chart, "dashas.balance", {})
    upcoming = _read_nested(raw_chart, "dashas.upcoming", {})
    all_dashas = _read_nested(raw_chart, "dashas.all", {})
    if not isinstance(current, dict):
        return {
            "current": "未识别",
            "mahadasha": None,
            "antardasha": None,
            "pratyantardasha": None,
            "balance": balance if isinstance(balance, dict) else {},
            "upcoming": upcoming if isinstance(upcoming, dict) else {},
            "all": all_dashas if isinstance(all_dashas, dict) else {},
        }

    mahadashas = current.get("mahadashas")
    if not isinstance(mahadashas, dict) or not mahadashas:
        return {
            "current": "未识别",
            "mahadasha": None,
            "antardasha": None,
            "pratyantardasha": None,
            "balance": balance if isinstance(balance, dict) else {},
            "upcoming": upcoming if isinstance(upcoming, dict) else {},
            "all": all_dashas if isinstance(all_dashas, dict) else {},
        }

    maha_name, maha_payload = next(iter(mahadashas.items()))
    antardasha = None
    pratyantardasha = None
    current_label = f"{maha_name} Mahadasha"

    if isinstance(maha_payload, dict):
        antardashas = maha_payload.get("antardashas")
        if isinstance(antardashas, dict) and antardashas:
            antara_name, antara_payload = next(iter(antardashas.items()))
            antardasha = {
                "name": antara_name,
                "start": antara_payload.get("start", ""),
                "end": antara_payload.get("end", ""),
            }
            current_label = f"{maha_name} / {antara_name}"

            if isinstance(antara_payload, dict):
                pratyantardashas = antara_payload.get("pratyantardashas")
                if isinstance(pratyantardashas, dict) and pratyantardashas:
                    praty_name, praty_payload = next(iter(pratyantardashas.items()))
                    pratyantardasha = {
                        "name": praty_name,
                        "start": praty_payload.get("start", ""),
                        "end": praty_payload.get("end", ""),
                    }
                    current_label = f"{maha_name} / {antara_name} / {praty_name}"

    return {
        "current": current_label,
        "mahadasha": {
            "name": maha_name,
            "start": maha_payload.get("start", "") if isinstance(maha_payload, dict) else "",
            "end": maha_payload.get("end", "") if isinstance(maha_payload, dict) else "",
        },
        "antardasha": antardasha,
        "pratyantardasha": pratyantardasha,
        "balance": balance if isinstance(balance, dict) else {},
        "upcoming": upcoming if isinstance(upcoming, dict) else {},
        "all": all_dashas if isinstance(all_dashas, dict) else {},
    }


def _extract_divisional_charts(raw_chart: dict[str, Any], lang: str) -> list[dict[str, Any]]:
    divisional = raw_chart.get("divisionalCharts", {})
    if not isinstance(divisional, dict):
        return []

    normalized: list[dict[str, Any]] = []
    for chart_key in sorted(divisional.keys(), key=_divisional_sort_key):
        chart = divisional.get(chart_key)
        if not isinstance(chart, dict):
            continue
        ascendant = chart.get("ascendant", {})
        if not isinstance(ascendant, dict):
            ascendant = {}

        normalized.append(
            {
                "chart_key": chart_key,
                "label": DIVISIONAL_CHART_LABELS[lang].get(chart_key, chart_key.upper()),
                "ascendant_sign": ascendant.get("sign", "未识别"),
                "source_house": ascendant.get("d1HousePlacement"),
                "focus": _divisional_focus(chart_key, lang),
            }
        )

    return normalized


def _extract_ashtakavarga(raw_chart: dict[str, Any]) -> dict[str, Any]:
    source = raw_chart.get("ashtakavarga", {})
    if not isinstance(source, dict):
        return {"sav": {}, "bhav": {}}

    bhav = {
        key: value
        for key, value in source.items()
        if key.endswith("Bhav") and isinstance(value, dict)
    }
    sav = source.get("sav", {})
    return {
        "sav": sav if isinstance(sav, dict) else {},
        "bhav": bhav,
    }


def _extract_ayanamsa(raw_chart: dict[str, Any]) -> str:
    name = _read_nested(raw_chart, "ayanamsa.name", "")
    value = _read_nested(raw_chart, "ayanamsa.value", None)
    if name and value is not None:
        return f"{name} ({_safe_number(value)}°)"
    return name or ""


def _divisional_focus(chart_key: str, lang: str) -> str:
    if chart_key in DIVISIONAL_CHART_FOCUS[lang]:
        return DIVISIONAL_CHART_FOCUS[lang][chart_key]
    return DIVISIONAL_CHART_FOCUS[lang]["default"]


def _divisional_sort_key(chart_key: str) -> tuple[int, str]:
    if chart_key.startswith("d") and chart_key[1:].isdigit():
        return (int(chart_key[1:]), chart_key)
    return (999, chart_key)


def _fallback_houses(lagna_index: int, lang: str) -> list[dict[str, Any]]:
    houses: list[dict[str, Any]] = []
    for offset in range(12):
        sign = SIGNS[lang][(lagna_index + offset) % len(SIGNS[lang])]
        houses.append(
            {
                "house": offset + 1,
                "sign": sign,
                "lord": PLANET_ORDER[offset % 7],
                "lord_placed_sign": "",
                "lord_placed_house": None,
                "nakshatra": NAKSHATRAS[(lagna_index * 2 + offset) % len(NAKSHATRAS)],
                "pada": (offset % 4) + 1,
                "nakshatra_deity": _nakshatra_deity_from_name(
                    NAKSHATRAS[(lagna_index * 2 + offset) % len(NAKSHATRAS)]
                ),
                "sign_degrees": round(((offset + 1) * 2.75) % 30, 2),
                "bhava_bala": round(320 + offset * 18.5, 3),
                "purposes": _house_purposes(offset + 1),
                "occupants": [],
                "aspects_received": [],
            }
        )
    return houses


def _fallback_ashtakavarga() -> dict[str, Any]:
    sav = {
        sign: 24 + (index % 6) * 2
        for index, sign in enumerate(ENGLISH_SIGNS)
    }
    bhav = {
        key: {sign: 2 + ((index + offset) % 5) for offset, sign in enumerate(ENGLISH_SIGNS)}
        for index, key in enumerate(
            ["sunBhav", "moonBhav", "marsBhav", "mercuryBhav", "jupiterBhav", "venusBhav", "saturnBhav"]
        )
    }
    return {"sav": sav, "bhav": bhav}


def _enrich_house_cusps(houses: list[dict[str, Any]]) -> list[dict[str, Any]]:
    anchor_house = next(
        (
            house
            for house in houses
            if isinstance(house.get("sign_degrees"), (int, float))
            and isinstance(house.get("house"), int)
        ),
        None,
    )
    if anchor_house is None:
        return houses

    anchor_degrees = _safe_number(anchor_house.get("sign_degrees"))
    anchor_house_number = anchor_house.get("house")
    if anchor_degrees is None or not isinstance(anchor_house_number, int):
        return houses

    for house in houses:
        house_number = house.get("house")
        sign_name = house.get("sign")
        if not isinstance(house_number, int) or not isinstance(sign_name, str):
            continue

        if house.get("sign_degrees") is None:
            house["sign_degrees"] = anchor_degrees

        zodiac_longitude = _house_zodiac_longitude(sign_name, house.get("sign_degrees"))
        if zodiac_longitude is None:
            continue

        if not house.get("nakshatra"):
            house["nakshatra"] = _nakshatra_from_longitude(zodiac_longitude)
        if house.get("pada") is None:
            house["pada"] = _pada_from_longitude(zodiac_longitude)
        if not house.get("nakshatra_deity"):
            house["nakshatra_deity"] = _nakshatra_deity_from_name(house.get("nakshatra"))

    return houses


def _fallback_planets(lagna_index: int, moon_index: int, birth_dt: datetime, lang: str) -> list[dict[str, Any]]:
    seed = birth_dt.toordinal() + birth_dt.hour + birth_dt.minute
    planets: list[dict[str, Any]] = []
    sign_indexes = {
        "Sun": (birth_dt.month - 1) % 12,
        "Moon": moon_index,
        "Mars": (lagna_index + 3) % 12,
        "Mercury": (lagna_index + 10) % 12,
        "Jupiter": (lagna_index + 4) % 12,
        "Venus": (lagna_index + 9) % 12,
        "Saturn": (lagna_index + 7) % 12,
        "Rahu": (lagna_index + 1) % 12,
        "Ketu": (lagna_index + 7) % 12,
    }

    for index, planet_name in enumerate(PLANET_ORDER):
        house = ((sign_indexes[planet_name] - lagna_index) % 12) + 1
        planets.append(
            {
                "planet": planet_name,
                "house": house,
                "sign": SIGNS[lang][sign_indexes[planet_name]],
                "degrees": round(((seed + index * 17) % 300) / 10, 2),
                "nakshatra": NAKSHATRAS[(seed + index) % len(NAKSHATRAS)],
                "pada": (index % 4) + 1,
                "nakshatra_deity": _nakshatra_deity_from_name(
                    NAKSHATRAS[(seed + index) % len(NAKSHATRAS)]
                ),
                "motion_type": "retrograde" if planet_name in {"Saturn", "Rahu", "Ketu"} else "direct",
                "dignity": "demo",
                "lordship_houses": [house],
                "conjuncts": [],
                "aspects_gives": [],
                "aspects_receives": [],
                "shadbala_total": None,
                "shadbala_rupas": None,
                "shadbala_min_required": None,
                "shadbala_meets_requirement": "",
            }
        )

    return planets


def _house_purposes(house: int) -> list[str]:
    mapping = {
        1: ["Dharma", "Kendra", "Trikona"],
        2: ["Artha"],
        3: ["Kama", "Upachaya"],
        4: ["Moksha", "Kendra"],
        5: ["Dharma", "Trikona"],
        6: ["Artha", "Dusthana", "Upachaya"],
        7: ["Kama", "Kendra"],
        8: ["Moksha", "Dusthana"],
        9: ["Dharma", "Trikona"],
        10: ["Artha", "Kendra", "Upachaya"],
        11: ["Kama", "Upachaya"],
        12: ["Moksha", "Dusthana"],
    }
    return mapping.get(house, [])


def _read_nested(data: Any, path: str, default: Any) -> Any:
    current = data
    for key in path.split("."):
        if isinstance(current, list):
            try:
                current = current[int(key)]
            except (ValueError, IndexError):
                return default
            continue
        if not isinstance(current, dict) or key not in current:
            return default
        current = current[key]
    return current


def _read_first(data: Any, paths: list[str], default: Any) -> Any:
    for path in paths:
        value = _read_nested(data, path, default)
        if value != default:
            return value
    return default


def _read_planet_sign(data: dict[str, Any], planet: str) -> str:
    if planet == "Moon":
        panchanga_rashi = _read_nested(data, "panchanga.rashi", "未识别")
        if panchanga_rashi != "未识别":
            return panchanga_rashi

    direct_value = _read_first(data, [f"planets.{planet}.sign", f"planetPositions.{planet}.sign"], "未识别")
    if direct_value != "未识别":
        return direct_value

    houses = _read_first(data, ["d1Chart.houses", "d1_chart.houses"], [])
    if not isinstance(houses, list):
        return "未识别"

    for house in houses:
        if not isinstance(house, dict):
            continue
        occupants = house.get("occupants", [])
        if not isinstance(occupants, list):
            continue
        for occupant in occupants:
            if not isinstance(occupant, dict):
                continue
            if occupant.get("celestialBody") == planet or occupant.get("planet") == planet:
                sign = occupant.get("sign")
                return sign if isinstance(sign, str) else "未识别"

    return "未识别"


def _safe_number(value: Any) -> float | None:
    if value is None:
        return None
    try:
        return round(float(value), 3)
    except (TypeError, ValueError):
        return None


def _house_zodiac_longitude(sign_name: str, sign_degrees: Any) -> float | None:
    sign_index = SIGN_INDEX_BY_NAME.get(sign_name)
    degree_value = _safe_number(sign_degrees)
    if sign_index is None or degree_value is None:
        return None
    return sign_index * 30 + degree_value


def _nakshatra_from_longitude(zodiac_longitude: float) -> str:
    normalized = zodiac_longitude % 360
    nakshatra_span = 360 / 27
    nakshatra_index = int(normalized / nakshatra_span) % len(NAKSHATRAS)
    return NAKSHATRAS[nakshatra_index]


def _pada_from_longitude(zodiac_longitude: float) -> int:
    normalized = zodiac_longitude % 360
    pada_span = (360 / 27) / 4
    return int((normalized % (360 / 27)) / pada_span) + 1


def _nakshatra_deity_from_name(nakshatra_name: Any) -> str:
    if not isinstance(nakshatra_name, str):
        return ""

    mapping = {
        "Ashwini": "Ashvins",
        "Bharani": "Yama",
        "Krittika": "Agni",
        "Rohini": "Brahma",
        "Mrigashira": "Soma",
        "Ardra": "Rudra",
        "Punarvasu": "Aditi",
        "Pushya": "Brihaspati",
        "Ashlesha": "Nagas",
        "Magha": "Pitris",
        "Purva Phalguni": "Bhaga",
        "Uttara Phalguni": "Aryaman",
        "Hasta": "Surya",
        "Chitra": "Tvashtar",
        "Swati": "Vayu",
        "Vishakha": "Indra-Agni",
        "Anuradha": "Mitra",
        "Jyeshtha": "Indra",
        "Mula": "Nirriti",
        "Purva Ashadha": "Apah",
        "Uttara Ashadha": "Vishvadevas",
        "Shravana": "Vishnu",
        "Dhanishta": "Vasus",
        "Shatabhisha": "Varuna",
        "Purva Bhadrapada": "Aja Ekapada",
        "Uttara Bhadrapada": "Ahirbudhnya",
        "Revati": "Pushan",
    }
    return mapping.get(nakshatra_name, "")


def _normalize_aspects(
    aspects: Any,
    source_key: str = "to_planet",
    target_house_key: str = "to_house",
) -> list[dict[str, Any]]:
    if not isinstance(aspects, list):
        return []

    normalized: list[dict[str, Any]] = []
    for aspect in aspects:
        if not isinstance(aspect, dict):
            continue
        normalized.append(
            {
                "planet": aspect.get(source_key, ""),
                "house": aspect.get(target_house_key),
                "type": aspect.get("aspect_type", ""),
            }
        )
    return normalized
