// In-memory AI settings store (persists to DB when available)
export type AISettings = {
  enabled: boolean;
  apiKey: string;
  model: string;
  systemPrompt: string;
  maxTokens: number;
};

const globalStore = global as unknown as { aiSettings: AISettings };

if (!globalStore.aiSettings) {
  globalStore.aiSettings = {
    enabled: true,
    apiKey: process.env.OPENAI_API_KEY ?? "",
    model: "gpt-4o-mini",
    systemPrompt:
      "You are NaoBot, a helpful assistant for the National Automobile Olympiad 2026 (NAO 2026), a national-level automobile engineering competition in India. Answer questions clearly and concisely.",
    maxTokens: 300,
  };
}

export function getAISettings(): AISettings {
  return globalStore.aiSettings;
}

export function updateAISettings(patch: Partial<AISettings>): AISettings {
  globalStore.aiSettings = { ...globalStore.aiSettings, ...patch };
  return globalStore.aiSettings;
}
