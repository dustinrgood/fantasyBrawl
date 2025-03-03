import { NextRequest, NextResponse } from 'next/server'

// Yahoo OAuth configuration
const YAHOO_CLIENT_ID = process.env.YAHOO_CLIENT_ID
const YAHOO_REDIRECT_URI = process.env.YAHOO_REDIRECT_URI || 'https://localhost:3001/api/auth/yahoo/callback'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    // Validate required parameters
    if (!userId) {
      console.error('Missing userId in request body')
      return NextResponse.json(
        { error: 'Missing userId in request body' },
        { status: 400 }
      )
    }

    // Check if Yahoo client ID is configured
    if (!YAHOO_CLIENT_ID) {
      console.error('Yahoo client ID not configured')
      return NextResponse.json(
        { error: 'Yahoo client ID not configured' },
        { status: 500 }
      )
    }

    console.log(`Generating Yahoo auth URL for user: ${userId}`)

    // Generate a random state for security
    const state = generateRandomString(32)

    // Build the Yahoo authorization URL
    const authUrl = new URL('https://api.login.yahoo.com/oauth2/request_auth')
    authUrl.searchParams.append('client_id', YAHOO_CLIENT_ID)
    authUrl.searchParams.append('redirect_uri', YAHOO_REDIRECT_URI)
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('state', state)
    
    // Request write access (fspt-w) which includes read access
    authUrl.searchParams.append('scope', 'fspt-w')
    
    // Add language parameter
    authUrl.searchParams.append('language', 'en-us')

    // Store the state and user ID in a database or cache for verification
    // In a real implementation, you would store this in a database or Redis
    // For now, we'll just log it
    console.log(`Generated state: ${state} for user: ${userId}`)
    console.log(`Generated auth URL: ${authUrl.toString()}`)

    return NextResponse.json({ 
      authUrl: authUrl.toString(),
      state
    })
  } catch (error) {
    console.error('Error generating Yahoo auth URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate Yahoo auth URL' },
      { status: 500 }
    )
  }
}

// Helper function to generate a random string for state parameter
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let text = ''
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
} 