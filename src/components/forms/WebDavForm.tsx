"use client";

import { useActionState } from "react";
import { Plug, Save, Upload } from "lucide-react";

import {
  saveWebDavSettingsAction,
  testWebDavAction,
  backupToWebDavAction,
} from "@/app/actions/settings";
import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";
import { Button, Field, Input, Spinner } from "@/components/ui";

async function testAction(_prev: ActionState, _formData: FormData): Promise<ActionState> {
  return testWebDavAction();
}

async function backupAction(_prev: ActionState, _formData: FormData): Promise<ActionState> {
  return backupToWebDavAction();
}

export function WebDavForm({
  defaultValues,
  configured,
}: {
  defaultValues?: { url?: string; username?: string; password?: string; path?: string };
  configured?: boolean;
}) {
  const [saveState, saveFormAction, savePending] = useActionState<ActionState, FormData>(
    saveWebDavSettingsAction,
    initialActionState,
  );

  const [testState, testFormAction, testPending] = useActionState<ActionState, FormData>(
    testAction,
    initialActionState,
  );

  const [backupState, backupFormAction, backupPending] = useActionState<ActionState, FormData>(
    backupAction,
    initialActionState,
  );

  return (
    <div className="space-y-4">
      <form id="webdav-save" action={saveFormAction} className="space-y-4">
        <Field label="WebDAV URL" hint="必填">
          <Input
            name="url"
            type="url"
            placeholder="https://dav.example.com/remote.php/dav/files/user"
            defaultValue={defaultValues?.url ?? ""}
            required
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="用户名">
            <Input
              name="username"
              placeholder="可选"
              defaultValue={defaultValues?.username ?? ""}
            />
          </Field>
          <Field label="密码">
            <Input
              name="password"
              type="password"
              placeholder="可选"
              defaultValue={defaultValues?.password ?? ""}
            />
          </Field>
        </div>

        <Field label="路径" hint="子目录，可选">
          <Input
            name="path"
            placeholder="backup/manage"
            defaultValue={defaultValues?.path ?? ""}
          />
        </Field>
      </form>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" form="webdav-save" tone="blue" disabled={savePending}>
          {savePending ? (
            <>
              <Spinner className="h-4 w-4" />
              保存中…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              保存
            </>
          )}
        </Button>

        <form action={testFormAction} className="contents">
          <Button type="submit" tone="zinc" variant="outline" disabled={testPending}>
            {testPending ? (
              <>
                <Spinner className="h-4 w-4" />
                测试中…
              </>
            ) : (
              <>
                <Plug className="h-4 w-4" />
                测试连接
              </>
            )}
          </Button>
        </form>

        {configured ? (
          <form action={backupFormAction} className="contents">
            <Button type="submit" tone="blue" variant="outline" disabled={backupPending}>
              {backupPending ? (
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
          </form>
        ) : null}
      </div>

      {saveState.ok ? (
        <div className="text-xs text-emerald-600 dark:text-emerald-400">保存成功。</div>
      ) : null}
      {saveState.error ? (
        <div className="text-xs text-red-600 dark:text-red-400">{saveState.error}</div>
      ) : null}
      {testState.ok ? (
        <div className="text-xs text-emerald-600 dark:text-emerald-400">连接成功。</div>
      ) : null}
      {testState.error ? (
        <div className="text-xs text-red-600 dark:text-red-400">{testState.error}</div>
      ) : null}
      {backupState.ok ? (
        <div className="text-xs text-emerald-600 dark:text-emerald-400">备份成功。</div>
      ) : null}
      {backupState.error ? (
        <div className="text-xs text-red-600 dark:text-red-400">{backupState.error}</div>
      ) : null}
    </div>
  );
}
