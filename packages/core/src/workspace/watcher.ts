import chokidar, { type FSWatcher } from "chokidar";
import fs from "node:fs/promises";
import type { Stats } from "node:fs";
import { ensureWorkspaceRoot, absToRelPosix } from "./workspace.js";
import { WorkDir } from "../config/config.js";
import { WorkspaceChangeEvent } from "@lore/shared";
import type { z } from "zod";

export type WorkspaceChangeCallback = (
  event: z.infer<typeof WorkspaceChangeEvent>
) => void;

export async function createWorkspaceWatcher(
  callback: WorkspaceChangeCallback
): Promise<FSWatcher> {
  await ensureWorkspaceRoot();

  const watcher = chokidar.watch(WorkDir, {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 150,
      pollInterval: 50,
    },
  });

  watcher
    .on("add", (absPath: string) => {
      const relPath = absToRelPosix(absPath);
      if (relPath) {
        fs.lstat(absPath)
          .then((stats: Stats) => {
            const kind = stats.isDirectory() ? "dir" : "file";
            callback({ type: "created", path: relPath, kind });
          })
          .catch(() => {});
      }
    })
    .on("addDir", (absPath: string) => {
      const relPath = absToRelPosix(absPath);
      if (relPath) {
        callback({ type: "created", path: relPath, kind: "dir" });
      }
    })
    .on("change", (absPath: string) => {
      const relPath = absToRelPosix(absPath);
      if (relPath) {
        callback({ type: "changed", path: relPath });
      }
    })
    .on("unlink", (absPath: string) => {
      const relPath = absToRelPosix(absPath);
      if (relPath) {
        callback({ type: "deleted", path: relPath, kind: "file" });
      }
    })
    .on("unlinkDir", (absPath: string) => {
      const relPath = absToRelPosix(absPath);
      if (relPath) {
        callback({ type: "deleted", path: relPath, kind: "dir" });
      }
    })
    .on("error", (error: unknown) => {
      console.error("Workspace watcher error:", error);
    });

  return watcher;
}
