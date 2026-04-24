import { useState, useCallback, JSX } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../Store/LoginProvider'
import { SigninPayload } from '../types/auth.type'
import Input from '../components/Input/Input'
import { AxiosError } from 'axios' // Import AxiosError
import Win95Page from '../components/Win95/Win95Page'
import {
  WinForm,
  WinFormField,
  WinFormLabel,
  WinFormActions,
  MessageArea,
  WinFormRow
} from '../components/Win95/Win95Form.style'
import Win95Card from '../components/Win95/Win95Card'
import validateLoginField from '../validation/validateLoginField'

import keyIcon from '../assets/keys-5.png'
import IconComponent from '../components/IconComponent/Icon'
import WinButton from '../components/Button/WinButton'

type InputChangeEvent = React.ChangeEvent<HTMLInputElement>

const initialState: SigninPayload = {
  email: '',
  password: ''
}

const Login = (): JSX.Element => {
  const { login } = useLogin()
  const navigate = useNavigate()

  const [values, setValues] = useState<SigninPayload>(initialState)

  const [errors, setErrors] = useState<SigninPayload>(initialState)
  const [loading, setLoading] = useState(false)
  const [apiMessage, setApiMessage] = useState<{ message: string; fulfill: boolean }>({
    message: '',
    fulfill: false
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
    const fieldName = name as keyof SigninPayload

    setValues((prevValues) => ({
      ...prevValues,
      [fieldName]: value
    }))

    setErrors((prev) => ({
      ...prev,
      [fieldName]: validateLoginField(fieldName, value) ?? ''
    }))
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    const newErrors: SigninPayload = {
      email: validateLoginField('email', values.email) ?? '',
      password: validateLoginField('password', values.password) ?? ''
    }
    setErrors(newErrors)

    const hasErrors = Object.values(newErrors).some(Boolean)
    if (hasErrors) return

    setLoading(true) // Start loading state
    const start = Date.now() // Track start time for minimum delay

    try {
      await login(values)
    } catch (error) {
      handleError(error) // Use centralized error handler
    } finally {
      const duration = Date.now() - start
      const remainingTime = Math.max(MIN_LOADING_DURATION - duration, 0)
      setTimeout(() => setLoading(false), remainingTime) // Ensure minimum loading duration
    }
  }

  const handleCancel = () => {
    window.close()
  }

  return (
    <Win95Page title="Login" 
  width="470px"
  maxWidth="calc(100vw - 24px)"
  height="auto"
  maxHeight="calc(100vh - 24px)"
  stretchOnSmallScreens={false}
    
    >
      <Win95Card inset>
        <IconComponent keyIcon={keyIcon} text="Please log in to your account" />

        <WinForm onSubmit={handleSubmit}>
          <WinFormRow>
            <WinFormLabel>Email</WinFormLabel>
            <WinFormField>
              <Input
                type="text"
                name="email"
                value={values.email}
                onChange={handleChange}
                errorMessage={errors.email}
              />
            </WinFormField>
          </WinFormRow>
          <WinFormRow>
            <WinFormLabel>Password</WinFormLabel>
            <WinFormField>
              <Input
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                errorMessage={errors.password}
              />
            </WinFormField>
          </WinFormRow>
          <WinFormActions>
            <WinButton type="button" disabled={loading} onClick={() => navigate('/register')}>
              Register
            </WinButton>
            <WinButton type="button" disabled={loading} onClick={handleCancel}>
              Cancel
            </WinButton>
            <WinButton type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'OK'}
            </WinButton>
          </WinFormActions>

          <MessageArea $visible={!!apiMessage}>{apiMessage.message || '\u00A0'}</MessageArea>
        </WinForm>
      </Win95Card>
    </Win95Page>
  )
}

export default Login
