import React from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardShell from '../shared/DashboardShell/DashboardShell'
import AdminPanelItem from '../shared/DashboardShell/AdminPanelItem'
import { AdminGrid } from '../styles/admin/AdminPage.styles'
import usersIcon from '../assets/users-2.png'

export default function CustomerDashboard(): React.JSX.Element {
  const navigate = useNavigate()

  return (
    <DashboardShell title="Customer Dashboard" activePanel="customer">
      <AdminGrid>
        <AdminPanelItem
          image={usersIcon}
          label="My Account"
          onClick={() => navigate('/account')}
          onHover={() => {}}
        />

        <AdminPanelItem
          image={usersIcon}
          label="Orders"
          onClick={() => alert('Orders')}
          onHover={() => {}}
        />

        <AdminPanelItem
          image={usersIcon}
          label="Support"
          onClick={() => alert('Support')}
          onHover={() => {}}
        />
      </AdminGrid>
    </DashboardShell>
  )
}
