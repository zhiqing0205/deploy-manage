import { ImportForm } from "@/components/forms/ImportForm";
import { Download } from "lucide-react";
import { Badge, ButtonLink, Card, Hr, SubtleLink } from "@/components/ui";
import { getEnv, hasBasicAuthEnabled } from "@/lib/env";
import { readDataFile } from "@/lib/data";

type SearchParams = {
  import?: string | string[];
};

function pickFirst(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

function asErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const importOk = pickFirst(sp.import) === "ok";

  const env = getEnv();
  const authEnabled = hasBasicAuthEnabled();

  let storeOk = true;
  let storeMessage = "OK";
  let counts: { servers: number; services: number } | undefined;

  try {
    const { data } = await readDataFile();
    counts = { servers: data.servers.length, services: data.services.length };
  } catch (err: unknown) {
    storeOk = false;
    storeMessage = asErrorMessage(err);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">设置</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          配置数据存储（OSS/WebDAV）与访问鉴权。
        </p>
      </div>

      {importOk ? (
        <Card>
          <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            已导入成功。
          </div>
          <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            列表已刷新，如果你开启了缓存/CDN，可能需要等待几秒。
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              数据存储
            </div>
            <Badge tone={storeOk ? "green" : "red"}>{storeOk ? "可用" : "异常"}</Badge>
            <Badge>{env.DATA_BACKEND}</Badge>
            {counts ? (
              <span className="text-xs text-zinc-500">
                {counts.servers} 服务器 / {counts.services} 应用
              </span>
            ) : null}
          </div>

          <Hr />

          <div className="space-y-2 text-sm">
            {env.DATA_BACKEND === "local" ? (
              <div>
                <div className="text-zinc-500">本地文件（仅适合本地开发）</div>
                <div className="mt-1 font-mono text-xs">{env.DATA_PATH}</div>
              </div>
            ) : null}

            {env.DATA_BACKEND === "webdav" ? (
              <div className="space-y-1">
                <div className="text-zinc-500">WebDAV</div>
                <div className="font-mono text-xs">{env.WEBDAV_URL ?? "（未配置）"}</div>
                <div className="font-mono text-xs">{env.WEBDAV_FILE_PATH}</div>
              </div>
            ) : null}

            {env.DATA_BACKEND === "oss" ? (
              <div className="space-y-1">
                <div className="text-zinc-500">阿里云 OSS</div>
                <div className="font-mono text-xs">region: {env.OSS_REGION ?? "（未配置）"}</div>
                <div className="font-mono text-xs">bucket: {env.OSS_BUCKET ?? "（未配置）"}</div>
                <div className="font-mono text-xs">key: {env.OSS_OBJECT_KEY}</div>
              </div>
            ) : null}

            {!storeOk ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                {storeMessage}
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <ButtonLink href="/api/export" tone="blue">
              <Download className="h-4 w-4" />
              导出 JSON
            </ButtonLink>
          </div>

          <div className="mt-4 text-xs text-zinc-500">
            Vercel 部署请使用 <span className="font-mono">oss</span> 或{" "}
            <span className="font-mono">webdav</span>，不要用{" "}
            <span className="font-mono">local</span>。
          </div>
        </Card>

        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">鉴权</div>
            <Badge tone={authEnabled ? "green" : "amber"}>
              {authEnabled ? "已启用" : "未启用"}
            </Badge>
          </div>

          <Hr />

          <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
            <div>
              推荐在 Vercel 设置{" "}
              <span className="font-mono text-xs">BASIC_AUTH_USER</span> 与{" "}
              <span className="font-mono text-xs">BASIC_AUTH_PASSWORD</span> 来保护面板。
            </div>
            <div className="text-xs text-zinc-500">
              开启后，浏览器会弹出 Basic Auth 登录框；API 也会一起受保护。
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">导入</div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          使用导出文件恢复/迁移数据。导入会覆盖远端 JSON 文件。
        </p>
        <div className="mt-4">
          <ImportForm />
        </div>
      </Card>

      <div>
        <SubtleLink href="/">← 返回概览</SubtleLink>
      </div>
    </div>
  );
}
