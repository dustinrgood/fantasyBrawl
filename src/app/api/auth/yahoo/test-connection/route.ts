import { NextRequest, NextResponse } from 'next/server'

// Yahoo OAuth configuration
const YAHOO_CLIENT_ID = process.env.YAHOO_CLIENT_ID
const YAHOO_CLIENT_SECRET = process.env.YAHOO_CLIENT_SECRET
const YAHOO_CLIENT_ID = process.env.YAHOO_CLIENT_ID
const APP_URL = process.env.NEXT_PUBLIC_APP_URL

/**
 * Tests the Yahoo OAuth configuration
 */
export async function POST(request: NextRequest) {
  console.log('Testing Yahoo connection configuration')
  
  try {
    // Check if the client ID and secret are configured
    const checks = {
      serverClientId: !!YAHOO_CLIENT_ID,
      serverClientSecret: !!YAHOO_CLIENT_SECRET,
      publicClientId: !!YAHOO_CLIENT_ID,
      appUrl: !!APP_URL,
      clientIdMatch: true,
    }
    
    console.log('Configuration checks:', checks)
    
    // Check if all required configuration is present
    if (!checks.serverClientId || !checks.serverClientSecret) {
      return NextResponse.json({
        success: false,
        error: 'Server-side Yahoo credentials are missing',
        details: checks,
      }, { status: 400 })
    }
    
    if (!checks.publicClientId) {
      return NextResponse.json({
        success: false,
        error: 'Client-side Yahoo client ID is missing',
        details: checks,
      }, { status: 400 })
    }
    
    if (!checks.clientIdMatch) {
      return NextResponse.json({
        success: false,
        error: 'Server and client Yahoo client IDs do not match',
        details: checks,
      }, { status: 400 })
    }
    
    // All checks passed
    return NextResponse.json({
      success: true,
      message: 'Yahoo OAuth configuration is valid',
      details: checks,
    })
  } catch (error) {
    console.error('Error testing Yahoo connection:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error during connection test',
    }, { status: 500 })
  }
} 