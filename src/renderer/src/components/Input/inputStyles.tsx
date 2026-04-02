import styled from 'styled-components'

export const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

export const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

export const ErrorMessage = styled.div<{ $hasError: boolean }>`
  min-height: 14px;
  line-height: 14px;
  font-size: 11px;
  color: #800000;
  visibility: ${({ $hasError }) => ($hasError ? 'visible' : 'hidden')};
  margin-top: 1px;
`
