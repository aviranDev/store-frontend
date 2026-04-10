import styled from 'styled-components'
import WinButton from '../Button/WinButton'
import Win95GroupBox from '../Win95/Win95GroupBox'
import Input from '../Input/Input'
import {
  WinForm,
  WinFormField,
  WinFormLabel,
  WinFormActions,
  WinFormRow
} from '../../components/Win95/Win95Form.style'

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
      <WinForm onSubmit={onSubmit}>
        <WinFormRow>
          <WinFormLabel htmlFor="currentPassword">Current Password</WinFormLabel>
          <WinFormField>
            <Input
              id="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => onChange('currentPassword', e.target.value)}
            />
          </WinFormField>
        </WinFormRow>

        <WinFormRow>
          <WinFormLabel htmlFor="newPassword">New Password</WinFormLabel>
          <WinFormField>
            <Input
              id="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => onChange('newPassword', e.target.value)}
            />
          </WinFormField>
        </WinFormRow>

        <WinFormRow>
          <WinFormLabel htmlFor="confirmPassword">Confirm Password</WinFormLabel>
          <WinFormField>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => onChange('confirmPassword', e.target.value)}
            />
          </WinFormField>
        </WinFormRow>

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
    </Win95GroupBox>
  )
}

export default SecurityPanel
