## DeployManage

一个可部署在 Vercel 的 Next.js 面板：统一管理服务器、应用服务、域名 DNS，并对接探针、状态监控、Cloudflare 等外部服务，实现一站式运维视图。

### 功能

**服务器管理**
- 手动录入或从 Komari 探针一键导入服务器节点
- 记录 Host/IP、地区、供应商、1Panel 地址、标签、备注
- 探针导入的服务器自动填充硬件规格（CPU、内存、磁盘、系统、架构）与计费信息（价格、周期、到期时间）

**应用管理**
- 手动录入或从 Uptime Kuma 状态监控一键导入服务
- 记录访问域名、管理入口、部署方式（Docker / Vercel / 反代等）、GitHub 源码、健康检查、反代信息
- 关联服务器，一目了然查看应用部署分布

**域名 DNS 管理**
- 通过 Cloudflare API 实时管理域名和 DNS 记录
- 支持 A / AAAA / CNAME / MX / TXT / NS / SRV / CAA 等记录类型的增删改
- 查看域名状态、Nameserver 信息

**通用**
- 概览仪表盘：服务器、应用、域名一览
- 选择性远程导入：弹窗展示远程数据，勾选需要的条目导入
- 路由 Loading（Skeleton）、危险操作确认弹窗、导航高亮
- 外部存储：WebDAV 或阿里云 OSS（单文件 JSON）
- 可选登录鉴权（强烈建议开启）
- 数据导入 / 导出：便于迁移与备份

### 技术栈

- Next.js 16 App Router + Server Actions
- React 19 + TypeScript
- Tailwind CSS v4
- Radix UI（Dialog / Tooltip 等交互组件）
- Zod（数据校验）
- Lucide Icons

## Getting Started

### 本地开发

```bash
cp .env.example .env.local
pnpm dev
```

默认会在项目根目录读写 `./data.json`（仅适合本地开发；Vercel 不可持久化本地文件）。

打开 [http://localhost:3000](http://localhost:3000)。

### 生产部署（Vercel）

1) 选择一个数据后端（推荐 `oss` 或 `webdav`）
2) 在 Vercel Project -> Settings -> Environment Variables 设置环境变量
3)（强烈建议）设置 Basic Auth，避免面板被公开访问

#### 数据后端

**阿里云 OSS**

| 变量 | 说明 |
|------|------|
| `DATA_BACKEND` | `oss` |
| `OSS_REGION` | 例如 `oss-cn-hangzhou` |
| `OSS_ACCESS_KEY_ID` | |
| `OSS_ACCESS_KEY_SECRET` | |
| `OSS_BUCKET` | |
| `OSS_OBJECT_KEY` | 可选，默认 `deploy-manage/data.json` |
| `OSS_ENDPOINT` | 可选，特殊网络 / 自定义域场景使用 |

**WebDAV**

| 变量 | 说明 |
|------|------|
| `DATA_BACKEND` | `webdav` |
| `WEBDAV_URL` | |
| `WEBDAV_USERNAME` | 可选 |
| `WEBDAV_PASSWORD` | 可选 |
| `WEBDAV_FILE_PATH` | 可选，默认 `/deploy-manage/data.json` |

#### 登录鉴权（强烈建议）

同时设置以下两个变量后，面板与 API 会启用登录鉴权（未登录访问跳转 `/login`）：

- `BASIC_AUTH_USER`
- `BASIC_AUTH_PASSWORD`

#### 外部服务集成

| 变量 | 说明 |
|------|------|
| `PROBE_API_URL` | Komari 探针 API 地址，例如 `https://server.ziuch.com/api/nodes` |
| `STATUS_API_URL` | Uptime Kuma 状态页 API 地址，例如 `https://status.ziuch.com/api/status-page/page` |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token，用于域名 DNS 管理 |

配置后在对应页面会出现「获取远程数据」按钮，支持选择性导入。Cloudflare 配置后「域名」页面自动可用。

### 数据导入 / 导出

- 导出：进入「设置」或访问 `/api/export`
- 导入：「设置」页面选择导出的 JSON 文件导入（会覆盖远端文件）

### URL 列表格式

每行一个 URL，可选 `label | url` 格式：

```
主站 | https://example.com
Admin | https://example.com/admin
https://m.example.com
```

### 安全提示

此面板通常会包含管理入口、面板地址等敏感信息。请务必开启鉴权，或通过私有网络访问。
