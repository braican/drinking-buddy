import Anthropic from '@anthropic-ai/sdk';
import { ApiResponse } from '@utils';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return ApiResponse.error('Anthropic API key not configured.', 500);
  }

  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return ApiResponse.error('No image provided.', 400);
    }

    // Convert image to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    // Determine media type
    const mediaType = imageFile.type as
      | 'image/jpeg'
      | 'image/png'
      | 'image/gif'
      | 'image/webp';

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: 'Extract all beer names from this menu. Return only the beer names, one per line, nothing else. If you see brewery names or other context, ignore them and only return the actual beer names.',
            },
          ],
        },
      ],
    });

    // Extract text from response
    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return ApiResponse.error('No text content in response.', 500);
    }

    // Parse beer names from response (one per line)
    const beerNames = textContent.text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    return ApiResponse.success({ beerNames });
  } catch (error) {
    console.error('[Error in menu analyze]', error);
    return ApiResponse.error(error.message, 500);
  }
}
