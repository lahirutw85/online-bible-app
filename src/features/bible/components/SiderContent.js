import React from 'react';
import { Menu, Button, Select, Typography, Radio, Badge, Input, AutoComplete } from 'antd';
import { BookOutlined, TranslationOutlined, StarFilled } from '@ant-design/icons';

const { Text } = Typography;

/**
 * @file SiderContent.js
 * @description Sidebar content menu listing book mappings and mobile control items.
 * On mobile devices, this component is rendered inside an Ant Design Drawer overlay layout.
 * On desktop viewports, it sits inside a sticky Sider layout.
 */

/**
 * SiderContent Component
 * 
 * @param {Object} props
 * @param {boolean} props.isMobile - Responsive viewport scale check.
 * @param {Function} props.setCollapsed - Dispatch state to toggle sidebar visibility.
 * @param {string} props.theme - Active style theme ('light' | 'dark').
 * @param {string} props.version - Active Bible translation version code.
 * @param {Function} props.setVersion - Updates active version selection.
 * @param {boolean} props.compareMode - Active state indicating if comparison is enabled.
 * @param {Function} props.setCompareMode - Toggles comparison mode state.
 * @param {string} props.compareVersion - Compared Bible translation version code.
 * @param {Function} props.setCompareVersion - Updates compared version selection.
 * @param {string} props.selectedBook - Selected book code or "bookmarks".
 * @param {Function} props.setSelectedBook - Dispatch state to switch active book.
 * @param {Function} props.setSelectedChapter - Dispatch state to reset or change active chapter.
 * @param {boolean} props.searchActive - Active search indicators.
 * @param {Function} props.setSearchActive - Dispatch state to clear/set search mode.
 * @param {string} props.searchTerm - Text typed into search input box.
 * @param {Function} props.setSearchTerm - Action to update the search query state.
 * @param {Function} props.handleSearch - Executes a search query.
 * @param {string} props.searchScope - Scope of search ('global' | 'book').
 * @param {Function} props.setSearchScope - Selects scope bounds.
 * @param {Array<Object>} props.bookmarks - Array of saved bookmark objects.
 * @param {Array<Object>} props.availableBooks - Filtered listing of books matching active translation.
 * @param {Function} props.t - Translates internal static key names to local strings.
 * @param {Array<Object>} props.versionsList - Details of supported translations.
 * @param {Array<Object>} props.suggestions - Real-time autocomplete suggestions.
 * @param {Function} props.handleSelectSuggestion - Suggestion click handler.
 */
export default function SiderContent({
  isMobile,
  setCollapsed,
  theme,
  version,
  setVersion,
  compareMode,
  setCompareMode,
  compareVersion,
  setCompareVersion,
  threeWayCompare,
  setThreeWayCompare,
  compareVersion3,
  setCompareVersion3,
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
  bookChaptersMap,
  t,
  versionsList,
  suggestions = [],
  handleSelectSuggestion
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="sider-header">
        <span><BookOutlined style={{ marginRight: '8px' }} />{t('index')}</span>
      </div>

      {/* Mobile-only control layout panel (versions, compare selections, query search inputs) */}
      {/* Required because the main header selectors are hidden on narrow viewports */}
      {isMobile && (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid var(--border-color)', background: theme === 'dark' ? '#111827' : '#f7fafc' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <Button 
                type={compareMode ? "primary" : "default"}
                size="small"
                icon={<TranslationOutlined />}
                onClick={() => setCompareMode(!compareMode)}
                style={{ flex: 1, borderRadius: '8px' }}
              >
                {compareMode ? "Disable Compare" : "Compare"}
              </Button>
              {compareMode && (
                <Button
                  type={threeWayCompare ? "primary" : "default"}
                  size="small"
                  onClick={() => setThreeWayCompare(!threeWayCompare)}
                  style={{ flex: 1, borderRadius: '8px' }}
                >
                  {threeWayCompare ? "2-Way" : "3-Way"}
                </Button>
              )}
            </div>
            <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>{t('versionLabel')}</Text>
            <Select 
              value={version} 
              onChange={(val) => {
                setVersion(val);
                setCollapsed(true); // Close drawer overlay
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
                <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>{t('compareVersionLabel')} 1</Text>
                <Select 
                  value={compareVersion} 
                  onChange={(val) => {
                    setCompareVersion(val);
                    setCollapsed(true);
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

            {compareMode && threeWayCompare && (
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>{t('compareVersionLabel')} 2</Text>
                <Select 
                  value={compareVersion3} 
                  onChange={(val) => {
                    setCompareVersion3(val);
                    setCollapsed(true);
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
              <AutoComplete
                options={suggestions}
                value={searchTerm}
                onChange={(val) => setSearchTerm(val)}
                onSelect={(val, option) => {
                  handleSelectSuggestion(val, option);
                  setCollapsed(true);
                }}
                style={{ width: '100%' }}
                popupClassName="search-suggestions-dropdown"
              >
                <Input.Search 
                  placeholder={t('searchPlaceholder')}
                  onSearch={(val) => {
                    handleSearch(val);
                    setCollapsed(true);
                  }}
                  allowClear
                />
              </AutoComplete>
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

      {/* Book index menu */}
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
              setCollapsed(true); // Close drawer overlay on selection
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
            ...availableBooks.flatMap(b => {
              const chCount = bookChaptersMap[b.code] || 0;
              const bookItem = {
                key: b.code,
                icon: <BookOutlined />,
                label: `${b.name} (${chCount})`
              };
              if (b.code === "Mal") {
                return [
                  bookItem,
                  {
                    key: "ot-nt-divider",
                    disabled: true,
                    label: <div style={{ color: 'var(--text-secondary)', opacity: 0.5, textAlign: 'center', fontWeight: 'bold', userSelect: 'none' }}>-------------------------</div>,
                    style: { height: '20px', pointerEvents: 'none', background: 'transparent' }
                  }
                ];
              }
              return [bookItem];
            })
          ]}
        />
      </div>
    </div>
  );
}
