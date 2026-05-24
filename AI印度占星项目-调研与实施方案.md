# AI 印度占星项目 — 调研与实施方案

> 生成日期：2026-05-22  
> 目标：面向中国国内用户的 AI 印度吠陀占星 Web 平台

---

## 一、什么是 AI 印度占星

**印度占星（Vedic Astrology / Jyotisha）** 源自印度传统哲学，与西洋占星的三大核心区别：

| 维度     | 印度占星                                   | 西洋占星                             |
| -------- | ------------------------------------------ | ------------------------------------ |
| 黄道系统 | **恒星黄道**（Sidereal），以固定恒星为基准 | 回归黄道（Tropical），以春分点为基准 |
| 重点     | 上升星座、月亮星座、Nakshatra（月宿）      | 太阳星座                             |
| 倾向     | **人生事件预测**（婚姻、事业、财运、健康） | 个性分析与心理描述                   |

**AI 印度占星** = 利用 AI（ChatGPT / Gemini / DeepSeek 等）解读印度星盘。  
近期在社交平台爆火，做法：上传星盘图片 → AI 用提示词解盘 → 输出性格/事业/感情/财运分析。

---

## 二、商业模式分析（能不能赚钱）

### 2.1 市场数据

| 平台             | 关键数据                                                    |
| ---------------- | ----------------------------------------------------------- |
| **Astrotalk**    | 年营收 **₹1,182 Cr（≈¥10 亿）**，4300 万+用户，13000+占星师 |
| **AstroSage**    | AI 收入月增长 20%，占整体业务 25%                           |
| **MyNaksh**      | 获 ₹7.5 Cr（≈¥750 万）融资                                  |
| 全球灵性科技市场 | **$120 亿**，年增长率 15%+                                  |

### 2.2 已验证的变现模式

|     层级     | 模式                           | 定价参考                   |
| :----------: | ------------------------------ | -------------------------- |
|     免费     | 基础星盘 + 每日运势            | SEO 引流                   |
|    ¥19.9     | 深度解盘报告                   | 单次付费                   |
|    ¥29.9     | 姻缘合盘 / 择吉日              | 单次付费                   |
|   ¥39.9/月   | 月度运势订阅                   | 订阅制                     |
|     ¥99      | 年运报告                       | 高客单价                   |
| **终极形态** | 混合模式：AI 引流 + 真人占星师 | Astrotalk 模式：按分钟计费 |

### 2.3 成本估算

| 项目                     |   月成本    |
| ------------------------ | :---------: |
| 香港 VPS（已有）         |     ¥0      |
| 域名摊销                 |     ≈¥8     |
| DeepSeek API（千份报告） |    ≈¥30     |
| 数据库                   |    免费     |
| **合计**                 | **≈¥40/月** |

> 每份深度报告定价 ¥19.9，5 份回本，之后全是利润。

---

## 三、竞品调研

### 3.1 KundliAI（kundliai.in）⭐ 主参考

- **形态**：Web 网站，响应式
- **创始人**：独立开发者 17 天建成
- **技术**：AstrologyAPI（Swiss Ephemeris）+ Groq（LLM）+ Vercel
- **流量**：10,000+ 星盘生成，4.9★ 评分
- **变现**：免费引流 → 付费报告（¥99-199）
- **语言**：印地语 + 英语
- **特色**：免费生成星盘 + AI 对话 + 每日运势 + 姻缘配对 + Nakshatra 查询

**值得模仿的点：**

- 首页直接填出生信息，零摩擦
- 免费看摘要 → 付费解锁完整报告
- 丰富的免费工具（每日运势、Panchang、博客）做 SEO

### 3.2 Jyotish AI（zyotish.com）⭐ 商业模式参考

- **形态**：Flutter 移动 App
- **技术**：Google Cloud Platform + Vertex AI / Gemini 1.5 + Firebase
- **用户**：1,000+ 活跃用户，4.5★ 评分
- **会员层级**：

|    层级     | 价格 | 权益                           |
| :---------: | :--: | ------------------------------ |
|    Promo    | 限免 | 无限星盘 + AI 提问             |
|   Seeker    | 免费 | 1 张星盘 + 每天 2 次 AI 提问   |
|  Explorer   | 付费 | 4 张星盘 + 300 次/月 AI 提问   |
| Enlightened | 付费 | 12 张星盘 + 1000 次/月 AI 提问 |

### 3.3 Daanyam（daanyam.in）— 功能完整性参考

