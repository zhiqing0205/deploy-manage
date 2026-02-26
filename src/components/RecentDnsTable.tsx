"use client";

import { useActionState, useEffect, useState } from "react";
import { X } from "lucide-react";

import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";
import { Badge, Button, Input, Select, Spinner } from "@/components/ui";
import { ConfirmSubmitButton } from "@/components/forms/ConfirmSubmitButton";

export type RecentDnsRecord = {
  id: string;
  zoneId: string;
  zoneName: string;
  type: string;
  name: string;
  content: string;
  proxied: boolean;
  ttl: number;
  priority?: number;
  modified_on: string;
};

const DNS_TYPES = ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SRV", "CAA"];

function formatRelativeTime(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin} 分钟前`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} 小时前`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay} 天前`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth} 个月前`;
  return `${Math.floor(diffMonth / 12)} 年前`;
}

function InlineEditForm({
  action,
  defaultValues,
  onCancel,
  onSuccess,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues: RecentDnsRecord;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, initialActionState);

  useEffect(() => {
    if (state.ok) onSuccess();
  }, [state.ok, onSuccess]);

  return (
    <tr className="border-b border-zinc-100 bg-zinc-50/50 dark:border-zinc-800/60 dark:bg-zinc-900/30">
      <td colSpan={7} className="px-3 py-3">
        <form action={formAction} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-6">
            <Select name="type" defaultValue={defaultValues.type} className="sm:col-span-1">
              {DNS_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <Input
              name="name"
              defaultValue={defaultValues.name}
              required
              placeholder="名称"
              className="sm:col-span-2"
            />
            <Input
              name="content"
              defaultValue={defaultValues.content}
              required
              placeholder="内容"
              className="sm:col-span-3"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="proxied"
                defaultChecked={defaultValues.proxied}
                className="h-4 w-4 rounded accent-blue-600"
              />
              代理
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-500">TTL</span>
              <Input
                name="ttl"
                type="number"
                defaultValue={defaultValues.ttl}
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
                defaultValue={defaultValues.priority ?? ""}
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

export function RecentDnsTable({
  records,
  updateAction,
  deleteAction,
}: {
  records: RecentDnsRecord[];
  updateAction: (
    zoneId: string,
    recordId: string,
    prev: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  deleteAction: (zoneId: string, recordId: string) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleClose() {
    setEditingId(null);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800">
            <th className="px-3 py-2 font-medium">域名</th>
            <th className="px-3 py-2 font-medium">类型</th>
            <th className="px-3 py-2 font-medium">名称</th>
            <th className="px-3 py-2 font-medium">内容</th>
            <th className="px-3 py-2 font-medium">代理</th>
            <th className="px-3 py-2 font-medium">修改时间</th>
            <th className="px-3 py-2 font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec) => {
            if (editingId === rec.id) {
              const boundUpdate = updateAction.bind(null, rec.zoneId, rec.id);
              return (
                <InlineEditForm
                  key={`edit-${rec.id}`}
                  action={boundUpdate}
                  defaultValues={rec}
                  onCancel={handleClose}
                  onSuccess={handleClose}
                />
              );
            }

            const boundDelete = deleteAction.bind(null, rec.zoneId, rec.id);
            return (
              <tr
                key={rec.id}
                className="border-b border-zinc-100 dark:border-zinc-800/60"
              >
                <td className="px-3 py-2 text-xs text-zinc-500">
                  {rec.zoneName}
                </td>
                <td className="px-3 py-2">
                  <Badge>{rec.type}</Badge>
                </td>
                <td className="max-w-[180px] truncate px-3 py-2 font-mono text-xs">
                  {rec.name}
                </td>
                <td className="max-w-[200px] truncate px-3 py-2 font-mono text-xs">
                  {rec.content}
                </td>
                <td className="px-3 py-2">
                  <Badge tone={rec.proxied ? "amber" : "zinc"}>
                    {rec.proxied ? "代理" : "仅 DNS"}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-xs text-zinc-500">
                  {formatRelativeTime(rec.modified_on)}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      tone="blue"
                      onClick={() => setEditingId(rec.id)}
                      disabled={editingId !== null}
                      className="h-8 px-2.5 text-xs"
                    >
                      编辑
                    </Button>
                    <form action={boundDelete}>
                      <ConfirmSubmitButton
                        confirmText={`确定删除 ${rec.type} 记录 "${rec.name}" 吗？`}
                        tone="red"
                        className="h-8 px-2.5 text-xs"
                      >
                        删除
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
