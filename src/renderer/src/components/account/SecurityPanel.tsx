import styled from 'styled-components'
import WinButton from '../Button/WinButton'
import Win95GroupBox from '../Win95/Win95GroupBox'
import Input from '../Input/Input'
import { WinForm, WinFormActions } from '../../components/Win95/Win95Form.style'

const SecurityContent = styled.div`
  width: min(470px, 100%);
  margin: 26px auto 0;
`

const PasswordRow = styled.div`
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  column-gap: 10px;
  align-items: start;
  width: 100%;
`

const PasswordLabel = styled.label`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  line-height: 28px;
  white-space: nowrap;
`

const PasswordField = styled.div`
  min-width: 0;
`

const Message = styled.div<{ $visible: boolean }>`
  min-height: 20px;
  margin-top: 8px;
  color: #8b0000;
  visibility: ${({ $visible }) => ($visible ? 'visible' : 'hidden')};
`

type PasswordFormState = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

type SecurityPanelProps = {
  passwordForm: PasswordFormState
  savingPassword: boolean
  passwordMessage: string
  onChange: (field: keyof PasswordFormState, value: string) => void
  onCancel: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

const SecurityPanel = ({
  passwordForm,
  savingPassword,
  passwordMessage,
  onChange,
  onCancel,
  onSubmit
}: SecurityPanelProps) => {
  return (
    <Win95GroupBox legend="Update Password">
      <SecurityContent>
        <WinForm onSubmit={onSubmit}>
          <PasswordRow>
            <PasswordLabel htmlFor="currentPassword">Current Password</PasswordLabel>
            <PasswordField>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => onChange('currentPassword', e.target.value)}
              />
            </PasswordField>
          </PasswordRow>

          <PasswordRow>
            <PasswordLabel htmlFor="newPassword">New Password</PasswordLabel>
            <PasswordField>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => onChange('newPassword', e.target.value)}
              />
            </PasswordField>
          </PasswordRow>

          <PasswordRow>
            <PasswordLabel htmlFor="confirmPassword">Confirm Password</PasswordLabel>
            <PasswordField>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => onChange('confirmPassword', e.target.value)}
              />
            </PasswordField>
          </PasswordRow>

          <WinFormActions>
            <WinButton type="button" onClick={onCancel} disabled={savingPassword}>
              Cancel
            </WinButton>

            <WinButton type="submit" disabled={savingPassword}>
              {savingPassword ? 'Updating...' : 'Update Password'}
            </WinButton>
          </WinFormActions>

          <Message $visible={!!passwordMessage}>{passwordMessage || ' '}</Message>
        </WinForm>
      </SecurityContent>
    </Win95GroupBox>
  )
}

export default SecurityPanel