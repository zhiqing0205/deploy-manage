"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useFormStatus } from "react-dom";

import { Button, Spinner } from "@/components/ui";

export function ConfirmSubmitButton({
  children,
  confirmText,
  tone = "red",
}: {
  children: string;
  confirmText: string;
  tone?: "red" | "zinc";
}) {
  const { pending } = useFormStatus();

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button type="button" tone={tone === "red" ? "red" : "zinc"} disabled={pending}>
          {children}
        </Button>
      </Dialog.Trigger>

      <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(520px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl outline-none dark:border-zinc-800 dark:bg-zinc-950">
        <Dialog.Title className="text-base font-semibold tracking-tight">
          确认操作
        </Dialog.Title>
        <Dialog.Description className="mt-2 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">
          {confirmText}
        </Dialog.Description>

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <Dialog.Close asChild>
            <Button type="button">取消</Button>
          </Dialog.Close>
          <Button type="submit" tone={tone === "red" ? "red" : "zinc"} disabled={pending}>
            {pending ? (
              <>
                <Spinner className="h-4 w-4" />
                处理中…
              </>
            ) : (
              "确认"
            )}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
