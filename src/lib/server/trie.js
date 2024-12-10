import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Trie } = require('word-graphs');
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory path for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize tries for different languages
const tries = new Map();
const lists = new Map();
const short = false;
const maxWordLengths = new Map();

export async function initializeTries() {
    try {
        // Function to get the correct file path based on environment
        const getWordFilePath = (/** @type {string} */ language) => {
            const filename = `${language}${short ? '_short' : ''}.txt`;
            
            // In development, read from src/lib/data
            if (process.env.NODE_ENV === 'development') {
                return join(__dirname, '..', 'data', 'words', filename);
            }
            
            // In production, read from build/client/words
            return join(process.cwd(), 'build', 'client', 'words', filename);
        };

        // Load English words
        const enWords = await fs.readFile(
            getWordFilePath('english'),
            'utf-8'
        );
        const enTrie = new Trie();
        const enList = enWords.split('\n').map(word => word.trim().toLowerCase());
        enWords.split('\n').forEach(word => enTrie.add(word.trim()));
        tries.set('en', enTrie);
        lists.set('en', enList);
        maxWordLengths.set('en', Math.max(...enList.map(word => word.length)));

        // Load German words
        const deWords = await fs.readFile(
            getWordFilePath('german'),
            'utf-8'
        );
        const deTrie = new Trie();
        const deList = deWords.split('\n').map(word => word.trim().toLowerCase());
        deWords.split('\n').forEach(word => deTrie.add(word.trim()));
        tries.set('de', deTrie);
        lists.set('de', deList);
        maxWordLengths.set('de', Math.max(...deList.map(word => word.length)));

        console.log('Tries initialized successfully');
    } catch (error) {
        console.error('Error initializing tries:', error);
        throw error;
    }
}

/**
 * @param {String} lang
 * @returns {Trie}
 */
export function getTrie(lang) {
    const trie = tries.get(lang);
    if (!trie) {
        throw new Error(`Trie for language ${lang} not found`);
    }
    return trie;
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