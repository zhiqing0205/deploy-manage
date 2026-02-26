import { listDnsRecords, listZones } from "@/lib/api/cloudflare";
import { createDnsRecordAction, updateDnsRecordAction, deleteDnsRecordAction } from "@/app/actions/dns";
import { DnsRecordTable } from "@/components/DnsRecordTable";
import { Badge, Card, SubtleLink } from "@/components/ui";

const DNS_TYPE_DESCRIPTIONS: Array<{ type: string; description: string }> = [
  { type: "A", description: "IPv4 地址指向" },
  { type: "AAAA", description: "IPv6 地址指向" },
  { type: "CNAME", description: "别名指向另一域名" },
  { type: "MX", description: "邮件服务器" },
  { type: "TXT", description: "文本记录（SPF/DKIM 等）" },
  { type: "NS", description: "域名服务器" },
  { type: "SRV", description: "服务定位" },
  { type: "CAA", description: "证书颁发机构授权" },
];

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

  // Sort records by modified_on descending
  const sortedRecords = [...records].sort((a, b) => {
    const ma = a.modified_on ?? "";
    const mb = b.modified_on ?? "";
    return mb.localeCompare(ma);
  });

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

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {DNS_TYPE_DESCRIPTIONS.map((item) => (
          <div
            key={item.type}
            className="rounded-xl border border-zinc-200/70 bg-white/70 px-3 py-2 dark:border-zinc-800/70 dark:bg-zinc-950/40"
          >
            <Badge>{item.type}</Badge>
            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {item.description}
            </div>
          </div>
        ))}
      </div>

      {error ? (
        <Card>
          <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
        </Card>
      ) : (
        <DnsRecordTable
          records={sortedRecords}
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
