import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * This route handles the callback from Yahoo OAuth
 * It receives the authorization code and redirects to the frontend
 * with the code as a query parameter
 */
export async function GET(request: NextRequest) {
  console.log('Yahoo OAuth callback received')
  
  // Get the URL parameters
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  
  // Log all parameters for debugging
  console.log('Yahoo callback parameters:')
  console.log('- Code present:', !!code)
  console.log('- State present:', !!state)
  console.log('- Error:', error || 'none')
  console.log('- Error description:', errorDescription || 'none')
  
  // Check for errors from Yahoo
  if (error) {
    console.error(`Yahoo OAuth error: ${error} - ${errorDescription || 'No description'}`)
    
    // Redirect to error page with details
    const errorUrl = new URL('/auth/yahoo-error', request.nextUrl.origin)
    errorUrl.searchParams.append('error', error)
    if (errorDescription) {
      errorUrl.searchParams.append('description', errorDescription)
    }
    return NextResponse.redirect(errorUrl)
  }
  
  // Validate required parameters
  if (!code || !state) {
    console.error('Missing required parameters in Yahoo callback')
    const errorUrl = new URL('/auth/yahoo-error', request.nextUrl.origin)
    errorUrl.searchParams.append('error', 'missing_params')
    return NextResponse.redirect(errorUrl)
  }
  
  // Store the authorization code in a cookie for the token exchange
  const cookieStore = cookies()
  cookieStore.set('yahoo_auth_code', code, {
    httpOnly: true,
    secure: true,
    maxAge: 300, // 5 minutes
    path: '/',
  })
  
  cookieStore.set('yahoo_auth_state', state, {
    httpOnly: true,
    secure: true,
    maxAge: 300, // 5 minutes
    path: '/',
  })
  
  console.log('Stored authorization code and state in cookies')
  console.log('Redirecting to token exchange endpoint')
  
  // Redirect to a completion page
  return NextResponse.redirect(new URL('/auth/yahoo-complete', request.nextUrl.origin))
} 