/**
 * @file App.js
 * @description Online Bible Application (Bibalaya.com)
 * A modern, performant, responsive React application featuring Sinhala, Tamil, and English translations.
 * Fully refactored into a clean component-driven React architecture.
 * Imports services and UI components from a structured features folder tree.
 * 
 * @author Antigravity pair-programming with User
 * @version 1.4.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Layout, 
  Typography, 
  Space, 
  Spin, 
  Button, 
  ConfigProvider, 
  Drawer, 
  Card,
  Empty,
  message,
  Switch,
  theme as antdTheme 
} from 'antd';
import { 
  SettingOutlined, 
  SearchOutlined,
  ClearOutlined,
  CompassOutlined,
  LoadingOutlined
} from '@ant-design/icons';

// Import Static Book Data (Sinhala, English, and Tamil translations)
import booksData from './data/books.json';
import booksDataEn from './data/books_en.json';
import booksDataTa from './data/books_ta.json';

// Import Logo Asset from assets folder
import logo from './assets/logo.jpg';

// Import OOP Services & UI Components from features/bible entrypoint
import {
  BibleService,
  LexiconService,
  BookmarkService,
  ReferenceService,
  HeaderBar,
  SiderContent,
  LexiconTooltip,
  VerseCard,
  BookmarksView,
  ReferencePanel
} from './features/bible';

/* =========================================================================
   SECTION 1: CONFIGURATION & CONSTANTS
   ========================================================================= */

/**
 * Total chapters per book in the Bible.
 */
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

const { Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

/**
 * List of supported translations.
 */
const versionsList = [
  { value: "ROV", label: "පැරණි සංශෝධිත (Sinhala)" },
  { value: "2018", label: "2018 නව සංශෝධිත (Sinhala)" },
  { value: "TAMOVR", label: "பழைய மொழிபெயர்ப்பு (Tamil)" },
  { value: "BSB", label: "Berean Study Bible (English)" },
  { value: "KJV", label: "King James Version (English)" },
  { value: "ASV", label: "American Standard Version (English)" },
  { value: "BBE", label: "Bible in Basic English (English)" }
];

// Reusable spinner component using Ant Design's spin algorithm
const antIcon = <LoadingOutlined style={{ fontSize: 32 }} spin />;


/* =========================================================================
   SECTION 2: MAIN APP COMPONENT EXPORT
   ========================================================================= */

export default function App() {
  
  /* --- A. OOP Service Class Instantiations --- */
  const bibleService = useMemo(() => new BibleService(), []);
  const lexiconService = useMemo(() => new LexiconService(), []);
  const bookmarkService = useMemo(() => new BookmarkService(), []);

  /* --- B. Bible Content Data States --- */
  const [bibleData, setBibleData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  /* --- C. Reading View & Navigation Context States --- */
  const [version, setVersion] = useState("ROV");
  const [selectedBook, setSelectedBook] = useState("Gen");
  const [selectedChapter, setSelectedChapter] = useState(1);
  
  /* --- D. Responsive Layout States --- */
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("bible-theme") || "light");

  /* --- E. Search States --- */
  const [searchTerm, setSearchTerm] = useState("");
  const [searchScope, setSearchScope] = useState("global");
  const [searchActive, setSearchActive] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  /* --- F. Verse Comparison Mode States --- */
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersion, setCompareVersion] = useState("KJV");
  const [compareBibleData, setCompareBibleData] = useState([]);
  const [compareLoading, setCompareLoading] = useState(false);

  /* --- G. Performance / Full-Load API States --- */
  const [isFullLoaded, setIsFullLoaded] = useState(false);
  const [compareFullLoaded, setCompareFullLoaded] = useState(false);

  /* --- H. Font Customization States --- */
  const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem("bible-font-size")) || 16);

  /* --- I. Double-Click Lexicon Dictionary Overlay State --- */
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

  /* --- J. Settings & Bookmarking States --- */
  const [settingsVisible, setSettingsVisible] = useState(false);

  // Re-sync bookmarks list with BookmarkService instance
  const [bookmarks, setBookmarks] = useState(() => bookmarkService.getBookmarks());

  // Instantiate Reference Service class for loading cross references
  const referenceService = useMemo(() => new ReferenceService(), []);

  /* --- K. Reading Preferences States --- */
  const [showReferences, setShowReferences] = useState(() => {
    const saved = localStorage.getItem("bible-show-references");
    return saved !== "false";
  });

  useEffect(() => {
    localStorage.setItem("bible-show-references", showReferences);
  }, [showReferences]);

  /* --- L. Split screen reference panels states --- */
  const [referencePanels, setReferencePanels] = useState([]);
  const [panelWidths, setPanelWidths] = useState([100]);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = React.useRef(null);
  const lastWidthsByCount = React.useRef({});

  // Save current widths for the current count of reference panels when dragging finishes or count changes
  useEffect(() => {
    if (!isDragging) {
      lastWidthsByCount.current[referencePanels.length] = panelWidths;
    }
  }, [panelWidths, referencePanels.length, isDragging]);

  // Sync panel widths on panel count changes
  useEffect(() => {
    const count = referencePanels.length;
    // Check if we have saved widths for this exact panel count
    if (lastWidthsByCount.current[count] && lastWidthsByCount.current[count].length === count + 1) {
      setPanelWidths(lastWidthsByCount.current[count]);
      return;
    }

    if (count === 0) {
      setPanelWidths([100]);
    } else if (count === 1) {
      setPanelWidths([50, 50]);
    } else if (count === 2) {
      // Set the first two (Main and Panel 1) to 25% each, Panel 2 to 50%
      setPanelWidths([25, 25, 50]);
    } else {
      // General formula for more panels
      const eachLeft = Math.floor(50 / count);
      const widths = Array(count).fill(eachLeft);
      widths.push(100 - eachLeft * count);
      setPanelWidths(widths);
    }
  }, [referencePanels.length]);

  const handleOpenReference = (b, index = 0) => {
    const newPanel = {
      id: `ref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      book: b.book,
      chapter: b.chapter,
      verse: b.verse,
      version: b.version
    };

    setReferencePanels(prev => {
      // Discard panels to the right of the clicked panel's level, then append the new one
      const next = prev.slice(0, index);
      next.push(newPanel);
      return next;
    });
  };

  const handleClosePanel = (index) => {
    setReferencePanels(prev => prev.slice(0, index));
  };

  const startResizing = (mouseDownEvent, index) => {
    mouseDownEvent.preventDefault();
    setIsDragging(true);
    const startX = mouseDownEvent.clientX;
    const startWidthLeft = panelWidths[index];
    const startWidthRight = panelWidths[index + 1];
    
    const container = containerRef.current;
    if (!container) return;
    const containerWidth = container.getBoundingClientRect().width;

    const onMouseMove = (mouseMoveEvent) => {
      const dx = mouseMoveEvent.clientX - startX;
      const dWidthPercent = (dx / containerWidth) * 100;
      
      const newWidthLeft = Math.max(15, startWidthLeft + dWidthPercent);
      
      const totalCombined = startWidthLeft + startWidthRight;
      const adjustedLeft = Math.min(newWidthLeft, totalCombined - 15);
      const adjustedRight = totalCombined - adjustedLeft;

      setPanelWidths(prev => {
        const next = [...prev];
        next[index] = adjustedLeft;
        next[index + 1] = adjustedRight;
        return next;
      });
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  /* =========================================================================
     SECTION 3: EFFECT HOOKS (LIFECYCLE & INITIAL SYNC)
     ========================================================================= */

  /**
   * Effect: Handles dynamic window resize events to calculate responsiveness.
   */
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Effect: Theme switching attribute selector.
   */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem("bible-theme", theme);
  }, [theme]);



  /**
   * Effect: Resets search engine flag if the user switches version.
   */
  useEffect(() => {
    if (bibleService.isApiVersion(version)) {
      setIsFullLoaded(false);
    }
  }, [version, bibleService]);

  useEffect(() => {
    if (bibleService.isApiVersion(compareVersion)) {
      setCompareFullLoaded(false);
    }
  }, [compareVersion, bibleService]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    bibleService.fetchChapter(selectedBook, selectedChapter, version)
      .then(async (data) => {
        if (!active) return;
        
        let finalData = data;
        try {
          if (showReferences) {
            const refsMap = await referenceService.fetchReferencesForChapter(data);
            finalData = data.map(v => ({
              ...v,
              references: refsMap[`${v.book}_${v.chapter}_${v.verse}`] || []
            }));
          }
        } catch (err) {
          console.error("Failed to load cross references for chapter:", err);
        }

        if (active) {
          setBibleData(finalData);
          if (!bibleService.isApiVersion(version)) {
            setIsFullLoaded(true);
          }
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("API Fetch error:", err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [version, selectedBook, selectedChapter, isFullLoaded, showReferences, bibleService, referenceService]);

  /**
   * Effect: Chapter Loader (Compare Mode Bible).
   */
  useEffect(() => {
    if (!compareMode) return;
    setCompareLoading(true);
    bibleService.fetchChapter(selectedBook, selectedChapter, compareVersion)
      .then(data => {
        setCompareBibleData(data);
        if (!bibleService.isApiVersion(compareVersion)) {
          setCompareFullLoaded(true);
        }
        setCompareLoading(false);
      })
      .catch(err => {
        console.error("API Compare Fetch error:", err);
        setCompareLoading(false);
      });
  }, [compareVersion, compareMode, selectedBook, selectedChapter, compareFullLoaded, bibleService]);

  /* =========================================================================
     SECTION 4: CORE ACTION HANDLERS
     ========================================================================= */

  const handleFontSizeChange = useCallback((action) => {
    setFontSize(prev => {
      let newSize = prev;
      if (action === 'increase' && prev < 32) newSize = prev + 2;
      if (action === 'decrease' && prev > 12) newSize = prev - 2;
      localStorage.setItem("bible-font-size", newSize);
      return newSize;
    });
  }, []);

  const isEnglishVersion = useCallback((ver) => {
    return bibleService.isApiVersion(ver);
  }, [bibleService]);

  /**
   * Action handler: Query search matching.
   */
  const handleSearch = async (val) => {
    if (val.trim() === "") {
      clearSearch();
      return;
    }

    if (bibleService.isApiVersion(version) && !isFullLoaded) {
      setSearchLoading(true);
      try {
        const flat = await bibleService.loadFullBibleForSearch(version);
        setBibleData(flat);
        setIsFullLoaded(true);
      } catch (err) {
        console.error("Failed to load search database:", err);
        message.error("සෙවුම් දත්ත පූරණය අසාර්ථක විය. (Failed to load search database from API)");
      } finally {
        setSearchLoading(false);
      }
    }

    if (compareMode && bibleService.isApiVersion(compareVersion) && !compareFullLoaded) {
      setSearchLoading(true);
      try {
        const flat = await bibleService.loadFullBibleForSearch(compareVersion);
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

  const clearSearch = () => {
    setSearchTerm("");
    setSearchActive(false);
  };

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

  /**
   * Action handler: Adds bookmark. Updates storage using BookmarkService.
   */
  const handleAddBookmark = (v, color) => {
    const updated = bookmarkService.addBookmark(v, color, version);
    setBookmarks(updated);
    message.success("පදය සුරකින ලදී! (Verse bookmarked)");
  };

  /**
   * Action handler: Removes bookmark. Updates storage using BookmarkService.
   */
  const handleRemoveBookmark = (book, chapter, verse) => {
    const updated = bookmarkService.removeBookmark(book, chapter, verse);
    setBookmarks(updated);
    message.info("පදය ඉවත් කරන ලදී. (Bookmark removed)");
  };

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



  /* =========================================================================
     SECTION 5: LEXICON WORD-LEVEL INTERLINEAR STUDY ENGINE
     ========================================================================= */

  /**
   * Lexicon callback: Queries dictionary definitions using LexiconService.
   */
  const fetchStrongsDefinition = useCallback((strongsNumber, verseStrongs = [], matchedKjvWord = '') => {
    setDoubleClickWordInfo(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    lexiconService.fetchStrongsDefinition(strongsNumber)
      .then(strongsData => {
        setDoubleClickWordInfo(prev => ({
          ...prev,
          loading: false,
          strongsData: {
            ...strongsData,
            matchedWord: matchedKjvWord || prev.word
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
  }, [lexiconService]);

  /**
   * Lexicon callback: Fetches mapping and aligns clicked word using LexiconService.
   */
  const fetchStrongsMappingAndLookup = useCallback((verseObj, cleanWord) => {
    const helloAoBookId = bibleService.getHelloAoBookCode(verseObj.book);
    
    lexiconService.fetchStrongsMapping(helloAoBookId, verseObj.chapter, verseObj.verse)
      .then(wordsWithStrongs => {
        const match = lexiconService.findBestMatch(wordsWithStrongs, cleanWord);
        
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
  }, [bibleService, lexiconService, fetchStrongsDefinition]);

  /**
   * Action handler: Double-click event capture.
   */
  const handleVerseDoubleClick = useCallback((e, verseObj, activeVer) => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    if (!selectedText) return;

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

  /* =========================================================================
     SECTION 6: ORCHESTRATOR RENDER LOGIC
     ========================================================================= */

  const activeBooks = useMemo(() => {
    switch (version) {
      case 'KJV':
      case 'ASV':
      case 'BBE':
      case 'BSB':
        return booksDataEn;
      case 'TAMOVR':
        return booksDataTa;
      default:
        return booksData;
    }
  }, [version]);

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

  const getLanguage = useCallback(() => {
    switch (version) {
      case 'KJV':
      case 'ASV':
      case 'BBE':
      case 'BSB':
        return 'en';
      case 'TAMOVR':
        return 'ta';
      default:
        return 'si';
    }
  }, [version]);

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
        compareVersionLabel: "සංසන්දනය කරන පරිවර්තනය (Compare Version):",
        showReferencesLabel: "සබැඳි පද (Cross-References) පෙන්වන්න"
      },
      ta: {
        subtitle: "பரிசுத்த வேதாகமம்",
        index: "பொருளடக்கம்",
        bookmarks: "குறிக்கப்பட்டவை (Bookmarks)",
        syncKey: "ஒத்திசைவு குறியீடு (Sync ID):",
        settings: "அமைப்புகள்",
        searchPlaceholder: "தேடு (Search)...",
        versionLabel: "பதிப்பு (Version):",
        searchLabel: "தேடல் (Search):",
        searchScopeLabel: "தேடல் எல்லை (Search Scope):",
        allBooks: "எல்லா புத்தகங்களும்",
        thisBook: "இந்தப் புத்தகம்",
        previousChapter: "முந்தைய அதிகாரம்",
        nextChapter: "அடுத்த அதிகாரம்",
        chapterLabel: "அதிகாரம்",
        loadingText: "வேதாகமம் ஏற்றப்படுகிறது. காத்திருக்கவும்...",
        savedBookmarksTitle: "சேமிக்கப்பட்ட குறிப்புகள் (Bookmarks)",
        savedBookmarksDesc: "நீங்கள் தனிப்படுத்திய வசனங்கள் இங்கே சேமிக்கப்பட்டுள்ளன.",
        readButton: "வாசி",
        noBookmarks: "இன்னும் வசனங்கள் எதுவும் குறிக்கப்படவில்லை. வாசிக்கும்போது வசன எண்ணைக் கிளிக் செய்து வண்ணம் தீட்டவும்.",
        searchResultTitle: "தேடல் முடிவு",
        globalSearchScope: "முழு வேதாகமமும்",
        bookSearchScope: "இந்தப் புத்தகத்திற்குள்",
        resultsCount: "முடிவுகள்",
        clearSearchButton: "தேடலை நீக்கு",
        selectChapterLabel: "அதிகாரத்தைத் தேர்ந்தெடு (Select Chapter):",
        highlightPopoverTitle: "வண்ணம் தீட்டு (Highlight Color):",
        clearHighlightButton: "வண்ணத்தை நீக்கு (Clear)",
        noVersesForChapter: "இந்த அதிகாரத்திற்கு வசனங்கள் இல்லை.",
        searchNoResults: "பொருந்தும் வசனங்கள் எதுவும் இல்லை.",
        clearSearch: "தேடலை நீக்கு",
        searchLimitNotice: "பெரிய தேடல் முடிவுகள் என்பதால், முதல் 150 வசனங்கள் மட்டுமே காட்டப்படுகின்றன.",
        compareModeActive: "ஒப்பீட்டை முடக்கு",
        compareModeInactive: "வசனங்களை ஒப்பிடு (Compare)",
        compareVersionLabel: "ஒப்பீட்டு பதிப்பு (Compare Version):",
        showReferencesLabel: "ஒப்புமை வசனங்களைக் காட்டு (Cross-References)"
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
        compareVersionLabel: "Compare Version:",
        showReferencesLabel: "Show Cross-References"
      }
    };
    return strings[lang]?.[key] || strings.si[key] || key;
  }, [getLanguage]);

  const availableBooks = useMemo(() => {
    const apiVersions = { "KJV": "eng_kjv", "ASV": "eng_asv", "BBE": "eng_bbe", "BSB": "BSB" };
    if (apiVersions[version]) {
      return activeBooks;
    }
    if (bibleData.length === 0) return [];
    const bookCodes = new Set(bibleData.map(v => v.book));
    return activeBooks.filter(b => bookCodes.has(b.code));
  }, [bibleData, activeBooks, version]);

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

  const totalChapters = useMemo(() => {
    if (selectedBook === "bookmarks") return 0;
    return bookChaptersMap[selectedBook] || 0;
  }, [selectedBook]);

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

  // Shared props objects for SiderContent component
  const sharedSiderProps = {
    isMobile,
    setCollapsed,
    theme,
    version,
    setVersion,
    compareMode,
    setCompareMode,
    compareVersion,
    setCompareVersion,
    selectedBook,
    setSelectedBook,
    setSelectedChapter,
    searchActive,
    setSearchActive,
    searchTerm,
    setSearchTerm,
    handleSearch,
    searchScope,
    setSearchScope,
    bookmarks,
    availableBooks,
    t,
    versionsList
  };

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
      <Layout style={{ minHeight: '100vh', '--verse-font-size': `${fontSize}px`, '--verse-line-height': 1.8 }}>
        
        {/* Render Header component */}
        <HeaderBar 
          theme={theme}
          setTheme={setTheme}
          fontSize={fontSize}
          handleFontSizeChange={handleFontSizeChange}
          version={version}
          setVersion={setVersion}
          compareMode={compareMode}
          setCompareMode={setCompareMode}
          compareVersion={compareVersion}
          setCompareVersion={setCompareVersion}
          selectedBook={selectedBook}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleSearch={handleSearch}
          searchScope={searchScope}
          setSearchScope={setSearchScope}
          searchActive={searchActive}
          clearSearch={clearSearch}
          isMobile={isMobile}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          openSettings={() => setSettingsVisible(true)}
          t={t}
          versionsList={versionsList}
          getLanguage={getLanguage}
          logo={logo}
        />

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
              <SiderContent {...sharedSiderProps} />
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
              <SiderContent {...sharedSiderProps} />
            </Sider>
          )}

          {/* Main Content Area */}
          {/* Main Content Area in Flex row container */}
          <div 
            ref={containerRef} 
            style={{ 
              display: 'flex', 
              flexGrow: 1, 
              height: 'calc(100vh - 70px)', 
              overflow: 'hidden', 
              position: 'relative',
              width: '100%' 
            }}
          >
            <Content style={{ 
              width: `${panelWidths[0]}%`, 
              padding: isMobile ? '16px' : '32px', 
              overflowY: 'auto', 
              height: '100%',
              transition: isDragging ? 'none' : 'width 0.3s ease',
              boxSizing: 'border-box'
            }}>
              {loading || searchLoading || (compareMode && compareLoading) ? (
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '16px' }}>
                  <Spin indicator={antIcon} />
                  <Text type="secondary" style={{ fontSize: '15px' }}>{t('loadingText')}</Text>
                </div>
              ) : (
                <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto' }}>
                  
                  {/* 1. BOOKMARKS VIEW */}
                  {selectedBook === "bookmarks" ? (
                    <BookmarksView 
                      bookmarks={bookmarks}
                      getBookName={getBookName}
                      handleJumpToVerse={handleJumpToVerse}
                      handleRemoveBookmark={handleRemoveBookmark}
                      isMobile={isMobile}
                      t={t}
                    />
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
                            
                            return (
                              <VerseCard 
                                key={i}
                                v={v}
                                bookName={bookName}
                                bookmarks={bookmarks}
                                version={version}
                                compareVersion={compareVersion}
                                compareMode={compareMode}
                                compareBibleData={compareBibleData}
                                isMobile={isMobile}
                                theme={theme}
                                handleAddBookmark={handleAddBookmark}
                                handleRemoveBookmark={handleRemoveBookmark}
                                handleVerseDoubleClick={handleVerseDoubleClick}
                                isEnglishVersion={isEnglishVersion}
                                t={t}
                                searchActive={searchActive}
                                searchTerm={searchTerm}
                                handleFetchVerseText={(refBook, refChapter, refVerse, ver) => bibleService.fetchSingleVerse(refBook, refChapter, refVerse, ver || version)}
                                handleJumpToVerse={(b) => handleOpenReference(b, 0)}
                                getBookName={getBookName}
                                showReferences={showReferences}
                              />
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

            {/* Draggable vertical panel splits for cross-references */}
            {referencePanels.map((panel, idx) => (
              <React.Fragment key={panel.id}>
                <div 
                  onMouseDown={(e) => startResizing(e, idx)}
                  style={{
                    width: '6px',
                    cursor: 'col-resize',
                    background: theme === 'dark' ? '#334155' : '#cbd5e1',
                    transition: 'background 0.2s',
                    height: '100%',
                    zIndex: 10,
                    position: 'relative'
                  }}
                  className="panel-divider"
                  title="Drag to resize"
                />
                <div style={{ 
                  width: `${panelWidths[idx + 1]}%`, 
                  height: '100%', 
                  transition: isDragging ? 'none' : 'width 0.3s ease',
                  overflowY: 'hidden',
                  boxSizing: 'border-box'
                }}>
                  <ReferencePanel 
                    panel={panel}
                    onClose={() => handleClosePanel(idx)}
                    handleJumpToVerse={(b) => handleOpenReference(b, idx + 1)}
                    handleFetchVerseText={(refBook, refChapter, refVerse, ver) => 
                      bibleService.fetchSingleVerse(refBook, refChapter, refVerse, ver || version)
                    }
                    getBookName={getBookName}
                    showReferences={showReferences}
                  />
                </div>
              </React.Fragment>
            ))}
          </div>
        </Layout>
      </Layout>

      {/* Settings Drawer */}
      <Drawer
        title={
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SettingOutlined /> සිටුවම් (Settings)
          </Title>
        }
        placement="right"
        width={isMobile ? '100%' : 500}
        onClose={() => setSettingsVisible(false)}
        open={settingsVisible}
        bodyStyle={{ padding: isMobile ? '16px' : '24px' }}
      >
        {/* General Settings Section */}
        <Title level={5} style={{ marginBottom: '16px', fontSize: '15px' }}>කියවීමේ සැකසුම් (General Settings)</Title>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme === 'dark' ? '#1e293b' : '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
          <span style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-primary)' }}>
            {t('showReferencesLabel')}
          </span>
          <Switch 
            checked={showReferences} 
            onChange={(checked) => setShowReferences(checked)} 
          />
        </div>
        

      </Drawer>
      
      {/* Lexicon Overlay Popup Tooltip */}
      <LexiconTooltip 
        doubleClickWordInfo={doubleClickWordInfo}
        setDoubleClickWordInfo={setDoubleClickWordInfo}
        fetchStrongsDefinition={fetchStrongsDefinition}
      />
    </ConfigProvider>
  );
}
