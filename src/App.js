import React, { useState, useEffect, useMemo } from 'react';
import { Layout, Menu, Select, Input, Card, Typography, Space, Radio, Badge, Spin, Button, Empty, Tooltip, ConfigProvider, theme as antdTheme } from 'antd';
import { 
  BookOutlined, 
  SearchOutlined, 
  TranslationOutlined, 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  ClearOutlined,
  LoadingOutlined,
  BookFilled,
  CompassOutlined,
  SunOutlined,
  MoonOutlined
} from '@ant-design/icons';
import booksData from './data/books.json';

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const antIcon = <LoadingOutlined style={{ fontSize: 32 }} spin />;

export default function App() {
  const [bibleData, setBibleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState("2018"); // '2018' (sinnrv) or 'ROV' (sirov)
  const [selectedBook, setSelectedBook] = useState("Gen");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchScope, setSearchScope] = useState("global"); // 'global' or 'book'
  const [collapsed, setCollapsed] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  
  // Theme state persisted in localStorage
  const [theme, setTheme] = useState(() => localStorage.getItem("bible-theme") || "light");

  // Sync theme to root HTML element and localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem("bible-theme", theme);
  }, [theme]);

  // Lazy load Bible data when version changes
  useEffect(() => {
    setLoading(true);
    const dataPromise = version === '2018'
      ? import('./data/sinnrv2018.json')
      : import('./data/sirov.json');

    dataPromise
      .then((module) => {
        // Map short keys to readable fields
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

  // Set default book to the first available if current selection is invalid for this version
  useEffect(() => {
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
    const book = booksData.find(b => b.code === selectedBook);
    return book ? book.name : "";
  }, [selectedBook]);

  // Get total chapters in the currently selected book
  const totalChapters = useMemo(() => {
    if (bibleData.length === 0) return 0;
    const chapters = bibleData
      .filter(v => v.book === selectedBook)
      .map(v => v.chapter);
    return chapters.length > 0 ? Math.max(...chapters) : 0;
  }, [bibleData, selectedBook]);

  // Reset chapter selection if it exceeds total chapters of new book
  useEffect(() => {
    if (totalChapters > 0 && selectedChapter > totalChapters) {
      setSelectedChapter(1);
    }
  }, [selectedBook, totalChapters, selectedChapter]);

  // Filter verses based on state
  const displayedVerses = useMemo(() => {
    if (bibleData.length === 0) return [];

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

    // Default reading mode: show selected book and chapter
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
      // Go to previous book's last chapter
      const currentIdx = availableBooks.findIndex(b => b.code === selectedBook);
      if (currentIdx > 0) {
        const prevBook = availableBooks[currentIdx - 1].code;
        setSelectedBook(prevBook);
        // We will need the total chapters of that previous book
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
      // Go to next book's first chapter
      const currentIdx = availableBooks.findIndex(b => b.code === selectedBook);
      if (currentIdx < availableBooks.length - 1) {
        const nextBook = availableBooks[currentIdx + 1].code;
        setSelectedBook(nextBook);
        setSelectedChapter(1);
      }
    }
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
            <BookFilled style={{ fontSize: '24px', color: '#1890ff' }} />
            <Title level={4} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em', color: theme === 'dark' ? '#f8fafc' : '#2c3e50', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ශුද්ධ වූ බයිබලය <span style={{ fontSize: '12px', opacity: 0.5, fontWeight: 400, marginTop: '4px', color: theme === 'dark' ? '#94a3b8' : '#718096' }}>Sinhala Bible</span>
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
            {searchActive && (
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
            <Input.Search 
              placeholder="පද සොයන්න (Search)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={handleSearch}
              allowClear
              style={{ width: 280 }} 
            />
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
              top: 70, 
              overflowY: 'auto',
              overflowX: 'hidden'
            }}
          >
            <div className="sider-header">
              <span><BookOutlined style={{ marginRight: '8px' }} />පොත් නාමාවලිය</span>
              <Badge count={availableBooks.length} showZero color="#1890ff" style={{ fontSize: '11px' }} />
            </div>

            <Menu 
              mode="vertical" 
              selectedKeys={[selectedBook]}
              theme={theme}
              onClick={(info) => {
                setSelectedBook(info.key);
                setSelectedChapter(1);
                setSearchActive(false); // Clear search to go to default view of selected book
                setSearchTerm("");
              }}
              items={availableBooks.map(b => ({
                key: b.code,
                icon: <BookOutlined />,
                label: b.name
              }))}
            />
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
                      return (
                        <Card 
                          key={i} 
                          className="verse-card animate-fade-in" 
                          style={{ animationDelay: `${Math.min(i * 0.02, 0.4)}s` }}
                          bodyStyle={{ padding: '20px 24px' }}
                        >
                          <Paragraph style={{ margin: 0, display: 'flex', alignItems: 'flex-start' }}>
                            <span className="verse-number">
                              {searchActive ? `${bookName} ${v.chapter}:${v.verse}` : `${v.verse}`}
                            </span>
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
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
