import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase/firebase'
import { doc, setDoc } from 'firebase/firestore'

/**
 * This route clears Yahoo tokens from Firestore
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json()
    const { userId } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    console.log(`Clearing Yahoo tokens for user: ${userId}`)
    
    // Clear tokens in Firestore
    const userRef = doc(db, 'users', userId)
    await setDoc(userRef, {
      yahooTokens: null,
      yahooConnected: false,
      yahooTokensUpdatedAt: new Date().toISOString()
    }, { merge: true })
    
    console.log('Yahoo tokens successfully cleared from Firestore')
    
    return NextResponse.json({
      success: true,
      message: 'Yahoo tokens cleared successfully'
    })
  } catch (error) {
    console.error('Error clearing Yahoo tokens:', error)
    
    return NextResponse.json({
      error: 'Failed to clear Yahoo tokens',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 