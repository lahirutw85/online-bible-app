import React, { useState } from 'react';
import { Popover, Spin } from 'antd';

/**
 * ReferenceLink Component
 * Renders an inline clickable link that loads the referenced verse in a popover when hovered.
 */
export default function ReferenceLink({ refObj, version, getBookName, handleJumpToVerse, handleFetchVerseText }) {
  const [loading, setLoading] = useState(false);
  const [verseText, setVerseText] = useState('');
  const [error, setError] = useState(null);

  const translatedBook = getBookName(refObj.book, version);
  const label = `${refObj.book} ${refObj.chapter}:${refObj.verse}`;

  // Fetch the referenced verse text only when the popover opens (lazy load)
  const loadText = async () => {
    if (verseText || error) return;
    setLoading(true);
    try {
      const text = await handleFetchVerseText(refObj.book, refObj.chapter, refObj.verse, version);
      if (text) {
        setVerseText(text);
      } else {
        setError("Verse not found");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load verse");
    } finally {
      setLoading(false);
    }
  };

  const popoverContent = (
    <div style={{ maxWidth: '320px', padding: '6px' }} className="reference-popover">
      <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--accent-color)', fontSize: '13px' }}>
        {translatedBook} {refObj.chapter}:{refObj.verse} ({version})
      </div>
      {loading ? (
        <div style={{ padding: '12px 0', textAlign: 'center' }}><Spin size="small" /></div>
      ) : error ? (
        <div style={{ color: 'var(--accent-color)', fontSize: '12px' }}>{error}</div>
      ) : (
        <div style={{ fontSize: '13px', fontStyle: 'italic', lineHeight: '1.6', color: 'var(--text-primary)' }}>
          "{verseText}"
        </div>
      )}
    </div>
  );

  return (
    <Popover 
      content={popoverContent} 
      trigger="hover" 
      onOpenChange={(visible) => visible && loadText()}
      placement="bottom"
      destroyTooltipOnHide
      mouseEnterDelay={0.1}
      mouseLeaveDelay={0.1}
    >
      <span 
        onClick={(e) => {
          e.stopPropagation(); // Avoid triggering any double-clicks or card actions
          handleJumpToVerse({ book: refObj.book, chapter: refObj.chapter, verse: refObj.verse, version });
        }}
        style={{ 
          color: 'var(--accent-color)', 
          cursor: 'pointer', 
          marginRight: '6px',
          textDecoration: 'underline',
          display: 'inline'
        }}
        className="reference-link"
      >
        {label};
      </span>
    </Popover>
  );
}
