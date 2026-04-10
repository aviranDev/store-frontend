import WinButton from '../Button/WinButton'
import { WinFormActions } from '../../components/Win95/Win95Form.style'

type AccountActionsProps = {
  isEditing: boolean
  saving: boolean
  deleting?: boolean
  onEdit: () => void
  onCancel: () => void
  onUpdate: () => void
  onDelete: () => void
}

const AccountActions = ({
  isEditing,
  saving,
  deleting = false,
  onEdit,
  onCancel,
  onUpdate,
  onDelete
}: AccountActionsProps) => {
  return (
    <WinFormActions>
      {!isEditing && (
        <>
          <WinButton type="button" onClick={onEdit} disabled={deleting}>
            Edit
          </WinButton>

          <WinButton type="button" onClick={onDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </WinButton>
        </>
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
    </WinFormActions>
  )
}

export default AccountActions
