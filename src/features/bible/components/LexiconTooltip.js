import React from 'react';
import { Button, Spin, Collapse } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

/**
 * @file LexiconTooltip.js
 * @description Coordinates-aligned dynamic tooltip popup card for interlinear lexicon study.
 * Renders on verse word double-click in English versions.
 */

/**
 * LexiconTooltip Component
 * 
 * @param {Object} props
 * @param {Object} props.doubleClickWordInfo - Holds state of double-clicked word selection.
 * @param {boolean} props.doubleClickWordInfo.visible - Controls visibility of the tooltip card.
 * @param {number} props.doubleClickWordInfo.x - Client X coordinate of selected word text range bounding box.
 * @param {number} props.doubleClickWordInfo.y - Client Y coordinate of selected word text range bounding box.
 * @param {string} props.doubleClickWordInfo.word - Raw word string that was double clicked.
 * @param {Object} props.doubleClickWordInfo.strongsData - Retrieved Strong's concordance definition data (null if loading/failed).
 * @param {boolean} props.doubleClickWordInfo.loading - Indicates API fetch status for Strong's details.
 * @param {string|null} props.doubleClickWordInfo.error - Contains any lookup failure message.
 * @param {Array<Object>} props.doubleClickWordInfo.verseStrongs - Word mappings for the entire active verse (enables comparison tab).
 * @param {Function} props.setDoubleClickWordInfo - State dispatch function to show/hide or update active tooltip coordinates.
 * @param {Function} props.fetchStrongsDefinition - Invokes definition queries for selected Strong's numbers.
 */
export default function LexiconTooltip({
  doubleClickWordInfo,
  setDoubleClickWordInfo,
  fetchStrongsDefinition
}) {
  // If tooltip is marked hidden, render nothing to avoid DOM footprint.
  if (!doubleClickWordInfo.visible) return null;

  const { x, y, strongsData, loading, error, verseStrongs } = doubleClickWordInfo;
  
  // Define dimensions for bounding boxes to handle border collision guard checks
  const tooltipWidth = 360;
  const tooltipHeight = 350;
  
  // Default position: centered horizontally above/below the clicked coordinate
  let left = x - tooltipWidth / 2;
  let top = y + 10;

  /* =========================================================================
     SCREEN COLLISION DETECTIONS (BORDER GUARDS)
     Ensure the absolute-positioned tooltip container remains fully within the viewport.
     ========================================================================= */

  // 1. Right side collision check
  if (left + tooltipWidth > window.innerWidth) {
    left = window.innerWidth - tooltipWidth - 20;
  }
  // 2. Left side collision check
  if (left < 10) {
    left = 10;
  }

  // 3. Bottom window page bounds collision check. If overlapping bottom fold, flip to render above the word.
  if (y + tooltipHeight > document.documentElement.scrollHeight) {
    top = y - tooltipHeight - 20;
  }
  // 4. Top page bounds collision check
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
      {/* Tooltip Title bar & Close Button */}
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
        {/* State A: Loading Strong's database definition */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            <div style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>Searching Strong's concordance...</div>
          </div>
        ) : error ? (
          /* State B: Error boundary / Word matching failed */
          <div style={{ padding: '8px 0' }}>
            <div style={{ color: 'var(--accent-color)', fontSize: '13px', marginBottom: '12px' }}>
              {error}
            </div>
            {/* Fallback Option: Render all mapped words in this verse so the user can select manual search */}
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
          /* State C: Successfully loaded definition details */
          <div>
            {/* Meta statistics table */}
            <div className="tooltip-section info-section">
              <div className="tooltip-row">
                <span className="label">English Word:</span>
                <span className="value english-word">{strongsData.matchedWord}</span>
              </div>
              <div className="tooltip-row">
                <span className="label">Root Word:</span>
                {/* Dangerously set inner HTML used because original Greek/Hebrew text strings contain HTML entities */}
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

            {/* Dictionary Description */}
            <div className="tooltip-section definition-section">
              <div className="sub-heading">Strong's Definition:</div>
              <div 
                className="definition-entry" 
                dangerouslySetInnerHTML={{ __html: strongsData.entry }} 
              />
            </div>

            {/* In-context interactive word comparison tabs */}
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
          /* State D: Fallback if everything is empty */
          <div style={{ color: 'var(--text-secondary)' }}>No data loaded.</div>
        )}
      </div>
    </div>
  );
}
