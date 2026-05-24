# Vedic Light 技术架构文档

## 目录
1. [项目概述](#项目概述)
2. [系统架构](#系统架构)
3. [前端技术栈](#前端技术栈)
4. [后端技术栈](#后端技术栈)
5. [API 设计](#api-设计)
6. [部署架构](#部署架构)
7. [开发流程](#开发流程)
8. [安全考虑](#安全考虑)
9. [扩展方向](#扩展方向)

---

## 项目概述

**Vedic Light** 是一个轻量版的印度星盘（吠陀占星）应用，专注于：
- 精准的印度星盘排盘
- AI 驱动的深度解盘
- 简单直接的用户体验

**核心设计理念**：单一产品，单一转化路径，不做复杂功能堆砌。

---

## 系统架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              用户层                                       │
│                     (浏览器 / 移动设备)                                  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     │ HTTPS / REST API
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            前端层 (Next.js)                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │  首页 (/)    │  │  排盘页      │  │  价格页      │                   │
│  │  (营销页面)  │  │  (/natal)    │  │  (/pricing)  │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │  公共组件层：Navbar、Footer、可复用UI元素                 │          │
│  └──────────────────────────────────────────────────────────┘          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     │ JSON API Calls
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          API 网关层 (FastAPI)                            │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  中间件：CORS、日志、错误处理、环境加载                             │ │
│  └───────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ├────────────────────────────────────┐
                                     │                                    │
                                     ▼                                    ▼
┌──────────────────────────────────────────┐    ┌──────────────────────────┐
│           业务服务层                    │    │      外部服务集成        │
│  ┌───────────────────────────────────┐  │    │  ┌────────────────────┐  │
│  │ • Chart Service (星盘计算)       │  │    │  │ • DeepSeek API     │  │
│  │ • Reading Service (AI 解盘)      │  │    │  │   (AI 解读引擎)    │  │
│  │ • Rectifier Service (校时服务)   │  │    │  └────────────────────┘  │
│  │ • Archive Service (存档服务)     │  │    │  ┌────────────────────┐  │
│  └───────────────────────────────────┘  │    │  │ • jyotishganit     │  │
└──────────────────────────────────────────┘    │  │   (占星算法库)     │  │
                                                 │  └────────────────────┘  │
                                                 └──────────────────────────┘
```

### 架构特点

1. **前后端完全分离**：独立开发、独立部署
2. **服务化设计**：后端各功能模块化，职责清晰
3. **API 优先**：所有业务逻辑通过 REST API 暴露
4. **环境驱动配置**：所有敏感配置通过环境变量管理
5. **容器化支持**：完整的 Docker 部署方案

---

## 前端技术栈

### 技术选型

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|----------|
| **Next.js** | 16.0.10 | React 框架 | 最新 App Router，支持 SSR/SSG/独立部署 |
| **React** | 19.2.3 | UI 库 | 生态完善，组件化开发 |
| **TypeScript** | 5.9.3 | 类型系统 | 类型安全，提升开发体验和代码质量 |
| **Tailwind CSS** | 3.4.17 | 样式框架 | 实用优先，快速开发，一致的设计系统 |
| **Lucide React** | 0.561.0 | 图标库 | 现代化、一致性好的图标 |
| **Vitest** | 4.0.15 | 测试框架 | 快速、Vite 原生支持的测试工具 |

### 前端架构

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根布局（包含 Navbar + Footer）
│   ├── page.tsx                  # 首页组件
│   ├── globals.css               # 全局样式（Tailwind 配置）
│   ├── natal/
│   │   └── page.tsx              # 排盘页
│   └── pricing/
│       └── page.tsx              # 价格页
├── components/                   # 可复用组件
│   ├── Navbar.tsx                # 导航栏组件
│   └── Footer.tsx                # 页脚组件
├── tests/                        # 测试文件
│   ├── home.test.tsx
│   ├── natal.test.tsx
│   └── setup.ts
├── next.config.mjs               # Next.js 配置
├── tailwind.config.ts            # Tailwind CSS 配置
├── tsconfig.json                 # TypeScript 配置
├── vitest.config.ts              # Vitest 配置
├── package.json                  # 依赖管理
└── Dockerfile                    # 前端 Docker 镜像
```

### 核心页面功能

1. **首页 (/)** - [`app/page.tsx`](file:///d:\Vedic%20Astrology/frontend/app/page.tsx)
   - 产品介绍
   - 特性展示
   - 用户评价
   - 价格预览
   - CTA 引导

2. **排盘页 (/natal)** - [`app/natal/page.tsx`](file:///d:\Vedic%20Astrology/frontend/app/natal/page.tsx)
   - 出生信息表单
   - 星盘结果展示
   - AI 解盘功能
   - 校时对话功能

3. **价格页 (/pricing)** - [`app/pricing/page.tsx`](file:///d:\Vedic%20Astrology/frontend/app/pricing/page.tsx)
   - 价格方案展示
   - FAQ 解答
   - 升级引导

---

## 后端技术栈

### 技术选型

| 技术 | 版本 | 用途 | 选型理由 |
|------|------|------|----------|
| **Python** | ≥3.11 | 编程语言 | 生态丰富，数据科学和 AI 支持好 |
| **FastAPI** | ≥0.121.0 | Web 框架 | 高性能、自动文档、类型安全 |
| **Pydantic** | ≥2.12.0 | 数据验证 | 强大的数据验证和序列化 |
| **Uvicorn** | ≥0.38.0 | ASGI 服务器 | 高性能 ASGI 实现 |
| **jyotishganit** | 0.1.2 | 占星库 | 专业的吠陀占星计算库 |
| **pytest** | ≥9.0.0 | 测试框架 | 功能强大的 Python 测试工具 |

### 后端架构

```
backend/
├── app/                          # 应用代码
│   ├── __init__.py
│   ├── main.py                   # FastAPI 入口 + 路由定义
│   ├── schemas.py                # Pydantic 数据模型
│   ├── env_loader.py             # 环境变量加载器
│   ├── chart_service.py          # 星盘计算服务
│   ├── chart_reading_service.py  # AI 解盘服务
│   ├── birth_time_rectifier_service.py  # 校时服务
│   ├── rectifier_dialogue_service.py    # 校时对话服务
│   └── chart_archive_service.py  # 星盘存档服务
├── data/                         # 数据目录
│   ├── reference_data.sqlite3
│   ├── reference_locations.json
│   ├── reference_methods.json
│   ├── reference_sources.json
│   └── saved_birth_charts.json
├── tests/                        # 测试目录
│   ├── test_birth_chart_api.py
│   ├── test_birth_time_rectifier_api.py
│   ├── test_birth_time_rectifier_dialogue_api.py
│   ├── test_chart_reading_api.py
│   └── test_chart_service_mapping.py
├── pyproject.toml                # 项目依赖配置
├── Dockerfile                    # 后端 Docker 镜像
└── .env.example                  # 环境变量示例
```

### 核心服务模块

1. **Chart Service** - [`app/chart_service.py`](file:///d:\Vedic%20Astrology/backend/app/chart_service.py)
   - 负责星盘计算
   - 集成 jyotishganit 库
   - 生成完整的星盘数据结构

2. **Reading Service** - [`app/chart_reading_service.py`](file:///d:\Vedic%20Astrology/backend/app/chart_reading_service.py)
   - 调用 DeepSeek API
   - 处理 AI 解盘请求
   - 支持多种解盘焦点（整体、事业、感情）

3. **Rectifier Service** - [`app/birth_time_rectifier_service.py`](file:///d:\Vedic%20Astrology/backend/app/birth_time_rectifier_service.py)
   - 出生时间校时
   - 生命事件时间匹配

4. **Archive Service** - [`app/chart_archive_service.py`](file:///d:\Vedic%20Astrology/backend/app/chart_archive_service.py)
   - 星盘数据存档
   - 历史记录管理

---

## API 设计

### 接口概览

| 端点 | 方法 | 功能 | 认证 |
|------|------|------|------|
| `/api/v1/health` | GET | 健康检查 | 否 |
| `/api/v1/birth-chart` | POST | 生成星盘 | 否 |
| `/api/v1/chart-reading` | POST | AI 解盘 | 否 |
| `/api/v1/birth-time-rectifier` | POST | 校时请求 | 否 |
| `/api/v1/birth-time-rectifier/dialogue` | POST | 校时对话 | 否 |

### 详细 API 说明

#### 1. 生成星盘 - `POST /api/v1/birth-chart`

**请求体：**
```json
{
  "name": "姓名",
  "birth_date": "1990-01-01",
  "birth_time": "12:00",
  "latitude": 31.2304,
  "longitude": 121.4737,
  "timezone_offset": 8
}
```

**响应体：**
```json
{
  "data": {
    "profile": { /* 个人信息 */ },
    "chart": { /* 星盘数据 */ },
    "panchanga": { /* 历算信息 */ },
    "dasha": { /* 大运信息 */ },
    "meta": { /* 元数据 */ }
  }
}
```

**实现位置：** [`app/main.py#L61-L63`](file:///d:\Vedic%20Astrology/backend/app/main.py#L61-L63)

#### 2. AI 解盘 - `POST /api/v1/chart-reading`

**请求体：**
```json
{
  "focus": "core|career|love",
  "question": "自定义问题（可选）",
  "location_name": "出生地",
  "chart": { /* 完整星盘数据 */ }
}
```

**实现位置：** [`app/main.py#L52-L54`](file:///d:\Vedic%20Astrology/backend/app/main.py#L52-L54)

---

## 部署架构

### Docker Compose 部署

使用 [`docker-compose.yml`](file:///d:\Vedic%20Astrology/docker-compose.yml) 可以一键启动完整环境：

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - API_PORT=8000
      - CORS_ORIGINS=...
      - DEEPSEEK_API_KEY=...
    volumes:
      - ./backend/data:/app/data

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
    depends_on:
      - backend
```

### 生产部署建议

#### 方案一：云原生部署（推荐）

- **前端**：Vercel / Netlify（自动 CI/CD）
- **后端**：Railway / Render / Fly.io（容器部署）
- **优势**：免运维、自动扩展、全球 CDN

#### 方案二：自托管部署

- **反向代理**：Nginx（SSL 终止、负载均衡）
- **前端**：Next.js 静态导出或 PM2 运行
- **后端**：Gunicorn + Uvicorn（多 worker）
- **监控**：Prometheus + Grafana
- **日志**：ELK Stack

### 环境变量配置

#### 后端环境变量（[`backend/.env.example`](file:///d:\Vedic%20Astrology/backend/.env.example)）

```env
# API 配置
API_PORT=8000
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# DeepSeek AI 配置
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_MODEL=deepseek-v4-flash

# 占星技能包路径
VEDIC_SKILL_PACK_PATH=./vedic-astro-skills/claude-code/skills
```

#### 前端环境变量（[`frontend/.env.example`](file:///d:\Vedic%20Astrology/frontend/.env.example)）

```env
# API 地址配置
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

---

## 开发流程

### 本地开发

1. **后端开发**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -e ".[astro,test]"
   python -m uvicorn app.main:app --reload
   ```

2. **前端开发**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### 测试流程

- **后端测试**：`pytest backend/`
- **前端测试**：`npm --prefix frontend test`
- **全栈测试**：`npm test`（根目录）

### 代码质量

- **代码格式化**：Prettier（前端）、Black（后端，可配置）
- **Git hooks**：Husky + lint-staged
- **类型检查**：TypeScript（前端）、Pydantic（后端）

---

## 安全考虑

### 1. 环境变量安全
- 所有敏感信息存储在环境变量中
- `.env` 文件加入 `.gitignore`
- 生产环境使用云服务商的密钥管理服务

### 2. CORS 配置
- 生产环境只允许指定域名访问
- [`app/main.py`](file:///d:\Vedic%20Astrology/backend/app/main.py#L36-L42) 支持动态配置

### 3. API 安全
- 建议添加速率限制防止滥用
- 未来版本可考虑添加认证机制

### 4. 依赖安全
- 定期更新依赖包
- 使用 `npm audit` 和 `pip-audit` 检查漏洞

---

## 扩展方向

### 短期扩展
- 添加用户认证系统
- 实现支付集成
- 增加更多解盘模式
- 星盘分享功能

### 中期扩展
- 多语言支持
- 星盘对比功能
- 数据持久化（PostgreSQL）
- 实时校时协作

### 长期架构演进
- 微服务化拆分
- 添加事件驱动架构
- 机器学习优化解盘质量
- 多租户 SaaS 支持

---

## 相关文件

- 部署文档：[DEPLOYMENT.md](file:///d:\Vedic%20Astrology/DEPLOYMENT.md)
- 项目说明：[README.md](file:///d:\Vedic%20Astrology/README.md)
- 前端配置：[frontend/package.json](file:///d:\Vedic%20Astrology/frontend/package.json)
- 后端配置：[backend/pyproject.toml](file:///d:\Vedic%20Astrology/backend/pyproject.toml)
