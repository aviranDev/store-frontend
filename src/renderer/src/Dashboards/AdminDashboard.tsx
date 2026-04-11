import React from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardShell from '../shared/DashboardShell/DashboardShell'
import PanelItem from '../components/PanelItem/PanelItem'
import { AdminGrid } from '../styles/admin/AdminPage.styles'
import usersIcon from '../assets/users-2.png'
import containerIcon from '../assets/container.png'

export default function AdminDashboard(): React.JSX.Element {
  const navigate = useNavigate()

  return (
    <DashboardShell title="Admin Dashboard" activePanel="admin">
      <AdminGrid>
        <PanelItem
          image={usersIcon}
          label="Users"
          onClick={() => alert('Users')}
          onHover={() => {}}
        />

        <PanelItem
          image={usersIcon}
          label="Employee Area"
          onClick={() => navigate('/employee')}
          onHover={() => {}}
        />

        <PanelItem
          image={usersIcon}
          label="Customer Area"
          onClick={() => navigate('/customer')}
          onHover={() => {}}
        />

        <PanelItem
          image={containerIcon}
          label="LoadingPlan"
          onClick={() => navigate('/EmployeeLoadingPlan')}
          onHover={() => {}}
        />
      </AdminGrid>
    </DashboardShell>
  )
}
