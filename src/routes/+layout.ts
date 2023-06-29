import { Request } from '@utils';
import type { User } from '@models';

export async function load({ fetch }) {
  try {
    return await Request.get<{ user: User }>('/api/user', fetch);
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
}
