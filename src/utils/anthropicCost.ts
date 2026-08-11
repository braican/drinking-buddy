// Estimates what an Anthropic API call cost, from the `usage` block on the response.
//
// These are Anthropic's published list prices in USD per million tokens. The
// figure is an estimate of list cost — it won't reflect any negotiated rate, and
// prices change, so re-check them against platform.claude.com/docs/en/pricing
// if the numbers start looking off.

const PRICING: Record<string, { input: number; output: number }> = {
  'claude-opus-5': { input: 5, output: 25 },
  'claude-opus-4-8': { input: 5, output: 25 },
  'claude-opus-4-6': { input: 5, output: 25 },
  'claude-sonnet-5': { input: 3, output: 15 },
  'claude-sonnet-4-6': { input: 3, output: 15 },
  'claude-haiku-4-5': { input: 1, output: 5 },
};

// Writing to the prompt cache costs 1.25x the base input rate at the default
// 5-minute TTL; reading from it costs 0.1x.
const CACHE_WRITE_MULTIPLIER = 1.25;
const CACHE_READ_MULTIPLIER = 0.1;

interface AnthropicUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
}

export interface CostEstimate {
  /** Uncached input tokens, billed at the full input rate. */
  inputTokens: number;
  /** Output tokens. Thinking tokens are billed as output and included here. */
  outputTokens: number;
  cacheWriteTokens: number;
  cacheReadTokens: number;
  /** Estimated list cost in USD, or null for a model missing from PRICING. */
  usd: number | null;
}

export function estimateCost(model: string, usage: AnthropicUsage): CostEstimate {
  const inputTokens = usage.input_tokens ?? 0;
  const outputTokens = usage.output_tokens ?? 0;
  const cacheWriteTokens = usage.cache_creation_input_tokens ?? 0;
  const cacheReadTokens = usage.cache_read_input_tokens ?? 0;

  const rates = PRICING[model];

  if (!rates) {
    return { inputTokens, outputTokens, cacheWriteTokens, cacheReadTokens, usd: null };
  }

  const usd =
    ((inputTokens +
      cacheWriteTokens * CACHE_WRITE_MULTIPLIER +
      cacheReadTokens * CACHE_READ_MULTIPLIER) *
      rates.input +
      outputTokens * rates.output) /
    1_000_000;

  return { inputTokens, outputTokens, cacheWriteTokens, cacheReadTokens, usd };
}

/** Formats a USD amount small enough that cents-only rounding would hide it. */
export function formatUsd(usd: number | null): string {
  if (usd === null) return 'unknown';
  if (usd > 0 && usd < 0.001) return '<$0.001';

  return `$${usd.toFixed(usd < 1 ? 3 : 2)}`;
}
