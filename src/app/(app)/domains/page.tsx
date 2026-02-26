import Link from "next/link";

import { listDomains } from "@/lib/data";
import { getDnsRecordSummary, type DnsRecordSummary } from "@/lib/api/cloudflare";
import { fetchRemoteDomainsAction, importDomainsAction } from "@/app/actions/sync";
import { deleteDomainAction, updateDnsRecordAction, deleteDnsRecordAction } from "@/app/actions/dns";
import { reorderDomainsAction } from "@/app/actions/reorder";
import { ImportRemoteDialog } from "@/components/forms/ImportRemoteDialog";
import { ConfirmSubmitButton } from "@/components/forms/ConfirmSubmitButton";
import { RecentDnsTable, type RecentDnsRecord } from "@/components/RecentDnsTable";
import { SortableGrid } from "@/components/SortableGrid";
import { Badge, Card, SectionTitle } from "@/components/ui";

async function fetchAction() {
  "use server";
  const res = await fetchRemoteDomainsAction();
  if ("error" in res) return res;
  return {
    data: res.data.map((d) => ({
      ...d,
      id: d.zoneId,
      detail: d.status,
      alreadyImported: d.alreadyImported,
    })),
  };
}

async function importAction(ids: (string | number)[]) {
  "use server";
  return importDomainsAction(ids.map(String));
}

export default async function DomainsPage() {
  const importedDomains = await listDomains();

  // Fetch DNS summaries in parallel for imported domains
  const summaryMap = new Map<string, DnsRecordSummary>();
  if (importedDomains.length > 0) {
    const results = await Promise.allSettled(
      importedDomains.map((d) => getDnsRecordSummary(d.zoneId)),
    );
    importedDomains.forEach((d, i) => {
      const r = results[i];
      if (r.status === "fulfilled") summaryMap.set(d.zoneId, r.value);
    });
  }

  // Collect recent records across all domains, sorted by modified_on, take top 6
  const zoneNameMap = new Map(importedDomains.map((d) => [d.zoneId, d.name]));
  const allRecentRecords: RecentDnsRecord[] = [];
  for (const [zoneId, summary] of summaryMap) {
    for (const rec of summary.recent) {
      allRecentRecords.push({
        ...rec,
        zoneId,
        zoneName: zoneNameMap.get(zoneId) ?? zoneId,
        modified_on: rec.modified_on ?? "",
      });
    }
  }
  allRecentRecords.sort((a, b) => b.modified_on.localeCompare(a.modified_on));
  const recentRecords = allRecentRecords.slice(0, 20);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">域名</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            通过 Cloudflare 管理域名与 DNS 记录。
          </p>
        </div>
        <ImportRemoteDialog
          title="导入域名（Cloudflare）"
          fetchAction={fetchAction}
          importAction={importAction}
        />
      </div>

      <SortableGrid
        onReorder={reorderDomainsAction}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {importedDomains.map((domain) => {
          const summary = summaryMap.get(domain.zoneId);
          const boundDelete = deleteDomainAction.bind(null, domain.id);
          return (
            <div key={domain.id} data-sort-id={domain.id}>
              <Card>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/domains/${domain.zoneId}`}
                      className="block truncate text-base font-semibold hover:underline"
                      title={domain.name}
                    >
                      {domain.name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={domain.status === "active" ? "green" : "zinc"}>
                      {domain.status}
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
                    {summary.recent.slice(0, 5).map((rec) => (
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

                <div className="mt-4 flex items-center justify-between">
                  <Link
                    href={`/domains/${domain.zoneId}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    管理 DNS →
                  </Link>
                  <form action={boundDelete}>
                    <ConfirmSubmitButton
                      confirmText={`确定移除域名 "${domain.name}" 吗？（不会影响 Cloudflare 上的数据）`}
                      tone="red"
                    >
                      移除
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </Card>
            </div>
          );
        })}
      </SortableGrid>

      {importedDomains.length === 0 ? (
        <Card>
          <div className="text-sm text-zinc-600 dark:text-zinc-300">
            尚未导入任何域名。点击上方「获取远程数据」从 Cloudflare 导入。
          </div>
        </Card>
      ) : null}

      {recentRecords.length > 0 ? (
        <div className="space-y-3">
          <SectionTitle>最近修改的 DNS 记录</SectionTitle>
          <Card>
            <RecentDnsTable
              records={recentRecords}
              updateAction={updateDnsRecordAction}
              deleteAction={deleteDnsRecordAction}
            />
          </Card>
        </div>
      ) : null}
    </div>
  );
}
