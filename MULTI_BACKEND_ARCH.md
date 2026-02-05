# 多后端架构设计

本文档描述 Clash Master 的多后端架构设计，支持同时监控多个 OpenClash 实例。

## 核心概念

### 1. 数据隔离 (Data Isolation)

每个后端的数据存储在独立的分区中，通过 `backend_id` 字段区分。

**受影响的表：**

- `domain_stats` - 域名统计
- `ip_stats` - IP 统计
- `proxy_stats` - 代理统计
- `rule_stats` - 规则统计
- `rule_proxy_map` - 规则-代理映射
- `country_stats` - 国家统计
- `hourly_stats` - 小时统计
- `connection_logs` - 连接日志

**主键设计：** 所有统计表使用复合主键 `(backend_id, entity_id)`，例如 `(backend_id, domain)`。

### 2. 后端状态 (Backend States)

每个后端有两个独立的状态标志：

| 字段        | 含义     | 说明                                          |
| ----------- | -------- | --------------------------------------------- |
| `is_active` | 显示状态 | 当前在 UI 中显示哪个后端的数据（唯一）        |
| `listening` | 收集状态 | 是否正在从该后端收集数据（多个可同时为 true） |
| `enabled`   | 启用状态 | 后端是否可用（被禁用的后端不参与任何操作）    |

**使用场景：**

- 用户可以在 UI 中查看后端 A 的数据
- 同时后端 B 和 C 在后台继续收集数据
- 随时切换到后端 B 或 C 查看它们的数据

### 3. 持续收集 (Continuous Collection)

收集器维护一个连接池：

```typescript
(Map < backendId, OpenClashCollector > collectors);
```

- 每个 `listening=true` 且 `enabled=true` 的后端都有一个独立的 WebSocket 连接
- 连接状态独立管理，一个后端断开不影响其他后端
- 每 5 秒检查一次后端配置变化，动态启动/停止收集器

## API 设计

### 获取统计数据

所有统计 API 支持可选的 `backendId` 参数：

```
GET /api/stats/summary?backendId=1
GET /api/stats/domains?backendId=1&limit=50
GET /api/stats/trend?backendId=1&minutes=30
```

如果不提供 `backendId`，则使用当前 `is_active` 的后端。

### 后端管理 API

```
# 获取所有后端
GET /api/backends

# 获取当前活跃后端（用于显示）
GET /api/backends/active

# 获取正在收集数据的后端列表
GET /api/backends/listening

# 设置显示的后端（切换 UI 显示）
POST /api/backends/:id/activate

# 设置收集状态（开始/停止收集）
POST /api/backends/:id/listening
Body: { "listening": true/false }

# 清空指定后端的所有数据
POST /api/backends/:id/clear-data
```

## 前端设计

### 后端选择器

顶部导航栏显示当前显示的后端名称，点击可切换：

```
[概览] [后端A ▼] [收集指示器]      [语言] [主题] [刷新]
```

下拉菜单显示：

- 所有后端列表，标注当前显示的后端
- 正在收集数据的后端显示绿色指示器
- "管理后端" 选项打开配置对话框

### 收集状态指示器

显示当前正在收集数据的后端：

```
[● 后端A] [● 后端B] [● 后端C] [+2]
```

### 设置对话框

每个后端卡片显示：

- 名称和连接信息
- **显示按钮** - 切换 `is_active` 状态
- **收集开关** - 切换 `listening` 状态
- 编辑和删除按钮

## 数据库迁移

从单后端迁移到多后端架构时：

1. 创建默认后端配置
2. 将所有现有数据关联到默认后端（`backend_id=1`）
3. 添加 `listening` 列到 `backend_configs` 表
4. 更新所有表的主键为复合主键

迁移代码在 `db.ts` 的 `migrateIfNeeded()` 方法中自动执行。

## 使用场景示例

### 场景 1：主备切换

- 后端 A（主）：listening=true, is_active=true
- 后端 B（备）：listening=true, is_active=false
- 当 A 故障时，点击 B 的显示按钮切换到备用后端

### 场景 2：多节点监控

- 家中路由器：listening=true, is_active=true
- VPS 服务器：listening=true, is_active=false
- 办公室路由器：listening=true, is_active=false
- 同时监控所有节点，在 UI 中切换查看

### 场景 3：数据对比

- 在节点 A 收集一段时间数据
- 切换到节点 B 查看差异
- 所有数据都保留，可以随时回顾

## 性能考虑

1. **索引优化**：所有查询都包含 `backend_id` 过滤，已创建相应索引
2. **连接管理**：每个后端独立 WebSocket 连接，避免相互影响
3. **数据清理**：支持按后端清理数据，不影响其他后端
4. **内存使用**：连接池按需创建，无数据后端不占用连接资源
