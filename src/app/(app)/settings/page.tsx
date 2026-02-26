import { ImportForm } from "@/components/forms/ImportForm";
import { Download } from "lucide-react";
import { Badge, ButtonLink, Card, Hr, SubtleLink } from "@/components/ui";
import { getEnv, hasAuthEnabled } from "@/lib/env";
import { listServers, listServices } from "@/lib/data";

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
  const authEnabled = hasAuthEnabled();

  let storeOk = true;
  let storeMessage = "OK";
  let counts: { servers: number; services: number } | undefined;

  try {
    const [serverList, serviceList] = await Promise.all([listServers(), listServices()]);
    counts = { servers: serverList.length, services: serviceList.length };
  } catch (err: unknown) {
    storeOk = false;
    storeMessage = asErrorMessage(err);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">设置</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          配置数据存储与访问鉴权。
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
            <Badge>Turso</Badge>
            {counts ? (
              <span className="text-xs text-zinc-500">
                {counts.servers} 服务器 / {counts.services} 应用
              </span>
            ) : null}
          </div>

          <Hr />

          <div className="space-y-2 text-sm">
            <div>
              <div className="text-zinc-500">Turso (Edge SQLite)</div>
              <div className="mt-1 font-mono text-xs truncate">{env.TURSO_DATABASE_URL}</div>
            </div>

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
              开启后，未登录访问会跳转到 `/login` 登录页；API 也会一起受保护。
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">外部服务集成</div>
        <Hr />
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-600 dark:text-zinc-300">Probe (Komari)</span>
              <Badge tone={env.PROBE_API_URL ? "green" : "zinc"}>
                {env.PROBE_API_URL ? "已配置" : "未配置"}
              </Badge>
            </div>
            {env.PROBE_API_URL ? (
              <div className="mt-1 truncate font-mono text-xs text-zinc-500">
                {env.PROBE_API_URL}
              </div>
            ) : (
              <div className="mt-1 text-xs text-zinc-500">
                设置 <span className="font-mono">PROBE_API_URL</span> 以启用服务器探针导入。
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-600 dark:text-zinc-300">Status (Uptime Kuma)</span>
              <Badge tone={env.UPTIME_URL && env.UPTIME_PAGE ? "green" : "zinc"}>
                {env.UPTIME_URL && env.UPTIME_PAGE ? "已配置" : "未配置"}
              </Badge>
            </div>
            {env.UPTIME_URL && env.UPTIME_PAGE ? (
              <div className="mt-1 truncate font-mono text-xs text-zinc-500">
                {env.UPTIME_URL} / {env.UPTIME_PAGE}
              </div>
            ) : (
              <div className="mt-1 text-xs text-zinc-500">
                设置 <span className="font-mono">UPTIME_URL</span> 和 <span className="font-mono">UPTIME_PAGE</span> 以启用应用监控导入。
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-600 dark:text-zinc-300">Cloudflare</span>
              <Badge tone={env.CLOUDFLARE_API_TOKEN ? "green" : "zinc"}>
                {env.CLOUDFLARE_API_TOKEN ? "已配置" : "未配置"}
              </Badge>
            </div>
            {!env.CLOUDFLARE_API_TOKEN ? (
              <div className="mt-1 text-xs text-zinc-500">
                设置 <span className="font-mono">CLOUDFLARE_API_TOKEN</span> 以启用域名 DNS 管理。
              </div>
            ) : (
              <div className="mt-1 text-xs text-zinc-500">Token 已配置，可管理域名。</div>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">导入</div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          使用导出文件恢复/迁移数据。导入会覆盖数据库中的所有数据。
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
