import { useState, useRef, useCallback, JSX } from 'react'
import { useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import styled from 'styled-components'

import Input from '../components/Input/Input'
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
import validate from '../utils/validateFiled'

// import { register } from '../Services/user'

import keyIcon from '../assets/keys-5.png'

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

function RegisterHeader() {
  return (
    <HeaderRow>
      <Icon src={keyIcon} alt="" />
      <span>Create your account</span>
    </HeaderRow>
  )
}

type RegisterData = {
  username: string
  email: string
  password: string
}

type InputChangeEvent = React.ChangeEvent<HTMLInputElement>

const initialState: RegisterData = {
  username: '',
  email: '',
  password: ''
}

const Register = (): JSX.Element => {
  const navigate = useNavigate()

  const [values, setValues] = useState<RegisterData>(initialState)
  const [errors, setErrors] = useState<RegisterData>(initialState)
  const [loading, setLoading] = useState(false)
  const [apiMessage, setApiMessage] = useState<{ message: string; fulfill: boolean }>({
    message: '',
    fulfill: false
  })

  const lengths = useRef<{ [key in keyof RegisterData]: number }>({
    username: 3,
    email: 24,
    password: 9
  })

  const MIN_LOADING_DURATION = 2000

  const handleError = (error: unknown): void => {
    if (error instanceof AxiosError) {
      setApiMessage({
        message: error.response?.data?.error?.message || 'An unknown error occurred',
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
    const fieldName = name as keyof RegisterData

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

    const newErrors: RegisterData = {
      username: validate('username', values.username, lengths.current.username) ?? '',
      email: validate('email', values.email, lengths.current.email) ?? '',
      password: validate('password', values.password, lengths.current.password) ?? ''
    }

    setErrors(newErrors)

    const hasErrors = Object.values(newErrors).some(Boolean)
    if (hasErrors) return

    setLoading(true)
    const start = Date.now()

    try {
      // const response = await register(values)
      // setApiMessage({ message: response.message, fulfill: true })

      setApiMessage({ message: 'Registration completed successfully', fulfill: true })
      setValues(initialState)
    } catch (error) {
      handleError(error)
    } finally {
      const duration = Date.now() - start
      const remainingTime = Math.max(MIN_LOADING_DURATION - duration, 0)
      setTimeout(() => setLoading(false), remainingTime)
    }
  }

  return (
    <Win95Page title="Register" width="470px" maxWidth="92vw">
      <Win95Card inset>
        <RegisterHeader />

        <WinForm onSubmit={handleSubmit}>
          <WinFormField>
            <WinFormLabel>Username</WinFormLabel>
            <Input
              type="text"
              name="username"
              value={values.username}
              onChange={handleChange}
              errorMessage={errors.username}
            />
          </WinFormField>

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
            <WinButton type="button" disabled={loading} onClick={() => navigate('/login')}>
              Login
            </WinButton>
            <WinButton type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Register'}
            </WinButton>
          </WinFormActions>

          <MessageArea $visible={!!apiMessage.message}>
            {apiMessage.message || '\u00A0'}
          </MessageArea>
        </WinForm>
      </Win95Card>
    </Win95Page>
  )
}

export default Register
