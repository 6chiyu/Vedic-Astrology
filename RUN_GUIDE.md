# Vedic Light 运行指南

## 快速开始

### 前置要求

在运行网站之前，您需要安装以下软件：

1. **Python 3.11 或更高版本
2. **Node.js 18 或更高版本
3. **npm**（随 Node.js 一起安装）
4. **可选：**（可选，推荐）

### 方式一：传统方式（推荐新手）

#### 步骤 1：安装后端依赖

```bash
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# 安装依赖
pip install -e ".[astro]"
```

#### 步骤 2：配置后端环境变量

在 `backend` 目录下创建 `.env` 文件：

```env
# 复制示例文件
cp .env.example .env
# 或者手动创建 .env 文件
```

编辑 `.env` 文件，填入您的 DeepSeek API Key：

```env
# API 配置
API_PORT=8000
CORS_ORIGINS=http://localhost:3000

# DeepSeek AI 配置 (必填！
DEEPSEEK_API_KEY=你的_DeepSeek_API_Key
DEEPSEEK_MODEL=deepseek-v4-flash

# 占星技能包路径
VEDIC_SKILL_PACK_PATH=./vedic-astro-skills/claude-code/skills
```

#### 步骤 3：启动后端服务

```bash
# 在 backend 目录下
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

后端将在 http://localhost:8000 启动

#### 步骤 4：安装前端依赖

打开一个新的终端窗口：

```bash
cd frontend
npm install
```

#### 步骤 5：配置前端环境变量

在 `frontend` 目录下创建 `.env.local` 文件：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

#### 步骤 6：启动前端开发服务器

```bash
npm run dev
```

前端将在 http://localhost:3000 启动

---

### 方式二：Docker 方式（推荐）

如果您已安装 Docker 和 Docker Compose，这是最简单的方式。

#### 步骤 1：配置环境变量

在项目根目录下创建 `.env` 文件：

```env
# 复制示例文件
cp .env.example .env
```

编辑 `.env` 文件，填入您的 DeepSeek API Key：

```env
DEEPSEEK_API_KEY=你的_DeepSeek_API_Key
DEEPSEEK_MODEL=deepseek-v4-flash
VEDIC_SKILL_PACK_PATH=./vedic-astro-skills/claude-code/skills
```

#### 步骤 2：启动所有服务

```bash
# Windows:
start.bat

# Linux/Mac:
chmod +x start.sh
./start.sh

# 或者直接用 docker-compose:
docker-compose up -d --build
```

#### 步骤 3：访问网站

- 前端：http://localhost:3000
- 后端 API：http://localhost:8000
- API 文档：http://localhost:8000/docs

---

### 方式三：云部署（生产环境

请参考 [DEPLOYMENT.md](DEPLOYMENT.md) 文件中的详细部署指南。

---

## 验证安装

### 检查后端是否正常

访问 http://localhost:8000/api/v1/health

应该返回：
```json
{"status": "ok"}
```

### 检查前端是否正常

访问 http://localhost:3000 应该能看到网站首页。

---

## 常见问题

### 1. Python 命令找不到

**问题：`python` 命令找不到

**解决方案：
- Windows 尝试 `py` 命令
- 或者确认 Python 是否已安装并添加到 PATH

### 2. Node.js 命令找不到

**解决方案：
- 从 https://nodejs.org/ 下载并安装
- 安装后重启终端

### 3. 端口被占用

如果 8000 或 3000 端口被占用：

**后端**：修改 `.env` 中的 `API_PORT`
**前端**：修改 `package.json` 中的启动脚本，或使用 `npm run dev -- -p 3001

### 4. DeepSeek API Key 问题

如果没有 API Key，您仍然可以：
- 使用基础排盘功能（不需要 API）
- 前往 https://platform.deepseek.com/ 注册获取免费额度

---

## 开发命令速查

| 操作 | 命令 |
|------|
| 启动后端（开发） | `cd backend && python -m uvicorn app.main:app --reload` |
| 启动前端（开发） | `cd frontend && npm run dev` |
| 构建前端 | `cd frontend && npm run build` |
| 运行后端测试 | `cd backend && python -m pytest` |
| 运行前端测试 | `cd frontend && npm test` |
| Docker 启动 | `docker-compose up -d` |
| Docker 停止 | `docker-compose down` |
| Docker 查看日志 | `docker-compose logs -f` |

---

## 下一步

- 查看架构文档：[ARCHITECTURE.md](ARCHITECTURE.md)
- 查看部署文档：[DEPLOYMENT.md](DEPLOYMENT.md)
- 项目说明：[README.md](README.md)
