"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { ActionState } from "@/lib/action-state";
import { createService, deleteService, updateService } from "@/lib/data";
import { DeploymentTypeSchema, ProxyTypeSchema, UrlItemSchema } from "@/lib/model";
import { parseTags, parseUrlList } from "@/lib/text";

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

const ServiceInputSchema = z.object({
  name: z.string().trim().min(1, "请输入应用名称。"),
  description: z.string().catch(""),
  serverId: z.string().trim().min(1).optional(),
  status: z.enum(["active", "paused", "archived"]).catch("active"),
  deploymentType: DeploymentTypeSchema.catch("other"),
  repoUrl: z.string().trim().url("Repo 必须是有效 URL。").optional(),
  urls: z.array(UrlItemSchema).min(1, "至少填写一个访问地址。"),
  managementUrls: z.array(UrlItemSchema).catch([]),
  healthcheckUrl: z.string().trim().url("健康检查必须是有效 URL。").optional(),
  tags: z.array(z.string().trim().min(1)).catch([]),
  notes: z.string().catch(""),

  proxyType: ProxyTypeSchema.catch("none"),
  proxyUpstream: z.string().trim().optional(),
  proxyRules: z.string().catch(""),

  dockerContainerName: z.string().trim().optional(),
  dockerComposePath: z.string().trim().optional(),

  vercelProject: z.string().trim().optional(),
});

function buildServicePatch(input: z.infer<typeof ServiceInputSchema>) {
  const proxy =
    input.proxyType !== "none" || input.proxyUpstream || input.proxyRules
      ? {
          type: input.proxyType,
          upstream: input.proxyUpstream,
          rules: input.proxyRules ?? "",
        }
      : undefined;

  const docker =
    input.dockerContainerName || input.dockerComposePath
      ? {
          containerName: input.dockerContainerName,
          composePath: input.dockerComposePath,
        }
      : undefined;

  const vercel = input.vercelProject ? { project: input.vercelProject } : undefined;

  return {
    name: input.name,
    description: input.description ?? "",
    serverId: input.serverId,
    status: input.status,
    deploymentType: input.deploymentType,
    repoUrl: input.repoUrl,
    urls: input.urls,
    managementUrls: input.managementUrls ?? [],
    healthcheckUrl: input.healthcheckUrl,
    tags: input.tags ?? [],
    notes: input.notes ?? "",
    proxy,
    docker,
    vercel,
  };
}

export async function createServiceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    name: getRequired(formData, "name"),
    description: getRequired(formData, "description"),
    serverId: getOptional(formData, "serverId"),
    status: getRequired(formData, "status"),
    deploymentType: getRequired(formData, "deploymentType"),
    repoUrl: getOptional(formData, "repoUrl"),
    urls: parseUrlList(getRequired(formData, "urlsText")),
    managementUrls: parseUrlList(getRequired(formData, "managementUrlsText")),
    healthcheckUrl: getOptional(formData, "healthcheckUrl"),
    tags: parseTags(getRequired(formData, "tags")),
    notes: getRequired(formData, "notes"),

    proxyType: getRequired(formData, "proxyType"),
    proxyUpstream: getOptional(formData, "proxyUpstream"),
    proxyRules: getRequired(formData, "proxyRules"),

    dockerContainerName: getOptional(formData, "dockerContainerName"),
    dockerComposePath: getOptional(formData, "dockerComposePath"),

    vercelProject: getOptional(formData, "vercelProject"),
  };

  const parsed = ServiceInputSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "表单校验失败。" };

  try {
    const service = await createService(buildServicePatch(parsed.data));
    revalidatePath("/services");
    redirect(`/services/${service.id}`);
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "创建失败。" };
  }
}

export async function updateServiceAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    name: getRequired(formData, "name"),
    description: getRequired(formData, "description"),
    serverId: getOptional(formData, "serverId"),
    status: getRequired(formData, "status"),
    deploymentType: getRequired(formData, "deploymentType"),
    repoUrl: getOptional(formData, "repoUrl"),
    urls: parseUrlList(getRequired(formData, "urlsText")),
    managementUrls: parseUrlList(getRequired(formData, "managementUrlsText")),
    healthcheckUrl: getOptional(formData, "healthcheckUrl"),
    tags: parseTags(getRequired(formData, "tags")),
    notes: getRequired(formData, "notes"),

    proxyType: getRequired(formData, "proxyType"),
    proxyUpstream: getOptional(formData, "proxyUpstream"),
    proxyRules: getRequired(formData, "proxyRules"),

    dockerContainerName: getOptional(formData, "dockerContainerName"),
    dockerComposePath: getOptional(formData, "dockerComposePath"),

    vercelProject: getOptional(formData, "vercelProject"),
  };

  const parsed = ServiceInputSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "表单校验失败。" };

  try {
    await updateService(id, buildServicePatch(parsed.data));
    revalidatePath("/services");
    revalidatePath(`/services/${id}`);
    redirect(`/services/${id}`);
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "更新失败。" };
  }
}

export async function deleteServiceAction(id: string): Promise<void> {
  await deleteService(id);
  revalidatePath("/services");
  redirect("/services");
}

