import { checkinStore } from '@stores';

export async function load({ fetch }) {
  try {
    const resp = await fetch('/api/checkins/latest');
    const { checkins } = await resp.json();

    checkinStore.latestCheckins.set(checkins);

    return {};
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
}
