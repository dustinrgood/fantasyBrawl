import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase/firebase'
import { doc, getDoc } from 'firebase/firestore'

/**
 * This route retrieves Yahoo tokens from Firestore
 */
export async function GET(request: NextRequest) {
  try {
    // Get userId from query string
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'User ID is required',
          found: false
        },
        { status: 400 }
      )
    }
    
    console.log(`Retrieving Yahoo tokens for user: ${userId}`)
    
    // Get tokens from Firestore
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists() || !userDoc.data().yahooTokens) {
      console.log(`No Yahoo tokens found for user: ${userId}`)
      return NextResponse.json({
        found: false,
        message: 'No Yahoo tokens found for user'
      })
    }
    
    const tokens = userDoc.data().yahooTokens
    
    console.log('Yahoo tokens found:', {
      accessTokenPrefix: tokens.access_token.substring(0, 10) + '...',
      refreshTokenPrefix: tokens.refresh_token.substring(0, 10) + '...',
      expiresAt: new Date(tokens.expires_at).toLocaleString(),
      isExpired: tokens.expires_at < Date.now()
    })
    
    return NextResponse.json({
      found: true,
      tokens
    })
  } catch (error) {
    console.error('Error retrieving Yahoo tokens:', error)
    
    return NextResponse.json({
      error: 'Failed to retrieve Yahoo tokens',
      details: error instanceof Error ? error.message : String(error),
      found: false
    }, { status: 500 })
  }
} 