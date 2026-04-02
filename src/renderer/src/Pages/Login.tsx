import { useState, useRef, useCallback, JSX } from 'react'
import { useLogin } from '../Store/LoginProvider'
import { Auth } from '../Services/user'
import validate from '../utils/validateFiled'
import Input from '../components/Input/Input'
import { AxiosError } from 'axios' // Import AxiosError
import Win95Page from '../components/Win95Page'
import { WinButton } from '../components/Win95Controls'
import {
  WinForm,
  WinFormField,
  WinFormLabel,
  WinFormActions,
  MessageArea
} from '../components/Win95Form'
import Win95Card from '../components/Win95Card'

import keyIcon from '../assets/keys-5.png'
import styled from 'styled-components'

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-weight: bold;
`

const Icon = styled.img`
  width: 20px;
  height: 20px;
  image-rendering: pixelated;
  flex-shrink: 0;
  display: block;
`

function LoginHeader() {
  return (
    <HeaderRow>
      <Icon src={keyIcon} alt="" />
      <span>Please log in to your account</span>
    </HeaderRow>
  )
}

type InputChangeEvent = React.ChangeEvent<HTMLInputElement>

const initialState: Auth = {
  email: '',
  password: ''
}

const Login = (): JSX.Element => {
  const { login } = useLogin()
  const [values, setValues] = useState<Auth>(initialState)

  const [errors, setErrors] = useState<Auth>(initialState)
  const [loading, setLoading] = useState(false)
  const [apiMessage, setApiMessage] = useState<{ message: string; fulfill: boolean }>({
    message: '',
    fulfill: false
  })

  const lengths = useRef<{ [key in keyof Auth]: number }>({
    email: 24,
    password: 9
  })

  const MIN_LOADING_DURATION = 2000 // Minimum delay of 1 second

  const handleError = (error: unknown): void => {
    if (error instanceof AxiosError) {
      setApiMessage({
        message: error.response?.data?.error.message || 'An unknown error occurred',
        fulfill: false
      })
    } else if (error instanceof Error) {
      setApiMessage({ message: error.message, fulfill: false })
    } else {
      setApiMessage({ message: 'An unknown error occurred', fulfill: false })
    }
  }

  const handleChange = useCallback((e: InputChangeEvent): void => {
    const { name, value } = e.target
    const fieldName = name as keyof Auth

    setValues((prevValues) => ({
      ...prevValues,
      [fieldName]: value
    }))

    setErrors((prev) => ({
      ...prev,
      [fieldName]: validate(fieldName, value, lengths.current[fieldName]) ?? ''
    }))
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    const newErrors: Auth = {
      email: validate('email', values.email, lengths.current.email) ?? '',
      password: validate('password', values.password, lengths.current.password) ?? ''
    }

    setErrors(newErrors)

    const hasErrors = Object.values(newErrors).some(Boolean)
    if (hasErrors) return

    // If there are validation errors, exit submit
    if (hasErrors) return

    setLoading(true) // Start loading state
    const start = Date.now() // Track start time for minimum delay

    try {
      const response = await login(values)
      setApiMessage({ message: response.message, fulfill: true })
    } catch (error) {
      handleError(error) // Use centralized error handler
    } finally {
      const duration = Date.now() - start
      const remainingTime = Math.max(MIN_LOADING_DURATION - duration, 0)
      setTimeout(() => setLoading(false), remainingTime) // Ensure minimum loading duration
    }
  }

  return (
    <Win95Page title="Login" width="470px" maxWidth="92vw">
      <Win95Card inset>
        <LoginHeader />

        <WinForm onSubmit={handleSubmit}>
          <WinFormField>
            <WinFormLabel>Email</WinFormLabel>
            <Input
              type="text"
              name="email"
              value={values.email}
              onChange={handleChange}
              errorMessage={errors.email}
            />
          </WinFormField>
          <WinFormField>
            <WinFormLabel>Password</WinFormLabel>
            <Input
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              errorMessage={errors.password}
            />
          </WinFormField>
          <WinFormActions>
            <WinButton type="button" disabled={loading}>
              Register
            </WinButton>
            <WinButton type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Submit'}
            </WinButton>
          </WinFormActions>

          <MessageArea $visible={!!apiMessage}>{apiMessage.message || '\u00A0'}</MessageArea>
        </WinForm>
      </Win95Card>
    </Win95Page>
  )
}

export default Login
