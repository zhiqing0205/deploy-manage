import { notFound } from "next/navigation";

import { getDnsRecord } from "@/lib/api/cloudflare";
import { updateDnsRecordAction } from "@/app/actions/dns";
import { DnsRecordForm } from "@/components/forms/DnsRecordForm";
import { Card, SubtleLink } from "@/components/ui";

export default async function EditDnsRecordPage({
  params,
}: {
  params: Promise<{ zoneId: string; recordId: string }>;
}) {
  const { zoneId, recordId } = await params;

  let record: Awaited<ReturnType<typeof getDnsRecord>>;
  try {
    record = await getDnsRecord(zoneId, recordId);
  } catch {
    notFound();
  }

  const action = updateDnsRecordAction.bind(null, zoneId, recordId);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">编辑 DNS 记录</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          修改 {record.type} 记录：{record.name}
        </p>
      </div>

      <Card>
        <DnsRecordForm
          action={action}
          submitLabel="保存"
          cancelHref={`/domains/${zoneId}`}
          defaultValues={{
            type: record.type,
            name: record.name,
            content: record.content,
            proxied: record.proxied,
            ttl: record.ttl,
            priority: record.priority,
          }}
        />
      </Card>

      <div>
        <SubtleLink href={`/domains/${zoneId}`}>← 返回 DNS 记录</SubtleLink>
      </div>
    </div>
  );
}
