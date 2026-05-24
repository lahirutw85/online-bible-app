import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Layout, 
  Menu, 
  Select, 
  Input, 
  Card, 
  Typography, 
  Space, 
  Radio, 
  Badge, 
  Spin, 
  Button, 
  Empty, 
  Tooltip, 
  ConfigProvider, 
  Popover, 
  Drawer, 
  Divider, 
  Collapse,
  message,
  theme as antdTheme 
} from 'antd';
import { 
  BookOutlined, 
  SearchOutlined, 
  TranslationOutlined, 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  ClearOutlined,
  LoadingOutlined,
  CompassOutlined,
  SunOutlined,
  MoonOutlined,
  StarFilled,
  SettingOutlined,
  DeleteOutlined,
  CloudSyncOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  CopyOutlined
} from '@ant-design/icons';
import booksData from './data/books.json';
import booksDataEn from './data/books_en.json';
import logo from './logo.jpg';

const localToHelloAoMap = {
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

const bookChaptersMap = {
  "Gen": 50, "Exod": 40, "Lev": 27, "Num": 36, "Deut": 34, "Josh": 24, "Judg": 21, "Ruth": 4,
  "1Sam": 31, "2Sam": 24, "1Kgs": 22, "2Kgs": 25, "1Chr": 29, "2Chr": 36, "Ezra": 10, "Neh": 13,
  "Esth": 10, "Job": 42, "Ps": 150, "Prov": 31, "Eccl": 12, "Song": 8, "Isa": 66, "Jer": 52,
  "Lam": 5, "Ezek": 48, "Dan": 12, "Hos": 14, "Joel": 3, "Amos": 9, "Obad": 1, "Jonah": 4,
  "Mic": 7, "Nah": 3, "Hab": 3, "Zeph": 3, "Hag": 2, "Zech": 14, "Mal": 4, "Matt": 28,
  "Mark": 16, "Luke": 24, "John": 21, "Acts": 28, "Rom": 16, "1Cor": 16, "2Cor": 13, "Gal": 6,
  "Eph": 6, "Phil": 4, "Col": 4, "1Thess": 5, "2Thess": 3, "1Tim": 6, "2Tim": 4, "Titus": 3,
  "Phlm": 1, "Heb": 13, "Jas": 5, "1Pet": 5, "2Pet": 3, "1John": 5, "2John": 1, "3John": 1,
  "Jude": 1, "Rev": 22, "Tob": 14, "Jdt": 16, "Wis": 19, "Sir": 51, "Bar": 6, "1Macc": 16, "2Macc": 15
};


const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const versionsList = [
  { value: "ROV", label: "පැරණි සංශෝධිත (Sinhala)" },
  { value: "2018", label: "2018 නව සංශෝධිත (Sinhala)" },
  { value: "BSB", label: "Berean Study Bible (English)" },
  { value: "KJV", label: "King James Version (English)" },
  { value: "ASV", label: "American Standard Version (English)" },
  { value: "BBE", label: "Bible in Basic English (English)" }
];

const antIcon = <LoadingOutlined style={{ fontSize: 32 }} spin />;



const paletteColors = [
  { name: 'රතු (Red)', hsl: 'hsla(0, 100%, 75%, 0.3)' },
  { name: 'තැඹිලි (Orange)', hsl: 'hsla(24, 100%, 75%, 0.3)' },
  { name: 'කහ (Amber)', hsl: 'hsla(45, 100%, 75%, 0.3)' },
  { name: 'ලා කහ (Yellow)', hsl: 'hsla(60, 100%, 70%, 0.35)' },
  { name: 'දෙහි (Lime)', hsl: 'hsla(80, 90%, 75%, 0.3)' },
  { name: 'ලා කොළ (Light Green)', hsl: 'hsla(100, 90%, 75%, 0.3)' },
  { name: 'කොළ (Green)', hsl: 'hsla(120, 80%, 75%, 0.3)' },
  { name: 'මින්ට් (Mint)', hsl: 'hsla(150, 80%, 75%, 0.3)' },
  { name: 'ලා නිල් (Cyan)', hsl: 'hsla(180, 80%, 75%, 0.3)' },
  { name: 'නිල් (Sky)', hsl: 'hsla(200, 90%, 75%, 0.3)' },
  { name: 'තද නිල් (Blue)', hsl: 'hsla(220, 90%, 75%, 0.3)' },
  { name: 'ඉන්ඩිගෝ (Indigo)', hsl: 'hsla(240, 80%, 75%, 0.3)' },
  { name: 'දම් (Purple)', hsl: 'hsla(260, 80%, 75%, 0.3)' },
  { name: 'ලා දම් (Violet)', hsl: 'hsla(280, 80%, 75%, 0.3)' },
  { name: 'රෝස (Magenta)', hsl: 'hsla(300, 80%, 75%, 0.3)' },
  { name: 'ලා රෝස (Pink)', hsl: 'hsla(330, 90%, 75%, 0.3)' },
  { name: 'තද රෝස (Rose)', hsl: 'hsla(345, 100%, 75%, 0.3)' },
  { name: 'අළු (Grey)', hsl: 'hsla(210, 15%, 75%, 0.3)' },
  { name: 'වැලි (Sand)', hsl: 'hsla(35, 30%, 75%, 0.3)' },
  { name: 'දුඹුරු (Teal)', hsl: 'hsla(165, 80%, 75%, 0.3)' }
];

const appsScriptCode = `function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["SyncId", "Book", "Chapter", "Verse", "Color", "Version", "Text", "Timestamp"]);
  }
  
  var params = e.parameter;
  var action = params.action;
  var syncId = params.syncId;
  
  if (!syncId) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Missing syncId" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var rows = sheet.getDataRange().getValues();
  
  if (action === "get") {
    var bookmarks = [];
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] === syncId) {
        bookmarks.push({
          book: rows[i][1],
          chapter: parseInt(rows[i][2]),
          verse: parseInt(rows[i][3]),
          color: rows[i][4],
          version: rows[i][5],
          text: rows[i][6]
        });
      }
    }
    return ContentService.createTextOutput(JSON.stringify(bookmarks))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === "add") {
    var foundIdx = -1;
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] === syncId && rows[i][1] === params.book && parseInt(rows[i][2]) === parseInt(params.chapter) && parseInt(rows[i][3]) === parseInt(params.verse)) {
        foundIdx = i;
        break;
      }
    }
    
    var timestamp = new Date();
    if (foundIdx !== -1) {
      sheet.getRange(foundIdx + 1, 5).setValue(params.color);
      sheet.getRange(foundIdx + 1, 8).setValue(timestamp);
    } else {
      sheet.appendRow([
        syncId, 
        params.book, 
        parseInt(params.chapter), 
        parseInt(params.verse), 
        params.color, 
        params.version, 
        params.text, 
        timestamp
      ]);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === "delete") {
    for (var i = rows.length - 1; i >= 1; i--) {
      if (rows[i][0] === syncId && rows[i][1] === params.book && parseInt(rows[i][2]) === parseInt(params.chapter) && parseInt(rows[i][3]) === parseInt(params.verse)) {
        sheet.deleteRow(i + 1);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ error: "Invalid action" }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export default function App() {
  const [bibleData, setBibleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState("ROV"); // 'ROV' (Old Revised) is default
  const [selectedBook, setSelectedBook] = useState("Gen");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchScope, setSearchScope] = useState("global"); // 'global' or 'book'
  const [collapsed, setCollapsed] = useState(true);
  const [searchActive, setSearchActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Compare mode states
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersion, setCompareVersion] = useState("KJV");
  const [compareBibleData, setCompareBibleData] = useState([]);
  const [compareLoading, setCompareLoading] = useState(false);

  // Full loading states for dynamic HelloAO API
  const [isFullLoaded, setIsFullLoaded] = useState(false);
  const [compareFullLoaded, setCompareFullLoaded] = useState(false);

  // BSB interlinear: Greek/Hebrew original text data
  const [searchLoading, setSearchLoading] = useState(false);

  // Double click word dictionary lookup state
  const [doubleClickWordInfo, setDoubleClickWordInfo] = useState({
    visible: false,
    x: 0,
    y: 0,
    word: '',
    verse: null,
    strongsData: null,
    loading: false,
    error: null,
    verseStrongs: []
  });
  
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem("bible-theme") || "light");

  // Sync settings states
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [googleScriptUrl, setGoogleScriptUrl] = useState(() => localStorage.getItem("bible-script-url") || "");
  const [syncId, setSyncId] = useState(() => {
    const saved = localStorage.getItem("bible-sync-id");
    if (saved) return saved;
    const generated = "B-" + Math.floor(100000 + Math.random() * 900000);
    localStorage.setItem("bible-sync-id", generated);
    return generated;
  });

  // Bookmarks state (highlights)
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem("bible-bookmarks");
    return saved ? JSON.parse(saved) : [];
  });

  // Detect mobile viewport
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true); // default to closed drawer on mobile
      } else {
        setCollapsed(false); // default to open sidebar on desktop
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync theme to root HTML element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem("bible-theme", theme);
  }, [theme]);

  // Sync variables to localStorage
  useEffect(() => {
    localStorage.setItem("bible-script-url", googleScriptUrl);
  }, [googleScriptUrl]);

  useEffect(() => {
    localStorage.setItem("bible-sync-id", syncId);
  }, [syncId]);

  useEffect(() => {
    localStorage.setItem("bible-bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Sync bookmarks from Google Sheets on load
  const syncBookmarks = useCallback(async (url = googleScriptUrl, id = syncId) => {
    if (!url) return;
    setSyncing(true);
    try {
      const res = await fetch(`${url}?action=get&syncId=${id}`);
      const remoteBookmarks = await res.json();
      if (Array.isArray(remoteBookmarks)) {
        setBookmarks(remoteBookmarks);
        message.success("සුරැකි පද සාර්ථකව සංසන්දනය කරන ලදී! (Sync complete)");
      } else if (remoteBookmarks.error) {
        message.error("සංසන්දන දෝෂය: " + remoteBookmarks.error);
      }
    } catch (err) {
      console.error("Failed to sync bookmarks:", err);
      message.error("සංසන්දනය අසාර්ථක විය. (Sync failed)");
    } finally {
      setSyncing(false);
    }
  }, [googleScriptUrl, syncId]);

  // Run sync on startup if URL is configured
  useEffect(() => {
    if (googleScriptUrl) {
      syncBookmarks(googleScriptUrl, syncId);
    }
  }, [googleScriptUrl, syncId, syncBookmarks]);

  // Reset isFullLoaded when version changes to an API version
  useEffect(() => {
    const apiVersions = { "KJV": "eng_kjv", "ASV": "eng_asv", "BBE": "eng_bbe", "BSB": "BSB" };
    if (apiVersions[version]) {
      setIsFullLoaded(false);
    }
  }, [version]);

  // Reset compareFullLoaded when compareVersion changes to an API version
  useEffect(() => {
    const apiVersions = { "KJV": "eng_kjv", "ASV": "eng_asv", "BBE": "eng_bbe", "BSB": "BSB" };
    if (apiVersions[compareVersion]) {
      setCompareFullLoaded(false);
    }
  }, [compareVersion]);

  // Lazy load Bible data when version, selectedBook, or selectedChapter changes
  useEffect(() => {
    const apiVersions = { "KJV": "eng_kjv", "ASV": "eng_asv", "BBE": "eng_bbe", "BSB": "BSB" };
    
    if (apiVersions[version]) {
      if (isFullLoaded) return;
      setLoading(true);
      const helloAoId = apiVersions[version];
      const helloAoBookId = localToHelloAoMap[selectedBook] || selectedBook;
      const url = `https://bible.helloao.org/api/${helloAoId}/${helloAoBookId}/${selectedChapter}.json`;
      
      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch chapter");
          return res.json();
        })
        .then(data => {
          const flat = [];
          const ch = data.chapter;
          if (ch && Array.isArray(ch.content)) {
            ch.content.forEach(item => {
              if (item.type === 'verse') {
                const verseNum = item.number || item.verse;
                const text = item.content
                  .filter(part => typeof part === 'string')
                  .join(' ');
                flat.push({
                  book: selectedBook,
                  chapter: selectedChapter,
                  verse: typeof verseNum === 'string' ? parseInt(verseNum) : verseNum,
                  text: text
                });
              }
            });
          }
          setBibleData(flat);
          setLoading(false);
        })
        .catch(err => {
          console.error("API Fetch error:", err);
          setLoading(false);
        });
    } else {
      setLoading(true);
      let dataPromise = version === '2018' ? import('./data/sinnrv2018.json') : import('./data/sirov.json');
      dataPromise
        .then((module) => {
          const mapped = module.default.map(v => ({
            book: v.b,
            chapter: v.c,
            verse: v.v,
            text: v.t
          }));
          setBibleData(mapped);
          setIsFullLoaded(true);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load local Bible:", err);
          setLoading(false);
        });
    }
  }, [version, selectedBook, selectedChapter, isFullLoaded]);

  // Check if a translation is English
  const isEnglishVersion = useCallback((ver) => {
    return ['BSB', 'KJV', 'ASV', 'BBE'].includes(ver);
  }, []);

  // Fetch Strong's Definition
  const fetchStrongsDefinition = useCallback((strongsNumber, verseStrongs = [], matchedKjvWord = '') => {
    setDoubleClickWordInfo(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    fetch(`https://api.biblesupersearch.com/api/strongs?strongs=${strongsNumber}`)
      .then(res => res.json())
      .then(data => {
        if (!data.results || data.results.length === 0) {
          throw new Error(`No definition found for Strong's ${strongsNumber}`);
        }
        const def = data.results[0];
        setDoubleClickWordInfo(prev => ({
          ...prev,
          loading: false,
          strongsData: {
            number: strongsNumber,
            matchedWord: matchedKjvWord || prev.word,
            rootWord: def.root_word,
            transliteration: def.transliteration,
            pronunciation: def.pronunciation,
            entry: def.entry
          },
          verseStrongs: verseStrongs.length > 0 ? verseStrongs : prev.verseStrongs
        }));
      })
      .catch(err => {
        console.error("Strong's definition fetch error:", err);
        setDoubleClickWordInfo(prev => ({
          ...prev,
          loading: false,
          error: `Failed to load definition: ${err.message}`,
          verseStrongs: verseStrongs.length > 0 ? verseStrongs : prev.verseStrongs
        }));
      });
  }, []);

  // Fetch KJV Strongs and map word
  const fetchStrongsMappingAndLookup = useCallback((verseObj, cleanWord) => {
    const helloAoBookId = localToHelloAoMap[verseObj.book] || verseObj.book;
    const url = `https://api.biblesupersearch.com/api?bible=kjv_strongs&reference=${helloAoBookId}+${verseObj.chapter}:${verseObj.verse}&markup=raw`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!data.results || data.results.length === 0) {
          throw new Error("No interlinear data found for this verse.");
        }
        const verseData = data.results[0].verses.kjv_strongs;
        const chapterData = verseData[verseObj.chapter];
        if (!chapterData) throw new Error("Chapter data not found.");
        const verseTextObj = chapterData[verseObj.verse];
        if (!verseTextObj) throw new Error("Verse text not found.");
        const text = verseTextObj.text;

        // Parse words and associated Strong's numbers
        const wordsWithStrongs = [];
        const parts = text.split(/\s+/);
        parts.forEach(part => {
          const wordMatch = part.match(/^([A-Za-z]+(?:'[A-Za-z]+)?)/i);
          if (wordMatch) {
            const word = wordMatch[1].toLowerCase();
            const strongsMatches = [...part.matchAll(/\{([GH][0-9]+)\}/gi)].map(m => m[1]);
            wordsWithStrongs.push({ 
              word: wordMatch[1],
              cleanWord: word,
              strongs: strongsMatches 
            });
          }
        });

        // Match clicked word
        const searchWord = cleanWord.toLowerCase();
        let match = wordsWithStrongs.find(w => w.cleanWord === searchWord);
        
        if (!match) {
          match = wordsWithStrongs.find(w => 
            w.cleanWord.startsWith(searchWord) || 
            searchWord.startsWith(w.cleanWord) ||
            w.cleanWord.includes(searchWord) ||
            searchWord.includes(w.cleanWord)
          );
        }

        if (match && match.strongs && match.strongs.length > 0) {
          const strongsNumber = match.strongs[0];
          fetchStrongsDefinition(strongsNumber, wordsWithStrongs, match.word);
        } else {
          setDoubleClickWordInfo(prev => ({
            ...prev,
            loading: false,
            verseStrongs: wordsWithStrongs,
            error: `Could not automatically match "${cleanWord}". Please select a word from the verse below to see its root meaning:`
          }));
        }
      })
      .catch(err => {
        console.error("KJV Strong's mapping fetch error:", err);
        setDoubleClickWordInfo(prev => ({
          ...prev,
          loading: false,
          error: `Failed to load interlinear mapping: ${err.message}`
        }));
      });
  }, [fetchStrongsDefinition]);

  // Handle double-click event
  const handleVerseDoubleClick = useCallback((e, verseObj, activeVer) => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    // Clean punctuation
    const cleanWord = selectedText.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, "").trim();
    if (!cleanWord) return;

    let x = e.clientX;
    let y = e.clientY;
    try {
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        x = rect.left + rect.width / 2 + window.scrollX;
        y = rect.bottom + window.scrollY;
      }
    } catch (err) {
      console.error("Error getting selection rect:", err);
    }

    setDoubleClickWordInfo({
      visible: true,
      x,
      y,
      word: cleanWord,
      verse: verseObj,
      loading: true,
      error: null,
      strongsData: null,
      verseStrongs: []
    });

    fetchStrongsMappingAndLookup(verseObj, cleanWord);
  }, [fetchStrongsMappingAndLookup]);

  // Close double-click tooltip on outside click
  useEffect(() => {
    if (!doubleClickWordInfo.visible) return;

    const handleOutsideClick = (e) => {
      const tooltipEl = document.getElementById('doubleclick-lexicon-tooltip');
      if (tooltipEl && !tooltipEl.contains(e.target)) {
        setDoubleClickWordInfo(prev => ({ ...prev, visible: false }));
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [doubleClickWordInfo.visible]);

  // Render double-click lexicon card
  const renderDoubleClickTooltip = () => {
    if (!doubleClickWordInfo.visible) return null;

    const { x, y, strongsData, loading, error, verseStrongs } = doubleClickWordInfo;
    const tooltipWidth = 360;
    const tooltipHeight = 350;
    
    let left = x - tooltipWidth / 2;
    let top = y + 10;

    if (left + tooltipWidth > window.innerWidth) {
      left = window.innerWidth - tooltipWidth - 20;
    }
    if (left < 10) {
      left = 10;
    }

    if (y + tooltipHeight > document.documentElement.scrollHeight) {
      top = y - tooltipHeight - 20;
    }
    if (top < 10) {
      top = 10;
    }

    return (
      <div 
        id="doubleclick-lexicon-tooltip"
        className="doubleclick-tooltip-card"
        style={{
          position: 'absolute',
          left: `${left}px`,
          top: `${top}px`,
          zIndex: 10000,
          width: `${tooltipWidth}px`
        }}
      >
        <div className="tooltip-header">
          <span className="tooltip-title">📖 Word Lexicon Study</span>
          <Button 
            type="text" 
            size="small" 
            icon={<span style={{ fontWeight: 'bold' }}>×</span>} 
            onClick={() => setDoubleClickWordInfo(prev => ({ ...prev, visible: false }))} 
            style={{ color: 'var(--text-secondary)' }}
          />
        </div>

        <div className="tooltip-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
              <div style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>Searching Strong's concordance...</div>
            </div>
          ) : error ? (
            <div style={{ padding: '8px 0' }}>
              <div style={{ color: 'var(--accent-color)', fontSize: '13px', marginBottom: '12px' }}>
                {error}
              </div>
              {verseStrongs.length > 0 && (
                <div className="verse-words-list">
                  {verseStrongs.map((w, idx) => (
                    <Button 
                      key={idx} 
                      size="small" 
                      type="dashed"
                      disabled={w.strongs.length === 0}
                      onClick={() => w.strongs.length > 0 && fetchStrongsDefinition(w.strongs[0], verseStrongs, w.word)}
                      style={{ margin: '4px', borderRadius: '4px' }}
                    >
                      {w.word} {w.strongs.length > 0 ? `(${w.strongs[0]})` : ''}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ) : strongsData ? (
            <div>
              <div className="tooltip-section info-section">
                <div className="tooltip-row">
                  <span className="label">English Word:</span>
                  <span className="value english-word">{strongsData.matchedWord}</span>
                </div>
                <div className="tooltip-row">
                  <span className="label">Root Word:</span>
                  <span className="value original-greek-text" dangerouslySetInnerHTML={{ __html: strongsData.rootWord }} />
                </div>
                <div className="tooltip-row">
                  <span className="label">Transliteration:</span>
                  <span className="value transliteration">{strongsData.transliteration}</span>
                </div>
                {strongsData.pronunciation && (
                  <div className="tooltip-row">
                    <span className="label">Pronunciation:</span>
                    <span className="value pronunciation">[{strongsData.pronunciation}]</span>
                  </div>
                )}
                <div className="tooltip-row">
                  <span className="label">Strong's ID:</span>
                  <span className="value strongs-code">{strongsData.number}</span>
                </div>
              </div>

              <div className="tooltip-section definition-section">
                <div className="sub-heading">Strong's Definition:</div>
                <div 
                  className="definition-entry" 
                  dangerouslySetInnerHTML={{ __html: strongsData.entry }} 
                />
              </div>

              {verseStrongs.length > 0 && (
                <div className="tooltip-section select-other-section">
                  <Collapse ghost size="small">
                    <Collapse.Panel header="Compare other words in this verse" key="1">
                      <div className="verse-words-list">
                        {verseStrongs.map((w, idx) => (
                          <Button 
                            key={idx} 
                            size="small" 
                            type={strongsData.number === w.strongs[0] ? 'primary' : 'default'}
                            disabled={w.strongs.length === 0}
                            onClick={() => w.strongs.length > 0 && fetchStrongsDefinition(w.strongs[0], verseStrongs, w.word)}
                            style={{ margin: '3px', borderRadius: '4px', fontSize: '11px' }}
                          >
                            {w.word}
                          </Button>
                        ))}
                      </div>
                    </Collapse.Panel>
                  </Collapse>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: 'var(--text-secondary)' }}>No data loaded.</div>
          )}
        </div>
      </div>
    );
  };

  // Lazy load Compare Bible data when compareVersion, compareMode, selectedBook, or selectedChapter changes
  useEffect(() => {
    if (!compareMode) return;
    const apiVersions = { "KJV": "eng_kjv", "ASV": "eng_asv", "BBE": "eng_bbe", "BSB": "BSB" };
    
    if (apiVersions[compareVersion]) {
      if (compareFullLoaded) return;
      setCompareLoading(true);
      const helloAoId = apiVersions[compareVersion];
      const helloAoBookId = localToHelloAoMap[selectedBook] || selectedBook;
      const url = `https://bible.helloao.org/api/${helloAoId}/${helloAoBookId}/${selectedChapter}.json`;
      
      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch chapter");
          return res.json();
        })
        .then(data => {
          const flat = [];
          const ch = data.chapter;
          if (ch && Array.isArray(ch.content)) {
            ch.content.forEach(item => {
              if (item.type === 'verse') {
                const verseNum = item.number || item.verse;
                const text = item.content
                  .filter(part => typeof part === 'string')
                  .join(' ');
                flat.push({
                  book: selectedBook,
                  chapter: selectedChapter,
                  verse: typeof verseNum === 'string' ? parseInt(verseNum) : verseNum,
                  text: text
                });
              }
            });
          }
          setCompareBibleData(flat);
          setCompareLoading(false);
        })
        .catch(err => {
          console.error("API Compare Fetch error:", err);
          setCompareLoading(false);
        });
    } else {
      setCompareLoading(true);
      let dataPromise = compareVersion === '2018' ? import('./data/sinnrv2018.json') : import('./data/sirov.json');
      dataPromise
        .then((module) => {
          const mapped = module.default.map(v => ({
            book: v.b,
            chapter: v.c,
            verse: v.v,
            text: v.t
          }));
          setCompareBibleData(mapped);
          setCompareFullLoaded(true);
          setCompareLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load local compare Bible:", err);
          setCompareLoading(false);
        });
    }
  }, [compareVersion, compareMode, selectedBook, selectedChapter, compareFullLoaded]);

  // Get active books list based on active version language
  const activeBooks = useMemo(() => {
    switch (version) {
      case 'KJV':
      case 'ASV':
      case 'BBE':
      case 'BSB':
        return booksDataEn;
      default:
        return booksData;
    }
  }, [version]);

  // Get book name for a specific code and version language
  const getBookName = useCallback((bookCode, forVersion) => {
    let bookSet = booksData;
    switch (forVersion) {
      case 'KJV':
      case 'ASV':
      case 'BBE':
      case 'BSB':
        bookSet = booksDataEn;
        break;
      default:
        bookSet = booksData;
    }
    const book = bookSet.find(b => b.code === bookCode);
    return book ? book.name : bookCode;
  }, []);

  // Get language code for active version
  const getLanguage = useCallback(() => {
    switch (version) {
      case 'KJV':
      case 'ASV':
      case 'BBE':
      case 'BSB':
        return 'en';
      default:
        return 'si';
    }
  }, [version]);

  // Translate UI strings to active language
  const t = useCallback((key) => {
    const lang = getLanguage();
    const strings = {
      si: {
        subtitle: "ශුද්ධ වූ බයිබලය",
        index: "නාමාවලිය",
        bookmarks: "සුරැකි පද (Bookmarks)",
        syncKey: "සංසන්දන කේතය (Sync ID):",
        settings: "සිටුවම්",
        searchPlaceholder: "පද සොයන්න (Search)...",
        versionLabel: "පරිවර්තනය (Version):",
        searchLabel: "පද සෙවීම (Search):",
        searchScopeLabel: "සෙවුම් සීමාව (Search Scope):",
        allBooks: "සියලු පොත්",
        thisBook: "මෙම පොතෙන්",
        previousChapter: "පෙර පරිච්ඡේදය",
        nextChapter: "ඊළඟ පරිච්ඡේදය",
        chapterLabel: "පරිච්ඡේදය",
        loadingText: "දත්ත පූරණය වෙමින් පවතී. කරුණාකර රැඳී සිටින්න...",
        savedBookmarksTitle: "සුරැකි පද (Saved Bookmarks)",
        savedBookmarksDesc: "ඔබ විසින් පාට කර සලකුණු කරන ලද බයිබල් පද මෙහි දැක්වේ.",
        readButton: "කියවන්න",
        noBookmarks: "තවමත් කිසිදු පදයක් සලකුණු කර නැත. කියවන විට පදයේ අංකය ක්ලික් කර පාටක් තෝරන්න.",
        searchResultTitle: "සොයන පදය",
        globalSearchScope: "මුළු බයිබලය පුරාම",
        bookSearchScope: "පොත තුළ",
        resultsCount: "ප්‍රතිඵල",
        clearSearchButton: "සෙවීම අවසන් කරන්න",
        selectChapterLabel: "පරිච්ඡේදය තෝරන්න (Select Chapter):",
        highlightPopoverTitle: "පදය පාට කරන්න (Highlight Color):",
        clearHighlightButton: "පාට ඉවත් කරන්න (Clear)",
        noVersesForChapter: "මෙම පරිච්ඡේදය සඳහා දත්ත නොමැත.",
        searchNoResults: "පද කිසිවක් සොයාගත නොහැකි විය.",
        clearSearch: "සෙවීම ඉවත් කරන්න",
        searchLimitNotice: "සෙවුම් ප්‍රතිඵල ඉතා විශාල බැවින් පළමු පද 150 පමණක් පෙන්වනු ලැබේ.",
        compareModeActive: "සංසන්දනය අක්‍රිය කරන්න",
        compareModeInactive: "සංසන්දනය (Compare)",
        compareVersionLabel: "සංසන්දනය කරන පරිවර්තනය (Compare Version):"
      },
      en: {
        subtitle: "Holy Bible",
        index: "Books Index",
        bookmarks: "Saved Bookmarks",
        syncKey: "Sync ID:",
        settings: "Settings",
        searchPlaceholder: "Search verses...",
        versionLabel: "Version:",
        searchLabel: "Search:",
        searchScopeLabel: "Search Scope:",
        allBooks: "All Books",
        thisBook: "This Book",
        previousChapter: "Previous Chapter",
        nextChapter: "Next Chapter",
        chapterLabel: "Chapter",
        loadingText: "Loading Bible data. Please wait...",
        savedBookmarksTitle: "Saved Bookmarks",
        savedBookmarksDesc: "Here are your saved and highlighted verses.",
        readButton: "Read",
        noBookmarks: "No bookmarks saved yet. Click a verse number to highlight and bookmark it.",
        searchResultTitle: "Search Query",
        globalSearchScope: "Entire Bible",
        bookSearchScope: "Within this book",
        resultsCount: "Results",
        clearSearchButton: "Clear Search",
        selectChapterLabel: "Select Chapter:",
        highlightPopoverTitle: "Highlight Color:",
        clearHighlightButton: "Clear Highlight",
        noVersesForChapter: "No data available for this chapter.",
        searchNoResults: "No matching verses found.",
        clearSearch: "Clear Search",
        searchLimitNotice: "Due to large search results, only the first 150 verses are shown.",
        compareModeActive: "Disable Compare",
        compareModeInactive: "Compare Versions",
        compareVersionLabel: "Compare Version:"
      }
    };
    return strings[lang]?.[key] || strings.si[key] || key;
  }, [getLanguage]);

  // Determine books available in the current translation
  const availableBooks = useMemo(() => {
    const apiVersions = { "KJV": "eng_kjv", "ASV": "eng_asv", "BBE": "eng_bbe", "BSB": "BSB" };
    if (apiVersions[version]) {
      return activeBooks;
    }
    if (bibleData.length === 0) return [];
    const bookCodes = new Set(bibleData.map(v => v.book));
    return activeBooks.filter(b => bookCodes.has(b.code));
  }, [bibleData, activeBooks, version]);

  // Set default book if current selection is invalid
  useEffect(() => {
    if (selectedBook === "bookmarks") return;
    if (availableBooks.length > 0) {
      const isSelectedBookAvailable = availableBooks.some(b => b.code === selectedBook);
      if (!isSelectedBookAvailable) {
        setSelectedBook(availableBooks[0].code);
        setSelectedChapter(1);
      }
    }
  }, [availableBooks, selectedBook]);

  // Get active book name in selected language
  const currentBookName = useMemo(() => {
    if (selectedBook === "bookmarks") {
      switch (version) {
        case 'KJV':
        case 'ASV':
        case 'BBE':
        case 'BSB':
          return "Saved Bookmarks";
        default:
          return "සුරැකි පද";
      }
    }
    const book = activeBooks.find(b => b.code === selectedBook);
    return book ? book.name : "";
  }, [selectedBook, activeBooks, version]);

  // Get total chapters in the currently selected book
  const totalChapters = useMemo(() => {
    if (selectedBook === "bookmarks") return 0;
    return bookChaptersMap[selectedBook] || 0;
  }, [selectedBook]);

  // Reset chapter selection if it exceeds total chapters of new book
  useEffect(() => {
    if (selectedBook !== "bookmarks" && totalChapters > 0 && selectedChapter > totalChapters) {
      setSelectedChapter(1);
    }
  }, [selectedBook, totalChapters, selectedChapter]);

  // Filter verses based on state
  const displayedVerses = useMemo(() => {
    if (bibleData.length === 0 || selectedBook === "bookmarks") return [];

    if (searchActive && searchTerm.trim() !== "") {
      const normalizedSearch = searchTerm.trim().toLowerCase();
      
      return bibleData.filter(v => {
        const matchesText = v.text.toLowerCase().includes(normalizedSearch);
        if (!matchesText) return false;
        
        if (searchScope === 'book') {
          return v.book === selectedBook;
        }
        return true;
      });
    }

    return bibleData.filter(v => v.book === selectedBook && v.chapter === selectedChapter);
  }, [bibleData, selectedBook, selectedChapter, searchTerm, searchScope, searchActive]);

  // Render highlighted text for search results
  const renderHighlightedText = (text, highlight) => {
    if (!highlight || highlight.trim() === "") return text;
    
    const escapedHighlight = highlight.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.trim().toLowerCase() 
            ? <span key={i} className="highlight">{part}</span> 
            : part
        )}
      </span>
    );
  };

  // Trigger search
  const handleSearch = async (val) => {
    if (val.trim() === "") {
      clearSearch();
      return;
    }

    const apiVersions = { "KJV": "eng_kjv", "ASV": "eng_asv", "BBE": "eng_bbe", "BSB": "BSB" };

    if (apiVersions[version] && !isFullLoaded) {
      setSearchLoading(true);
      try {
        const res = await fetch(`https://bible.helloao.org/api/${apiVersions[version]}/complete.json`);
        if (!res.ok) throw new Error("Failed to fetch full Bible JSON");
        const data = await res.json();
        
        // Flatten complete.json
        const flat = [];
        const helloAoToLocalMap = {};
        for (const [localCode, helloAoId] of Object.entries(localToHelloAoMap)) {
          helloAoToLocalMap[helloAoId] = localCode;
        }

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
        setBibleData(flat);
        setIsFullLoaded(true);
      } catch (err) {
        console.error("Failed to load search database:", err);
        message.error("සෙවුම් දත්ත පූරණය අසාර්ථක විය. (Failed to load search database from API)");
      } finally {
        setSearchLoading(false);
      }
    }

    // Load compared API version if needed
    if (compareMode && apiVersions[compareVersion] && !compareFullLoaded) {
      setSearchLoading(true);
      try {
        const res = await fetch(`https://bible.helloao.org/api/${apiVersions[compareVersion]}/complete.json`);
        if (!res.ok) throw new Error("Failed to fetch full compare Bible JSON");
        const data = await res.json();
        
        const flat = [];
        const helloAoToLocalMap = {};
        for (const [localCode, helloAoId] of Object.entries(localToHelloAoMap)) {
          helloAoToLocalMap[helloAoId] = localCode;
        }

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
        setCompareBibleData(flat);
        setCompareFullLoaded(true);
      } catch (err) {
        console.error("Failed to load compare search database:", err);
      } finally {
        setSearchLoading(false);
      }
    }

    setSearchTerm(val);
    setSearchActive(true);
  };

  // Reset Search
  const clearSearch = () => {
    setSearchTerm("");
    setSearchActive(false);
  };

  // Navigate to previous/next chapter
  const handlePrevChapter = () => {
    if (selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
    } else {
      const currentIdx = availableBooks.findIndex(b => b.code === selectedBook);
      if (currentIdx > 0) {
        const prevBook = availableBooks[currentIdx - 1].code;
        setSelectedBook(prevBook);
        const prevTotalCh = bookChaptersMap[prevBook] || 0;
        setSelectedChapter(prevTotalCh);
      }
    }
  };

  const handleNextChapter = () => {
    if (selectedChapter < totalChapters) {
      setSelectedChapter(selectedChapter + 1);
    } else {
      const currentIdx = availableBooks.findIndex(b => b.code === selectedBook);
      if (currentIdx < availableBooks.length - 1) {
        const nextBook = availableBooks[currentIdx + 1].code;
        setSelectedBook(nextBook);
        setSelectedChapter(1);
      }
    }
  };

  // Add/Update bookmark (highlight)
  const handleAddBookmark = (v, color) => {
    const newBookmark = {
      book: v.book,
      chapter: v.chapter,
      verse: v.verse,
      color: color,
      version: version,
      text: v.text
    };
    
    const idx = bookmarks.findIndex(b => b.book === v.book && b.chapter === v.chapter && b.verse === v.verse);
    let updated;
    if (idx !== -1) {
      updated = [...bookmarks];
      updated[idx] = newBookmark;
    } else {
      updated = [...bookmarks, newBookmark];
    }
    setBookmarks(updated);
    message.success("පදය සුරකින ලදී! (Verse bookmarked)");
    
    // Sync to Google Sheet if url is configured
    if (googleScriptUrl) {
      const url = `${googleScriptUrl}?action=add&syncId=${syncId}&book=${v.book}&chapter=${v.chapter}&verse=${v.verse}&color=${encodeURIComponent(color)}&version=${version}&text=${encodeURIComponent(v.text)}`;
      fetch(url, { mode: 'no-cors' }).catch(err => console.error("Sync add error:", err));
    }
  };

  // Remove bookmark (highlight)
  const handleRemoveBookmark = (book, chapter, verse) => {
    const updated = bookmarks.filter(b => !(b.book === book && b.chapter === chapter && b.verse === verse));
    setBookmarks(updated);
    message.info("පදය ඉවත් කරන ලදී. (Bookmark removed)");
    
    // Sync to Google Sheet if url is configured
    if (googleScriptUrl) {
      const url = `${googleScriptUrl}?action=delete&syncId=${syncId}&book=${book}&chapter=${chapter}&verse=${verse}`;
      fetch(url, { mode: 'no-cors' }).catch(err => console.error("Sync delete error:", err));
    }
  };

  // Navigate to bookmarked verse in reading view
  const handleJumpToVerse = (b) => {
    setVersion(b.version);
    setSelectedBook(b.book);
    setSelectedChapter(b.chapter);
    clearSearch();
    
    setTimeout(() => {
      const el = document.getElementById(`v-${b.verse}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('flash-effect');
        setTimeout(() => el.classList.remove('flash-effect'), 2000);
      }
    }, 400);
  };

  // Copy sync key to clipboard
  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    message.success("පිටපත් කරන ලදී! (Copied)");
  };

  // Sider and Drawer Shared Content
  const renderSiderContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="sider-header">
        <span><BookOutlined style={{ marginRight: '8px' }} />{t('index')}</span>
      </div>

      {/* Responsive mobile panel for version selectors & search */}
      {isMobile && (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid var(--border-color)', background: theme === 'dark' ? '#111827' : '#f7fafc' }}>
          <div>
            <Button 
              type={compareMode ? "primary" : "default"}
              size="small"
              icon={<TranslationOutlined />}
              onClick={() => setCompareMode(!compareMode)}
              style={{ width: '100%', marginBottom: '12px', borderRadius: '8px' }}
            >
              {compareMode ? t('compareModeActive') : t('compareModeInactive')}
            </Button>
            <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>{t('versionLabel')}</Text>
            <Select 
              value={version} 
              onChange={(val) => {
                setVersion(val);
                setCollapsed(true); // auto-collapse sidebar drawer on mobile
              }} 
              style={{ width: '100%' }}
              dropdownStyle={{ borderRadius: '8px' }}
              disabled={selectedBook === "bookmarks"}
            >
              {versionsList.map(v => (
                <Select.Option key={v.value} value={v.value}>{v.label}</Select.Option>
              ))}
            </Select>

            {compareMode && (
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>{t('compareVersionLabel')}</Text>
                <Select 
                  value={compareVersion} 
                  onChange={(val) => {
                    setCompareVersion(val);
                    setCollapsed(true); // auto-collapse sidebar drawer on mobile
                  }} 
                  style={{ width: '100%' }}
                  dropdownStyle={{ borderRadius: '8px' }}
                  disabled={selectedBook === "bookmarks"}
                >
                  {versionsList.map(v => (
                    <Select.Option key={v.value} value={v.value}>{v.label}</Select.Option>
                  ))}
                </Select>
              </div>
            )}
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>{t('searchLabel')}</Text>
            {selectedBook !== "bookmarks" && (
              <Input.Search 
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={(val) => {
                  handleSearch(val);
                  setCollapsed(true); // auto-collapse sidebar drawer on mobile
                }}
                allowClear
                style={{ width: '100%' }} 
              />
            )}
          </div>
          {searchActive && selectedBook !== "bookmarks" && (
            <div>
              <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>{t('searchScopeLabel')}</Text>
              <Radio.Group 
                value={searchScope} 
                onChange={(e) => {
                  setSearchScope(e.target.value);
                  setCollapsed(true);
                }}
                optionType="button"
                buttonStyle="solid"
                size="small"
                style={{ width: '100%', display: 'flex' }}
              >
                <Radio.Button value="global" style={{ flex: 1, textAlign: 'center' }}>{t('allBooks')}</Radio.Button>
                <Radio.Button value="book" style={{ flex: 1, textAlign: 'center' }}>{t('thisBook')}</Radio.Button>
              </Radio.Group>
            </div>
          )}
        </div>
      )}

      {/* Books Menu */}
      <div style={{ flexGrow: 1, overflowY: 'auto' }}>
        <Menu 
          mode="vertical" 
          selectedKeys={[selectedBook]}
          theme={theme}
          onClick={(info) => {
            setSelectedBook(info.key);
            if (info.key !== "bookmarks") {
              setSelectedChapter(1);
            }
            setSearchActive(false);
            setSearchTerm("");
            if (isMobile) {
              setCollapsed(true); // close drawer on selection
            }
          }}
          items={[
            {
              key: "bookmarks",
              icon: <StarFilled style={{ color: '#fadb14' }} />,
              label: (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span>{t('bookmarks')}</span>
                  <Badge count={bookmarks.length} overflowCount={99} color="#fadb14" style={{ color: '#000', fontSize: '10px' }} />
                </div>
              )
            },
            {
              type: "divider"
            },
            ...availableBooks.map(b => ({
              key: b.code,
              icon: <BookOutlined />,
              label: b.name
            }))
          ]}
        />
      </div>

      {/* Sider Footer Settings */}
      <div style={{ 
        padding: '16px 20px', 
        borderTop: '1px solid var(--border-color)', 
        display: 'flex', 
        justifyContent: (collapsed && !isMobile) ? 'center' : 'space-between',
        alignItems: 'center',
        background: theme === 'dark' ? '#111827' : '#f7fafc'
      }}>
        {(!collapsed || isMobile) ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Text type="secondary" style={{ fontSize: '10px' }}>{t('syncKey')}</Text>
              <Text strong style={{ fontSize: '13px', color: '#1890ff' }}>{syncId}</Text>
            </div>
            <Button 
              type="primary" 
              ghost 
              size="small" 
              icon={<SettingOutlined />} 
              onClick={() => {
                setSettingsVisible(true);
                if (isMobile) setCollapsed(true);
              }}
            >
              {t('settings')}
            </Button>
          </>
        ) : (
          <Button 
            type="text" 
            icon={<SettingOutlined />} 
            onClick={() => setSettingsVisible(true)}
          />
        )}
      </div>
    </div>
  );

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          fontFamily: "'Outfit', 'Noto Sans Sinhala', sans-serif",
          borderRadius: 12,
          colorPrimary: "#1890ff",
        }
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        {/* Responsive Header */}
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
            <Button 
              type="text" 
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} 
              onClick={() => setCollapsed(!collapsed)} 
              style={{ fontSize: '16px', width: 40, height: 40 }}
            />
            <img src={logo} alt="Bibalaya Logo" style={{ height: isMobile ? '32px' : '36px', width: isMobile ? '32px' : '36px', borderRadius: '8px', objectFit: 'cover' }} />
            <Title level={isMobile ? 5 : 4} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em', color: theme === 'dark' ? '#f8fafc' : '#2c3e50', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Bibalaya.com {!isMobile && <span style={{ fontSize: '12px', opacity: 0.5, fontWeight: 400, marginTop: '4px', color: theme === 'dark' ? '#94a3b8' : '#718096' }}>{t('subtitle')}</span>}
            </Title>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }}>
            {!isMobile && (
              <Space>
                <Button 
                  type={compareMode ? "primary" : "default"}
                  icon={<TranslationOutlined />}
                  onClick={() => setCompareMode(!compareMode)}
                >
                  {compareMode ? t('compareModeActive') : t('compareModeInactive')}
                </Button>
                
                <Select 
                  value={version} 
                  onChange={(val) => setVersion(val)} 
                  style={{ width: compareMode ? 200 : 280 }}
                  dropdownStyle={{ borderRadius: '8px' }}
                  disabled={selectedBook === "bookmarks"}
                >
                  {versionsList.map(v => (
                    <Select.Option key={v.value} value={v.value}>{v.label}</Select.Option>
                  ))}
                </Select>

                {compareMode && (
                  <Select 
                    value={compareVersion} 
                    onChange={(val) => setCompareVersion(val)} 
                    style={{ width: 200 }}
                    dropdownStyle={{ borderRadius: '8px' }}
                    disabled={selectedBook === "bookmarks"}
                  >
                    {versionsList.map(v => (
                      <Select.Option key={v.value} value={v.value}>{v.label}</Select.Option>
                    ))}
                  </Select>
                )}
              </Space>
            )}

            {/* Theme Toggle Button */}
            <Tooltip title={theme === 'dark' ? "Light Mode" : "Dark Mode"}>
              <Button 
                type="text" 
                icon={theme === 'dark' ? <SunOutlined style={{ color: '#fadb14', fontSize: '18px' }} /> : <MoonOutlined style={{ color: '#4a5568', fontSize: '18px' }} />}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                style={{ width: 40, height: 40, borderRadius: '8px' }}
              />
            </Tooltip>

            {/* Search Scope (Desktop Only) */}
            {!isMobile && searchActive && selectedBook !== "bookmarks" && (
              <Radio.Group 
                value={searchScope} 
                onChange={(e) => setSearchScope(e.target.value)}
                optionType="button"
                buttonStyle="solid"
                size="middle"
              >
                <Radio.Button value="global">{t('allBooks')}</Radio.Button>
                <Radio.Button value="book">{t('thisBook')}</Radio.Button>
              </Radio.Group>
            )}

            {/* Search Field (Desktop Only) */}
            {!isMobile && selectedBook !== "bookmarks" && (
              <Input.Search 
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onSearch={handleSearch}
                allowClear
                style={{ width: 280 }} 
              />
            )}
          </div>
        </Header>

        <Layout>
          {/* Books Drawer for Mobile, Sider for Desktop */}
          {isMobile ? (
            <Drawer
              placement="left"
              onClose={() => setCollapsed(true)}
              open={!collapsed}
              width={290}
              headerStyle={{ display: 'none' }}
              bodyStyle={{ padding: 0, height: '100%' }}
            >
              {renderSiderContent()}
            </Drawer>
          ) : (
            <Sider 
              trigger={null} 
              collapsible 
              collapsed={collapsed} 
              width={280} 
              collapsedWidth={0}
              style={{ 
                height: 'calc(100vh - 70px)', 
                position: 'sticky', 
                top: 70
              }}
            >
              {renderSiderContent()}
            </Sider>
          )}

          {/* Main Content Area */}
          <Content style={{ padding: isMobile ? '16px' : '32px', overflowY: 'auto', height: 'calc(100vh - 70px)' }}>
            {loading || searchLoading || (compareMode && compareLoading) ? (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '16px' }}>
                <Spin indicator={antIcon} />
                <Text type="secondary" style={{ fontSize: '15px' }}>{t('loadingText')}</Text>
              </div>
            ) : (
              <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto' }}>
                
                {/* 1. BOOKMARKS VIEW */}
                {selectedBook === "bookmarks" ? (
                  <div>
                    <div className="hero-section" style={{ background: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)' }}>
                      <Title level={isMobile ? 3 : 2} style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <StarFilled style={{ color: '#fadb14' }} /> {t('savedBookmarksTitle')}
                      </Title>
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', display: 'block', marginTop: '6px' }}>
                        {t('savedBookmarksDesc')}
                      </Text>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {bookmarks.length > 0 ? (
                        bookmarks.map((b, i) => {
                          const bookName = getBookName(b.book, b.version);
                          return (
                            <Card 
                              key={i} 
                              className="verse-card animate-fade-in"
                              style={{ background: b.color }}
                              bodyStyle={isMobile ? { padding: '16px 18px' } : { padding: '20px 24px' }}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                  <Text strong style={{ fontSize: '15px' }}>
                                    {bookName} {b.chapter}:{b.verse} 
                                    <span style={{ fontSize: '11px', opacity: 0.6, marginLeft: '8px', fontWeight: 400 }}>
                                      ({b.version})
                                    </span>
                                  </Text>
                                  <Space>
                                    <Button 
                                      type="primary" 
                                      size="small" 
                                      onClick={() => handleJumpToVerse(b)}
                                    >
                                      {t('readButton')}
                                    </Button>
                                    <Button 
                                      type="primary" 
                                      danger 
                                      size="small" 
                                      icon={<DeleteOutlined />} 
                                      onClick={() => handleRemoveBookmark(b.book, b.chapter, b.verse)}
                                    />
                                  </Space>
                                </div>
                              </div>
                              <Text className="verse-text" style={{ fontStyle: 'italic', display: 'block', marginTop: '4px' }}>
                                "{b.text}"
                              </Text>
                            </Card>
                          );
                        })
                      ) : (
                        <Empty 
                          image={Empty.PRESENTED_IMAGE_SIMPLE} 
                          description={
                            <span style={{ fontSize: '14px', color: '#718096' }}>
                              {t('noBookmarks')}
                            </span>
                          }
                          style={{ background: 'var(--card-bg)', padding: '48px 24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  
                  // 2. REGULAR BIBLE READING VIEW
                  <div>
                    {/* Header Navigation card or Search result header */}
                    {searchActive ? (
                      <div className="hero-section" style={{ background: theme === 'dark' ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 'linear-gradient(135deg, #1f4068 0%, #162447 100%)', border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <Title level={isMobile ? 4 : 3} style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <SearchOutlined /> {t('searchResultTitle')}: "{searchTerm}"
                            </Title>
                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', display: 'block', marginTop: '6px' }}>
                              {searchScope === 'book' ? `${currentBookName} (${t('bookSearchScope')})` : t('globalSearchScope')}
                            </Text>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '6px' }}>
                              <Text style={{ color: 'white', fontWeight: 600, fontSize: '12px' }}>
                                {t('resultsCount')}: {displayedVerses.length}
                              </Text>
                            </div>
                            <Button 
                              type="primary" 
                              danger 
                              size="small"
                              icon={<ClearOutlined />} 
                              onClick={clearSearch}
                              style={{ borderRadius: '6px' }}
                            >
                              {t('clearSearchButton')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="hero-section" style={{ background: theme === 'dark' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '16px' : '0px', alignItems: isMobile ? 'stretch' : 'center' }}>
                          <div>
                            <Title level={isMobile ? 3 : 2} style={{ color: 'white', margin: 0, fontWeight: 700, textAlign: isMobile ? 'center' : 'left' }}>
                              {currentBookName}
                            </Title>
                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', display: 'block', marginTop: '4px', textAlign: isMobile ? 'center' : 'left' }}>
                              {t('chapterLabel')}: {selectedChapter} / {totalChapters}
                            </Text>
                          </div>
                          <Space size="middle" style={{ justifyContent: isMobile ? 'center' : 'flex-end' }}>
                            <Button 
                              disabled={selectedBook === availableBooks[0]?.code && selectedChapter === 1}
                              onClick={handlePrevChapter} 
                              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', height: '36px', borderRadius: '8px' }}
                            >
                              {t('previousChapter')}
                            </Button>
                            <Button 
                              disabled={selectedBook === availableBooks[availableBooks.length - 1]?.code && selectedChapter === totalChapters}
                              onClick={handleNextChapter} 
                              style={{ background: 'rgba(255,255,255,0.25)', border: 'none', color: 'white', height: '36px', borderRadius: '8px', fontWeight: 600 }}
                            >
                              {t('nextChapter')}
                            </Button>
                          </Space>
                        </div>
                      </div>
                    )}

                    {/* Chapters list in reading mode */}
                    {!searchActive && totalChapters > 1 && (
                      <div style={{ marginBottom: '24px' }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{t('selectChapterLabel')}</Text>
                        <div className="chapter-grid">
                          {Array.from({ length: totalChapters }, (_, i) => i + 1).map(ch => (
                            <div 
                              key={ch} 
                              className={`chapter-badge ${selectedChapter === ch ? 'active' : ''}`}
                              onClick={() => setSelectedChapter(ch)}
                            >
                              {ch}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Compare mode column headers */}
                    {compareMode && !searchActive && displayedVerses.length > 0 && !isMobile && (
                      <div style={{ 
                        display: 'flex', 
                        gap: '24px', 
                        padding: '12px 24px', 
                        background: theme === 'dark' ? '#1e293b' : '#e6f7ff', 
                        borderRadius: '12px', 
                        marginBottom: '16px', 
                        fontWeight: 600,
                        border: '1px solid var(--border-color)',
                        fontSize: '14px',
                        color: 'var(--accent-color)'
                      }}>
                        <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid var(--border-color)', paddingRight: '16px' }}>
                          {versionsList.find(x => x.value === version)?.label || version}
                        </div>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          {versionsList.find(x => x.value === compareVersion)?.label || compareVersion}
                        </div>
                      </div>
                    )}

                    {/* Verses rendering */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {displayedVerses.length > 0 ? (
                        displayedVerses.slice(0, 150).map((v, i) => {
                          const bookName = activeBooks.find(b => b.code === v.book)?.name || v.book;
                          
                          // Check if highlighted
                          const hl = bookmarks.find(b => b.book === v.book && b.chapter === v.chapter && b.verse === v.verse);
                          const cardStyle = hl ? { background: hl.color, borderLeft: '4px solid #1890ff' } : {};
                          
                          // Find compare verse if in compare mode
                          let compareVerse = null;
                          if (compareMode) {
                            compareVerse = compareBibleData.find(cv => cv.book === v.book && cv.chapter === v.chapter && cv.verse === v.verse);
                          }
                          const compareText = compareVerse ? compareVerse.text : "...";

                          // Popover Color selector
                          const popoverContent = (
                            <div style={{ width: '220px' }}>
                              <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>{t('highlightPopoverTitle')}</Text>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '12px' }}>
                                {paletteColors.map((c, idx) => (
                                  <div 
                                    key={idx}
                                    onClick={() => handleAddBookmark(v, c.hsl)}
                                    style={{ 
                                      width: '28px', 
                                      height: '28px', 
                                      borderRadius: '50%', 
                                      background: c.hsl.replace('0.3', '0.9').replace('0.35', '0.9'),
                                      border: hl && hl.color === c.hsl ? '2.5px solid #1890ff' : '1px solid rgba(0,0,0,0.15)',
                                      cursor: 'pointer',
                                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                                      transition: 'transform 0.1s'
                                    }}
                                    className="color-selector"
                                  />
                                ))}
                              </div>
                              {hl && (
                                <Button 
                                  type="primary" 
                                  danger 
                                  size="small" 
                                  block 
                                  icon={<DeleteOutlined />} 
                                  onClick={() => handleRemoveBookmark(v.book, v.chapter, v.verse)}
                                  style={{ borderRadius: '6px' }}
                                >
                                  {t('clearHighlightButton')}
                                </Button>
                              )}
                            </div>
                          );

                          const renderCardContent = () => {
                            if (compareMode && !isMobile) {
                              return (
                                <div style={{ display: 'flex', gap: '24px' }}>
                                  <div style={{ flex: 1, borderRight: '1px solid var(--border-color)', paddingRight: '16px' }}>
                                    <Paragraph style={{ margin: 0, display: 'flex', alignItems: 'flex-start' }}>
                                      <Popover content={popoverContent} trigger="click" placement="bottomLeft">
                                        <span className="verse-number" style={{ cursor: 'pointer' }}>
                                          {searchActive ? `${bookName} ${v.chapter}:${v.verse}` : `${v.verse}`}
                                        </span>
                                      </Popover>
                                      <span 
                                        className={`verse-text ${isEnglishVersion(version) ? 'english-verse' : ''}`}
                                        onDoubleClick={isEnglishVersion(version) ? (e) => handleVerseDoubleClick(e, v, version) : undefined}
                                        style={isEnglishVersion(version) ? { cursor: 'pointer' } : {}}
                                      >
                                        {searchActive ? renderHighlightedText(v.text, searchTerm) : v.text}
                                      </span>
                                    </Paragraph>
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <Paragraph style={{ margin: 0, display: 'flex', alignItems: 'flex-start' }}>
                                      <span className="verse-number" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-secondary)' }}>
                                        {searchActive ? `${bookName} ${v.chapter}:${v.verse}` : `${v.verse}`}
                                      </span>
                                      <span 
                                        className={`verse-text ${isEnglishVersion(compareVersion) ? 'english-verse' : ''}`}
                                        onDoubleClick={isEnglishVersion(compareVersion) ? (e) => handleVerseDoubleClick(e, v, compareVersion) : undefined}
                                        style={isEnglishVersion(compareVersion) ? { cursor: 'pointer' } : {}}
                                      >
                                        {searchActive ? renderHighlightedText(compareText, searchTerm) : compareText}
                                      </span>
                                    </Paragraph>
                                  </div>
                                </div>
                              );
                            }
                            
                            if (compareMode && isMobile) {
                              return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                  <div>
                                    <Paragraph style={{ margin: 0, display: 'flex', alignItems: 'flex-start' }}>
                                      <Popover content={popoverContent} trigger="click" placement="bottomLeft">
                                        <span className="verse-number" style={{ cursor: 'pointer' }}>
                                          {searchActive ? `${bookName} ${v.chapter}:${v.verse}` : `${v.verse}`}
                                        </span>
                                      </Popover>
                                      <span 
                                        className={`verse-text ${isEnglishVersion(version) ? 'english-verse' : ''}`}
                                        onDoubleClick={isEnglishVersion(version) ? (e) => handleVerseDoubleClick(e, v, version) : undefined}
                                        style={isEnglishVersion(version) ? { cursor: 'pointer' } : {}}
                                      >
                                        {searchActive ? renderHighlightedText(v.text, searchTerm) : v.text}
                                      </span>
                                    </Paragraph>
                                  </div>
                                  <div style={{ 
                                    paddingTop: '8px', 
                                    borderTop: '1px dashed var(--border-color)',
                                    opacity: 0.85
                                  }}>
                                    <Paragraph style={{ margin: 0, display: 'flex', alignItems: 'flex-start' }}>
                                      <span className="verse-number" style={{ background: 'rgba(24, 144, 255, 0.08)', color: 'var(--accent-color)', fontSize: '10px', padding: '1px 5px' }}>
                                        {compareVersion}
                                      </span>
                                      <span 
                                        className={`verse-text ${isEnglishVersion(compareVersion) ? 'english-verse' : ''}`}
                                        onDoubleClick={isEnglishVersion(compareVersion) ? (e) => handleVerseDoubleClick(e, v, compareVersion) : undefined}
                                        style={isEnglishVersion(compareVersion) ? { fontStyle: 'italic', opacity: 0.9, cursor: 'pointer' } : { fontStyle: 'italic', opacity: 0.9 }}
                                      >
                                        {searchActive ? renderHighlightedText(compareText, searchTerm) : compareText}
                                      </span>
                                    </Paragraph>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <Paragraph style={{ margin: 0, display: 'flex', alignItems: 'flex-start' }}>
                                <Popover content={popoverContent} trigger="click" placement="bottomLeft">
                                  <span className="verse-number" style={{ cursor: 'pointer' }}>
                                    {searchActive ? `${bookName} ${v.chapter}:${v.verse}` : `${v.verse}`}
                                  </span>
                                </Popover>
                                <span className={`verse-text ${isEnglishVersion(version) ? 'english-verse' : ''}`} onDoubleClick={isEnglishVersion(version) ? (e) => handleVerseDoubleClick(e, v, version) : undefined} style={isEnglishVersion(version) ? { cursor: 'pointer' } : {}}>{searchActive ? renderHighlightedText(v.text, searchTerm) : v.text}</span>
                              </Paragraph>
                            );
                          };

                          return (
                            <Card 
                              key={i} 
                              className="verse-card animate-fade-in" 
                              style={cardStyle}
                              bodyStyle={isMobile ? { padding: '16px 18px' } : { padding: '20px 24px' }}
                              id={`v-${v.verse}`}
                            >
                              {renderCardContent()}
                            </Card>
                          );
                        })
                      ) : (
                        <Empty 
                          image={Empty.PRESENTED_IMAGE_SIMPLE} 
                          description={
                            <span style={{ fontSize: '14px', color: '#718096' }}>
                              {searchActive ? t('searchNoResults') : t('noVersesForChapter')}
                            </span>
                          } 
                          style={{ background: 'var(--card-bg)', padding: '48px 24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}
                        >
                          {searchActive && (
                            <Button type="primary" onClick={clearSearch}>{t('clearSearch')}</Button>
                          )}
                        </Empty>
                      )}

                      {/* Search pagination notice */}
                      {searchActive && displayedVerses.length > 150 && (
                        <Card style={{ textAlign: 'center', background: 'var(--card-bg)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                          <CompassOutlined style={{ fontSize: '24px', color: '#718096', marginBottom: '8px' }} />
                          <Paragraph type="secondary" style={{ margin: 0 }}>
                            {t('searchLimitNotice')}
                          </Paragraph>
                        </Card>
                      )}
                    </div>

                    {/* Navigation footer */}
                    {!searchActive && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', padding: '16px 0', borderTop: '1px solid var(--border-color)', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '16px' : '0px' }}>
                        <Button 
                          disabled={selectedBook === availableBooks[0]?.code && selectedChapter === 1}
                          onClick={handlePrevChapter} 
                          icon={<ClearOutlined rotate={180} />}
                          size="large"
                          style={{ borderRadius: '8px', width: isMobile ? '100%' : 'auto' }}
                        >
                          {t('previousChapter')}
                        </Button>
                        <Text type="secondary" style={{ fontWeight: 500 }}>
                          {getLanguage() === 'si' ? `${currentBookName} : ${selectedChapter} වන පරිච්ඡේදය` : `${currentBookName} : ${t('chapterLabel')} ${selectedChapter}`}
                        </Text>
                        <Button 
                          disabled={selectedBook === availableBooks[availableBooks.length - 1]?.code && selectedChapter === totalChapters}
                          onClick={handleNextChapter} 
                          icon={<ClearOutlined />}
                          size="large"
                          style={{ borderRadius: '8px', width: isMobile ? '100%' : 'auto' }}
                        >
                          {t('nextChapter')}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Content>
        </Layout>
      </Layout>

      {/* Settings Sync Drawer */}
      <Drawer
        title={
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SettingOutlined /> සිටුවම් සහ දත්ත සංසන්දනය
          </Title>
        }
        placement="right"
        width={isMobile ? '100%' : 500}
        onClose={() => setSettingsVisible(false)}
        open={settingsVisible}
        bodyStyle={{ padding: isMobile ? '16px' : '24px' }}
      >
        <Paragraph type="secondary" style={{ fontSize: '13px' }}>
          ඔබ විසින් පාට කරන ලද බයිබල් පද වෙනත් උපාංග සමඟ සජීවීව සංසන්දනය (sync) කිරීම සඳහා Google Sheets පහසුකම භාවිතා කරන්න.
        </Paragraph>
        
        <Divider style={{ margin: '12px 0' }} />

        {/* Sync Settings Fields */}
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong style={{ display: 'block', marginBottom: '6px' }}>සංසන්දන කේතය (Sync Key):</Text>
            <Input 
              value={syncId} 
              onChange={(e) => setSyncId(e.target.value.trim())}
              style={{ width: '100%', height: '40px' }} 
              placeholder="උදා: B-123456"
              suffix={
                <Tooltip title="කේතය පිටපත් කරන්න">
                  <Button type="text" icon={<CopyOutlined />} onClick={() => handleCopyText(syncId)} />
                </Tooltip>
              }
            />
            <Text type="secondary" style={{ fontSize: '11px', marginTop: '4px', display: 'block' }}>
              *වෙනත් උපාංගයකටද මෙම කේතයම (Sync Key) ඇතුලත් කිරීමෙන් උපාංග අතර දත්ත සජීවීව සංසන්දනය වේ.
            </Text>
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: '6px' }}>Google Apps Script API URL:</Text>
            <Input 
              value={googleScriptUrl} 
              onChange={(e) => setGoogleScriptUrl(e.target.value.trim())}
              style={{ width: '100%', height: '40px' }} 
              placeholder="https://script.google.com/macros/s/..."
              prefix={<LinkOutlined />}
            />
          </div>

          <Button 
            type="primary" 
            block 
            icon={<CloudSyncOutlined spin={syncing} />} 
            onClick={() => syncBookmarks(googleScriptUrl, syncId)}
            loading={syncing}
            disabled={!googleScriptUrl}
            style={{ height: '40px', borderRadius: '8px' }}
          >
            සජීවීව දත්ත ලබාගන්න (Sync Data Now)
          </Button>
        </Space>

        <Divider />

        <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <InfoCircleOutlined style={{ color: '#1890ff' }} /> Google Sheets සැකසීමේ පියවර
        </Title>
        
        <Collapse ghost style={{ marginTop: '12px' }}>
          <Collapse.Panel header="1. Google Sheet එකක් සාදා ගන්න" key="step1">
            <Paragraph style={{ fontSize: '13px' }}>
              1. ඔබගේ Google ගිණුමට ගොස් නව **Google Sheet** එකක් සාදන්න.<br />
              2. එහි පළමු පේළියේ කිසිවක් ලියන්න එපා.
            </Paragraph>
          </Collapse.Panel>

          <Collapse.Panel header="2. Apps Script කේතය ඇතුලත් කරන්න" key="step2">
            <Paragraph style={{ fontSize: '13px' }}>
              1. Google Sheet එකෙහි **Extensions -> Apps Script** යන්න ක්ලික් කරන්න.<br />
              2. එහි ඇති කේතය ඉවත් කර, පහත දැක්වෙන සම්පූර්ණ කේතය එහි අලවන්න.<br />
              3. Save කරන්න.
            </Paragraph>
            
            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', marginBottom: '12px', position: 'relative' }}>
              <Button 
                type="text" 
                icon={<CopyOutlined style={{ color: '#94a3b8' }} />} 
                onClick={() => handleCopyText(appsScriptCode)} 
                style={{ position: 'absolute', top: 8, right: 8 }}
              />
              <pre style={{ margin: 0, fontSize: '11px', color: '#f8fafc', maxHeight: '180px', overflowY: 'auto' }}>
                {appsScriptCode}
              </pre>
            </div>
          </Collapse.Panel>

          <Collapse.Panel header="3. Web App එකක් ලෙස Deploy කරන්න" key="step3">
            <Paragraph style={{ fontSize: '13px' }}>
              1. Apps Script පිටුවේ **Deploy -> New deployment** ක්ලික් කරන්න.<br />
              2. select type මඟින් **Web app** තෝරන්න.<br />
              3. **Execute as**: `Me` ලෙස තෝරන්න.<br />
              4. **Who has access**: `Anyone` ලෙස තෝරන්න.<br />
              5. **Deploy** ක්ලික් කර, අවශ්‍ය නම් Access Permission ලබා දෙන්න.<br />
              6. ලැබෙන **Web app URL** එක පිටපත් කරගෙන පැමිණ ඉහත ඇති URL කොටුවේ අලවන්න.
            </Paragraph>
          </Collapse.Panel>
        </Collapse>
      </Drawer>
      {renderDoubleClickTooltip()}
    </ConfigProvider>
  );
}
