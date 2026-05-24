/**
 * @class BookmarkService
 * @description OOP Service Class managing highlighted verses (bookmarks), storage synchronization, and retrieval.
 * Encapsulates all LocalStorage operations, serializing bookmark objects, inserting new highlights, 
 * updating colors for existing bookmarked verses, and checking highlight states during card rendering.
 */
export default class BookmarkService {
  constructor() {
    /**
     * Local memory array cache of bookmarks.
     * Hydrated on creation from LocalStorage values.
     * Bookmark schema: [{book: string, chapter: number, verse: number, color: string, version: string, text: string}]
     * @type {Array<Object>}
     */
    this.bookmarks = this.loadFromStorage();
  }

  /**
   * Initializes local bookmark dataset from browser storage.
   * Gracefully falls back to an empty array on missing data or JSON parse errors.
   * @returns {Array}
   * @private
   */
  loadFromStorage() {
    try {
      const saved = localStorage.getItem("bible-bookmarks");
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error("Failed to parse local bookmarks:", err);
      return [];
    }
  }

  /**
   * Persists the bookmarks dataset cache inside browser LocalStorage.
   * @private
   */
  saveToStorage() {
    localStorage.setItem("bible-bookmarks", JSON.stringify(this.bookmarks));
  }

  /**
   * Retrieves the current list of saved bookmarks.
   * @returns {Array}
   */
  getBookmarks() {
    return this.bookmarks;
  }

  /**
   * Adds or updates a highlighted verse bookmark.
   * Tries to find an existing bookmark with matching book/chapter/verse coords:
   * - If found: overrides the color with the newly selected highlight color.
   * - If not found: inserts a new highlight object.
   * Writes the updated array cache to LocalStorage.
   * @param {Object} verseObj - e.g. { book: 'Gen', chapter: 1, verse: 1, text: '...' }
   * @param {string} color - HSLA highlight color code
   * @param {string} version - Active translation version (e.g. 'ROV')
   * @returns {Array} updated bookmarks list
   */
  addBookmark(verseObj, color, version) {
    const newBookmark = {
      book: verseObj.book,
      chapter: verseObj.chapter,
      verse: verseObj.verse,
      color: color,
      version: version,
      text: verseObj.text
    };

    const idx = this.bookmarks.findIndex(
      b => b.book === verseObj.book && b.chapter === verseObj.chapter && b.verse === verseObj.verse
    );

    if (idx !== -1) {
      this.bookmarks[idx] = newBookmark;
    } else {
      this.bookmarks.push(newBookmark);
    }

    this.saveToStorage();
    return [...this.bookmarks];
  }

  /**
   * Removes a highlighted verse bookmark.
   * Filters out the target verse coords and saves the result to LocalStorage.
   * @param {string} book 
   * @param {number} chapter 
   * @param {number} verse 
   * @returns {Array} updated bookmarks list
   */
  removeBookmark(book, chapter, verse) {
    this.bookmarks = this.bookmarks.filter(
      b => !(b.book === book && b.chapter === chapter && b.verse === verse)
    );
    this.saveToStorage();
    return [...this.bookmarks];
  }

  /**
   * Checks if a verse is currently bookmarked/highlighted.
   * Used during card renders to apply background translucent highlight colors.
   * @param {string} book 
   * @param {number} chapter 
   * @param {number} verse 
   * @returns {Object|null} the matched highlight details or null
   */
  getHighlight(book, chapter, verse) {
    return this.bookmarks.find(
      b => b.book === book && b.chapter === chapter && b.verse === verse
    ) || null;
  }
}
