import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { WinButton, WinInput } from '../Win95Controls'
import { ErrorMessage, InputContainer, InputRow } from './inputStyles'

type InputProps = {
  type?: string
  name?: string
  value?: string
  placeholder?: string
  errorMessage?: string | null
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  onBlur?: (event: ChangeEvent<HTMLInputElement>) => void
}

const Input = ({
  type = 'text',
  name,
  value = '',
  onChange,
  onBlur,
  placeholder,
  errorMessage
}: InputProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const isPasswordType = type === 'password'

  const handleTogglePasswordVisibility = (): void => {
    setIsPasswordVisible((prev) => !prev)
  }

  return (
    <InputContainer>
      <InputRow>
        <WinInput
          type={isPasswordType ? (isPasswordVisible ? 'text' : 'password') : type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
        />

        {isPasswordType && (
          <WinButton
            type="button"
            onClick={handleTogglePasswordVisibility}
            style={{ minWidth: '52px', height: '26px', padding: '0 8px' }}
          >
            {isPasswordVisible ? 'Hide' : 'View'}
          </WinButton>
        )}
      </InputRow>

      <ErrorMessage $hasError={!!errorMessage}>{errorMessage}</ErrorMessage>
    </InputContainer>
  )
}

export default Input
