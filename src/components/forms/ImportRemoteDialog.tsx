"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Download } from "lucide-react";
import { useState, useTransition } from "react";

import { Button, Spinner } from "@/components/ui";

export type ImportItem = {
  id: string | number;
  name: string;
  detail: string;
  alreadyImported: boolean;
};

export function ImportRemoteDialog<T extends ImportItem>({
  title,
  fetchAction,
  importAction,
}: {
  title: string;
  fetchAction: () => Promise<{ data: T[] } | { error: string }>;
  importAction: (ids: (string | number)[]) => Promise<{ count: number } | { error: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<T[]>([]);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [loading, startFetch] = useTransition();
  const [importing, startImport] = useTransition();
  const [error, setError] = useState("");
  const [result, setResult] = useState("");

  function handleOpen() {
    setError("");
    setResult("");
    setItems([]);
    setSelected(new Set());
    setOpen(true);
    startFetch(async () => {
      const res = await fetchAction();
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setItems(res.data);
      const selectable = res.data.filter((i) => !i.alreadyImported).map((i) => i.id);
      setSelected(new Set(selectable));
    });
  }

  function toggle(id: string | number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(items.filter((i) => !i.alreadyImported).map((i) => i.id)));
  }

  function selectNone() {
    setSelected(new Set());
  }

  function handleImport() {
    setError("");
    setResult("");
    startImport(async () => {
      const ids = Array.from(selected);
      const res = await importAction(ids);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setResult(`成功导入 ${res.count} 项。`);
      // Mark newly imported items
      setItems((prev) =>
        prev.map((i) => (selected.has(i.id) ? { ...i, alreadyImported: true } : i)),
      );
      setSelected(new Set());
    });
  }

  const selectableCount = items.filter((i) => !i.alreadyImported).length;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Button type="button" onClick={handleOpen}>
        <Download className="h-4 w-4" />
        获取远程数据
      </Button>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[85vh] w-[min(600px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-zinc-200 bg-white shadow-xl outline-none dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-200 px-5 pb-4 pt-5 dark:border-zinc-800">
            <Dialog.Title className="text-base font-semibold tracking-tight">
              {title}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              选择要导入的项目，已导入的项目显示为灰色。
            </Dialog.Description>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-3">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Spinner />
              </div>
            ) : error && items.length === 0 ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            ) : (
              <>
                {items.length > 0 ? (
                  <div className="mb-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      全选
                    </button>
                    <button
                      type="button"
                      onClick={selectNone}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      取消全选
                    </button>
                    <span className="text-xs text-zinc-500">
                      {selected.size} / {selectableCount} 已选
                    </span>
                  </div>
                ) : null}

                <div className="space-y-1">
                  {items.map((item) => (
                    <label
                      key={String(item.id)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                        item.alreadyImported
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.alreadyImported || selected.has(item.id)}
                        disabled={item.alreadyImported}
                        onChange={() => toggle(item.id)}
                        className="h-4 w-4 shrink-0 rounded accent-blue-600"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{item.name}</div>
                        <div className="truncate text-xs text-zinc-500">{item.detail}</div>
                      </div>
                      {item.alreadyImported ? (
                        <span className="shrink-0 text-xs text-zinc-400">已导入</span>
                      ) : null}
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="border-t border-zinc-200 px-5 pb-5 pt-4 dark:border-zinc-800">
            {error && items.length > 0 ? (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            ) : null}
            {result ? (
              <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                {result}
              </div>
            ) : null}
            <div className="flex justify-end gap-3">
              <Dialog.Close asChild>
                <Button type="button">关闭</Button>
              </Dialog.Close>
              <Button
                type="button"
                tone="blue"
                disabled={selected.size === 0 || importing || loading}
                onClick={handleImport}
              >
                {importing ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    导入中…
                  </>
                ) : (
                  `导入选中 (${selected.size})`
                )}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
