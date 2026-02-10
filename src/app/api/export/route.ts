import { NextResponse } from "next/server";

import { exportDataAction } from "@/app/actions/settings";

export async function GET() {
  const body = await exportDataAction();

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"deploy-manage-data.json\"",
    },
  });
}
