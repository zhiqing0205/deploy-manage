import { NextResponse } from "next/server";

import { readDataFile } from "@/lib/data";

export async function GET() {
  const { data } = await readDataFile();
  const body = JSON.stringify(data, null, 2) + "\n";

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"deploy-manage-data.json\"",
    },
  });
}
