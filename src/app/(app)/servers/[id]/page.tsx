import Link from "next/link";
import { notFound } from "next/navigation";

import { getServerById, listServices } from "@/lib/data";
import { Badge, ButtonLink, Card, Hr, SubtleLink } from "@/components/ui";

export default async function ServerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const server = await getServerById(id);
  if (!server) notFound();

  const services = (await listServices()).filter((s) => s.serverId === server.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight" title={server.name}>
            {server.name}
          </h1>
          <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            {server.host ? server.host : "（未填写主机/IP）"}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`/servers/${server.id}/edit`}>编辑</ButtonLink>
          {server.panelUrl ? (
            <ButtonLink href={server.panelUrl} tone="blue" target="_blank" rel="noreferrer">
              打开 1Panel
            </ButtonLink>
          ) : null}
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap gap-2">
          {server.provider ? <Badge>{server.provider}</Badge> : null}
          {server.region ? <Badge>{server.region}</Badge> : null}
          {(server.tags ?? []).map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>

        <Hr />

        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-zinc-500">Host</dt>
            <dd className="mt-1 text-sm">{server.host ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">1Panel</dt>
            <dd className="mt-1 text-sm">
              {server.panelUrl ? (
                <SubtleLink href={server.panelUrl} target="_blank" rel="noreferrer">
                  {server.panelUrl}
                </SubtleLink>
              ) : (
                "-"
              )}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-zinc-500">备注</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm">{server.notes || "-"}</dd>
          </div>
        </dl>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">关联应用</h2>
          <ButtonLink href="/services/new" tone="blue">
            新增应用
          </ButtonLink>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((svc) => (
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
                  <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                    {svc.urls[0]?.url ? svc.urls[0].url : "（未填写访问地址）"}
                  </div>
                </div>
                <Badge tone={svc.status === "active" ? "green" : "zinc"}>
                  {svc.status}
                </Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>{svc.deploymentType}</Badge>
                {(svc.tags ?? []).slice(0, 4).map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {svc.urls[0]?.url ? (
                  <SubtleLink href={svc.urls[0].url} target="_blank" rel="noreferrer">
                    打开站点 →
                  </SubtleLink>
                ) : null}
                <SubtleLink href={`/services/${svc.id}`}>详情 →</SubtleLink>
              </div>
            </Card>
          ))}
          {services.length === 0 ? (
            <Card>
              <div className="text-sm text-zinc-600 dark:text-zinc-300">
                该服务器还没有关联应用。
              </div>
            </Card>
          ) : null}
        </div>
      </div>

      <div>
        <SubtleLink href="/servers">← 返回服务器列表</SubtleLink>
      </div>
    </div>
  );
}

