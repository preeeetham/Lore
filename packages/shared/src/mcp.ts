import { z } from "zod";

export const McpToolDefinition = z.object({
  name: z.string(),
  description: z.string().optional(),
  inputSchema: z.unknown().optional(),
});

export const ListToolsResponse = z.object({
  tools: z.array(McpToolDefinition),
  nextCursor: z.string().optional(),
});
