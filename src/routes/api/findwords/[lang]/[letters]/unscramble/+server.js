import { json } from '@sveltejs/kit';
import { getLetterMap } from '$lib/server/trie';

export async function GET({ params }) {
    const { letters, lang } = params;
    
    if (!['en', 'de'].includes(lang)) {
        return new Response('Invalid language', { status: 400 });
    }
    
    try {
        const trie = getLetterMap(lang);

        // Convert comma-separated letters to a single string
        const letterString = letters.toLowerCase().split(',').join('');

        console.log(`Finding words for ${lang} with letters ${letterString}`);
        
        let matchingWords = trie.findWordsWithLetters(letterString, {
            exact: true, 
            minLength: letterString.length, 
            maxLength: letterString.length
        });

        // Convert Set to Array if matchingWords is a Set
        const wordsArray = Array.isArray(matchingWords) ? matchingWords : Array.from(matchingWords);

        console.log('matchingWords:', wordsArray);

        return json({ words: wordsArray || [] });
    } catch (error) {
        console.error('Error finding words:', error);
        return new Response('Internal server error', { status: 500 });
    }
}