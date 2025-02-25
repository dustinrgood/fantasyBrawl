import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase/firebase'
import { doc, getDoc } from 'firebase/firestore'

/**
 * Helper function to check if it's currently the NFL offseason
 */
function isNflOffseason(): boolean {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1 // JavaScript months are 0-indexed
  
  // NFL offseason is roughly February (2) to August (8)
  return currentMonth >= 2 && currentMonth <= 8
}

/**
 * This route provides debug information about Yahoo tokens
 */
export async function GET(request: NextRequest) {
  try {
    // Get userId from query string
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    // Add NFL season status information
    const seasonStatus = {
      isOffseason: isNflOffseason(),
      currentMonth: new Date().getMonth() + 1,
      message: isNflOffseason() 
        ? "It's currently the NFL offseason. Yahoo Fantasy API may not return any active leagues during this period."
        : "It's currently the active NFL season. Yahoo Fantasy API should return your leagues if you have any."
    }
    
    if (!userId) {
      return NextResponse.json({
        authenticated: false,
        seasonStatus,
        configuration: {
          yahooClientId: process.env.YAHOO_CLIENT_ID ? 'Configured' : 'Missing',
          yahooClientSecret: process.env.YAHOO_CLIENT_SECRET ? 'Configured' : 'Missing',
          yahooRedirectUri: process.env.YAHOO_REDIRECT_URI || 'Not configured',
          environment: process.env.NODE_ENV || 'unknown'
        },
        tokens: {
          status: 'not authenticated',
          message: 'User ID is required'
        }
      })
    }
    
    // Get tokens from Firestore
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists() || !userDoc.data().yahooTokens) {
      return NextResponse.json({
        authenticated: true,
        userId,
        seasonStatus,
        configuration: {
          yahooClientId: process.env.YAHOO_CLIENT_ID ? 'Configured' : 'Missing',
          yahooClientSecret: process.env.YAHOO_CLIENT_SECRET ? 'Configured' : 'Missing',
          yahooRedirectUri: process.env.YAHOO_REDIRECT_URI || 'Not configured',
          environment: process.env.NODE_ENV || 'unknown'
        },
        tokens: {
          status: 'no tokens',
          message: 'No Yahoo tokens found for user'
        }
      })
    }
    
    const tokens = userDoc.data().yahooTokens
    const isExpired = tokens.expires_at < Date.now()
    
    return NextResponse.json({
      authenticated: true,
      userId,
      seasonStatus,
      configuration: {
        yahooClientId: process.env.YAHOO_CLIENT_ID ? 'Configured' : 'Missing',
        yahooClientSecret: process.env.YAHOO_CLIENT_SECRET ? 'Configured' : 'Missing',
        yahooRedirectUri: process.env.YAHOO_REDIRECT_URI || 'Not configured',
        environment: process.env.NODE_ENV || 'unknown'
      },
      tokens: {
        status: 'tokens found',
        accessTokenPrefix: tokens.access_token.substring(0, 10) + '...',
        refreshTokenPrefix: tokens.refresh_token.substring(0, 10) + '...',
        expiresAt: new Date(tokens.expires_at).toLocaleString(),
        isExpired,
        updatedAt: userDoc.data().yahooTokensUpdatedAt || 'unknown'
      }
    })
  } catch (error) {
    console.error('Error in Yahoo debug endpoint:', error)
    
    return NextResponse.json({
      error: 'Failed to get debug information',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 