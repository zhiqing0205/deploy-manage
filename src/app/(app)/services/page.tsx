import Link from "next/link";
import { Plus } from "lucide-react";

import { listServers, listServices } from "@/lib/data";
import { Badge, ButtonLink, Card, Input, Select, SubtleLink } from "@/components/ui";

type SearchParams = {
  q?: string | string[];
  server?: string | string[];
  status?: string | string[];
};

function pickFirst(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const q = (pickFirst(sp.q) ?? "").trim().toLowerCase();
  const server = (pickFirst(sp.server) ?? "").trim();
  const status = (pickFirst(sp.status) ?? "").trim();

  const [servers, services] = await Promise.all([listServers(), listServices()]);
  const serverNameById = new Map(servers.map((s) => [s.id, s.name] as const));

  let filtered = services;
  if (q) {
    filtered = filtered.filter((s) => {
      const hay = [
        s.name,
        s.description ?? "",
        s.repoUrl ?? "",
        s.deploymentType,
        s.status,
        ...(s.tags ?? []),
        ...s.urls.map((u) => u.url),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }
  if (server) filtered = filtered.filter((s) => s.serverId === server);
  if (status) filtered = filtered.filter((s) => s.status === status);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">应用</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            统一记录域名、部署方式、反代信息与管理入口。
          </p>
        </div>
        <ButtonLink href="/services/new" tone="blue">
          <Plus className="h-4 w-4" />
          新增应用
        </ButtonLink>
      </div>

      <form className="grid gap-3 sm:grid-cols-3" action="/services" method="get">
        <Input
          name="q"
          placeholder="搜索：名称 / 域名 / 标签 / Repo…"
          defaultValue={pickFirst(sp.q) ?? ""}
        />
        <Select name="server" defaultValue={server}>
          <option value="">全部服务器</option>
          {servers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <Select name="status" defaultValue={status}>
          <option value="">全部状态</option>
          <option value="active">active</option>
          <option value="paused">paused</option>
          <option value="archived">archived</option>
        </Select>
        <div className="sm:col-span-3 flex gap-3">
          <ButtonLink href="/services">重置</ButtonLink>
          <button className="hidden" type="submit" />
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((svc) => {
          const serverName = svc.serverId ? serverNameById.get(svc.serverId) : undefined;
          const primaryUrl = svc.urls[0]?.url;

          return (
            <Card key={svc.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/services/${svc.id}`}
                    className="block truncate text-base font-semibold hover:underline"
                    title={svc.name}
                  >
                    {svc.name}
                  </Link>
                  <div className="mt-1 truncate text-sm text-zinc-600 dark:text-zinc-300">
                    {primaryUrl ? primaryUrl : "（未填写访问地址）"}
                  </div>
                </div>
                <Badge tone={svc.status === "active" ? "green" : "zinc"}>{svc.status}</Badge>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>{svc.deploymentType}</Badge>
                {serverName ? <Badge tone="blue">{serverName}</Badge> : null}
                {(svc.tags ?? []).slice(0, 3).map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {primaryUrl ? (
                  <SubtleLink href={primaryUrl} target="_blank" rel="noreferrer">
                    打开站点 →
                  </SubtleLink>
                ) : null}
                <SubtleLink href={`/services/${svc.id}`}>详情 →</SubtleLink>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3">
            <Card>
              <div className="text-sm text-zinc-600 dark:text-zinc-300">
                没有匹配的应用。
              </div>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}
