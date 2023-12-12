import { ApiRequest } from '@utils';
import type { User } from '@types';

export async function load({ fetch }) {
  try {
    const req = new ApiRequest(fetch);
    const response = await req.get<{ user: User }>('user');

    return {
      user: response.user,
    };
  } catch (error) {
    return {};
  }
}
