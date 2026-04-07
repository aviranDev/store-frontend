import styled from 'styled-components'

export const WinForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`

export const WinFormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
`

export const WinFormRow = styled.div`
  display: grid;
  grid-template-columns: 70px 260px;
  column-gap: 6px;
  align-items: start;
  justify-content: center;
  width: fit-content;
  margin: 0 auto;
`

export const WinFormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

export const WinFormLabel = styled.label`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  height: 26px;
`

export const WinFormActions = styled.div`
  display: flex;
  gap: 6px;
  justify-content: center;
  margin-top: 8px;
  padding-top: 8px;
`
export const MessageArea = styled.p<{ $visible: boolean }>`
  min-height: 18px;
  margin: 6px auto 0;
  font-size: 12px;
  line-height: 18px;
  color: ${({ theme }) => theme.colors.text};
  visibility: ${({ $visible }) => ($visible ? 'visible' : 'hidden')};
  text-align: center;
`
