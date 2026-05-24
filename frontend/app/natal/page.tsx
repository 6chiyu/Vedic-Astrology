"use client";

import Link from "next/link";
import { type FormEvent, useState, useEffect, useRef } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  ArrowLeft,
  Check,
  Clock,
  Globe,
  Loader2,
  LocateFixed,
  Lock,
  MapPin,
  Orbit,
  Sparkles,
  Star,
  X,
} from "lucide-react";

type HouseItem = {
  house: number;
  sign: string;
  lord: string;
  nakshatra: string;
  pada: number | null;
  sign_degrees: number | null;
  bhava_bala: number | null;
  occupants: string[];
};

type PlanetItem = {
  planet: string;
  house: number;
  sign: string;
  degrees: number | null;
  nakshatra: string;
  pada: number | null;
  motion_type: string;
  dignity: string;
  lordship_houses: number[];
};

type DivisionalChartItem = {
  chart_key: string;
  label: string;
  ascendant_sign: string;
  source_house: number | null;
  focus: string;
};

type BirthChartResult = {
  profile: {
    name: string;
    birth_date: string;
    birth_time: string;
    latitude: number;
    longitude: number;
    timezone_offset: number;
  };
  chart: {
    lagna_sign: string;
    moon_sign: string;
    sun_sign: string;
    houses: HouseItem[];
    planets: PlanetItem[];
    divisional_charts: DivisionalChartItem[];
  };
  panchanga: {
    nakshatra: string;
    tithi: string;
    yoga: string;
    karana: string;
    vaara: string;
  };
  dasha: {
    current: string;
    mahadasha: {
      name: string;
      start: string;
      end: string;
      duration: number;
    } | null;
    antardasha: Array<{
      name: string;
      start: string;
      end: string;
      duration: number;
    }> | null;
    pratyantardasha: any | null;
    balance: any;
    upcoming: Array<{
      name: string;
      start: string;
      end: string;
      duration: number;
    }> | null;
    all: Array<{
      name: string;
      start: string;
      end: string;
      duration: number;
    }> | null;
  };
  meta: {
    engine: string;
    ayanamsa: string;
    available_modules: string[];
    report_scope: string[];
    warning?: string;
  };
};

type ReadingFocus = "core" | "career" | "love";

type ChartReadingResult = {
  answer: string;
  model: string;
  focus: ReadingFocus;
  skill_bundle: {
    name: string;
    path: string;
    mode: string;
  };
};

type LocationSuggestion = {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
  address?: any;
};

type PopularCity = {
  name: string;
  lat: string;
  lon: string;
  timezone: string;
};

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

function formatTimezoneOffset(rawOffset: number) {
  const sign = rawOffset >= 0 ? "+" : "-";
  const absolute = Math.abs(rawOffset);
  const hours = Math.trunc(absolute);
  const minutes = Math.round((absolute - hours) * 60);
  return `UTC${sign}${hours}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""}`;
}

function calculateTimezoneFromLongitude(longitude: number): number {
  const timezone = Math.round(longitude / 15);
  
  if (timezone > 12) return 12;
  if (timezone < -12) return -12;
  
  return timezone;
}

