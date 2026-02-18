import { z } from "zod";
import {
  RelPath,
  Encoding,
  Stat,
  DirEntry,
  ReaddirOptions,
  ReadFileResult,
  WorkspaceChangeEvent,
  WriteFileOptions,
  WriteFileResult,
  RemoveOptions,
} from "./workspace.js";
import {
  AskHumanResponsePayload,
  CreateRunOptions,
  Run,
  ListRunsResponse,
  ToolPermissionAuthorizePayload,
} from "./runs.js";
import { LlmModelConfig } from "./models.js";
import { AgentScheduleConfig, AgentScheduleEntry } from "./agent-schedule.js";

const ipcSchemas = {
  "app:getVersions": {
    req: z.null(),
    res: z.object({
      chrome: z.string(),
      node: z.string(),
      electron: z.string(),
    }),
  },
  "workspace:getRoot": {
    req: z.null(),
    res: z.object({
      root: z.string(),
    }),
  },
  "workspace:exists": {
    req: z.object({ path: RelPath }),
    res: z.object({ exists: z.boolean() }),
  },
  "workspace:stat": {
    req: z.object({ path: RelPath }),
    res: Stat,
  },
  "workspace:readdir": {
    req: z.object({
      path: z.string(),
      opts: ReaddirOptions.optional(),
    }),
    res: z.array(DirEntry),
  },
  "workspace:readFile": {
    req: z.object({
      path: RelPath,
      encoding: Encoding.optional(),
    }),
    res: ReadFileResult,
  },
  "workspace:writeFile": {
    req: z.object({
      path: RelPath,
      data: z.string(),
      opts: WriteFileOptions.optional(),
    }),
    res: WriteFileResult,
  },
  "workspace:mkdir": {
    req: z.object({
      path: RelPath,
      recursive: z.boolean().optional(),
    }),
    res: z.object({ ok: z.literal(true) }),
  },
  "workspace:rename": {
    req: z.object({
      from: RelPath,
      to: RelPath,
      overwrite: z.boolean().optional(),
    }),
    res: z.object({ ok: z.literal(true) }),
  },
  "workspace:remove": {
    req: z.object({
      path: RelPath,
      opts: RemoveOptions.optional(),
    }),
    res: z.object({ ok: z.literal(true) }),
  },
  "workspace:didChange": {
    req: WorkspaceChangeEvent,
    res: z.null(),
  },
  "runs:create": {
    req: CreateRunOptions,
    res: Run,
  },
  "runs:createMessage": {
    req: z.object({
      runId: z.string(),
      message: z.string(),
    }),
    res: z.object({ messageId: z.string() }),
  },
  "runs:authorizePermission": {
    req: z.object({
      runId: z.string(),
      authorization: ToolPermissionAuthorizePayload,
    }),
    res: z.object({ success: z.literal(true) }),
  },
  "runs:provideHumanInput": {
    req: z.object({
      runId: z.string(),
      reply: AskHumanResponsePayload,
    }),
    res: z.object({ success: z.literal(true) }),
  },
  "runs:stop": {
    req: z.object({
      runId: z.string(),
      force: z.boolean().optional().default(false),
    }),
    res: z.object({ success: z.literal(true) }),
  },
  "runs:fetch": {
    req: z.object({ runId: z.string() }),
    res: Run,
  },
  "runs:list": {
    req: z.object({ cursor: z.string().optional() }),
    res: ListRunsResponse,
  },
  "runs:delete": {
    req: z.object({ runId: z.string() }),
    res: z.object({ success: z.boolean() }),
  },
  "runs:events": {
    req: z.null(),
    res: z.null(),
  },
  "models:list": {
    req: z.null(),
    res: z.object({
      providers: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          models: z.array(
            z.object({
              id: z.string(),
              name: z.string().optional(),
              release_date: z.string().optional(),
            })
          ),
        })
      ),
      lastUpdated: z.string().optional(),
    }),
  },
  "models:test": {
    req: LlmModelConfig,
    res: z.object({
      success: z.boolean(),
      error: z.string().optional(),
    }),
  },
  "models:saveConfig": {
    req: LlmModelConfig,
    res: z.object({ success: z.literal(true) }),
  },
  "agent-schedule:getConfig": {
    req: z.null(),
    res: AgentScheduleConfig,
  },
  "agent-schedule:updateAgent": {
    req: z.object({
      agentName: z.string(),
      entry: AgentScheduleEntry,
    }),
    res: z.object({ success: z.literal(true) }),
  },
  "agent-schedule:deleteAgent": {
    req: z.object({ agentName: z.string() }),
    res: z.object({ success: z.literal(true) }),
  },
} as const;

export type IPCChannels = {
  [K in keyof typeof ipcSchemas]: {
    req: z.infer<(typeof ipcSchemas)[K]["req"]>;
    res: z.infer<(typeof ipcSchemas)[K]["res"]>;
  };
};

export type InvokeChannels = {
  [K in keyof IPCChannels]: IPCChannels[K]["res"] extends null ? never : K;
}[keyof IPCChannels];

export type SendChannels = {
  [K in keyof IPCChannels]: IPCChannels[K]["res"] extends null ? K : never;
}[keyof IPCChannels];
