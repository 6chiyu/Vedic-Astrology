export type Language = 'zh' | 'en' | 'hi';

export type TranslationKeys = typeof zh;

export const zh = {
  siteName: "Vedic Light",
  siteTagline: "印度占星 · 深度解读",
  heroTitle: "探索你的印度星盘",
  heroSubtitle: "基于出生时间、地点，AI深度解读命运轨迹",
  cta: "生成我的星盘",
  productFocus: "产品亮点",
  features: "核心功能",
  howItWorks: "使用流程",
  vedicAstrology: "印度占星",
  testimonials: "用户评价",
  monetization: "定价策略",
  readyToStart: "准备开始",
  pricingLabel: "定价方案",
  
  home: {
    features: {
      title: "为什么选择 Vedic Light？",
      accurate: {
        title: "精准的星盘计算",
        desc: "基于 Swetest 算法，支持 Vimshottari Dasha 等印度占星系统"
      },
      ai: {
        title: "AI 深度解读",
        desc: "结合专业占星术士，提供个性化命运解读"
      },
      privacy: {
        title: "本地计算",
        desc: "所有计算在本地完成，数据仅用于本次解读"
      },
      worldTimezone: {
        title: "全球时区",
        desc: "自动计算全球任意位置的本地时间"
      },
      fastGeneration: {
        title: "快速生成",
        desc: "几秒内完成星盘排盘，即时查看结果"
      }
    },
    
    flow: {
      title: "Simple 3 Steps",
      steps: [
        {
          title: "输入信息",
          body: "输入姓名、日期、时间、出生地、经纬度和时区，直接生成可核对的印度星盘。"
        },
        {
          title: "查看星盘",
          body: "先看 Lagna、十二宫、九大行星、Panchanga 和大运，确认基础结构没有问题。"
        },
        {
          title: "获取解读",
          body: "进入整体、事业或感情三个阅读焦点，作为付费升级的主产品。"
        }
      ]
    },
    
    highlights: [
      "精准的星盘计算",
      "先免费生成结构化命盘，再决定是否升级 AI 深度解盘。",
      "排盘使用 jyotishganit，解盘约束来自本地 vedic-astro-skills。"
    ],
    
    testimonials: [
      {
        quote: "AI 解盘非常准确，特别是事业部分的分析给了我很大启发。",
        author: "张先生",
        role: "产品经理"
      },
      {
        quote: "界面简洁，排盘专业，是我用过最好的印度占星工具。",
        author: "李女士",
        role: "心理咨询师"
      }
    ],
    
    pricingSection: {
      title: "AI 付费能力保留为核心商业层",
      subtitle: "免费层只解决'盘能不能先出来'，付费层解决'这张盘到底怎么读、怎么用、现在该怎么做'。",
      cta: "查看价格与升级路径"
    }
  },
  
  natal: {
    title: "生成你的新盘",
    resultTitle: "的星盘",
    unlockPrompt: "解锁完整解读",
    premiumTitle: "生成星盘",
    subtitle: "这里只做一件事：把出生信息转换成一张可核对、可继续深读的印度命盘。",
    readingPrompts: {
      core: "请基于这张印度星盘做一份整体解读，重点说明核心性格、优势、风险和下一步观察重点。",
      career: "请基于这张印度星盘做一份事业解读，重点说明职业结构、适合的方向、当前阶段和行动建议。",
      love: "请基于这张印度星盘做一份感情解读，重点说明关系模式、伴侣主题、当前窗口和行动建议。"
    },
    form: {
      name: "姓名",
      namePlaceholder: "例如：小林",
      location: "出生地点",
      locationPlaceholder: "输入位置（从大到小，如：国家和省）",
      date: "出生日期",
      time: "出生时间",
      latitude: "纬度",
      longitude: "经度",
      timezone: "时区",
      timezoneHint: "时区 UTC"
    },
    autoLocation: {
      button: "自动获取位置",
      locating: "正在定位...",
      success: "定位成功！",
      failed: "定位失败",
      hint: "位置支持自动获取，也支持手动修改",
      hintDetail: "选择地点时会自动填入经纬度和时区，时区你也可以继续手动调整。"
    },
    location: {
      search: "搜索位置",
      searchHint: "提示：从大到小输入，如国家、省、市",
      results: "搜索结果",
      countries: "常用国家",
      clickToFill: "点击快速填入",
      foundResults: "找到 {count} 个位置",
      coordinates: "坐标",
      locatedPosition: "已定位位置",
      selectPosition: "已选择位置",
      searching: "正在搜索位置..."
    },
    submit: "生成星盘",
    generating: "正在生成...",
    generatingReading: "正在生成解读..."
  },
  
  reading: {
    title: "解读焦点",
    core: "整体解读",
    career: "事业解读",
    love: "感情解读",
    unlock: "解锁完整解读",
    unlocking: "正在解锁..."
  },
  
  result: {
    chart: "星盘",
    profile: "基本信息",
    name: "姓名",
    birthInfo: "出生信息",
    location: "出生地",
    coordinates: "坐标",
    timezone: "时区",
    moonSign: "月亮星座",
    sunSign: "太阳星座",
    lagna: "上升星座",
    
    houses: "宫位",
    house: "第 {n} 宫",
    sign: "星座",
    lord: "主星",
    nakshatra: "宿曜",
    pada: "帕达",
    dignity: "尊贵度",
    value: "值",
    tithi: "Tithi",
    yoga: "Yoga",
    karana: "Karana",
    vaara: "Vaara",
    reading: "AI解读",
    readingFocus: {
      core: "核心解读",
      career: "事业",
      love: "感情"
    },
    planets: "行星",
    
    tableHeaders: {
      house: "宫位",
      sign: "星座",
      lord: "主星",
      planets: "行星",
      planet: "行星",
      degrees: "度数",
      status: "状态",
      level: "级别",
      nakshatra: "Nakshatra",
      start: "开始",
      end: "结束",
      duration: "时长"
    },
    
    dasha: {
      title: "Vimshottari Dasha",
      current: "当前大运",
      currentMaha: "当前大运",
      upcoming: "即将到来的大运",
      bhukti: "Bhukti（副运）周期",
      balance: "大运余期",
      years: "年",
      mahadasha: "Mahadasha",
      antardasha: "Antardasha",
      antar: "Antardasha",
      pratyantardasha: "Pratyantardasha（微运）",
      moreBhukti: "还有 {count} 个 {bhukti}"
    },
    
    panchanga: {
      title: "Panchanga",
      nakshatra: "Nakshatra",
      tithi: "Tithi",
      yoga: "Yoga",
      karana: "Karana",
      vaara: "Vaara"
    },
    
    readingLoading: "星体正在排列...",
    readingLabel: "Vedic Reading",
    poweredBy: "Powered by Vedic Wisdom",
    languageMismatch: "语言已切换",
    regenerate: "重新解读",
    clickToRead: "点击按钮，探索你的星盘奥秘",
    startReading: "开始解读",
    
    interpretation: "深度解读",
    download: "下载报告",
    exploreMore: "继续探索"
  },
  
  pricing: {
    title: "定价方案",
    subtitle: "选择适合你的解读深度",
    heading: "解锁更多功能",
    memberOnly: "会员专享",
    unlock: "解锁全部功能",
    free: {
      name: "免费体验",
      price: "免费",
      badge: "Basic",
      features: ["基础星盘", "行星位置", "宫位分布", "Panchanga"],
      cta: "立即开始"
    },
    standard: {
      name: "深度解读",
      price: "¥29",
      badge: "热门",
      features: ["完整星盘", "Dasha 大运周期", "Ashtakavarga", "Panchanga", "无限 AI 深度解读", "事业/感情/性格三维解读"],
      cta: "解锁完整版"
    },
    yearly: {
      name: "年度会员",
      price: "¥99",
      badge: "高客单",
      features: ["适合做年度主题、阶段变化和重点窗口总结", "作为高客单补充层，而不是首页主入口", "可后续再接支付和报告导出"],
      cta: "了解更多"
    }
  },
  
  faq: {
    title: "FAQ",
    questions: [
      {
        q: "如何获取准确的出生时间？",
        a: "建议使用出生证明上的时间，或询问父母。如果时间不确定，可以先使用大致时间，后续通过校时功能调整。"
      },
      {
        q: "AI 解盘的准确性如何？",
        a: "AI 解盘基于专业的吠陀占星知识和专业占星术士，提供有参考价值的解读，但最终决策还需结合实际情况。"
      },
      {
        q: "可以保存我的星盘吗？",
        a: "是的，生成星盘后可以保存记录，方便后续查看和再次解读。"
      },
      {
        q: "支持哪些支付方式？",
        a: "目前支持主流的支付宝、微信支付等方式，支付流程安全便捷。"
      }
    ],
    productSuggestion: {
      title: "产品建议",
      content: "当前最值得卖的不是'更多频道'，而是'更深、更准、更有行动建议的印度星盘阅读'。所以首页只承接排盘，付费页只承接升级，不再分流到别的内容模块。",
      cta: "生成星盘"
    }
  },
  
  natalPage: {
    chartWorkspace: "Chart Workspace",
    premiumLogic: "Premium Logic",
    chartSummary: "Chart Summary",
    availableModules: "Available Modules",
    aiReading: "AI Reading",
    panchanga: "Panchanga",
    divisional: "Divisional",
    ascendant: "Asc",
    testModeActive: "Test Mode Active",
    testUnlock: "Test Unlock",
    startRectifier: "Start AI Rectifier",
    closeRectifier: "Close Rectifier",
    aiAnalyzing: "AI analyzing...",
    replyToAI: "Reply to AI",
    dasha: "Dasha",
    locked: "Premium Feature",
    lockedDetail: "This feature is available for premium users"
  },
  
  rectifier: {
    title: "AI 出生时间校正",
    desc: "AI 出生时间校正",
    subtitle: "输入关键生活事件",
    timeRange: "时间范围",
    estimatedTime: "估算时间",
    placeholder: "输入生活事件，如：2018年考上大学",
    timeEstimation: "时间估算（需要提供多个生活事件以提高准确性）",
    suggestedTime: "建议时间",
    confidence: "置信度",
    range: "时间范围",
    summary: "总结",
    eventsCollected: "已收集 {count} 个事件",
    noEvents: "暂无事件",
    initialGreeting: "你好！为了帮你校准出生时间，请提供尽可能多的关键生活事件，例如：升学、工作变动、婚姻、搬家、健康变化等，每个事件请尽量带上具体年份或月份。事件越多，校准结果越准确。",
    price: "30元/次",
    unlock: "解锁出生时间校正",
    unlockDetail: "出生时间校正需要提供多个关键生活事件（如升学、工作变动、婚姻、搬家等），系统将基于这些事件进行AI分析。如果无法获取足够信息，结果可能不准确。",
    errorMessage: "抱歉，AI 校时暂时不可用，请稍后再试。",
    impatientHint: "请根据已有信息直接给出一个合理的出生时间推测，不需要再问更多问题了。"
  },
  
  errors: {
    locationRequired: "请选择出生地点",
    dateRequired: "请选择出生日期",
    timeRequired: "请选择出生时间",
    nameRequired: "请输入姓名",
    locationFailed: "获取位置失败",
    networkError: "网络错误，请重试",
    chartGenerationFailed: "印度星盘生成失败",
    aiReadingFailed: "AI 解盘失败",
    aiReadingUnavailable: "AI 解盘暂时不可用",
    pleaseFillCompleteInfo: "请先填写完整的出生信息和坐标。"
  },
  
  locationMessages: {
    detectingLocation: "正在获取您的位置...",
    browserNotSupported: "当前浏览器不支持定位，请手动填写地点与坐标。",
    gettingLocationName: "正在获取位置名称...",
    locationSuccess: "定位成功！",
    locationFailed: "定位失败，请检查浏览器权限后重试，或手动填写。",
    autoDetectDetected: "已检测到手动输入，将保留您输入的位置信息",
    locatedPosition: "已定位位置",
    coordinates: "坐标",
    searching: "正在搜索位置...",
    foundResults: "找到 {count} 个位置",
    selectPosition: "已选择位置"
  },
  
  common: {
    loading: "加载中...",
    error: "出错了",
    retry: "重试",
    close: "关闭",
    cancel: "取消",
    confirm: "确认",
    save: "保存",
    back: "返回",
    next: "下一步",
    previous: "上一步",
    send: "发送"
  },
  
  language: {
    switch: "切换语言",
    zh: "中文",
    en: "English",
    hi: "हिन्दी"
  },
  footer: {
    description: "轻量版印度星盘排盘与 AI 解盘产品",
    quickLinks: "快速链接",
    home: "首页",
    chart: "排盘",
    pricing: "价格",
    about: "关于",
    aboutText: "专注于印度星盘排盘与 AI 解盘，提供精准、专业的吠陀占星服务。",
  }
};

