"use client";

import { useActionState } from "react";

import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";
import { Button, ButtonLink, Field, Input, Select, Spinner, Textarea } from "@/components/ui";

export type ServiceFormValues = {
  name?: string;
  description?: string;
  serverId?: string;
  status?: "active" | "paused" | "archived";
  deploymentType?: "docker" | "vercel" | "reverse_proxy" | "static" | "other";
  repoUrl?: string;
  urlsText?: string;
  managementUrlsText?: string;
  healthcheckUrl?: string;
  tagsText?: string;
  notes?: string;

  proxyType?: "none" | "nginx" | "caddy" | "traefik" | "1panel" | "other";
  proxyUpstream?: string;
  proxyRules?: string;

  dockerContainerName?: string;
  dockerComposePath?: string;

  vercelProject?: string;
};

export function ServiceForm({
  action,
  defaultValues,
  submitLabel,
  cancelHref,
  servers,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: ServiceFormValues;
  submitLabel: string;
  cancelHref: string;
  servers: Array<{ id: string; name: string }>;
}) {
  const [state, formAction, pending] = useActionState(action, initialActionState);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="名称" hint="必填">
        <Input name="name" defaultValue={defaultValues?.name ?? ""} required />
      </Field>

      <Field label="描述">
        <Textarea
          name="description"
          rows={3}
          defaultValue={defaultValues?.description ?? ""}
          placeholder="简要说明这个应用做什么"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="所属服务器">
          <Select name="serverId" defaultValue={defaultValues?.serverId ?? ""}>
            <option value="">（不绑定）</option>
            {servers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="状态">
          <Select name="status" defaultValue={defaultValues?.status ?? "active"}>
            <option value="active">active</option>
            <option value="paused">paused</option>
            <option value="archived">archived</option>
          </Select>
        </Field>
        <Field label="部署方式">
          <Select name="deploymentType" defaultValue={defaultValues?.deploymentType ?? "other"}>
            <option value="docker">docker</option>
            <option value="vercel">vercel</option>
            <option value="reverse_proxy">reverse_proxy</option>
            <option value="static">static</option>
            <option value="other">other</option>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Repo URL">
          <Input
            name="repoUrl"
            defaultValue={defaultValues?.repoUrl ?? ""}
            placeholder="https://github.com/..."
          />
        </Field>
        <Field label="健康检查 URL">
          <Input
            name="healthcheckUrl"
            defaultValue={defaultValues?.healthcheckUrl ?? ""}
            placeholder="https://example.com/health"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="访问地址" hint="每行一个；可选 label | url">
          <Textarea
            name="urlsText"
            rows={6}
            defaultValue={defaultValues?.urlsText ?? ""}
            placeholder={"主站 | https://example.com\nhttps://m.example.com"}
          />
        </Field>
        <Field label="管理入口" hint="每行一个；可选 label | url">
          <Textarea
            name="managementUrlsText"
            rows={6}
            defaultValue={defaultValues?.managementUrlsText ?? ""}
            placeholder={"1Panel | https://panel.example.com\nAdmin | https://example.com/admin"}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="标签" hint="逗号或换行分隔">
          <Input name="tags" defaultValue={defaultValues?.tagsText ?? ""} placeholder="prod, api" />
        </Field>
        <Field label="Vercel Project">
          <Input
            name="vercelProject"
            defaultValue={defaultValues?.vercelProject ?? ""}
            placeholder="my-vercel-project"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Docker Container">
          <Input
            name="dockerContainerName"
            defaultValue={defaultValues?.dockerContainerName ?? ""}
            placeholder="my-app"
          />
        </Field>
        <Field label="Docker Compose 路径">
          <Input
            name="dockerComposePath"
            defaultValue={defaultValues?.dockerComposePath ?? ""}
            placeholder="/opt/compose/app.yml"
          />
        </Field>
      </div>

      <CardLike title="反向代理">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="类型">
            <Select name="proxyType" defaultValue={defaultValues?.proxyType ?? "none"}>
              <option value="none">none</option>
              <option value="nginx">nginx</option>
              <option value="caddy">caddy</option>
              <option value="traefik">traefik</option>
              <option value="1panel">1panel</option>
              <option value="other">other</option>
            </Select>
          </Field>
          <Field label="Upstream" hint="可选">
            <Input
              name="proxyUpstream"
              defaultValue={defaultValues?.proxyUpstream ?? ""}
              placeholder="127.0.0.1:3000"
            />
          </Field>
          <Field label=" ">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              可在规则里记录具体反代配置片段。
            </div>
          </Field>
        </div>
        <Field label="规则/备注">
          <Textarea name="proxyRules" rows={5} defaultValue={defaultValues?.proxyRules ?? ""} />
        </Field>
      </CardLike>

      <Field label="备注">
        <Textarea name="notes" rows={6} defaultValue={defaultValues?.notes ?? ""} />
      </Field>

      {state.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {state.error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" tone="blue" disabled={pending}>
          {pending ? (
            <>
              <Spinner className="h-4 w-4" />
              保存中…
            </>
          ) : (
            submitLabel
          )}
        </Button>
        <ButtonLink href={cancelHref}>取消</ButtonLink>
      </div>
    </form>
  );
}

function CardLike({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{title}</div>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}
