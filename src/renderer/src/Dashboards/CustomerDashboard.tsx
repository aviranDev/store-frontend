import React from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardShell from '../shared/DashboardShell/DashboardShell'
import PanelItem from '../components/PanelItem/PanelItem'
import { AdminGrid } from '../styles/DashboardStyle/DashboardPage.styles'
import usersIcon from '../assets/users-2.png'

export default function CustomerDashboard(): React.JSX.Element {
  const navigate = useNavigate()

  return (
    <DashboardShell title="Customer Dashboard" activePanel="customer">
      <AdminGrid>
        <PanelItem
          image={usersIcon}
          label="My Account"
          onClick={() => navigate('/account')}
          onHover={() => {}}
        />

        <PanelItem
          image={usersIcon}
          label="Orders"
          onClick={() => alert('Orders')}
          onHover={() => {}}
        />

        <PanelItem
          image={usersIcon}
          label="Support"
          onClick={() => alert('Support')}
          onHover={() => {}}
        />
      </AdminGrid>
    </DashboardShell>
  )
}
