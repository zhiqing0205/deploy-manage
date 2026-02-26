"use client";

import { useActionState } from "react";
import { Upload } from "lucide-react";

import { backupToWebDavAction } from "@/app/actions/settings";
import type { ActionState } from "@/lib/action-state";
import { Button, Spinner } from "@/components/ui";

async function action(_prev: ActionState, _formData: FormData): Promise<ActionState> {
  return backupToWebDavAction();
}

export function BackupButton() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction}>
      <Button type="submit" tone="blue" variant="outline" disabled={pending}>
        {pending ? (
          <>
            <Spinner className="h-4 w-4" />
            备份中…
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            备份到 WebDAV
          </>
        )}
      </Button>

      {state.ok ? (
        <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
          备份成功。
        </div>
      ) : null}

      {state.error ? (
        <div className="mt-2 text-xs text-red-600 dark:text-red-400">
          {state.error}
        </div>
      ) : null}
    </form>
  );
}
