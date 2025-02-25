import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase/firebase'
import { doc, setDoc } from 'firebase/firestore'

/**
 * This route stores Yahoo tokens in Firestore
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json()
    const { userId, tokens } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    if (!tokens) {
      return NextResponse.json(
        { error: 'Tokens are required' },
        { status: 400 }
      )
    }
    
    console.log(`Storing Yahoo tokens for user: ${userId}`)
    console.log('Token info:', {
      accessTokenPrefix: tokens.access_token.substring(0, 10) + '...',
      refreshTokenPrefix: tokens.refresh_token.substring(0, 10) + '...',
      expiresAt: new Date(tokens.expires_at).toLocaleString()
    })
    
    // Store tokens in Firestore
    const userRef = doc(db, 'users', userId)
    await setDoc(userRef, {
      yahooTokens: tokens,
      yahooConnected: true,
      yahooTokensUpdatedAt: new Date().toISOString()
    }, { merge: true })
    
    console.log('Yahoo tokens successfully stored in Firestore')
    
    return NextResponse.json({
      success: true,
      message: 'Yahoo tokens stored successfully'
    })
  } catch (error) {
    console.error('Error storing Yahoo tokens:', error)
    
    return NextResponse.json({
      error: 'Failed to store Yahoo tokens',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 