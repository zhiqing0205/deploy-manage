import { notFound } from "next/navigation";

import { deleteServerAction, updateServerAction } from "@/app/actions/servers";
import { ConfirmSubmitButton } from "@/components/forms/ConfirmSubmitButton";
import { ServerForm } from "@/components/forms/ServerForm";
import { getServerById } from "@/lib/data";
import { Card, SubtleLink } from "@/components/ui";

export default async function EditServerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const server = await getServerById(id);
  if (!server) notFound();

  const action = updateServerAction.bind(null, server.id);
  const deleteAction = deleteServerAction.bind(null, server.id);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">编辑服务器</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          修改服务器信息后会影响关联的展示。
        </p>
      </div>

      <Card>
        <ServerForm
          action={action}
          submitLabel="保存"
          cancelHref={`/servers/${server.id}`}
          defaultValues={{
            name: server.name,
            host: server.host ?? "",
            provider: server.provider ?? "",
            region: server.region ?? "",
            panelUrl: server.panelUrl ?? "",
            tagsText: (server.tags ?? []).join(", "),
            notes: server.notes ?? "",
          }}
        />
      </Card>

      <Card>
        <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">危险操作</div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          删除服务器会将关联应用的「所属服务器」置空（不删除应用本身）。
        </p>
        <div className="mt-4">
          <form action={deleteAction}>
            <ConfirmSubmitButton confirmText="确定删除服务器？此操作不可撤销。">
              删除服务器
            </ConfirmSubmitButton>
          </form>
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <SubtleLink href={`/servers/${server.id}`}>← 返回详情</SubtleLink>
        <SubtleLink href="/servers">服务器列表 →</SubtleLink>
      </div>
    </div>
  );
}

