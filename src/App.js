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
import logo from './logo.jpg';

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const antIcon = <LoadingOutlined style={{ fontSize: 32 }} spin />;

// 20 pastel colors for highlighting (suitable for both light & dark themes via opacity)
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

// Google Apps Script source code template for instructions
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
  const [version, setVersion] = useState("ROV"); // 'ROV' (Old Revised) is now default
  const [selectedBook, setSelectedBook] = useState("Gen");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchScope, setSearchScope] = useState("global"); // 'global' or 'book'
  const [collapsed, setCollapsed] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  
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

  // Lazy load Bible data when version changes
  useEffect(() => {
    setLoading(true);
    const dataPromise = version === '2018'
      ? import('./data/sinnrv2018.json')
      : import('./data/sirov.json');

    dataPromise
      .then((module) => {
        const mapped = module.default.map(v => ({
          book: v.b,
          chapter: v.c,
          verse: v.v,
          text: v.t
        }));
        setBibleData(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load Bible version:", err);
        setLoading(false);
      });
  }, [version]);

  // Determine books available in the current translation
  const availableBooks = useMemo(() => {
    if (bibleData.length === 0) return [];
    const bookCodes = new Set(bibleData.map(v => v.book));
    return booksData.filter(b => bookCodes.has(b.code));
  }, [bibleData]);

  // Set default book if current selection is invalid (e.g. apocrypha in SIROV)
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

  // Get active book name in Sinhala
  const currentBookName = useMemo(() => {
    if (selectedBook === "bookmarks") return "සුරැකි පද";
    const book = booksData.find(b => b.code === selectedBook);
    return book ? book.name : "";
  }, [selectedBook]);

  // Get total chapters in the currently selected book
  const totalChapters = useMemo(() => {
    if (selectedBook === "bookmarks" || bibleData.length === 0) return 0;
    const chapters = bibleData
      .filter(v => v.book === selectedBook)
      .map(v => v.chapter);
    return chapters.length > 0 ? Math.max(...chapters) : 0;
  }, [bibleData, selectedBook]);

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
  const handleSearch = (val) => {
    setSearchTerm(val);
    setSearchActive(val.trim() !== "");
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
        const prevBookVerses = bibleData.filter(v => v.book === prevBook);
        const prevTotalCh = Math.max(...prevBookVerses.map(v => v.chapter), 0);
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
        {/* Dynamic Header */}
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button 
              type="text" 
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} 
              onClick={() => setCollapsed(!collapsed)} 
              style={{ fontSize: '16px', width: 40, height: 40 }}
            />
            <img src={logo} alt="Bibalaya Logo" style={{ height: '36px', width: '36px', borderRadius: '8px', objectFit: 'cover' }} />
            <Title level={4} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em', color: theme === 'dark' ? '#f8fafc' : '#2c3e50', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Bibalaya.com <span style={{ fontSize: '12px', opacity: 0.5, fontWeight: 400, marginTop: '4px', color: theme === 'dark' ? '#94a3b8' : '#718096' }}>ශුද්ධ වූ බයිබලය</span>
            </Title>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Version Selector */}
            <Space>
              <TranslationOutlined style={{ color: '#718096' }} />
              <Select 
                value={version} 
                onChange={(val) => setVersion(val)} 
                style={{ width: 180 }}
                dropdownStyle={{ borderRadius: '8px' }}
                disabled={selectedBook === "bookmarks"}
              >
                <Select.Option value="2018">2018 නව සංශෝධිත</Select.Option>
                <Select.Option value="ROV">පැරණි සංශෝධිත</Select.Option>
              </Select>
            </Space>

            {/* Theme Toggle Button */}
            <Tooltip title={theme === 'dark' ? "Light Mode" : "Dark Mode"}>
              <Button 
                type="text" 
                icon={theme === 'dark' ? <SunOutlined style={{ color: '#fadb14', fontSize: '18px' }} /> : <MoonOutlined style={{ color: '#4a5568', fontSize: '18px' }} />}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                style={{ width: 40, height: 40, borderRadius: '8px' }}
              />
            </Tooltip>

            {/* Search Scope */}
            {searchActive && selectedBook !== "bookmarks" && (
              <Radio.Group 
                value={searchScope} 
                onChange={(e) => setSearchScope(e.target.value)}
                optionType="button"
                buttonStyle="solid"
                size="middle"
              >
                <Radio.Button value="global">සියලු පොත්</Radio.Button>
                <Radio.Button value="book">මෙම පොතෙන්</Radio.Button>
              </Radio.Group>
            )}

            {/* Search Field */}
            {selectedBook !== "bookmarks" && (
              <Input.Search 
                placeholder="පද සොයන්න (Search)..." 
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
          {/* Books Sider */}
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
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="sider-header">
                <span><BookOutlined style={{ marginRight: '8px' }} />නාමාවලිය</span>
              </div>

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
                  }}
                  items={[
                    {
                      key: "bookmarks",
                      icon: <StarFilled style={{ color: '#fadb14' }} />,
                      label: (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <span>සුරැකි පද (Bookmarks)</span>
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
                justifyContent: collapsed ? 'center' : 'space-between',
                alignItems: 'center',
                background: theme === 'dark' ? '#111827' : '#f7fafc'
              }}>
                {!collapsed ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Text type="secondary" style={{ fontSize: '10px' }}>සංසන්දන කේතය (Sync ID):</Text>
                      <Text strong style={{ fontSize: '13px', color: '#1890ff' }}>{syncId}</Text>
                    </div>
                    <Button 
                      type="primary" 
                      ghost 
                      size="small" 
                      icon={<SettingOutlined />} 
                      onClick={() => setSettingsVisible(true)}
                    >
                      සිටුවම්
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
          </Sider>

          {/* Main Content Area */}
          <Content style={{ padding: 32, overflowY: 'auto', height: 'calc(100vh - 70px)' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '16px' }}>
                <Spin indicator={antIcon} />
                <Text type="secondary" style={{ fontSize: '15px' }}>දත්ත පූරණය වෙමින් පවතී. කරුණාකර රැඳී සිටින්න...</Text>
              </div>
            ) : (
              <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto' }}>
                
                {/* 1. BOOKMARKS VIEW */}
                {selectedBook === "bookmarks" ? (
                  <div>
                    <div className="hero-section" style={{ background: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)' }}>
                      <Title level={2} style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <StarFilled style={{ color: '#fadb14' }} /> සුරැකි පද (Saved Bookmarks)
                      </Title>
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', display: 'block', marginTop: '6px' }}>
                        ඔබ විසින් පාට කර සලකුණු කරන ලද බයිබල් පද මෙහි දැක්වේ.
                      </Text>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {bookmarks.length > 0 ? (
                        bookmarks.map((b, i) => {
                          const bookName = booksData.find(book => book.code === b.book)?.name || b.book;
                          return (
                            <Card 
                              key={i} 
                              className="verse-card animate-fade-in"
                              style={{ background: b.color }}
                              bodyStyle={{ padding: '20px 24px' }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <Text strong style={{ fontSize: '15px' }}>
                                  {bookName} {b.chapter}:{b.verse} 
                                  <span style={{ fontSize: '11px', opacity: 0.6, marginLeft: '8px', fontWeight: 400 }}>
                                    ({b.version === '2018' ? '2018 නව සංශෝධිත' : 'පැරණි සංශෝධිත'})
                                  </span>
                                </Text>
                                <Space>
                                  <Button 
                                    type="primary" 
                                    size="small" 
                                    onClick={() => handleJumpToVerse(b)}
                                  >
                                    කියවන්න (Read)
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
                              <Text className="verse-text" style={{ fontStyle: 'italic' }}>
                                "{b.text}"
                              </Text>
                            </Card>
                          );
                        })
                      ) : (
                        <Empty 
                          image={Empty.PRESENTED_IMAGE_SIMPLE} 
                          description={
                            <span style={{ fontSize: '15px', color: '#718096' }}>
                              තවමත් කිසිදු පදයක් සලකුණු කර නැත. කියවන විට පදයේ අංකය ක්ලික් කර පාටක් තෝරන්න.
                            </span>
                          }
                          style={{ background: 'var(--card-bg)', padding: '64px', borderRadius: '12px', border: '1px solid var(--border-color)' }}
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
                        <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                          <div>
                            <Title level={3} style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <SearchOutlined /> සොයන පදය: "{searchTerm}"
                            </Title>
                            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', display: 'block', marginTop: '6px' }}>
                              {searchScope === 'book' ? `${currentBookName} පොත තුළ` : 'මුළු බයිබලය පුරාම'}
                            </Text>
                          </div>
                          <Button 
                            type="primary" 
                            danger 
                            icon={<ClearOutlined />} 
                            onClick={clearSearch}
                            style={{ borderRadius: '8px' }}
                          >
                            සෙවීම අවසන් කරන්න
                          </Button>
                        </Space>
                        <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '6px', display: 'inline-block' }}>
                          <Text style={{ color: 'white', fontWeight: 600 }}>
                            සම්පූර්ණ ප්‍රතිඵල: {displayedVerses.length}
                          </Text>
                        </div>
                      </div>
                    ) : (
                      <div className="hero-section" style={{ background: theme === 'dark' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <Title level={2} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                              {currentBookName}
                            </Title>
                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', display: 'block', marginTop: '4px' }}>
                              පරිච්ඡේදය: {selectedChapter} / {totalChapters}
                            </Text>
                          </div>
                          <Space size="middle">
                            <Button 
                              disabled={selectedBook === availableBooks[0]?.code && selectedChapter === 1}
                              onClick={handlePrevChapter} 
                              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', height: '40px', borderRadius: '8px' }}
                            >
                              පෙර පරිච්ඡේදය
                            </Button>
                            <Button 
                              disabled={selectedBook === availableBooks[availableBooks.length - 1]?.code && selectedChapter === totalChapters}
                              onClick={handleNextChapter} 
                              style={{ background: 'rgba(255,255,255,0.25)', border: 'none', color: 'white', height: '40px', borderRadius: '8px', fontWeight: 600 }}
                            >
                              ඊළඟ පරිච්ඡේදය
                            </Button>
                          </Space>
                        </div>
                      </div>
                    )}

                    {/* Chapters list in reading mode */}
                    {!searchActive && totalChapters > 1 && (
                      <div style={{ marginBottom: '24px' }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>පරිච්ඡේදය තෝරන්න (Select Chapter):</Text>
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

                    {/* Verses rendering */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {displayedVerses.length > 0 ? (
                        displayedVerses.slice(0, 150).map((v, i) => {
                          const bookName = booksData.find(b => b.code === v.book)?.name || v.book;
                          
                          // Check if this verse is highlighted
                          const hl = bookmarks.find(b => b.book === v.book && b.chapter === v.chapter && b.verse === v.verse);
                          const cardStyle = hl ? { background: hl.color, borderLeft: '5px solid #1890ff' } : {};
                          
                          // Color Selector Popover Content
                          const popoverContent = (
                            <div style={{ width: '220px' }}>
                              <Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>පදය පාට කරන්න (Highlight Color):</Text>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '12px' }}>
                                {paletteColors.map((c, idx) => (
                                  <div 
                                    key={idx}
                                    onClick={() => handleAddBookmark(v, c.hsl)}
                                    style={{ 
                                      width: '28px', 
                                      height: '28px', 
                                      borderRadius: '50%', 
                                      background: c.hsl.replace('0.3', '0.9').replace('0.35', '0.9'), // solid preview color
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
                                  පාට ඉවත් කරන්න (Clear)
                                </Button>
                              )}
                            </div>
                          );

                          return (
                            <Card 
                              key={i} 
                              className="verse-card animate-fade-in" 
                              style={cardStyle}
                              bodyStyle={{ padding: '20px 24px' }}
                              id={`v-${v.verse}`}
                            >
                              <Paragraph style={{ margin: 0, display: 'flex', alignItems: 'flex-start' }}>
                                <Popover content={popoverContent} trigger="click" placement="bottomLeft">
                                  <span className="verse-number" style={{ cursor: 'pointer' }}>
                                    {searchActive ? `${bookName} ${v.chapter}:${v.verse}` : `${v.verse}`}
                                  </span>
                                </Popover>
                                <span className="verse-text">
                                  {searchActive ? renderHighlightedText(v.text, searchTerm) : v.text}
                                </span>
                              </Paragraph>
                            </Card>
                          );
                        })
                      ) : (
                        <Empty 
                          image={Empty.PRESENTED_IMAGE_SIMPLE} 
                          description={
                            <span style={{ fontSize: '15px', color: '#718096' }}>
                              {searchActive ? 'පද කිසිවක් සොයාගත නොහැකි විය.' : 'මෙම පරිච්ඡේදය සඳහා දත්ත නොමැත.'}
                            </span>
                          } 
                          style={{ background: 'var(--card-bg)', padding: '64px', borderRadius: '12px', border: '1px solid var(--border-color)' }}
                        >
                          {searchActive && (
                            <Button type="primary" onClick={clearSearch}>සෙවීම ඉවත් කරන්න</Button>
                          )}
                        </Empty>
                      )}

                      {/* Search pagination notice */}
                      {searchActive && displayedVerses.length > 150 && (
                        <Card style={{ textAlign: 'center', background: 'var(--card-bg)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                          <CompassOutlined style={{ fontSize: '24px', color: '#718096', marginBottom: '8px' }} />
                          <Paragraph type="secondary" style={{ margin: 0 }}>
                            සෙවුම් ප්‍රතිඵල ඉතා විශාල බැවින් පළමු පද 150 පමණක් පෙන්වනු ලැබේ.
                          </Paragraph>
                        </Card>
                      )}
                    </div>

                    {/* Navigation footer */}
                    {!searchActive && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', padding: '16px 0', borderTop: '1px solid var(--border-color)' }}>
                        <Button 
                          disabled={selectedBook === availableBooks[0]?.code && selectedChapter === 1}
                          onClick={handlePrevChapter} 
                          icon={<ClearOutlined rotate={180} />}
                          size="large"
                          style={{ borderRadius: '8px' }}
                        >
                          පෙර පරිච්ඡේදය
                        </Button>
                        <Text type="secondary" style={{ fontWeight: 500 }}>
                          {currentBookName} : {selectedChapter} වන පරිච්ඡේදය
                        </Text>
                        <Button 
                          disabled={selectedBook === availableBooks[availableBooks.length - 1]?.code && selectedChapter === totalChapters}
                          onClick={handleNextChapter} 
                          icon={<ClearOutlined />}
                          size="large"
                          style={{ borderRadius: '8px' }}
                        >
                          ඊළඟ පරිච්ඡේදය
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
            <SettingOutlined /> සිටුවම් සහ දත්ත සංසන්දනය (Settings & Sync)
          </Title>
        }
        placement="right"
        width={500}
        onClose={() => setSettingsVisible(false)}
        open={settingsVisible}
        bodyStyle={{ padding: '24px' }}
      >
        <Paragraph type="secondary">
          ඔබ විසින් පාට කරන ලද බයිබල් පද (bookmarks) වෙනත් උපාංග සමඟ (ජංගම දුරකථන, ටැබ් හෝ පරිගණක) සජීවීව සංසන්දනය (sync) කිරීම සඳහා මෙහි ඇති Google Sheets පහසුකම භාවිතා කරන්න.
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
              *ඔබගේ වෙනත් උපාංගයටද මෙම කේතයම (Sync Key) ඇතුලත් කිරීමෙන් එම උපාංග දෙක අතර දත්ත සජීවීව සංසන්දනය වේ.
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

        {/* Step-by-Step Instructions */}
        <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <InfoCircleOutlined style={{ color: '#1890ff' }} /> Google Sheets සැකසීමේ පියවර (Setup Steps)
        </Title>
        
        <Collapse ghost style={{ marginTop: '12px' }}>
          <Collapse.Panel header="1. Google Sheet එකක් සාදා ගන්න" key="step1">
            <Paragraph>
              1. ඔබගේ Google ගිණුමට ගොස් නව **Google Sheet (Spreadsheet)** එකක් සාදන්න.<br />
              2. එහි පළමු පේළියේ (Header row) කිසිවක් ලියන්න එපා. Script එක මඟින් ස්වයංක්‍රීයව හෙඩර්ස් එකතු කරනු ඇත.
            </Paragraph>
          </Collapse.Panel>

          <Collapse.Panel header="2. Apps Script කේතය (Code) ඇතුලත් කරන්න" key="step2">
            <Paragraph>
              1. Google Sheet එකෙහි ඉහළ මෙනුවේ **Extensions -> Apps Script** යන්න ක්ලික් කරන්න.<br />
              2. එහි ඇති පෙරනිමි කේතය ඉවත් කර, පහත දැක්වෙන සම්පූර්ණ කේතය (Script Code) පිටපත් කර එහි අලවන්න (Paste).<br />
              3. ඉන්පසු Save (කදම්බ සංකේතය) කරන්න.
            </Paragraph>
            
            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', marginBottom: '12px', position: 'relative' }}>
              <Button 
                type="text" 
                icon={<CopyOutlined style={{ color: '#94a3b8' }} />} 
                onClick={() => handleCopyText(appsScriptCode)} 
                style={{ position: 'absolute', top: 8, right: 8 }}
              />
              <pre style={{ margin: 0, fontSize: '11px', color: '#f8fafc', maxHeight: '200px', overflowY: 'auto' }}>
                {appsScriptCode}
              </pre>
            </div>
          </Collapse.Panel>

          <Collapse.Panel header="3. Web App එකක් ලෙස Deploy කරන්න" key="step3">
            <Paragraph>
              1. Apps Script පිටුවේ ඉහළ දකුණු කෙළවරේ ඇති **Deploy -> New deployment** යන්න ක්ලික් කරන්න.<br />
              2. Select type (ගියර් සංකේතය) මඟින් **Web app** යන්න තෝරන්න.<br />
              3. **Execute as**: `Me (ඔබගේ Google ලිපිනය)` ලෙස තෝරන්න.<br />
              4. **Who has access**: `Anyone` ලෙස අනිවාර්යයෙන්ම තෝරන්න (එසේ නැතහොත් වෙබ් අඩවියට දත්ත ලිවීමට නොහැකි වනු ඇත).<br />
              5. **Deploy** ක්ලික් කර, අවශ්‍ය නම් Access Permission ලබා දෙන්න.<br />
              6. ලැබෙන **Web app URL** එක පිටපත් කරගෙන පැමිණ ඉහත ඇති "Google Apps Script API URL" කොටුවෙහි අලවා සේව් කරන්න.
            </Paragraph>
          </Collapse.Panel>
        </Collapse>
      </Drawer>
    </ConfigProvider>
  );
}
