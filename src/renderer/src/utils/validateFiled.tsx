export const validate = (name: string, value: string, length: number): string | null => {
  if (!value.trim()) {
    return `${capitalizeFirstLetter(name)} is required`
  } else if (value.length !== length) {
    return `${capitalizeFirstLetter(name)} must be at least ${length} characters`
  }
  return null // Return null for no errors
}

const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export default validate
