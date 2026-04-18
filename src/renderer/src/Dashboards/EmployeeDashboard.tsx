import React from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardShell from '../shared/DashboardShell/DashboardShell'
import PanelItem from '../components/PanelItem/PanelItem'
import { AdminGrid } from '../styles/DashboardStyle/DashboardPage.styles'
import containerIcon from '../assets/container.png'

export default function EmployeeDashboard(): React.JSX.Element {
  const navigate = useNavigate()

  return (
    <DashboardShell title="Employee Dashboard" activePanel="employee">
      <AdminGrid>
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
