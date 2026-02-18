import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
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
  FSModelConfigRepo,
  testModelConnection,
} from "@lore/core";
import { LlmModelConfig } from "@lore/shared";

const app = new Hono().use("/*", cors());

const modelRepo = new FSModelConfigRepo();

// Workspace routes
app.get("/workspace/root", async (c) => {
  const { root } = await getRoot();
  return c.json({ root });
});

app.get("/workspace/readdir", async (c) => {
  const path = c.req.query("path") ?? "";
  const opts = c.req.query("recursive")
    ? { recursive: c.req.query("recursive") === "true" }
    : undefined;
  const entries = await readdir(path, opts);
  return c.json(entries);
});

app.get("/workspace/readFile", async (c) => {
  const path = c.req.query("path");
  if (!path) return c.json({ error: "path required" }, 400);
  const encoding = (c.req.query("encoding") as "utf8" | "base64") ?? "utf8";
  const result = await readFile(path, encoding);
  return c.json(result);
});

app.post("/workspace/writeFile", async (c) => {
  const body = await c.req.json<{ path: string; data: string }>();
  if (!body.path || body.data === undefined) {
    return c.json({ error: "path and data required" }, 400);
  }
  const result = await writeFile(body.path, body.data);
  return c.json(result);
});

app.post("/workspace/mkdir", async (c) => {
  const body = await c.req.json<{ path: string; recursive?: boolean }>();
  if (!body.path) return c.json({ error: "path required" }, 400);
  await mkdir(body.path, body.recursive ?? true);
  return c.json({ ok: true });
});

app.post("/workspace/rename", async (c) => {
  const body = await c.req.json<{ from: string; to: string; overwrite?: boolean }>();
  if (!body.from || !body.to) return c.json({ error: "from and to required" }, 400);
  await rename(body.from, body.to, body.overwrite ?? false);
  return c.json({ ok: true });
});

app.post("/workspace/remove", async (c) => {
  const body = await c.req.json<{ path: string; recursive?: boolean }>();
  if (!body.path) return c.json({ error: "path required" }, 400);
  await remove(body.path, { recursive: body.recursive });
  return c.json({ ok: true });
});

app.get("/workspace/exists", async (c) => {
  const path = c.req.query("path");
  if (!path) return c.json({ error: "path required" }, 400);
  const { exists: existsResult } = await exists(path);
  return c.json({ exists: existsResult });
});

app.get("/workspace/stat", async (c) => {
  const path = c.req.query("path");
  if (!path) return c.json({ error: "path required" }, 400);
  const result = await stat(path);
  return c.json(result);
});

// Models routes
app.get("/models/config", async (c) => {
  await modelRepo.ensureConfig();
  const config = await modelRepo.getConfig();
  return c.json(config);
});

app.post("/models/config", async (c) => {
  const body = await c.req.json();
  const config = LlmModelConfig.parse(body);
  await modelRepo.setConfig(config);
  return c.json({ success: true });
});

app.post("/models/test", async (c) => {
  const body = await c.req.json();
  const config = LlmModelConfig.parse(body);
  const result = await testModelConnection(
    config.provider,
    config.model
  );
  return c.json(result);
});

const port = Number(process.env.PORT) || 3000;

Bun.serve({
  fetch: app.fetch,
  port,
});

console.log(`Lore API running at http://localhost:${port}`);
