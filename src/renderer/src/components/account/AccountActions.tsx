import styled from 'styled-components'

import WinButton from '../Button/WinButton'

const Actions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: auto;
  padding-top: 24px;
  justify-content: flex-end;
  flex-wrap: wrap;
`

type AccountActionsProps = {
  isEditing: boolean
  saving: boolean
  // onBack: () => void
  onEdit: () => void
  onCancel: () => void
  onUpdate: () => void
}

const AccountActions = ({
  isEditing,
  saving,
  // onBack,
  onEdit,
  onCancel,
  onUpdate
}: AccountActionsProps) => {
  return (
    <Actions>
      {!isEditing && (
        <WinButton type="button" onClick={onEdit}>
          Edit
        </WinButton>
      )}

      {isEditing && (
        <>
          <WinButton type="button" onClick={onCancel} disabled={saving}>
            Cancel
          </WinButton>

          <WinButton type="button" onClick={onUpdate} disabled={saving}>
            {saving ? 'Updating...' : 'Update'}
          </WinButton>
        </>
      )}
    </Actions>
  )
}

export default AccountActions
