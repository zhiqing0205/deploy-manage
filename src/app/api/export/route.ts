import { NextResponse } from "next/server";

import { exportDataAction } from "@/app/actions/settings";

export async function GET() {
  const body = await exportDataAction();
  const now = new Date().toISOString().replace(/:/g, "-").replace(/\.\d+Z$/, "Z");
  const filename = `deploy-manage-${now}.json`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
