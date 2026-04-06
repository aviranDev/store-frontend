import { useState } from 'react'
import { ErrorMessage, InputContainer, InputRow, WinInput, TogglePassword } from './inputStyles'
import InputProps from './input.type'

const Input = ({ type = 'text', errorMessage, ...props }: InputProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const isPasswordType = type === 'password'
  const resolvedType = isPasswordType && isPasswordVisible ? 'text' : type

  const handleTogglePassword = (): void => {
    setIsPasswordVisible((prev) => !prev)
  }

  return (
    <InputContainer>
      <InputRow>
        <WinInput type={resolvedType} {...props} />

        {isPasswordType && (
          <TogglePassword type="button" onClick={handleTogglePassword}>
            {isPasswordVisible ? 'Hide' : 'View'}
          </TogglePassword>
        )}
      </InputRow>

      <ErrorMessage $hasError={!!errorMessage}>{errorMessage}</ErrorMessage>
    </InputContainer>
  )
}

export default Input
