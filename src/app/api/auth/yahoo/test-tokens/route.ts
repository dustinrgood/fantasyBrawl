import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/firebase/firebase'
import { storeYahooTokens, getYahooTokens } from '@/lib/services/yahooFantasyClient'

/**
 * This route is for testing token storage and retrieval
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const currentUser = auth.currentUser
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }
    
    // Get existing tokens
    console.log('Attempting to get existing tokens...')
    const existingTokens = await getYahooTokens()
    
    // Return debug information
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      userId: currentUser.uid,
      existingTokens: existingTokens ? {
        accessTokenPrefix: existingTokens.access_token.substring(0, 10) + '...',
        refreshTokenPrefix: existingTokens.refresh_token.substring(0, 10) + '...',
        expiresAt: new Date(existingTokens.expires_at).toISOString(),
        isExpired: existingTokens.expires_at < Date.now()
      } : 'No tokens found'
    })
  } catch (error) {
    console.error('Error in test tokens endpoint:', error)
    
    return NextResponse.json({
      error: 'Failed to test tokens',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

/**
 * This route is for testing token storage
 */
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const currentUser = auth.currentUser
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }
    
    // Create test tokens
    const testTokens = {
      access_token: 'test_access_token_' + Date.now(),
      refresh_token: 'test_refresh_token_' + Date.now(),
      expires_at: Date.now() + 3600 * 1000 // 1 hour from now
    }
    
    console.log('Storing test tokens for user:', currentUser.uid)
    console.log('Test tokens:', {
      accessToken: testTokens.access_token,
      refreshToken: testTokens.refresh_token,
      expiresAt: new Date(testTokens.expires_at).toISOString()
    })
    
    // Store test tokens
    await storeYahooTokens(testTokens)
    
    // Verify tokens were stored
    console.log('Verifying test tokens were stored...')
    const storedTokens = await getYahooTokens()
    
    return NextResponse.json({
      success: true,
      testTokens: {
        accessToken: testTokens.access_token,
        refreshToken: testTokens.refresh_token,
        expiresAt: new Date(testTokens.expires_at).toISOString()
      },
      storedTokens: storedTokens ? {
        accessTokenPrefix: storedTokens.access_token.substring(0, 10) + '...',
        refreshTokenPrefix: storedTokens.refresh_token.substring(0, 10) + '...',
        expiresAt: new Date(storedTokens.expires_at).toISOString(),
        isExpired: storedTokens.expires_at < Date.now()
      } : 'No tokens found after storage attempt'
    })
  } catch (error) {
    console.error('Error storing test tokens:', error)
    
    return NextResponse.json({
      error: 'Failed to store test tokens',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 