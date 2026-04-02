import styled from 'styled-components'
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

export default function Home() {
  const { logout, getProfile } = useLogin()

  const handleGetProfile = async (): Promise<void> => {
    try {
      const userProfile = await getProfile()
      console.log('Profile:', userProfile)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  return (
    <Win95Page title="Home" width="92vw" maxWidth="1400px" height="88vh" maxHeight="88vh">
      <Title id="home-title">Home</Title>
      <WinButton onClick={handleGetProfile}>click</WinButton>

      <Actions>
        <Button onClick={() => alert('Get Started action')}>Get Started</Button>
        <GhostButton onClick={() => alert('Take a tour')}>Take a Tour</GhostButton>
      </Actions>

      <Section aria-labelledby="quick-actions-title">
        <SectionTitle id="quick-actions-title">Quick actions</SectionTitle>
        <FeatureGrid>
          <Card
            role="button"
            tabIndex={0}
            onClick={() => alert('Create new item')}
            aria-label="Create new item"
          >
            <CardTitle>➕ New</CardTitle>
            <CardText>Create a new project, task, or record.</CardText>
          </Card>
          <Card
            role="button"
            tabIndex={0}
            onClick={() => alert('Open reports')}
            aria-label="Open reports"
          >
            <CardTitle>📊 Reports</CardTitle>
            <CardText>View analytics and performance at a glance.</CardText>
          </Card>
          <Card
            role="button"
            tabIndex={0}
            onClick={() => alert('Open inbox')}
            aria-label="Open inbox"
          >
            <CardTitle>📥 Inbox</CardTitle>
            <CardText>Review the latest updates and notifications.</CardText>
          </Card>
          <Card
            role="button"
            tabIndex={0}
            onClick={() => alert('Open settings')}
            aria-label="Open settings"
          >
            <CardTitle>⚙️ Settings</CardTitle>
            <CardText>Personalize preferences and workspace options.</CardText>
          </Card>
        </FeatureGrid>
      </Section>

      <Section aria-labelledby="shortcuts-title">
        <SectionTitle id="shortcuts-title">Shortcuts</SectionTitle>
        <FeatureGrid>
          <Card
            as="a"
            href="#"
            onClick={(e) => e.preventDefault()}
            aria-label="Go to documentation"
          >
            <CardTitle>📚 Documentation</CardTitle>
            <CardText>Read how-tos, API notes, and guides.</CardText>
          </Card>
          <Card as="a" href="#" onClick={(e) => e.preventDefault()} aria-label="Go to templates">
            <CardTitle>🧩 Templates</CardTitle>
            <CardText>Start faster with ready-made layouts.</CardText>
          </Card>
          <Card as="a" href="#" onClick={(e) => e.preventDefault()} aria-label="Go to support">
            <CardTitle>💬 Support</CardTitle>
            <CardText>Get help or talk to the team.</CardText>
          </Card>
        </FeatureGrid>
        <Hint>Tip: these buttons are placeholders—wire them to your routes or handlers.</Hint>
      </Section>
      <WinButton onClick={logout}>Logout</WinButton>
    </Win95Page>
  )
}
