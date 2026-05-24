/**
 * @class BibleService
 * @description OOP Service Class handling text loading, book metadata, and full-text search.
 * This class abstracts the data access layer:
 * 1. For dynamic remote versions (KJV, ASV, BBE, BSB), it fetches chapters or complete bibles from HelloAO APIs.
 * 2. For local translations (Sinhala ROV/2018, Tamil TAMOVR), it performs dynamic imports of raw JSON files,
 *    enabling the React app bundle to remain lightweight since large 12MB databases are split into lazy-loaded files.
 */
export default class BibleService {
  constructor() {
    /**
     * Maps local internal book codes to HelloAO standard book IDs.
     * Required because the HelloAO API endpoints use 3-letter uppercase codes (e.g., 'GEN', 'EXO').
     * @type {Object<string, string>}
     * @private
     */
    this.localToHelloAoMap = {
      "Gen": "GEN", "Exod": "EXO", "Lev": "LEV", "Num": "NUM", "Deut": "DEU",
      "Josh": "JOS", "Judg": "JDG", "Ruth": "RUT", "1Sam": "1SA", "2Sam": "2SA",
      "1Kgs": "1KI", "2Kgs": "2KI", "1Chr": "1CH", "2Chr": "2CH", "Ezra": "EZR",
      "Neh": "NEH", "Esth": "EST", "Job": "JOB", "Ps": "PSA", "Prov": "PRO",
      "Eccl": "ECC", "Song": "SNG", "Isa": "ISA", "Jer": "JER", "Lam": "LAM",
      "Ezek": "EZK", "Dan": "DAN", "Hos": "HOS", "Joel": "JOL", "Amos": "AMO",
      "Obad": "OBA", "Jonah": "JON", "Mic": "MIC", "Nah": "NAM", "Hab": "HAB",
      "Zeph": "ZEP", "Hag": "HAG", "Zech": "ZEC", "Mal": "MAL", "Matt": "MAT",
      "Mark": "MRK", "Luke": "LUK", "John": "JHN", "Acts": "ACT", "Rom": "ROM",
      "1Cor": "1CO", "2Cor": "2CO", "Gal": "GAL", "Eph": "EPH", "Phil": "PHP",
      "Col": "COL", "1Thess": "1TH", "2Thess": "2TH", "1Tim": "1TI", "2Tim": "2TI",
      "Titus": "TIT", "Phlm": "PHM", "Heb": "HEB", "Jas": "JAS", "1Pet": "1PE",
      "2Pet": "2PE", "1John": "1JN", "2John": "2JN", "3John": "3JN", "Jude": "JUD",
      "Rev": "REV"
    };

    /**
     * Cache storage to hold fully loaded bibles in memory.
     * Maps version identifiers (e.g. 'BSB') to flattened arrays of all 31,102 verses.
     * Prevents redownloading massive complete.json databases on subsequent searches.
     * @type {Object<string, Array>}
     * @private
     */
    this.searchCache = {};
  }

  /**
   * Resolves standard HelloAO API book code.
   * @param {string} localCode - e.g. 'Gen'
   * @returns {string} - e.g. 'GEN'
   */
  getHelloAoBookCode(localCode) {
    return this.localToHelloAoMap[localCode] || localCode;
  }

  /**
   * Helper verifying if a version is fetched via HelloAO HTTP API endpoints.
   * English translations are API-based, whereas Sinhala and Tamil translations are stored locally.
   * @param {string} version 
   * @returns {boolean}
   */
  isApiVersion(version) {
    return ["KJV", "ASV", "BBE", "BSB"].includes(version);
  }

