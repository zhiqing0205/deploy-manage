"use client";

import { useActionState } from "react";

import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";
import { Button, ButtonLink, Field, Input, Select, Spinner } from "@/components/ui";

export type DnsRecordFormValues = {
  type?: string;
  name?: string;
  content?: string;
  proxied?: boolean;
  ttl?: number;
  priority?: number;
};

const DNS_TYPES = ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SRV", "CAA"];

export function DnsRecordForm({
  action,
  defaultValues,
  submitLabel,
  cancelHref,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: DnsRecordFormValues;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialActionState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="类型" hint="必填">
          <Select name="type" defaultValue={defaultValues?.type ?? "A"}>
            {DNS_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="名称" hint="必填">
          <Input
            name="name"
            defaultValue={defaultValues?.name ?? ""}
            required
            placeholder="@ 或 sub"
          />
        </Field>
      </div>

      <Field label="内容" hint="必填">
        <Input
          name="content"
          defaultValue={defaultValues?.content ?? ""}
          required
          placeholder="IP 地址或目标"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="代理">
          <label className="flex h-10 items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="proxied"
              defaultChecked={defaultValues?.proxied ?? false}
              className="h-4 w-4 rounded accent-blue-600"
            />
            启用 Cloudflare 代理
          </label>
        </Field>
        <Field label="TTL">
          <Input
            name="ttl"
            type="number"
            defaultValue={defaultValues?.ttl ?? 1}
            min={1}
            placeholder="1 = 自动"
          />
        </Field>
        <Field label="优先级" hint="MX/SRV 用">
          <Input
            name="priority"
            type="number"
            defaultValue={defaultValues?.priority ?? ""}
            min={0}
            placeholder="10"
          />
        </Field>
      </div>

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
