// hook.server.js
import { initializeTries } from '$lib/server/trie';
import { i18n } from '$lib/i18n';

const handleParaglide = i18n.handle();
let isTrieInitialized = false;

/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ event, resolve }) => {
    // Initialize tries only once
    if (!isTrieInitialized) {
        try {
            await initializeTries();
            isTrieInitialized = true;
        } catch (error) {
            console.error('Failed to initialize tries:', error);
            // You might want to throw here depending on your requirements
        }
    }
    
    return handleParaglide({ event, resolve });
};