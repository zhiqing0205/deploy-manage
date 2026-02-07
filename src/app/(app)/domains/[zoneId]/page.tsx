import { listDnsRecords, listZones } from "@/lib/api/cloudflare";
import { createDnsRecordAction, updateDnsRecordAction, deleteDnsRecordAction } from "@/app/actions/dns";
import { DnsRecordTable } from "@/components/DnsRecordTable";
import { Card, SubtleLink } from "@/components/ui";

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

  const boundCreate = createDnsRecordAction.bind(null, zoneId);
  const boundUpdate = updateDnsRecordAction.bind(null, zoneId);
  const boundDelete = deleteDnsRecordAction.bind(null, zoneId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{zoneName}</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          DNS 记录管理 · {records.length} 条记录
        </p>
      </div>

      {error ? (
        <Card>
          <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
        </Card>
      ) : (
        <DnsRecordTable
          records={records}
          zoneId={zoneId}
          createAction={boundCreate}
          updateAction={boundUpdate}
          deleteAction={boundDelete}
        />
      )}

      <div>
        <SubtleLink href="/domains">← 返回域名列表</SubtleLink>
      </div>
    </div>
  );
}
