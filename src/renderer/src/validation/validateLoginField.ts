export const validateLoginField = (name: 'email' | 'password', value: string): string | null => {
  const trimmedValue = value.trim()

  if (name === 'email') {
    if (!trimmedValue) return 'Email is required'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedValue)) {
      return 'Email must be a valid email address'
    }

    return null
  }

  if (name === 'password') {
    if (!trimmedValue) return 'Password is required.'
    if (value.length < 6) return 'Password must be at least 6 characters long.'
    return null
  }

  return null
}

export default validateLoginField
