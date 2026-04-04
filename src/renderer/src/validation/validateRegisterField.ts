export const validateRegisterField = (
  name: 'username' | 'email' | 'password' | 'customerNumber',
  value: string
): string | null => {
  const trimmedValue = value.trim()

  if (name === 'username') {
    if (!trimmedValue) return 'Username is required'
    if (trimmedValue.length < 3) return 'Username must be at least 3 characters long'
    if (trimmedValue.length > 20) return 'Username must be at most 20 characters long'
    return null
  }

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

  if (name === 'customerNumber') {
    if (!trimmedValue) return 'Customer number is required'
    if (!/^\d+$/.test(trimmedValue)) return 'Customer number must contain digits only'
    if (trimmedValue.length < 3) return 'Customer number must be at least 3 characters long.'
    if (trimmedValue.length > 20) return 'Customer number must be at most 20 characters long.'
    return null
  }

  return null
}

export default validateRegisterField
