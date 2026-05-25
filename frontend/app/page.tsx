"use client";

import { type FormEvent, useState, useEffect, useRef } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import type { Antardasha, Pratyantardasha, Sookshma } from "@/types";
import {
  Check,
  Clock,
  Globe,
  Loader2,
  LocateFixed,
  Lock,
  MapPin,
  Orbit,
  RefreshCw,
  Sparkles,
  Star,
  Sun,
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

  const getReadingPrompt = (focus: ReadingFocus): string => {
    const prompts = t.natal.readingPrompts;
    if (prompts && prompts[focus]) {
      return prompts[focus];
    }
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
  
  const COMMON_COUNTRIES = [
    "中国", "日本", "韩国", "印度", "新加坡", "美国", "英国", "德国", "法国", "加拿大",
    "澳大利亚", "泰国", "马来西亚", "印度尼西亚", "菲律宾", "越南", "俄罗斯", "巴西",
    "意大利", "西班牙", "荷兰", "瑞士", "阿联酋", "沙特阿拉伯", "埃及", "南非",
  ];
  
  const [hasAutoLocated, setHasAutoLocated] = useState(false);
  const [hasManualInput, setHasManualInput] = useState(false);
  const [result, setResult] = useState<BirthChartResult | null>(null);
  const [readingResults, setReadingResults] = useState<Record<ReadingFocus, string | null | 'loading'>>({
    core: null,
    career: null,
    love: null,
  });
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [activeReadingTab, setActiveReadingTab] = useState<ReadingFocus>('core');
  const [readingLanguages, setReadingLanguages] = useState<Record<ReadingFocus, string | null>>({
    core: null,
    career: null,
    love: null,
  });
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

  const IMPATIENT_KEYWORDS = {
    zh: ["烦", "不耐烦", "快点", "快点吧", "浪费时间", "还有多久", "能不能", "麻烦", "太啰嗦", "直接说", "不用说了", "说重点", "直接一点", "别啰嗦", "够了"],
    hi: ["परेशान", "अधीर", "जल्दी करो", "जल्दी करो यार", "समय बर्बाद", "कब तक", "क्या कर सकते हो", "परेशान", "बहुत बातें", "सीधा कहो", "बोलो मत", "मुख्य बात", "सीधा", "बकवास मत करो", "बस"],
    en: ["annoy", "impatient", "hurry", "hurry up", "waste time", "how long", "can we", "trouble", "too wordy", "direct", "stop talking", "get to the point", "straightforward", "stop rambling", "enough"]
  } as const;

  const impatientKeywords = IMPATIENT_KEYWORDS[language] || IMPATIENT_KEYWORDS.en;

  const [previousLanguage, setPreviousLanguage] = useState(language);
  
  // 语言切换时的清理逻辑
  useEffect(() => {
    if (previousLanguage !== language) {
      // 重置所有相关状态
      const resetStates = () => {
        setRectifierMessages([]);
        setRectifierResult(null);
        setLocationSuggestions([]);
        setLocationMessage("");
        setReadingResults({ core: null, career: null, love: null });
        setReadingLanguages({ core: null, career: null, love: null });
        setPreviousLanguage(language);
      };
      
      resetStates();
    }
  }, [language, previousLanguage]);
  
  // 辅助函数：检查是否需要重新生成解读
  const shouldRegenerateReading = (focus: ReadingFocus): boolean => {
    return !readingResults[focus] || readingLanguages[focus] !== language;
  };
  
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const canGenerate =
    Boolean(name.trim()) &&
    Boolean(locationName.trim()) &&
    Boolean(birthDate) &&
    Boolean(birthTime) &&
    Boolean(latitude) &&
    Boolean(longitude) &&
    Boolean(timezone);

  

  function cleanReadingContent(text: string): string {
    if (!text) return '';
    
    return text
      .trim()
      // 移除多余的空行（超过2个连续空行的合并为2个）
      .replace(/\n{3,}/g, '\n\n')
      // 移除行首行尾的空白字符
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      // 最终确保首尾没有空行
      .trim();
  }

  function isUserImpatient(message: string): boolean {
    const lowerMsg = message.toLowerCase();
    return impatientKeywords.some(keyword => 
      lowerMsg.includes(keyword.toLowerCase()));
  }

  async function requestReading(chart: BirthChartResult, focus: ReadingFocus) {
    // 如果正在加载或没有有效数据，则不重复请求
    if (readingResults[focus] === 'loading' || !canGenerate) {
      return;
    }

    setReadingResults(prev => ({ ...prev, [focus]: 'loading' }));

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/chart-reading`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          focus,
          question: getReadingPrompt(focus),
          location_name: locationName.trim(),
          chart,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error(t.errors.aiReadingUnavailable);
      }

      const payload = (await response.json()) as { data: ChartReadingResult };
      const cleanedAnswer = cleanReadingContent(payload.data?.answer || '');
      
      setReadingResults(prev => ({ ...prev, [focus]: cleanedAnswer }));
      setReadingLanguages(prev => ({ ...prev, [focus]: language }));
    } catch (error) {
      console.error('Reading request failed:', error);
      setReadingResults(prev => ({ ...prev, [focus]: null }));
    }
  }

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
      
      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }
      
      const result = await response.json();
      if (result.data?.display_name) {
        return simpleFormatAddress(result.data.display_name);
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
    }
    return t.locationMessages.locatedPosition;
  }

  async function handleAutoLocation() {
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
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.length < 1) {
      setLocationSuggestions([]);
      return;
    }

    setHasManualInput(true);

    debounceTimer.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      setLocationMessage(t.locationMessages.searching);
      
      try {
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
        
        data.sort((a, b) => {
          const getPrecisionScore = (item: any) => {
            if (!item.address) return 0;
            let score = 0;
            if (item.address.district || item.address.county || item.address.city_district) score += 100;
            if (item.type === 'administrative' && item.address?.city_district) score += 50;
            if (item.address.city || item.address.town) score += 30;
            if (item.address.province || item.address.state) score += 10;
            return score;
          };
          
          return getPrecisionScore(b) - getPrecisionScore(a);
        });

        const suggestions = data.map((item: any) => ({
          ...item,
          display_name: simpleFormatAddress(item.display_name, item.address),
        }));
        setLocationSuggestions(suggestions);
        
        if (suggestions.length === 0) {
          setLocationMessage("");
        } else {
          setLocationMessage(t.locationMessages.foundResults.replace('{count}', String(suggestions.length)));
        }
      } catch (error) {
        console.error("搜索错误:", error);
        setLocationSuggestions([]);
        setLocationMessage("");
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);
  }

  function simpleFormatAddress(displayName: string, address?: any): string {
    if (!displayName) return "";
    
    if (address) {
      const parts: string[] = [];
      
      if (address.suburb) parts.push(address.suburb);
      if (address.village) parts.push(address.village);
      if (address.neighbourhood) parts.push(address.neighbourhood);
      
      if (address.city) parts.push(address.city);
      else if (address.town) parts.push(address.town);
      else if (address.county) parts.push(address.county);
      else if (address.municipality) parts.push(address.municipality);
      else if (address.city_district) parts.push(address.city_district);
      else if (address.district) parts.push(address.district);
      
      if (address.province) parts.push(address.province);
      else if (address.state) parts.push(address.state);
      else if (address.region) parts.push(address.region);
      
      if (address.country && parts.length < 3) parts.push(address.country);
      
      if (parts.length > 0) {
        const uniqueParts: string[] = [];
        const seen = new Set<string>();
        for (const part of parts) {
          if (!seen.has(part)) {
            seen.add(part);
            uniqueParts.push(part);
          }
        }
        return uniqueParts.slice(0, 3).join('，');
      }
    }
    
    const parts = displayName.split(',').map(p => p.trim()).filter(p => p);
    
    const isChinese = displayName.includes('China') || 
                      displayName.includes('中国') || 
                      /[\u4e00-\u9fa5]/.test(displayName);
    
    if (isChinese) {
      const result: string[] = [];
      let foundCity = false;
      
      for (const part of parts) {
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
        if (result.length >= 2) break;
      }
      
      if (result.length > 0) {
        return result.join('，');
      }
    }
    
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
    
    setLocationMessage(`${t.locationMessages.selectPosition}，${t.locationMessages.coordinates || '坐标'}: ${suggestion.lat}, ${suggestion.lon}`);
  }

  async function handleSendRectifierMessage() {
    if (!rectifierInput.trim() || isLoadingRectifier) return;

    const userMessage = { role: "user", content: rectifierInput };
    setRectifierMessages((prev) => [...prev, userMessage]);
    setRectifierInput("");
    setIsLoadingRectifier(true);

    const isImpatient = isUserImpatient(userMessage.content);

    try {
      let messagesToSend = [...rectifierMessages, userMessage];
      
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
          language: language,
        }),
      });

      if (response.ok) {
        const payload = await response.json();
        let assistantContent = payload.data.assistant_message;
        
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
          language: language,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRectifierMessages([
          {
            role: "assistant",
            content: data.data.assistant_message || t.rectifier.initialGreeting,
          },
        ]);
      }
    } catch {
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setReadingResults({ core: null, career: null, love: null });
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
          language: language,
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

  // 使用固定种子的伪随机数生成器，确保SSR和客户端一致
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // 四舍五入到指定小数位数，确保SSR和客户端数值一致
  const roundTo = (value: number, decimals: number) => {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  };

  // 生成固定的星星位置（使用固定种子确保SSR一致）
  const generateStars = () => {
    const stars = [];
    for (let i = 0; i < 50; i++) {
      const seed = i * 9973; // 大素数作为种子
      stars.push({
        id: i,
        left: roundTo(seededRandom(seed) * 100, 5),
        top: roundTo(seededRandom(seed + 1) * 100, 5),
        size: roundTo(seededRandom(seed + 2) * 3 + 1, 5),
        delay: roundTo(seededRandom(seed + 3) * 3, 6),
        duration: roundTo(seededRandom(seed + 4) * 2 + 2, 6),
        opacity: roundTo(seededRandom(seed + 5) * 0.5 + 0.3, 6),
      });
    }
    return stars;
  };

  // 较大星星的固定位置
  const generateBigStars = () => {
    const stars = [];
    for (let i = 0; i < 10; i++) {
      const seed = i * 7919 + 10000; // 另一个大素数
      stars.push({
        id: i,
        left: roundTo(seededRandom(seed) * 100, 5),
        top: roundTo(seededRandom(seed + 1) * 100, 5),
        size: roundTo(seededRandom(seed + 2) * 4 + 2, 5),
        delay: roundTo(seededRandom(seed + 3) * 4, 6),
        duration: roundTo(seededRandom(seed + 4) * 3 + 3, 6),
      });
    }
    return stars;
  };

  const stars = generateStars();
  const bigStars = generateBigStars();

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-8 relative overflow-hidden">
      {/* 星星背景 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-[#F4C430] star-twinkle"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
              opacity: `${star.opacity}`,
            }}
          />
        ))}
        {/* 较大的星星 */}
        {bigStars.map((star) => (
          <div
            key={`big-${star.id}`}
            className="absolute rounded-full bg-white star-twinkle"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
              boxShadow: '0 0 6px rgba(244, 196, 48, 0.6)',
            }}
          />
        ))}
      </div>
      
      <div className="mx-auto max-w-6xl relative z-10">
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
                          void handleLocationSearch(value);
                        }}
                        placeholder={t.natal.form.locationPlaceholder}
                        required
                        value={locationName}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isLoadingSuggestions ? (
                          <Loader2 className="h-4 w-4 animate-spin text-black/40" />
                        ) : null}
                      </div>
                    </div>
                  </label>
                  
                  {locationSuggestions.length > 0 && (
                    <div className="absolute z-50 mt-2 w-full rounded-2xl border border-gray-200 bg-white shadow-2xl max-h-[400px] overflow-y-auto">
                      <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
                        <p className="text-xs text-amber-700 flex items-center gap-2">
                          <Globe className="h-3 w-3" />
                          {t.natal.location.searchHint}
                        </p>
                      </div>
                      
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

          
        </section>

        {result ? (
          <>
            <section className="mt-6 glass-panel rounded-[32px] p-6 md:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#A16207]">
                    {t.natalPage.aiReading}
                  </p>
                  <h2 className="mt-3 text-4xl text-[#0C0A09]">
                    {t.result.reading}
                  </h2>
                </div>
              </div>

              {/* Tab Navigation */}
              {isUnlocked && (
                <div className="mt-6">
                  <div className="flex gap-2 border-b border-black/8">
                    {(['core', 'career', 'love'] as ReadingFocus[]).map((focus) => (
                      <button
                        key={focus}
                        onClick={() => setActiveReadingTab(focus)}
                        className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                          activeReadingTab === focus
                            ? 'text-[#A16207]'
                            : 'text-black/56 hover:text-black/72'
                        }`}
                      >
                        {focus === 'core' ? t.result.readingFocus.core :
                         focus === 'career' ? t.result.readingFocus.career :
                         t.result.readingFocus.love}
                        {activeReadingTab === focus && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#A16207]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Display */}
              <div className="mt-6">
                {isUnlocked ? (
                  readingResults[activeReadingTab] === 'loading' ? (
                    <div className="flex flex-col items-center justify-center py-16 card-vedic">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-[#F4C430]/30 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-[#6B2D91]" />
                        </div>
                        <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-[#F4C430]/20 animate-ping" />
                      </div>
                      <span className="mt-4 text-sm text-[#2C1810]/60">
                        {t.result.readingLoading || '星体正在排列...'}
                      </span>
                    </div>
                  ) : readingResults[activeReadingTab] ? (
                    <div className="card-vedic p-6 md:p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F4C430]/20 to-[#6B2D91]/20 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-[#6B2D91]" />
                          </div>
                          <div>
                            <span className="text-xs uppercase tracking-wider text-[#CC7722] font-medium">
                              {t.result.readingLabel || 'Vedic Reading'}
                            </span>
                            <p className="text-lg font-semibold text-[#2C1810]">
                              {activeReadingTab === 'core' ? t.result.readingFocus.core :
                               activeReadingTab === 'career' ? t.result.readingFocus.career :
                               t.result.readingFocus.love}
                            </p>
                          </div>
                        </div>
                        {readingLanguages[activeReadingTab] && (
                          <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-[#F4C430]/20 to-[#CC7722]/20 text-[#6B2D91] border border-[#F4C430]/30">
                            {readingLanguages[activeReadingTab] === 'zh' ? '中文' :
                             readingLanguages[activeReadingTab] === 'en' ? 'English' :
                             'हिन्दी'}
                          </span>
                        )}
                      </div>
                      
                      {/* 装饰分隔线 */}
                      <div className="vedic-divider mb-6" />
                      
                      <div className="whitespace-pre-wrap text-base leading-relaxed text-[#2C1810]/80 font-serif">
                        {readingResults[activeReadingTab]}
                      </div>
                      
                      {/* 装饰分隔线 */}
                      <div className="vedic-divider mt-6 mb-4" />
                      
                      <div className="flex items-center justify-between text-xs text-[#2C1810]/40">
                        <span className="flex items-center gap-2">
                          <Star className="h-3 w-3 text-[#F4C430]" />
                          {t.result.poweredBy || 'Powered by Vedic Wisdom'}
                        </span>
                        <div className="flex items-center gap-3">
                          {readingLanguages[activeReadingTab] !== language && (
                            <span className="text-[#CC7722]">
                              {t.result.languageMismatch || '语言已切换'}
                            </span>
                          )}
                          <button
                            onClick={() => requestReading(result, activeReadingTab)}
                            className="text-[#6B2D91] hover:text-[#4B0082] font-medium transition-colors flex items-center gap-1"
                          >
                            <RefreshCw className="h-3 w-3" />
                            {t.result.regenerate || '重新解读'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="card-vedic p-12 text-center">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#F4C430]/10 to-[#6B2D91]/10 flex items-center justify-center border border-[#F4C430]/20">
                        <Sparkles className="h-8 w-8 text-[#6B2D91]" />
                      </div>
                      <p className="mt-6 text-base text-[#2C1810]/70">
                        {t.result.clickToRead || '点击按钮，探索你的星盘奥秘'}
                      </p>
                      <button
                        className="mt-6 rounded-full bg-[#A16207] px-8 py-3 text-sm font-medium text-white shadow-lg shadow-[#A16207]/30 hover:shadow-xl hover:shadow-[#A16207]/40 transition-all hover:-translate-y-0.5"
                        onClick={() => requestReading(result, activeReadingTab)}
                        disabled={readingResults[activeReadingTab] === 'loading'}
                      >
                        <span className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          {t.result.startReading || '开始解读'}
                        </span>
                      </button>
                    </div>
                  )
                ) : (
                  <div className="card-vedic p-12 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-[#E8DFC8]/50 flex items-center justify-center">
                      <Lock className="h-8 w-8 text-[#2C1810]/30" />
                    </div>
                    <p className="mt-6 text-base text-[#2C1810]/60">{t.pricing.memberOnly || '会员专享'}</p>
                    <button
                      className="mt-6 rounded-full border-2 border-[#F4C430] px-8 py-3 text-sm font-medium text-[#CC7722] hover:bg-[#F4C430] hover:text-white transition-all"
                      onClick={() => setShowPricingModal(true)}
                    >
                      {t.pricing.unlock || '解锁全部功能'}
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Access Buttons */}
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {(['core', 'career', 'love'] as ReadingFocus[]).map((focus) => (
                  <button
                    key={focus}
                    onClick={() => {
                      setActiveReadingTab(focus);
                      if (isUnlocked && shouldRegenerateReading(focus)) {
                        requestReading(result, focus);
                      }
                    }}
                    disabled={!isUnlocked || readingResults[focus] === 'loading'}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      activeReadingTab === focus
                        ? 'border-[#A16207] bg-[#A16207]/5'
                        : 'border-black/8 bg-white/72 hover:bg-black/5'
                    } ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#A16207]" />
                        <span className="text-sm font-medium text-[#0C0A09]">
                          {focus === 'core' ? t.result.readingFocus.core :
                           focus === 'career' ? t.result.readingFocus.career :
                           t.result.readingFocus.love}
                        </span>
                      </div>
                      {readingLanguages[focus] && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-[#A16207]/10 text-[#A16207]">
                          {readingLanguages[focus] === 'zh' ? '中' :
                           readingLanguages[focus] === 'en' ? 'EN' : 'HI'}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-black/56">
                      {readingResults[focus] ? (
                        readingLanguages[focus] !== language ? (
                          <span className="text-amber-600">点击切换至{language === 'zh' ? '中文' : language === 'en' ? 'English' : 'हिन्दी'}</span>
                        ) : (
                          '已解读 ✓'
                        )
                      ) : (
                        '点击获取'
                      )}
                    </p>
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <button
                  className="focus-ring w-full rounded-2xl border border-black/8 bg-white/72 p-4 text-left hover:bg-black/5 transition-colors"
                  onClick={handleStartRectifier}
                >
                  <div className="flex items-center gap-4">
                    <Clock className="h-6 w-6 text-[#A16207]" />
                    <div>
                      <p className="font-medium text-[#0C0A09]">
                        {t.rectifier.title}
                      </p>
                      <p className="mt-1 text-sm text-black/66">
                        {t.rectifier.desc}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </section>

            <section className="mt-6 glass-panel rounded-[32px] p-6 md:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#A16207]">
                    {t.natalPage.dasha}
                  </p>
                  <h2 className="mt-3 text-4xl text-[#0C0A09]">
                    {t.result.dasha.title}
                  </h2>
                </div>
              </div>

              {result.dasha.mahadasha && (
                <div className="mt-6 rounded-[24px] border border-black/8 bg-white/72 p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#A16207]">
                        {t.result.dasha.currentMaha}
                      </p>
                      <p className="mt-2 text-3xl text-[#0C0A09]">
                        {result.dasha.mahadasha.name}
                      </p>
                      <p className="mt-2 text-sm text-black/66">
                        {result.dasha.mahadasha.start} - {result.dasha.mahadasha.end}
                        ({result.dasha.mahadasha.duration} {t.result.dasha.years})
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-4xl font-semibold text-[#A16207]">
                          {result.dasha.mahadasha.duration}
                        </p>
                        <p className="text-xs text-black/56">{t.result.dasha.years}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {Array.isArray(result.dasha.antardasha) && result.dasha.antardasha.length > 0 && (
                <div className="mt-6">
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-[#A16207] hover:text-amber-600 flex items-center gap-2">
                      <span>{t.result.dasha.bhukti} ({t.result.dasha.antardasha})</span>
                      <svg className="h-4 w-4 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="mt-4 space-y-3">
                      {result.dasha.antardasha.map((antar: Antardasha, index) => (
                        <details key={index} className="group rounded-xl border border-black/8 bg-white/72">
                          <summary className="cursor-pointer p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-medium text-[#A16207]">
                                {index + 1}
                              </span>
                              <div>
                                <p className="font-medium text-[#0C0A09]">{antar.name}</p>
                                <p className="text-xs text-black/56">
                                  {antar.start} - {antar.end} ({antar.duration} {t.result.dasha.years})
                                </p>
                              </div>
                            </div>
                            <svg className="h-4 w-4 group-open:rotate-180 transition-transform text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </summary>
                          {Array.isArray(antar.pratyantardashas) && antar.pratyantardashas.length > 0 && (
                            <div className="border-t border-black/4 bg-white/50 p-4">
                              <p className="text-xs font-medium text-[#A16207] mb-3">{t.result.dasha.pratyantardasha}</p>
                              <div className="space-y-2">
                                {antar.pratyantardashas.map((praty: Pratyantardasha, pratyIndex) => (
                                  <details key={pratyIndex} className="group rounded-lg border border-black/4 bg-white/50">
                                    <summary className="cursor-pointer p-3 flex items-center justify-between text-sm">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-black/40">●</span>
                                        <span className="font-medium text-[#0C0A09]">{praty.name}</span>
                                        <span className="text-xs text-black/40">
                                          {praty.start} - {praty.end} ({praty.duration} {t.result.dasha.years})
                                        </span>
                                      </div>
                                      {Array.isArray(praty.sookshma) && praty.sookshma.length > 0 && (
                                        <svg className="h-3 w-3 group-open:rotate-180 transition-transform text-black/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      )}
                                    </summary>
                                    {Array.isArray(praty.sookshma) && praty.sookshma.length > 0 && (
                                      <div className="border-t border-black/2 p-3 bg-white/30">
                                        <p className="text-xs font-medium text-[#A16207] mb-2">Sookshma</p>
                                        <div className="grid grid-cols-3 gap-2">
                                          {praty.sookshma.map((sook: Sookshma, sookIndex) => (
                                            <div key={sookIndex} className="text-xs p-2 bg-white/50 rounded">
                                              <p className="font-medium text-[#0C0A09]">{sook.name}</p>
                                              <p className="text-black/40">{sook.start}</p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </details>
                                ))}
                              </div>
                            </div>
                          )}
                        </details>
                      ))}
                    </div>
                  </details>
                </div>
              )}

              {Array.isArray(result.dasha.upcoming) && result.dasha.upcoming.length > 0 && (
                <div className="mt-6">
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-[#A16207] hover:text-amber-600 flex items-center gap-2">
                      <span>{t.result.dasha.upcoming}</span>
                      <svg className="h-4 w-4 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {result.dasha.upcoming.slice(0, 2).map((dasha, index) => (
                        <div
                          key={index}
                          className="rounded-xl border border-black/8 bg-white/72 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-[#0C0A09]">{dasha.name}</p>
                            <p className="text-xs text-black/56">
                              {dasha.duration} {t.result.dasha.years}
                            </p>
                          </div>
                          <p className="mt-2 text-sm text-black/66">
                            {dasha.start} - {dasha.end}
                          </p>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </section>

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
                      <th className="text-left font-medium">{t.result.tableHeaders.degrees}</th>
                      <th className="text-left font-medium">{t.result.nakshatra}</th>
                      <th className="text-left font-medium">{t.result.dignity}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.chart.planets.map((planet) => (
                      <tr key={planet.planet} className="border-t border-black/8">
                        <td className="py-3 text-sm">{planet.planet}</td>
                        <td className="py-3 text-sm">{planet.house}</td>
                        <td className="py-3 text-sm">{planet.sign}</td>
                        <td className="py-3 text-sm">{planet.degrees?.toFixed(2) || "-"}</td>
                        <td className="py-3 text-sm">{planet.nakshatra}</td>
                        <td className="py-3 text-sm">{planet.dignity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-black/42">
                      <th className="text-left font-medium">{t.result.panchanga.title}</th>
                      <th className="text-left font-medium">{t.result.value}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      [t.result.nakshatra, result.panchanga.nakshatra],
                      [t.result.tithi, result.panchanga.tithi],
                      [t.result.yoga, result.panchanga.yoga],
                      [t.result.karana, result.panchanga.karana],
                      [t.result.vaara, result.panchanga.vaara],
                    ].map(([label, value]) => (
                      <tr key={label} className="border-t border-black/8">
                        <td className="py-3 text-sm">{label}</td>
                        <td className="py-3 text-sm">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {result.meta.warning && (
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-700">{result.meta.warning}</p>
                </div>
              )}
            </section>
          </>
        ) : null}

        {showRectifier && (
          <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-3xl glass-panel rounded-[32px] p-6 md:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#A16207]">
                    {t.rectifier.title}
                  </p>
                  <h2 className="mt-3 text-2xl text-[#0C0A09]">
                    {t.rectifier.subtitle}
                  </h2>
                </div>
                <button
                  onClick={() => setShowRectifier(false)}
                  className="rounded-full p-2 hover:bg-black/5 transition-colors"
                >
                  <X className="h-5 w-5 text-black/50" />
                </button>
              </div>

              {rectifierResult ? (
                <div className="mt-6 rounded-2xl border border-black/8 bg-white/72 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Star className="h-8 w-8 text-[#A16207]" />
                    <div>
                      <p className="text-sm font-medium text-[#A16207]">
                        {t.rectifier.suggestedTime}
                      </p>
                      <p className="text-2xl font-semibold text-[#0C0A09]">
                        {rectifierResult.suggested_time}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-black/8 bg-white/72 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-black/42">
                        {t.rectifier.timeRange}
                      </p>
                      <p className="mt-2 text-lg font-medium text-[#0C0A09]">
                        {rectifierResult.time_range}
                      </p>
                    </div>
                    <div className="rounded-xl border border-black/8 bg-white/72 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-black/42">
                        {t.rectifier.confidence}
                      </p>
                      <p className="mt-2 text-lg font-medium text-[#0C0A09]">
                        {rectifierResult.confidence}
                      </p>
                    </div>
                    <div className="rounded-xl border border-black/8 bg-white/72 p-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-black/42">
                        {t.rectifier.summary}
                      </p>
                      <p className="mt-2 text-sm text-black/66">
                        {rectifierResult.summary}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-6 h-64 overflow-y-auto rounded-2xl border border-black/8 bg-white/72 p-4">
                    {rectifierMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex gap-4 mb-4 ${
                          message.role === "user" ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            message.role === "user"
                              ? "bg-[#1C1917] text-white"
                              : "bg-[#A16207]/10 text-[#A16207]"
                          }`}
                        >
                          {message.role === "user" ? (
                            <span className="text-xs font-medium">U</span>
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                        </div>
                        <div
                          className={`max-w-[80%] rounded-2xl p-4 ${
                            message.role === "user"
                              ? "bg-[#1C1917] text-white"
                              : "bg-white/70 text-black/80"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isLoadingRectifier && (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-[#A16207]" />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-3">
                    <input
                      className="flex-1 h-12 rounded-2xl border border-black/10 bg-white/70 px-4 text-sm outline-none"
                      onChange={(event) => setRectifierInput(event.target.value)}
                      placeholder={t.rectifier.placeholder}
                      value={rectifierInput}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          handleSendRectifierMessage();
                        }
                      }}
                    />
                    <button
                      className="focus-ring h-12 rounded-2xl bg-[#1C1917] px-6 text-sm font-semibold text-white disabled:opacity-60"
                      onClick={handleSendRectifierMessage}
                      disabled={!rectifierInput.trim() || isLoadingRectifier}
                    >
                      {t.common.send}
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {showPricingModal && (
          <section className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-4xl glass-panel rounded-[32px] p-6 md:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#A16207]">
                    {t.pricing.title}
                  </p>
                  <h2 className="mt-3 text-3xl text-[#0C0A09]">
                    {t.pricing.heading}
                  </h2>
                </div>
                <button
                  onClick={() => setShowPricingModal(false)}
                  className="rounded-full p-2 hover:bg-black/5 transition-colors"
                >
                  <X className="h-5 w-5 text-black/50" />
                </button>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {pricingPlans.map((plan, index) => (
                  <div
                    key={index}
                    className={`relative rounded-2xl border p-6 ${
                      index === 1
                        ? "border-[#A16207] bg-[#A16207]/5"
                        : "border-black/8 bg-white/72"
                    }`}
                  >
                    {index === 1 && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-[#A16207] px-3 py-1 text-xs font-medium text-white">
                          {plan.badge}
                        </span>
                      </div>
                    )}
                    <p className="text-sm font-medium uppercase tracking-[0.14em] text-[#A16207]">
                      {plan.name}
                    </p>
                    <p className="mt-4 text-4xl font-semibold text-[#0C0A09]">
                      {plan.price}
                    </p>
                    <ul className="mt-6 space-y-3">
                      {plan.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3">
                          <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-[#A16207]" />
                          <span className="text-sm text-black/72">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`focus-ring mt-6 w-full h-12 rounded-full text-sm font-semibold transition-colors ${
                        index === 1
                          ? "bg-[#A16207] text-white"
                          : "border border-black/10 bg-white/70 text-black/72 hover:bg-black/5"
                      }`}
                    >
                      {index === 1 ? t.pricing.standard.cta : t.pricing.free.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}