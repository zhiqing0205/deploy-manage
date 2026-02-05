import type { DataFile } from "@/lib/model";

export type ReadResult = {
  data: DataFile;
  etag?: string;
};

export type WriteOptions = {
  etag?: string;
};

export interface DataStore {
  read(): Promise<ReadResult>;
  write(data: DataFile, options?: WriteOptions): Promise<{ etag?: string }>;
}

