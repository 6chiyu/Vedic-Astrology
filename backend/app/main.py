from contextlib import asynccontextmanager
import os

from app.birth_time_rectifier_service import generate_birth_time_rectification
from app.rectifier_dialogue_service import generate_birth_time_rectifier_dialogue
from app.chart_archive_service import save_birth_chart_archive
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from app.chart_reading_service import generate_chart_reading
from app.chart_service import calculate_birth_chart
from app.env_loader import load_local_env
from app.location_service import search_locations, reverse_geocode
from app.schemas import (
    BirthChartRequest,
    BirthTimeRectifierDialogueRequest,
    BirthTimeRectifierRequest,
    ChartReadingRequest,
    ResponseEnvelope,
)


def get_cors_origins() -> list[str]:
    origins_env = os.getenv("CORS_ORIGINS", "")
    if origins_env:
        return [origin.strip() for origin in origins_env.split(",") if origin.strip()]
    return ["http://localhost:3000", "http://127.0.0.1:3000"]


def get_api_port() -> int:
    port_str = os.getenv("API_PORT", "8000")
    try:
        return int(port_str)
    except ValueError:
        return 8000


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_local_env()
    try:
        from skyfield.api import load

        load.timescale()
        load("de421.bsp")
    except Exception:
        pass
    yield


app = FastAPI(title="AI 印度星盘轻量服务", version="0.2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/v1/birth-chart", response_model=ResponseEnvelope)
async def birth_chart(payload: BirthChartRequest) -> ResponseEnvelope:
    chart_payload = calculate_birth_chart(payload)
    chart_payload["storage"] = save_birth_chart_archive(payload, chart_payload)
    return ResponseEnvelope(data=chart_payload)


@app.post("/api/v1/chart-reading", response_model=ResponseEnvelope)
async def chart_reading(payload: ChartReadingRequest) -> ResponseEnvelope:
    return ResponseEnvelope(data=await generate_chart_reading(payload))


@app.post("/api/v1/birth-time-rectifier", response_model=ResponseEnvelope)
async def birth_time_rectifier(
    payload: BirthTimeRectifierRequest,
) -> ResponseEnvelope:
    return ResponseEnvelope(data=await generate_birth_time_rectification(payload))


@app.post("/api/v1/birth-time-rectifier/dialogue", response_model=ResponseEnvelope)
async def birth_time_rectifier_dialogue(
    payload: BirthTimeRectifierDialogueRequest,
) -> ResponseEnvelope:
    return ResponseEnvelope(data=await generate_birth_time_rectifier_dialogue(payload))


@app.get("/api/v1/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/v1/locations/search")
async def search_locations_endpoint(
    q: str = Query(..., description="搜索查询"),
    language: str = Query("zh", description="语言 (zh, en, hi)")
) -> ResponseEnvelope:
    """搜索位置"""
    results = await search_locations(q, language)
    return ResponseEnvelope(data=results)


@app.get("/api/v1/locations/reverse")
async def reverse_geocode_endpoint(
    lat: float = Query(..., description="纬度"),
    lon: float = Query(..., description="经度"),
    language: str = Query("zh", description="语言 (zh, en, hi)")
) -> ResponseEnvelope:
    """逆地理编码"""
    result = await reverse_geocode(lat, lon, language)
    return ResponseEnvelope(data=result)

