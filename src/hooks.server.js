// hook.server.js
import { initializeTries } from '$lib/server/trie';
import { i18n } from '$lib/i18n';

const handleParaglide = i18n.handle();

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ event, resolve }) => {
    // Initialize tries before handling any requests
    try {
        await initializeTries();
    } catch (error) {
        console.error('Failed to initialize tries:', error);
        // You might want to throw here depending on your requirements
    }
    
    return handleParaglide({ event, resolve });
};