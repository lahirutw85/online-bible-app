import React from 'react';
import { Layout, Typography, Space, Button, Select, Tooltip, Input, Radio, AutoComplete } from 'antd';
import { 
  MenuUnfoldOutlined, 
  MenuFoldOutlined, 
  TranslationOutlined, 
  SunOutlined, 
  MoonOutlined, 
  SettingOutlined,
  SearchOutlined
} from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;

/**
 * @file HeaderBar.js
 * @description Top header bar component housing selectors, font adjusters, theme toggles, and search.
 * Decouples navigation controls, font modifiers, search input fields, and translation dropdowns.
 */

/**
 * HeaderBar Component
 * 
 * @param {Object} props
 * @param {string} props.theme - Active style theme ('light' | 'dark').
 * @param {Function} props.setTheme - Dispatch state to toggle theme.
 * @param {number} props.fontSize - Reading font size in pixels.
 * @param {Function} props.handleFontSizeChange - Changes font size dynamically (zoom zoom).
 * @param {string} props.version - Active Bible translation version code.
 * @param {Function} props.setVersion - Updates active version selection.
 * @param {boolean} props.compareMode - Active state indicating if comparison is enabled.
 * @param {Function} props.setCompareMode - Toggles comparison mode state.
 * @param {string} props.compareVersion - Compared Bible translation version code.
 * @param {Function} props.setCompareVersion - Updates compared version selection.
 * @param {string} props.selectedBook - Selected book code or "bookmarks".
 * @param {string} props.searchTerm - Text typed into search input box.
 * @param {Function} props.setSearchTerm - Action to update the search query state.
 * @param {Function} props.handleSearch - Executes a search query.
 * @param {string} props.searchScope - Scope of search ('global' | 'book').
 * @param {Function} props.setSearchScope - Selects scope bounds.
 * @param {boolean} props.searchActive - Active search indicators.
 * @param {Function} props.clearSearch - Resets and hides search results.
 * @param {boolean} props.isMobile - Narrow viewport scale responsive checker.
 * @param {boolean} props.collapsed - Sidebar folded status.
 * @param {Function} props.setCollapsed - Dispatch state to slide fold/unfold sidebar index.
 * @param {Function} props.openSettings - Triggers slide in of settings sync drawer.
 * @param {Function} props.t - Translates internal static key names to local strings.
 * @param {Array<Object>} props.versionsList - Details of supported translations.
 * @param {Function} props.getLanguage - Maps translation codes to locales ('si' | 'ta' | 'en').
 * @param {string} props.logo - URL of brand logo graphic.
 * @param {Array<Object>} props.suggestions - Real-time autocomplete suggestions.
 * @param {Function} props.handleSelectSuggestion - Selected suggestion click handler.
 */
