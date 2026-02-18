import { contextBridge, ipcRenderer } from "electron";

declare global {
  interface Window {
    ipc: {
      invoke<K extends string>(
        channel: K,
        args: unknown
      ): Promise<unknown>;
      on(channel: string, handler: (event: unknown, data: unknown) => void): () => void;
    };
  }
}

const ipc = {
  invoke<K extends string>(channel: K, args: unknown): Promise<unknown> {
    return ipcRenderer.invoke(channel, args);
  },

  on(channel: string, handler: (event: unknown, data: unknown) => void): () => void {
    const listener = (_event: unknown, data: unknown) => handler(_event, data);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
};

contextBridge.exposeInMainWorld("ipc", ipc);
