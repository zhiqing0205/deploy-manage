## DeployManage

一个可部署在 Vercel 的 Next.js 面板：用来统一管理你分布在不同服务器上的应用（域名、反代、Docker、Vercel、1Panel 管理入口等），并提供可视化页面，点击即可查看详情或跳转到对应页面。

### 功能

- 服务器：记录 Host/IP、地区、供应商、1Panel 地址、标签、备注
- 应用：记录访问域名、管理入口、部署方式（Docker/Vercel/反代等）、Repo、健康检查、反代信息、标签、备注
- 统一列表 + 详情页：一键跳转到站点/管理入口/Repo
- 更好的体验：路由 Loading（Skeleton）、危险操作确认弹窗、导航高亮
- 外部存储：WebDAV 或 阿里云 OSS（单文件 JSON）
- 安全：可选 HTTP Basic Auth（强烈建议开启）
- 导入/导出：便于迁移与备份

### 技术栈

- Next.js App Router + Server Actions
- Tailwind CSS
- Radix UI（Dialog / Tooltip 等交互组件）
- Lucide Icons（图标库）

## Getting Started

### 本地开发（推荐使用 `local`）

```bash
cp .env.example .env.local
pnpm dev
```

默认会在项目根目录读写 `./data.json`（仅适合本地开发；Vercel 不可持久化本地文件）。

打开 [http://localhost:3000](http://localhost:3000)。

### 生产部署（Vercel）

1) 选择一个数据后端（推荐：`oss` 或 `webdav`）  
2) 在 Vercel Project -> Settings -> Environment Variables 设置环境变量  
3)（强烈建议）设置 Basic Auth，避免面板信息被公开访问

#### 方式 A：阿里云 OSS（单文件 JSON）

需要设置：

- `DATA_BACKEND=oss`
- `OSS_REGION`（例如 `oss-cn-hangzhou`）
- `OSS_ACCESS_KEY_ID`
- `OSS_ACCESS_KEY_SECRET`
- `OSS_BUCKET`
- `OSS_OBJECT_KEY`（可选，默认 `deploy-manage/data.json`）
- `OSS_ENDPOINT`（可选，特殊网络/自定义域场景使用）

#### 方式 B：WebDAV（单文件 JSON）

需要设置：

- `DATA_BACKEND=webdav`
- `WEBDAV_URL`
- `WEBDAV_USERNAME`（可选）
- `WEBDAV_PASSWORD`（可选）
- `WEBDAV_FILE_PATH`（可选，默认 `/deploy-manage/data.json`）

#### Basic Auth（强烈建议）

如果同时设置了下面两个环境变量，面板与 API 会启用 HTTP Basic Auth：

- `BASIC_AUTH_USER`
- `BASIC_AUTH_PASSWORD`

### 数据导入/导出

- 导出：进入「设置」或访问 `/api/export`
- 导入：「设置」页面选择导出的 JSON 文件导入（会覆盖远端文件）

### URL 列表格式

- 每行一个 URL
- 可选 `label | url`（用于在详情页显示标签）

示例：

```
主站 | https://example.com
Admin | https://example.com/admin
https://m.example.com
```

### 安全提示

此面板通常会包含管理入口、面板地址等敏感信息。请务必开启鉴权，或通过私有网络访问。
