"use client";

import { useActionState } from "react";

import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";
import { Button, ButtonLink, Field, Input, Textarea } from "@/components/ui";

export type ServerFormValues = {
  name?: string;
  host?: string;
  provider?: string;
  region?: string;
  panelUrl?: string;
  tagsText?: string;
  notes?: string;
};

export function ServerForm({
  action,
  defaultValues,
  submitLabel,
  cancelHref,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: ServerFormValues;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialActionState);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="名称" hint="必填">
        <Input name="name" defaultValue={defaultValues?.name ?? ""} required />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Host / IP">
          <Input name="host" defaultValue={defaultValues?.host ?? ""} placeholder="1.2.3.4" />
        </Field>
        <Field label="地区">
          <Input name="region" defaultValue={defaultValues?.region ?? ""} placeholder="cn-hk" />
        </Field>
        <Field label="供应商">
          <Input
            name="provider"
            defaultValue={defaultValues?.provider ?? ""}
            placeholder="aliyun / tencent / aws…"
          />
        </Field>
        <Field label="1Panel 地址">
          <Input
            name="panelUrl"
            defaultValue={defaultValues?.panelUrl ?? ""}
            placeholder="https://panel.example.com"
          />
        </Field>
      </div>

      <Field label="标签" hint="逗号或换行分隔">
        <Input name="tags" defaultValue={defaultValues?.tagsText ?? ""} placeholder="prod, hk" />
      </Field>

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
          {pending ? "保存中…" : submitLabel}
        </Button>
        <ButtonLink href={cancelHref}>取消</ButtonLink>
      </div>
    </form>
  );
}

