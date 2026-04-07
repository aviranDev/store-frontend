import styled from 'styled-components'

import AccountActions from './AccountActions'
import ProfileField from './ProfileField'
import Win95GroupBox from '../Win95/Win95GroupBox'

import { UserProfileInterface } from '../../types/user.type'

const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: space-between;
  flex: 1;
`

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 140px minmax(220px, 320px);
  gap: 8px 12px;
  align-items: center;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`

const StatusText = styled.p`
  margin: 0;
`

const ErrorText = styled.p`
  margin: 0;
  color: #8b0000;
  font-weight: bold;
`

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
}

const AccountDetailsPanel = ({
  formData,
  loading,
  error,
  isEditing,
  saving,
  onChange,
  // onBack,
  onEdit,
  onCancel,
  onUpdate
}: AccountDetailsPanelProps) => {
  return (
    <Win95GroupBox legend="Account Details">
      <Content>
        {loading && <StatusText>Loading account details...</StatusText>}
        {!loading && error && <ErrorText>{error}</ErrorText>}

        {!loading && !error && formData && (
          <>
            <ProfileGrid>
              <ProfileField
                label="Username"
                value={formData.username}
                isEditing={isEditing}
                editable
                onChange={(value) => onChange('username', value)}
              />

              <ProfileField
                label="Email"
                value={formData.email}
                isEditing={isEditing}
                editable
                onChange={(value) => onChange('email', value)}
              />

              <ProfileField label="Role" value={formData.role} />

              {formData.role === 'customer' && (
                <>
                  <ProfileField
                    label="Customer Number"
                    value={formData.customerNumber}
                    isEditing={isEditing}
                    editable
                    onChange={(value) => onChange('customerNumber', value)}
                  />

                  <ProfileField
                    label="Company Name"
                    value={formData.companyName}
                    isEditing={isEditing}
                    editable
                    onChange={(value) => onChange('companyName', value)}
                  />
                </>
              )}
            </ProfileGrid>

            <AccountActions
              isEditing={isEditing}
              saving={saving}
              onEdit={onEdit}
              onCancel={onCancel}
              onUpdate={onUpdate}
            />
          </>
        )}
      </Content>
    </Win95GroupBox>
  )
}

export default AccountDetailsPanel
