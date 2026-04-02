import styled from 'styled-components'

export const WinForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const WinFormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const WinFormRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 6px;
  }
`

export const WinFormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
`

export const WinFormLabel = styled.label`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 2px;
`

export const WinFormActions = styled.div`
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  margin-top: 6px;
  padding-top: 8px;
`
export const MessageArea = styled.p<{ $visible: boolean }>`
  min-height: 18px;
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 18px;
  color: ${({ theme }) => theme.colors.text};
  visibility: ${({ $visible }) => ($visible ? 'visible' : 'hidden')};
`
