// src/shared/DashboardPages/DashboardSplitPage.tsx
import React from 'react'
import DashboardShell, { PanelType } from './DashboardShell'
import Win95Card from '../../components/Win95/Win95Card'
import Win95GroupBox from '../../components/Win95/Win95GroupBox'
import styled from 'styled-components'

type DashboardSplitPageProps = {
  title: string
  activePanel: PanelType
  formTitle?: string
  outputTitle?: string
  form: React.ReactNode
  output: React.ReactNode
}

const SplitLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  width: 100%;
  min-height: 100%;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

const SideStretch = styled.div`
  min-height: 0;
  height: 100%;
`

export default function DashboardSplitPage({
  title,
  activePanel,
  formTitle = 'Form',
  outputTitle = 'Output',
  form,
  output
}: DashboardSplitPageProps): React.JSX.Element {
  return (
    <DashboardShell title={title} activePanel={activePanel}>
      <SplitLayout>
        <SideStretch>
          <Win95GroupBox legend={formTitle}>
            <Win95Card padded inset>
              {form}
            </Win95Card>
          </Win95GroupBox>
        </SideStretch>

        <SideStretch>
          <Win95GroupBox legend={outputTitle}>
            <Win95Card padded inset>
              {output}
            </Win95Card>
          </Win95GroupBox>
        </SideStretch>
      </SplitLayout>
    </DashboardShell>
  )
}
