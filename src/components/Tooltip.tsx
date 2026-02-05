"use client";

import type { ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

export function Tooltip({
  content,
  children,
}: {
  content: ReactNode;
  children: ReactNode;
}) {
  return (
    <TooltipPrimitive.Provider delayDuration={250}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            sideOffset={8}
            className={cn(
              "z-50 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700 shadow-lg",
              "opacity-0 transition-opacity duration-150 data-[state=delayed-open]:opacity-100",
              "dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200",
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-white dark:fill-zinc-950" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
