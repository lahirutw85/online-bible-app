import verseCounts from '../../../data/verse_counts.json';

// Standard ordering of the 66 Protestant books to map coordinates to absolute 1-indexed IDs
const standardOrder = [
  "Gen", "Exod", "Lev", "Num", "Deut", "Josh", "Judg", "Ruth",
  "1Sam", "2Sam", "1Kgs", "2Kgs", "1Chr", "2Chr", "Ezra", "Neh", "Esth", "Job",
  "Ps", "Prov", "Eccl", "Song", "Isa", "Jer", "Lam", "Ezek", "Dan", "Hos",
  "Joel", "Amos", "Obad", "Jonah", "Mic", "Nah", "Hab", "Zeph", "Hag", "Zech",
  "Mal", "Matt", "Mark", "Luke", "John", "Acts", "Rom", "1Cor", "2Cor", "Gal",
  "Eph", "Phil", "Col", "1Thess", "2Thess", "1Tim", "2Tim", "Titus", "Phlm",
  "Heb", "Jas", "1Pet", "2Pet", "1John", "2John", "3John", "Jude", "Rev"
];

// Inverse mapping of HelloAO uppercase 3-letter codes to local book abbreviations
const helloAoToLocalMap = {
  "GEN": "Gen", "EXO": "Exod", "LEV": "Lev", "NUM": "Num", "DEU": "Deut",
  "JOS": "Josh", "JDG": "Judg", "RUT": "Ruth", "1SA": "1Sam", "2SA": "2Sam",
  "1KI": "1Kgs", "2KI": "2Kgs", "1CH": "1Chr", "2CH": "2Chr", "EZR": "Ezra",
  "NEH": "Neh", "EST": "Esth", "JOB": "Job", "PSA": "Ps", "PRO": "Prov",
  "ECC": "Eccl", "SNG": "Song", "ISA": "Isa", "JER": "Jer", "LAM": "Lam",
  "EZK": "Ezek", "DAN": "Dan", "HOS": "Hos", "JOL": "Joel", "AMO": "Amos",
  "OBA": "Obad", "JON": "Jonah", "MIC": "Mic", "NAM": "Nah", "HAB": "Hab",
  "ZEP": "Zeph", "HAG": "Hag", "ZEC": "Zech", "MAL": "Mal", "MAT": "Matt",
  "MRK": "Mark", "LUK": "Luke", "JHN": "John", "ACT": "Acts", "ROM": "Rom",
  "1CO": "1Cor", "2CO": "2Cor", "GAL": "Gal", "EPH": "Eph", "PHP": "Phil",
  "COL": "Col", "1TH": "1Thess", "2TH": "2Thess", "1TI": "1Tim", "2TI": "2Tim",
  "TIT": "Titus", "PHM": "Phlm", "HEB": "Heb", "JAS": "Jas", "1PE": "1Pet",
  "2PE": "2Pet", "1JN": "1John", "2JN": "2John", "3JN": "3John", "JUD": "Jude",
  "REV": "Rev"
};

// Module-level cache shared across all ReferenceService instances to prevent redundant network downloads
const sharedFileCache = {};

/**
 * @class ReferenceService
 * @description OOP Service Class handling dynamic loading of Bible cross-references.
 * Uses the SoulLiberty KJV cross-reference database pre-split into 32 files on GitHub.
 */
export default class ReferenceService {
  constructor() {
    /**
     * Cache storage for retrieved cross-reference files.
     * Prevents redownloading files as the reader changes chapters.
     * @type {Object<number, Object>}
     */
    this.fileCache = sharedFileCache;
  }

