import Link from "next/link";
import { Plus } from "lucide-react";

import { listServers, listServices } from "@/lib/data";
import { Badge, ButtonLink, Card, Input, SubtleLink } from "@/components/ui";

type SearchParams = {
  q?: string | string[];
};

function pickFirst(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function ServersPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const q = (pickFirst(sp.q) ?? "").trim().toLowerCase();

  const [servers, services] = await Promise.all([listServers(), listServices()]);

  const serviceCountByServer = new Map<string, number>();
  for (const svc of services) {
    if (!svc.serverId) continue;
    serviceCountByServer.set(svc.serverId, (serviceCountByServer.get(svc.serverId) ?? 0) + 1);
  }

  const filtered = q
    ? servers.filter((s) => {
        const hay = [
          s.name,
          s.host ?? "",
          s.provider ?? "",
          s.region ?? "",
          ...(s.tags ?? []),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
    : servers;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">服务器</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            记录服务器信息、1Panel 管理入口与关联应用。
          </p>
        </div>
        <ButtonLink href="/servers/new" tone="blue">
          <Plus className="h-4 w-4" />
          新增服务器
        </ButtonLink>
      </div>

      <form className="flex gap-3" action="/servers" method="get">
        <Input
          name="q"
          placeholder="搜索：名称 / IP / 标签 / 地区…"
          defaultValue={pickFirst(sp.q) ?? ""}
        />
        <ButtonLink href="/servers" tone="zinc">
          重置
        </ButtonLink>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((srv) => {
          const count = serviceCountByServer.get(srv.id) ?? 0;
          return (
            <Card key={srv.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/servers/${srv.id}`}
                    className="block truncate text-base font-semibold hover:underline"
                    title={srv.name}
                  >
                    {srv.name}
                  </Link>
                  <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                    {srv.host ? srv.host : "（未填写主机/IP）"}
                  </div>
                </div>
                <Badge tone="blue">{count} 个应用</Badge>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {srv.provider ? <Badge>{srv.provider}</Badge> : null}
                {srv.region ? <Badge>{srv.region}</Badge> : null}
                {(srv.tags ?? []).slice(0, 4).map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {srv.panelUrl ? (
                  <SubtleLink href={srv.panelUrl} target="_blank" rel="noreferrer">
                    打开 1Panel →
                  </SubtleLink>
                ) : null}
                <SubtleLink href={`/servers/${srv.id}`}>详情 →</SubtleLink>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3">
            <Card>
              <div className="text-sm text-zinc-600 dark:text-zinc-300">
                没有匹配的服务器。
              </div>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}
