'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase/firebase'
import { User } from 'firebase/auth'

export function useAuthToken() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user: User | null) => {
      try {
        if (user) {
          const idToken = await user.getIdToken()
          setToken(idToken)
        } else {
          setToken(null)
        }
        setLoading(false)
      } catch (err) {
        console.error('Error getting auth token:', err)
        setError(err instanceof Error ? err : new Error(String(err)))
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  return { token, loading, error }
}

/**
 * Gets the current user's ID token
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const user = auth.currentUser
    if (!user) {
      return null
    }
    return await user.getIdToken()
  } catch (error) {
    console.error('Error getting auth token:', error)
    return null
  }
} 