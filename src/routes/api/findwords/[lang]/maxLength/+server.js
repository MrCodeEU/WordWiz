import { json } from '@sveltejs/kit';
import { getMaxLength } from '$lib/server/trie';

export async function GET({ params }) {
    const { lang } = params;
    
    if (!['en', 'de'].includes(lang)) {
        return new Response('Invalid language', { status: 400 });
    }
    
    try {
        return json({ maxWordLength: getMaxLength(lang) });

    } catch (error) {
        console.error('Error getting longest word:', error);
        return new Response('Internal server error', { status: 500 });
    }
}