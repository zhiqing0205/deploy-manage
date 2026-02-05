import path from "node:path";

import { createClient, type WebDAVClient } from "webdav";

import { DataFileSchema, type DataFile } from "@/lib/model";
import type { DataStore, ReadResult, WriteOptions } from "@/lib/storage/types";

function emptyData(): DataFile {
  return DataFileSchema.parse({ version: 1, servers: [], services: [] });
}

function asErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function isNotFound(err: unknown): boolean {
  const e = err as { status?: number; response?: { status?: number } };
  return e?.status === 404 || e?.response?.status === 404;
}

function tryGetEtag(stat: unknown): string | undefined {
  const s = stat as { etag?: string; extra?: { etag?: string } };
  return s?.etag ?? s?.extra?.etag;
}

export class WebDavJsonStore implements DataStore {
  private client: WebDAVClient;

  constructor(
    url: string,
    username: string | undefined,
    password: string | undefined,
    private readonly filePath: string,
  ) {
    this.client = createClient(url, username ? { username, password } : undefined);
  }

  async read(): Promise<ReadResult> {
    try {
      const raw = await this.client.getFileContents(this.filePath, {
        format: "text",
      });
      const parsed = DataFileSchema.safeParse(JSON.parse(String(raw)));
      const stat = await this.client.stat(this.filePath);
      return {
        data: parsed.success ? parsed.data : emptyData(),
        etag: tryGetEtag(stat),
      };
    } catch (err: unknown) {
      if (isNotFound(err)) {
        await this.ensureDir();
        await this.write(emptyData());
        return { data: emptyData() };
      }
      throw new Error(`WebDAV 读取失败：${asErrorMessage(err)}`);
    }
  }

  async write(data: DataFile, options?: WriteOptions): Promise<{ etag?: string }> {
    const next = DataFileSchema.parse(data);
    await this.ensureDir();

    const headers: Record<string, string> = {
      "Content-Type": "application/json; charset=utf-8",
    };
    if (options?.etag) headers["If-Match"] = options.etag;

    try {
      await this.client.putFileContents(
        this.filePath,
        JSON.stringify(next, null, 2) + "\n",
        {
          overwrite: true,
          headers,
        },
      );
      const stat = await this.client.stat(this.filePath);
      return { etag: tryGetEtag(stat) };
    } catch (err: unknown) {
      throw new Error(`WebDAV 写入失败：${asErrorMessage(err)}`);
    }
  }

  private async ensureDir(): Promise<void> {
    const dir = path.posix.dirname(this.filePath);
    if (dir === "/" || dir === ".") return;
    try {
      const exists = await this.client.exists(dir);
      if (!exists) await this.client.createDirectory(dir, { recursive: true });
    } catch {
      // If server doesn't like recursive, try best effort create.
      try {
        await this.client.createDirectory(dir);
      } catch {
        // ignore
      }
    }
  }
}

