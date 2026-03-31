export const setLocalStorage = <T>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error(`Error setting localStorage item ${key}`, e)
  }
}

export const getLocalStorage = <T>(key: string, initialValue: T): T => {
  try {
    const value = window.localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : initialValue
  } catch (e) {
    console.error(`Error getting localStorage item ${key}`, e)
    return initialValue
  }
}

export const removeLocalStorage = (key: string): void => {
  try {
    window.localStorage.removeItem(key)
  } catch (e) {
    console.error(`Error removing localStorage item ${key}`, e)
  }
}
