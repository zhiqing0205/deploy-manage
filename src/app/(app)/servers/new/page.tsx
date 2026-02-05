import { createServerAction } from "@/app/actions/servers";
import { ServerForm } from "@/components/forms/ServerForm";
import { Card, SubtleLink } from "@/components/ui";

export default function NewServerPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">新增服务器</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          用于记录主机信息与 1Panel 管理入口。
        </p>
      </div>

      <Card>
        <ServerForm
          action={createServerAction}
          submitLabel="创建"
          cancelHref="/servers"
        />
      </Card>

      <div>
        <SubtleLink href="/servers">← 返回服务器列表</SubtleLink>
      </div>
    </div>
  );
}

