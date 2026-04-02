import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { WinButton, WinInput } from '../Win95Controls'
import { ErrorMessage, InputContainer, InputRow } from './inputStyles'

type InputProps = {
  type?: string
  name?: string
  value?: string
  placeholder?: string
  errorMessage?: string
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
}

const Input = ({
  type = 'text',
  name,
  value = '',
  onChange,
  placeholder,
  errorMessage
}: InputProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const isPasswordType = type === 'password'

  const handleMouseDown = (): void => {
    setIsPasswordVisible(true)
  }

  const handleMouseUp = (): void => {
    setIsPasswordVisible(false)
  }

  const handleMouseLeave = (): void => {
    setIsPasswordVisible(false)
  }

  return (
    <InputContainer>
      <InputRow>
        <WinInput
          type={isPasswordType ? (isPasswordVisible ? 'text' : 'password') : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />

        {isPasswordType && (
          <WinButton
            type="button"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{ minWidth: '56px', padding: '6px 8px' }}
          >
            View
          </WinButton>
        )}
      </InputRow>

      <ErrorMessage $hasError={!!errorMessage}>{errorMessage}</ErrorMessage>
    </InputContainer>
  )
}

export default Input
