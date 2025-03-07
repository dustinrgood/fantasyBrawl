/**
 * API route to handle Yahoo OAuth callback
 * Updated version that stores tokens in Firestore and redirects to success/error page
 */
import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { Agent } from 'https'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'

// Yahoo OAuth configuration
const YAHOO_CLIENT_ID = process.env.YAHOO_CLIENT_ID
const YAHOO_CLIENT_SECRET = process.env.YAHOO_CLIENT_SECRET
const YAHOO_REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/yahoo/callback`
  : 'https://localhost:3001/api/auth/yahoo/callback'

// Create custom HTTPS agent for development
const isDev = process.env.NODE_ENV === 'development'
const httpsAgent = isDev ? new Agent({ rejectUnauthorized: false }) : undefined

export async function GET(request: NextRequest) {
  try {
    // Get the authorization code and state from the query parameters
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Check for errors in the callback
    if (error) {
      console.error(`Yahoo OAuth error: ${error}`)
      return NextResponse.redirect(new URL('/profile?error=yahoo_auth_failed', request.url))
    }

    // Validate required parameters
    if (!code) {
      console.error('Missing authorization code in callback')
      return NextResponse.redirect(new URL('/profile?error=missing_code', request.url))
    }

    if (!state) {
      console.error('Missing state parameter in callback')
      return NextResponse.redirect(new URL('/profile?error=missing_state', request.url))
    }

    // Get the state data from the cookie
    const cookieStore = request.cookies
    const stateDataCookie = cookieStore.get('yahoo_oauth_state')
    
    if (!stateDataCookie) {
      console.error('Missing state data cookie')
      return NextResponse.redirect(new URL('/profile?error=missing_state_cookie', request.url))
    }
    
    let stateData: { state: string, userId: string }
    try {
      stateData = JSON.parse(stateDataCookie.value)
    } catch (e) {
      console.error('Invalid state data cookie:', e)
      return NextResponse.redirect(new URL('/profile?error=invalid_state_cookie', request.url))
    }
    
    // Verify state matches
    if (state !== stateData.state) {
      console.error('State mismatch - possible CSRF attack')
      return NextResponse.redirect(new URL('/profile?error=state_mismatch', request.url))
    }
    
    const userId = stateData.userId
    
    // Check if Yahoo client credentials are configured
    if (!YAHOO_CLIENT_ID || !YAHOO_CLIENT_SECRET) {
      console.error('Yahoo client credentials not configured')
      return NextResponse.redirect(new URL('/profile?error=yahoo_config_error', request.url))
    }

    // Exchange the authorization code for tokens
    const tokenRequestBody = new URLSearchParams()
    tokenRequestBody.append('grant_type', 'authorization_code')
    tokenRequestBody.append('code', code)
    tokenRequestBody.append('redirect_uri', YAHOO_REDIRECT_URI)
    tokenRequestBody.append('client_id', YAHOO_CLIENT_ID)
    tokenRequestBody.append('client_secret', YAHOO_CLIENT_SECRET)

    // Make the token request
    const tokenResponse = await axios.post(
      'https://api.login.yahoo.com/oauth2/get_token',
      tokenRequestBody.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        httpsAgent
      }
    )

    if (tokenResponse.status !== 200) {
      console.error('Failed to exchange code for tokens:', tokenResponse.status, tokenResponse.statusText)
      return NextResponse.redirect(new URL('/profile?error=token_exchange_failed', request.url))
    }

    // Extract the tokens in consistent camelCase format
    const tokenData = tokenResponse.data
    const tokens = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + tokenData.expires_in * 1000
    }

    // Store the tokens in Firestore
    try {
      const userRef = doc(db, 'users', userId)
      await setDoc(userRef, {
        yahooTokens: tokens,
        yahooConnected: true,
        yahooTokensUpdatedAt: new Date().toISOString()
      }, { merge: true })
      
      console.log('Successfully stored Yahoo tokens for user:', userId)
    } catch (dbError) {
      console.error('Error storing tokens in Firestore:', dbError)
      return NextResponse.redirect(new URL('/profile?error=token_storage_failed', request.url))
    }
    
    // Clear the state cookie
    const response = NextResponse.redirect(new URL('/profile?yahoo=connected', request.url))
    response.cookies.delete('yahoo_oauth_state')
    
    return response
  } catch (error) {
    console.error('Error handling Yahoo OAuth callback:', error)
    return NextResponse.redirect(new URL('/profile?error=server_error', request.url))
  }
}