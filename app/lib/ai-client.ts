import type { AIModel } from "../components/ModelContext";

// Build multimodal user content for OpenAI (text + optional image)
function buildOpenAIUserContent(text: string, imageBase64?: string | null) {
  if (!imageBase64) return text;
  const parts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
    { type: "text", text },
    { type: "image_url", image_url: { url: imageBase64 } },
  ];
  return parts;
}

// Build multimodal user content for Claude (text + optional image)
function buildClaudeUserContent(text: string, imageBase64?: string | null) {
  if (!imageBase64) return text;
  // Extract media type and base64 data from data URL
  const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) return text;
  const [, mediaType, data] = match;
  return [
    { type: "image", source: { type: "base64", media_type: mediaType, data } },
    { type: "text", text },
  ];
}

export async function callAI(
  model: AIModel,
  systemPrompt: string,
  userContent: string,
  maxTokens = 4096,
  jsonMode = true,
  imageBase64?: string | null
): Promise<string> {
  if (model === "gpt-4o") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY chưa được cấu hình");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o",
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: buildOpenAIUserContent(userContent, imageBase64) },
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[AI Client] OpenAI error:", res.status, err);
      throw new Error(`OpenAI API error: ${res.status}`);
    }

    const data = await res.json();
    const finishReason = data.choices?.[0]?.finish_reason;
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error("[AI Client] OpenAI empty response. finish_reason:", finishReason, "usage:", JSON.stringify(data.usage));
      throw new Error("Không nhận được phản hồi từ AI");
    }
    if (finishReason === "length") {
      console.warn("[AI Client] OpenAI response TRUNCATED. usage:", JSON.stringify(data.usage));
    }
    return content;
  }

  if (model === "claude") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY chưa được cấu hình");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: maxTokens,
        system: systemPrompt + (jsonMode ? "\n\nIMPORTANT: Respond with valid JSON only, no markdown formatting." : ""),
        messages: [{ role: "user", content: buildClaudeUserContent(userContent, imageBase64) }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[AI Client] Anthropic error:", res.status, err);
      throw new Error(`Anthropic API error: ${res.status}`);
    }

    const data = await res.json();
    const content = data.content?.[0]?.text;
    if (!content) throw new Error("Không nhận được phản hồi từ AI");
    return content;
  }

  if (model === "deepseek") {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) throw new Error("DEEPSEEK_API_KEY chưa được cấu hình");

    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.7,
        max_tokens: Math.min(maxTokens, 8192),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[AI Client] DeepSeek error:", res.status, err);
      throw new Error(`DeepSeek API error: ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Không nhận được phản hồi từ AI");
    return content;
  }

  throw new Error(`Model không được hỗ trợ: ${model}`);
}
