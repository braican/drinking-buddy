import Anthropic from '@anthropic-ai/sdk';
import { ApiResponse } from '@utils';

type TapBeer = {
  name: string;
  style: string;
  abv: number | null;
  description: string | null;
};

type MyBeer = {
  name: string | null;
  style: string | null;
  abv: number | null;
  average: number | null;
  hads: number | null;
  last_had: string | null;
};

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const body = await request.json();
  const { messages, tapList, myBeers } = body as {
    messages: ChatMessage[];
    tapList: TapBeer[];
    myBeers: MyBeer[];
  };

  if (!messages?.length) {
    return ApiResponse.error('No messages provided.', 400);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return ApiResponse.error('Anthropic API key not configured.', 500);
  }

  const client = new Anthropic({ apiKey });

  const systemPrompt = `You are a knowledgeable and enthusiastic craft beer recommendation assistant for Tree House Brewing Company. You have access to both the current draft list and the user's complete Tree House drinking history.

CURRENT DRAFT LIST:
${JSON.stringify(tapList, null, 2)}

MY TREE HOUSE BEER HISTORY (beers I've tried with my ratings):
${JSON.stringify(myBeers, null, 2)}

Based on the user's rating history, you can infer their taste preferences: the styles they rate highest, ABV ranges they tend to enjoy, and any patterns in what they give top marks to. Use this to give personalized recommendations from what's currently on tap.

Guidelines:
- Only recommend beers from the current draft list
- Reference the user's rating history to explain why a beer matches their tastes
- Be specific and enthusiastic — you love Tree House beer
- Keep responses concise and focused
- If they've already had something on tap, acknowledge it and tell them whether to revisit it based on their rating`;

  try {
    const stream = await client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    // Pipe Anthropic's stream directly to the response
    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(new TextEncoder().encode(event.delta.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[Error in tap list chat]', error);
    return ApiResponse.error(error.message, 500);
  }
}
