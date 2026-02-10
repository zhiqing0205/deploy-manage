import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Boxes,
  Cloud,
  Database,
  Globe,
  Plus,
  Server,
  Settings,
  ShieldCheck,
} from "lucide-react";

import { listServers, listServices } from "@/lib/data";
import { getEnv, hasAuthEnabled } from "@/lib/env";
import { listZones } from "@/lib/api/cloudflare";
import { StatusPieChart, DeployBarChart, ServerLoadChart } from "@/components/DashboardCharts";
import { Badge, ButtonLink, Card, SectionTitle, SubtleLink } from "@/components/ui";

const DEPLOYMENT_LABELS: Record<string, string> = {
  docker: "Docker",
  vercel: "Vercel",
  reverse_proxy: "反代",
  static: "静态",
  other: "其他",
};

export default async function DashboardPage() {
  const [servers, services] = await Promise.all([listServers(), listServices()]);

  const activeServices = services.filter((s) => s.status === "active");
  const pausedServices = services.filter((s) => s.status === "paused");
  const archivedServices = services.filter((s) => s.status === "archived");
  const env = getEnv();
  const authEnabled = hasAuthEnabled();
  const hasCf = Boolean(env.CLOUDFLARE_API_TOKEN);

  let zoneCount = 0;
  if (hasCf) {
    try {
      const zones = await listZones();
      zoneCount = zones.length;
    } catch {
      // ignore
    }
  }

  // Deployment type distribution
  const deployMap = new Map<string, number>();
  for (const svc of services) {
    const t = svc.deploymentType;
    deployMap.set(t, (deployMap.get(t) ?? 0) + 1);
  }
  const deployEntries = [...deployMap.entries()].sort((a, b) => b[1] - a[1]);

  // Server utilization (how many services per server)
  const svcPerServer = new Map<string, number>();
  for (const svc of services) {
    if (svc.serverId) svcPerServer.set(svc.serverId, (svcPerServer.get(svc.serverId) ?? 0) + 1);
  }
  const unassigned = services.filter((s) => !s.serverId).length;

  // Chart data
  const statusData = [
    { name: "运行中", value: activeServices.length },
    { name: "已暂停", value: pausedServices.length },
    { name: "已归档", value: archivedServices.length },
  ].filter((d) => d.value > 0);

  const deployData = deployEntries.map(([type, count]) => ({
    name: DEPLOYMENT_LABELS[type] ?? type,
    count,
  }));

  const serverLoadData = servers
    .map((srv) => ({
      name: srv.name.length > 8 ? srv.name.slice(0, 8) + "…" : srv.name,
      services: svcPerServer.get(srv.id) ?? 0,
    }))
    .sort((a, b) => b.services - a.services)
    .slice(0, 10);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <Card className="relative overflow-hidden p-6">
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_0%_0%,rgba(59,130,246,0.14),transparent_55%),radial-gradient(700px_circle_at_100%_0%,rgba(16,185,129,0.10),transparent_50%)] dark:bg-[radial-gradient(900px_circle_at_0%_0%,rgba(59,130,246,0.16),transparent_55%),radial-gradient(700px_circle_at_100%_0%,rgba(16,185,129,0.12),transparent_50%)]" />
        <div className="relative">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">概览</h1>
                <Badge tone="blue">DeployManage</Badge>
              </div>
              <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">
                统一管理不同服务器/域名/反向代理/Docker/Vercel 的应用入口与信息。
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Badge tone={authEnabled ? "green" : "amber"}>
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {authEnabled ? "鉴权已启用" : "鉴权未启用"}
                  </span>
                </Badge>
                <Badge>
                  <span className="inline-flex items-center gap-1">
                    <Database className="h-3.5 w-3.5" />
                    数据：Turso
                  </span>
                </Badge>
                {hasCf ? (
                  <Badge tone="blue">
                    <span className="inline-flex items-center gap-1">
                      <Cloud className="h-3.5 w-3.5" />
                      Cloudflare 已接入
                    </span>
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <ButtonLink href="/services/new" tone="blue">
                <Plus className="h-4 w-4" />
                新增应用
              </ButtonLink>
              <ButtonLink href="/servers/new">
                <Plus className="h-4 w-4" />
                新增服务器
              </ButtonLink>
              <ButtonLink href="/settings">
                <Settings className="h-4 w-4" />
                设置
              </ButtonLink>
            </div>
          </div>
        </div>
      </Card>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="服务器"
          icon={Server}
          iconBg="bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
          value={servers.length}
          href="/servers"
          linkText="查看服务器列表"
        />
        <StatCard
          title="应用"
          icon={Boxes}
          iconBg="bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400"
          value={services.length}
          sub={
            pausedServices.length > 0
              ? `${activeServices.length} 运行中 · ${pausedServices.length} 已暂停`
              : undefined
          }
          href="/services"
          linkText="查看应用列表"
        />
        <StatCard
          title="运行中"
          icon={Activity}
          iconBg="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
          value={activeServices.length}
          sub={
            services.length > 0
              ? `${Math.round((activeServices.length / services.length) * 100)}%`
              : undefined
          }
          href="/services?status=active"
          linkText="仅看运行中"
        />
        <StatCard
          title="域名"
          icon={Globe}
          iconBg="bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
          value={hasCf ? zoneCount : "-"}
          href="/domains"
          linkText="管理域名"
        />
      </div>

      {/* Interactive charts */}
      {services.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <SectionTitle>应用状态分布</SectionTitle>
            <div className="mt-4">
              <StatusPieChart data={statusData} />
            </div>
          </Card>

          <Card>
            <SectionTitle>部署方式</SectionTitle>
            <div className="mt-4">
              <DeployBarChart data={deployData} />
            </div>
          </Card>
        </div>
      ) : null}

      {/* Server load chart */}
      {servers.length > 0 && services.length > 0 ? (
        <Card>
          <SectionTitle>服务器负载分布</SectionTitle>
          <p className="mt-1 text-xs text-zinc-500">每台服务器上部署的应用数量</p>
          <div className="mt-4">
            <ServerLoadChart data={serverLoadData} />
          </div>
        </Card>
      ) : null}

      {/* Recent lists */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <SectionTitle>最近应用</SectionTitle>
            <SubtleLink href="/services">全部</SubtleLink>
          </div>
          <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {services
              .slice()
              .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
              .slice(0, 6)
              .map((svc) => (
                <li key={svc.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
                    <Boxes className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/services/${svc.id}`}
                      className="block truncate text-sm font-medium hover:underline"
                      title={svc.name}
                    >
                      {svc.name}
                    </Link>
                    <div className="truncate text-xs text-zinc-500">
                      {svc.urls[0]?.url ?? svc.deploymentType}
                    </div>
                  </div>
                  <Badge tone={svc.status === "active" ? "green" : "zinc"}>{svc.status}</Badge>
                </li>
              ))}
            {services.length === 0 ? (
              <li className="py-2 text-sm text-zinc-500">还没有应用数据。</li>
            ) : null}
          </ul>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <SectionTitle>最近服务器</SectionTitle>
            <SubtleLink href="/servers">全部</SubtleLink>
          </div>
          <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {servers
              .slice()
              .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
              .slice(0, 6)
              .map((srv) => {
                const svcCount = svcPerServer.get(srv.id) ?? 0;
                return (
                  <li key={srv.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                      <Server className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/servers/${srv.id}`}
                        className="block truncate text-sm font-medium hover:underline"
                        title={srv.name}
                      >
                        {srv.name}
                      </Link>
                      <div className="truncate text-xs text-zinc-500">
                        {[srv.host, srv.region, srv.provider].filter(Boolean).join(" · ") || "未配置"}
                      </div>
                    </div>
                    <Badge tone="blue">{svcCount} 应用</Badge>
                  </li>
                );
              })}
            {servers.length === 0 ? (
              <li className="py-2 text-sm text-zinc-500">还没有服务器数据。</li>
            ) : null}
          </ul>
        </Card>
      </div>

      {/* Unassigned hint */}
      {unassigned > 0 ? (
        <Card className="border-amber-200/70 dark:border-amber-800/40">
          <div className="flex items-center gap-3 text-sm text-amber-700 dark:text-amber-300">
            <Boxes className="h-5 w-5 shrink-0" />
            <span>
              有 <strong>{unassigned}</strong> 个应用未关联到任何服务器。
            </span>
            <SubtleLink href="/services">去处理</SubtleLink>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

/* ---- Sub-components ---- */

function StatCard({
  title,
  icon: Icon,
  iconBg,
  value,
  sub,
  href,
  linkText,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  value: number | string;
  sub?: string;
  href: string;
  linkText: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <SectionTitle>{title}</SectionTitle>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
          {sub ? <div className="mt-1 text-xs text-zinc-500">{sub}</div> : null}
        </div>
        <div className={`rounded-2xl p-3 ${iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4">
        <Link href={href} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
          {linkText} <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}
