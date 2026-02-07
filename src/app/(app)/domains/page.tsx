import Link from "next/link";

import { listZones } from "@/lib/api/cloudflare";
import { Badge, Card } from "@/components/ui";

export default async function DomainsPage() {
  let zones: Awaited<ReturnType<typeof listZones>> = [];
  let error = "";

  try {
    zones = await listZones();
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : "获取域名列表失败。";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">域名</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          通过 Cloudflare 管理域名与 DNS 记录。
        </p>
      </div>

      {error ? (
        <Card>
          <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {zones.map((zone) => (
          <Card key={zone.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/domains/${zone.id}`}
                  className="block truncate text-base font-semibold hover:underline"
                  title={zone.name}
                >
                  {zone.name}
                </Link>
              </div>
              <Badge tone={zone.status === "active" ? "green" : "zinc"}>{zone.status}</Badge>
            </div>
            {zone.name_servers.length > 0 ? (
              <div className="mt-3 space-y-1">
                {zone.name_servers.map((ns) => (
                  <div key={ns} className="truncate text-xs text-zinc-500">
                    {ns}
                  </div>
                ))}
              </div>
            ) : null}
            <div className="mt-4">
              <Link
                href={`/domains/${zone.id}`}
                className="text-sm text-blue-600 hover:underline"
              >
                DNS 记录 →
              </Link>
            </div>
          </Card>
        ))}

        {!error && zones.length === 0 ? (
          <Card>
            <div className="text-sm text-zinc-600 dark:text-zinc-300">
              没有找到域名。请检查 Cloudflare API Token 配置。
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
