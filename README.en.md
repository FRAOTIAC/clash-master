<p align="center">
  <img src="./assets/icon-clash-master.png" width="200" alt="Clash Master Logo" style="margin-bottom: 16px;">
  <br>
  <b style="font-size: 32px;">Clash Master</b>
</p>

<p align="center">
  <b>A more beautiful and modern web application that lets you visualize and manage your Clash network traffic</b><br>
  <span>Real-time Monitoring · Multi-dimensional Analysis · Multi-Backend Management</span>
</p>

<p align="center">
  <a href="https://github.com/foru17/clash-master/stargazers"><img src="https://img.shields.io/github/stars/foru17/clash-master?style=flat-square&color=yellow" alt="Stars"></a>
  <a href="https://hub.docker.com/r/foru17/clash-master"><img src="https://img.shields.io/docker/pulls/foru17/clash-master?style=flat-square&color=blue&logo=docker" alt="Docker Pulls"></a>
  <a href="https://hub.docker.com/r/foru17/clash-master"><img src="https://img.shields.io/docker/v/foru17/clash-master?style=flat-square&label=Docker&color=2496ED" alt="Docker Version"></a>
  <a href="https://github.com/foru17/clash-master/blob/main/LICENSE"><img src="https://img.shields.io/github/license/foru17/clash-master?style=flat-square&color=green" alt="License"></a>
  <img src="https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=node.js" alt="Node.js">
</p>

<p align="center">
  <a href="./README.md">简体中文</a> •
  <b>English</b>
</p>

![Clash Master Overview](./assets/clash-master-overview.png)

## 📋 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [📖 First Use](#-first-use)
- [🔧 Port Conflict Resolution](#-port-conflict-resolution)
- [🐳 Docker Configuration](#-docker-configuration)
- [📦 Unraid Installation](#-unraid-installation)
- [📁 Project Structure](#-project-structure)
- [🛠️ Tech Stack](#️-tech-stack)
- [📄 License](#-license)

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

Create a `docker-compose.yml` file:

```yaml
services:
  clash-master:
    image: foru17/clash-master:latest
    container_name: clash-master
    restart: unless-stopped
    ports:
      - "3000:3000"   # Web UI
      - "3001:3001"   # API
      - "3002:3002"   # WebSocket
    volumes:
      - ./data:/app/data
    environment:
      - NODE_ENV=production
      - WEB_EXTERNAL_PORT=3000
      - API_EXTERNAL_PORT=3001
      - WS_EXTERNAL_PORT=3002
      - DB_PATH=/app/data/stats.db
```

Then run:

```bash
docker compose up -d
```

### Option 2: Docker Run

```bash
docker run -d \
  --name clash-master \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  --restart unless-stopped \
  foru17/clash-master:latest
```

## 🐳 Docker Configuration

### Multi-Architecture Support

Docker images support both `linux/amd64` and `linux/arm64`.

## 📦 Unraid Installation

For Unraid users:

1. **Add Template Manually**:
   - Save the content of `unraid-template.xml` to `/boot/config/plugins/dockerMan/templates-user/ClashMaster.xml` on your Unraid flash drive.
   - Click "Add Container" in the Unraid Docker tab and select "ClashMaster" from the templates.

2. **Configuration**:
   - **Web UI Port**: Default 3000
   - **Data Path**: Map to `/app/data`

> 💡 **Note**: If you change the external port for WebSocket, make sure to update the `WS_EXTERNAL_PORT` environment variable.

## 📄 License

[MIT](LICENSE) © [foru17](https://github.com/foru17)
