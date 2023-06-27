import { writable } from 'svelte/store';
import type { User } from '../../db/models/index.js';

const userStore = writable<User>();

export default userStore;
