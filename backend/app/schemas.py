from datetime import date, time
from typing import Any, Literal

from pydantic import BaseModel, Field


class BirthChartRequest(BaseModel):
    name: str = Field(default="访客", max_length=64)
    location_name: str = Field(default="", max_length=160)
    birth_date: date
    birth_time: time
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    timezone_offset: float = Field(default=8, ge=-12, le=14)
    language: Literal["zh", "en", "hi"] = "zh"


class ResponseEnvelope(BaseModel):
    code: int = 0
    data: Any


class ChartReadingRequest(BaseModel):
    focus: Literal["core", "career", "love"] = "core"
    question: str = Field(default="", max_length=600)
    location_name: str = Field(default="", max_length=160)
    chart: dict[str, Any]
    language: Literal["zh", "en", "hi"] = "zh"


class RectifierEventRequest(BaseModel):
    title: str = Field(min_length=1, max_length=80)
    date_hint: str = Field(default="", max_length=40)
    description: str = Field(min_length=1, max_length=240)


class LifeEvent(BaseModel):
    title: str = Field(min_length=1, max_length=80)
    date_hint: str = Field(default="", max_length=40)
    description: str = Field(min_length=1, max_length=240)


class BirthTimeRectifierRequest(BaseModel):
    location_name: str = Field(default="", max_length=160)
    chart: dict[str, Any]
    life_events: list[LifeEvent]
    language: Literal["zh", "en", "hi"] = "zh"


class RectifierDialogueMessage(BaseModel):
    role: Literal["assistant", "user"]
    content: str = Field(min_length=1, max_length=1200)


class BirthTimeRectifierDialogueRequest(BaseModel):
    location_name: str = Field(default="", max_length=160)
    chart: dict[str, Any]
    messages: list[RectifierDialogueMessage] = Field(default_factory=list, max_length=80)
    extracted_events: list[RectifierEventRequest] = Field(default_factory=list, max_length=12)
    language: Literal["zh", "en", "hi"] = "zh"
