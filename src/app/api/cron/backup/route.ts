import { NextResponse } from "next/server";

import { getEnv } from "@/lib/env";
import { getWebDavConfig, getSetting, setSetting } from "@/lib/data";
import { exportDataAction } from "@/app/actions/settings";
import { uploadToWebDav, cleanupOldBackups } from "@/lib/api/webdav";

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
    const config = await getWebDavConfig();
    if (!config) {
      return NextResponse.json({ error: "WebDAV not configured" }, { status: 500 });
    }

    const body = await exportDataAction();
    const now = new Date().toISOString().replace(/:/g, "-").replace(/\.\d+Z$/, "Z");
    const filename = `deploy-manage-${now}.json`;
    await uploadToWebDav(filename, body, config);

    // Record backup history
    await setSetting("last_backup_at", new Date().toISOString());
    await setSetting("last_backup_status", "ok");
    await setSetting("last_backup_filename", filename);

    // Cleanup old backups if retention is configured
    const retention = await getSetting("webdav_retention");
    if (retention) {
      const max = parseInt(retention, 10);
      if (max > 0) await cleanupOldBackups(config, max);
    }

    return NextResponse.json({ ok: true, filename });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    // Record failed backup
    await setSetting("last_backup_at", new Date().toISOString());
    await setSetting("last_backup_status", `error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
