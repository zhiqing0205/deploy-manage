"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { ActionState } from "@/lib/action-state";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

const LoginSchema = z.object({
  username: z.string().trim().min(1, "请输入用户名。"),
  password: z.string().trim().min(1, "请输入密码。"),
  next: z.string().trim().optional(),
});

function getText(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

function normalizeNextPath(nextPath: string | undefined): string {
  if (!nextPath) return "/";
  if (!nextPath.startsWith("/")) return "/";
  // prevent open redirect
  if (nextPath.startsWith("//")) return "/";
  return nextPath;
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = LoginSchema.safeParse({
    username: getText(formData, "username"),
    password: getText(formData, "password"),
    next: getText(formData, "next") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "表单校验失败。" };

  const envUser = process.env.BASIC_AUTH_USER?.trim();
  const envPass = process.env.BASIC_AUTH_PASSWORD?.trim();
  if (!envUser || !envPass) {
    // auth disabled -> treat as success
    redirect(normalizeNextPath(parsed.data.next));
  }

  if (parsed.data.username !== envUser || parsed.data.password !== envPass) {
    return { error: "用户名或密码不正确。" };
  }

  const token = createSessionToken({
    username: envUser,
    secret: envPass,
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  redirect(normalizeNextPath(parsed.data.next));
}

export async function logoutAction(): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  redirect("/login");
}
