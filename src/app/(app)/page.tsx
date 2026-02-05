import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  Boxes,
  Database,
  Plus,
  Server,
  Settings,
  ShieldCheck,
} from "lucide-react";

import { listServers, listServices } from "@/lib/data";
import { getEnv, hasAuthEnabled } from "@/lib/env";
import { Badge, ButtonLink, Card, SectionTitle, SubtleLink } from "@/components/ui";

export default async function DashboardPage() {
  const [servers, services] = await Promise.all([listServers(), listServices()]);

  const activeServices = services.filter((s) => s.status === "active");
  const env = getEnv();
  const authEnabled = hasAuthEnabled();

  return (
    <div className="space-y-8">
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
                    数据：{env.DATA_BACKEND}
                  </span>
                </Badge>
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

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="服务器"
          icon={Server}
          value={servers.length}
          href="/servers"
          linkText="查看服务器列表"
        />
        <StatCard
          title="应用"
          icon={Boxes}
          value={services.length}
          href="/services"
          linkText="查看应用列表"
        />
        <StatCard
          title="运行中"
          icon={Activity}
          value={activeServices.length}
          href="/services?status=active"
          linkText="仅看运行中"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <SectionTitle>最近应用</SectionTitle>
            <SubtleLink href="/services">全部</SubtleLink>
          </div>
          <ul className="mt-3 space-y-2">
            {services
              .slice()
              .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
              .slice(0, 6)
              .map((svc) => (
                <li key={svc.id} className="flex items-center justify-between gap-3">
                  <Link
                    href={`/services/${svc.id}`}
                    className="truncate text-sm font-medium hover:underline"
                    title={svc.name}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Boxes className="h-4 w-4 text-zinc-400" />
                      {svc.name}
                    </span>
                  </Link>
                  <span className="shrink-0 text-xs text-zinc-500">
                    {new Date(svc.updatedAt).toLocaleDateString("zh-CN")}
                  </span>
                </li>
              ))}
            {services.length === 0 ? (
              <li className="text-sm text-zinc-500">还没有应用数据。</li>
            ) : null}
          </ul>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <SectionTitle>最近服务器</SectionTitle>
            <SubtleLink href="/servers">全部</SubtleLink>
          </div>
          <ul className="mt-3 space-y-2">
            {servers
              .slice()
              .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
              .slice(0, 6)
              .map((srv) => (
                <li key={srv.id} className="flex items-center justify-between gap-3">
                  <Link
                    href={`/servers/${srv.id}`}
                    className="truncate text-sm font-medium hover:underline"
                    title={srv.name}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Server className="h-4 w-4 text-zinc-400" />
                      {srv.name}
                    </span>
                  </Link>
                  <span className="shrink-0 text-xs text-zinc-500">
                    {new Date(srv.updatedAt).toLocaleDateString("zh-CN")}
                  </span>
                </li>
              ))}
            {servers.length === 0 ? (
              <li className="text-sm text-zinc-500">还没有服务器数据。</li>
            ) : null}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  icon: Icon,
  value,
  href,
  linkText,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  href: string;
  linkText: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <SectionTitle>{title}</SectionTitle>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
        </div>
        <div className="rounded-2xl border border-zinc-200/70 bg-white/60 p-3 text-zinc-800 shadow-sm dark:border-zinc-800/70 dark:bg-zinc-950/40 dark:text-zinc-100">
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
