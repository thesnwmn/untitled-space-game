declare const process: {
  on(event: string, listener: () => void): void;
  exit(code?: number): never;
  stdout: {
    columns: number | undefined;
    rows: number | undefined;
  };
  stdin: {
    isTTY?: boolean;
    setRawMode?(flag: boolean): void;
    resume(): void;
    on(event: 'data', listener: (chunk: { toString(): string }) => void): void;
    removeListener(event: 'data', listener: (chunk: { toString(): string }) => void): void;
  };
};
