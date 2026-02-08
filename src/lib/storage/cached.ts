import { LocalJsonStore } from "@/lib/storage/local";
import type { DataFile } from "@/lib/model";
import type { DataStore, ReadResult, WriteOptions } from "@/lib/storage/types";

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * CachedStore wraps a remote DataStore with a local file cache.
 *
 * - Self-hosted: reads/writes on local file, background timer syncs to remote.
 * - Vercel (serverless): reads from /tmp cache when warm, writes go to both
 *   /tmp and remote immediately (write-through) since setInterval is unreliable
 *   and /tmp is ephemeral.
 */
export class CachedStore implements DataStore {
  private local: LocalJsonStore;
  private remote: DataStore;
  private dirty = false;
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private initPromise: Promise<void> | null = null;
  private serverless: boolean;

  constructor(remote: DataStore, cachePath: string) {
    this.remote = remote;
    this.serverless = Boolean(process.env.VERCEL);
    const resolvedPath = this.serverless ? `/tmp/${cachePath}` : cachePath;
    this.local = new LocalJsonStore(resolvedPath);
  }

  async read(): Promise<ReadResult> {
    await this.ensureInit();
    return this.local.read();
  }

  async write(data: DataFile, options?: WriteOptions): Promise<{ etag?: string }> {
    await this.ensureInit();
    const result = await this.local.write(data, options);
    if (this.serverless) {
      // Write-through: push to remote immediately (setInterval unreliable)
      try {
        await this.remote.write(data);
      } catch (err) {
        console.error("[CachedStore] 写穿透到远程失败:", err);
      }
    } else {
      this.dirty = true;
    }
    return result;
  }

  private ensureInit(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.init();
    }
    return this.initPromise;
  }

  private async init(): Promise<void> {
    // Try reading local cache first
    let hasLocal = false;
    try {
      const local = await this.local.read();
      const d = local.data;
      if (d.servers.length > 0 || d.services.length > 0 || d.domainOrder.length > 0) {
        hasLocal = true;
      }
    } catch {
      // no local cache
    }

    if (!hasLocal) {
      // Seed from remote
      try {
        const remote = await this.remote.read();
        await this.local.write(remote.data);
      } catch {
        // Remote also unavailable; local will use empty defaults
      }
    }

    // Only start background sync for long-lived processes (not serverless)
    if (!this.serverless) {
      this.startSync();
    }
  }

  private startSync(): void {
    if (this.syncTimer) return;
    this.syncTimer = setInterval(() => {
      this.syncToRemote().catch((err) => {
        console.error("[CachedStore] 同步到远程失败:", err);
      });
    }, SYNC_INTERVAL_MS);
    // Don't prevent process exit
    if (this.syncTimer && typeof this.syncTimer === "object" && "unref" in this.syncTimer) {
      (this.syncTimer as NodeJS.Timeout).unref();
    }
  }

  private async syncToRemote(): Promise<void> {
    if (!this.dirty) return;
    try {
      const { data } = await this.local.read();
      await this.remote.write(data);
      this.dirty = false;
      console.log("[CachedStore] 已同步到远程。");
    } catch (err) {
      console.error("[CachedStore] 同步到远程失败:", err);
    }
  }
}
