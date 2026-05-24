# Vedic Light - 部署指南

本文档将指导您如何将 Vedic Light 印度占星应用部署到生产环境。

## 项目架构

本项目分为两部分：
- **前端**：Next.js 应用，提供用户界面
- **后端**：FastAPI 应用，提供 API 服务和印度占星计算

## 环境准备

### 系统要求
- Node.js 18+ (前端)
- Python 3.11+ (后端)
- 支持 Docker 或传统部署

### 环境变量

#### 后端环境变量
在 `backend/` 目录下创建 `.env` 文件（参考 `.env.example`）：

```env
# API Configuration
API_PORT=8000
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# DeepSeek AI Configuration
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_MODEL=deepseek-v4-flash

# Vedio Astrology Skill Package Path
VEDIC_SKILL_PACK_PATH=./vedic-astro-skills/claude-code/skills
```

#### 前端环境变量
在 `frontend/` 目录下创建 `.env.production` 文件（参考 `.env.example`）：

```env
# API 配置
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

## 传统部署方式

### 1. 后端部署

进入后端目录，安装依赖：
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -e ".[astro]"
```

启动服务（生产模式）：
```bash
# 使用 Gunicorn（推荐用于生产）
pip install gunicorn uvicorn[standard]
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000

# 或者使用 Uvicorn
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 2. 前端部署

进入前端目录，安装依赖和构建：
```bash
cd frontend
npm install
npm run build
```

启动生产服务器：
```bash
npm start
```

或者，将 `frontend/.next/` 目录部署到您选择的托管服务（Vercel, Netlify 等）

## Docker 部署（推荐）

我们提供了 Docker 支持，方便容器化部署。

### 使用 Docker Compose 部署

在项目根目录运行：
```bash
docker-compose up -d --build
```

### 单独构建和运行

构建后端：
```bash
cd backend
docker build -t vedic-light-api .
docker run -p 8000:8000 --env-file .env vedic-light-api
```

构建前端：
```bash
cd frontend
docker build -t vedic-light-web .
docker run -p 3000:3000 --env-file .env.production vedic-light-web
```

## 云服务部署选项

### Vercel (前端) + Railway (后端)
- 前端：直接连接 GitHub 仓库，使用 Vercel 自动部署
- 后端：使用 Railway 或类似的 PaaS 服务部署 FastAPI 应用

### AWS
- 前端：部署到 S3 + CloudFront
- 后端：部署到 EC2 或 ECS + ALB

### DigitalOcean App Platform
- 可以同时部署前后端

## 安全注意事项

1. **API 密钥安全**：永远不要将 `.env` 文件提交到仓库
2. **CORS 配置**：生产环境仅允许您的前端域名访问 API
3. **HTTPS**：生产环境必须使用 HTTPS
4. **速率限制**：考虑为 API 添加速率限制以防止滥用

## 监控和维护

- 设置日志收集和监控
- 定期备份重要数据
- 监控 DeepSeek API 使用量

## 故障排除

### 常见问题
1. 确保所有环境变量正确设置
2. 检查防火墙设置
3. 验证 CORS 配置
4. 确保 Python 版本符合要求
