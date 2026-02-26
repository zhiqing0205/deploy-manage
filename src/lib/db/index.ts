import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import path from "node:path";

import * as schema from "./schema";

let _db: ReturnType<typeof drizzle<typeof schema>> | undefined;
let _migrated = false;

export function getDb() {
  if (_db) return _db;

  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("缺少 TURSO_DATABASE_URL 环境变量。");

  _db = drizzle({
    connection: {
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    },
    schema,
  });

  return _db;
}

export async function getDbWithMigrate() {
  const db = getDb();
  if (!_migrated) {
    await migrate(db, {
      migrationsFolder: path.join(process.cwd(), "drizzle"),
    });
    _migrated = true;
  }
  return db;
}
