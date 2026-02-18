/// <reference types="vite/client" />

interface Window {
  ipc: {
    invoke<K extends string>(channel: K, args: unknown): Promise<unknown>;
    on(
      channel: string,
      handler: (event: unknown, data: unknown) => void
    ): () => void;
  };
}
