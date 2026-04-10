import styled from 'styled-components'
import Input from '../Input/Input'

const FieldBox = styled.div`
  min-height: 28px;
  width: 100%;
  padding: 4px 6px;
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.inputBg};
  color: ${({ theme }) => theme.colors.text};
  border-top: 2px solid ${({ theme }) => theme.colors.dark};
  border-left: 2px solid ${({ theme }) => theme.colors.dark};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
  display: flex;
  align-items: center;
`

function formatValue(value?: string | null): string {
  return value && value.trim() ? value : '—'
}

type ProfileFieldProps = {
  value?: string | null
  isEditing?: boolean
  editable?: boolean
  onChange?: (value: string) => void
}

const ProfileField = ({
  value,
  isEditing = false,
  editable = false,
  onChange
}: ProfileFieldProps) => {
  if (isEditing && editable) {
    return <Input value={value || ''} onChange={(e) => onChange?.(e.target.value)} />
  }

  return <FieldBox>{formatValue(value)}</FieldBox>
}

export default ProfileField
