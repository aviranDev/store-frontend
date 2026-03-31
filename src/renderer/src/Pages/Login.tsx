import { useState, useRef, useCallback, JSX } from 'react'
import { useLogin } from '../Store/LoginProvider'
import { Auth } from '../Services/user'
import validate from '../utils/validateFiled'
import Input from '../components/Input/Input'
import { StyledForm, FormWrapper, MessageContainer, LayerContainer } from '../styles/formStyles'
import Title from '../components/Title/Title'
import { AxiosError } from 'axios' // Import AxiosError
import Button from '../components/Button/Button'

type InputChangeEvent = React.ChangeEvent<HTMLInputElement>

const initialState: Auth = {
  email: '',
  password: ''
}

const Login = (): JSX.Element => {
  const { login } = useLogin()
  const [values, setValues] = useState<Auth>(initialState)
  const lengths = useRef<{ [key in keyof Auth]: number }>({
    email: 24,
    password: 9
  })
  const [errors, setErrors] = useState<Auth>(initialState)
  const [apiMessage, setApiMessage] = useState<{ message: string; fulfill: boolean }>({
    message: '',
    fulfill: false
  })
  const [loading, setLoading] = useState(false) // Loading state

  const MIN_LOADING_DURATION = 2000 // Minimum delay of 1 second

  // Centralized error handling function
  const handleError = (error: unknown): void => {
    setApiMessage({ message: 'An unknown error occurred', fulfill: false })

    if (error instanceof AxiosError) {
      setApiMessage({
        message: error.response?.data?.message || 'An unknown error occurred',
        fulfill: false
      })
    } else if (error instanceof Error) {
      setApiMessage({ message: error.message, fulfill: false })
    }
  }

  const handleChange = useCallback((e: InputChangeEvent): void => {
    const { name, value } = e.target
    setValues((prevValues) => ({ ...prevValues, [name as keyof Auth]: value }))
    setErrors((prev) => ({ ...prev, [name]: validate(name, value, lengths.current[name]) }))
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    let hasErrors = false

    // Check all form fields for validation errors
    for (const name in values) {
      const error = validate(name, values[name as keyof Auth], lengths.current[name])
      if (error) {
        setErrors((prev) => ({ ...prev, [name]: error }))
        hasErrors = true
      }
    }

    // If there are validation errors, exit submit
    if (hasErrors) return

    setLoading(true) // Start loading state
    const start = Date.now() // Track start time for minimum delay

    try {
      const response = await login(values)
      setApiMessage({ message: response.data.message, fulfill: true })
    } catch (error) {
      handleError(error) // Use centralized error handler
    } finally {
      const duration = Date.now() - start
      const remainingTime = Math.max(MIN_LOADING_DURATION - duration, 0)
      setTimeout(() => setLoading(false), remainingTime) // Ensure minimum loading duration
    }
  }

  return (
    <FormWrapper>
      <LayerContainer>
        <StyledForm onSubmit={handleSubmit}>
          <Title $level={3} color="var(--background-color)">
            User login
          </Title>
          <Input
            // icon={CiUser}
            placeholder="email"
            type="text"
            name="email"
            onChange={handleChange}
            errorMessage={errors.email}
          />
          <Input
            // icon={CiUnlock}
            placeholder="password"
            type="password"
            name="password"
            onChange={handleChange}
            errorMessage={errors.password}
          />
          <Button width="100%" $variant="primary" type="submit">
            {loading ? 'Logging in...' : 'Submit'}
          </Button>
          <MessageContainer $apiFulfill={apiMessage.fulfill}>
            {apiMessage.message && <span>{apiMessage.message}</span>}
          </MessageContainer>
        </StyledForm>
      </LayerContainer>
    </FormWrapper>
  )
}

export default Login
