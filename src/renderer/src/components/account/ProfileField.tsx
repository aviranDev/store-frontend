import styled from 'styled-components'

const Label = styled.span`
  font-weight: bold;
`

const FieldBox = styled.div`
  min-height: 28px;
  width: 100%;
  max-width: 320px;
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

const FieldInput = styled.input`
  min-height: 28px;
  width: 100%;
  max-width: 320px;
  padding: 4px 6px;
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.inputBg};
  color: ${({ theme }) => theme.colors.text};
  border-top: 2px solid ${({ theme }) => theme.colors.dark};
  border-left: 2px solid ${({ theme }) => theme.colors.dark};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
  font: inherit;
  outline: none;
`

function formatValue(value?: string | null): string {
  return value && value.trim() ? value : '—'
}

type ProfileFieldProps = {
  label: string
  value?: string | null
  isEditing?: boolean
  editable?: boolean
  onChange?: (value: string) => void
}

const ProfileField = ({
  label,
  value,
  isEditing = false,
  editable = false,
  onChange
}: ProfileFieldProps) => {
  return (
    <>
      <Label>{label}</Label>

      {isEditing && editable ? (
        <FieldInput value={value || ''} onChange={(e) => onChange?.(e.target.value)} />
      ) : (
        <FieldBox>{formatValue(value)}</FieldBox>
      )}
    </>
  )
}

export default ProfileField
