import React from 'react';
import { Card, Typography, Space, Button, Empty } from 'antd';
import { StarFilled, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * @file BookmarksView.js
 * @description Card list view displaying bookmarked and highlighted verses.
 */
/**
 * BookmarksView Component
 * 
 * @param {Object} props
 * @param {Array<Object>} props.bookmarks - Array of saved bookmark objects.
 * @param {Function} props.getBookName - Resolver to match book codes to language names.
 * @param {Function} props.handleJumpToVerse - Navigates reader back to the target chapter and verse card.
 * @param {Function} props.handleRemoveBookmark - Deletes the target bookmark from memory and sheets API.
 * @param {boolean} props.isMobile - Responsive rendering layout flag.
 * @param {Function} props.t - Text dictionary translation lookup function.
 */
export default function BookmarksView({
  bookmarks,
  getBookName,
  handleJumpToVerse,
  handleRemoveBookmark,
  isMobile,
  t
}) {
  return (
    <div>
      {/* Page Hero Section displaying a clean crimson gradient */}
      <div className="hero-section" style={{ background: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)' }}>
        <Title level={isMobile ? 3 : 2} style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <StarFilled style={{ color: '#fadb14' }} /> {t('savedBookmarksTitle')}
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', display: 'block', marginTop: '6px' }}>
          {t('savedBookmarksDesc')}
        </Text>
      </div>

      {/* Bookmarked verses container */}
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
                    {/* Location indicator (e.g. Genesis 1:1) */}
                    <Text strong style={{ fontSize: '15px' }}>
                      {bookName} {b.chapter}:{b.verse} 
                      <span style={{ fontSize: '11px', opacity: 0.6, marginLeft: '8px', fontWeight: 400 }}>
                        ({b.version})
                      </span>
                    </Text>
                    
                    {/* Read & Delete actions */}
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
                {/* Bookmarked verse body text */}
                <Text className="verse-text" style={{ fontStyle: 'italic', display: 'block', marginTop: '4px' }}>
                  "{b.text}"
                </Text>
              </Card>
            );
          })
        ) : (
          /* Empty state shown if no highlights have been added */
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
  );
}
