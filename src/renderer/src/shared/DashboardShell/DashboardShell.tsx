import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../../Store/LoginProvider'
import Win95Page from '../../components/Win95/Win95Page'
import FileMenu from '../../components/FileMenu/FileMenu'
import {
  AdminBody,
  AdminFrame,
  AdminMenuBar,
  AdminStatusBar,
  AdminToolbar,
  AdminWorkspace,
  PanelOption,
  PanelOptionsList,
  PanelSelectArrow,
  PanelSelectBox,
  PanelSelectButton,
  PanelSelectLabel,
  PanelSelectText,
  PanelSelectWrap
} from '../../styles/DashboardStyle/DashboardPage.styles'

export type UserRole = 'admin' | 'employee' | 'customer'
export type PanelType = 'admin' | 'employee' | 'customer'

type DashboardShellProps = {
  title: string
  activePanel: PanelType
  children: React.ReactNode
}

const panelLabels: Record<PanelType, string> = {
  admin: 'Admin Panel',
  employee: 'Employee Panel',
  customer: 'Customer Panel'
}

const panelRoutes: Record<PanelType, string> = {
  admin: '/admin',
  employee: '/employee',
  customer: '/customer'
}

const allowedPanelsByRole: Record<UserRole, PanelType[]> = {
  admin: ['admin', 'employee', 'customer'],
  employee: ['employee', 'customer'],
  customer: ['customer']
}

export default function DashboardShell({
  activePanel,
  children
}: DashboardShellProps): React.JSX.Element {
  const navigate = useNavigate()
  const { logout, user } = useLogin()

  const [statusText, setStatusText] = useState(`${panelLabels[activePanel]} ready.`)
  const [isPanelMenuOpen, setIsPanelMenuOpen] = useState(false)

  const role = (user?.role ?? 'customer') as UserRole

  const allowedPanels = useMemo(() => {
    return allowedPanelsByRole[role] ?? ['customer']
  }, [role])

  const handlePanelChange = (nextPanel: PanelType): void => {
    if (!allowedPanels.includes(nextPanel)) return

    setIsPanelMenuOpen(false)
    setStatusText(`Opening ${panelLabels[nextPanel]}.`)
    navigate(panelRoutes[nextPanel])
  }

  return (
    <Win95Page
      title="User Account"
      width="clamp(980px, 82vw, 1500px)"
      maxWidth="calc(100vw - 24px)"
      height="clamp(560px, 68vh, 760px)"
      maxHeight="calc(100vh - 24px)"
    >
      <AdminBody>
        <AdminMenuBar>
          <FileMenu
            onAccount={() => navigate('/account')}
            onLogout={logout}
            onExit={() => window.close()}
          />
        </AdminMenuBar>

        <AdminToolbar>
          <PanelSelectWrap>
            <PanelSelectLabel>Panel:</PanelSelectLabel>

            <PanelSelectBox>
              <PanelSelectButton
                type="button"
                onClick={() => setIsPanelMenuOpen((prev) => !prev)}
                aria-haspopup="listbox"
                aria-expanded={isPanelMenuOpen}
              >
                <PanelSelectText>{panelLabels[activePanel]}</PanelSelectText>
                <PanelSelectArrow>▼</PanelSelectArrow>
              </PanelSelectButton>

              {isPanelMenuOpen && (
                <PanelOptionsList role="listbox" aria-label="Select panel">
                  {allowedPanels.map((panel) => (
                    <PanelOption
                      key={panel}
                      type="button"
                      $active={activePanel === panel}
                      onClick={() => handlePanelChange(panel)}
                    >
                      {panelLabels[panel]}
                    </PanelOption>
                  ))}
                </PanelOptionsList>
              )}
            </PanelSelectBox>
          </PanelSelectWrap>
        </AdminToolbar>

        <AdminFrame>
          <AdminWorkspace onMouseEnter={() => setStatusText(`${panelLabels[activePanel]} ready.`)}>
            {children}
          </AdminWorkspace>
        </AdminFrame>

        <AdminStatusBar>{statusText}</AdminStatusBar>
      </AdminBody>
    </Win95Page>
  )
}