- AI 排盘 + Muhurat（择吉）+ Seva（远程祭祀仪式）
- 涵盖 Kundli、Dasha、Panchang、姻缘配对、朝圣指南
- 使用 Swiss Ephemeris + Brihat Parashara Hora Shastra
- **特色**：AI + 宗教仪式服务结合，是更完整的生态

### 3.4 其他竞品

| 平台      | 特点                                |
| --------- | ----------------------------------- |
| Astrotalk | 最大平台，人+AI 混合，¥10 亿年营收  |
| AstroSage | 25 个 AI 占星师 Avatar，月增长 20%  |
| Lagna360  | NASA JPL 星历 + 50 万张星盘训练数据 |
| Nummi     | iOS App，Vedic + AI 对话式体验      |
| Astroo.ai | AI 占星平台，支持实时行运追踪       |

---

## 四、核心技术难点 — 排盘 vs 解盘

### 4.1 核心认知（至关重要）

```
排盘 = 天文学计算（数学）    ← AI 不擅长，需要专用库
解盘 = 占星解读（语言）     ← AI 擅长，LLM 即可
```

**LLM 无法做排盘的原因：** 排盘涉及：

- 查询精确行星黄道经度
- Ayanamsa（岁差）校正
- 上升星座球面三角计算
- 12 宫位分配
- Nakshatra 定位
- Dasha 大运精确计算

这些是**天文计算**，不是语言问题。LLM 会算错或编造。

### 4.2 三大难点与解法

#### 难点一：零护城河

**问题**：纯套壳 "排盘 API + GPT Prompt" 谁都能做。

**解法：规则引擎 + LLM 混合架构**

```
排盘引擎 → 规则引擎（硬编码占星规则）→ LLM（只做润色翻译）
                      ↓
             输出结构化 JSON 事实 → 喂给 LLM 时明确约束
```

LLM 被限制为"格式化输出器"，禁止自由发挥，幻觉空间降至接近零。

#### 难点二：LLM 幻觉

**解法 1：RAG（检索增强生成）**  
建立占星知识库（BPHS / Jaimini Sutras 等经典原文），每次解盘检索相关内容作为上下文。

**解法 2：结构化输出约束**  
使用 JSON mode + 固定模板兜底，LLM 输出异常时 fallback 到模板。

**解法 3：用户反馈闭环**  
每份报告底部放 "准 / 不准 / 部分准" 投票，持续优化。

#### 难点三：温度感缺失

**解法：对话式而非报告式**

- 渐进式对话（先问想看什么 → 再深入）
- 用户记忆系统（记录历史对话，下次能衔接）
- 混合模式（免费 AI → 付费 AI 深度 → 转真人）—— Astrotalk 已验证

---

## 五、开源排盘库深度调研

### 5.1 jyotishganit（Python）✅ 推荐

| 维度     | 详情                                                                                            |
| :------- | ----------------------------------------------------------------------------------------------- |
| 安装     | `pip install jyotishganit`                                                                      |
| 依赖     | `skyfield`（NASA JPL DE421）、`pandas`、`numpy`                                                 |
| 底层数据 | NASA JPL DE421 星历表（~10MB，首次自动下载）                                                    |
| Ayanamsa | True Chitra Paksha（固定，与 Lahiri 差异约 1°）                                                 |
| 输出     | **完整**：D1-D60 分盘、Shadbala（六力）、Ashtakavarga、Vimshottari Dasha（MD/AD/PD）、Panchanga |
| 许可证   | MIT ✅ 商用无忧                                                                                 |
| 注意事项 | 首次调用触发星历数据下载（10-30秒），服务器需预热                                               |

**代码示例：**

```python
from datetime import datetime
from jyotishganit import calculate_birth_chart, get_birth_chart_json

chart = calculate_birth_chart(
    birth_date=datetime(1996, 7, 4, 9, 10, 0),  # 本地时间
    latitude=18.404,
    longitude=75.195,
    timezone_offset=5.5,  # UTC+5:30
    name="Test"
)

# 获取关键数据
print(f"上升星座: {chart.d1_chart.houses[0].sign}")
print(f"月亮Nakshatra: {chart.panchanga.nakshatra}")
print(f"当前Mahadasha: {chart.dashas.current}")
```

### 5.2 core-astrology-engine（Python）

