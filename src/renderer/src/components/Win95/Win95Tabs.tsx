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
`

const TabList = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 1px;
  position: relative;
  z-index: 2;
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
  margin-top: -2px;
  padding: 12px;
  background: ${({ theme }) => theme.colors.face};
  border-top: 2px solid ${({ theme }) => theme.colors.light};
  border-left: 2px solid ${({ theme }) => theme.colors.light};
  border-right: 2px solid ${({ theme }) => theme.colors.dark};
  border-bottom: 2px solid ${({ theme }) => theme.colors.dark};
  min-height: 500px;
  box-sizing: border-box;
  display: flex;
`
const TabPanelLayout = styled.div<{ $hasSidebar: boolean; $sidebarWidth: string }>`
  display: grid;
  grid-template-columns: ${({ $hasSidebar, $sidebarWidth }) =>
    $hasSidebar ? `1fr ${$sidebarWidth}` : '1fr'};
  gap: 16px;
  width: 100%;
  min-height: 100%;
  align-items: stretch;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
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
