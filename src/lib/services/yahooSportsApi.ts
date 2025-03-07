import axios from 'axios'
import { auth, db } from '../firebase/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'

// Yahoo OAuth configuration
const YAHOO_CLIENT_ID = process.env.YAHOO_CLIENT_ID
const YAHOO_CLIENT_SECRET = process.env.YAHOO_CLIENT_SECRET
const REDIRECT_URI = typeof window !== 'undefined' 
  ? `${window.location.origin}/api/auth/yahoo/callback`
  : process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/yahoo/callback`
    : 'https://localhost:3001/api/auth/yahoo/callback'

// Yahoo API endpoints
const YAHOO_AUTH_URL = 'https://api.login.yahoo.com/oauth2/request_auth'
const YAHOO_TOKEN_URL = 'https://api.login.yahoo.com/oauth2/get_token'
const YAHOO_API_BASE_URL = 'https://fantasysports.yahooapis.com/fantasy/v2'

// Types
interface YahooTokens {
  access_token: string
  refresh_token: string
  expires_at: number
}

/**
 * Initiates the Yahoo OAuth flow
 */
export const initiateYahooAuth = () => {
  if (!YAHOO_CLIENT_ID) {
    console.error('Yahoo Client ID not configured')
    throw new Error('Yahoo Client ID not configured')
  }

  const state = generateRandomString(32)
  
  // Store state in session storage for verification
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('yahoo_oauth_state', state)
  }

  const authUrl = new URL(YAHOO_AUTH_URL)
  authUrl.searchParams.append('client_id', YAHOO_CLIENT_ID)
  
  // Ensure we're using HTTPS for the redirect URI
  let redirectUri = REDIRECT_URI
  if (redirectUri.startsWith('http://')) {
    redirectUri = redirectUri.replace('http://', 'https://')
  }
  
  // Properly encode the redirect URI
  authUrl.searchParams.append('redirect_uri', redirectUri)
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('state', state)
  
  // Update scope to request write access (fspt-w) which includes read access
  authUrl.searchParams.append('scope', 'fspt-w')
  
  // Add language parameter
  authUrl.searchParams.append('language', 'en-us')

  console.log('Initiating Yahoo auth with parameters:')
  console.log('- Client ID:', YAHOO_CLIENT_ID.substring(0, 10) + '...')
  console.log('- Redirect URI:', redirectUri)
  console.log('- State:', state.substring(0, 5) + '...')
  console.log('- Scope:', 'fspt-w')
  console.log('Full auth URL:', authUrl.toString())
  
  // Redirect to Yahoo authorization page
  window.location.href = authUrl.toString()
}

/**
 * Exchanges authorization code for access tokens
 */
export const exchangeCodeForTokens = async (code: string): Promise<YahooTokens> => {
  try {
    const response = await axios.post('/api/auth/yahoo/token', { code })
    const { access_token, refresh_token, expires_in } = response.data
    
    // Calculate expiration time
    const expires_at = Date.now() + expires_in * 1000
    
    return { access_token, refresh_token, expires_at }
  } catch (error) {
    console.error('Error exchanging code for tokens:', error)
    throw error
  }
}

/**
 * Stores Yahoo tokens in Firestore for the current user
 */
export const storeYahooTokens = async (tokens: YahooTokens) => {
  const currentUser = auth.currentUser
  
  if (!currentUser) {
    throw new Error('User must be logged in to store Yahoo tokens')
  }
  
  try {
    const userRef = doc(db, 'users', currentUser.uid)
    await setDoc(userRef, {
      yahooTokens: tokens,
      yahooConnected: true,
      yahooTokensUpdatedAt: new Date().toISOString()
    }, { merge: true })
    
    return true
  } catch (error) {
    console.error('Error storing Yahoo tokens:', error)
    throw error
  }
}

/**
 * Retrieves Yahoo tokens for the current user
 */
export const getYahooTokens = async (): Promise<YahooTokens | null> => {
  const currentUser = auth.currentUser
  
  if (!currentUser) {
    return null
  }
  
  try {
    const userRef = doc(db, 'users', currentUser.uid)
    const userDoc = await getDoc(userRef)
    
    if (userDoc.exists() && userDoc.data().yahooTokens) {
      return userDoc.data().yahooTokens as YahooTokens
    }
    
    return null
  } catch (error) {
    console.error('Error retrieving Yahoo tokens:', error)
    return null
  }
}

/**
 * Refreshes Yahoo access token if expired
 */
export const refreshYahooTokenIfNeeded = async (): Promise<YahooTokens | null> => {
  const tokens = await getYahooTokens()
  
  if (!tokens) {
    return null
  }
  
  // Check if token is expired or about to expire (within 5 minutes)
  if (tokens.expires_at - Date.now() < 5 * 60 * 1000) {
    try {
      const response = await axios.post('/api/auth/yahoo/refresh', {
        refresh_token: tokens.refresh_token
      })
      
      const { access_token, refresh_token, expires_in } = response.data
      const expires_at = Date.now() + expires_in * 1000
      
      const newTokens = { access_token, refresh_token, expires_at }
      await storeYahooTokens(newTokens)
      
      return newTokens
    } catch (error) {
      console.error('Error refreshing Yahoo token:', error)
      return null
    }
  }
  
  return tokens
}

/**
 * Makes an authenticated request to the Yahoo Fantasy Sports API
 */
export const fetchFromYahooApi = async (endpoint: string) => {
  const tokens = await refreshYahooTokenIfNeeded()
  
  if (!tokens) {
    console.error('No valid Yahoo tokens available for API request')
    throw new Error('Yahoo authentication required')
  }
  
  try {
    console.log(`Making Yahoo API request to endpoint: ${endpoint}`)
    
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('User must be logged in to make Yahoo API requests')
    }
    
    // Use our proxy API instead of making direct requests
    console.log(`Using proxy API for Yahoo request: ${endpoint}`)
    const response = await fetch('/api/yahoo/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: endpoint.startsWith('/') ? endpoint.substring(1) : endpoint,
        userId: currentUser.uid
      }),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `Yahoo API request failed: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log(`Yahoo API response received via proxy`)
    return data
  } catch (error) {
    console.error('Error fetching from Yahoo API:', error)
    throw error
  }
}

