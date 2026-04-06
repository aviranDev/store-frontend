import React, { useState } from 'react'
import { useLogin } from '../Store/LoginProvider'
import {
  AdminBody,
  AdminFrame,
  AdminGrid,
  AdminMenuBar,
  AdminMenuItem,
  AdminStatusBar,
  AdminToolbar,
  AdminWorkspace,
  PanelSelectLabel,
  PanelSelectWrap,
  PanelSelectArrow,
  PanelSelectBox,
  PanelSelectButton,
  PanelSelectText,
  PanelOptionsList,
  PanelOption
} from '../styles/admin/AdminPage.styles'
import AdminPanelItem from '../components/AdminPanelItem'
import Win95Page from '../components/Win95Page'
import usersIcon from '../assets/users-2.png'

type AdminEntry = {
  label: string
  status: string
  image: string
  onClick: () => void
}

type PanelType = 'admin' | 'employee' | 'customer'

export default function AdminPanelPage(): React.JSX.Element {
  const [activePanel, setActivePanel] = useState<PanelType>('admin')
  const { logout } = useLogin()
  const [statusText, setStatusText] = useState('Ready.')
  const [isPanelMenuOpen, setIsPanelMenuOpen] = useState(false)

  const panelLabels: Record<PanelType, string> = {
    admin: 'Admin Panel',
    employee: 'Employee Panel',
    customer: 'Customer Panel'
  }

  const handlePanelChange = (nextPanel: PanelType): void => {
    setActivePanel(nextPanel)
    setStatusText(`Switched to ${nextPanel} panel.`)
    setIsPanelMenuOpen(false)
  }

  const adminItems: AdminEntry[] = [
    {
      label: 'Users',
      image: usersIcon,
      status: 'Manage users and permissions.',
      onClick: () => alert('Users')
    }
    // { label: 'Orders', status: 'Open the orders section.', onClick: () => alert('Orders') },
    // { label: 'Reports', status: 'View system reports.', onClick: () => alert('Reports') },
    // { label: 'Settings', status: 'Change application settings.', onClick: () => alert('Settings') },
    // { label: 'Inbox', status: 'Check incoming admin messages.', onClick: () => alert('Inbox') },
    // { label: 'Tasks', status: 'Review current tasks.', onClick: () => alert('Tasks') },
    // { label: 'Logs', status: 'Inspect activity logs.', onClick: () => alert('Logs') },
    // { label: 'Support', status: 'Open support tools.', onClick: () => alert('Support') }
  ]

  const employeeItems: AdminEntry[] = [
    // { label: 'Orders', status: 'Open assigned orders.', onClick: () => alert('Orders') },
    // { label: 'Tasks', status: 'Check your current tasks.', onClick: () => alert('Tasks') },
    // { label: 'Inbox', status: 'Open employee inbox.', onClick: () => alert('Inbox') },
    // { label: 'Schedule', status: 'View work schedule.', onClick: () => alert('Schedule') },
    // { label: 'Clients', status: 'Open client records.', onClick: () => alert('Clients') },
    // { label: 'Support', status: 'Contact support tools.', onClick: () => alert('Support') }
  ]

  const customerItems: AdminEntry[] = [
    // { label: 'Orders', status: 'Track your orders.', onClick: () => alert('Orders') },
    // { label: 'Invoices', status: 'View customer invoices.', onClick: () => alert('Invoices') },
    // { label: 'Messages', status: 'Open customer messages.', onClick: () => alert('Messages') },
    // { label: 'Profile', status: 'Update your profile.', onClick: () => alert('Profile') },
    // { label: 'Support', status: 'Get customer support.', onClick: () => alert('Support') }
  ]

  const panelItemsMap: Record<PanelType, AdminEntry[]> = {
    admin: adminItems,
    employee: employeeItems,
    customer: customerItems
  }

  const items = panelItemsMap[activePanel]
  return (
    <Win95Page title="Admin Panel" width="920px" maxWidth="96vw">
      <AdminBody>
        <AdminMenuBar>
          <AdminMenuItem type="button">File</AdminMenuItem>
          <AdminMenuItem type="button">Edit</AdminMenuItem>
          <AdminMenuItem type="button">View</AdminMenuItem>
          <AdminMenuItem type="button">Help</AdminMenuItem>
          <AdminMenuItem type="button" onClick={logout}>
            Logout
          </AdminMenuItem>
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
                  <PanelOption
                    type="button"
                    $active={activePanel === 'admin'}
                    onClick={() => handlePanelChange('admin')}
                  >
                    Admin Panel
                  </PanelOption>

                  <PanelOption
                    type="button"
                    $active={activePanel === 'employee'}
                    onClick={() => handlePanelChange('employee')}
                  >
                    Employee Panel
                  </PanelOption>

                  <PanelOption
                    type="button"
                    $active={activePanel === 'customer'}
                    onClick={() => handlePanelChange('customer')}
                  >
                    Customer Panel
                  </PanelOption>
                </PanelOptionsList>
              )}
            </PanelSelectBox>
          </PanelSelectWrap>
        </AdminToolbar>

        <AdminFrame>
          <AdminWorkspace>
            <AdminGrid>
              {items.map((item) => (
                <AdminPanelItem
                  key={item.label}
                  image={item.image}
                  label={item.label}
                  onClick={item.onClick}
                  onHover={() => setStatusText(item.status)}
                />
              ))}
            </AdminGrid>
          </AdminWorkspace>
        </AdminFrame>
        <AdminStatusBar>{statusText}</AdminStatusBar>
      </AdminBody>
    </Win95Page>
  )
}
