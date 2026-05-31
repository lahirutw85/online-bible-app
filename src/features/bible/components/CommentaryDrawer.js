import React, { useState, useEffect } from 'react';
import { Drawer, Select, Spin, Typography, Space, Alert, Empty, Button, Tooltip } from 'antd';
import { BookOutlined, LoadingOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const availableCommentariesList = [
  { id: 'tyndale', name: 'Tyndale Open Study Notes' },
  { id: 'matthew-henry', name: 'Matthew Henry Bible Commentary' },
  { id: 'adam-clarke', name: 'Adam Clarke Bible Commentary' },
  { id: 'jamieson-fausset-brown', name: 'Jamieson-Fausset-Brown Bible Commentary' },
  { id: 'john-gill', name: 'John Gill Bible Commentary' },
  { id: 'keil-delitzsch', name: 'Carl Keil & Franz Delitzsch OT Commentary' }
];

export default function CommentaryDrawer({
  visible,
  onClose,
  verseCoords, // { book: 'GEN', chapter: 1, verse: 1, bookName: 'උත්පත්ති' }
  isMobile
}) {
  const [commentaryId, setCommentaryId] = useState('tyndale');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [commentaryText, setCommentaryText] = useState('');
  const [commFontSize, setCommFontSize] = useState(() => parseInt(localStorage.getItem("commentary-font-size")) || 15);

  const handleCommFontSizeChange = (action) => {
    setCommFontSize(prev => {
      let nextSize = prev;
      if (action === 'increase' && prev < 32) {
        nextSize = prev + 2;
      } else if (action === 'decrease' && prev > 12) {
        nextSize = prev - 2;
      }
      localStorage.setItem("commentary-font-size", nextSize);
      return nextSize;
    });
  };

  useEffect(() => {
    if (!visible || !verseCoords) return;

    const fetchCommentary = async () => {
      setLoading(true);
      setError(null);
      setCommentaryText('');

      try {
        const bookCode = verseCoords.book.toUpperCase();
        // Convert book code names if necessary (e.g. from localToHelloAoMap format)
        const mapToHelloAo = {
          "GEN": "GEN", "EXOD": "EXO", "LEV": "LEV", "NUM": "NUM", "DEUT": "DEU",
          "JOSH": "JOS", "JUDG": "JDG", "RUTH": "RUT", "1SAM": "1SA", "2SAM": "2SA",
          "1KGS": "1KI", "2KGS": "2KI", "1CHR": "1CH", "2CHR": "2CH", "EZRA": "EZR",
          "NEH": "NEH", "ESTH": "EST", "JOB": "JOB", "PS": "PSA", "PROV": "PRO",
          "ECCL": "ECC", "SONG": "SNG", "ISA": "ISA", "JER": "JER", "LAM": "LAM",
          "EZEK": "EZK", "DAN": "DAN", "HOS": "HOS", "JOEL": "JOL", "AMOS": "AMO",
          "OBAD": "OBA", "JONAH": "JON", "MIC": "MIC", "NAH": "NAM", "HAB": "HAB",
          "ZEPH": "ZEP", "HAG": "HAG", "ZECH": "ZEC", "MAL": "MAL", "MATT": "MAT",
          "MARK": "MRK", "LUKE": "LUK", "JOHN": "JHN", "ACTS": "ACT", "ROM": "ROM",
          "1COR": "1CO", "2COR": "2CO", "GAL": "GAL", "EPH": "EPH", "PHIL": "PHP",
          "COL": "COL", "1THESS": "1TH", "2THESS": "2TH", "1TIM": "1TI", "2TIM": "2TI",
          "TITUS": "TIT", "PHLM": "PHM", "HEB": "HEB", "JAS": "JAS", "1PET": "1PE",
          "2PET": "2PE", "1JOHN": "1JN", "2JOHN": "2JN", "3JOHN": "3JN", "JUDE": "JUD",
          "REV": "REV"
        };
        const resolvedBook = mapToHelloAo[bookCode] || bookCode;
        const chapter = verseCoords.chapter;
        const verseNum = verseCoords.verse;

        const url = `https://bible.helloao.org/api/c/${commentaryId}/${resolvedBook}/${chapter}.json`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`This commentary does not have resources for this chapter/book.`);
        }

        const data = await res.json();
        
        // Find comment for this specific verse
        let matchedText = '';
        if (data.chapter && Array.isArray(data.chapter.content)) {
          // Look for items matching type "verse" and number matching our verse
          const matches = data.chapter.content.filter(
            item => item.type === 'verse' && (item.number === verseNum || item.verse === verseNum)
          );

          if (matches.length > 0) {
            matchedText = matches.map(item => {
              if (Array.isArray(item.content)) {
                return item.content.join(' ');
              }
              return typeof item.content === 'string' ? item.content : '';
            }).join('\n\n');
          }
        }

        setCommentaryText(matchedText || 'මෙම පදයට අදාළ විස්තරයක් මෙම commentary පොතෙහි සොයාගත නොහැකි විය. (No commentary text found for this specific verse.)');
      } catch (err) {
        console.error("Commentary loading error:", err);
        setError("විවරණය පූරණය කිරීමේදී දෝෂයක් සිදු විය. (Failed to load commentary details.)");
      } finally {
        setLoading(false);
      }
    };

    fetchCommentary();
  }, [visible, verseCoords, commentaryId]);

  return (
    <Drawer
      title={
        <Space style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOutlined style={{ color: 'var(--accent-color)' }} /> 
            {verseCoords ? `${verseCoords.bookName} ${verseCoords.chapter}:${verseCoords.verse}` : ''} විවරණය (Verse Commentary)
          </span>
          <Space style={{ gap: '12px', alignItems: 'center', width: isMobile ? '100%' : 'auto', justifyContent: 'flex-end' }}>
            <Space style={{ gap: 0 }}>
              <Tooltip title="අකුරු විශාලත්වය වැඩි කරන්න (Increase Font Size)">
                <Button 
                  onClick={() => handleCommFontSizeChange('increase')}
                  style={{ fontWeight: 'bold', borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRight: 'none' }}
                >
                  A+
                </Button>
              </Tooltip>
              <Tooltip title="අකුරු විශාලත්වය අඩු කරන්න (Decrease Font Size)">
                <Button 
                  onClick={() => handleCommFontSizeChange('decrease')}
                  style={{ fontWeight: 'bold', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                >
                  A-
                </Button>
              </Tooltip>
            </Space>
            <Select
              value={commentaryId}
              onChange={(val) => setCommentaryId(val)}
              style={{ width: isMobile ? '100%' : 280 }}
              dropdownStyle={{ borderRadius: '8px' }}
              options={availableCommentariesList.map(c => ({ value: c.id, label: c.name }))}
            />
          </Space>
        </Space>
      }
      placement="right"
      width={isMobile ? '100%' : '80%'}
      onClose={onClose}
      open={visible}
      bodyStyle={{ padding: isMobile ? '16px' : '24px', overflowY: 'auto' }}
    >
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh', gap: '16px' }}>
          <Spin indicator={antIcon} />
          <Text type="secondary" style={{ fontSize: '14px' }}>විවරණ දත්ත ලබා ගනිමින් පවතී... (Fetching commentary data...)</Text>
        </div>
      ) : error ? (
        <Alert message={error} type="warning" showIcon style={{ borderRadius: '8px' }} />
      ) : commentaryText ? (
        <div style={{ fontSize: `${commFontSize + 1}px`, lineHeight: '1.8', color: 'var(--text-primary)' }} className="commentary-content-view">
          {commentaryText.split('\n\n').map((paragraph, index) => (
            <Paragraph key={index} style={{ marginBottom: '16px', fontSize: `${commFontSize}px` }}>{paragraph}</Paragraph>
          ))}
        </div>
      ) : (
        <Empty description="කිසිදු දත්තයක් නැත (No data available)" />
      )}
    </Drawer>
  );
}
