import styled from 'styled-components'
import { IconType } from 'react-icons'

export interface InputProps {
  type: string
  name: string
  value?: string
  label?: string
  validText?: string
  icon?: IconType
  placeholder?: string
  errorMessage?: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

interface ErrorMessageProps {
  $hasError: boolean
}

export const ErrorMessage = styled.p<ErrorMessageProps>`
  color: #e01010; /* Retro red for errors */
  margin: 0;
  padding-left: 2.7rem;
  font-size: 12px;
  font-family: 'Tahoma', sans-serif;
  height: 1.5rem; /* Reserve space for the error message */
  visibility: ${({ $hasError }): string =>
    $hasError ? 'visible' : 'hidden'}; /* Show or hide error */
`

export const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 2px; /* Reduced gap for retro compactness */
`

export const InputRow = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  border: 2px solid #000; /* Bold black border for container */
  background-color: #c0c0c0; /* Light gray 90's background */
  box-shadow:
    inset -2px -2px 0px #fff,
    inset 2px 2px 0px #808080; /* Beveled edges */
`

export const IconWrapper = styled.div`
  display: flex;
  background-color: #a0a0a0; /* Darker gray for the icon area */
  padding: 8px;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #808080; /* Divider between icon and input */
`

export const StyledInput = styled.input`
  flex-grow: 1;
  font-size: 14px;
  font-family: 'Tahoma', sans-serif;
  background-color: #e0e0e0; /* Lighter gray for the input field */
  padding: 8px;
  outline: none;
  box-sizing: border-box;
  border: none;
  color: #000; /* Black text */

  &::placeholder {
    color: #606060; /* Subtle gray placeholder */
    font-style: italic;
  }

  &:focus {
    outline: none;
    background-color: #d0d0d0; /* Slightly darker on focus */
  }
`

export const TogglePasswordIcon = styled.div`
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px; /* Classic square size */
  background-color: #d0d0d0; /* Light gray */
  border: 2px solid #808080; /* Border to match the retro style */
  box-shadow:
    inset -1px -1px 0px #fff,
    inset 1px 1px 0px #404040; /* Beveled effect */
  cursor: pointer;
  color: #000; /* Icon color */
  font-size: 14px; /* Adjust icon size */

  &:active {
    box-shadow:
      inset 1px 1px 0px #fff,
      inset -1px -1px 0px #404040; /* Invert bevel on press */
    background-color: #c0c0c0; /* Slightly darker background */
  }
`
