import { LlmModelConfig } from "@lore/shared";
import { WorkDir } from "../config/config.js";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const defaultConfig: z.infer<typeof LlmModelConfig> = {
  provider: {
    flavor: "openai",
    baseURL: "https://api.openai.com/v1",
  },
  model: "gpt-4o",
};

export interface IModelConfigRepo {
  ensureConfig(): Promise<void>;
  getConfig(): Promise<z.infer<typeof LlmModelConfig>>;
  setConfig(config: z.infer<typeof LlmModelConfig>): Promise<void>;
}

export class FSModelConfigRepo implements IModelConfigRepo {
  private readonly configPath = path.join(WorkDir, "config", "models.json");

  async ensureConfig(): Promise<void> {
    try {
      await fs.access(this.configPath);
    } catch {
      await fs.mkdir(path.dirname(this.configPath), { recursive: true });
      await fs.writeFile(
        this.configPath,
        JSON.stringify(defaultConfig, null, 2)
      );
    }
  }

  async getConfig(): Promise<z.infer<typeof LlmModelConfig>> {
    try {
      const config = await fs.readFile(this.configPath, "utf8");
      return LlmModelConfig.parse(JSON.parse(config));
    } catch {
      return defaultConfig;
    }
  }

  async setConfig(config: z.infer<typeof LlmModelConfig>): Promise<void> {
    await fs.writeFile(
      this.configPath,
      JSON.stringify(config, null, 2)
    );
  }
}
