import Link from "next/link";

import { listServers, listServices } from "@/lib/data";
import { Card, SectionTitle } from "@/components/ui";

export default async function DashboardPage() {
  const [servers, services] = await Promise.all([listServers(), listServices()]);

  const activeServices = services.filter((s) => s.status === "active");

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">概览</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          统一管理不同服务器/域名/反向代理/Docker/Vercel 的应用入口与信息。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <SectionTitle>服务器</SectionTitle>
          <div className="mt-2 text-3xl font-semibold">{servers.length}</div>
          <div className="mt-4">
            <Link href="/servers" className="text-sm text-blue-600 hover:underline">
              查看服务器列表 →
            </Link>
          </div>
        </Card>
        <Card>
          <SectionTitle>应用</SectionTitle>
          <div className="mt-2 text-3xl font-semibold">{services.length}</div>
          <div className="mt-4">
            <Link href="/services" className="text-sm text-blue-600 hover:underline">
              查看应用列表 →
            </Link>
          </div>
        </Card>
        <Card>
          <SectionTitle>运行中</SectionTitle>
          <div className="mt-2 text-3xl font-semibold">{activeServices.length}</div>
          <div className="mt-4">
            <Link
              href="/services?status=active"
              className="text-sm text-blue-600 hover:underline"
            >
              仅看运行中 →
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle>最近应用</SectionTitle>
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
                    {svc.name}
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
          <SectionTitle>最近服务器</SectionTitle>
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
                    {srv.name}
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

