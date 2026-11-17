import { useEffect, useState } from 'react'

// State React yang otomatis tersimpan ke localStorage browser.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw !== null ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage penuh / diblokir: data tetap ada selama tab terbuka
    }
  }, [key, value])

  return [value, setValue]
}

export function clearAppStorage() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('nt_'))
      .forEach((k) => localStorage.removeItem(k))
  } catch {
    /* abaikan */
  }
}
