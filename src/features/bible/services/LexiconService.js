/**
 * @class LexiconService
 * @description OOP Service Class handling interlinear Greek/Hebrew mapping lookups and Strong's Concordance definitions.
 * Connects to biblesupersearch.com APIs:
 * 1. Resolves raw markup interlinear texts aligning English words with Greek/Hebrew Strong's indexes `{Gxxxx}` or `{Hxxxx}`.
 * 2. Fetches linguistic lexicon study dictionary records (pronunciation, transliteration, original script, definition).
 */
export default class LexiconService {
  /**
   * Fetches interlinear word listings for a given verse.
   * Parses the text and groups words with their corresponding Strong's numbers.
   * Query structure: `https://api.biblesupersearch.com/api?bible=kjv_strongs&reference={REF}&markup=raw`
   * Output text format matches: "In{G1722} the{G3588} beginning{G746} God{G430} created{G1254}"
   * @param {string} helloAoBookId - 3-letter HelloAO book code (e.g. 'GEN')
   * @param {number} chapter 
   * @param {number} verse 
   * @returns {Promise<Array<{word: string, cleanWord: string, strongs: string[]}>>} parsed interlinear word list
   */
  async fetchStrongsMapping(helloAoBookId, chapter, verse) {
    const url = `https://api.biblesupersearch.com/api?bible=kjv_strongs&reference=${helloAoBookId}+${chapter}:${verse}&markup=raw`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch interlinear data.");
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      throw new Error("No interlinear data found for this verse.");
    }

    const verseData = data.results[0].verses.kjv_strongs;
    const chapterData = verseData[chapter];
    if (!chapterData) throw new Error("Chapter data not found.");
    const verseTextObj = chapterData[verse];
    if (!verseTextObj) throw new Error("Verse text not found.");
    const text = verseTextObj.text;

    const wordsWithStrongs = [];
    const parts = text.split(/\s+/);
    parts.forEach(part => {
      // Extract the leading alphabetic letters of the English word, ignoring trailing symbols or formatting
      const wordMatch = part.match(/^([A-Za-z]+(?:'[A-Za-z]+)?)/i);
      if (wordMatch) {
        const word = wordMatch[1].toLowerCase();
        // Extract all occurrences of Strong's annotations matching the curly brace layout (e.g., {G2597})
        const strongsMatches = [...part.matchAll(/\{([GH][0-9]+)\}/gi)].map(m => m[1]);
        wordsWithStrongs.push({ 
          word: wordMatch[1],
          cleanWord: word,
          strongs: strongsMatches 
        });
      }
    });

    return wordsWithStrongs;
  }

  /**
   * Fetches dictionary definition data for a specific Strong's concordance number.
   * Query structure: `https://api.biblesupersearch.com/api/strongs?strongs={Gxxxx}`
   * @param {string} strongsNumber - Strong's ID (e.g. 'G1254', 'H430')
   * @returns {Promise<{number: string, rootWord: string, transliteration: string, pronunciation: string, entry: string}>}
   */
  async fetchStrongsDefinition(strongsNumber) {
    const res = await fetch(`https://api.biblesupersearch.com/api/strongs?strongs=${strongsNumber}`);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      throw new Error(`No definition found for Strong's ${strongsNumber}`);
    }

    const def = data.results[0];
    return {
      number: strongsNumber,
      rootWord: def.root_word,        // original Hebrew/Greek script
      transliteration: def.transliteration,
      pronunciation: def.pronunciation,
      entry: def.entry                // full dictionary definition entry
    };
  }

  /**
   * Selection match finder. Tries to match a double-clicked English word to the parsed interlinear verse words list.
   * First attempts an exact match. If that fails, falls back to a substring/fuzzy alignment search
   * to handle word variations (e.g. "created" matching "create", "beginning" matching "begin").
   * @param {Array<{word: string, cleanWord: string, strongs: string[]}>} wordsWithStrongs 
   * @param {string} cleanWord - Word selected by user double-click
   * @returns {Object|null} matched interlinear item or null
   */
  findBestMatch(wordsWithStrongs, cleanWord) {
    const searchWord = cleanWord.toLowerCase();
    
    // 1. Try exact matching
    let match = wordsWithStrongs.find(w => w.cleanWord === searchWord);
    
    // 2. Try fuzzy substring/prefix matching as a fallback
    if (!match) {
      match = wordsWithStrongs.find(w => 
        w.cleanWord.startsWith(searchWord) || 
        searchWord.startsWith(w.cleanWord) ||
        w.cleanWord.includes(searchWord) ||
        searchWord.includes(w.cleanWord)
      );
    }
    return match;
  }
}
