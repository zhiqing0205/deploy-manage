import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Github, Globe, Server } from "lucide-react";

import { getServerById, getServiceById } from "@/lib/data";
import { Badge, ButtonLink, Card, Hr, SubtleLink } from "@/components/ui";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getServiceById(id);
  if (!service) notFound();

  const server = service.serverId ? await getServerById(service.serverId) : undefined;
  const proxyServer = service.proxyServerId ? await getServerById(service.proxyServerId) : undefined;
  const primaryUrl = service.urls[0]?.url;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight" title={service.name}>
            {service.name}
          </h1>
          <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            {primaryUrl ? primaryUrl : "（未填写访问地址）"}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`/services/${service.id}/edit`}>编辑</ButtonLink>
          {primaryUrl ? (
            <ButtonLink href={primaryUrl} tone="blue" target="_blank" rel="noreferrer">
              打开站点
            </ButtonLink>
          ) : null}
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap gap-2">
          <Badge tone={service.status === "active" ? "green" : "zinc"}>{service.status}</Badge>
          <Badge>{service.deploymentType}</Badge>
          {(service.tags ?? []).map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
          {service.monitorGroup ? <Badge tone="amber">{service.monitorGroup}</Badge> : null}
          {server ? (
            <Link href={`/servers/${server.id}`} className="ml-auto">
              <Badge tone="blue">{server.name}</Badge>
            </Link>
          ) : null}
        </div>

        {/* Proxy chain visualization */}
        {(proxyServer || server) ? (
          <>
            <Hr />
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                <Globe className="h-4 w-4" />
                <span>DNS</span>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-400" />
              {proxyServer ? (
                <>
                  <Link
                    href={`/servers/${proxyServer.id}`}
                    className="flex items-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 text-violet-700 hover:underline dark:bg-violet-950/40 dark:text-violet-300"
                  >
                    <Server className="h-4 w-4" />
                    <span>{proxyServer.name}</span>
                    <Badge>反代</Badge>
                  </Link>
                  <ArrowRight className="h-4 w-4 text-zinc-400" />
                </>
              ) : null}
              {server ? (
                <Link
                  href={`/servers/${server.id}`}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-blue-700 hover:underline dark:bg-blue-950/40 dark:text-blue-300"
                >
                  <Server className="h-4 w-4" />
                  <span>{server.name}</span>
                  <Badge tone="blue">部署</Badge>
                </Link>
              ) : null}
            </div>
          </>
        ) : null}

        <Hr />

        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-xs text-zinc-500">描述</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm">{service.description || "-"}</dd>
          </div>

          <div className="sm:col-span-2">
            <dt className="text-xs text-zinc-500">访问地址</dt>
            <dd className="mt-1 space-y-1 text-sm">
              {service.urls.length ? (
                service.urls.map((u) => (
                  <div key={u.url} className="flex flex-wrap items-center gap-2">
                    {u.label ? <Badge>{u.label}</Badge> : null}
                    <SubtleLink href={u.url} target="_blank" rel="noreferrer">
                      {u.url}
                    </SubtleLink>
                  </div>
                ))
              ) : (
                <span className="text-zinc-500">-</span>
              )}
            </dd>
          </div>

          <div className="sm:col-span-2">
            <dt className="text-xs text-zinc-500">管理入口</dt>
            <dd className="mt-1 space-y-1 text-sm">
              {service.managementUrls.length ? (
                service.managementUrls.map((u) => (
                  <div key={u.url} className="flex flex-wrap items-center gap-2">
                    {u.label ? <Badge>{u.label}</Badge> : null}
                    <SubtleLink href={u.url} target="_blank" rel="noreferrer">
                      {u.url}
                    </SubtleLink>
                  </div>
                ))
              ) : (
                <span className="text-zinc-500">-</span>
              )}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-zinc-500">Repo</dt>
            <dd className="mt-1 text-sm">
              {service.repoUrl ? (
                <SubtleLink href={service.repoUrl} target="_blank" rel="noreferrer">
                  {service.repoUrl}
                </SubtleLink>
              ) : (
                "-"
              )}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-zinc-500">GitHub</dt>
            <dd className="mt-1 text-sm">
              {service.github ? (
                <a
                  href={service.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                >
                  <Github className="h-4 w-4" />
                  {service.github.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
                </a>
              ) : (
                "-"
              )}
            </dd>
          </div>

          <div>
            <dt className="text-xs text-zinc-500">健康检查</dt>
            <dd className="mt-1 text-sm">
              {service.healthcheckUrl ? (
                <SubtleLink href={service.healthcheckUrl} target="_blank" rel="noreferrer">
                  {service.healthcheckUrl}
                </SubtleLink>
              ) : (
                "-"
              )}
            </dd>
          </div>

          {service.monitorId ? (
            <div>
              <dt className="text-xs text-zinc-500">监控 ID</dt>
              <dd className="mt-1 text-sm">
                <Badge tone="blue">#{service.monitorId}</Badge>
                {service.monitorGroup ? (
                  <span className="ml-2 text-xs text-zinc-500">{service.monitorGroup}</span>
                ) : null}
              </dd>
            </div>
          ) : null}

          <div className="sm:col-span-2">
            <dt className="text-xs text-zinc-500">反向代理</dt>
            <dd className="mt-1 text-sm">
              {service.proxy ? (
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{service.proxy.type}</Badge>
                    {service.proxy.upstream ? <Badge>{service.proxy.upstream}</Badge> : null}
                  </div>
                  {service.proxy.rules ? (
                    <pre className="mt-2 overflow-auto rounded-lg bg-zinc-50 p-3 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                      {service.proxy.rules}
                    </pre>
                  ) : null}
                </div>
              ) : (
                <span className="text-zinc-500">-</span>
              )}
            </dd>
          </div>

          <div className="sm:col-span-2">
            <dt className="text-xs text-zinc-500">部署信息</dt>
            <dd className="mt-1 text-sm">
              <div className="flex flex-wrap gap-2">
                {service.vercel?.project ? <Badge>Vercel: {service.vercel.project}</Badge> : null}
                {service.docker?.containerName ? (
                  <Badge>Container: {service.docker.containerName}</Badge>
                ) : null}
                {service.docker?.composePath ? (
                  <Badge>Compose: {service.docker.composePath}</Badge>
                ) : null}
              </div>
            </dd>
          </div>

          <div className="sm:col-span-2">
            <dt className="text-xs text-zinc-500">备注</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm">{service.notes || "-"}</dd>
          </div>
        </dl>
      </Card>

      <div className="flex flex-wrap gap-3">
        <SubtleLink href="/services">← 返回应用列表</SubtleLink>
        {server ? <SubtleLink href={`/servers/${server.id}`}>查看服务器 →</SubtleLink> : null}
      </div>
    </div>
  );
}
