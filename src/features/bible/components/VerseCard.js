import React, { useState } from 'react';
import { Card, Popover, Typography, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import ReferenceLink from './ReferenceLink';

const { Paragraph } = Typography;

/**
 * @file VerseCard.js
 * @description Card layout component displaying a verse, highlights, and comparison versions.
 */

/**
 * VerseCard Component
 * 
 * @param {Object} props
 * @param {Object} props.v - The main verse data object containing {book, chapter, verse, text, references}.
 * @param {string} props.bookName - The display name of the book.
 * @param {Array<Object>} props.bookmarks - Array of saved bookmark objects.
 * @param {string} props.version - The active reading translation (e.g. 'ROV').
 * @param {string} props.compareVersion - The selected comparison translation (e.g. 'KJV').
 * @param {boolean} props.compareMode - Active state indicating if comparison columns/rows should be displayed.
 * @param {Array<Object>} props.compareBibleData - Array of verse texts for the comparison translation.
 * @param {boolean} props.isMobile - Viewport scale responsive flag.
 * @param {string} props.theme - Active style theme name ('light' | 'dark').
 * @param {Function} props.handleAddBookmark - Invokes bookmark save operations.
 * @param {Function} props.handleRemoveBookmark - Invokes bookmark delete operations.
 * @param {Function} props.handleVerseDoubleClick - Triggers word-level lexicon popups.
 * @param {Function} props.isEnglishVersion - Helper callback verifying if selection is an English Bible.
 * @param {Function} props.t - Multi-language translation lookup function.
 * @param {boolean} props.searchActive - State check indicating if rendering a search query result list.
 * @param {string} props.searchTerm - Active query text string entered by user.
 * @param {Function} props.handleFetchVerseText - Dynamically loads individual verse text for tooltips.
 * @param {Function} props.handleJumpToVerse - Navigates reader back to the target chapter and verse card.
 * @param {Function} props.getBookName - Resolver to match book codes to language names.
 */

// Curated colors palette list with custom HSLA codes for aesthetic translucent rendering
const colorsList = [
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

export default function VerseCard({
  v,
  bookName,
  bookmarks,
  version,
  compareVersion,
  compareMode,
  compareBibleData,
  isMobile,
  theme,
  handleAddBookmark,
  handleRemoveBookmark,
  handleVerseDoubleClick,
  isEnglishVersion,
  t,
  searchActive,
  searchTerm,
  handleFetchVerseText,
  handleJumpToVerse,
  getBookName,
  showReferences
}) {
  const [refsExpanded, setRefsExpanded] = useState(false);

  const renderReferences = (references, columnVersion) => {
    if (!references || references.length === 0) return null;
    
    const limit = 5;
    const showExpandButton = references.length > limit;
    const displayedRefs = (showExpandButton && !refsExpanded) 
      ? references.slice(0, limit) 
      : references;
      
    return (
      <span className="verse-references" style={{ marginLeft: '8px', fontSize: '12px', display: 'inline' }}>
        {displayedRefs.map((ref, idx) => (
          <ReferenceLink 
            key={idx} 
            refObj={ref} 
            version={columnVersion} 
            getBookName={getBookName}
            handleJumpToVerse={handleJumpToVerse}
            handleFetchVerseText={handleFetchVerseText}
          />
        ))}
        {showExpandButton && (
          <span 
            onClick={(e) => {
              e.stopPropagation();
              setRefsExpanded(!refsExpanded);
            }}
            style={{ 
              color: 'var(--accent-color)', 
              cursor: 'pointer', 
              fontWeight: 'bold', 
              marginLeft: '4px',
              fontSize: '11px',
              display: 'inline-block',
              userSelect: 'none'
            }}
            className="references-toggle-arrow"
          >
            {refsExpanded ? ' ◀' : ` ... ▶ (${references.length - limit} more)`}
          </span>
        )}
      </span>
    );
  };

  /**
   * Highlights matching words within search queries using RegExp.
   * Splits string by searchTerm to avoid dangerously injecting raw unescaped strings,
   * rendering them inside an inline CSS span.
   * 
   * @param {string} text - The raw verse text.
   * @param {string} highlight - The query string to highlight.
   * @returns {React.ReactNode} React fragment with highlighted matches.
   */
  const renderHighlightedText = (text, highlight) => {
    if (!highlight || highlight.trim() === "") return text;
    
    // Escape standard regex control characters in search term to prevent errors
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

  // Find if this verse has a saved bookmark/highlight
  const hl = bookmarks.find(b => b.book === v.book && b.chapter === v.chapter && b.verse === v.verse);
  
  // Clean card borders styling, using a solid left border colored to match the highlight selection
  const cardStyle = hl ? { 
    borderLeft: `4px solid ${hl.color.replace('0.3', '1').replace('0.35', '1')}` 
  } : {};

  // Custom inline background text highlight styling (highlighter pen effect)
  const highlightStyle = hl ? {
    backgroundColor: hl.color,
    padding: '3px 8px',
    borderRadius: '4px',
    boxDecorationBreak: 'clone',
    WebkitBoxDecorationBreak: 'clone',
    display: 'inline'
  } : {};

  // Resolve corresponding verse text from the compared translation
  let compareVerse = null;
  if (compareMode) {
    compareVerse = compareBibleData.find(cv => cv.book === v.book && cv.chapter === v.chapter && cv.verse === v.verse);
  }
  const compareText = compareVerse ? compareVerse.text : "...";

  // Color picker selection layout rendered inside Ant Design Popover
  const popoverContent = (
    <div style={{ width: '220px' }}>
      <Typography.Text strong style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>{t('highlightPopoverTitle')}</Typography.Text>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '12px' }}>
        {colorsList.map((c, idx) => (
          <div 
            key={idx}
            onClick={() => handleAddBookmark(v, c.hsl)}
            style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '50%', 
              // Convert translucent hsla colors to opaque versions for palette dots
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
      {/* Clear Highlight Button */}
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

  /**
   * Renders the card body depending on layout modes:
   * Column A: Side-by-side desktop columns comparison
   * Column B: Stacked mobile list comparison
   * Column C: Standard single reading mode
   */
  const renderCardContent = () => {
    // Path A: Side-by-side desktop columns comparison
    if (compareMode && !isMobile) {
      return (
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* Left Column (Primary Translation) */}
          <div style={{ flex: 1, borderRight: '1px solid var(--border-color)', paddingRight: '16px' }}>
            <Paragraph style={{ margin: 0, display: 'block', lineHeight: hl ? '2.2' : 'var(--verse-line-height, 1.8)' }}>
              <span style={highlightStyle}>
                <Popover content={popoverContent} trigger="click" placement="bottomLeft">
                  <span className="verse-number" style={{ cursor: 'pointer', display: 'inline-block', marginRight: '8px' }}>
                    {searchActive ? `${bookName} ${v.chapter}:${v.verse}` : `${v.verse}`}
                  </span>
                </Popover>
                <span 
                  className={`verse-text ${isEnglishVersion(version) ? 'english-verse' : ''}`}
                  onDoubleClick={isEnglishVersion(version) ? (e) => handleVerseDoubleClick(e, v, version) : undefined}
                  style={isEnglishVersion(version) ? { cursor: 'pointer', display: 'inline' } : { display: 'inline' }}
                >
                  {searchActive ? renderHighlightedText(v.text, searchTerm) : v.text}
                </span>
                {showReferences && renderReferences(v.references, version)}
              </span>
            </Paragraph>
          </div>
          {/* Right Column (Compared Translation) */}
          <div style={{ flex: 1 }}>
            <Paragraph style={{ margin: 0, display: 'block', lineHeight: 'var(--verse-line-height, 1.8)' }}>
              <span className="verse-number" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-secondary)', display: 'inline-block', marginRight: '8px' }}>
                {searchActive ? `${bookName} ${v.chapter}:${v.verse}` : `${v.verse}`}
              </span>
              <span 
                className={`verse-text ${isEnglishVersion(compareVersion) ? 'english-verse' : ''}`}
                onDoubleClick={isEnglishVersion(compareVersion) ? (e) => handleVerseDoubleClick(e, v, compareVersion) : undefined}
                style={isEnglishVersion(compareVersion) ? { cursor: 'pointer', display: 'inline' } : { display: 'inline' }}
              >
                {searchActive ? renderHighlightedText(compareText, searchTerm) : compareText}
              </span>
              {showReferences && renderReferences(v.references, compareVersion)}
            </Paragraph>
          </div>
        </div>
      );
    }
    
    // Path B: Stacked mobile list comparison (avoids squishing text into narrow columns)
    if (compareMode && isMobile) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Row 1: Primary Translation */}
          <div>
            <Paragraph style={{ margin: 0, display: 'block', lineHeight: hl ? '2.2' : 'var(--verse-line-height, 1.8)' }}>
              <span style={highlightStyle}>
                <Popover content={popoverContent} trigger="click" placement="bottomLeft">
                  <span className="verse-number" style={{ cursor: 'pointer', display: 'inline-block', marginRight: '8px' }}>
                    {searchActive ? `${bookName} ${v.chapter}:${v.verse}` : `${v.verse}`}
                  </span>
                </Popover>
                <span 
                  className={`verse-text ${isEnglishVersion(version) ? 'english-verse' : ''}`}
                  onDoubleClick={isEnglishVersion(version) ? (e) => handleVerseDoubleClick(e, v, version) : undefined}
                  style={isEnglishVersion(version) ? { cursor: 'pointer', display: 'inline' } : { display: 'inline' }}
                >
                  {searchActive ? renderHighlightedText(v.text, searchTerm) : v.text}
                </span>
                {showReferences && renderReferences(v.references, version)}
              </span>
            </Paragraph>
          </div>
          {/* Row 2: Compared Translation */}
          <div style={{ 
            paddingTop: '8px', 
            borderTop: '1px dashed var(--border-color)',
            opacity: 0.85
          }}>
            <Paragraph style={{ margin: 0, display: 'block', lineHeight: 'var(--verse-line-height, 1.8)' }}>
              <span className="verse-number" style={{ background: 'rgba(24, 144, 255, 0.08)', color: 'var(--accent-color)', fontSize: '10px', padding: '1px 5px', display: 'inline-block', marginRight: '8px' }}>
                {compareVersion}
              </span>
              <span 
                className={`verse-text ${isEnglishVersion(compareVersion) ? 'english-verse' : ''}`}
                onDoubleClick={isEnglishVersion(compareVersion) ? (e) => handleVerseDoubleClick(e, v, compareVersion) : undefined}
                style={isEnglishVersion(compareVersion) ? { fontStyle: 'italic', opacity: 0.9, cursor: 'pointer', display: 'inline' } : { fontStyle: 'italic', opacity: 0.9, display: 'inline' }}
              >
                {searchActive ? renderHighlightedText(compareText, searchTerm) : compareText}
              </span>
              {showReferences && renderReferences(v.references, compareVersion)}
            </Paragraph>
          </div>
        </div>
      );
    }

    // Path C: Standard single reading mode
    return (
      <Paragraph style={{ margin: 0, display: 'block', lineHeight: hl ? '2.2' : 'var(--verse-line-height, 1.8)' }}>
        <span style={highlightStyle}>
          {/* Clickable verse number triggers the color highlighting popover */}
          <Popover content={popoverContent} trigger="click" placement="bottomLeft">
            <span className="verse-number" style={{ cursor: 'pointer', display: 'inline-block', marginRight: '8px' }}>
              {searchActive ? `${bookName} ${v.chapter}:${v.verse}` : `${v.verse}`}
            </span>
          </Popover>
          {/* Text double-click triggers word study overlay (English only) */}
          <span 
            className={`verse-text ${isEnglishVersion(version) ? 'english-verse' : ''}`} 
            onDoubleClick={isEnglishVersion(version) ? (e) => handleVerseDoubleClick(e, v, version) : undefined} 
            style={isEnglishVersion(version) ? { cursor: 'pointer', display: 'inline' } : { display: 'inline' }}
          >
            {searchActive ? renderHighlightedText(v.text, searchTerm) : v.text}
          </span>
          {showReferences && renderReferences(v.references, version)}
        </span>
      </Paragraph>
    );
  };

  return (
    <Card 
      className="verse-card animate-fade-in" 
      style={cardStyle}
      bodyStyle={isMobile ? { padding: '16px 18px' } : { padding: '20px 24px' }}
      id={`v-${v.verse}`}
    >
      {renderCardContent()}
    </Card>
  );
}
