import styled from 'styled-components'
import AccountActions from './AccountActions'
import Win95GroupBox from '../Win95/Win95GroupBox'
import { WinInput } from '../Input/inputStyles'
import { UserProfileInterface } from '../../types/user.type'
import {
  WinForm,
  WinFormRow,
  WinFormLabel,
  WinFormField
} from '../../components/Win95/Win95Form.style'

const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
`

const StatusText = styled.p`
  margin: 0;
`

const ErrorText = styled.p`
  margin: 0;
  color: #8b0000;
  font-weight: bold;
`

const DisplayInput = styled(WinInput).attrs({
  readOnly: true
})`
  cursor: default;
`

type AccountValueFieldProps = {
  value?: string | null
  isEditing?: boolean
  editable?: boolean
  onChange?: (value: string) => void
}

const AccountValueField = ({
  value,
  isEditing = false,
  editable = false,
  onChange
}: AccountValueFieldProps) => {
  const resolvedValue = value && value.trim() ? value : '—'

  if (isEditing && editable) {
    return <WinInput value={value || ''} onChange={(e) => onChange?.(e.target.value)} />
  }

  return <DisplayInput value={resolvedValue} />
}

type AccountDetailsPanelProps = {
  formData: UserProfileInterface | null
  loading: boolean
  error: string
  isEditing: boolean
  saving: boolean
  onChange: (field: keyof UserProfileInterface, value: string) => void
  onEdit: () => void
  onCancel: () => void
  onUpdate: () => void
  onDelete: () => void
}

const AccountDetailsPanel = ({
  formData,
  loading,
  error,
  isEditing,
  saving,
  onChange,
  onEdit,
  onCancel,
  onUpdate,
  onDelete
}: AccountDetailsPanelProps) => {
  return (
    <Win95GroupBox legend="Account Details">
      <Content>
        {loading && <StatusText>Loading account details...</StatusText>}
        {!loading && error && <ErrorText>{error}</ErrorText>}

        {!loading && !error && formData && (
          <>
            <WinForm as="div">
              <WinFormRow>
                <WinFormLabel>Username</WinFormLabel>
                <WinFormField>
                  <AccountValueField
                    value={formData.username}
                    isEditing={isEditing}
                    editable
                    onChange={(value) => onChange('username', value)}
                  />
                </WinFormField>
              </WinFormRow>

              <WinFormRow>
                <WinFormLabel>Email</WinFormLabel>
                <WinFormField>
                  <AccountValueField
                    value={formData.email}
                    isEditing={isEditing}
                    editable
                    onChange={(value) => onChange('email', value)}
                  />
                </WinFormField>
              </WinFormRow>

              <WinFormRow>
                <WinFormLabel>Role</WinFormLabel>
                <WinFormField>
                  <AccountValueField value={formData.role} />
                </WinFormField>
              </WinFormRow>
            </WinForm>

            <AccountActions
              isEditing={isEditing}
              saving={saving}
              onEdit={onEdit}
              onCancel={onCancel}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          </>
        )}
      </Content>
    </Win95GroupBox>
  )
}

export default AccountDetailsPanel
