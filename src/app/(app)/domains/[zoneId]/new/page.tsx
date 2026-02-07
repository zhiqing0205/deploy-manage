import { createDnsRecordAction } from "@/app/actions/dns";
import { DnsRecordForm } from "@/components/forms/DnsRecordForm";
import { Card, SubtleLink } from "@/components/ui";

export default async function NewDnsRecordPage({
  params,
}: {
  params: Promise<{ zoneId: string }>;
}) {
  const { zoneId } = await params;
  const action = createDnsRecordAction.bind(null, zoneId);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">新增 DNS 记录</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          创建新的 DNS 记录到 Cloudflare。
        </p>
      </div>

      <Card>
        <DnsRecordForm
          action={action}
          submitLabel="创建"
          cancelHref={`/domains/${zoneId}`}
        />
      </Card>

      <div>
        <SubtleLink href={`/domains/${zoneId}`}>← 返回 DNS 记录</SubtleLink>
      </div>
    </div>
  );
}
