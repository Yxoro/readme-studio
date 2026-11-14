export interface AIConfig {
  baseUrl: string;
  model: string;
  apiKey: string;
}

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const AI_CONFIG_KEY = "readme-studio.ai-config.v1";

export const DEFAULT_AI_CONFIG: AIConfig = {
  baseUrl: "https://api.z.ai/api/paas/v4",
  model: "glm-4-flash",
  apiKey: "",
};

export function loadAIConfig(): AIConfig {
  try {
    const raw = window.localStorage.getItem(AI_CONFIG_KEY);
    if (!raw) return { ...DEFAULT_AI_CONFIG };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { ...DEFAULT_AI_CONFIG };
    const candidate = parsed as Partial<AIConfig>;

    return {
      baseUrl:
        typeof candidate.baseUrl === "string" && candidate.baseUrl.trim()
          ? candidate.baseUrl
          : DEFAULT_AI_CONFIG.baseUrl,
      model:
        typeof candidate.model === "string" && candidate.model.trim()
          ? candidate.model
          : DEFAULT_AI_CONFIG.model,
      apiKey: typeof candidate.apiKey === "string" ? candidate.apiKey : "",
    };
  } catch {
    return { ...DEFAULT_AI_CONFIG };
  }
}

export function saveAIConfig(config: AIConfig): void {
  window.localStorage.setItem(
    AI_CONFIG_KEY,
    JSON.stringify({
      baseUrl: config.baseUrl.trim(),
      model: config.model.trim(),
      apiKey: config.apiKey.trim(),
    }),
  );
}

export function clearAIConfig(): void {
  try {
    window.localStorage.removeItem(AI_CONFIG_KEY);
  } catch {
    // Storage may be unavailable; the panel will fall back to defaults.
  }
}

export function isAIConfigured(config: AIConfig): boolean {
  return Boolean(config.baseUrl.trim() && config.model.trim() && config.apiKey.trim());
}

function getChatEndpoint(baseUrl: string): string {
  const normalized = baseUrl.trim().replace(/\/+$/, "");
  return normalized.endsWith("/chat/completions")
    ? normalized
    : `${normalized}/chat/completions`;
}

