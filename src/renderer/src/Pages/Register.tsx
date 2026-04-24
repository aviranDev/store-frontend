import { useState, useCallback, JSX } from 'react'
import { useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import { WinFormRow } from '../components/Win95/Win95Form.style'

import Input from '../components/Input/Input'
import Win95Page from '../components/Win95/Win95Page'
import {
  WinForm,
  WinFormLabel,
  WinFormActions,
  MessageArea
} from '../components/Win95/Win95Form.style'
import Win95Card from '../components/Win95/Win95Card'
import validateRegisterField from '../validation/validateRegisterField'
import { useLogin } from '../Store/LoginProvider'
import keyIcon from '../assets/users_green-4.png'
import WinButton from '../components/Button/WinButton'

import IconComponent from '@renderer/components/IconComponent/Icon'

type RegisterFormData = {
  username: string
  email: string
  password: string
  confirmPassword: string
  customerNumber: string
}

type RegisterApiData = Omit<RegisterFormData, 'confirmPassword'>

type InputChangeEvent = React.ChangeEvent<HTMLInputElement>

const initialState: RegisterFormData = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  customerNumber: ''
}

const Register = (): JSX.Element => {
  const navigate = useNavigate()
  const { register } = useLogin()

  const [values, setValues] = useState<RegisterFormData>(initialState)
  const [errors, setErrors] = useState<RegisterFormData>(initialState)
  const [loading, setLoading] = useState(false)
  const [apiMessage, setApiMessage] = useState<{ message: string; fulfill: boolean }>({
    message: '',
    fulfill: false
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

  const validateConfirmPassword = useCallback(
    (password: string, confirmPassword: string): string => {
      if (!confirmPassword.trim()) return 'Please confirm your password'
      if (password !== confirmPassword) return 'Passwords do not match'
      return ''
    },
    []
  )

  const handleChange = useCallback(
    (e: InputChangeEvent): void => {
      const { name, value } = e.target
      const fieldName = name as keyof RegisterFormData

      setValues((prevValues) => {
        const nextValues = {
          ...prevValues,
          [fieldName]: value
        }

        setErrors((prevErrors) => ({
          ...prevErrors,
          [fieldName]:
            fieldName === 'confirmPassword'
              ? validateConfirmPassword(nextValues.password, value)
              : (validateRegisterField(fieldName, value) ?? ''),
          confirmPassword:
            fieldName === 'password'
              ? validateConfirmPassword(value, nextValues.confirmPassword)
              : fieldName === 'confirmPassword'
                ? validateConfirmPassword(nextValues.password, value)
                : prevErrors.confirmPassword
        }))

        return nextValues
      })
    },
    [validateConfirmPassword]
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    const newErrors: RegisterFormData = {
      username: validateRegisterField('username', values.username) ?? '',
      email: validateRegisterField('email', values.email) ?? '',
      password: validateRegisterField('password', values.password) ?? '',
      confirmPassword: validateConfirmPassword(values.password, values.confirmPassword),
      customerNumber: validateRegisterField('customerNumber', values.customerNumber) ?? ''
    }

    setErrors(newErrors)

    const hasErrors = Object.values(newErrors).some(Boolean)
    if (hasErrors) return

    setLoading(true)

    const start = Date.now()

    const apiData: RegisterApiData = {
      username: values.username,
      email: values.email,
      password: values.password,
      customerNumber: values.customerNumber
    }

    try {
      const response = await register(apiData)
      setApiMessage({ message: response.message, fulfill: true })

      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (error) {
      handleError(error)
    } finally {
      const duration = Date.now() - start
      const remainingTime = Math.max(MIN_LOADING_DURATION - duration, 0)
      setTimeout(() => setLoading(false), remainingTime)
    }
  }

  return (
    <Win95Page 
     title="Register"
  width="540px"
  maxWidth="calc(100vw - 24px)"
  height="auto"
  maxHeight="calc(100vh - 24px)"
  stretchOnSmallScreens={false}
    >
      <Win95Card inset>
        <IconComponent keyIcon={keyIcon} text="Please register for an account" />

        <WinForm onSubmit={handleSubmit}>
          <WinFormRow>
            <WinFormLabel>Username</WinFormLabel>
            <Input
              type="text"
              name="username"
              value={values.username}
              onChange={handleChange}
              errorMessage={errors.username}
            />
          </WinFormRow>

          <WinFormRow>
            <WinFormLabel>Email</WinFormLabel>
            <Input
              type="text"
              name="email"
              value={values.email}
              onChange={handleChange}
              errorMessage={errors.email}
            />
          </WinFormRow>

          <WinFormRow>
            <WinFormLabel>Password</WinFormLabel>
            <Input
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              errorMessage={errors.password}
            />
          </WinFormRow>

          <WinFormRow>
            <WinFormLabel>Confirm Password</WinFormLabel>
            <Input
              type="password"
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              errorMessage={errors.confirmPassword}
            />
          </WinFormRow>

          <WinFormRow>
            <WinFormLabel>Customer Number</WinFormLabel>
            <Input
              type="text"
              name="customerNumber"
              value={values.customerNumber}
              onChange={handleChange}
              errorMessage={errors.customerNumber}
            />
          </WinFormRow>

          <WinFormActions>
            <WinButton type="button" disabled={loading} onClick={() => navigate('/login')}>
              Cancel
            </WinButton>

            <WinButton type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'OK'}
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
