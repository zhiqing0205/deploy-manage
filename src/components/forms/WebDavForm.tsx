"use client";

import { useActionState } from "react";
import { Clock, Plug, Save, Upload } from "lucide-react";

import {
  saveWebDavSettingsAction,
  testWebDavAction,
  backupToWebDavAction,
} from "@/app/actions/settings";
import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";
import { Badge, Button, Field, Input, Spinner } from "@/components/ui";

async function testAction(_prev: ActionState, _formData: FormData): Promise<ActionState> {
  return testWebDavAction();
}

async function backupAction(_prev: ActionState, _formData: FormData): Promise<ActionState> {
  return backupToWebDavAction();
}

function formatBackupTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });
  } catch {
    return iso;
  }
}

export function WebDavForm({
  defaultValues,
  configured,
  lastBackup,
  cronConfigured,
}: {
  defaultValues?: { url?: string; username?: string; password?: string; path?: string; retention?: string };
  configured?: boolean;
  lastBackup?: { at?: string; status?: string; filename?: string };
  cronConfigured?: boolean;
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
      {/* Cron status */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Clock className="h-3.5 w-3.5 text-zinc-400" />
        <span className="text-zinc-500">定时备份（每日 02:00 UTC）</span>
        <Badge tone={cronConfigured ? "green" : "red"}>
          {cronConfigured ? "CRON_SECRET 已配置" : "CRON_SECRET 未配置"}
        </Badge>
        {!cronConfigured && (
          <span className="text-zinc-400">请在 Vercel 环境变量中设置 CRON_SECRET</span>
        )}
      </div>

      {/* Last backup info */}
      {lastBackup?.at && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-zinc-500">上次备份：</span>
            <span className="font-medium">{formatBackupTime(lastBackup.at)}</span>
            <Badge tone={lastBackup.status === "ok" ? "green" : "red"}>
              {lastBackup.status === "ok" ? "成功" : "失败"}
            </Badge>
          </div>
          {lastBackup.filename && lastBackup.status === "ok" && (
            <div className="mt-1 truncate text-zinc-400">{lastBackup.filename}</div>
          )}
          {lastBackup.status && lastBackup.status !== "ok" && (
            <div className="mt-1 text-red-500 dark:text-red-400">{lastBackup.status}</div>
          )}
        </div>
      )}

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

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="路径" hint="子目录，可选">
            <Input
              name="path"
              placeholder="backup/manage"
              defaultValue={defaultValues?.path ?? ""}
            />
          </Field>
          <Field label="保留数量" hint="自动清理旧备份，0 为不限制">
            <Input
              name="retention"
              type="number"
              min="0"
              placeholder="30"
              defaultValue={defaultValues?.retention ?? "30"}
            />
          </Field>
        </div>
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
