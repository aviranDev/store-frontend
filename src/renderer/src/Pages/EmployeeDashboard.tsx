import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../Store/LoginProvider'
import Win95Page from '../components/Win95Page'
import { WinButton } from '../components/Win95Controls'
import { Title } from '../components/Win95Window'

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`

const Button = styled.button`
  appearance: none;
  border: 1px solid var(--border-color, #e5e7eb);
  background: var(--button-background, #111827);
  color: var(--accent-color, #ffffff);
  font-weight: 600;
  font-size: 14px;
  padding: 10px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition:
    transform 120ms ease,
    box-shadow 120ms ease,
    background 120ms ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }
  &:focus-visible {
    outline: 2px solid var(--primary-color, #3b82f6);
    outline-offset: 2px;
  }
`

const GhostButton = styled(Button)`
  background: transparent;
  color: var(--text-color, #111);
`

const Section = styled.section`
  display: grid;
  gap: 16px;
`

const SectionTitle = styled.h2`
  font-size: clamp(18px, 2.8vw, 22px);
  margin: 0;
  color: var(--heading-color, #1f2937);
`

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
`

const Card = styled.article`
  background: var(--card-background, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  display: grid;
  gap: 6px;
  transition:
    transform 120ms ease,
    box-shadow 120ms ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
`

const CardTitle = styled.h3`
  font-size: 16px;
  margin: 0;
`

const CardText = styled.p`
  font-size: 14px;
  color: var(--secondary-color, #6b7280);
  margin: 0;
`

const Hint = styled.p`
  margin: 0;
  font-size: 13px;
  color: var(--secondary-color, #6b7280);
`

export default function EmployeeDashboard() {
  const navigate = useNavigate()
  const { logout } = useLogin()

  return (
    <Win95Page
      title="Employee Dashboard"
      width="92vw"
      maxWidth="1400px"
      height="88vh"
      maxHeight="88vh"
    >
      <Title id="employee-dashboard-title">Employee Dashboard</Title>

      <Actions>
        <Button onClick={() => navigate('/customer')}>Customer Area</Button>
        <GhostButton onClick={() => navigate('/')}>Main Route</GhostButton>
      </Actions>

      <Section aria-labelledby="employee-actions-title">
        <SectionTitle id="employee-actions-title">Employee actions</SectionTitle>
        <FeatureGrid>
          <Card role="button" tabIndex={0} onClick={() => alert('Open assigned tasks')}>
            <CardTitle>📋 Tasks</CardTitle>
            <CardText>Review assigned work and follow your current tasks.</CardText>
          </Card>
          <Card role="button" tabIndex={0} onClick={() => alert('Open internal tools')}>
            <CardTitle>🛠️ Tools</CardTitle>
            <CardText>Access internal tools and employee workflows.</CardText>
          </Card>
          <Card role="button" tabIndex={0} onClick={() => alert('Open schedule')}>
            <CardTitle>📅 Schedule</CardTitle>
            <CardText>View your day, deadlines, and work planning.</CardText>
          </Card>
          <Card role="button" tabIndex={0} onClick={() => alert('Open updates')}>
            <CardTitle>📨 Updates</CardTitle>
            <CardText>Check recent updates and internal communication.</CardText>
          </Card>
        </FeatureGrid>
      </Section>

      <Section aria-labelledby="employee-shortcuts-title">
        <SectionTitle id="employee-shortcuts-title">Shortcuts</SectionTitle>
        <FeatureGrid>
          <Card role="button" tabIndex={0} onClick={() => navigate('/customer')}>
            <CardTitle>🧾 Customer</CardTitle>
            <CardText>Open the customer workspace quickly.</CardText>
          </Card>
        </FeatureGrid>
        <Hint>Tip: wire these cards to your real employee features later.</Hint>
      </Section>

      <WinButton onClick={logout}>Logout</WinButton>
    </Win95Page>
  )
}
