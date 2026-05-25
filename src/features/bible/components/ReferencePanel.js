import React, { useState, useEffect, useMemo } from 'react';
import { Spin, Button, Typography } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import ReferenceLink from './ReferenceLink';
import BibleService from '../services/BibleService';
import ReferenceService from '../services/ReferenceService';

const { Title } = Typography;

/**
 * ReferencePanel Component
 * Renders a side-by-side resizable scrollable column showing context for a bible reference.
 * Supports clicking links inside this panel to open nested panels on its right.
 */
export default function ReferencePanel({ 
  panel, 
  onClose, 
  handleJumpToVerse, 
  handleFetchVerseText, 
  getBookName, 
  showReferences 
}) {
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refsExpanded, setRefsExpanded] = useState(false);

  const bibleService = useMemo(() => new BibleService(), []);
  const referenceService = useMemo(() => new ReferenceService(), []);

  useEffect(() => {
    let active = true;
    setLoading(true);

    bibleService.fetchChapter(panel.book, panel.chapter, panel.version)
      .then(async (data) => {
        if (!active) return;
        
        let finalData = data;
        try {
          // Optimize references loading: only query for the specific chapter verses loaded in this panel
          const refsMap = await referenceService.fetchReferencesForChapter(data);
          finalData = data.map(v => ({
            ...v,
            references: refsMap[`${v.book}_${v.chapter}_${v.verse}`] || []
          }));
        } catch (err) {
          console.error("Failed to load cross references for panel chapter", err);
        }

        if (active) {
          setVerses(finalData);
          setLoading(false);
          
          // Auto-scroll target verse into view
          setTimeout(() => {
            if (!active) return;
            const el = document.getElementById(`panel-${panel.id}-v-${panel.verse}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              el.classList.add('flash-effect');
              setTimeout(() => el.classList.remove('flash-effect'), 2000);
            }
          }, 350);
        }
      })
      .catch(err => {
        console.error(err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [panel.book, panel.chapter, panel.version, panel.verse, panel.id, bibleService, referenceService]);

  const bookName = getBookName(panel.book, panel.version);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--card-bg)', borderRight: '1px solid var(--border-color)', position: 'relative' }}>
      {/* Panel Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '14px 18px', 
        background: 'var(--card-bg)', 
        borderBottom: '1px solid var(--border-color)',
        zIndex: 5
      }}>
        <Title level={5} style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: 'var(--accent-color)' }}>
          {bookName} {panel.chapter}:{panel.verse} ({panel.version})
        </Title>
        <Button 
          type="text" 
          icon={<CloseOutlined style={{ fontSize: '13px' }} />} 
          onClick={onClose} 
          style={{ width: '28px', height: '28px', borderRadius: '50%' }}
        />
      </div>

      {/* Panel Scrollable Body */}
      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '20px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
            <Spin size="small" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {verses.map(v => (
              <div 
                key={v.verse}
                id={`panel-${panel.id}-v-${v.verse}`}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  lineHeight: '1.6',
                  fontSize: '14px',
                  background: v.verse === panel.verse ? 'var(--accent-color-translucent, rgba(24, 144, 255, 0.12))' : 'transparent',
                  borderLeft: v.verse === panel.verse ? '4px solid var(--accent-color)' : 'none',
                  transition: 'background-color 0.3s'
                }}
              >
                <span style={{ fontWeight: 'bold', marginRight: '8px', color: 'var(--accent-color)' }}>
                  {v.verse}
                </span>
                <span className="verse-text" style={{ color: 'var(--text-primary)' }}>
                  {v.text}
                </span>
                {showReferences && renderReferences(v.references, panel.version)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
