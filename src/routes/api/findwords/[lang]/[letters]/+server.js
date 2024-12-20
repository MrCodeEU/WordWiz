import { json } from '@sveltejs/kit';
import { getLetterMap } from '$lib/server/trie';

export async function GET({ params }) {
    const { letters, lang } = params;
    
    if (!['en', 'de'].includes(lang)) {
        return new Response('Invalid language', { status: 400 });
    }
    
    try {

        // letters to lowercase
        const lowerLetters = letters.toLowerCase();

        const trie = getLetterMap(lang);

        console.log(`Finding words for ${lang} with letters ${lowerLetters}`);
        
        //const matchingWords = trie.containsAll(letters.split(','));
        
        // wind all words containing the letters (in any order)
        // (also if a letter is used multiple times the word must contain it the same amount of times)
        let matchingWords = trie.findWordsWithLetters(lowerLetters.split(','));

        // Convert Set to Array if matchingWords is a Set
        const wordsArray = Array.isArray(matchingWords) ? matchingWords : Array.from(matchingWords);

        console.log('matchingWords:', wordsArray);

        return json({ words: wordsArray || [] });
    } catch (error) {
        console.error('Error finding words:', error);
        return new Response('Internal server error', { status: 500 });
    }
}