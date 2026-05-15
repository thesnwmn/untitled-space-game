declare module 'fs' {
  interface Dirent {
    name: string;
    isDirectory(): boolean;
  }
  export function readdirSync(path: string, options: { withFileTypes: true }): Dirent[];
  export function readFileSync(path: string, encoding: string): string;
}

declare module 'path' {
  export function join(...paths: string[]): string;
}

declare const process: {
  cwd(): string;
  exit(code?: number): void;
  stdin: NodeJS.ReadableStream;
  stdout: { rows?: number };
};

declare namespace NodeJS {
  interface ReadableStream {
    setRawMode(mode: boolean): this;
    resume(): this;
    setEncoding(encoding: string): this;
    on(event: string, listener: (...args: any[]) => void): this;
    removeListener(event: string, listener: (...args: any[]) => void): this;
  }
}

interface ImportMeta {
  glob(pattern: string, options?: { eager?: boolean; as?: string; query?: string; import?: string }): Record<string, any>;
}

declare module 'js-yaml' {
  export function safeLoad(str: string, options?: unknown): unknown;
}
