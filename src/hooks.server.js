// hook.server.js
import { initializeTries } from '$lib/server/trie';
import { i18n } from '$lib/i18n';

const handleParaglide = i18n.handle();

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ event, resolve }) => {
    return handleParaglide({ event, resolve });
};

/** @type {import('@sveltejs/kit').ServerInit} */
export const init = async () => {
    await initializeTries();
};