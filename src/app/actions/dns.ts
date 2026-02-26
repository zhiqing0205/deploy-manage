"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionState } from "@/lib/action-state";
import {
  createDnsRecord,
  updateDnsRecord,
  deleteDnsRecord as cfDeleteDnsRecord,
} from "@/lib/api/cloudflare";
import { deleteDomain } from "@/lib/data";

const DnsRecordInputSchema = z.object({
  type: z.string().trim().min(1, "请选择记录类型。"),
  name: z.string().trim().min(1, "请输入记录名称。"),
  content: z.string().trim().min(1, "请输入记录内容。"),
  proxied: z.boolean().catch(false),
  ttl: z.number().int().min(1).catch(1),
  priority: z.number().int().min(0).optional(),
});

function getRequired(formData: FormData, key: string): string {
  const v = formData.get(key);
  if (typeof v !== "string") return "";
  return v.trim();
}

export async function createDnsRecordAction(
  zoneId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    type: getRequired(formData, "type"),
    name: getRequired(formData, "name"),
    content: getRequired(formData, "content"),
    proxied: formData.get("proxied") === "on",
    ttl: Number(getRequired(formData, "ttl")) || 1,
    priority: getRequired(formData, "priority") ? Number(getRequired(formData, "priority")) : undefined,
  };

  const parsed = DnsRecordInputSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "表单校验失败。" };

  try {
    await createDnsRecord(zoneId, parsed.data);
    revalidatePath(`/domains/${zoneId}`);
    return { ok: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "创建失败。" };
  }
}

export async function updateDnsRecordAction(
  zoneId: string,
  recordId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    type: getRequired(formData, "type"),
    name: getRequired(formData, "name"),
    content: getRequired(formData, "content"),
    proxied: formData.get("proxied") === "on",
    ttl: Number(getRequired(formData, "ttl")) || 1,
    priority: getRequired(formData, "priority") ? Number(getRequired(formData, "priority")) : undefined,
  };

  const parsed = DnsRecordInputSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "表单校验失败。" };

  try {
    await updateDnsRecord(zoneId, recordId, parsed.data);
    revalidatePath(`/domains/${zoneId}`);
    revalidatePath("/domains");
    return { ok: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "更新失败。" };
  }
}

export async function deleteDnsRecordAction(zoneId: string, recordId: string): Promise<void> {
  await cfDeleteDnsRecord(zoneId, recordId);
  revalidatePath(`/domains/${zoneId}`);
  revalidatePath("/domains");
}

export async function deleteDomainAction(id: string): Promise<void> {
  await deleteDomain(id);
  revalidatePath("/domains");
}