| 维度     | 详情                                                                    |
| :------- | ----------------------------------------------------------------------- |
| 安装     | `pip install core-astrology-engine`                                     |
| 依赖     | `pyswisseph`（需 C 编译：gcc/macOS Xcode）                              |
| 底层数据 | Swiss Ephemeris 或 Moshier（内置无需文件，降级模式）                    |
| Ayanamsa | Lahiri（硬编码）                                                        |
| 输出     | **基础**：D1 行星位置、Panchanga、Mahadasha（无子周期）、日/月/年运     |
| 许可证   | Swiss Ephemeris 商业用需额外授权                                        |
| 注意事项 | timezonefinder 被禁用，非印度/尼泊尔时区默认 UTC+0；Guna Milan 矩阵为空 |

### 5.3 对比总结

| 对比项            |        jyotishganit ⭐         | core-astrology-engine |
| :---------------- | :----------------------------: | :-------------------: |
| 纯 Python 安装 ✅ |               ✅               |    ❌（需 C 编译）    |
| 数据丰富度        | **高**（D1-D60, Shadbala, AK） |     低（只有 D1）     |
| 许可证            |             MIT ✅             |  Swiss Eph 商业限制   |
| Ayanamsa          |       True Chitra Paksha       |        Lahiri         |
| Dasha 完整度      |       MD + AD + PD 三级        |        只有 MD        |
| 成熟度            |         v0.1.2（早期）         |    v1.0.0（早期）     |

### 5.4 对服务器的要求

| 指标 | 要求                        |
| :--- | :-------------------------- |
| CPU  | 1 核足够                    |
| 内存 | 256~512MB                   |
| 磁盘 | 额外 ~110MB（星历数据文件） |
| 并发 | 100+ QPS（加简单缓存）      |

> 排盘是纯数学计算，几乎不消耗服务器资源。真正烧钱的是后续 LLM API 调用费。

---

## 六、技术架构方案

### 6.1 架构图

```
┌──────────────────────────────────────────────────────────┐
│                    用户浏览器 (Tailwind CSS)               │
│          Next.js 响应式 Web 页面                           │
└──────────────────────────┬───────────────────────────────┘
                           │ HTTP/JSON
┌──────────────────────────▼───────────────────────────────┐
│              FastAPI 后端 (Python)                         │
├──────────────────┬──────────────────┬────────────────────┤
│  jyotishganit    │  DeepSeek/GPT    │  支付宝/微信支付    │
│  排盘引擎        │  AI 解盘        │                    │
└──────────────────┴──────────────────┴────────────────────┘
```

### 6.2 技术选型汇总

| 维度     | 选型                               | 理由                               |
| :------- | :--------------------------------- | :--------------------------------- |
| 前端     | **Next.js 14+**                    | SEO 友好，支持 SSR                 |
| CSS      | **Tailwind CSS**                   | 快速响应式                         |
| 后端     | **Python FastAPI**                 | 排盘库是 Python                    |
| 排盘引擎 | **jyotishganit**                   | 纯 Python，MIT，数据丰富           |
| AI 模型  | **DeepSeek-V3**                    | 中文强，价格极低（$0.5/1M tokens） |
| 备选 AI  | **通义千问 Qwen2.5**               | 阿里云，国内稳定                   |
| 数据库   | **PostgreSQL (Supabase)**          | 免费额度够用                       |
| 支付     | **支付宝当面付 + 微信支付 Native** | 国内主流                           |
| 部署     | **香港 VPS**（用户已有）           | 免备案，海外 API 通畅              |
| 时区     | 中国默认 UTC+8                     | 用户可手动修正                     |

### 6.3 排盘 API 服务（FastAPI 核心）

```python
# app.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from jyotishganit import calculate_birth_chart, get_birth_chart_json

app = FastAPI(title="AI 印度占星排盘服务")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
async def warm_up():
    """开机预热，避免第一个用户等30秒下载星历数据"""
    from skyfield.api import load
    load.timescale()
    load('de421.bsp')
    print("✅ 星历数据预热完成")

@app.post("/api/v1/birth-chart")
async def calculate_chart(data: dict):
    try:
        dt = datetime.strptime(data["birth_date"], "%Y-%m-%d %H:%M:%S")
        chart = calculate_birth_chart(
            birth_date=dt,
            latitude=float(data["lat"]),
            longitude=float(data["lng"]),
            timezone_offset=float(data.get("tz", 8.0)),
            name=data.get("name", "")
        )
        return {"code": 0, "data": get_birth_chart_json(chart)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/v1/health")
async def health():
    return {"status": "ok"}
```

