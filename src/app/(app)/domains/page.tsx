import Link from "next/link";

import { getDomainOrder } from "@/lib/data";
import { listZones, getDnsRecordSummary, type Zone, type DnsRecordSummary } from "@/lib/api/cloudflare";
import { reorderDomainsAction } from "@/app/actions/reorder";
import { SortableGrid } from "@/components/SortableGrid";
import { Badge, Card } from "@/components/ui";

export default async function DomainsPage() {
  let zones: Zone[] = [];
  let error = "";

  try {
    zones = await listZones();
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : "获取域名列表失败。";
  }

  // Apply saved ordering
  const domainOrder = await getDomainOrder();
  if (domainOrder.length > 0) {
    const orderMap = new Map(domainOrder.map((id, idx) => [id, idx]));
    zones.sort((a, b) => {
      const oa = orderMap.get(a.id) ?? Number.MAX_SAFE_INTEGER;
      const ob = orderMap.get(b.id) ?? Number.MAX_SAFE_INTEGER;
      return oa - ob;
    });
  }

  // Fetch DNS summaries in parallel
  const summaryMap = new Map<string, DnsRecordSummary>();
  if (zones.length > 0) {
    const results = await Promise.allSettled(
      zones.map((z) => getDnsRecordSummary(z.id)),
    );
    zones.forEach((z, i) => {
      const r = results[i];
      if (r.status === "fulfilled") summaryMap.set(z.id, r.value);
    });
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

      <SortableGrid
        onReorder={reorderDomainsAction}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {zones.map((zone) => {
          const summary = summaryMap.get(zone.id);
          return (
            <div key={zone.id} data-sort-id={zone.id}>
              <Card>
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
                  <div className="flex items-center gap-2">
                    <Badge tone={zone.status === "active" ? "green" : "zinc"}>
                      {zone.status}
                    </Badge>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Badge tone="blue">
                    {summary ? `${summary.totalCount} 条记录` : "…"}
                  </Badge>
                </div>

                {summary && summary.recent.length > 0 ? (
                  <div className="mt-3 space-y-1">
                    {summary.recent.map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-center gap-2 text-xs text-zinc-500"
                      >
                        <Badge>{rec.type}</Badge>
                        <span className="min-w-0 truncate font-mono">{rec.name}</span>
                        <span className="ml-auto shrink-0 truncate font-mono max-w-[120px]">
                          {rec.content}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="mt-4">
                  <Link
                    href={`/domains/${zone.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    管理 DNS →
                  </Link>
                </div>
              </Card>
            </div>
          );
        })}
      </SortableGrid>

      {!error && zones.length === 0 ? (
        <Card>
          <div className="text-sm text-zinc-600 dark:text-zinc-300">
            没有找到域名。请检查 Cloudflare API Token 配置。
          </div>
        </Card>
      ) : null}
    </div>
  );
}
