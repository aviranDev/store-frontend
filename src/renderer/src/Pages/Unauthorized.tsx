import { JSX } from 'react'
import { Link } from 'react-router-dom'
import Win95Page from '../components/Win95/Win95Page'
import Win95Card from '../components/Win95/Win95Card'
import WinButton from '../components/Button/WinButton'
import styled from 'styled-components'

const Section = styled.div`
  display: grid;
  gap: 12px;
`

const Message = styled.p`
  margin: 0;
`

function Unauthorized(): JSX.Element {
  return (
    <Win95Page title="Unauthorized">
      <Win95Card inset>
        <Section>
          <h2>Access Denied</h2>
          <Message>You do not have permission to access this page.</Message>

          <Link to="/">
            <WinButton type="button">Go Back</WinButton>
          </Link>
        </Section>
      </Win95Card>
    </Win95Page>
  )
}

export default Unauthorized
