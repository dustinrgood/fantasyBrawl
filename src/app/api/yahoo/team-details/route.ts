import { NextRequest, NextResponse } from 'next/server';
import { createYahooFantasyService } from '@/lib/services/yahooFantasyServices';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamKey = searchParams.get('teamKey');
    const userId = searchParams.get('userId');
    
    console.debug('team-details API called with:', { 
      teamKey, 
      userId: userId ? `${userId.substring(0, 5)}...` : 'missing'
    });
    
    if (!teamKey) {
      console.debug('Missing teamKey parameter');
      return NextResponse.json({ 
        error: 'Team key is required' 
      }, { status: 400 });
    }
    
    if (!userId) {
      console.debug('Missing userId parameter');
      return NextResponse.json({ 
        error: 'User ID is required' 
      }, { status: 400 });
    }
    
    console.debug(`Fetching team details for: ${teamKey}`);
    
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
      
      // Get team details
      console.debug('Calling yahooService.getTeamDetails');
      const teamDetails = await yahooService.getTeamDetails(teamKey);
      
      if (!teamDetails) {
        console.debug('No team details found for:', teamKey);
        return NextResponse.json({ 
          error: 'Team not found' 
        }, { status: 404 });
      }
      
      console.debug('Successfully retrieved team details');
      
      return NextResponse.json({ 
        team: teamDetails 
      });
    } catch (serviceError) {
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
            error: 'Team not found. Please check the team key and try again.',
            details: serviceError.message
          }, { status: 404 });
        }
        
        // Generic service error
        return NextResponse.json({
          error: 'Failed to fetch team details from Yahoo Fantasy',
          details: serviceError.message,
          stack: serviceError.stack
        }, { status: 500 });
      }
      
      // Re-throw to be caught by the outer catch
      throw serviceError;
    }
  } catch (error) {
    console.error('Unhandled error in team-details API:', error);
    
    // Log the full error for debugging
    console.error('Full error details:', JSON.stringify(error, null, 2));
    
    if (error instanceof Error) {
      return NextResponse.json({
        error: 'Failed to fetch team details',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, { status: 500 });
    }
    
    return NextResponse.json({
      error: 'Failed to fetch team details',
      details: 'Unknown error occurred'
    }, { status: 500 });
  }
}