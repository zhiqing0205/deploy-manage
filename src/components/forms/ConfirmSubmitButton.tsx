"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui";

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
    <Button
      type="submit"
      tone={tone === "red" ? "red" : "zinc"}
      disabled={pending}
      onClick={(e) => {
        if (pending) return;
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      {pending ? "处理中…" : children}
    </Button>
  );
}

