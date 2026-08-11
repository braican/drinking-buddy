import Anthropic from '@anthropic-ai/sdk';
import { ApiResponse, estimateCost } from '@utils';
import type { MenuScanResult } from '@types';

const MODEL = 'claude-opus-5';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const SUPPORTED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;

type SupportedMediaType = (typeof SUPPORTED_MEDIA_TYPES)[number];

const nullable = (type: 'string' | 'number') => ({
  anyOf: [{ type }, { type: 'null' }],
});

const MENU_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['items', 'menuBrewery'],
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'brewery', 'section', 'status', 'confidence'],
        properties: {
          name: {
            type: 'string',
            description:
              "The drink's own name, exactly as printed. No brewery, style, ABV, price, pour size or tap number.",
          },
          brewery: {
            ...nullable('string'),
            description: 'Brewery credited on the menu. Null if the menu does not name one.',
          },
          section: {
            ...nullable('string'),
            description: 'Heading this item appeared under, e.g. "Drafts". Null if none.',
          },
          status: { type: 'string', enum: ['available', 'sold_out', 'coming_soon'] },
          confidence: {
            type: 'string',
            enum: ['high', 'medium', 'low'],
            description: 'How legible this item was in the photo.',
          },
        },
      },
    },
    menuBrewery: {
      ...nullable('string'),
      description:
        "The house brewery, when the photo is clearly one brewery's own list. Null for a bar with a mixed tap list.",
    },
  },
};

const SYSTEM_PROMPT = `You read photographs of drink menus and transcribe every item on them.

Read the whole image systematically: top to bottom, and column by column when the menu has more than one column. Menus get photographed at an angle, in low light, on chalkboards, on TV screens, and in handwriting. Transcribe what is actually in the photo rather than what a typical menu would say.

What counts as an item: every distinct drink the menu lists — beer, cider, seltzer, mead, kombucha. Skip wine, cocktails, spirits, coffee, soft drinks and food.

Separating the fields:
- \`name\` is the drink's own name and nothing else. Strip the brewery, the style, the ABV, the price, the pour size, the tap number, and any tasting-note description printed beneath it. "Tree House Julius IPA 6.8% $9" has the name "Julius".
- When the name genuinely is the style ("Pilsner", "Saison"), keep it as the name.
- Collaborations keep the name as printed, including "//" or "w/".
- \`brewery\` is only what the menu credits. Do not infer it from the beer name and do not fill it in from your own knowledge of who brews it.

Status: \`coming_soon\` for anything under "Coming Soon", "On Deck", "Next Up" or similar; \`sold_out\` for anything struck through, greyed out, or marked sold out / kicked / blown; \`available\` otherwise.

Rules that keep repeat scans of the same menu consistent:
- List every item exactly once. If a drink appears in two sections (on draft and in cans, say), list it once, under the section it appears in first.
- Never invent an item or a brewery that is not printed in the photo. Null is the correct answer for a field the menu does not show.
- A section heading, a price list, a food item, a hours-of-operation line or a slogan is not an item.
- Include items you can only partly read: transcribe your best reading and set \`confidence\` to "low".`;

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return ApiResponse.error('Anthropic API key not configured.', 500);
  }

  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const breweryName = (formData.get('breweryName') as string) || null;

    if (!imageFile) {
      return ApiResponse.error('No image provided.', 400);
    }

    const mediaType = imageFile.type as SupportedMediaType;
    if (!SUPPORTED_MEDIA_TYPES.includes(mediaType)) {
      return ApiResponse.error(
        `Unsupported image type "${imageFile.type || 'unknown'}". Use JPEG, PNG, GIF or WebP.`,
        400,
      );
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_IMAGE_BYTES) {
      return ApiResponse.error('Image is too large. Keep it under 5MB.', 400);
    }

    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      // The cache marker is currently a no-op: Opus 5 won't cache a prefix under
      // 512 tokens and this prompt is ~460, so `cacheWriteTokens` comes back 0.
      // Left in place so caching starts working on its own if the prompt grows.
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      output_config: {
        effort: 'medium',
        format: { type: 'json_schema', schema: MENU_SCHEMA },
      },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64Image },
            },
            {
              type: 'text',
              text: breweryName
                ? `Transcribe this menu. For context, the photo was taken at ${breweryName} — but still only record breweries the menu itself credits.`
                : 'Transcribe this menu.',
            },
          ],
        },
      ],
    });

    if (response.stop_reason === 'refusal') {
      return ApiResponse.error('The image could not be analyzed.', 422);
    }

    if (response.stop_reason === 'max_tokens') {
      return ApiResponse.error(
        'The menu was too long to transcribe in one pass. Try a tighter crop.',
        422,
      );
    }

    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return ApiResponse.error('No text content in response.', 500);
    }

    const result = JSON.parse(textContent.text);
    const scan: MenuScanResult = {
      ...result,
      usage: estimateCost(MODEL, response.usage),
    };

    return ApiResponse.success(scan);
  } catch (error) {
    console.error('[Error in menu analyze]', error);

    if (error instanceof Anthropic.RateLimitError) {
      return ApiResponse.error('Rate limited. Try again in a moment.', 429);
    }

    return ApiResponse.error(error.message, 500);
  }
}
