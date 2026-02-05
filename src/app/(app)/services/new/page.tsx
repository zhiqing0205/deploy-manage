import { createServiceAction } from "@/app/actions/services";
import { ServiceForm } from "@/components/forms/ServiceForm";
import { listServers } from "@/lib/data";
import { Card, SubtleLink } from "@/components/ui";

export default async function NewServicePage() {
  const servers = await listServers();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">新增应用</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          记录域名、反向代理、Docker/Vercel 部署信息与管理入口。
        </p>
      </div>

      <Card>
        <ServiceForm
          action={createServiceAction}
          submitLabel="创建"
          cancelHref="/services"
          servers={servers.map((s) => ({ id: s.id, name: s.name }))}
          defaultValues={{
            urlsText: "",
            managementUrlsText: "",
            proxyType: "none",
            proxyRules: "",
          }}
        />
      </Card>

      <div>
        <SubtleLink href="/services">← 返回应用列表</SubtleLink>
      </div>
    </div>
  );
}

