import { notFound } from "next/navigation";

import { deleteServiceAction, updateServiceAction } from "@/app/actions/services";
import { ConfirmSubmitButton } from "@/components/forms/ConfirmSubmitButton";
import { ServiceForm } from "@/components/forms/ServiceForm";
import { getServiceById, listServers } from "@/lib/data";
import { urlListToText } from "@/lib/text";
import { Card, SubtleLink } from "@/components/ui";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [service, servers] = await Promise.all([getServiceById(id), listServers()]);
  if (!service) notFound();

  const action = updateServiceAction.bind(null, service.id);
  const deleteAction = deleteServiceAction.bind(null, service.id);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">编辑应用</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          修改后可在列表和详情中快速跳转到站点/管理入口。
        </p>
      </div>

      <Card>
        <ServiceForm
          action={action}
          submitLabel="保存"
          cancelHref={`/services/${service.id}`}
          servers={servers.map((s) => ({ id: s.id, name: s.name }))}
          defaultValues={{
            name: service.name,
            description: service.description ?? "",
            serverId: service.serverId ?? "",
            proxyServerId: service.proxyServerId ?? "",
            status: service.status,
            deploymentType: service.deploymentType,
            repoUrl: service.repoUrl ?? "",
            github: service.github ?? "",
            urlsText: urlListToText(service.urls),
            managementUrlsText: urlListToText(service.managementUrls),
            healthcheckUrl: service.healthcheckUrl ?? "",
            tagsText: (service.tags ?? []).join(", "),
            notes: service.notes ?? "",
            proxyType: service.proxy?.type ?? "none",
            proxyUpstream: service.proxy?.upstream ?? "",
            proxyRules: service.proxy?.rules ?? "",
            dockerContainerName: service.docker?.containerName ?? "",
            dockerComposePath: service.docker?.composePath ?? "",
            vercelProject: service.vercel?.project ?? "",
          }}
        />
      </Card>

      <Card>
        <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">危险操作</div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          删除应用会移除这条记录（不会影响实际部署）。
        </p>
        <div className="mt-4">
          <form action={deleteAction}>
            <ConfirmSubmitButton confirmText="确定删除应用？此操作不可撤销。">
              删除应用
            </ConfirmSubmitButton>
          </form>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <SubtleLink href={`/services/${service.id}`}>← 返回详情</SubtleLink>
        <SubtleLink href="/services">应用列表 →</SubtleLink>
      </div>
    </div>
  );
}

