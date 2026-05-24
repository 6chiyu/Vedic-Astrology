# Vedic Light

轻量版印度星盘站点，只保留三件事：

1. 印度星盘排盘
2. AI 解盘
3. AI 付费升级入口

## 现在的产品结构

- `/`
  - 轻量版落地页
  - 只解释产品定位、排盘流程和付费升级路径
- `/natal`
  - 生成印度星盘
  - 查看 Lagna、十二宫、行星、Panchanga、大运、分盘摘要
  - 触发 AI 解盘
- `/pricing`
  - 付费方案页
  - 用来承接 AI 深度解盘升级

## 后端接口

只保留 3 个接口：

- `POST /api/v1/birth-chart`
- `POST /api/v1/chart-reading`
- `GET /api/v1/health`

## 本地能力

- 排盘：`jyotishganit`
- 解盘：`backend/app/chart_reading_service.py`
- 本地 skill 包：`.external/vedic-astro-skills/claude-code/skills`
- LLM：DeepSeek

## 环境变量

后端会读取 `backend/.env`：

```env
DEEPSEEK_API_KEY=your_key
DEEPSEEK_MODEL=deepseek-v4-flash
VEDIC_SKILL_PACK_PATH=D:/chiyu/ai印度占星/.external/vedic-astro-skills/claude-code/skills
```

## 启动

后端：

```powershell
cd backend
python -m uvicorn app.main:app --reload
```

前端：

```powershell
cd frontend
npm run dev
```

## 验证

后端测试：

```powershell
cd backend
python -m pytest
```

前端测试：

```powershell
cd frontend
npm test
```

前端构建：

```powershell
cd frontend
npm run build
```
