import Link from "next/link";
import { Plus } from "lucide-react";

import { listDnsRecords, listZones } from "@/lib/api/cloudflare";
import { deleteDnsRecordAction } from "@/app/actions/dns";
import { ConfirmSubmitButton } from "@/components/forms/ConfirmSubmitButton";
import { Badge, ButtonLink, Card, SubtleLink } from "@/components/ui";

export default async function DnsRecordsPage({
  params,
}: {
  params: Promise<{ zoneId: string }>;
}) {
  const { zoneId } = await params;

  let zoneName = zoneId;
  let records: Awaited<ReturnType<typeof listDnsRecords>> = [];
  let error = "";

  try {
    const [zones, recs] = await Promise.all([listZones(), listDnsRecords(zoneId)]);
    const zone = zones.find((z) => z.id === zoneId);
    if (zone) zoneName = zone.name;
    records = recs;
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : "获取 DNS 记录失败。";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{zoneName}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            DNS 记录管理 · {records.length} 条记录
          </p>
        </div>
        <ButtonLink href={`/domains/${zoneId}/new`} tone="blue">
          <Plus className="h-4 w-4" />
          新增记录
        </ButtonLink>
      </div>

      {error ? (
        <Card>
          <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
        </Card>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800">
              <th className="px-3 py-2 font-medium">类型</th>
              <th className="px-3 py-2 font-medium">名称</th>
              <th className="px-3 py-2 font-medium">内容</th>
              <th className="px-3 py-2 font-medium">代理</th>
              <th className="px-3 py-2 font-medium">TTL</th>
              <th className="px-3 py-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => {
              const deleteAction = deleteDnsRecordAction.bind(null, zoneId, rec.id);
              return (
                <tr
                  key={rec.id}
                  className="border-b border-zinc-100 dark:border-zinc-800/60"
                >
                  <td className="px-3 py-2">
                    <Badge>{rec.type}</Badge>
                  </td>
                  <td className="max-w-[200px] truncate px-3 py-2 font-mono text-xs">
                    {rec.name}
                  </td>
                  <td className="max-w-[240px] truncate px-3 py-2 font-mono text-xs">
                    {rec.content}
                  </td>
                  <td className="px-3 py-2">
                    <Badge tone={rec.proxied ? "amber" : "zinc"}>
                      {rec.proxied ? "代理" : "仅 DNS"}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-xs text-zinc-500">
                    {rec.ttl === 1 ? "自动" : rec.ttl}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/domains/${zoneId}/${rec.id}/edit`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        编辑
                      </Link>
                      <form action={deleteAction}>
                        <ConfirmSubmitButton
                          confirmText={`确定删除 ${rec.type} 记录 "${rec.name}" 吗？`}
                          tone="red"
                        >
                          删除
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!error && records.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center text-zinc-500">
                  没有 DNS 记录。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div>
        <SubtleLink href="/domains">← 返回域名列表</SubtleLink>
      </div>
    </div>
  );
}
