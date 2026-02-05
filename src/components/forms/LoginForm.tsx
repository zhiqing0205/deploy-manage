"use client";

import { useActionState } from "react";
import { LockKeyhole } from "lucide-react";

import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";
import { loginAction } from "@/app/actions/auth";
import { Button, Field, Input, Spinner } from "@/components/ui";

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    loginAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={nextPath ?? "/"} />

      <Field label="用户名">
        <Input name="username" autoComplete="username" required />
      </Field>

      <Field label="密码">
        <Input name="password" type="password" autoComplete="current-password" required />
      </Field>

      {state.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {state.error}
        </div>
      ) : null}

      <Button type="submit" tone="blue" disabled={pending} className="w-full">
        {pending ? (
          <>
            <Spinner className="h-4 w-4" />
            登录中…
          </>
        ) : (
          <>
            <LockKeyhole className="h-4 w-4" />
            登录
          </>
        )}
      </Button>
    </form>
  );
}

