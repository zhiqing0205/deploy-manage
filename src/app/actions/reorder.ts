"use server";

import { revalidatePath } from "next/cache";
import { reorderServers, reorderServices } from "@/lib/data";

export async function reorderServersAction(ids: string[]): Promise<void> {
  await reorderServers(ids);
  revalidatePath("/servers");
  revalidatePath("/");
}

export async function reorderServicesAction(ids: string[]): Promise<void> {
  await reorderServices(ids);
  revalidatePath("/services");
  revalidatePath("/");
}
