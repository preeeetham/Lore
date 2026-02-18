import { z } from "zod";

export const CronSchedule = z.object({
  type: z.literal("cron"),
  expression: z.string(),
});

export const WindowSchedule = z.object({
  type: z.literal("window"),
  cron: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

export const OnceSchedule = z.object({
  type: z.literal("once"),
  runAt: z.string(),
});

export const ScheduleDefinition = z.union([
  CronSchedule,
  WindowSchedule,
  OnceSchedule,
]);

export const AgentScheduleEntry = z.object({
  schedule: ScheduleDefinition,
  enabled: z.boolean().optional().default(true),
  startingMessage: z.string().optional(),
  description: z.string().optional(),
});

export const AgentScheduleConfig = z.object({
  agents: z.record(z.string(), AgentScheduleEntry),
});