/**
 * Fetches user's Yahoo Fantasy leagues
 */
export const fetchUserLeagues = async () => {
  try {
    console.log('Fetching user leagues from Yahoo API...')
    
    // Ensure token is refreshed if needed
    const tokens = await refreshYahooTokenIfNeeded()
    if (!tokens) {
      console.error('No valid Yahoo tokens available')
      throw new Error('Yahoo authentication required')
    }
    
    console.log('Making API request to Yahoo Fantasy API for leagues...')
    
    // Get the current user
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('User must be logged in to fetch Yahoo leagues')
    }
    
    // Use the dedicated leagues API endpoint instead of direct Yahoo API calls
    console.log('Using leagues API endpoint')
    const response = await fetch('/api/yahoo/leagues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: currentUser.uid
      }),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `Failed to fetch leagues: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('Leagues API response:', data)
    
    return data
  } catch (error) {
    console.error('Error fetching user leagues:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

/**
 * Generates a random string for OAuth state parameter
 */
const generateRandomString = (length: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  
  return result
}

/**
 * Clears Yahoo tokens from Firestore for the current user
 */
export const clearYahooTokens = async () => {
  const currentUser = auth.currentUser
  
  if (!currentUser) {
    throw new Error('User must be logged in to clear Yahoo tokens')
  }
  
  try {
    const userRef = doc(db, 'users', currentUser.uid)
    await setDoc(userRef, {
      yahooTokens: null,
      yahooConnected: false,
      yahooTokensUpdatedAt: new Date().toISOString()
    }, { merge: true })
    
    return true
  } catch (error) {
    console.error('Error clearing Yahoo tokens:', error)
    throw error
  }
} 