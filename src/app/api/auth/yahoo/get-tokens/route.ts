import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase/firebase'
import { doc, getDoc } from 'firebase/firestore'

/**
 * This route retrieves Yahoo tokens for a user
 */
export async function GET(request: NextRequest) {
  try {
    // Get the user ID from the query parameters
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    console.log(`Retrieving Yahoo tokens for user: ${userId}`)
    
    // Get the tokens from Firestore
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists() || !userDoc.data().yahooTokens) {
      return NextResponse.json(
        { error: 'No Yahoo tokens found for user' },
        { status: 404 }
      )
    }
    
    const tokens = userDoc.data().yahooTokens
    
    // Check if tokens are expired
    const expiresAt = tokens.expiresAt || tokens.expires_at
    const isExpired = expiresAt ? new Date(expiresAt) <= new Date() : true
    
    // Get token values, handling both formats
    const accessToken = tokens.accessToken || tokens.access_token
    const refreshToken = tokens.refreshToken || tokens.refresh_token
    
    // Safely log token information
    console.log('Yahoo tokens found:', {
      accessTokenPrefix: accessToken ? accessToken.substring(0, 10) + '...' : 'undefined',
      refreshTokenPrefix: refreshToken ? refreshToken.substring(0, 10) + '...' : 'undefined',
      expiresAt: expiresAt ? new Date(expiresAt).toLocaleString() : 'undefined',
      isExpired
    })
    
    // Log the full token structure (without sensitive data)
    console.log('Token structure:', {
      keys: Object.keys(tokens),
      hasAccessToken: !!tokens.accessToken,
      hasRefreshToken: !!tokens.refreshToken,
      hasExpiresAt: !!tokens.expiresAt,
      hasAccess_Token: !!tokens.access_token,
      hasRefresh_Token: !!tokens.refresh_token,
      hasExpires_At: !!tokens.expires_at
    })
    
    return NextResponse.json({
      tokens
    })
  } catch (error) {
    console.error('Error retrieving Yahoo tokens:', error)
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 