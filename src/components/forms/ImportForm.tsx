"use client";

import { useActionState } from "react";

import { importDataAction } from "@/app/actions/settings";
import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";
import { Button, Field, Input } from "@/components/ui";

export function ImportForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    importDataAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <Field label="导入 JSON" hint="会覆盖远端数据文件">
        <Input name="file" type="file" accept="application/json" required />
      </Field>

      {state.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {state.error}
        </div>
      ) : null}

      <Button type="submit" tone="blue" disabled={pending}>
        {pending ? "导入中…" : "导入并覆盖"}
      </Button>
    </form>
  );
}