export default function HeaderBar({
  theme,
  setTheme,
  fontSize,
  handleFontSizeChange,
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
  searchTerm,
  setSearchTerm,
  handleSearch,
  searchActive,
  clearSearch,
  isMobile,
  collapsed,
  setCollapsed,
  openSettings,
  t,
  versionsList,
  getLanguage,
  logo,
  suggestions = [],
  handleSelectSuggestion,
  desktopSearchRef
}) {
  return (
    <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, width: '100%', zIndex: 1000 }}>
      
      {/* Brand logo and folding sidebar drawer toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
        <Button 
          type="text" 
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} 
          onClick={() => setCollapsed(!collapsed)} 
          style={{ fontSize: '16px', width: 40, height: 40 }}
        />
        <div 
          onClick={() => window.location.reload()}
          style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', cursor: 'pointer' }}
          className="brand-logo-container"
        >
          <img src={logo} alt="Bibalaya Logo" style={{ height: isMobile ? '32px' : '36px', width: isMobile ? '32px' : '36px', borderRadius: '8px', objectFit: 'cover' }} />
          <Title level={isMobile ? 5 : 4} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em', color: theme === 'dark' ? '#f8fafc' : '#2c3e50', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Bibalaya.com {!isMobile && <span style={{ fontSize: '12px', opacity: 0.5, fontWeight: 400, marginTop: '4px', color: theme === 'dark' ? '#94a3b8' : '#718096' }}>{t('subtitle')}</span>}
          </Title>
        </div>
      </div>

      {/* Control selectors block */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }}>
        
        {/* Version dropdown selectors (Desktop Viewports only - hidden on mobile headers) */}
        {!isMobile && (
          <Space>
            <Button 
              type={compareMode ? "primary" : "default"}
              icon={<TranslationOutlined />}
              onClick={() => setCompareMode(!compareMode)}
            >
              {compareMode ? "Disable Compare" : "Compare"}
            </Button>

            {compareMode && (
              <Button
                type={threeWayCompare ? "primary" : "default"}
                onClick={() => setThreeWayCompare(!threeWayCompare)}
              >
                {threeWayCompare ? "2-Way Compare" : "3-Way Compare"}
              </Button>
            )}
            
            <Select 
              value={version} 
              onChange={(val) => setVersion(val)} 
              style={{ width: compareMode ? (threeWayCompare ? 160 : 200) : 280 }}
              dropdownStyle={{ borderRadius: '8px' }}
              disabled={selectedBook === "bookmarks"}
            >
              {versionsList.map(v => (
                <Select.Option key={v.value} value={v.value} disabled={v.disabled}>{v.label}</Select.Option>
              ))}
            </Select>

            {compareMode && (
              <Select 
                value={compareVersion} 
                onChange={(val) => setCompareVersion(val)} 
                style={{ width: threeWayCompare ? 160 : 200 }}
                dropdownStyle={{ borderRadius: '8px' }}
                disabled={selectedBook === "bookmarks"}
              >
                {versionsList.map(v => (
                  <Select.Option key={v.value} value={v.value} disabled={v.disabled}>{v.label}</Select.Option>
                ))}
              </Select>
            )}

            {compareMode && threeWayCompare && (
              <Select 
                value={compareVersion3} 
                onChange={(val) => setCompareVersion3(val)} 
                style={{ width: 160 }}
                dropdownStyle={{ borderRadius: '8px' }}
                disabled={selectedBook === "bookmarks"}
              >
                {versionsList.map(v => (
                  <Select.Option key={v.value} value={v.value} disabled={v.disabled}>{v.label}</Select.Option>
                ))}
              </Select>
            )}
          </Space>
        )}

        {/* Font size zoom scaling buttons (A+/A-) */}
        <Space style={{ gap: 0 }} className="font-size-adjuster">
          <Tooltip title={getLanguage() === 'si' ? "අකුරු විශාලත්වය වැඩි කරන්න" : getLanguage() === 'ta' ? "எழுத்துரு அளவை அதிகரிக்கவும்" : "Increase Font Size"}>
            <Button 
              onClick={() => handleFontSizeChange('increase')}
              style={{ fontWeight: 'bold', borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRight: 'none' }}
            >
              A+
            </Button>
          </Tooltip>
          <Tooltip title={getLanguage() === 'si' ? "අකුරු විශාලත්වය අඩු කරන්න" : getLanguage() === 'ta' ? "எழுத்துரு அளவை குறைக்கக்கவும்" : "Decrease Font Size"}>
            <Button 
              onClick={() => handleFontSizeChange('decrease')}
              style={{ fontWeight: 'bold', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
            >
              A-
            </Button>
          </Tooltip>
        </Space>

        {/* Color theme mode toggler */}
        <Tooltip title={theme === 'dark' ? "Light Mode" : "Dark Mode"}>
          <Button 
            type="text" 
            icon={theme === 'dark' ? <SunOutlined style={{ color: '#fadb14', fontSize: '18px' }} /> : <MoonOutlined style={{ color: '#4a5568', fontSize: '18px' }} />}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{ width: 40, height: 40, borderRadius: '8px' }}
          />
        </Tooltip>

        {/* Settings sync drawer trigger */}
        <Tooltip title="Settings">
          <Button 
            type="text" 
            icon={<SettingOutlined style={{ fontSize: '18px' }} />}
            onClick={openSettings}
            style={{ width: 40, height: 40, borderRadius: '8px' }}
          />
        </Tooltip>

        {/* Main query search inputs (Desktop Viewports only) */}
        {!isMobile && selectedBook !== "bookmarks" && (
          <AutoComplete
            options={suggestions}
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
            onSelect={(val, option) => handleSelectSuggestion(val, option)}
            open={suggestions.length > 0 && searchTerm.trim() !== ''}
            style={{ width: 280 }}
            popupClassName="search-suggestions-dropdown"
          >
            <Input 
              ref={desktopSearchRef}
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onPressEnter={(e) => handleSearch(e.target.value)}
              suffix={
                <SearchOutlined 
                  onClick={() => handleSearch(searchTerm)}
                  style={{ cursor: 'pointer', color: 'var(--accent-color)', fontSize: '16px' }}
                />
              }
              allowClear
            />
          </AutoComplete>
        )}
      </div>
    </Header>
  );
}