export const en: TranslationKeys = {
  siteName: "Vedic Light",
  siteTagline: "Vedic Astrology · Deep Insights",
  heroTitle: "Explore Your Vedic Birth Chart",
  heroSubtitle: "AI-powered personalized destiny analysis based on your birth time and location",
  cta: "Generate My Chart",
  productFocus: "Product Focus",
  features: "Features",
  howItWorks: "How It Works",
  vedicAstrology: "Vedic Astrology",
  testimonials: "Testimonials",
  monetization: "Monetization",
  readyToStart: "Ready to Start",
  pricingLabel: "Pricing",
  
  home: {
    features: {
      title: "Why Choose Vedic Light?",
      accurate: {
        title: "Precise Chart Calculation",
        desc: "Based on Swetest algorithm, supporting Vimshottari Dasha and other Vedic astrology systems"
      },
      ai: {
        title: "AI Deep Analysis",
        desc: "Combined with professional astrologers for personalized destiny interpretation"
      },
      privacy: {
        title: "Local Processing",
        desc: "All calculations done locally, data used only for this reading"
      },
      worldTimezone: {
        title: "Global Timezones",
        desc: "Automatically calculate local time for any location worldwide"
      },
      fastGeneration: {
        title: "Fast Generation",
        desc: "Complete chart calculation in seconds, view results instantly"
      }
    },
    
    flow: {
      title: "Simple 3 Steps",
      steps: [
        {
          title: "Enter Information",
          body: "Enter name, date, time, birthplace, coordinates and timezone to generate a verifiable Vedic birth chart."
        },
        {
          title: "View Chart",
          body: "First check Lagna, twelve houses, nine planets, Panchanga and Dasha periods to confirm the basic structure."
        },
        {
          title: "Get Interpretation",
          body: "Choose from Overall, Career or Love reading focuses as the main paid upgrade product."
        }
      ]
    },
    
    highlights: [
      "Precise chart calculation",
      "First generate a structured chart for free, then decide whether to upgrade for AI deep interpretation.",
      "Calculation uses jyotishganit, interpretation constraints come from local vedic-astro-skills."
    ],
    
    testimonials: [
      {
        quote: "The AI interpretation is very accurate, especially the career analysis which gave me great inspiration.",
        author: "Mr. Zhang",
        role: "Product Manager"
      },
      {
        quote: "Clean interface, professional chart calculation, best Vedic astrology tool I've ever used.",
        author: "Ms. Li",
        role: "Psychological Counselor"
      }
    ],
    
    pricingSection: {
      title: "AI paid capabilities reserved as core business layer",
      subtitle: "Free tier only solves 'whether the chart can be generated first', paid tier solves 'how to read this chart, how to use it, and what to do now'.",
      cta: "View Pricing and Upgrade Path"
    }
  },
  
  natal: {
    title: "Generate Your New Chart",
    resultTitle: "'s Chart",
    unlockPrompt: "Unlock Full Interpretation",
    premiumTitle: "Generate Chart",
    subtitle: "One purpose only: convert birth information into a verifiable, deeply readable Vedic birth chart.",
    readingPrompts: {
      core: "Please provide a comprehensive interpretation of this Vedic birth chart, focusing on core personality traits, strengths, risks, and key areas to observe next.",
      career: "Please provide a career interpretation of this Vedic birth chart, focusing on career structure, suitable directions, current stage, and actionable recommendations.",
      love: "Please provide a relationship interpretation of this Vedic birth chart, focusing on relationship patterns, partnership themes, current timing, and actionable suggestions."
    },
    form: {
      name: "Name",
      namePlaceholder: "e.g., Xiaolin",
      location: "Birth Place",
      locationPlaceholder: "Enter location (from large to small, e.g., Country and Province)",
      date: "Birth Date",
      time: "Birth Time",
      latitude: "Latitude",
      longitude: "Longitude",
      timezone: "Timezone",
      timezoneHint: "Timezone UTC"
    },
    autoLocation: {
      button: "Auto Locate",
      locating: "Locating...",
      success: "Location Success!",
      failed: "Location Failed",
      hint: "Location can be auto-detected or manually entered",
      hintDetail: "Selecting a location will automatically fill in coordinates and timezone, which you can adjust."
    },
    location: {
      search: "Search Location",
      searchHint: "Hint: Enter from large to small, e.g., Country, Province, City",
      results: "Search Results",
      countries: "Popular Countries",
      clickToFill: "Click to fill",
      foundResults: "Found {count} locations",
      coordinates: "Coordinates",
      locatedPosition: "Located position",
      selectPosition: "Selected position",
      searching: "Searching location..."
    },
    submit: "Generate Chart",
    generating: "Generating...",
    generatingReading: "Generating reading..."
  },
  
  reading: {
    title: "Reading Focus",
    core: "Overall Reading",
    career: "Career Reading",
    love: "Love Reading",
    unlock: "Unlock Full Reading",
    unlocking: "Unlocking..."
  },
  
  result: {
    chart: "Chart",
    profile: "Profile",
    name: "Name",
    birthInfo: "Birth Information",
    location: "Birth Location",
    coordinates: "Coordinates",
    timezone: "Timezone",
    moonSign: "Moon Sign",
    sunSign: "Sun Sign",
    lagna: "Lagna (Ascendant)",
    
    houses: "Houses",
    house: "House {n}",
    sign: "Sign",
    lord: "Lord",
    nakshatra: "Nakshatra",
    pada: "Pada",
    dignity: "Dignity",
    value: "Value",
    tithi: "Tithi",
    yoga: "Yoga",
    karana: "Karana",
    vaara: "Vaara",
    reading: "AI Reading",
    readingFocus: {
      core: "Core Reading",
      career: "Career",
      love: "Love"
    },
    planets: "Planets",
    
    tableHeaders: {
      house: "House",
      sign: "Sign",
      lord: "Lord",
      planets: "Planets",
      planet: "Planet",
      degrees: "Degrees",
      status: "Status",
      level: "Level",
      nakshatra: "Nakshatra",
      start: "Start",
      end: "End",
      duration: "Duration"
    },
    
    dasha: {
      title: "Vimshottari Dasha",
      current: "Current Mahadasha",
      currentMaha: "Current Mahadasha",
      upcoming: "Upcoming Mahadashas",
      bhukti: "Bhukti (Sub-period)",
      balance: "Balance of Dasha",
      years: "years",
      mahadasha: "Mahadasha",
      antardasha: "Antardasha",
      antar: "Antardasha",
      pratyantardasha: "Pratyantardasha",
      moreBhukti: "...{count} more {bhukti}"
    },
    
    panchanga: {
      title: "Panchanga",
      nakshatra: "Nakshatra",
      tithi: "Tithi",
      yoga: "Yoga",
      karana: "Karana",
      vaara: "Vaara"
    },
    
    readingLoading: "Stars are aligning...",
    readingLabel: "Vedic Reading",
    poweredBy: "Powered by Vedic Wisdom",
    languageMismatch: "Language changed",
    regenerate: "Regenerate",
    clickToRead: "Click to explore your chart",
    startReading: "Start Reading",
    
    interpretation: "Deep Interpretation",
    download: "Download Report",
    exploreMore: "Explore More"
  },
  
  pricing: {
    title: "Pricing Plans",
    subtitle: "Choose your depth of interpretation",
    heading: "Unlock More Features",
    memberOnly: "Members Only",
    unlock: "Unlock All Features",
    free: {
      name: "Free Trial",
      price: "Free",
      badge: "Basic",
      features: ["Basic chart", "Planet positions", "House distribution", "Panchanga"],
      cta: "Get Started"
    },
    standard: {
      name: "Deep Reading",
      price: "¥29",
      badge: "Popular",
      features: ["Complete chart", "Dasha periods", "Ashtakavarga", "Panchanga", "Unlimited AI deep readings", "Career/Love/Personality 3D reading"],
      cta: "Unlock Full Version"
    },
    yearly: {
      name: "Yearly Membership",
      price: "¥99",
      badge: "Premium",
      features: ["Suitable for yearly themes, phase changes and key window summaries", "As a premium supplement layer, not the main homepage entry", "Can connect to payment and report export later"],
      cta: "Learn More"
    }
  },
  
  faq: {
    title: "FAQ",
    questions: [
      {
        q: "How to get accurate birth time?",
        a: "It is recommended to use the time on your birth certificate or ask your parents. If the time is uncertain, you can use an approximate time first and adjust later using the rectification feature."
      },
      {
        q: "How accurate is AI interpretation?",
        a: "AI interpretation is based on professional Vedic astrology knowledge and professional astrologers, providing valuable reference interpretations, but final decisions should consider actual circumstances."
      },
      {
        q: "Can I save my chart?",
        a: "Yes, you can save records after generating a chart for easy future viewing and re-interpretation."
      },
      {
        q: "What payment methods are supported?",
        a: "Currently supports major payment methods such as Alipay and WeChat Pay, with secure and convenient payment process."
      }
    ],
    productSuggestion: {
      title: "Product Suggestion",
      content: "The most valuable thing to sell now is not 'more channels', but 'deeper, more accurate, more actionable Vedic chart readings'. So the homepage only handles chart generation, the paid page only handles upgrades, no longer diverting to other content modules.",
      cta: "Generate Chart"
    }
  },
  
  natalPage: {
    chartWorkspace: "Chart Workspace",
    premiumLogic: "Premium Logic",
    chartSummary: "Chart Summary",
    availableModules: "Available Modules",
    aiReading: "AI Reading",
    panchanga: "Panchanga",
    divisional: "Divisional",
    ascendant: "Asc",
    testModeActive: "Test Mode Active",
    testUnlock: "Test Unlock",
    startRectifier: "Start AI Rectifier",
    closeRectifier: "Close Rectifier",
    aiAnalyzing: "AI analyzing...",
    replyToAI: "Reply to AI",
    dasha: "Dasha",
    locked: "Premium Feature",
    lockedDetail: "This feature is available for premium users"
  },
  
  rectifier: {
    title: "AI Birth Time Rectifier",
    desc: "AI Birth Time Rectification",
    subtitle: "Enter Key Life Events",
    timeRange: "Time Range",
    estimatedTime: "Estimated Time",
    placeholder: "Enter life events, e.g., Entered college in 2018",
    timeEstimation: "Time Estimation (Multiple life events are required for better accuracy)",
    suggestedTime: "Suggested Time",
    confidence: "Confidence",
    range: "Range",
    summary: "Summary",
    eventsCollected: "{count} events collected",
    noEvents: "No events yet",
    initialGreeting: "Hello! To help you rectify your birth time, please provide as many key life events as possible, such as: education, job changes, marriage, moving, health changes, etc. For each event, please provide the year or month if possible. More events lead to more accurate results.",
    errorMessage: "Sorry, AI time rectification is temporarily unavailable. Please try again later.",
    impatientHint: "Please directly give a reasonable birth time estimate based on the existing information, no need to ask more questions.",
    price: "¥30 per use",
    unlock: "Unlock Birth Time Rectification",
    unlockDetail: "Birth time rectification requires multiple key life events (such as education, job changes, marriage, moving, etc.). The system will perform AI analysis based on these events. If sufficient information cannot be obtained, the results may not be accurate."
  },
  
  errors: {
    locationRequired: "Please select birth location",
    dateRequired: "Please select birth date",
    timeRequired: "Please select birth time",
    nameRequired: "Please enter your name",
    locationFailed: "Failed to get location",
    networkError: "Network error, please retry",
    chartGenerationFailed: "Failed to generate Vedic birth chart",
    aiReadingFailed: "AI interpretation failed",
    aiReadingUnavailable: "AI interpretation temporarily unavailable",
    pleaseFillCompleteInfo: "Please fill in complete birth information and coordinates first."
  },
  
  locationMessages: {
    detectingLocation: "Getting your location...",
    browserNotSupported: "Current browser does not support geolocation. Please fill in location and coordinates manually.",
    gettingLocationName: "Getting location name...",
    locationSuccess: "Location success!",
    locationFailed: "Location failed. Please check browser permissions and try again, or fill in manually.",
    autoDetectDetected: "Manual input detected. Your entered location will be preserved.",
    locatedPosition: "Located position",
    coordinates: "Coordinates",
    searching: "Searching for location...",
    foundResults: "Found {count} locations",
    selectPosition: "Selected position"
  },
  
  common: {
    loading: "Loading...",
    error: "Error",
    retry: "Retry",
    close: "Close",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    back: "Back",
    next: "Next",
    previous: "Previous",
    send: "Send"
  },
  
  language: {
    switch: "Switch Language",
    zh: "中文",
    en: "English",
    hi: "हिन्दी"
  },
  footer: {
    description: "Lightweight Vedic Astrology Chart Generation & AI Interpretation Product",
    quickLinks: "Quick Links",
    home: "Home",
    chart: "Chart",
    pricing: "Pricing",
    about: "About",
    aboutText: "Focus on Vedic chart generation and AI interpretation, providing accurate and professional Vedic Astrology services.",
  }
};

