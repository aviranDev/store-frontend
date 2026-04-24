import styled from 'styled-components'
import AccountActions from './AccountActions'
import Win95GroupBox from '../Win95/Win95GroupBox'
import { WinInput } from '../Input/inputStyles'
import { UserProfileInterface } from '../../types/user.type'
import { WinForm } from '../../components/Win95/Win95Form.style'

const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  min-width: 0;
  min-height: 0;
`

const FormCenter = styled.div`
  width: min(430px, 100%);
  margin: 26px auto 0;
`

const AccountRow = styled.div`
  display: grid;
  grid-template-columns: 90px minmax(0, 1fr);
  column-gap: 10px;
  align-items: center;
  width: 100%;
`

const AccountLabel = styled.label`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
`

const AccountField = styled.div`
  min-width: 0;
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
          <FormCenter>
            <WinForm as="div">
              <AccountRow>
                <AccountLabel>Username</AccountLabel>
                <AccountField>
                  <AccountValueField
                    value={formData.username}
                    isEditing={isEditing}
                    editable
                    onChange={(value) => onChange('username', value)}
                  />
                </AccountField>
              </AccountRow>

              <AccountRow>
                <AccountLabel>Email</AccountLabel>
                <AccountField>
                  <AccountValueField
                    value={formData.email}
                    isEditing={isEditing}
                    editable
                    onChange={(value) => onChange('email', value)}
                  />
                </AccountField>
              </AccountRow>

              <AccountRow>
                <AccountLabel>Role</AccountLabel>
                <AccountField>
                  <AccountValueField value={formData.role} />
                </AccountField>
              </AccountRow>
            </WinForm>

            <AccountActions
              isEditing={isEditing}
              saving={saving}
              onEdit={onEdit}
              onCancel={onCancel}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          </FormCenter>
        )}
      </Content>
    </Win95GroupBox>
  )
}

export default AccountDetailsPanel