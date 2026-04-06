import styled, { css } from 'styled-components'
import { raisedBox, sunkenBox } from '../../styles/mixins'
import type { WinButtonProps } from './WinButton.type'

const sizeStyles = {
  default: css`
    min-width: 90px;
    padding: 6px 12px;
    font-size: 14px;
  `,
  small: css`
    min-width: 52px;
    padding: 4px 8px;
    font-size: 13px;
  `,
  icon: css`
    min-width: 28px;
    width: 28px;
    height: 28px;
    padding: 0;
    font-size: 12px;
  `
}

export const WinButton = styled.button<WinButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  box-sizing: border-box;
  border: none;
  border-radius: 0;
  outline: none;
  line-height: 1;
  font-family: inherit;
  background: ${({ theme }) => theme.colors.buttonFace};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;

  ${({ $size = 'default' }) => sizeStyles[$size]}
  ${({ $fullWidth }) => $fullWidth && 'width: 100%;'}

  ${raisedBox};

  &:active:not(:disabled) {
    ${sunkenBox};
  }

  &:focus-visible {
    outline: 1px dotted ${({ theme }) => theme.colors.text};
    outline-offset: -4px;
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.shadow};
    cursor: default;
  }
`
