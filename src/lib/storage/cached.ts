import { LocalJsonStore } from "@/lib/storage/local";
import type { DataFile } from "@/lib/model";
import type { DataStore, ReadResult, WriteOptions } from "@/lib/storage/types";

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export class CachedStore implements DataStore {
  private local: LocalJsonStore;
  private remote: DataStore;
  private dirty = false;
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private initPromise: Promise<void> | null = null;

  constructor(remote: DataStore, cachePath: string) {
    this.remote = remote;
    this.local = new LocalJsonStore(cachePath);
  }

  async read(): Promise<ReadResult> {
    await this.ensureInit();
    return this.local.read();
  }

  async write(data: DataFile, options?: WriteOptions): Promise<{ etag?: string }> {
    await this.ensureInit();
    const result = await this.local.write(data, options);
    this.dirty = true;
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

    this.startSync();
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
