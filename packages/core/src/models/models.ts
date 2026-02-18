import type { ProviderV2 } from "@ai-sdk/provider";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOllama } from "ollama-ai-provider-v2";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { LlmModelConfig, LlmProvider } from "@lore/shared";
import { z } from "zod";
import { generateText } from "ai";

export type ProviderConfig = z.infer<typeof LlmProvider>;
export type ModelConfig = z.infer<typeof LlmModelConfig>;

export function createProvider(config: ProviderConfig): ProviderV2 {
  const { apiKey, baseURL, headers } = config;
  switch (config.flavor) {
    case "openai":
      return createOpenAI({
        apiKey,
        baseURL,
        headers,
      });
    case "anthropic":
      return createAnthropic({
        apiKey,
        baseURL,
        headers,
      });
    case "google":
      return createGoogleGenerativeAI({
        apiKey,
        baseURL,
        headers,
      });
    case "ollama": {
      let ollamaURL = baseURL;
      if (ollamaURL && !ollamaURL.replace(/\/+$/, "").endsWith("/api")) {
        ollamaURL = ollamaURL.replace(/\/+$/, "") + "/api";
      }
      return createOllama({
        baseURL: ollamaURL ?? "http://localhost:11434/api",
        headers,
      });
    }
    case "openai-compatible":
      return createOpenAICompatible({
        name: "openai-compatible",
        apiKey,
        baseURL: baseURL ?? "",
        headers,
      });
    case "openrouter":
      return createOpenRouter({
        apiKey,
        baseURL,
        headers,
      });
    default:
      throw new Error(`Unsupported provider flavor: ${config.flavor}`);
  }
}

export async function testModelConnection(
  providerConfig: ProviderConfig,
  model: string,
  timeoutMs?: number
): Promise<{ success: boolean; error?: string }> {
  const isLocal =
    providerConfig.flavor === "ollama" ||
    providerConfig.flavor === "openai-compatible";
  const effectiveTimeout = timeoutMs ?? (isLocal ? 60000 : 8000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), effectiveTimeout);
  try {
    const provider = createProvider(providerConfig);
    const languageModel = provider.languageModel(model);
    await generateText({
      model: languageModel,
      prompt: "ping",
      abortSignal: controller.signal,
    });
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Connection test failed";
    return { success: false, error: message };
  } finally {
    clearTimeout(timeout);
  }
}
