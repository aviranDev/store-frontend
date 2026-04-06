import styled from 'styled-components'
import { WinButton } from '../Button/WinButton.style'

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
export const WinInput = styled.input`
  flex: 1;
  min-width: 0;
  width: 100%;
  padding: 5px 8px;
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.inputBg};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 0;
  outline: none;
  border-top: 2px solid ${({ theme }) => theme.colors.shadow};
  border-left: 2px solid ${({ theme }) => theme.colors.shadow};
  border-right: 2px solid ${({ theme }) => theme.colors.light};
  border-bottom: 2px solid ${({ theme }) => theme.colors.light};
  box-shadow: inset 1px 1px 0 ${({ theme }) => theme.colors.black};
  font-family: inherit;
  font-size: 14px;
  line-height: 1;

  &::placeholder {
    color: ${({ theme }) => theme.colors.shadow};
  }

  &:focus {
    outline: 1px dotted ${({ theme }) => theme.colors.text};
    outline-offset: -4px;
  }
`
export const TogglePassword = styled(WinButton)`
  min-width: 52px;
  height: 26px;
  padding: 0 8px;
  flex-shrink: 0;
`
