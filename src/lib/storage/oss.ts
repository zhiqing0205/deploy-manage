import OSS from "ali-oss";

import { DataFileSchema, type DataFile } from "@/lib/model";
import type { DataStore, ReadResult, WriteOptions } from "@/lib/storage/types";

function emptyData(): DataFile {
  return DataFileSchema.parse({ version: 1, servers: [], services: [] });
}

function asErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function isNoSuchKey(err: unknown): boolean {
  const e = err as { code?: string; name?: string; status?: number };
  return e?.code === "NoSuchKey" || e?.name === "NoSuchKeyError" || e?.status === 404;
}

export class OssJsonStore implements DataStore {
  private client: OSS;

  constructor(
    opts: {
      region: string;
      accessKeyId: string;
      accessKeySecret: string;
      bucket: string;
      endpoint?: string;
    },
    private readonly objectKey: string,
  ) {
    this.client = new OSS({
      region: opts.region,
      accessKeyId: opts.accessKeyId,
      accessKeySecret: opts.accessKeySecret,
      bucket: opts.bucket,
      endpoint: opts.endpoint,
    });
  }

  async read(): Promise<ReadResult> {
    try {
      const res = await this.client.get(this.objectKey);
      const raw = res.content?.toString?.("utf8") ?? String(res.content ?? "");
      const parsed = DataFileSchema.safeParse(JSON.parse(raw || "{}"));
      const headers = (res.res as unknown as { headers?: Record<string, unknown> })?.headers;
      const etag =
        (typeof headers?.etag === "string" ? headers.etag : undefined) ??
        (typeof headers?.ETag === "string" ? headers.ETag : undefined);
      return { data: parsed.success ? parsed.data : emptyData(), etag };
    } catch (err: unknown) {
      if (isNoSuchKey(err)) {
        await this.write(emptyData());
        return { data: emptyData() };
      }
      throw new Error(`OSS 读取失败：${asErrorMessage(err)}`);
    }
  }

  async write(data: DataFile, options?: WriteOptions): Promise<{ etag?: string }> {
    const next = DataFileSchema.parse(data);
    const headers: Record<string, string> = {
      "Content-Type": "application/json; charset=utf-8",
    };
    if (options?.etag) headers["If-Match"] = options.etag;

    try {
      const res = await this.client.put(
        this.objectKey,
        Buffer.from(JSON.stringify(next, null, 2) + "\n", "utf8"),
        { headers },
      );
      const resHeaders = (res.res as unknown as { headers?: Record<string, unknown> })?.headers;
      const etag =
        (typeof resHeaders?.etag === "string" ? resHeaders.etag : undefined) ??
        (typeof resHeaders?.ETag === "string" ? resHeaders.ETag : undefined);
      return { etag };
    } catch (err: unknown) {
      throw new Error(`OSS 写入失败：${asErrorMessage(err)}`);
    }
  }
}
