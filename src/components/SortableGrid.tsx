"use client";

import { GripVertical } from "lucide-react";
import React, {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

export function SortableGrid({
  children,
  onReorder,
  className,
  disabled,
}: {
  children: React.ReactNode;
  onReorder: (ids: string[]) => Promise<void>;
  className?: string;
  disabled?: boolean;
}) {
  const childEntries: { id: string; element: React.ReactNode }[] = [];
  for (const child of Children.toArray(children)) {
    if (isValidElement(child)) {
      const props = child.props as Record<string, unknown>;
      if (typeof props["data-sort-id"] === "string") {
        childEntries.push({ id: props["data-sort-id"], element: child });
      }
    }
  }

  const [order, setOrder] = useState(() => childEntries.map((e) => e.id));
  const [saving, startTransition] = useTransition();
  const dragIdxRef = useRef<number | null>(null);
  const orderRef = useRef(order);
  orderRef.current = order;

  const childIds = childEntries.map((e) => e.id).join("\n");
  useEffect(() => {
    setOrder(childEntries.map((e) => e.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childIds]);

  const childMap = new Map(childEntries.map((e) => [e.id, e.element]));

  if (disabled) {
    return (
      <div className={className}>
        {childEntries.map((e) => (
          <div key={e.id}>{e.element}</div>
        ))}
      </div>
    );
  }

  function handleDragStart(e: React.DragEvent, idx: number) {
    dragIdxRef.current = idx;
    e.dataTransfer.effectAllowed = "move";
    const el = e.currentTarget as HTMLElement;
    requestAnimationFrame(() => el.classList.add("opacity-50"));
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const from = dragIdxRef.current;
    if (from === null || from === idx) return;

    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(idx, 0, moved);
      dragIdxRef.current = idx;
      return next;
    });
  }

  function handleDragEnd(e: React.DragEvent) {
    (e.currentTarget as HTMLElement).classList.remove("opacity-50");
    dragIdxRef.current = null;
    const finalOrder = orderRef.current;
    startTransition(async () => {
      await onReorder(finalOrder);
    });
  }

  return (
    <div className={className}>
      {order.map((id, idx) => (
        <div
          key={id}
          draggable
          onDragStart={(e) => handleDragStart(e, idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDragEnd={handleDragEnd}
          className={`group/sortable transition-opacity ${saving ? "pointer-events-none opacity-60" : ""}`}
        >
          <div className="relative">
            <div className="absolute right-2 top-2 z-10 cursor-grab rounded p-0.5 text-zinc-300 opacity-0 transition-all group-hover/sortable:opacity-100 active:cursor-grabbing dark:text-zinc-600 dark:hover:text-zinc-400">
              <GripVertical className="h-4 w-4" />
            </div>
            {childMap.get(id)}
          </div>
        </div>
      ))}
    </div>
  );
}
