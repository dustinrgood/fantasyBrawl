import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const YAHOO_CLIENT_ID = process.env.NEXT_PUBLIC_YAHOO_CLIENT_ID;
    const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/yahoo/callback`;
    
    if (!YAHOO_CLIENT_ID) {
      return NextResponse.json({ 
        error: 'Yahoo client ID not configured' 
      }, { status: 500 });
    }
    
    if (!REDIRECT_URI) {
      return NextResponse.json({ 
        error: 'Redirect URI not configured' 
      }, { status: 500 });
    }
    
    const authUrl = new URL('https://api.login.yahoo.com/oauth2/request_auth');
    authUrl.searchParams.append('client_id', YAHOO_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('language', 'en-us');
    
    return NextResponse.json({ 
      url: authUrl.toString() 
    });
  } catch (error) {
    console.error('Error generating Yahoo auth URL:', error);
    
    return NextResponse.json({ 
      error: 'Failed to generate Yahoo auth URL' 
    }, { status: 500 });
  }
} 