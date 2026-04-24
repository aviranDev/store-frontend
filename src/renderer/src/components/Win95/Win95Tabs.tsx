import { ReactNode, useMemo, useState } from 'react'
import styled, { css } from 'styled-components'

export type TabItem = {
  id: string
  label: string
  disabled?: boolean
  content: ReactNode
}

type Win95TabsProps = {
  items: TabItem[]
  defaultTabId?: string
  activeTab?: string
  onChange?: (tabId: string) => void
  className?: string
  sidebar?: ReactNode
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
  padding: clamp(6px, 0.8vw, 12px);
  background: ${({ theme }) => theme.colors.face};
  border-top: 2px solid ${({ theme }) => theme.colors.light};
  border-left: 2px solid ${({ theme }) => theme.colors.light};
  border-right: 2px solid ${({ theme }) => theme.colors.dark};
  border-bottom: 2px solid ${({ theme }) => theme.colors.dark};
  box-sizing: border-box;
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: auto;
`

const TabPanelLayout = styled.div<{ $hasSidebar: boolean; $sidebarWidth: string }>`
  display: grid;
  grid-template-columns: ${({ $hasSidebar, $sidebarWidth }) =>
    $hasSidebar
      ? `clamp(610px, 34vw, 620px) ${$sidebarWidth}`
      : 'minmax(0, 1fr)'};

  gap: clamp(8px, 0.8vw, 14px);
  width: 100%;
  height: 100%;
  min-height: 0;
  align-items: stretch;

  & > div {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }

  @media (max-width: 1450px) {
    grid-template-columns: ${({ $hasSidebar, $sidebarWidth }) =>
      $hasSidebar
        ? `minmax(520px, 560px) ${$sidebarWidth}`
        : 'minmax(0, 1fr)'};

    gap: 10px;
  }

  @media (max-width: 1280px) {
    grid-template-columns: ${({ $hasSidebar, $sidebarWidth }) =>
      $hasSidebar
        ? `minmax(500px, 540px) ${$sidebarWidth}`
        : 'minmax(0, 1fr)'};

    gap: 8px;
  }

  @media (max-width: 1120px) {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(360px, auto) minmax(500px, 1fr);
    overflow-y: auto;

    & > div {
      overflow: visible;
    }
  }
`

const Win95Tabs = ({
  items,
  defaultTabId,
  activeTab: controlledActiveTab,
  onChange,
  className,
  sidebar,
  sidebarWidth = '1fr'
}: Win95TabsProps) => {
  const firstEnabledTab = useMemo(() => items.find((item) => !item.disabled)?.id ?? '', [items])

  const [uncontrolledActiveTab, setUncontrolledActiveTab] = useState<string>(
    defaultTabId || firstEnabledTab
  )

  const activeTab = controlledActiveTab ?? uncontrolledActiveTab

  const currentTab = items.find((item) => item.id === activeTab) || items[0]

  const handleTabChange = (tabId: string) => {
    setUncontrolledActiveTab(tabId)
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