export default function NatalPage() {
  const { t, language } = useLanguage();
  
  const pricingPlans = [
    {
      name: t.pricing.free.name,
      price: t.pricing.free.price,
      badge: t.pricing.free.badge,
      items: t.pricing.free.features,
    },
    {
      name: t.pricing.standard.name,
      price: t.pricing.standard.price,
      badge: t.pricing.standard.badge,
      items: t.pricing.standard.features,
    },
    {
      name: t.pricing.yearly.name,
      price: t.pricing.yearly.price,
      badge: t.pricing.yearly.badge,
      items: t.pricing.yearly.features,
    },
  ];

  // 阅读焦点的翻译键映射
  const getReadingPrompt = (focus: ReadingFocus): string => {
    const prompts = t.natal.readingPrompts;
    if (prompts && prompts[focus]) {
      return prompts[focus];
    }
    // 回退到默认提示
    const defaultPrompts = {
      core: "请基于这张印度星盘做一份整体解读，重点说明核心性格、优势、风险和下一步观察重点。",
      career: "请基于这张印度星盘做一份事业解读，重点说明职业结构、适合的方向、当前阶段和行动建议。",
      love: "请基于这张印度星盘做一份感情解读，重点说明关系模式、伴侣主题、当前窗口和行动建议。"
    };
    return defaultPrompts[focus];
  };
  
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("1996-07-04");
  const [birthTime, setBirthTime] = useState("09:10");
  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [timezone, setTimezone] = useState("8");
  
  // 常用国家列表（全球覆盖）
  const COMMON_COUNTRIES = [
    // 亚洲
    "中国", "日本", "韩国", "朝鲜", "蒙古", "印度", "巴基斯坦", "孟加拉国",
    "尼泊尔", "斯里兰卡", "马尔代夫", "泰国", "越南", "老挝", "柬埔寨", "缅甸",
    "马来西亚", "新加坡", "印度尼西亚", "菲律宾", "文莱", "东帝汶",
    "土耳其", "沙特阿拉伯", "伊朗", "伊拉克", "以色列", "约旦", "黎巴嫩",
    "叙利亚", "阿联酋", "卡塔尔", "科威特", "巴林", "阿曼", "也门",
    // 欧洲
    "英国", "法国", "德国", "意大利", "西班牙", "葡萄牙", "荷兰", "比利时",
    "瑞士", "奥地利", "波兰", "捷克", "斯洛伐克", "匈牙利", "罗马尼亚",
    "希腊", "瑞典", "挪威", "丹麦", "芬兰", "冰岛", "爱尔兰",
    "俄罗斯", "乌克兰", "白俄罗斯", "爱沙尼亚", "拉脱维亚", "立陶宛",
    // 非洲
    "埃及", "南非", "摩洛哥", "阿尔及利亚", "突尼斯", "利比亚", "苏丹",
    "埃塞俄比亚", "肯尼亚", "坦桑尼亚", "尼日利亚", "加纳", "科特迪瓦",
    // 北美洲
    "美国", "加拿大", "墨西哥", "古巴", "牙买加", "海地", "多米尼加",
    "危地马拉", "洪都拉斯", "萨尔瓦多", "尼加拉瓜", "哥斯达黎加", "巴拿马",
    // 南美洲
    "巴西", "阿根廷", "智利", "哥伦比亚", "秘鲁", "委内瑞拉", "厄瓜多尔",
    "玻利维亚", "乌拉圭", "巴拉圭",
    // 大洋洲
    "澳大利亚", "新西兰", "巴布亚新几内亚", "斐济",
  ];
  
  // 页面加载时自动获取位置
  const [hasAutoLocated, setHasAutoLocated] = useState(false);
  const [hasManualInput, setHasManualInput] = useState(false);
  const [previousSearchQuery, setPreviousSearchQuery] = useState("");
  const [searchLevel, setSearchLevel] = useState<"country" | "state" | "city" | "district">("country");
  const [result, setResult] = useState<BirthChartResult | null>(null);
  const [readingFocus, setReadingFocus] = useState<ReadingFocus>("core");
  const [readingResult, setReadingResult] = useState<ChartReadingResult | null>(
    null
  );
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [isLoadingReading, setIsLoadingReading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState("");
  const [readingError, setReadingError] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showRectifier, setShowRectifier] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [rectifierMessages, setRectifierMessages] = useState<Array<{role: string; content: string}>>([]);
  const [rectifierInput, setRectifierInput] = useState("");
  const [isLoadingRectifier, setIsLoadingRectifier] = useState(false);
  const [rectifierResult, setRectifierResult] = useState<{
    suggested_time: string;
    time_range: string;
    confidence: string;
    summary: string;
    events: Array<{title: string; date_hint: string; description: string}>;
  } | null>(null);
  // 根据当前语言设置不耐烦关键词
  const impatientKeywords = 
    language === 'zh' ? ["烦", "不耐烦", "快点", "快点吧", "浪费时间", "还有多久", "能不能", "麻烦", "太啰嗦", "直接说", "不用说了", "说重点", "直接一点", "别啰嗦", "够了"] :
    language === 'hi' ? ["परेशान", "अधीर", "जल्दी करो", "जल्दी करो यार", "समय बर्बाद", "कब तक", "क्या कर सकते हो", "परेशान", "बहुत बातें", "सीधे कहो", "बोलो मत", "मुख्य बात", "सीधा", "बकवास मत करो", "बस"] :
    ["annoy", "impatient", "hurry", "hurry up", "waste time", "how long", "can we", "trouble", "too wordy", "direct", "stop talking", "get to the point", "straightforward", "stop rambling", "enough"];
  
  // 记录之前的语言，用于检测语言切换
  const [previousLanguage, setPreviousLanguage] = useState(language);
  
  // 当语言切换时，用新语言重新生成解读（如果已有结果）
  useEffect(() => {
    if (previousLanguage !== language) {
      // 如果已经有星盘和解锁了结果，用新语言自动重新生成
      if (result && readingResult) {
        // 延迟一点执行，确保翻译内容已更新
        setTimeout(() => {
          requestReading(result, readingFocus);
        }, 100);
      }
      
      // 清空出生时间矫正器的内容（如果在使用中）
      setRectifierMessages([]);
      setRectifierResult(null);
      
      // 清空位置搜索结果
      setLocationSuggestions([]);
      setLocationMessage("");
      
      setPreviousLanguage(language);
  }
  }, [language, previousLanguage, result, readingResult, readingFocus]);
  
  // 防抖相关
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const canGenerate =
    Boolean(name.trim()) &&
    Boolean(locationName.trim()) &&
    Boolean(birthDate) &&
    Boolean(birthTime) &&
    Boolean(latitude) &&
    Boolean(longitude) &&
    Boolean(timezone);

  // 清理AI解读内容中的多余字符，但保留完整内容
  // 页面加载时自动获取位置
  useEffect(() => {
    if (!hasAutoLocated) {
      handleAutoLocation();
      setHasAutoLocated(true);
    }
  }, [hasAutoLocated]);

  function cleanReadingContent(text: string): string {
    return text
      .trim();
  }

  // 检测用户是否不耐烦
  function isUserImpatient(message: string): boolean {
    const lowerMsg = message.toLowerCase();
    return impatientKeywords.some(keyword => 
      lowerMsg.includes(keyword.toLowerCase()));
  }

  async function requestReading(chart: BirthChartResult, focus: ReadingFocus) {
    setIsLoadingReading(true);
    setReadingFocus(focus);
    setReadingError("");
    setReadingResult(null); // 切换时先清空，确保及时切换

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/chart-reading`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          focus,
          question: getReadingPrompt(focus),
          location_name: locationName.trim(),
          chart,
          language: language, // 传递当前语言给API
        }),
      });

      if (!response.ok) {
        throw new Error(t.errors.aiReadingUnavailable);
      }

      const payload = (await response.json()) as { data: ChartReadingResult };
      // 清理解读内容
      payload.data.answer = cleanReadingContent(payload.data.answer);
      setReadingResult(payload.data);
    } catch (nextError) {
      setReadingResult(null);
      setReadingError(
        nextError instanceof Error ? nextError.message : t.errors.aiReadingFailed
      );
    } finally {
      setIsLoadingReading(false);
    }
  }


  // 尝试通过逆地理编码获取位置名称
  async function reverseGeocode(lat: string, lon: string): Promise<string> {
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/v1/locations/reverse?lat=${lat}&lon=${lon}&language=${language}`,
        {
          headers: {
            "Accept": "application/json",
          },
        }
      );
      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.display_name) {
          // 使用我们的简单地址格式化函数
          return simpleFormatAddress(result.data.display_name);
        }
      }
    } catch (error) {
      // 静默处理逆地理编码错误，不显示在控制台
      // 因为这只是一个增强功能，不是核心功能
    }
    return t.locationMessages.locatedPosition;
  }

  async function handleAutoLocation() {
    // 如果用户已经手动输入了位置，不覆盖
    if (hasManualInput) {
      setLocationMessage(t.locationMessages.autoDetectDetected);
      return;
    }

    setLocationMessage(t.locationMessages.detectingLocation);

    if (!navigator.geolocation) {
      setLocationMessage(t.locationMessages.browserNotSupported);
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextLatitude = position.coords.latitude.toFixed(4);
        const nextLongitude = position.coords.longitude.toFixed(4);
        const nextTimezone = String(-(new Date().getTimezoneOffset() / 60));

        setLatitude(nextLatitude);
        setLongitude(nextLongitude);
        setTimezone(nextTimezone);
        
        // 尝试获取位置名称
        setLocationName(t.locationMessages.gettingLocationName);
        try {
          const geoName = await reverseGeocode(nextLatitude, nextLongitude);
          setLocationName(geoName);
          setLocationMessage(`${t.locationMessages.locationSuccess} ${t.locationMessages.coordinates || '位置'}: ${geoName}，${nextLatitude}, ${nextLongitude}`);
        } catch {
          setLocationName(t.locationMessages.locatedPosition);
          setLocationMessage(`${t.locationMessages.locationSuccess} ${t.locationMessages.coordinates || '坐标'}: ${nextLatitude}, ${nextLongitude}`);
        }
        
        setIsLocating(false);
      },
      () => {
        setLocationMessage(t.locationMessages.locationFailed);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  async function handleLocationSearch(query: string) {
    // 清除之前的防抖计时器
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.length < 1) {
      setLocationSuggestions([]);
      return;
    }

    // 用户开始手动输入，标记为已手动输入
    setHasManualInput(true);

    // 设置新的防抖计时器
    debounceTimer.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      setLocationMessage(t.locationMessages.searching);
      
      try {
        // 使用后端代理 API 搜索位置
        const response = await fetch(
          `${apiBaseUrl}/api/v1/locations/search?q=${encodeURIComponent(query)}&language=${language}`,
          {
            headers: {
              "Accept": "application/json",
            },
          }
        );
        
        let data: any[] = [];
        if (response.ok) {
          const result = await response.json();
          data = result.data || [];
        }
        
        // 智能排序：优先显示更精确的匹配（区县 > 市 > 省）
        data.sort((a, b) => {
          const getPrecisionScore = (item: any) => {
            if (!item.address) return 0;
            let score = 0;
            // 区县级别最高
            if (item.address.district || item.address.county || item.address.city_district) score += 100;
            // 区县级别的地点类型
            if (item.type === 'administrative' && item.address?.city_district) score += 50;
            // 城市级别
            if (item.address.city || item.address.town) score += 30;
            // 更大的区域
            if (item.address.province || item.address.state) score += 10;
            return score;
          };
          
          return getPrecisionScore(b) - getPrecisionScore(a);
        });

        console.log("最终搜索结果:", data);
        
        // 格式化地址
        const suggestions = data.map((item: any) => ({
          ...item,
          display_name: simpleFormatAddress(item.display_name, item.address),
        }));
        setLocationSuggestions(suggestions);
        
        if (suggestions.length === 0) {
          setLocationMessage(""); // 清空提示信息
        } else {
          setLocationMessage(t.locationMessages.foundResults.replace('{count}', String(suggestions.length)));
        }
      } catch (error) {
        console.error("搜索错误:", error);
        setLocationSuggestions([]);
        setLocationMessage(""); // 清空提示信息
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300); // 300ms防抖
  }

  // 构建多层次搜索查询（支持从大到小的层级搜索）
  function buildSearchQueries(query: string): string[] {
    const queries: string[] = [];
    
    // 清理输入的查询
    const cleanQuery = query.trim();
    
    // 直接查询（最高优先级）
    queries.push(cleanQuery);
    
    // 尝试拆分复合地址并生成所有可能的组合
    const separators = /[，,\s>＞]+/;
    const parts = cleanQuery.split(separators).filter(p => p.trim() && p.trim().length > 0);
    
    if (parts.length > 1) {
      // 完整组合（最高优先级）
      queries.push(parts.join(' '));
      
      // 生成从大到小的连续子组合（层级搜索的关键）
      // 例如："日本 东京 涩谷" -> "日本 东京 涩谷", "日本 东京", "日本"
      for (let len = parts.length; len >= 1; len--) {
        const subCombination = parts.slice(0, len).join(' ');
        queries.push(subCombination);
      }
      
      // 也尝试从后向前的组合
      // 例如："日本 东京 涩谷" -> "东京 涩谷", "涩谷"
      for (let start = 1; start < parts.length; start++) {
        const subCombination = parts.slice(start).join(' ');
        queries.push(subCombination);
      }
      
      // 尝试逆序组合
      queries.push([...parts].reverse().join(' '));
    }
    
    // 尝试添加常见后缀（区县优先）
    const chineseSuffixes = ['区', '县', '市', '街道', '镇', '乡', '村', '省'];
    for (const suffix of chineseSuffixes) {
      if (!cleanQuery.endsWith(suffix)) {
        queries.push(`${cleanQuery}${suffix}`);
        
        // 如果有多个部分，给最后一部分加上后缀
        if (parts.length > 0) {
          const lastPart = parts[parts.length - 1];
          if (!lastPart.endsWith(suffix)) {
            const newParts = [...parts.slice(0, -1), `${lastPart}${suffix}`];
            queries.push(newParts.join(' '));
          }
        }
      }
    }
    
    // 尝试去掉后缀（如果有的话）
    for (const suffix of chineseSuffixes) {
      if (cleanQuery.endsWith(suffix)) {
        const withoutSuffix = cleanQuery.slice(0, -suffix.length);
        if (withoutSuffix.length > 0) {
          queries.push(withoutSuffix);
        }
      }
    }
    
    // 对于中文地址，尝试加上中国
    if (/[\u4e00-\u9fa5]/.test(cleanQuery) && !cleanQuery.includes('中国') && !cleanQuery.includes('china')) {
      queries.push(`${cleanQuery} 中国`);
      
      // 如果有多个部分，也给每个组合加上中国
      if (parts.length > 1) {
        queries.push(`${parts.join(' ')} 中国`);
      }
    }
    
    // 英文变体
    queries.push(`${cleanQuery} China`);
    
    // 如果只输入了国家，尝试搜索该国家的主要城市
    if (parts.length === 1 && COMMON_COUNTRIES.includes(cleanQuery)) {
      const countryCities: Record<string, string[]> = {
        "中国": ["北京", "上海", "广州", "深圳", "杭州", "成都"],
        "日本": ["东京", "大阪", "京都", "横滨", "名古屋"],
        "韩国": ["首尔", "釜山", "仁川"],
        "美国": ["纽约", "洛杉矶", "芝加哥", "休斯顿", "凤凰城"],
        "英国": ["伦敦", "曼彻斯特", "伯明翰"],
        "法国": ["巴黎", "里昂", "马赛"],
        "德国": ["柏林", "慕尼黑", "汉堡"],
        "加拿大": ["多伦多", "温哥华", "蒙特利尔"],
        "澳大利亚": ["悉尼", "墨尔本", "布里斯班"],
        "印度": ["新德里", "孟买", "加尔各答"],
        "新加坡": ["新加坡市"],
        "马来西亚": ["吉隆坡", "槟城"],
        "泰国": ["曼谷", "清迈", "普吉"],
        "越南": ["河内", "胡志明市"],
        "俄罗斯": ["莫斯科", "圣彼得堡"],
        "巴西": ["圣保罗", "里约热内卢"],
      };
      
      if (countryCities[cleanQuery]) {
        countryCities[cleanQuery].forEach(city => {
          queries.push(`${cleanQuery} ${city}`);
          queries.push(`${city} ${cleanQuery}`);
        });
      }
    }
    
    // 去重并限制数量
    const uniqueQueries = Array.from(new Set(queries));
    return uniqueQueries.slice(0, 20); // 最多20个查询，提高搜索效率
  }

  // 智能地址格式化，支持全球各地
  function simpleFormatAddress(displayName: string, address?: any): string {
    if (!displayName) return "";
    
    // 如果有address对象，优先使用它来构建更清晰的地址
    if (address) {
      const parts: string[] = [];
      
      // 收集地址层级（从小到大）
      if (address.suburb) parts.push(address.suburb);
      if (address.village) parts.push(address.village);
      if (address.neighbourhood) parts.push(address.neighbourhood);
      
      // 城市级别
      if (address.city) parts.push(address.city);
      else if (address.town) parts.push(address.town);
      else if (address.county) parts.push(address.county);
      else if (address.municipality) parts.push(address.municipality);
      else if (address.city_district) parts.push(address.city_district);
      else if (address.district) parts.push(address.district);
      
      // 省份/州级别
      if (address.province) parts.push(address.province);
      else if (address.state) parts.push(address.state);
      else if (address.region) parts.push(address.region);
      
      // 国家
      if (address.country && parts.length < 3) parts.push(address.country);
      
      // 如果找到了合适的部分
      if (parts.length > 0) {
        // 去重
        const uniqueParts: string[] = [];
        const seen = new Set<string>();
        for (const part of parts) {
          if (!seen.has(part)) {
            seen.add(part);
            uniqueParts.push(part);
          }
        }
        // 取最多3个有意义的部分
        return uniqueParts.slice(0, 3).join('，');
      }
    }
    
    // 回退到解析 displayName
    const parts = displayName.split(',').map(p => p.trim()).filter(p => p);
    
    // 检测是否是中文地址
    const isChinese = displayName.includes('China') || 
                      displayName.includes('中国') || 
                      /[\u4e00-\u9fa5]/.test(displayName);
    
    if (isChinese) {
      // 对于中文地址，优化显示
      const result: string[] = [];
      let foundCity = false;
      
      for (const part of parts) {
        // 优先找城市和省份
        if (part.includes('市') || part.includes('区') || part.includes('县')) {
          if (!foundCity) {
            result.push(part);
            foundCity = true;
          }
        } else if (part.includes('省') || part.includes('自治区') || 
                   part.includes('北京') || part.includes('上海') || 
                   part.includes('天津') || part.includes('重庆')) {
          result.push(part);
        }
        // 限制结果数量
        if (result.length >= 2) break;
      }
      
      if (result.length > 0) {
        return result.join('，');
      }
    }
    
    // 对于英文或其他地址，取前面几个有意义的部分
    // 跳过数字和邮政代码
    const filteredParts = parts.filter(part => {
      return !/^\d+$/.test(part) && part.length > 1;
    });
    
    return filteredParts.slice(0, Math.min(3, filteredParts.length)).join(', ');
  }

  function handleSelectLocation(suggestion: LocationSuggestion) {
    const displayName = simpleFormatAddress(suggestion.display_name, suggestion.address);
    setLocationName(displayName);
    setLatitude(suggestion.lat);
    setLongitude(suggestion.lon);
    setLocationSuggestions([]);
    
    const lon = Number(suggestion.lon);
    let autoTimezone = 8;
    if (!isNaN(lon)) {
      autoTimezone = calculateTimezoneFromLongitude(lon);
      setTimezone(String(autoTimezone));
    }
    
    // 显示位置确认信息
    setLocationMessage(`${t.locationMessages.selectPosition}，${t.locationMessages.coordinates || '坐标'}: ${suggestion.lat}, ${suggestion.lon}`);
  }

  async function handleSendRectifierMessage() {
    if (!rectifierInput.trim() || isLoadingRectifier) return;

    const userMessage = { role: "user", content: rectifierInput };
    setRectifierMessages((prev) => [...prev, userMessage]);
    setRectifierInput("");
    setIsLoadingRectifier(true);

    // 检测用户是否不耐烦
    const isImpatient = isUserImpatient(userMessage.content);

    try {
      let messagesToSend = [...rectifierMessages, userMessage];
      
      // 如果用户不耐烦，添加提示让AI给出推测
      if (isImpatient) {
        const impatientHintMessage = { role: "user", content: t.rectifier.impatientHint };
        messagesToSend = [...messagesToSend, impatientHintMessage];
      }

      const response = await fetch(`${apiBaseUrl}/api/v1/birth-time-rectifier/dialogue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messagesToSend,
          chart: result,
          birth_time: birthTime,
          language: language, // 传递当前语言给API
        }),
      });

      if (response.ok) {
        const payload = await response.json();
        let assistantContent = payload.data.assistant_message;
        
        // 如果用户不耐烦，添加安抚和推理说明
        if (isImpatient) {
          const prefix = language === 'zh' ? "理解您的心情，让我直接根据当前信息给出推测：\n\n" :
                         language === 'hi' ? "आपकी भावनाओं को समझते हैं, मैं सीधे वर्तमान जानकारी के आधार पर अनुमान देता हूं：\n\n" :
                         "I understand your feelings, let me give an estimate directly based on the current information:\n\n";
          const suffix = language === 'zh' ? "\n\n如果您还有其他重要的人生事件可以补充，我可以进一步精确这个时间。出生时间的校正需要多个生命节点的印证才能更准确，但目前的推测已经可以作为一个有价值的参考了。" :
                        language === 'hi' ? "\n\nयदि आप कोई अन्य महत्वपूर्ण जीवन घटना जोड़ सकते हैं, तो मैं इस समय को और सटीक कर सकता हूं। जन्म समय के सुधार के लिए कई जीवन घटनाओं की पुष्टि की आवश्यकता होती है, लेकिन वर्तमान अनुमान पहले से ही एक मूल्यवान संदर्भ के रूप में काम कर सकता है।" :
                        "\n\nIf you have other important life events to add, I can further refine this time. Birth time rectification requires confirmation from multiple life events to be more accurate, but the current estimate can already serve as a valuable reference.";
          assistantContent = prefix + 
            (payload.data.assistant_message || "") + 
            suffix;
        }

        const assistantMessage = {
          role: "assistant",
          content: assistantContent,
        };
        setRectifierMessages((prev) => [...prev, assistantMessage]);

        // 如果用户不耐烦，直接给出当前可能的推测结果
        if (!payload.data.should_continue || isImpatient) {
          setRectifierResult({
            suggested_time: payload.data.suggested_time || "基于现有数据的推测",
            time_range: payload.data.time_range || "±30分钟",
            confidence: payload.data.confidence || "中等",
            summary: payload.data.summary || "这是根据您提供的信息进行的综合推测，建议您可以结合更多人生事件进行验证。",
            events: payload.data.events || [],
          });
        }
      }
    } catch {
      const errorMessage = {
        role: "assistant",
        content: t.rectifier.errorMessage,
      };
      setRectifierMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoadingRectifier(false);
    }
  }

  async function handleStartRectifier() {
    setShowRectifier(true);
    setRectifierMessages([]);
    setRectifierResult(null);
    setIsLoadingRectifier(true);
    
    // 发送一个初始对话请求，让AI先问问题
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/birth-time-rectifier/dialogue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [],
          extracted_events: [],
          chart: result,
          birth_time: birthTime,
          location_name: locationName,
          language: language, // 传递当前语言给API
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // 添加AI的第一个问题
        setRectifierMessages([
          {
            role: "assistant",
            content: data.data.assistant_message || t.rectifier.initialGreeting,
          },
        ]);
      }
    } catch {
      // 出错时给一个默认问题
      setRectifierMessages([
        {
          role: "assistant",
          content: t.rectifier.initialGreeting,
        },
      ]);
    } finally {
      setIsLoadingRectifier(false);
    }
  }

  function handleExportPDF() {
    if (!readingResult) return;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>AI Reading Export</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; }
    h1 { color: #1C1917; }
    .content { white-space: pre-wrap; line-height: 1.6; }
    .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>AI Reading Export</h1>
  <div class="meta">
    <p>Model: ${readingResult.model}</p>
    <p>Focus: ${readingResult.focus}</p>
    <p>Skill: ${readingResult.skill_bundle.name}</p>
  </div>
  <div class="content">${readingResult.answer}</div>
</body>
</html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setReadingError("");
    setReadingResult(null);
    setResult(null);
    setLocationSuggestions([]);

    if (!canGenerate) {
      setError(t.errors.pleaseFillCompleteInfo);
      return;
    }

    setIsLoadingChart(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/birth-chart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          birth_date: birthDate,
          birth_time: birthTime,
          latitude: Number(latitude),
          longitude: Number(longitude),
          timezone_offset: Number(timezone),
          language: language, // 传递当前语言给API
        }),
      });

      if (!response.ok) {
        throw new Error(t.errors.chartGenerationFailed);
      }

      const payload = (await response.json()) as { data: BirthChartResult };
      setResult(payload.data);
      setLocationSuggestions([]);
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : t.errors.chartGenerationFailed
      );
    } finally {
      setIsLoadingChart(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-6xl">
        <Link
          className="focus-ring inline-flex items-center gap-2 text-sm text-black/62"
          href="/"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {t.common.back}
        </Link>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="glass-panel rounded-[32px] p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.24em] text-[#A16207]">
              {t.natalPage.chartWorkspace}
            </p>
            <h1 className="mt-4 text-5xl leading-[0.96] text-[#0C0A09]">
              {t.natal.title}
            </h1>
            <p className="mt-4 text-sm leading-7 text-black/66">
              {t.natal.subtitle}
            </p>

            <form
              className="mt-8 grid gap-4"
              onSubmit={(event) => void handleSubmit(event)}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label
                  className="grid gap-2 text-sm font-medium"
                  htmlFor="name"
                >
                  {t.natal.form.name}
                  <input
                    className="focus-ring h-12 rounded-2xl border border-black/10 bg-white/70 px-4 text-sm outline-none"
                    id="name"
                    onChange={(event) => setName(event.target.value)}
                    placeholder={t.natal.form.namePlaceholder}
                    required
                    value={name}
                  />
                </label>
                <div className="relative">
                  <label
                    className="grid gap-2 text-sm font-medium"
                    htmlFor="location"
                  >
                    {t.natal.form.location}
                    <div className="relative">
                      <input
                        className="focus-ring h-12 w-full rounded-2xl border border-black/10 bg-white/70 px-4 pr-12 text-sm outline-none"
                        id="location"
                        onChange={(event) => {
                          const value = event.target.value;
                          setLocationName(value);
                          setPreviousSearchQuery(value);
                          void handleLocationSearch(value);
                        }}
                        placeholder={t.natal.form.locationPlaceholder}
                        required
                        value={locationName}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isLoadingSuggestions ? (
                          <Loader2 className="h-4 w-4 animate-spin text-black/40" />
                        ) : isLocating ? (
                          <Loader2 className="h-4 w-4 animate-spin text-black/40" />
                        ) : (
                          <button
                            onClick={handleAutoLocation}
                            type="button"
                            className="text-black/40 hover:text-amber-600 transition-colors"
                            title={t.natal.autoLocation.button}
                          >
                            <LocateFixed className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </label>
                  
                  {/* 搜索结果下拉菜单 */}
                  {locationSuggestions.length > 0 && (
                    <div className="absolute z-50 mt-2 w-full rounded-2xl border border-gray-200 bg-white shadow-2xl max-h-[400px] overflow-y-auto">
                      {/* 搜索提示 */}
                      <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
                        <p className="text-xs text-amber-700 flex items-center gap-2">
                          <Globe className="h-3 w-3" />
                          {t.natal.location.searchHint}
                        </p>
                      </div>
                      
                      {/* 搜索结果 */}
                      <div className="px-2 py-2">
                        {locationSuggestions.slice(0, 15).map((suggestion) => (
                          <button
                            key={suggestion.place_id}
                            className="w-full px-3 py-3 text-left hover:bg-amber-50 rounded-xl transition-colors"
                            onClick={() => handleSelectLocation(suggestion)}
                            type="button"
                          >
                            <div className="flex items-start gap-3">
                              <MapPin className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-900">
                                  {simpleFormatAddress(suggestion.display_name, suggestion.address)}
                                </div>
                                <div className="mt-1 text-xs text-gray-500 truncate">
                                  {suggestion.display_name}
                                </div>
                                <div className="mt-1 text-xs text-amber-600">
                                  {t.locationMessages.coordinates || '坐标'}: {Number(suggestion.lat).toFixed(4)}, {Number(suggestion.lon).toFixed(4)}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      {/* 常用国家快捷选择 */}
                      {locationName.length === 0 && (
                        <div className="border-t border-gray-100">
                          <div className="px-4 py-2 bg-gray-50">
                            <p className="text-xs font-medium text-gray-500">{t.natal.location.countries}（{t.natal.location.clickToFill}）</p>
                          </div>
                          <div className="p-3">
                            <div className="flex flex-wrap gap-2">
                              {COMMON_COUNTRIES.map((country, index) => (
                                <button
                                  key={`country-${index}`}
                                  className="px-3 py-1.5 text-xs text-gray-700 hover:bg-amber-100 hover:text-amber-800 rounded-full border border-gray-200 transition-colors"
                                  onClick={() => {
                                    setLocationName(country);
                                    void handleLocationSearch(country);
                                  }}
                                  type="button"
                                >
                                  {country}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label
                  className="grid gap-2 text-sm font-medium"
                  htmlFor="birth-date"
                >
                  {t.natal.form.date}
                  <input
                    className="focus-ring h-12 rounded-2xl border border-black/10 bg-white/70 px-4 text-sm outline-none"
                    id="birth-date"
                    onChange={(event) => setBirthDate(event.target.value)}
                    required
                    type="date"
                    value={birthDate}
                  />
                </label>
                <label
                  className="grid gap-2 text-sm font-medium"
                  htmlFor="birth-time"
                >
                  {t.natal.form.time}
                  <input
                    className="focus-ring h-12 rounded-2xl border border-black/10 bg-white/70 px-4 text-sm outline-none"
                    id="birth-time"
                    onChange={(event) => setBirthTime(event.target.value)}
                    required
                    type="time"
                    value={birthTime}
                  />
                </label>
              </div>

              <div className="rounded-[26px] border border-black/8 bg-white/60 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#0C0A09]">
                      {t.natal.autoLocation.hint}
                    </p>
                    <p className="mt-1 text-sm text-black/58">
                      {t.natal.autoLocation.hintDetail}
                    </p>
                  </div>
                  <button
                    className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black/10 bg-white/78 px-5 text-sm font-medium text-black/72 disabled:opacity-60"
                    disabled={isLocating}
                    onClick={handleAutoLocation}
                    type="button"
                  >
                    {isLocating ? (
                      <Loader2
                        aria-hidden="true"
                        className="h-4 w-4 animate-spin"
                      />
                    ) : (
                      <LocateFixed aria-hidden="true" className="h-4 w-4" />
                    )}
                    {isLocating ? t.natal.autoLocation.locating : t.natal.autoLocation.button}
                  </button>
                </div>
                {locationMessage ? (
                  <p className="mt-3 text-sm text-[#A16207]">
                    {locationMessage}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label
                  className="grid gap-2 text-sm font-medium"
                  htmlFor="latitude"
                >
                  {t.natal.form.latitude}
                  <input
                    className="focus-ring h-12 rounded-2xl border border-black/10 bg-white/70 px-4 text-sm outline-none"
                    id="latitude"
                    onChange={(event) => setLatitude(event.target.value)}
                    placeholder="31.2304"
                    required
                    step="any"
                    type="number"
                    value={latitude}
                  />
                </label>
                <label
                  className="grid gap-2 text-sm font-medium"
                  htmlFor="longitude"
                >
                  {t.natal.form.longitude}
                  <input
                    className="focus-ring h-12 rounded-2xl border border-black/10 bg-white/70 px-4 text-sm outline-none"
                    id="longitude"
                    onChange={(event) => setLongitude(event.target.value)}
                    placeholder="121.4737"
                    required
                    step="any"
                    type="number"
                    value={longitude}
                  />
                </label>
                <label
                  className="grid gap-2 text-sm font-medium"
                  htmlFor="timezone"
                >
                  {t.natal.form.timezone}
                  <input
                    className="focus-ring h-12 rounded-2xl border border-black/10 bg-white/70 px-4 text-sm outline-none"
                    id="timezone"
                    onChange={(event) => setTimezone(event.target.value)}
                    placeholder="8"
                    required
                    step="0.5"
                    type="number"
                    value={timezone}
                  />
                </label>
              </div>

              <button
                className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#1C1917] px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!canGenerate || isLoadingChart}
                type="submit"
              >
                {isLoadingChart ? (
                  <Loader2
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <Orbit aria-hidden="true" className="h-4 w-4" />
                )}
                {isLoadingChart ? t.natal.generating : t.natal.submit}
              </button>

              {error ? (
                <p
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}
            </form>
          </div>

          <div className="glass-panel rounded-[32px] p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.24em] text-[#A16207]">
              {t.natalPage.premiumLogic}
            </p>
            <h2 className="mt-4 text-4xl leading-tight text-[#0C0A09]">
              {t.natal.premiumTitle}
            </h2>
            <div className="mt-6 grid gap-3">
              {[
                t.natal.subtitle,
                t.home.features.ai.title,
                t.home.features.ai.desc
              ].map((item) => (
                <div
                  className="rounded-2xl border border-black/8 bg-white/72 px-4 py-4 text-sm leading-7 text-black/68"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
            <button
              className="focus-ring mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#A16207] px-6 text-sm font-semibold text-white"
              onClick={() => setShowPricingModal(true)}
              type="button"
            >
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              {t.pricing?.standard?.cta || "查看付费方案"}
            </button>
          </div>
        </section>

        {result ? (
          <>
            <section className="mt-6 glass-panel rounded-[32px] p-6 md:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#A16207]">
                    {t.natalPage.chartSummary}
                  </p>
                  <h2 className="mt-3 text-4xl text-[#0C0A09]">
                    {result.profile.name}{t.natal.resultTitle}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-black/66">
                    {result.profile.birth_date} {result.profile.birth_time} ·{" "}
                    {locationName}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.meta.available_modules.map((item) => (
                    <span
                      className="rounded-full border border-black/8 bg-white/72 px-3 py-1 text-xs uppercase tracking-[0.12em] text-black/56"
                      key={item}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                {[
                  [t.result.lagna, result.chart.lagna_sign],
                  [t.result.moonSign, result.chart.moon_sign],
                  [t.result.sunSign, result.chart.sun_sign],
                  [t.result.dasha.current, result.dasha.current],
                ].map(([label, value]) => (
                  <div
                    className="rounded-[24px] border border-black/8 bg-white/72 p-4"
                    key={label}
                  >
                    <p className="text-xs uppercase tracking-[0.14em] text-black/42">
                      {label}
                    </p>
                    <p className="mt-3 text-2xl text-[#0C0A09]">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-black/42">
                      <th className="text-left font-medium">{t.result.tableHeaders.house}</th>
                      <th className="text-left font-medium">{t.result.sign}</th>
                      <th className="text-left font-medium">{t.result.lord}</th>
                      <th className="text-left font-medium">{t.result.tableHeaders.planets}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.chart.houses.map((house) => (
                      <tr key={house.house} className="border-t border-black/8">
                        <td className="py-3 text-sm">{house.house}</td>
                        <td className="py-3 text-sm">{house.sign}</td>
                        <td className="py-3 text-sm">{house.lord}</td>
                        <td className="py-3 text-sm">
                          {house.occupants.length > 0
                            ? house.occupants.join(", ")
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-black/42">
                      <th className="text-left font-medium">{t.result.tableHeaders.planet}</th>
                      <th className="text-left font-medium">{t.result.tableHeaders.house}</th>
                      <th className="text-left font-medium">{t.result.sign}</th>
                      <th className="text-left font-medium">{t.result.tableHeaders.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.chart.planets.map((planet) => (
                      <tr key={planet.planet} className="border-t border-black/8">
                        <td className="py-3 text-sm">{planet.planet}</td>
                        <td className="py-3 text-sm">{planet.house}</td>
                        <td className="py-3 text-sm">{planet.sign}</td>
                        <td className="py-3 text-sm">{planet.dignity || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {result.dasha.mahadasha && (
                <div className="mt-6">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-amber-800 mb-2">{t.result.dasha.title} - {t.result.dasha.current}</h4>
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs text-black/42">
                          <th className="text-left font-medium">{t.result.tableHeaders.level}</th>
                          <th className="text-left font-medium">{t.result.tableHeaders.nakshatra}</th>
                          <th className="text-left font-medium">{t.result.tableHeaders.start}</th>
                          <th className="text-left font-medium">{t.result.tableHeaders.end}</th>
                          <th className="text-left font-medium">{t.result.tableHeaders.duration}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-black/8">
                          <td className="py-3 text-sm font-medium">{t.result.dasha.mahadasha}</td>
                          <td className="py-3 text-sm">{result.dasha.mahadasha.name}</td>
                          <td className="py-3 text-sm">{result.dasha.mahadasha.start}</td>
                          <td className="py-3 text-sm">{result.dasha.mahadasha.end}</td>
                          <td className="py-3 text-sm">{result.dasha.mahadasha.duration}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {Array.isArray(result.dasha.antardasha) && result.dasha.antardasha.length > 0 && (
                    <div className="mb-4">
                      <details className="group">
                        <summary className="cursor-pointer text-sm font-medium text-amber-800 hover:text-amber-600 flex items-center gap-2">
                          <span>{t.result.dasha.bhukti}</span>
                          <svg className="h-4 w-4 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <div className="mt-3 overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-black/42">
                                <th className="text-left font-medium px-2 py-2">#</th>
                                <th className="text-left font-medium px-2 py-2">{t.result.tableHeaders.nakshatra}</th>
                                <th className="text-left font-medium px-2 py-2">{t.result.tableHeaders.start}</th>
                                <th className="text-left font-medium px-2 py-2">{t.result.tableHeaders.end}</th>
                                <th className="text-left font-medium px-2 py-2">{t.result.tableHeaders.duration}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {result.dasha.antardasha.slice(0, 9).map((bhukti, index) => (
                                <tr key={index} className="border-t border-black/8">
                                  <td className="px-2 py-2">{index + 1}</td>
                                  <td className="px-2 py-2">{bhukti.name}</td>
                                  <td className="px-2 py-2">{bhukti.start}</td>
                                  <td className="px-2 py-2">{bhukti.end}</td>
                                  <td className="px-2 py-2">{bhukti.duration}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {result.dasha.antardasha.length > 9 && (
                            <p className="mt-2 text-xs text-black/42">{t.result.dasha.moreBhukti.replace('{count}', String(result.dasha.antardasha.length - 9)).replace('{bhukti}', t.result.dasha.bhukti)}</p>
                          )}
                        </div>
                      </details>
                    </div>
                  )}

                  {Array.isArray(result.dasha.upcoming) && result.dasha.upcoming.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-amber-800 mb-2">{t.result.dasha.upcoming}</h4>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-black/42">
                            <th className="text-left font-medium px-2 py-2">#</th>
                            <th className="text-left font-medium px-2 py-2">{t.result.tableHeaders.nakshatra}</th>
                            <th className="text-left font-medium px-2 py-2">{t.result.tableHeaders.start}</th>
                            <th className="text-left font-medium px-2 py-2">{t.result.tableHeaders.end}</th>
                            <th className="text-left font-medium px-2 py-2">{t.result.tableHeaders.duration}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.dasha.upcoming.map((dasha, index) => (
                            <tr key={index} className="border-t border-black/8">
                              <td className="px-2 py-2">{index + 1}</td>
                              <td className="px-2 py-2">{dasha.name}</td>
                              <td className="px-2 py-2">{dasha.start}</td>
                              <td className="px-2 py-2">{dasha.end}</td>
                              <td className="px-2 py-2">{dasha.duration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-4 text-xs uppercase tracking-[0.12em] text-black/42">
                <span>{t.result.dasha.title.split('Dasha')[0] || 'Engine'}: {result.meta.engine}</span>
                <span>Ayanamsa: {result.meta.ayanamsa}</span>
                <span>
                  {formatTimezoneOffset(result.profile.timezone_offset)}
                </span>
              </div>
            </section>

            <section className="mt-6 pb-12">
              <div className="glass-panel rounded-[32px] p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <Star aria-hidden="true" className="h-5 w-5 text-[#A16207]" />
                  <p className="text-sm font-medium text-black/70">{t.result.exploreMore}</p>
                </div>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-black/66">
                  {t.natal.subtitle}
                </p>
              </div>
            </section>

            <section className="mt-6 glass-panel rounded-[32px] p-6 md:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#A16207]">
                    {t.natalPage.aiReading}
                  </p>
                  <h3 className="mt-3 text-4xl text-[#0C0A09]">{t.result.interpretation}</h3>
                  <p className="mt-3 text-sm leading-7 text-black/66">
                    {t.pricing.subtitle}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["core", t.reading.core],
                      ["career", t.reading.career],
                      ["love", t.reading.love],
                    ] as [ReadingFocus, string][]
                  ).map(([focus, label]) => (
                    <button
                      className={`focus-ring rounded-full px-4 py-2 text-sm font-medium ${
                        readingFocus === focus
                          ? "bg-[#1C1917] text-white"
                          : "border border-black/10 bg-white/72 text-black/68"
                      }`}
                      disabled={!isUnlocked || isLoadingReading}
                      key={focus}
                      onClick={() =>
                        void requestReading(result, focus as ReadingFocus)
                      }
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {!isUnlocked && result && (
                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-black/8 bg-white/60 px-4 py-3">
                    <Lock aria-hidden="true" className="h-4 w-4 text-[#A16207]" />
                    <span className="text-sm text-black/68">
                      {t.reading.unlock}
                    </span>
                    <button
                      className="ml-auto text-sm font-medium text-[#A16207]"
                      onClick={() => setShowPricingModal(true)}
                      type="button"
                    >
                      {t.pricing.standard.cta}
                    </button>
                  </div>
                )}
                {!isUnlocked && result && !showRectifier && (
                  <div className="mt-4 flex items-center gap-3 rounded-2xl border border-black/8 bg-white/60 px-4 py-3">
                    <Lock aria-hidden="true" className="h-4 w-4 text-black/42" />
                    <span className="text-sm text-black/68">
                      {t.natal.unlockPrompt}
                    </span>
                    <button
                      className="ml-auto text-sm font-medium text-[#A16207]"
                      onClick={() => setShowPricingModal(true)}
                      type="button"
                    >
                      {t.pricing.standard.cta}
                    </button>
                  </div>
                )}
                {isUnlocked && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-[#A16207]/20 bg-[#A16207]/8 px-4 py-2 text-sm text-[#A16207]">
                    <Check aria-hidden="true" className="h-4 w-4" />
                    {t.natalPage.testModeActive}
                  </div>
                )}
              </div>

              {isLoadingReading ? (
                <div className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-black/8 bg-white/72 px-4 py-3 text-sm text-black/60">
                  <Loader2
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin"
                  />
                  {t.natal.generating}...
                </div>
              ) : null}

              {readingError ? (
                <p
                  className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {readingError}
                </p>
              ) : null}

              {result && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    className="focus-ring rounded-full border border-[#A16207] px-4 py-2 text-sm font-medium text-[#A16207]"
                    onClick={() => setIsUnlocked(!isUnlocked)}
                    type="button"
                  >
                    {isUnlocked ? t.natalPage.testModeActive : t.natalPage.testUnlock}
                  </button>
                  {!showRectifier ? (
                    <button
                      className="focus-ring rounded-full border border-black/10 bg-white/72 px-4 py-2 text-sm font-medium text-black/68"
                      onClick={handleStartRectifier}
                      type="button"
                    >
                      {t.natalPage.startRectifier}
                    </button>
                  ) : (
                    <button
                      className="focus-ring rounded-full border border-black/10 bg-white/72 px-4 py-2 text-sm font-medium text-black/68"
                      onClick={() => setShowRectifier(false)}
                      type="button"
                    >
                      {t.common.close}
                    </button>
                  )}
                </div>
              )}

              {showRectifier && isUnlocked && result && (
                <div className="mt-6 rounded-[28px] border border-black/8 bg-white/78 p-5">
                  <h4 className="text-lg font-semibold text-[#0C0A09]">
                    {t.rectifier.title}
                  </h4>
                  <p className="mt-2 text-sm text-black/66">
                    {t.rectifier.timeEstimation}
                  </p>

                  {rectifierResult && (
                    <div className="mt-4 rounded-2xl border border-[#A16207]/20 bg-[#A16207]/8 p-4">
                      <h5 className="text-sm font-semibold text-[#A16207]">
                        {t.rectifier.suggestedTime}
                      </h5>
                      <p className="mt-2 text-2xl font-bold text-[#0C0A09]">
                        {rectifierResult.suggested_time}
                      </p>
                      <p className="mt-1 text-sm text-black/68">
                        {t.rectifier.confidence}: {rectifierResult.confidence} · {t.rectifier.range}: {rectifierResult.time_range}
                      </p>
                      <p className="mt-2 text-sm text-black/66">
                        {rectifierResult.summary}
                      </p>
                      {rectifierResult.events.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-black/56">
                            {t.rectifier.eventsCollected.replace('{count}', String(rectifierResult.events.length))}
                          </p>
                          {rectifierResult.events.map((event, index) => (
                            <div key={index} className="mt-2 grid gap-2">
                              <input
                                className="rounded border border-black/10 px-3 py-1 text-sm"
                                defaultValue={event.title}
                                type="text"
                              />
                              <input
                                className="rounded border border-black/10 px-3 py-1 text-sm"
                                defaultValue={event.date_hint}
                                type="text"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 max-h-96 space-y-3 overflow-y-auto">
                    {rectifierMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`rounded-2xl p-3 ${
                          message.role === "user"
                            ? "ml-8 bg-[#A16207]/10"
                            : "mr-8 bg-black/5"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    ))}
                    {isLoadingRectifier && (
                      <div className="flex items-center gap-2 text-sm text-black/56">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t.natalPage.aiAnalyzing}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <input
                      className="flex-1 rounded-2xl border border-black/10 bg-white/70 px-4 py-2 text-sm outline-none"
                      onChange={(e) => setRectifierInput(e.target.value)}
                      placeholder={t.natalPage.replyToAI}
                      value={rectifierInput}
                    />
                    <button
                      className="focus-ring rounded-full bg-[#1C1917] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                      disabled={!rectifierInput.trim() || isLoadingRectifier}
                      onClick={handleSendRectifierMessage}
                      type="button"
                    >
                      {t.common.confirm}
                    </button>
                  </div>
                </div>
              )}

              {readingResult ? (
                <div className="mt-6 rounded-[28px] border border-black/8 bg-white/78 p-5">
                  <div className="flex flex-wrap gap-2">
                    <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.12em] text-black/42">
                      <span>{t.result.dasha.title.split('Dasha')[0] || 'Model'}: {readingResult.model}</span>
                      <span>Skill: {readingResult.skill_bundle.name}</span>
                      <span>
                        {readingResult.skill_bundle.mode === "deepseek"
                          ? t.home.features.ai.title.split('AI')[0] || "DeepSeek"
                          : "Local Fallback"}
                      </span>
                    </div>
                    <button
                      className="ml-auto focus-ring rounded-full border border-black/10 bg-white/72 px-4 py-2 text-sm font-medium text-black/68"
                      onClick={handleExportPDF}
                      type="button"
                    >
                      {t.result.download}
                    </button>
                  </div>
                  <div className="mt-4 w-full whitespace-pre-line text-sm leading-8 text-black/76">
                    {readingResult.answer}
                  </div>
                </div>
              ) : null}
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-[0.78fr_0.22fr]">
              <div className="glass-panel rounded-[32px] p-6 md:p-8">
                <p className="text-xs uppercase tracking-[0.24em] text-[#A16207]">
                  {t.natalPage.panchanga}
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-5">
                  {[
                    [t.result.tableHeaders.nakshatra, result.panchanga.nakshatra],
                    [t.result.panchanga.tithi, result.panchanga.tithi],
                    [t.result.panchanga.yoga, result.panchanga.yoga],
                    [t.result.panchanga.karana, result.panchanga.karana],
                    [t.result.panchanga.vaara, result.panchanga.vaara],
                  ].map(([label, value]) => (
                    <div
                      className="rounded-[22px] border border-black/8 bg-white/72 p-4"
                      key={label}
                    >
                      <p className="text-xs uppercase tracking-[0.12em] text-black/42">
                        {label}
                      </p>
                      <p className="mt-3 text-sm leading-7 text-black/76">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel rounded-[32px] p-6 md:p-8">
                <p className="text-xs uppercase tracking-[0.24em] text-[#A16207]">
                  {t.natalPage.divisional}
                </p>
                <div className="mt-5 grid gap-3">
                  {result.chart.divisional_charts.map((item) => (
                    <div
                      className="rounded-[22px] border border-black/8 bg-white/72 p-4"
                      key={item.chart_key}
                    >
                      <p className="text-sm font-medium text-[#0C0A09]">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm text-black/64">
                        {t.natalPage.ascendant}: {item.ascendant_sign}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-black/60">
                        {item.focus}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-6 pb-12">
              <div className="glass-panel rounded-[32px] p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <Star aria-hidden="true" className="h-5 w-5 text-[#A16207]" />
                  <p className="text-sm font-medium text-black/70">{t.result.exploreMore}</p>
                </div>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-black/66">
                  {t.pricing.subtitle}
                </p>
              </div>
            </section>
          </>
        ) : null}

        {showPricingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowPricingModal(false)}
            />
            <div className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
              <div className="glass-panel rounded-[36px] p-6 md:p-10">
                <button
                  className="focus-ring absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70"
                  onClick={() => setShowPricingModal(false)}
                  type="button"
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                </button>
                <p className="text-xs uppercase tracking-[0.24em] text-[#A16207]">
                  {t.pricing.title}
                </p>
                <h2 className="mt-4 text-4xl leading-[0.96] text-[#0C0A09] md:text-5xl">
                  {t.pricing.title}
                </h2>
                <p className="mt-5 max-w-3xl text-sm leading-8 text-black/66">
                  {t.pricing.subtitle}
                </p>

                <div className="mt-8 grid gap-4 lg:grid-cols-3">
                  {pricingPlans.map((plan, index) => (
                    <article
                      className={`rounded-[28px] border p-6 ${
                        index === 1
                          ? "border-[#A16207]/30 bg-[#1C1917] text-white"
                          : "border-black/8 bg-white/74 text-[#0C0A09]"
                      }`}
                      key={plan.name}
                    >
                      <p
                        className={`text-xs uppercase tracking-[0.18em] ${
                          index === 1 ? "text-[#D6B66C]" : "text-[#A16207]"
                        }`}
                      >
                        {plan.badge}
                      </p>
                      <h3 className="mt-4 text-3xl">{plan.name}</h3>
                      <p className="mt-4 text-4xl">{plan.price}</p>
                      <div className="mt-6 grid gap-3">
                        {plan.items.map((item) => (
                          <div
                            className="flex gap-3 text-sm leading-7"
                            key={item}
                          >
                            <Check
                              aria-hidden="true"
                              className={`mt-1 h-4 w-4 shrink-0 ${
                                index === 1 ? "text-[#D6B66C]" : "text-[#A16207]"
                              }`}
                            />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-8 rounded-[28px] border border-black/8 bg-white/74 p-6">
                  <div className="flex items-center gap-3">
                    <Sparkles
                      aria-hidden="true"
                      className="h-5 w-5 text-[#A16207]"
                    />
                    <p className="text-sm font-medium text-black/70">{t.pricing.subtitle}</p>
                  </div>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-black/66">
                    {t.home.features.ai.desc || t.natal.subtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

