import { writable } from 'svelte/store';

const searchVisible = writable(false);

export default {
  showSearch: () => {
    searchVisible.set(true);
    document.body.classList.add('prevent-scroll');
  },
  hideSearch: () => {
    searchVisible.set(false);
    document.body.classList.remove('prevent-scroll');
  },
  searchVisible,
};