function validateConfig(config: AIConfig): void {
  if (!config.baseUrl.trim()) throw new Error("Add an API base URL.");
  if (!config.model.trim()) throw new Error("Add a model name.");
  if (!config.apiKey.trim()) throw new Error("Add your API key first.");
  if (!/^https?:\/\//i.test(config.baseUrl.trim())) {
    throw new Error("The API base URL must start with http:// or https://.");
  }
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

async function postCompletion(
  config: AIConfig,
  messages: AIMessage[],
  stream: boolean,
  signal?: AbortSignal,
  maxTokens?: number,
): Promise<Response> {
  validateConfig(config);

  const body: Record<string, unknown> = {
    model: config.model.trim(),
    messages,
    stream,
    temperature: stream ? 0.45 : 0,
  };
  if (maxTokens) body.max_tokens = maxTokens;

  try {
    return await fetch(getChatEndpoint(config.baseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey.trim()}`,
      },
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new Error(
      "Could not reach the AI provider. Check the base URL, your network, and whether the provider allows direct browser requests (CORS).",
    );
  }
}

async function buildApiError(response: Response): Promise<Error> {
  let detail = "";
  try {
    const raw = await response.text();
    try {
      const parsed = JSON.parse(raw) as {
        error?: { message?: string };
        message?: string;
      };
      detail = parsed.error?.message ?? parsed.message ?? "";
    } catch {
      detail = raw.slice(0, 240).trim();
    }
  } catch {
    // The response body may be unreadable or empty.
  }

  if (response.status === 401 || response.status === 403) {
    return new Error("The AI provider rejected the API key. Check the key and model access.");
  }
  if (response.status === 404) {
    return new Error("The AI endpoint was not found. Check the API base URL and model name.");
  }
  if (response.status === 429) {
    return new Error("The AI provider rate limit was reached. Wait a moment and try again.");
  }
  if (!detail) {
    return new Error(`The AI provider returned an error (${response.status}).`);
  }
  return new Error(`AI request failed: ${detail}`);
}

function getTextContent(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object") {
          const text = (part as { text?: unknown }).text;
          if (typeof text === "string") return text;
        }
        return "";
      })
      .join("");
  }
  return "";
}

function extractMessageContent(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return "";
  const first = choices[0] as {
    message?: { content?: unknown };
    delta?: { content?: unknown };
    text?: unknown;
  };
  return (
    getTextContent(first.message?.content) ||
    getTextContent(first.delta?.content) ||
    getTextContent(first.text)
  );
}

export async function testAIConnection(config: AIConfig): Promise<void> {
  const response = await postCompletion(
    config,
    [{ role: "user", content: "Reply with exactly: OK" }],
    false,
    undefined,
    8,
  );

  if (!response.ok) throw await buildApiError(response);
  const raw = await response.text();
  let payload: unknown = null;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new Error("The provider returned an unexpected response.");
  }
  if (!extractMessageContent(payload)) {
    throw new Error("The connection worked, but the provider returned no model output.");
  }
}

export async function streamChatCompletion(
  config: AIConfig,
  messages: AIMessage[],
  onDelta: (text: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await postCompletion(config, messages, true, signal);
  if (!response.ok) throw await buildApiError(response);

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/event-stream") || !response.body) {
    const raw = await response.text();
    try {
      const payload: unknown = JSON.parse(raw);
      const content = extractMessageContent(payload);
      if (!content) throw new Error("The AI provider returned an empty response.");
      onDelta(content);
      return;
    } catch (error) {
      if (error instanceof Error && error.message.includes("empty response")) throw error;
      throw new Error("The AI provider returned an unexpected response.");
    }
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finished = false;

  try {
    while (!finished) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIndex = buffer.indexOf("\n");
      while (newlineIndex !== -1) {
        const line = buffer.slice(0, newlineIndex).trim();
        buffer = buffer.slice(newlineIndex + 1);
        newlineIndex = buffer.indexOf("\n");

        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (data === "[DONE]") {
          finished = true;
          break;
        }
        try {
          const payload: unknown = JSON.parse(data);
          const delta = extractMessageContent(payload);
          if (delta) onDelta(delta);
        } catch {
          // Ignore keep-alives and partial frames.
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export function sanitizeMarkdownResponse(text: string): string {
  let result = text.replace(/\r\n?/g, "\n").replace(/^\uFEFF/, "");
  const withoutLeadingSpace = result.replace(/^\s+/, "");
  const wrappedInFence = /^```(?:markdown|md)?[ \t]*\n/i.test(withoutLeadingSpace);

  if (wrappedInFence) {
    result = withoutLeadingSpace.replace(/^```(?:markdown|md)?[ \t]*\n/i, "");
    result = result.replace(/\n?```\s*$/i, "");
  }

  return result.replace(/\n{3,}$/, "\n\n").trimEnd();
}

export function buildEditMessages(currentMarkdown: string, instruction: string): AIMessage[] {
  return [
    {
      role: "system",
      content: [
        "You are the AI editor inside README Studio.",
        "Rewrite the complete README according to the user's instruction.",
        "Return only the complete updated README in GitHub-flavored Markdown.",
        "Never wrap the whole README in a code fence. Never add commentary or explanations.",
        "Preserve existing sections and facts unless the instruction changes them.",
        "Do not invent metrics, customers, testimonials, partnerships, dates or shipped features.",
        "Use clear headings, short paragraphs, useful tables and realistic placeholders where facts are unknown.",
        "Keep the language of the existing README, unless the instruction explicitly asks for another language.",
        "If the README is empty, create a complete README from the instruction.",
      ].join(" "),
    },
    {
      role: "user",
      content: `CURRENT README:\n<<<\n${
        currentMarkdown.trim() || "(This README is currently empty.)"
      }\n>>>\n\nEDIT INSTRUCTION:\n${instruction.trim()}`,
    },
  ];
}

export function buildPromoMessages(idea: string): AIMessage[] {
  return [
    {
      role: "system",
      content: [
        "You are a product storyteller and README writer for README Studio.",
        "Create a complete promotional README.md for a concept that may not exist yet.",
        "The user provides only a raw idea. Do not ask questions and do not demand technical details.",
        "Write it as a concept pitch, not as documentation of a shipped product.",
        "Never invent traction metrics, customers, testimonials, funding, launch dates or fake availability.",
        "Return only the complete GitHub-flavored Markdown README, without a wrapping code fence or commentary.",
        "Include a strong title, a one-line tagline, the idea, why it matters, what it does, who it is for,",
        "the experience and product principles, a clearly concept-stage roadmap, a call for feedback or collaborators,",
        "and a License section. Be specific, warm and credible. Avoid hype and empty superlatives.",
      ].join(" "),
    },
    {
      role: "user",
      content: `Promotional concept idea:\n${idea.trim()}\n\nWrite the promotional README now.`,
    },
  ];
}
