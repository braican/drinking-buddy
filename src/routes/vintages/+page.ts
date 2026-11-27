import { ApiRequest } from '#utils';
import type { VintageFamily } from '#types';

export async function load({ fetch }) {
  const req = new ApiRequest(fetch);
  const response = await req.get<{ families: VintageFamily[] }>('vintages');

  return { families: response?.families ?? [] };
}
