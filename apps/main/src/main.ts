import { app, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setupIpcHandlers } from "./ipc.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const preloadPath = app.isPackaged
  ? path.join(__dirname, "../preload/dist/preload.js")
  : path.join(__dirname, "../../preload/dist/preload.js");

const rendererPath = app.isPackaged
  ? path.join(__dirname, "../renderer/dist")
  : path.join(__dirname, "../../renderer/dist");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    backgroundColor: "#252525",
    titleBarStyle: "hiddenInset",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: preloadPath,
    },
  });

  win.once("ready-to-show", () => {
    win.show();
  });

  if (app.isPackaged) {
    win.loadFile(path.join(rendererPath, "index.html"));
  } else {
    win.loadURL("http://localhost:5173");
  }
}

app.whenReady().then(() => {
  setupIpcHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
