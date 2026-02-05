"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { ActionState } from "@/lib/action-state";
import { createServer, deleteServer, updateServer } from "@/lib/data";
import { parseTags } from "@/lib/text";

function getRequired(formData: FormData, key: string): string {
  const v = formData.get(key);
  if (typeof v !== "string") return "";
  return v.trim();
}

function getOptional(formData: FormData, key: string): string | undefined {
  const v = formData.get(key);
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? t : undefined;
}

const ServerInputSchema = z.object({
  name: z.string().trim().min(1, "请输入服务器名称。"),
  host: z.string().trim().optional(),
  provider: z.string().trim().optional(),
  region: z.string().trim().optional(),
  panelUrl: z.string().trim().url("1Panel 地址必须是有效 URL。").optional(),
  tags: z.array(z.string().trim().min(1)).catch([]),
  notes: z.string().catch(""),
});

export async function createServerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    name: getRequired(formData, "name"),
    host: getOptional(formData, "host"),
    provider: getOptional(formData, "provider"),
    region: getOptional(formData, "region"),
    panelUrl: getOptional(formData, "panelUrl"),
    tags: parseTags(getRequired(formData, "tags")),
    notes: getRequired(formData, "notes"),
  };

  const parsed = ServerInputSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "表单校验失败。" };

  try {
    const server = await createServer({
      ...parsed.data,
      tags: parsed.data.tags ?? [],
    });
    revalidatePath("/servers");
    redirect(`/servers/${server.id}`);
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "创建失败。" };
  }
}

export async function updateServerAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    name: getRequired(formData, "name"),
    host: getOptional(formData, "host"),
    provider: getOptional(formData, "provider"),
    region: getOptional(formData, "region"),
    panelUrl: getOptional(formData, "panelUrl"),
    tags: parseTags(getRequired(formData, "tags")),
    notes: getRequired(formData, "notes"),
  };

  const parsed = ServerInputSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "表单校验失败。" };

  try {
    await updateServer(id, parsed.data);
    revalidatePath("/servers");
    revalidatePath(`/servers/${id}`);
    redirect(`/servers/${id}`);
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "更新失败。" };
  }
}

export async function deleteServerAction(id: string): Promise<void> {
  await deleteServer(id);
  revalidatePath("/servers");
  revalidatePath("/services");
  redirect("/servers");
}

