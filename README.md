# Clash Master

<p align="center">
  <img src="./assets/icon-clash-master.png" width="120" alt="Clash Master Logo">
</p>

<p align="center">
  <b>现代化的 OpenClash 流量统计分析系统</b>
</p>

<p align="center">
  <a href="https://github.com/foru17/clash-master/stargazers"><img src="https://img.shields.io/github/stars/foru17/clash-master?style=flat-square" alt="Stars"></a>
  <a href="https://github.com/foru17/clash-master/blob/main/LICENSE"><img src="https://img.shields.io/github/license/foru17/clash-master?style=flat-square" alt="License"></a>
  <img src="https://img.shields.io/badge/Docker-Ready-blue?style=flat-square&logo=docker" alt="Docker">
</p>

![Clash Master Overview](./assets/clash-master-overview.png)

## ✨ 功能特性

- 📊 **实时流量监控** - WebSocket 实时采集，延迟低至毫秒级
- 📈 **趋势分析** - 支持 30分钟/1小时/24小时 多维度流量趋势
- 🌐 **域名分析** - 查看各域名的流量、关联 IP、连接数
- 🗺️ **IP 追踪** - ASN、地理位置、所属域名关联展示
- 🚀 **代理统计** - 各代理节点流量分配、连接数统计
- 🌙 **深色模式** - 支持浅色/深色/跟随系统三种主题
- 🌍 **双语支持** - 中文/英文无缝切换
- 🔄 **多后端** - 同时监控多个 OpenClash 后端

## 🚀 快速开始（Docker）

### 方式一：Docker Compose（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/foru17/clash-master.git
cd clash-master

# 2. 构建并启动服务
docker compose up -d --build

# 3. 访问 http://localhost:3000 完成配置
```

### 方式二：Docker 直接运行

```bash
# 1. 克隆项目
git clone https://github.com/foru17/clash-master.git
cd clash-master

# 2. 构建镜像
docker build -t clash-master:latest .

# 3. 创建数据目录并运行容器
mkdir -p clash-master-data
docker run -d \
  --name clash-master \
  -p 3000:3000 \
  -p 3001:3001 \
  -p 3002:3002 \
  -v $(pwd)/clash-master-data:/app/data \
  --restart unless-stopped \
  clash-master:latest

# 4. 访问 http://localhost:3000 完成配置
```

> 💡 **Note**: 镜像将很快发布到 GHCR，届时可直接使用 `ghcr.io/foru17/clash-master:latest`

### 方式三：源码运行

```bash
# 1. 克隆项目
git clone https://github.com/foru17/clash-master.git
cd clash-master

# 2. 安装依赖
pnpm install

# 3. 启动服务
./start.sh

# 4. 访问 http://localhost:3000 完成配置
```

## 📖 首次使用

1. 打开 <http://localhost:3000>
2. 首次访问会弹出后端配置对话框
3. 填写 OpenClash 连接信息：
   - **名称**: 自定义名称（如 "Home"）
   - **地址**: OpenClash 后端地址（如 `192.168.101.1`）
   - **端口**: OpenClash 后端端口（如 `9090`）
   - **Token**: 如果配置了 Secret 则填写，否则留空
4. 点击「添加后端」
5. 保存后开始自动采集数据

> 💡 **获取 OpenClash 地址**: 进入 OpenClash 插件 → 打开「外部控制」→ 复制地址

## 🐳 Docker 配置

### 端口说明

| 端口 | 用途      | 必需 |
| ---- | --------- | ---- |
| 3000 | Web 界面  | ✅   |
| 3001 | API 接口  | ✅   |
| 3002 | WebSocket | ✅   |

### 数据持久化

数据默认存储在容器内的 `/app/data` 目录，建议映射到宿主机：

```yaml
volumes:
  - ./data:/app/data
```

### 自定义端口

如需修改默认端口，创建 `docker-compose.override.yml`：

```yaml
services:
  clash-master:
    ports:
      - "8080:3000" # 将 3000 映射到宿主机的 8080
```

### 更新到最新版本

```bash
# Docker Compose
docker compose pull
docker compose up -d

# Docker (本地构建)
docker compose up -d --build
```

## 📁 项目结构

```
clash-master/
├── docker-compose.yml      # Docker Compose 配置
├── Dockerfile              # Docker 镜像构建
├── start.sh                # 源码启动脚本
├── assets/                 # 预览图和图标
├── apps/
│   ├── collector/          # 数据收集服务
│   └── web/                # Next.js 前端
└── packages/
    └── shared/             # 共享类型定义
```

## 🔧 常见问题

### Q: 连接 OpenClash 失败？

A: 检查以下几点：

1. OpenClash 的「外部控制」是否已开启
2. OpenClash 地址是否正确（格式：`IP:端口`）
3. 如果配置了 Secret，Token 是否填写正确
4. 容器是否能访问到 OpenClash 所在网络

### Q: 如何备份数据？

A: 数据存储在映射的目录中（默认 `./data/stats.db`），直接备份该目录即可。

### Q: 如何清理历史数据？

A: 在 Web 界面 → 设置 → 数据库管理中，可选择清理 1天前/7天前/30天前/全部数据。

### Q: 支持远程访问吗？

A: 支持，将 Docker 端口映射到公网 IP 即可。建议配合 Nginx 反向代理并启用 HTTPS。

## 🛠️ 技术栈

- **前端**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **UI 组件**: shadcn/ui
- **图表**: Recharts
- **后端**: Node.js + Fastify + WebSocket
- **数据库**: SQLite (better-sqlite3)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[MIT](LICENSE) © [foru17](https://github.com/foru17)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/foru17">foru17</a>
</p>
