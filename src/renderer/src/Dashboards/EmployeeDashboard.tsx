import React from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardShell from '../shared/DashboardShell/DashboardShell'
import AdminPanelItem from '../shared/DashboardShell/AdminPanelItem'
import { AdminGrid } from '../styles/admin/AdminPage.styles'
import usersIcon from '../assets/users-2.png'

export default function EmployeeDashboard(): React.JSX.Element {
  const navigate = useNavigate()

  return (
    <DashboardShell title="Employee Dashboard" activePanel="employee">
      <AdminGrid>
        <AdminPanelItem
          image={usersIcon}
          label="Tasks"
          onClick={() => alert('Tasks')}
          onHover={() => {}}
        />

        <AdminPanelItem
          image={usersIcon}
          label="Schedule"
          onClick={() => alert('Schedule')}
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
