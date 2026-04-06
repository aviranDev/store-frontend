import { JSX } from 'react'
import { Link } from 'react-router-dom'
import Win95Page from '../components/Win95Page'
import Win95Card from '../components/Win95Card'
import { WinButton } from '../components/Win95Controls'
import styled from 'styled-components'

const Section = styled.div`
  display: grid;
  gap: 12px;
`

const Actions = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`

function CustomerDashboard(): JSX.Element {
  return (
    <Win95Page title="Customer Dashboard" width="700px" maxWidth="95vw">
      <Win95Card inset>
        <Section>
          <h2>Customer Dashboard</h2>
          <p>
            Welcome, Customer. Here you can view your account, orders, and personal information.
          </p>

          <Actions>
            <Link to="/">
              <WinButton type="button">Home</WinButton>
            </Link>
          </Actions>
        </Section>
      </Win95Card>
    </Win95Page>
  )
}

export default CustomerDashboard
