/**
 * @class SyncService
 * @description OOP Service Class handling network synchronization of bookmarks with the backing Google Sheet Apps Script API.
 * Connects to Google Apps Script Web App macros using HTTP fetch.
 * Uses 'no-cors' mode for write commands (add, delete) to send requests without failing on script redirect responses.
 */
export default class SyncService {
  /**
   * @param {string} googleScriptUrl - Google macro URL deployment prefix
   * @param {string} syncId - Shared/personal Sync Key configuration string
   */
  constructor(googleScriptUrl = "", syncId = "") {
    this.googleScriptUrl = googleScriptUrl;
    this.syncId = syncId;
  }

  /**
   * Updates configuration credentials.
   * Called when the user updates sync configuration values inside settings drawer.
   * @param {string} url 
   * @param {string} id 
   */
  configure(url, id) {
    this.googleScriptUrl = url;
    this.syncId = id;
  }

  /**
   * Retrieves bookmarked highlights stored in the remote backing database.
   * Calls Google Macro endpoint: `url?action=get&syncId=id`
   * @returns {Promise<Array>} remote bookmarks array
   */
  async pullBookmarks() {
    if (!this.googleScriptUrl) return null;
    const res = await fetch(`${this.googleScriptUrl}?action=get&syncId=${this.syncId}`);
    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data;
  }

  /**
   * Pushes a new highlight bookmark to the backing sheet in the background.
   * Uses no-cors to dispatch write signals asynchronously.
   * @param {Object} verseObj 
   * @param {string} color - HSLA color code
   * @param {string} version - Active translation version
   */
  async pushAdd(verseObj, color, version) {
    if (!this.googleScriptUrl) return;
    const url = `${this.googleScriptUrl}?action=add&syncId=${this.syncId}&book=${verseObj.book}&chapter=${verseObj.chapter}&verse=${verseObj.verse}&color=${encodeURIComponent(color)}&version=${version}&text=${encodeURIComponent(verseObj.text)}`;
    await fetch(url, { mode: 'no-cors' });
  }

  /**
   * Pushes a delete command to clear a highlight bookmark from the backing sheet.
   * Uses no-cors to dispatch delete signals asynchronously.
   * @param {string} book 
   * @param {number} chapter 
   * @param {number} verse 
   */
  async pushDelete(book, chapter, verse) {
    if (!this.googleScriptUrl) return;
    const url = `${this.googleScriptUrl}?action=delete&syncId=${this.syncId}&book=${book}&chapter=${chapter}&verse=${verse}`;
    await fetch(url, { mode: 'no-cors' });
  }
}
