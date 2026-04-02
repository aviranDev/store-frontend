import styled from 'styled-components'

export const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

export const ErrorMessage = styled.div<{ $hasError: boolean }>`
  min-height: 18px;
  font-size: 12px;
  color: #a80000;
  visibility: ${({ $hasError }) => ($hasError ? 'visible' : 'hidden')};
`
