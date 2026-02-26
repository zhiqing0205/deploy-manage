import { NextResponse } from "next/server";

import { getEnv } from "@/lib/env";
import { exportDataAction } from "@/app/actions/settings";
import { uploadToWebDav } from "@/lib/api/webdav";

export async function GET(request: Request) {
  const env = getEnv();
  if (!env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await exportDataAction();
    const now = new Date().toISOString().replace(/:/g, "-").replace(/\.\d+Z$/, "Z");
    const filename = `deploy-manage-${now}.json`;
    await uploadToWebDav(filename, body);
    return NextResponse.json({ ok: true, filename });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
