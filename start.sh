#!/bin/bash

# Vedic Light 启动脚本

echo "🚀 启动 Vedic Light 应用..."

# 检查是否存在 .env 文件
if [ ! -f .env ]; then
    echo "⚠️  未找到 .env 文件，正在从 .env.example 创建..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件，请编辑并填入您的配置"
    echo "   特别是 DEEPSEEK_API_KEY 必须设置"
    echo ""
fi

# 使用 Docker Compose 启动服务
echo "📦 构建并启动 Docker 容器..."
docker-compose up -d --build

echo ""
echo "✅ 启动完成！"
echo "📱 前端地址: http://localhost:3000"
echo "🔧 后端 API: http://localhost:8000"
echo ""
echo "📋 查看日志: docker-compose logs -f"
echo "🛑 停止服务: docker-compose down"
