import { ipcMain, BrowserWindow } from "electron";
import type { FSWatcher } from "chokidar";
import {
  getRoot,
  readdir,
  readFile,
  writeFile,
  mkdir,
  rename,
  remove,
  exists,
  stat,
  createWorkspaceWatcher,
  FSModelConfigRepo,
  testModelConnection,
} from "@lore/core";
import { WorkspaceChangeEvent, LlmModelConfig } from "@lore/shared";
import type { z } from "zod";

let watcher: FSWatcher | null = null;
const changeQueue = new Set<string>();
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function emitWorkspaceChange(
  event: z.infer<typeof WorkspaceChangeEvent>
): void {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed() && win.webContents) {
      win.webContents.send("workspace:didChange", event);
    }
  }
}

function processChangeQueue(): void {
  if (changeQueue.size === 0) return;
  const paths = Array.from(changeQueue);
  changeQueue.clear();
  if (paths.length === 1) {
    emitWorkspaceChange({ type: "changed", path: paths[0]! });
  } else {
    emitWorkspaceChange({ type: "bulkChanged", paths });
  }
}

function queueChange(relPath: string): void {
  changeQueue.add(relPath);
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    processChangeQueue();
    debounceTimer = null;
  }, 150);
}

function handleWorkspaceChange(
  event: z.infer<typeof WorkspaceChangeEvent>
): void {
  if (event.type === "changed" && event.path) {
    queueChange(event.path);
  } else {
    emitWorkspaceChange(event);
  }
}

const modelRepo = new FSModelConfigRepo();

export function setupIpcHandlers(): void {
  // App
  ipcMain.handle("app:getVersions", () => ({
    chrome: process.versions.chrome,
    node: process.versions.node,
    electron: process.versions.electron,
  }));

  // Workspace
  ipcMain.handle("workspace:getRoot", async () => getRoot());
  ipcMain.handle("workspace:exists", async (_, { path: p }) => exists(p));
  ipcMain.handle("workspace:stat", async (_, { path: p }) => stat(p));
  ipcMain.handle("workspace:readdir", async (_, { path: p, opts }) =>
    readdir(p, opts)
  );
  ipcMain.handle("workspace:readFile", async (_, { path: p, encoding }) =>
    readFile(p, encoding)
  );
  ipcMain.handle("workspace:writeFile", async (_, { path: p, data, opts }) =>
    writeFile(p, data, opts)
  );
  ipcMain.handle("workspace:mkdir", async (_, { path: p, recursive }) =>
    mkdir(p, recursive)
  );
  ipcMain.handle("workspace:rename", async (_, { from, to, overwrite }) =>
    rename(from, to, overwrite)
  );
  ipcMain.handle("workspace:remove", async (_, { path: p, opts }) =>
    remove(p, opts)
  );

  // Models
  ipcMain.handle("models:list", async () => {
    await modelRepo.ensureConfig();
    const config = await modelRepo.getConfig();
    return {
      providers: [
        {
          id: config.provider.flavor,
          name: config.provider.flavor,
          models: [{ id: config.model, name: config.model }],
        },
      ],
    };
  });
  ipcMain.handle("models:test", async (_, config) => {
    const parsed = LlmModelConfig.parse(config);
    return testModelConnection(parsed.provider, parsed.model);
  });
  ipcMain.handle("models:saveConfig", async (_, config) => {
    const parsed = LlmModelConfig.parse(config);
    await modelRepo.setConfig(parsed);
    return { success: true };
  });

  // Start workspace watcher
  startWorkspaceWatcher();
}

async function startWorkspaceWatcher(): Promise<void> {
  if (watcher) return;
  watcher = await createWorkspaceWatcher(handleWorkspaceChange);
}
