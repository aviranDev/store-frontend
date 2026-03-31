import { ButtonHTMLAttributes } from 'react'
import styled from 'styled-components'

// Define types for the Button props
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  $variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' // Add more variants as needed
  width?: string
}

// Define styles for the Button component using styled-components
export const StyledButton = styled.button<ButtonProps>`
  /* Common styles for 90s button */
  padding: 10px 20px;
  border: 2px solid #000;
  background-color: ${(props): string =>
    props.$variant === 'primary' ? '#d4d0c8' : '#e0e0e0'}; /* 90s Windows gray palette */
  color: #000;
  font-family: 'Tahoma', sans-serif;
  font-size: 14px;
  cursor: pointer;
  width: ${(props): string => (props.width ? props.width : 'auto')};
  text-align: center;
  box-shadow:
    inset -2px -2px 0px #fff,
    /* Highlight effect */ inset 2px 2px 0px #a0a0a0,
    /* Inner shadow for 3D effect */ 3px 3px 0px #000; /* Outer shadow for beveled effect */
  user-select: none;
  transition: all 0.2s ease;

  /* Hover effect */
  &:hover {
    background-color: #c0c0c0;
    box-shadow:
      inset -2px -2px 0px #e0e0e0,
      inset 2px 2px 0px #808080,
      3px 3px 0px #000;
  }

  /* Active (pressed) state */
  &:active {
    box-shadow:
      inset 2px 2px 0px #fff,
      /* Reversed inner shadow */ inset -2px -2px 0px #a0a0a0,
      2px 2px 0px #000; /* Reduced outer shadow for pressed effect */
    background-color: #a0a0a0;
  }

  /* Variants */
  ${(props): string =>
    props.$variant === 'secondary'
      ? `
    background-color: #e8e8e8;
    border-color: #808080;
  `
      : ''}
  ${(props): string =>
    props.$variant === 'success'
      ? `
    background-color: #90ee90; /* Light green */
    border-color: #006400; /* Dark green */
  `
      : ''}
  ${(props): string =>
    props.$variant === 'danger'
      ? `
    background-color: #ff7f7f; /* Light red */
    border-color: #8b0000; /* Dark red */
  `
      : ''}
  ${(props): string =>
    props.$variant === 'warning'
      ? `
    background-color: #ffeb3b; /* Yellow */
    border-color: #f57c00; /* Orange */
  `
      : ''}
  ${(props): string =>
    props.$variant === 'info'
      ? `
    background-color: #87ceeb; /* Light blue */
    border-color: #4682b4; /* Steel blue */
  `
      : ''}
`

export default StyledButton
