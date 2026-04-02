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
    outline: 1px dotted ${({ theme }) => theme.colors.text};
    outline-offset: -4px;
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.shadow};
    cursor: default;
  }
`

export const WinInput = styled.input`
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

export const WinPanel = styled.div`
  background: ${({ theme }) => theme.colors.face};
  padding: 10px;
  ${sunkenBox};
`