export const hi: TranslationKeys = {
  siteName: "వైదిక లైట్",
  siteTagline: "వైదిక జ్యోతిష · గహన అంతర్దృష్టి",
  heroTitle: "అపనా వైదిక కుండలీ కనుగొనండి",
  heroSubtitle: "మీ పుట్టిన సమయం మరియు స్థానం ఆధారంగా AI ద్వారా వ్యక్తిగత భాగ్య విశ్లేషణ",
  cta: "మీ కుండలీ తయారు చేయండి",
  productFocus: "ఉత్పాద ఫోకస్",
  features: "విశేషతలు",
  howItWorks: "ఇది ఎలా పనిచేస్తుంది",
  vedicAstrology: "వైదిక జ్యోతిష",
  testimonials: "విన్నపాటలు",
  monetization: "మొనిటైజేషన్",
  readyToStart: "ప్రారంభించడానికి సిద్ధం",
  pricingLabel: "విలువలు",
  
  home: {
    features: {
      title: "వైదిక లైట్ ఎందుకు ఎంచుకోవాలి?",
      accurate: {
        title: "సటీక కుండలీ గణన",
        desc: "Swetest ఎల్గోరిథమ్ ఆధారంగా, విమ్షోతరీ దశ మరియు ఇతర వైదిక జ్యోతిష విధానాలకు మద్దతు"
      },
      ai: {
        title: "AI గహన విశ్లేషణ",
        desc: "ప్రొఫెషనల్ జ్యోతిషులతో కలిసి వ్యక్తిగత భాగ్య వ్యాఖ్యానం"
      },
      privacy: {
        title: "స్థానీయ ప్రాసెసింగ్",
        desc: "అన్ని గణనలు స్థానీయంగా మాత్రమే పూర్తవుతాయి, డేటా ఈ పాఠం కోసం మాత్రమే ఉపయోగించబడుతుంది"
      },
      worldTimezone: {
        title: "ప్రపంచ సమయ ప్రాంతాలు",
        desc: "ప్రపంచంలోని ఏ స్థానానికైనా స్థానీయ సమయాన్ని స్వయంచాలకంగా లెక్కించండి"
      },
      fastGeneration: {
        title: "త్వరిత సృష్టి",
        desc: "కొన్ని సెకన్లలో కుండలీ గణన పూర్తి, తక్షణమే ఫలితాలను చూడండి"
      }
    },
    
    flow: {
      title: "3 సరళ దశలు",
      steps: [
        {
          title: "సమాచారం ప్రవేశపెట్టండి",
          body: "పేరు, తేదీ, సమయం, పుట్టిన ప్రదేశం, నిర్దేశాంకాలు మరియు సమయ ప్రదేశాన్ని నమోదు చేసి, సరైన వైదిక కుండలీని తయారు చేయండి."
        },
        {
          title: "కుండలీని చూడండి",
          body: "మొదట లగ్న, పన్నెండు భావాలు, తొమ్మిది గ్రహాలు, పంచాంగం మరియు దశ పీరియడ్లను పరిశీలించి, ప్రాథమిక నిర్మాణం సరైనదా అని నిర్ధారించండి."
        },
        {
          title: "వ్యాఖ్యానాన్ని పొందండి",
          body: "ముఖ్య చెల్లింపున్న అప్‌గ్రేడ్ ఉత్పత్తిగా మొత్తం, వృత్తి లేదా ప్రేమ పాఠ ఫోకస్‌లను ఎంచుకోండి."
        }
      ]
    },
    
    highlights: [
      "సటీక కుండలీ గణన",
      "ప్రధానంగా ఉచితంగా స్ట్రక్చర్డ్ కుండలీని తయారు చేస్తారు, తర్వాత AI గహన వ్యాఖ్యానానికి అప్‌గ్రేడ్ చేయాలని నిర్ణయించుకోండి.",
      "గణన jyotishganit ని ఉపయోగిస్తుంది, వ్యాఖ్యాన పరిమితులు స్థానీయ vedic-astro-skills నుండి వస్తాయి."
    ],
    
    testimonials: [
      {
        quote: "AI వ్యాఖ్యానం చాలా సటీకగా ఉంది, ముఖ్యంగా క్యరియర్ విశ్లేషణ నాకు పెద్ద ప్రేరణనిచ్చింది.",
        author: "శ్రీమాన్ జాంగ్",
        role: "ఉత్పాద ప్రబంధకుడు"
      },
      {
        quote: "స్వచ్ఛమైన ఇంటర్‌ఫేస్, ప్రొఫెషనల్ కుండలీ గణన, నేను ఇప్పటి వరకు ఉపయోగించిన ఉత్తమ వైదిక జ్యోతిష సాధనం.",
        author: "శ్రీమతి లీ",
        role: "మనోవైజ్ఞానిక సలహాదారుడు"
      }
    ],
    
    pricingSection: {
      title: "AI చెల్లింపైన సామర్థ్యాలు ప్రధాన వ్యాపార పొరగా రిజర్వ్",
      subtitle: "ఉచిత స్థాయి కేవలం 'ముందు కుండలీని తయారు చేయగలదా అనే' ప్రశ్నను పరిష్కరిస్తుంది, చెల్లింపైన స్థాయి 'ఈ కుండలీని ఎలా చదవాలి, ఎలా ఉపయోగించాలి, ఇప్పుడు ఏమి చేయాలి' అనే ప్రశ్నను పరిష్కరిస్తుంది.",
      cta: "విలువలు మరియు అప్‌గ్రేడ్ మార్గాన్ని చూడండి"
    }
  },
  
  natal: {
    title: "మీ కొత్త కుండలీని తయారు చేయండి",
    resultTitle: "యొక్క కుండలీ",
    unlockPrompt: "పూర్తి వ్యాఖ్యానాన్ని అన్‌లాక్ చేయండి",
    premiumTitle: "కుండలీ తయారు చేయండి",
    subtitle: "ఒకే లక్ష్యం: పుట్టిన సమాచారాన్ని సరైన ప్రక్రియతో ఒక సత్యాపనీయమైన వైదిక కుండలీగా మార్చడం.",
    readingPrompts: {
      core: "కృపయా ఈ వైదిక కుండలీ ఆధారంగా ఒక మొత్తపు వ్యాఖ్యాన్ని తయారు చేయండి, ప్రధాన ప్రవృత్తి, ప్రయోజనాలు, ప్రమాదాలు మరియు తదుపరి పరిశీలన ప్రాధాన్యతలపై ప్రాధాన్యతను ఇవ్వండి.",
      career: "కృపయా ఈ వైదిక కుండలీ ఆధారంగా ఒక క్యరియర్ వ్యాఖ్యాన్ని తయారు చేయండి, వృత్తి నిర్మాణం, సరైన దిశలు, ప్రస్తుత దశ మరియు చర్యా సూచనలపై ప్రాధాన్యతను ఇవ్వండి.",
      love: "కృపయా ఈ వైదిక కుండలీ ఆధారంగా ఒక ప్రేమ వ్యాఖ్యాన్ని తయారు చేయండి, సంబంధ రకాలు, భార్యాభర్త ప్రధానాంశాలు, ప్రస్తుత విండో మరియు చర్యా సూచనలపై ప్రాధాన్యతను ఇవ్వండి."
    },
    form: {
      name: "పేరు",
      namePlaceholder: "ఉదా., శ్యామ్",
      location: "పుట్టిన ప్రదేశం",
      locationPlaceholder: "స్థానాన్ని నమోదు చేయండి (పెద్ద నుంచి చిన్నదానికి, ఉదా., దేశం మరియు ప్రాంతం)",
      date: "పుట్టిన తేదీ",
      time: "పుట్టిన సమయం",
      latitude: "అక్షాంశం",
      longitude: "రేఖాంశం",
      timezone: "సమయ ప్రదేశం",
      timezoneHint: "సమయ ప్రదేశం UTC"
    },
    autoLocation: {
      button: "స్వయంచాలకంగా స్థానాన్ని పొందండి",
      locating: "స్థానం శోధిస్తోంది...",
      success: "స్థానం విజయవంతం!",
      failed: "స్థానం విఫలమైంది",
      hint: "స్థానం స్వయంచాలకంగా లేదా మాన్యువల్ రూపంలో నమోదు చేయవచ్చు",
      hintDetail: "ఒక స్థానాన్ని ఎంచుకున్నప్పుడు అక్షాంశం, రేఖాంశం మరియు సమయ ప్రదేశాన్ని స్వయంచాలకంగా పూర్తిచేస్తుంది, మీరు దానిని సరిచేసుకోవచ్చు."
    },
    location: {
      search: "స్థానం శోధించండి",
      searchHint: "సూచన: పెద్ద నుంచి చిన్నదానికి నమోదు చేయండి, ఉదా., దేశం, ప్రాంతం, నగరం",
      results: "శోధన ఫలితాలు",
      countries: "ప్రాచుర్య రంగాలు",
      clickToFill: "పూర్తి చేయడానికి క్లిక్ చేయండి",
      foundResults: "{count} స్థానాలు కనుగొనబడ్డాయి",
      coordinates: "నిర్దేశాంకాలు",
      locatedPosition: "స్థానం పొందిన ప్రదేశం",
      selectPosition: "ఎంచుకున్న ప్రదేశం",
      searching: "స్థానం శోధిస్తోంది..."
    },
    submit: "కుండలీ తయారు చేయండి",
    generating: "తయారుచేస్తోంది...",
    generatingReading: "పాఠం తయారుచేస్తోంది..."
  },
  
  reading: {
    title: "పాఠ ఫోకస్",
    core: "మొత్తపు పాఠం",
    career: "వృత్తి పాఠం",
    love: "ప్రేమ పాఠం",
    unlock: "పూర్తి పాఠాన్ని అన్‌లాక్ చేయండి",
    unlocking: "అన్‌లాక్ అవుతోంది..."
  },
  
  result: {
    chart: "కుండలీ",
    profile: "ప్రొఫైల్",
    name: "పేరు",
    birthInfo: "పుట్టిన సమాచారం",
    location: "పుట్టిన ప్రదేశం",
    coordinates: "నిర్దేశాంకాలు",
    timezone: "సమయ ప్రదేశం",
    moonSign: "చంద్ర రాశి",
    sunSign: "సూర్య రాశి",
    lagna: "లగ్న",
    
    houses: "భావాలు",
    house: "భావ {n}",
    sign: "రాశి",
    lord: "స్వామి",
    nakshatra: "నక్షత్రం",
    pada: "పాదం",
    dignity: "గౌరవం",
    value: "మూల్యం",
    tithi: "తిథి",
    yoga: "యోగ",
    karana: "కరణ",
    vaara: "వార",
    reading: "AI పాఠం",
    readingFocus: {
      core: "ముఖ్యమైన పాఠం",
      career: "వృత్తి",
      love: "ప్రేమ"
    },
    planets: "గ్రహాలు",
    
    tableHeaders: {
      house: "భావం",
      sign: "రాశి",
      lord: "స్వామి",
      planets: "గ్రహాలు",
      planet: "గ్రహం",
      degrees: "డిగ్రీలు",
      status: "స్థితి",
      level: "స్థాయి",
      nakshatra: "నక్షత్రం",
      start: "ప్రారంభం",
      end: "ముగింపు",
      duration: "వ్యవధి"
    },
    
    dasha: {
      title: "విమ్షోతరీ దశ",
      current: "ప్రస్తుత మహాదశ",
      currentMaha: "ప్రస్తుత మహాదశ",
      upcoming: "రాబోయే మహాదశలు",
      bhukti: "భుక్తి (ఉప-పీరియడ్)",
      balance: "దాశా బ్యాలెన్స్",
      years: "సంవత్సరాలు",
      mahadasha: "మహాదశ",
      antardasha: "అంతర్దశ",
      antar: "అంతర్దశ",
      pratyantardasha: "ప్రత్యంతర్దశ",
      moreBhukti: "...{count} మరియు {bhukti}"
    },
    
    panchanga: {
      title: "పంచాంగం",
      nakshatra: "నక్షత్రం",
      tithi: "తిథి",
      yoga: "యోగం",
      karana: "కరణం",
      vaara: "వారం"
    },
    
    readingLoading: "తారలు సమలేఖనం చేస్తున్నాయి...",
    readingLabel: "వేదిక్ రీడింగ్",
    poweredBy: "వేదిక్ విజ్ఞానం ద్వారా ప్రచారিত",
    languageMismatch: "భాష మార్చబడింది",
    regenerate: "పునః జనరేట్",
    clickToRead: "మీ చార్ట్‌ను అన్వేషించడానికి క్లిక్ చేయండి",
    startReading: "రీడింగ్ ప్రారంభించండి",
    
    interpretation: "గహన వ్యాఖ్యానం",
    download: "రిపోర్ట్ డౌన్‌లోడ్ చేయండి",
    exploreMore: "మరిన్ని అన్వేషించండి"
  },
  
  pricing: {
    title: "విలువల ప్రణాళికలు",
    subtitle: "మీ వ్యాఖ్యానం లోతును ఎంచుకోండి",
    heading: "మరిన్ని ఫీచర్లను అన్‌లాక్ చేయండి",
    memberOnly: "మెంబర్స్ మాత్రమే",
    unlock: "అన్ని ఫీచర్లను అన్‌లాక్ చేయండి",
    free: {
      name: "ఉచిత ప్రయత్నం",
      price: "ఉచితం",
      badge: "బేసిక్",
      features: ["ప్రాథమిక కుండలీ", "గ్రహ స్థానాలు", "భావ పంపిణీ", "పంచాంగం"],
      cta: "ప్రారంభించండి"
    },
    standard: {
      name: "గహన పాఠం",
      price: "¥29",
      badge: "ప్రాచుర్యం",
      features: ["పూర్తి కుండలీ", "దశ పీరియడ్లు", "అష్టకవర్గం", "పంచాంగం", "అసీమ AI గహన పాఠాలు", "వృత్తి/ప్రేమ/వ్యక్తిత్వ 3D పాఠం"],
      cta: "పూర్తి వెర్షన్ అన్‌లాక్ చేయండి"
    },
    yearly: {
      name: "వార్షిక సభ్యత్వం",
      price: "¥99",
      badge: "ప్రీమియం",
      features: ["వార్షిక ప్రధానాంశాలు, దశ మార్పులు మరియు ముఖ్య విండో సారాంశాల కోసం సరైనది", "ప్రధాన హోమ్‌పేజ్ ఎంట్రీ కాకుండా ప్రీమియం పూరక పొరగా", "తర్వాత చెల్లింపు మరియు రిపోర్ట్ ఎగుమతి సంప్రదించవచ్చు"],
      cta: "మరిన్ని తెలుసుకోండి"
    }
  },
  
  faq: {
    title: "FAQ",
    questions: [
      {
        q: "సటీక పుట్టిన సమయం ఎలా పొందాలి?",
        a: "మీ పుట్టిన ప్రమాణ పత్రంపై సమయాన్ని ఉపయోగించడానికి లేదా మీ తల్లిదండ్రులను అడగడానికి సిఫారసు చేస్తాము. సమయం అనిశ్చితంగా ఉంటే, మొదట ఒక అంచనా సమయాన్ని ఉపయోగించవచ్చు మరియు తరువాత సవరణ సౌకర్యాన్ని ఉపయోగించి సరిచేసుకోవచ్చు."
      },
      {
        q: "AI వ్యాఖ్యానం యొక్క సటీకత ఎంత?",
        a: "AI వ్యాఖ్యానం ప్రొఫెషనల్ వైదిక జ్యోతిష జ్ఞానం మరియు ప్రొఫెషనల్ జ్యోతిషులు ఆధారంగా ఉంది, విలువైన సూచన వ్యాఖ్యానాలను అందిస్తుంది, కానీ తుది నిర్ణయాలు వాస్తవ పరిస్థితులను పరిగణనలోకి తీసుకోవాలి."
      },
      {
        q: "నా కుండలీని సేవ్ చేయవచ్చా?",
        a: "అవును, భవిష్యత్తులో సులభంగా చూడడానికి మరియు మళ్లీ వ్యాఖ్యానించడానికి కుండలీని తయారు చేసిన తరువాత రికార్డులను సేవ్ చేయవచ్చు."
      },
      {
        q: "ఏ చెల్లింపు పద్ధతులకు మద్దతు ఇస్తారు?",
        a: "ప్రస్తుతం Alipay మరియు WeChat Pay వంటి ప్రధాన చెల్లింపు పద్ధతులకు మద్దతు ఇస్తుంది, సురక్షితమైన మరియు సౌకర్యకరమైన చెల్లింపు ప్రక్రియతో."
      }
    ],
    productSuggestion: {
      title: "ఉత్పాద సూచన",
      content: "ఇప్పుడు విక్రయించడానికి అత్యంత విలువైన విషయం 'మరిన్ని ఛానెల్సు' కాదు, 'లోతైన, మరింత సటీకమైన, మరింత చర్య తీసుకోగల వైదిక కుండలీ పాఠం' కాదు. అందువల్ల హోమ్‌పేజ్ కేవలం కుండలీ సృష్టిని నిర్వహిస్తుంది, చెల్లించిన పేజీ కేవలం అప్‌గ్రేడ్‌లను మాత్రమే నిర్వహిస్తుంది.",
      cta: "కుండలీ తయారు చేయండి"
    }
  },
  
  natalPage: {
    chartWorkspace: "కుండలీ పనిప్రదేశం",
    premiumLogic: "ప్రీమియం లాజిక్",
    chartSummary: "కుండలీ సారాంశం",
    availableModules: "అందుబాటులో ఉన్న మాడ్యూళ్ళు",
    aiReading: "AI పాఠం",
    panchanga: "పంచాంగం",
    divisional: "విభాజనీయ",
    ascendant: "అసెండెంట్",
    testModeActive: "పరీక్ష మోడ్ సక్రియం",
    testUnlock: "పరీక్ష అన్‌లాక్",
    startRectifier: "AI సమయ సవరణను ప్రారంభించండి",
    closeRectifier: "సమయ సవరణను మూసివేయండి",
    aiAnalyzing: "AI విశ్లేషిస్తోంది...",
    replyToAI: "AIకి సమాధానం ఇవ్వండి",
    dasha: "దశ",
    locked: "ప్రీమియం ఫీచర్",
    lockedDetail: "ఈ ఫీచర్ ప్రీమియం వినియోగదారులకు అందుబాటులో ఉంది"
  },
  
  rectifier: {
    title: "AI పుట్టిన సమయ సవరణ",
    desc: "AI పుట్టిన సమయ సవరణ",
    subtitle: "కీలక జీవన సంఘటనలను ప్రవేశపెట్టండి",
    timeRange: "సమయ పరిధి",
    estimatedTime: "అంచనా సమయం",
    placeholder: "జీవన సంఘటనలను ప్రవేశపెట్టండి, ఉదా: 2018 లో కళాశాలకు ప్రవేశించారు",
    timeEstimation: "సమయ అంచనా (నెలకు మెరుగైన ఖచ్చితత్వం కోసం మúltiple జీవన సంఘటనలు అవసరం)",
    suggestedTime: "సూచించిన సమయం",
    confidence: "విశ్వాసం",
    range: "పరిధి",
    summary: "సారాంశం",
    eventsCollected: "{count} సంఘటనలు సేకరించబడ్డాయి",
    noEvents: "ఇప్పటి వరకు ఏ సంఘటనలు లేవు",
    initialGreeting: "నమస్తే! మీ పుట్టిన సమయాన్ని సరిచేయడంలో మీకు సహాయం చేయడానికి, విద్య, ఉద్యోగ మార్పులు, వివాహం, ఇంటి మార్పు, ఆరోగ్య మార్పులు వంటి కీలక జీవన సంఘటనలను ఎంత ఎక్కువగా అందించండి. ప్రతి సంఘటనకు సంవత్సరం లేదా నెలను అందించండి. ఎక్కువ సంఘటనలు ఎక్కువ ఖచ్చితమైన ఫలితాలకు దారితీస్తాయి.",
    errorMessage: "క్షమించండి, AI సమయ సవరణ ప్రస్తుతం అందుబాటులో లేదు. దయచేసి తర్వాత మళ్ళీ ప్రయత్నించండి.",
    impatientHint: "దయచేసి ఉనికిలో ఉన్న సమాచారం ఆధారంగా నేరుగా ఒక సహేతుకమైన పుట్టిన సమయ అంచనను ఇవ్వండి, మరిన్ని ప్రశ్నలు అడగనవసరం లేదు.",
    price: "ఒక్కసారి 30 రూపాయలు",
    unlock: "పుట్టిన సమయ సవరణను అన్‌లాక్ చేయండి",
    unlockDetail: "పుట్టిన సమయ సవరణకు múltiples కీలక జీవన సంఘటనలు అవసరం (విద్య, ఉద్యోగ మార్పులు, వివాహం, ఇంటి మార్పు వంటివి). సిస్టమ్ ఈ సంఘటనల ఆధారంగా AI విశ్లేషణను నిర్వహించacaktır. తగినంత సమాచారాన్ని పొందలేకపోతే, ఫలితాలు ఖచ్చితమైనవి కావచ్చు."
  },
  
  errors: {
    locationRequired: "దయచేసి పుట్టిన ప్రదేశాన్ని ఎంచుకోండి",
    dateRequired: "దయచేసి పుట్టిన తేదీని ఎంచుకోండి",
    timeRequired: "దయచేసి పుట్టిన సమయాన్ని ఎంచుకోండి",
    nameRequired: "దయచేసి మీ పేరును నమోదు చేయండి",
    locationFailed: "స్థానాన్ని పొందడం విఫలమైంది",
    networkError: "నెట్‌వర్క్ లోపం, దయచేసి మళ్లీ ప్రయత్నించండి",
    chartGenerationFailed: "వైదిక కుండలీని తయారుచేయడం విఫలమైంది",
    aiReadingFailed: "AI వ్యాఖ్యానం విఫలమైంది",
    aiReadingUnavailable: "AI వ్యాఖ్యానం ప్రస్తుతం అందుబాటులో లేదు",
    pleaseFillCompleteInfo: "దయచేసి ముందు పూర్తి పుట్టిన సమాచారం మరియు నిర్దేశాంకాలను నమోదు చేయండి."
  },
  
  locationMessages: {
    detectingLocation: "మీ స్థానాన్ని పొందుతోంది...",
    browserNotSupported: "ప్రస్తుత బ్రౌజర్ స్థానాన్ని పొందడానికి మద్దతు ఇవ్వదు. దయచేసి స్థానం మరియు నిర్దేశాంకాలను మాన్యువల్ రూపంలో నమోదు చేయండి.",
    gettingLocationName: "స్థాన పేరు పొందుతోంది...",
    locationSuccess: "స్థానం విజయవంతం!",
    locationFailed: "స్థానం విఫలమైంది. దయచేసి బ్రౌజర్ అనుమతులను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి లేదా మాన్యువల్ రూపంలో నమోదు చేయండి.",
    autoDetectDetected: "మాన్యువల్ ఇన్పుట్ కనుగొనబడింది. మీరు నమోదు చేసిన స్థానం భద్రంగా ఉంటుంది.",
    locatedPosition: "స్థానం పొందిన ప్రదేశం",
    coordinates: "నిర్దేశాంకాలు",
    searching: "స్థానం శోధిస్తోంది...",
    foundResults: "{count} ప్రదేశాలు కనుగొనబడ్డాయి",
    selectPosition: "ఎంచుకున్న ప్రదేశం"
  },
  
  common: {
    loading: "లోడ్ అవుతోంది...",
    error: "లోపం",
    retry: "మళ్ళీ ప్రయత్నించండి",
    close: "మూసివేయండి",
    cancel: "రద్దు చేయండి",
    confirm: "నిర్ధారించండి",
    save: "సేవ్ చేయండి",
    back: "వెనుకకు",
    next: "తదుపరి",
    previous: "గత",
    send: "పంపండి"
  },
  
  language: {
    switch: "భాషను మార్చండి",
    zh: "中文",
    en: "English",
    hi: "हिन्दी"
  },
  footer: {
    description: "తేలికైన వైదిక జ్యోతిష చార్ట్ జనరేషన్ మరియు AI వ్యాఖ్యానం ఉత్పత్తి",
    quickLinks: "త్వరిత లింక్స్",
    home: "హోమ్",
    chart: "చార్ట్",
    pricing: "విలువలు",
    about: "గురించి",
    aboutText: "వైదిక చార్ట్ జనరేషన్ మరియు AI వ్యాఖ్యానంపై దృష్టి కేంద్రీకరించండి, సటీకమైన మరియు ప్రొఫెషనల్ వైదిక జ్యోతిష సేవలను అందిస్తాము.",
  }
};

export const translations = { zh, en, hi };

export function t(lang: Language): TranslationKeys {
  return translations[lang];
}
