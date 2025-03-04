import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase/firebase'
import { doc, setDoc } from 'firebase/firestore'

/**
 * This route stores Yahoo tokens for a user
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
    
    if (!tokens || !tokens.access_token || !tokens.refresh_token) {
      return NextResponse.json(
        { error: 'Valid tokens are required' },
        { status: 400 }
      )
    }
    
    console.log(`Storing Yahoo tokens for user: ${userId}`)
    
    // Format tokens for storage
    const formattedTokens = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expires_at || Date.now() + (3600 * 1000), // Default 1 hour expiry
    }
    
    // Store the tokens in Firestore
    const userRef = doc(db, 'users', userId)
    await setDoc(userRef, {
      yahooTokens: formattedTokens,
      yahooConnected: true,
      yahooTokensUpdatedAt: new Date().toISOString()
    }, { merge: true })
    
    console.log('Yahoo tokens stored successfully')
    
    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Error storing Yahoo tokens:', error)
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 