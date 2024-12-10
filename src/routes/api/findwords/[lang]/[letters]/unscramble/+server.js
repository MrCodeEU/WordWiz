import { json } from '@sveltejs/kit';
import { getTrie } from '$lib/server/trie';

export async function GET({ params }) {
    const { letters, lang } = params;
    
    if (!['en', 'de'].includes(lang)) {
        return new Response('Invalid language', { status: 400 });
    }
    
    try {
        const trie = getTrie(lang);

        console.log(`Finding words for ${lang} with letters ${letters}`);
        
        //const matchingWords = trie.containsAll(letters.split(','));
        
        // wind all words containing the letters (in any order)
        // (also if a letter is used multiple times the word must contain it the same amount of times)
        let matchingWords = trie.containsAll(letters.split(','));

        // map of letter -> count
        const letterCount = new Map();
        for (const letter of letters.split(',')) {
            letterCount.set(letter, (letterCount.get(letter) || 0) + 1);
        }

        //console.log('letterCount:', letterCount);
        //console.log('matchingWords:', matchingWords);

        // filter that contain the letters the wrong amount of times
        matchingWords = matchingWords.filter((/** @type {any} */ word) => {
            const wordLetterCount = new Map();
            for (const letter of word) {
                wordLetterCount.set(letter, (wordLetterCount.get(letter) || 0) + 1);
            }

            for (const [letter, count] of letterCount) {
                if (wordLetterCount.get(letter) !== count) {
                    //console.log(`Word ${word} does not contain ${letter} the right amount of times`);
                    return false;
                }
            }

            return true;
        });

        // filter out words that contain letters not in the input
        matchingWords = matchingWords.filter((/** @type {any} */ word) => {
            for (const letter of word) {
                if (!letterCount.has(letter)) {
                    return false;
                }
            }

            return true;
        });

        console.log('matchingWords:', matchingWords);

        return json({ words: matchingWords || [] });
    } catch (error) {
        console.error('Error finding words:', error);
        return new Response('Internal server error', { status: 500 });
    }
}