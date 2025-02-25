import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/firebase/firebase'

/**
 * This route is for testing Firebase auth in API routes
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const currentUser = auth.currentUser
    
    console.log('Auth test endpoint called')
    console.log('Current user:', currentUser ? `User ID: ${currentUser.uid}` : 'No user logged in')
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      isAuthenticated: !!currentUser,
      userId: currentUser?.uid || null,
      email: currentUser?.email || null
    })
  } catch (error) {
    console.error('Error in auth test endpoint:', error)
    
    return NextResponse.json({
      error: 'Failed to test auth',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 