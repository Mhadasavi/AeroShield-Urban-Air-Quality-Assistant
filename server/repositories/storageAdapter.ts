import fs from 'fs';
import path from 'path';

export interface StorageAdapter<T> {
  read(): T | null;
  write(data: T): void;
  clear(): void;
}

export class MemoryStorageAdapter<T> implements StorageAdapter<T> {
  private snapshot: string | null = null;

  constructor(initialData?: T) {
    if (initialData !== undefined) {
      this.snapshot = JSON.stringify(initialData);
    }
  }

  read(): T | null {
    if (this.snapshot === null) return null;
    return JSON.parse(this.snapshot) as T;
  }

  write(data: T): void {
    this.snapshot = JSON.stringify(data);
  }

  clear(): void {
    this.snapshot = null;
  }
}

export class FileStorageAdapter<T> implements StorageAdapter<T> {
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  read(): T | null {
    try {
      if (!fs.existsSync(this.filePath)) return null;
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      if (!raw.trim()) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  write(data: T): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempPath = `${this.filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, this.filePath);
  }

  clear(): void {
    if (fs.existsSync(this.filePath)) {
      fs.unlinkSync(this.filePath);
    }
  }
}
