import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory path for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize data structures
const letterMaps = new Map();
const lists = new Map();
const short = false;
const maxWordLengths = new Map();

class LetterMap {
    constructor() {
        this.wordMap = new Map(); // word -> frequency map
        this.lengthMap = new Map(); // length -> Set of words
        this.letterMap = new Map(); // letter -> Set of words
    }

    createFrequencyMap(word) {
        const freq = new Map();
        for (const char of word) {
            freq.set(char, (freq.get(char) || 0) + 1);
        }
        return freq;
    }

    add(word) {
        const trimmed = word.trim();
        if (!trimmed) return;

        // Store frequency map
        this.wordMap.set(trimmed, this.createFrequencyMap(trimmed));

        // Store by length
        const len = trimmed.length;
        if (!this.lengthMap.has(len)) {
            this.lengthMap.set(len, new Set());
        }
        this.lengthMap.get(len).add(trimmed);

        // Store by letter
        for (const char of new Set(trimmed)) {
            if (!this.letterMap.has(char)) {
                this.letterMap.set(char, new Set());
            }
            this.letterMap.get(char).add(trimmed);
        }
    }

    findWordsWithLetters(letters, {
        exact = false,
        minLength = 0,
        maxLength = Infinity
    } = {}) {
        const letterFreq = this.createFrequencyMap(letters);
        const candidateWords = new Set();
    
        // Get words of appropriate lengths
        const wordLengths = exact ? 
            [letters.length] : // If exact, only check words of same length
            Array.from(this.lengthMap.keys()).filter(len => 
                len >= Math.max(minLength, letters.length) && // Must be at least as long as input
                len <= maxLength
            );
    
        // Check words of each valid length
        for (const length of wordLengths) {
            const wordsOfLength = this.lengthMap.get(length) || new Set();
            
            // Filter candidates
            for (const word of wordsOfLength) {
                const wordFreq = this.wordMap.get(word);
                let isValid = true;
    
                // For non-exact matches, check if word contains at least the required letters
                if (!exact) {
                    for (const [char, freq] of letterFreq) {
                        const wordCharCount = wordFreq.get(char) || 0;
                        if (wordCharCount < freq) {
                            isValid = false;
                            break;
                        }
                    }
                } else {
                    // For exact matches, check exact frequencies
                    // Check if word has exactly the required letters
                    for (const [char, freq] of letterFreq) {
                        if (wordFreq.get(char) !== freq) {
                            isValid = false;
                            break;
                        }
                    }
                    // Also check word doesn't have extra letters
                    for (const [char, count] of wordFreq) {
                        if ((letterFreq.get(char) || 0) !== count) {
                            isValid = false;
                            break;
                        }
                    }
                }
    
                if (isValid) {
                    candidateWords.add(word);
                }
            }
        }
    
        return candidateWords;
    }
}

async function processBatch(words, letterMap, startIndex, batchSize) {
    const endIndex = Math.min(startIndex + batchSize, words.length);
    for (let i = startIndex; i < endIndex; i++) {
        const word = words[i];
        if (word) {
            letterMap.add(word);
        }
    }
    return endIndex;
}

export async function initializeTries() {
    try {
        console.log('Starting initialization of data structures...');
        const BATCH_SIZE = 1000;

        // Function to get the correct file path based on environment
        const getWordFilePath = (language) => {
            const filename = `${language}${short ? '_short' : ''}.txt`;
            return process.env.NODE_ENV === 'development'
                ? join(__dirname, '..', 'data', 'words', filename)
                : join(process.cwd(), 'build', 'client', 'words', filename);
        };

        // Process English words
        console.log('Loading English word list...');
        const enWords = await fs.readFile(getWordFilePath('english'), 'utf-8');
        const enLetterMap = new LetterMap();
        const enList = enWords.split('\n').map(word => word.trim());
        
        console.log(`Processing ${enList.length} English words...`);
        let processedCount = 0;
        while (processedCount < enList.length) {
            processedCount = await processBatch(enList, enLetterMap, processedCount, BATCH_SIZE);
            if (processedCount % 20000 === 0) {
                console.log(`Processed ${processedCount} English words...`);
            }
        }
        
        letterMaps.set('en', enLetterMap);
        lists.set('en', enList);
        let maxLength = 0;
        for (const word of enList) {
            maxLength = Math.max(maxLength, word.length);
        }
        maxWordLengths.set('en', maxLength);
        console.log('English data structures initialized successfully');

        // Process German words
        console.log('Loading German word list...');
        const deWords = await fs.readFile(getWordFilePath('german'), 'utf-8');
        const deLetterMap = new LetterMap();
        const deList = deWords.split('\n').map(word => word.trim());
        
        console.log(`Processing ${deList.length} German words...`);
        processedCount = 0;
        while (processedCount < deList.length) {
            processedCount = await processBatch(deList, deLetterMap, processedCount, BATCH_SIZE);
            if (processedCount % 10000 === 0) {
                console.log(`Processed ${processedCount} German words...`);
            }
        }
        
        letterMaps.set('de', deLetterMap);
        lists.set('de', deList);
        maxLength = 0;
        for (const word of deList) {
            maxLength = Math.max(maxLength, word.length);
        }
        maxWordLengths.set('de', maxLength);
        console.log('German data structures initialized successfully');

        console.log('All data structures initialized successfully');
    } catch (error) {
        console.error('Error initializing data structures:', error);
        throw error;
    }
}

/**
 * @param {String} lang
 * @returns {String[]}
 */
export function getList(lang) {
    const list = lists.get(lang);
    if (!list) {
        throw new Error(`List for language ${lang} not found`);
    }
    return list;
}

/**
 * @param {String} lang
 * @returns {Number}
 */
export function getMaxLength(lang) {
    const maxLength = maxWordLengths.get(lang);
    if (!maxLength) {
        throw new Error(`Max word length for language ${lang} not found`);
    }
    return maxLength;
}

/**
 * Retrieves the LetterMap for the specified language
 * @param {string} lang - The language code (e.g., 'en', 'de')
 * @returns {LetterMap} The LetterMap instance for the specified language
 * @throws {Error} If the LetterMap for the specified language is not found
 */
export function getLetterMap(lang) {
    const letterMap = letterMaps.get(lang);
    if (!letterMap) {
        throw new Error(`LetterMap for language ${lang} not found`);
    }
    return letterMap;
}