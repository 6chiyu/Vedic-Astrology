import json
import os
import httpx
from typing import Any, Optional
from pathlib import Path


def get_reference_locations_path() -> Path:
    """获取参考位置数据文件的路径"""
    backend_dir = Path(__file__).parent.parent
    return backend_dir / "data" / "reference_locations.json"


def load_reference_locations() -> list[dict[str, Any]]:
    """加载参考位置数据"""
    try:
        path = get_reference_locations_path()
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception:
        pass
    return []


REFERENCE_LOCATIONS = load_reference_locations()


def search_local_locations(query: str) -> list[dict[str, Any]]:
    """在本地参考位置中搜索"""
    if not query or not REFERENCE_LOCATIONS:
        return []
    
    query_lower = query.lower()
    results: list[dict[str, Any]] = []
    
    for loc in REFERENCE_LOCATIONS:
        name_lower = loc.get("name", "").lower()
        country_lower = loc.get("country", "").lower()
        aliases = loc.get("aliases", [])
        
        # 检查名称、国家或别名是否匹配
        if (query_lower in name_lower or
            query_lower in country_lower or
            any(query_lower in alias.lower() for alias in aliases)):
            results.append({
                "place_id": loc.get("location_id"),
                "display_name": f"{loc.get('name')}, {loc.get('country')}",
                "lat": str(loc.get("latitude")),
                "lon": str(loc.get("longitude")),
                "address": {
                    "country": loc.get("country"),
                    "city": loc.get("name")
                }
            })
    
    return results


async def search_nominatim(query: str, language: str = "zh") -> list[dict[str, Any]]:
    """通过 Nominatim API 搜索位置"""
    accept_language = {
        "zh": "zh-CN,zh;q=0.9",
        "en": "en;q=0.9",
        "hi": "hi;q=0.9"
    }.get(language, "en;q=0.9")
    
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={
                    "q": query,
                    "format": "json",
                    "limit": "25",
                    "addressdetails": "1",
                    "accept-language": accept_language
                },
                headers={
                    "User-Agent": "VedicLight/1.0"
                }
            )
            if response.status_code == 200:
                return response.json()
    except Exception:
        pass
    
    return []


async def search_locations(query: str, language: str = "zh") -> list[dict[str, Any]]:
    """搜索位置 - 先尝试本地，再尝试 Nominatim"""
    # 首先搜索本地参考位置
    local_results = search_local_locations(query)
    
    # 如果本地结果不足，尝试 Nominatim
    if len(local_results) < 5:
        nominatim_results = await search_nominatim(query, language)
        # 合并结果，去重
        seen_ids = set()
        combined = []
        
        for res in local_results:
            seen_ids.add(res.get("place_id"))
            combined.append(res)
        
        for res in nominatim_results:
            if res.get("place_id") not in seen_ids:
                combined.append(res)
        
        return combined
    
    return local_results


async def reverse_geocode(lat: float, lon: float, language: str = "zh") -> Optional[dict[str, Any]]:
    """逆地理编码"""
    accept_language = {
        "zh": "zh-CN,zh;q=0.9",
        "en": "en;q=0.9",
        "hi": "hi;q=0.9"
    }.get(language, "en;q=0.9")
    
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                "https://nominatim.openstreetmap.org/reverse",
                params={
                    "format": "json",
                    "lat": str(lat),
                    "lon": str(lon),
                    "zoom": "10",
                    "accept-language": accept_language
                },
                headers={
                    "User-Agent": "VedicLight/1.0"
                }
            )
            if response.status_code == 200:
                return response.json()
    except Exception:
        pass
    
    return None
