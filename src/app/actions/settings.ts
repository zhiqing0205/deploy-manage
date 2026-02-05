"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ActionState } from "@/lib/action-state";
import { readDataFile, writeDataFile } from "@/lib/data";
import { DataFileSchema } from "@/lib/model";

function asErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export async function importDataAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "请选择要导入的 JSON 文件。" };

  const text = await file.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { error: "JSON 解析失败，请检查文件格式。" };
  }

  const parsed = DataFileSchema.safeParse(json);
  if (!parsed.success) return { error: "数据结构不符合要求，无法导入。" };

  try {
    // Force write (skip etag) to support one-shot recovery/import.
    await writeDataFile(parsed.data);
    revalidatePath("/");
    revalidatePath("/servers");
    revalidatePath("/services");
    revalidatePath("/settings");
    redirect("/settings?import=ok");
  } catch (err: unknown) {
    return { error: `导入失败：${asErrorMessage(err)}` };
  }
}

export async function exportDataAction(): Promise<string> {
  const { data } = await readDataFile();
  return JSON.stringify(data, null, 2) + "\n";
}

