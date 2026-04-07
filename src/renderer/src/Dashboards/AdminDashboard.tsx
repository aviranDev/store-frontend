import React from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardShell from '../shared/DashboardShell/DashboardShell'
import AdminPanelItem from '../shared/DashboardShell/AdminPanelItem'
import { AdminGrid } from '../styles/admin/AdminPage.styles'
import usersIcon from '../assets/users-2.png'

export default function AdminDashboard(): React.JSX.Element {
  const navigate = useNavigate()

  return (
    <DashboardShell title="Admin Dashboard" activePanel="admin">
      <AdminGrid>
        <AdminPanelItem
          image={usersIcon}
          label="Users"
          onClick={() => alert('Users')}
          onHover={() => {}}
        />

        <AdminPanelItem
          image={usersIcon}
          label="Employee Area"
          onClick={() => navigate('/employee')}
          onHover={() => {}}
        />

        <AdminPanelItem
          image={usersIcon}
          label="Customer Area"
          onClick={() => navigate('/customer')}
          onHover={() => {}}
        />
      </AdminGrid>
    </DashboardShell>
  )
}
