"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";

import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";
import { Badge, Button, Input, Select, Spinner } from "@/components/ui";
import { ConfirmSubmitButton } from "@/components/forms/ConfirmSubmitButton";

type DnsRecord = {
  id: string;
  type: string;
  name: string;
  content: string;
  proxied: boolean;
  ttl: number;
  priority?: number;
};

const DNS_TYPES = ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SRV", "CAA"];

function InlineForm({
  action,
  defaultValues,
  onCancel,
  onSuccess,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: Partial<DnsRecord>;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, initialActionState);

  useEffect(() => {
    if (state.ok) onSuccess();
  }, [state.ok, onSuccess]);

  return (
    <tr className="border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-800/60 dark:bg-zinc-900/30">
      <td colSpan={6} className="px-3 py-3">
        <form action={formAction} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-6">
            <Select name="type" defaultValue={defaultValues?.type ?? "A"} className="sm:col-span-1">
              {DNS_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <Input
              name="name"
              defaultValue={defaultValues?.name ?? ""}
              required
              placeholder="名称（如 @ 或 sub）"
              className="sm:col-span-2"
            />
            <Input
              name="content"
              defaultValue={defaultValues?.content ?? ""}
              required
              placeholder="内容（IP 地址或目标）"
              className="sm:col-span-3"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="proxied"
                defaultChecked={defaultValues?.proxied ?? false}
                className="h-4 w-4 rounded accent-blue-600"
              />
              代理
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-500">TTL</span>
              <Input
                name="ttl"
                type="number"
                defaultValue={defaultValues?.ttl ?? 1}
                min={1}
                className="w-20"
                placeholder="1"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-500">优先级</span>
              <Input
                name="priority"
                type="number"
                defaultValue={defaultValues?.priority ?? ""}
                min={0}
                className="w-20"
                placeholder="10"
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              {state.error ? (
                <span className="text-xs text-red-600 dark:text-red-400">{state.error}</span>
              ) : null}
              <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
                <X className="h-4 w-4" />
                取消
              </Button>
              <Button type="submit" tone="blue" disabled={pending}>
                {pending ? <Spinner className="h-4 w-4" /> : null}
                保存
              </Button>
            </div>
          </div>
        </form>
      </td>
    </tr>
  );
}

export function DnsRecordTable({
  records,
  zoneId,
  createAction,
  updateAction,
  deleteAction,
}: {
  records: DnsRecord[];
  zoneId: string;
  createAction: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  updateAction: (
    recordId: string,
    prev: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  deleteAction: (recordId: string) => Promise<void>;
}) {
  // "new" = creating, a recordId = editing that record, null = none
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleClose() {
    setEditingId(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="button"
          tone="blue"
          onClick={() => setEditingId("new")}
          disabled={editingId !== null}
        >
          <Plus className="h-4 w-4" />
          新增记录
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800">
              <th className="px-3 py-2 font-medium">类型</th>
              <th className="px-3 py-2 font-medium">名称</th>
              <th className="px-3 py-2 font-medium">内容</th>
              <th className="px-3 py-2 font-medium">代理</th>
              <th className="px-3 py-2 font-medium">TTL</th>
              <th className="px-3 py-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {editingId === "new" ? (
              <InlineForm
                action={createAction}
                onCancel={handleClose}
                onSuccess={handleClose}
              />
            ) : null}

            {records.map((rec) => {
              if (editingId === rec.id) {
                const boundUpdate = updateAction.bind(null, rec.id);
                return (
                  <InlineForm
                    key={`edit-${rec.id}`}
                    action={boundUpdate}
                    defaultValues={rec}
                    onCancel={handleClose}
                    onSuccess={handleClose}
                  />
                );
              }

              const boundDelete = deleteAction.bind(null, rec.id);
              return (
                <tr
                  key={rec.id}
                  className="border-b border-zinc-100 dark:border-zinc-800/60"
                >
                  <td className="px-3 py-2">
                    <Badge>{rec.type}</Badge>
                  </td>
                  <td className="max-w-[200px] truncate px-3 py-2 font-mono text-xs">
                    {rec.name}
                  </td>
                  <td className="max-w-[240px] truncate px-3 py-2 font-mono text-xs">
                    {rec.content}
                  </td>
                  <td className="px-3 py-2">
                    <Badge tone={rec.proxied ? "amber" : "zinc"}>
                      {rec.proxied ? "代理" : "仅 DNS"}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-xs text-zinc-500">
                    {rec.ttl === 1 ? "自动" : rec.ttl}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(rec.id)}
                        className="text-xs text-blue-600 hover:underline"
                        disabled={editingId !== null}
                      >
                        编辑
                      </button>
                      <form action={boundDelete}>
                        <ConfirmSubmitButton
                          confirmText={`确定删除 ${rec.type} 记录 "${rec.name}" 吗？`}
                          tone="red"
                        >
                          删除
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}

            {records.length === 0 && editingId !== "new" ? (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center text-zinc-500">
                  没有 DNS 记录。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
