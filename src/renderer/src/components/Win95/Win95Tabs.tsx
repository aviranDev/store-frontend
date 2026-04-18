import { useMemo, useState } from 'react'
import styled, { css } from 'styled-components'

export type TabItem = {
  id: string
  label: string
  disabled?: boolean
  content: React.ReactNode
}

type Win95TabsProps = {
  items: TabItem[]
  defaultTabId?: string
  activeTab?: string
  onChange?: (tabId: string) => void
  className?: string
  sidebar?: React.ReactNode
  sidebarWidth?: string
}

const TabsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
  flex: 1;
`

const TabList = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 1px;
  position: relative;
  z-index: 2;
  flex-wrap: wrap;
`

const TabButton = styled.button<{ $active: boolean }>`
  min-width: 70px;
  padding: 4px 10px 3px;
  background: ${({ theme }) => theme.colors.face};
  color: ${({ theme }) => theme.colors.text};
  border-top: 2px solid ${({ theme }) => theme.colors.light};
  border-left: 2px solid ${({ theme }) => theme.colors.light};
  border-right: 2px solid ${({ theme }) => theme.colors.dark};
  border-bottom: 2px solid ${({ theme }) => theme.colors.dark};
  cursor: pointer;
  font: inherit;
  line-height: 1.1;

  ${({ $active, theme }) =>
    $active &&
    css`
      position: relative;
      top: 2px;
      border-bottom: 2px solid ${theme.colors.face};
      z-index: 3;
    `};

  &:disabled {
    color: ${({ theme }) => theme.colors.dark};
    cursor: not-allowed;
  }
`

const TabPanel = styled.div`
  padding: 12px;
  background: ${({ theme }) => theme.colors.face};
  border-top: 2px solid ${({ theme }) => theme.colors.light};
  border-left: 2px solid ${({ theme }) => theme.colors.light};
  border-right: 2px solid ${({ theme }) => theme.colors.dark};
  border-bottom: 2px solid ${({ theme }) => theme.colors.dark};
  box-sizing: border-box;
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`
const TabPanelLayout = styled.div<{ $hasSidebar: boolean; $sidebarWidth: string }>`
  display: grid;
  grid-template-columns: ${({ $hasSidebar, $sidebarWidth }) =>
    $hasSidebar ? `minmax(0, 1fr) minmax(280px, ${$sidebarWidth})` : 'minmax(0, 1fr)'};
  gap: 16px;
  width: 100%;
  min-height: 665px;
  align-items: stretch;

  & > div {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }

  @media (max-width: 1600px) {
    min-height: 590px;
  }

  @media (max-width: 1400px) {
    min-height: 540px;
    grid-template-columns: ${({ $hasSidebar }) =>
      $hasSidebar ? 'minmax(0, 1.2fr) minmax(260px, 0.8fr)' : 'minmax(0, 1fr)'};
  }

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
    grid-auto-rows: minmax(0, auto);
    min-height: auto;
  }
`

const Win95Tabs = ({
  items,
  defaultTabId,
  onChange,
  className,
  sidebar,
  sidebarWidth = '320px'
}: Win95TabsProps) => {
  const firstEnabledTab = useMemo(() => items.find((item) => !item.disabled)?.id ?? '', [items])

  const [activeTab, setActiveTab] = useState<string>(defaultTabId || firstEnabledTab)

  const currentTab = items.find((item) => item.id === activeTab) || items[0]

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    onChange?.(tabId)
  }

  return (
    <TabsWrapper className={className}>
      <TabList role="tablist" aria-label="Window tabs">
        {items.map((item) => (
          <TabButton
            key={item.id}
            type="button"
            role="tab"
            aria-selected={activeTab === item.id}
            aria-controls={`panel-${item.id}`}
            id={`tab-${item.id}`}
            disabled={item.disabled}
            $active={activeTab === item.id}
            onClick={() => handleTabChange(item.id)}
          >
            {item.label}
          </TabButton>
        ))}
      </TabList>

      <TabPanel
        role="tabpanel"
        id={`panel-${currentTab.id}`}
        aria-labelledby={`tab-${currentTab.id}`}
      >
        <TabPanelLayout $hasSidebar={!!sidebar} $sidebarWidth={sidebarWidth}>
          <div>{currentTab.content}</div>
          {sidebar && <div>{sidebar}</div>}
        </TabPanelLayout>
      </TabPanel>
    </TabsWrapper>
  )
}

export default Win95Tabs
