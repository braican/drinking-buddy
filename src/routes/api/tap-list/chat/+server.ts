import Anthropic from '@anthropic-ai/sdk';
import { ApiResponse } from '#utils';

// Haiku is plenty for matching a tap list against ratings, at a fraction of Opus's cost.
const MODEL = 'claude-haiku-5-5';

/** A beer on the tap list, cross-referenced against the user's history on the client. */
type TapBeer = {
  name: string;
  bar: string | null;
  section: string | null;
  style: string | null;
  abv: number | null;
  description: string | null;
  /** Present when the user has had this beer. */
  had?: { average: number | null; hads: number | null; last_had: string | null } | null;
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

const INSTRUCTIONS = `You are the bartender at a Tree House Brewing Company taproom, helping one regular decide what to order. They're standing at the bar reading your reply on their phone.

You have the current draft list and their full history of Tree House beers with their ratings (0–5). Use the history to work out what they like: styles they rate highly, ABV ranges, hops and adjuncts that show up in their favorites, and what they rate poorly.

How to answer:
- Only recommend beers from the current draft list. Say which bar pours it when the list has more than one.
- Each draft-list beer has a "had" field when they've had it, with their average rating, check-in count and last date. Treat that as the source of truth for whether they've had something — don't infer it from the history list by name. Most of the time they want something new; suggest a revisit only when they rated it highly or ask for one.
- Tie each pick to their taste with a specific reason ("you gave Moutere Magic a 4.75"), not general praise.
- Keep it short: usually two or three picks, a line or two each. Lead with the answer.
- Format for a small screen: bold beer names, short bullet lists, no headings or tables.
- If nothing on tap fits what they asked for, say so and offer the closest match.`;

function buildSystemPrompt(tapList: TapBeer[], myBeers: MyBeer[]): string {
  const today = new Date().toLocaleDateString('en-US', { dateStyle: 'long' });

  return `${INSTRUCTIONS}

Today is ${today}.

<draft_list>
${JSON.stringify(tapList)}
</draft_list>

<my_history>
${JSON.stringify(myBeers)}
</my_history>`;
}

// Caps on what the client can send, so one request can't run up a large bill. Normal use
// (60-beer list, ~200-beer history, a short conversation) is well under each.
const LIMITS = {
  bodyBytes: 400_000,
  messages: 20,
  messageChars: 8_000,
  tapBeers: 150,
  historyBeers: 1_000,
};

function invalid(message: string) {
  return Response.json({ success: false, message, status: 400 }, { status: 400 });
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > LIMITS.bodyBytes) return invalid('Request too large.');

  const raw = await request.text();
  if (raw.length > LIMITS.bodyBytes) return invalid('Request too large.');

  let body: { messages?: ChatMessage[]; tapList?: TapBeer[]; myBeers?: MyBeer[] };
  try {
    body = JSON.parse(raw);
  } catch {
    return invalid('Invalid request.');
  }

  const { messages, tapList = [], myBeers = [] } = body;

  if (
    !Array.isArray(messages) ||
    !messages.length ||
    messages.length > LIMITS.messages ||
    messages.at(-1)?.role !== 'user' ||
    !messages.every(
      m =>
        (m?.role === 'user' || m?.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.length <= LIMITS.messageChars,
    )
  ) {
    return invalid('Invalid or too-long conversation.');
  }

  if (
    !Array.isArray(tapList) ||
    tapList.length > LIMITS.tapBeers ||
    !Array.isArray(myBeers) ||
    myBeers.length > LIMITS.historyBeers
  ) {
    return invalid('Tap list or history too large.');
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return ApiResponse.error('Anthropic API key not configured.', 500);
  }

  const client = new Anthropic({ apiKey });

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 8000,
    // Low effort keeps the wait before the first words short; this is a quick chat.
    output_config: { effort: 'low' },
    // The draft list and history are the same on every turn, so cache them.
    system: [
      {
        type: 'text',
        text: buildSystemPrompt(tapList, myBeers),
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: messages
      .filter(m => m.content.trim())
      .map(m => ({ role: m.role, content: m.content })),
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        const { stop_reason } = await stream.finalMessage();
        if (stop_reason === 'max_tokens') {
          controller.enqueue(encoder.encode('\n\n_(Reply cut off — ask me to continue.)_'));
        } else if (stop_reason === 'refusal') {
          controller.enqueue(encoder.encode("\n\n_Sorry, I can't help with that one._"));
        }
      } catch (error) {
        if (stream.aborted) return;
        console.error('[Error in tap list chat]', error);
        controller.enqueue(
          encoder.encode('\n\n_Sorry, something went wrong partway through. Try again._'),
        );
      }
      controller.close();
    },
    // The user closed the drawer or navigated away: stop generating.
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
