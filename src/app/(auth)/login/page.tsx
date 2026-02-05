import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/forms/LoginForm";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

type SearchParams = {
  next?: string | string[];
};

function pickFirst(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

function normalizeNextPath(nextPath: string | undefined): string {
  if (!nextPath) return "/";
  if (!nextPath.startsWith("/")) return "/";
  if (nextPath.startsWith("//")) return "/";
  return nextPath;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const envUser = process.env.BASIC_AUTH_USER?.trim();
  const envPass = process.env.BASIC_AUTH_PASSWORD?.trim();

  // If auth disabled, redirect to app directly.
  if (!envUser || !envPass) redirect("/");

  const sp = (await searchParams) ?? {};
  const nextPath = normalizeNextPath(pickFirst(sp.next));

  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    const session = verifySessionToken({ token, secret: envPass });
    if (session) redirect(nextPath);
  }

  return <LoginForm nextPath={nextPath} />;
}

