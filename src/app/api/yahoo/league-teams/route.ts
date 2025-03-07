import { NextRequest, NextResponse } from 'next/server';
import { createYahooFantasyService } from '@/lib/services/yahooFantasyServices';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueKey = searchParams.get('leagueKey');
    const userId = searchParams.get('userId');
    
    console.debug('league-teams API called with:', { 
      leagueKey, 
      userId: userId ? `${userId.substring(0, 5)}...` : 'missing'
    });
    
    if (!leagueKey) {
      console.debug('Missing leagueKey parameter');
      return NextResponse.json({ 
        error: 'League key is required' 
      }, { status: 400 });
    }
    
    if (!userId) {
      console.debug('Missing userId parameter');
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }
    
    console.debug(`Fetching teams for league: ${leagueKey}`);
    
    try {
      // Create Yahoo Fantasy service for the user
      const yahooService = createYahooFantasyService(userId);
      
      // Check if user has Yahoo tokens
      const hasTokens = await yahooService.hasYahooTokens();
      if (!hasTokens) {
        console.error('No Yahoo tokens found for user:', userId);
        return NextResponse.json({
          error: 'You are not connected to Yahoo Fantasy. Please connect your account.',
          details: 'No Yahoo tokens found in user profile'
        }, { status: 401 });
      }
      
      // First, try to get basic league details to verify the league exists
      console.debug('Verifying league exists by fetching basic details');
      try {
        await yahooService.getLeagueDetails(leagueKey);
      } catch (leagueError: any) {
        console.error('Error verifying league exists:', leagueError);
        
        if (leagueError.response?.status === 400) {
          return NextResponse.json({
            error: 'League not found or you do not have permission to access it.',
            details: leagueError.message
          }, { status: 404 });
        }
        
        // If it's not a 400 error, we'll continue and try to get the teams anyway
        console.debug('Continuing to fetch teams despite league details error');
      }
      
      // Get teams directly using the new method
      console.debug('Calling yahooService.getLeagueTeams');
      const teams = await yahooService.getLeagueTeams(leagueKey);
      
      if (!teams || teams.length === 0) {
        console.debug('No teams found for league:', leagueKey);
        return NextResponse.json({ 
          teams: [] 
        });
      }
      
      console.debug(`Found ${teams.length} teams for league: ${leagueKey}`);
      
      return NextResponse.json({ 
        teams: teams 
      });
    } catch (serviceError: any) {
      console.error('Error in Yahoo Fantasy service:', serviceError);
      
      // Log the full error for debugging
      console.error('Full error details:', JSON.stringify(serviceError, null, 2));
      
      if (serviceError instanceof Error) {
        // Handle specific Yahoo service errors
        if (serviceError.message.includes('No Yahoo tokens found')) {
          return NextResponse.json({
            error: 'You are not connected to Yahoo Fantasy. Please connect your account.',
            details: serviceError.message
          }, { status: 401 });
        }
        
        if (serviceError.message.includes('invalid_grant')) {
          return NextResponse.json({
            error: 'Your Yahoo connection has expired. Please reconnect your account.',
            details: serviceError.message
          }, { status: 401 });
        }
        
        if (serviceError.message.includes('404') || serviceError.message.includes('not found')) {
          return NextResponse.json({
            error: 'League not found. Please check the league key and try again.',
            details: serviceError.message
          }, { status: 404 });
        }
        
        if (serviceError.message.includes('400') || serviceError.message.includes('Bad Request')) {
          return NextResponse.json({
            error: 'Unable to access this league. You may not have permission or the league key is invalid.',
            details: serviceError.message
          }, { status: 400 });
        }
        
        // Generic service error
        return NextResponse.json({
          error: 'Failed to fetch league teams from Yahoo Fantasy',
          details: serviceError.message,
          stack: serviceError.stack
        }, { status: 500 });
      }
      
      // Re-throw to be caught by the outer catch
      throw serviceError;
    }
  } catch (error: any) {
    console.error('Unhandled error in league-teams API:', error);
    
    // Log the full error for debugging
    console.error('Full error details:', JSON.stringify(error, null, 2));
    
    if (error instanceof Error) {
      return NextResponse.json({
        error: 'Failed to fetch league teams',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, { status: 500 });
    }
    
    return NextResponse.json({
      error: 'Failed to fetch league teams',
      details: 'Unknown error occurred'
    }, { status: 500 });
  }
}