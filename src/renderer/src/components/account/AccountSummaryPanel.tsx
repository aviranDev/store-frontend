import styled from 'styled-components'

import WinButton from '../Button/WinButton'
import Win95GroupBox from '../Win95/Win95GroupBox'
import Win95InfoPair from '../Win95/Win95InfoPair'

type AccountSummaryPanelProps = {
  username?: string | null
  role?: string | null
  email?: string | null
  status?: string
  onSecurityClick?: () => void
  onPreferencesClick?: () => void
}

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 18px;
`

function formatValue(value?: string | null): string {
  return value && value.trim() ? value : '—'
}

const AccountSummaryPanel = ({
  username,
  role,
  email,
  status = '—',
  onSecurityClick,
  onPreferencesClick
}: AccountSummaryPanelProps) => {
  return (
    <Win95GroupBox legend="Account Summary">
      <Win95InfoPair label="Status" value={status} />
      <Win95InfoPair label="Username" value={formatValue(username)} />
      <Win95InfoPair label="Role" value={formatValue(role)} />
      <Win95InfoPair label="Email" value={formatValue(email)} />

      <Actions>
        <WinButton type="button" onClick={onSecurityClick}>
          Security
        </WinButton>

        <WinButton type="button" onClick={onPreferencesClick}>
          Preferences
        </WinButton>
      </Actions>
    </Win95GroupBox>
  )
}

export default AccountSummaryPanel
