declare const process: {
  on(event: string, listener: () => void): void;
  stdout: {
    columns: number | undefined;
    rows: number | undefined;
  };
};
