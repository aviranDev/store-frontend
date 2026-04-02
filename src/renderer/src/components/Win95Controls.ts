import styled from 'styled-components'
import { raisedBox, sunkenBox } from '../styles/mixins'

export const WinButton = styled.button`
  min-width: 90px;
  padding: 6px 12px;
  background: ${({ theme }) => theme.colors.buttonFace};
  color: ${({ theme }) => theme.colors.text};
  ${raisedBox};
  cursor: pointer;
  border-radius: 0;
  outline: none;
  font-family: inherit;
  font-size: 14px;

  &:active {
    ${sunkenBox};
  }

  &:focus {
    outline: 1px dotted black;
    outline-offset: -4px;
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.shadow};
    cursor: default;
  }
`

export const WinInput = styled.input`
  width: 100%;
  padding: 6px 8px;
  background: ${({ theme }) => theme.colors.inputBg};
  color: ${({ theme }) => theme.colors.text};
  ${sunkenBox};
  border-radius: 0;
  outline: none;
  border: none;
  font-family: inherit;
  font-size: 14px;

  &::placeholder {
    color: ${({ theme }) => theme.colors.shadow};
  }
`

export const WinPanel = styled.div`
  background: ${({ theme }) => theme.colors.face};
  padding: 10px;
  ${sunkenBox};
`
