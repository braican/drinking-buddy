import { writable } from 'svelte/store';
import type { User } from '@types';

const userStore = writable<User>();

export default userStore;
