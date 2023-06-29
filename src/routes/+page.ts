import { checkinStore, breweryStore } from '@stores';

export async function load({ fetch }) {
  try {
    await Promise.all([checkinStore.refreshLatest(fetch), breweryStore.refresh(fetch)]);
    return {};
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
}
