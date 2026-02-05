import fs from "node:fs/promises";
import path from "node:path";

import { DataFileSchema, type DataFile } from "@/lib/model";
import type { DataStore, ReadResult, WriteOptions } from "@/lib/storage/types";

function emptyData(): DataFile {
  return DataFileSchema.parse({ version: 1, servers: [], services: [] });
}

export class LocalJsonStore implements DataStore {
  constructor(private readonly filePath: string) {}

  async read(): Promise<ReadResult> {
    try {
      const raw = await fs.readFile(this.filePath, "utf8");
      const parsed = DataFileSchema.safeParse(JSON.parse(raw));
      if (!parsed.success) return { data: emptyData() };
      const stat = await fs.stat(this.filePath);
      return { data: parsed.data, etag: String(stat.mtimeMs) };
    } catch (err: unknown) {
      const e = err as { code?: string };
      if (e?.code === "ENOENT") {
        await this.ensureDir();
        await this.write(emptyData());
        return { data: emptyData() };
      }
      throw err;
    }
  }

  async write(data: DataFile, options?: WriteOptions): Promise<{ etag?: string }> {
    const next = DataFileSchema.parse(data);
    await this.ensureDir();

    if (options?.etag) {
      try {
        const stat = await fs.stat(this.filePath);
        const current = String(stat.mtimeMs);
        if (current !== options.etag) {
          throw new Error(
            "数据已在其他地方更新（etag 不匹配）。请刷新后重试。",
          );
        }
      } catch (err: unknown) {
        const e = err as { code?: string };
        if (e?.code !== "ENOENT") throw err;
      }
    }

    await fs.writeFile(this.filePath, JSON.stringify(next, null, 2) + "\n", "utf8");
    const stat = await fs.stat(this.filePath);
    return { etag: String(stat.mtimeMs) };
  }

  private async ensureDir(): Promise<void> {
    const dir = path.dirname(this.filePath);
    await fs.mkdir(dir, { recursive: true });
  }
}