### 6.4 前端核心流程（Next.js 页面）

```
首页 (/)
  │
  ├─ [免费] 生成星盘 → 出生信息表单
  │       ↓
  │   排盘结果展示（含免费摘要 30%）
  │       ↓
  │   [¥19.9 解锁完整报告]  ← 转化点
  │       ↓
  │   完整解盘报告 + PDF 下载
  │
  ├─ [免费] 每日运势 /rashi-daily
  ├─ [免费] Panchang /panchang
  ├─ [免费] 占星百科 /blog
  ├─ [免费] Nakshatra 查询 /nakshatra
  └─ [¥29.9] 姻缘配对 /matching
```

---

## 七、分阶段实施计划

### 阶段 1：MVP 核心（第 1-2 周）— 验证排盘引擎

| 任务                              | 产出             | 工时 |
| :-------------------------------- | :--------------- | :--: |
| 服务器部署 jyotishganit + FastAPI | 排盘 API 服务    | 1天  |
| 预热星历数据，验证排盘准确性      | 确认计算正确     | 1天  |
| Next.js 项目骨架 + Tailwind 主题  | 前端基础框架     | 1天  |
| 出生信息表单（城市自动补经纬度）  | 前端组件         | 1天  |
| 排盘结果可视化（SVG/Canvas 星盘） | 前端组件         | 3天  |
| 接入 AI（DeepSeek）生成解盘报告   | 后端 Prompt 服务 | 2天  |
| 免费摘要 + 付费解锁完整报告       | 核心转化流程     | 2天  |
| 支付宝/微信支付接入               | 支付回调         | 2天  |

**MVP 可交付：** 用户输入 → 免费看摘要 → 付费 ¥19.9 → 看完整报告

### 阶段 2：SEO 引流 + 免费工具（第 3-4 周）

| 任务                     | 说明                        |
| :----------------------- | :-------------------------- |
| 每日 12 星座运势页面     | SEO 主力                    |
| Panchang 日历            | 今日吉时、时辰、Nakshatra   |
| 占星名词百科（50+ 文章） | 上升/Nakshatra/Dasha/合相等 |
| Nakshatra 查询工具       | 免费工具                    |
| 姻缘配对                 | 付费转化                    |

### 阶段 3：留存增强（第 5-6 周）

| 任务                 | 说明                 |
| :------------------- | :------------------- |
| 用户系统（微信登录） | 保存历史报告         |
| AI 对话追问          | 付费用户可追问 3 次  |
| PDF 报告下载         | 精美排版，可分享裂变 |
| "准不准" 反馈机制    | 持续优化             |

### 阶段 4：变现升级（第 7-8 周）

| 功能         |   定价   |
| :----------- | :------: |
| 深度报告     |  ¥19.9   |
| 姻缘合盘     |  ¥29.9   |
| 择吉日       |  ¥19.9   |
| 月度运势订阅 | ¥39.9/月 |
| 年运报告     |   ¥99    |

---

## 八、失败阻碍条件（7 条）

|  #  | 风险             | 说明                                                     |
| :-: | :--------------- | :------------------------------------------------------- |
|  1  | **排盘不准**     | 选错 Ayanamsa/宫位系统，用户对比发现不一致，信任瞬间归零 |
|  2  | **LLM 幻觉**     | AI 编造不存在的星曜组合，懂行用户一眼识破，口碑崩塌      |
|  3  | **同质化竞争**   | 纯 "排盘 + GPT" 套壳，无差异化护城河，只能价格战         |
|  4  | **法律风险**     | 占星在中国属灰色地带，用户因建议做错决策可能投诉         |
|  5  | **获客成本高**   | 国内 SEM/信息流获客贵，免费模式=烧钱，需靠 SEO 自然流量  |
|  6  | **复购率低**     | 看一次星盘新鲜感过不再付费，缺乏 "让人持续回来" 的钩子   |
|  7  | **文化信任缺失** | 印度占星在中国是舶来品，需要解答 "凭什么信你"            |

---

## 九、推荐起步路径

```
第 1 天：服务器上 pip install jyotishganit，跑通排盘
第 2-3 天：验证排盘结果准确性（对比已知星盘）
第 4-7 天：搭建 FastAPI 排盘服务
第 2 周：开始做前端
```

**核心原则：** 先验证排盘引擎（地基），再做解盘（装修），最后考虑赚钱。

---

> 本文件由 AI 辅助整理，基于 2026 年 5 月市场调研数据。
