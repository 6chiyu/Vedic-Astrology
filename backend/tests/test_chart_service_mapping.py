import sys
from datetime import date, time
from types import SimpleNamespace

from app.chart_service import calculate_birth_chart
from app.schemas import BirthChartRequest


def test_jyotishganit_camel_case_payload_maps_summary_fields(monkeypatch):
    fake_raw_chart = {
        "d1Chart": {
            "houses": [
                {"number": 1, "sign": "Leo", "lord": "Sun", "nakshatra": "Magha", "occupants": []},
                {
                    "number": 2,
                    "sign": "Virgo",
                    "lord": "Mercury",
                    "lordPlacedSign": "Gemini",
                    "lordPlacedHouse": 11,
                    "nakshatra": "Hasta",
                    "nakshatraDeity": "Surya",
                    "occupants": [
                        {
                            "celestialBody": "Rahu",
                            "sign": "Virgo",
                            "house": 2,
                            "nakshatra": "Hasta",
                            "nakshatraDeity": "Surya",
                            "motion_type": "retrograde",
                            "dignities": {"dignity": "neutral"},
                            "hasLordshipHouses": [],
                            "aspects": {
                                "gives": [{"to_house": 10, "aspect_type": "9"}],
                                "receives": [{"from_planet": "Saturn", "aspect_type": "7"}],
                            },
                            "shadbala": {
                                "Shadbala": {
                                    "Total": 315.0,
                                    "Rupas": 5.25,
                                    "MinRequired": 5.0,
                                    "MeetsRequirement": "Yes",
                                }
                            },
                        }
                    ],
                },
            ]
        },
        "planets": {
            "Sun": {"sign": "Gemini"},
        },
        "panchanga": {
            "rashi": "Capricorn",
            "nakshatra": "Dhanishta",
            "tithi": "Krishna Chaturthi",
            "yoga": "Priti",
            "karana": "Bava",
            "vaara": "Thursday",
        },
        "ayanamsa": {
            "name": "True Chitra Paksha",
            "value": 23.842,
        },
        "dashas": {
            "current": {
                "mahadashas": {
                    "Jupiter": {
                        "start": "2018-04-14",
                        "end": "2034-04-14",
                        "antardashas": {
                            "Venus": {
                                "start": "2026-02-24",
                                "end": "2028-10-25",
                                "pratyantardashas": {
                                    "Venus": {
                                        "start": "2026-02-24",
                                        "end": "2026-08-05",
                                    }
                                },
                            }
                        },
                    }
                }
            }
        },
        "divisionalCharts": {
            "d2": {"ascendant": {"sign": "Leo", "d1HousePlacement": 1}},
            "d3": {"ascendant": {"sign": "Sagittarius", "d1HousePlacement": 5}},
            "d9": {"ascendant": {"sign": "Cancer", "d1HousePlacement": 12}},
            "d10": {"ascendant": {"sign": "Scorpio", "d1HousePlacement": 4}},
        },
        "ashtakavarga": {
            "sav": {"Aries": 28, "Taurus": 27},
            "sunBhav": {"Aries": 5, "Taurus": 4},
        },
    }

    fake_module = SimpleNamespace(
        calculate_birth_chart=lambda **kwargs: object(),
        get_birth_chart_json=lambda chart: fake_raw_chart,
    )
    monkeypatch.setitem(sys.modules, "jyotishganit", fake_module)

    payload = BirthChartRequest(
        name="Test",
        birth_date=date(1996, 7, 4),
        birth_time=time(9, 10),
        latitude=31.2304,
        longitude=121.4737,
        timezone_offset=8,
    )

    result = calculate_birth_chart(payload)

    assert result["meta"]["engine"] == "jyotishganit"
    assert result["chart"]["lagna_sign"] == "Leo"
    assert result["chart"]["moon_sign"] == "Capricorn"
    assert result["chart"]["sun_sign"] == "Gemini"
    assert len(result["chart"]["houses"]) == 2
    assert result["chart"]["houses"][1]["lord_placed_sign"] == "Gemini"
    assert result["chart"]["houses"][1]["lord_placed_house"] == 11
    assert result["chart"]["houses"][1]["nakshatra_deity"] == "Surya"
    assert result["chart"]["houses"][1]["occupants"] == ["Rahu"]
    assert [planet["planet"] for planet in result["chart"]["planets"]] == ["Rahu"]
    assert result["chart"]["planets"][0]["nakshatra_deity"] == "Surya"
    assert result["chart"]["planets"][0]["aspects_gives"][0]["house"] == 10
    assert result["chart"]["planets"][0]["aspects_receives"][0]["planet"] == "Saturn"
    assert result["chart"]["planets"][0]["shadbala_total"] == 315.0
    assert result["panchanga"]["nakshatra"] == "Dhanishta"
    assert result["panchanga"]["yoga"] == "Priti"
    assert result["dasha"]["current"] == "Jupiter / Venus / Venus"
    assert result["dasha"]["mahadasha"]["name"] == "Jupiter"
    assert result["chart"]["divisional_charts"][0]["chart_key"] == "d2"
    assert result["chart"]["ashtakavarga"]["sav"]["Aries"] == 28
