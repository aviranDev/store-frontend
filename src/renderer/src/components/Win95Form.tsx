import styled from 'styled-components'

export const WinForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const WinFormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

export const WinFormRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 8px;
  }
`

export const WinFormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`

export const WinFormLabel = styled.label`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`

export const WinFormActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 4px;
`