  /**
   * Calculates the absolute 1-indexed verse ID for standard 66-book Protestant Bible versions.
   * @param {string} book - e.g., 'Gen'
   * @param {number} chapter
   * @param {number} verse
   * @returns {number} absolute verse ID, or -1 if not a standard book
   */
  getAbsoluteVerseId(book, chapter, verse) {
    const bookIdx = standardOrder.indexOf(book);
    if (bookIdx === -1) return -1; // Apocryphal books are skipped

    let absoluteId = 0;
    // Sum all verses in preceding books
    for (let i = 0; i < bookIdx; i++) {
      const prevBook = standardOrder[i];
      const chapters = verseCounts[prevBook];
      if (chapters) {
        for (const vCount of chapters) {
          absoluteId += vCount;
        }
      }
    }

    // Sum verses in preceding chapters of the current book
    const chapters = verseCounts[book];
    if (chapters) {
      for (let c = 0; c < chapter - 1; c++) {
        absoluteId += chapters[c];
      }
    }

    absoluteId += verse;
    return absoluteId;
  }

  /**
   * Resolves the 1-indexed split file index containing the absolute verse ID.
   * @param {number} absoluteId
   * @returns {number} JSON file index (1 to 32)
   */
  getFileIndex(absoluteId) {
    return Math.floor((absoluteId - 1) / 1000) + 1;
  }

  /**
   * Fetches and maps cross-references for a list of verses inside a chapter.
   * Leverages file caching to perform at most one network request per chapter.
   * @param {Array<Object>} versesList - The verses to map cross references for.
   * @returns {Promise<Object>} map of `${book}_${chapter}_${verse}` to parsed reference objects.
   */
  async fetchReferencesForChapter(versesList) {
    const refsMap = {};
    console.log("fetchReferencesForChapter CALLED with versesList length:", versesList ? versesList.length : 0);
    if (!versesList || versesList.length === 0) return refsMap;

    for (const v of versesList) {
      const absoluteId = this.getAbsoluteVerseId(v.book, v.chapter, v.verse);
      console.log(`Verse: ${v.book} ${v.chapter}:${v.verse} -> absoluteId: ${absoluteId}`);
      if (absoluteId === -1 || absoluteId > 31102) {
        console.log(`Skipping verse due to invalid absoluteId: ${absoluteId}`);
        continue;
      }

      const fileIdx = this.getFileIndex(absoluteId);
      let fileData = this.fileCache[fileIdx];
      console.log(`fileIdx: ${fileIdx}, cached: ${!!fileData}`);

      // Download file from GitHub if not already present in memory cache
      if (!fileData) {
        try {
          const url = `https://raw.githubusercontent.com/josephilipraja/bible-cross-reference-json/master/${fileIdx}.json`;
          console.log("FETCHING FROM URL:", url);
          const res = await fetch(url);
          console.log("FETCH RESOLVED, res exists:", !!res, "status:", res ? res.status : 'N/A');
          if (res.ok) {
            fileData = await res.json();
            this.fileCache[fileIdx] = fileData;
            console.log("FETCH SUCCESS, fileData keys count:", Object.keys(fileData).length);
          } else {
            console.error("FETCH FAILED, res not ok:", res.status);
          }
        } catch (err) {
          console.error(`Failed to fetch cross references file ${fileIdx}:`, err);
        }
      }

      if (fileData) {
        const verseData = fileData[absoluteId];
        if (verseData && verseData.r) {
          // Map references from SoulLiberty layout "EXO 20 11" to localized objects
          const parsedRefs = Object.values(verseData.r).map(refStr => {
            const parts = refStr.split(' ');
            const helloAoBook = parts[0];
            const ch = parseInt(parts[1]);
            const ver = parseInt(parts[2]);
            
            const localBook = helloAoToLocalMap[helloAoBook] || helloAoBook;
            return {
              book: localBook,
              chapter: ch,
              verse: ver
            };
          });
          console.log(`Found ${parsedRefs.length} references for ${v.book} ${v.chapter}:${v.verse}`);
          refsMap[`${v.book}_${v.chapter}_${v.verse}`] = parsedRefs;
        } else {
          console.log(`No reference data in file for absoluteId: ${absoluteId}`);
        }
      }
    }
    
    return refsMap;
  }
}