  /**
   * Loads a chapter's verses.
   * - For API versions: queries `bible.helloao.org` for a single chapter's JSON, tokenizes 
   *   text strings, and converts content segments into a flat list of verse objects.
   * - For local versions: dynamically calls `import(...)` on the JSON files, maps short OSIS
   *   properties ({b, c, v, t}) to descriptive keys, and resolves them.
   * @param {string} book - Local book abbreviation (e.g. 'Gen')
   * @param {number} chapter 
   * @param {string} version - Active translation selection (e.g. 'TAMOVR')
   * @returns {Promise<Array<{book: string, chapter: number, verse: number, text: string}>>}
   */
  async fetchChapter(book, chapter, version) {
    const apiVersions = { "KJV": "eng_kjv", "ASV": "eng_asv", "BBE": "eng_bbe", "BSB": "BSB" };

    if (this.isApiVersion(version)) {
      const helloAoId = apiVersions[version];
      const helloAoBookId = this.getHelloAoBookCode(book);
      const url = `https://bible.helloao.org/api/${helloAoId}/${helloAoBookId}/${chapter}.json`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch chapter ${book} ${chapter}`);
      const data = await res.json();
      
      const flat = [];
      const ch = data.chapter;
      if (ch && Array.isArray(ch.content)) {
        ch.content.forEach(item => {
          if (item.type === 'verse') {
            const verseNum = item.number || item.verse;
            // HelloAO content array can mix text strings and footnote tag indicators;
            // join only text segments together.
            const text = item.content
              .filter(part => typeof part === 'string')
              .join(' ');
            flat.push({
              book: book,
              chapter: chapter,
              verse: typeof verseNum === 'string' ? parseInt(verseNum) : verseNum,
              text: text
            });
          }
        });
      }
      return flat;
    } else {
      // Local lazy-loading dynamic imports.
      // Webpack splits these imported JSONs into distinct async files, preserving startup speed.
      let module;
      if (version === '2018') {
        module = await import('../../../data/sinnrv2018.json');
      } else if (version === 'TAMOVR') {
        module = await import('../../../data/ta_movr.json');
      } else {
        module = await import('../../../data/sirov.json');
      }
      
      // Convert OSIS abbreviations to App properties
      return module.default
        .map(v => ({
          book: v.b,
          chapter: v.c,
          verse: v.v,
          text: v.t
        }));
    }
  }

  /**
   * Fetches and flattens the complete Bible database of a remote API translation.
   * Cached inside `searchCache` variable to enable instant, high-performance in-memory search.
   * @param {string} version 
   * @returns {Promise<Array<{book: string, chapter: number, verse: number, text: string}>>}
   */
  async loadFullBibleForSearch(version) {
    if (!this.isApiVersion(version)) {
      throw new Error("Local bibles are already fully loaded in memory.");
    }

    const apiVersions = { "KJV": "eng_kjv", "ASV": "eng_asv", "BBE": "eng_bbe", "BSB": "BSB" };
    const apiId = apiVersions[version];
    
    // Return cache if it exists
    if (this.searchCache[version]) {
      return this.searchCache[version];
    }

    const res = await fetch(`https://bible.helloao.org/api/${apiId}/complete.json`);
    if (!res.ok) throw new Error(`Failed to load full Bible database for version ${version}`);
    const data = await res.json();

    const flat = [];
    // Inverse localToHelloAoMap to convert HelloAO uppercase book IDs back to local abbreviations (e.g. 'GEN' -> 'Gen')
    const helloAoToLocalMap = {};
    for (const [localCode, helloAoId] of Object.entries(this.localToHelloAoMap)) {
      helloAoToLocalMap[helloAoId] = localCode;
    }

    // Traverse the nested book/chapter/verse tree structure and flatten it
    if (data && Array.isArray(data.books)) {
      data.books.forEach(b => {
        const bookCode = helloAoToLocalMap[b.id] || b.id;
        if (Array.isArray(b.chapters)) {
          b.chapters.forEach(chObj => {
            const ch = chObj.chapter;
            if (ch && Array.isArray(ch.content)) {
              ch.content.forEach(item => {
                if (item.type === 'verse') {
                  const verseNum = item.number || item.verse;
                  const text = item.content
                    .filter(part => typeof part === 'string')
                    .join(' ');
                  flat.push({
                    book: bookCode,
                    chapter: ch.number,
                    verse: typeof verseNum === 'string' ? parseInt(verseNum) : verseNum,
                    text: text
                  });
                }
              });
            }
          });
        }
      });
    }

    // Store in cache for future searches
    this.searchCache[version] = flat;
    return flat;
  }
}
