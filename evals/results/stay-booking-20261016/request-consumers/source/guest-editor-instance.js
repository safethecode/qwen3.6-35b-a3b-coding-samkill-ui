import { installGuestEditor } from './guest-editor.js';
export const guestEditor = installGuestEditor(() => document.dispatchEvent(new Event('requestguestchange')));
