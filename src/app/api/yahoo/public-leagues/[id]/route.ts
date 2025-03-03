import { NextRequest, NextResponse } from 'next/server'

// Mock data for public leagues
const MOCK_PUBLIC_LEAGUES = [
  {
    id: 'public-league-1',
    name: 'Fantasy Football Pro',
    description: 'Competitive fantasy football league with standard scoring',
    sport: 'football',
    season: '2023',
    managerIds: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10'],
    scoringSystem: { type: 'standard', description: 'Standard Scoring' },
    isPublic: true,
    createdAt: '2023-08-15T10:30:00Z'
  },
  {
    id: 'public-league-2',
    name: 'Basketball Champions',
    description: 'Fantasy basketball league with head-to-head points scoring',
    sport: 'basketball',
    season: '2023-2024',
    managerIds: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8'],
    scoringSystem: { type: 'points', description: 'Head-to-Head Points' },
    isPublic: true,
    createdAt: '2023-09-20T14:15:00Z'
  },
  {
    id: 'public-league-3',
    name: 'Baseball Legends',
    description: 'Fantasy baseball league with rotisserie scoring',
    sport: 'baseball',
    season: '2023',
    managerIds: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10', 'user11', 'user12'],
    scoringSystem: { type: 'roto', description: 'Rotisserie' },
    isPublic: true,
    createdAt: '2023-03-10T09:45:00Z'
  },
  {
    id: 'public-league-4',
    name: 'Hockey Elite',
    description: 'Fantasy hockey league with advanced scoring',
    sport: 'hockey',
    season: '2023-2024',
    managerIds: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10'],
    scoringSystem: { type: 'advanced', description: 'Advanced Scoring' },
    isPublic: true,
    createdAt: '2023-10-01T16:00:00Z'
  },
  {
    id: 'public-league-5',
    name: 'Football Dynasty',
    description: 'Multi-year dynasty fantasy football league',
    sport: 'football',
    season: '2023',
    managerIds: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10', 'user11', 'user12'],
    scoringSystem: { type: 'standard', description: 'Standard Scoring' },
    isPublic: true,
    createdAt: '2023-07-05T11:20:00Z'
  }
]

// Define the type for league details
interface LeagueDetails {
  leagueInfo: {
    current_week: number;
    start_week: number;
    end_week: number;
    current_season: string;
    draft_status: string;
    draft_date: string;
    draft_type: string;
    league_type: string;
    scoring_type: string;
    num_playoff_teams: number;
    playoff_start_week: number;
  };
  managers: Array<{
    id: string;
    name: string;
    team_name: string;
  }>;
}

// Mock additional details for leagues with proper type annotation
const MOCK_LEAGUE_DETAILS: Record<string, LeagueDetails> = {
  'public-league-1': {
    leagueInfo: {
      current_week: 12,
      start_week: 1,
      end_week: 17,
      current_season: '2023',
      draft_status: 'completed',
      draft_date: '2023-08-28',
      draft_type: 'live',
      league_type: 'public',
      scoring_type: 'standard',
      num_playoff_teams: 6,
      playoff_start_week: 15,
    },
    managers: [
      { id: 'user1', name: 'John Smith', team_name: 'Victory Voyagers' },
      { id: 'user2', name: 'Sarah Johnson', team_name: 'Touchdown Terminators' },
      { id: 'user3', name: 'Mike Williams', team_name: 'Gridiron Giants' },
      { id: 'user4', name: 'Emily Davis', team_name: 'Field Fighters' },
      { id: 'user5', name: 'David Brown', team_name: 'Pigskin Patriots' },
      { id: 'user6', name: 'Jessica Wilson', team_name: 'Tackle Titans' },
      { id: 'user7', name: 'Chris Moore', team_name: 'Red Zone Raiders' },
      { id: 'user8', name: 'Amanda Taylor', team_name: 'Blitz Brigade' },
      { id: 'user9', name: 'Ryan Anderson', team_name: 'Spiral Specialists' },
      { id: 'user10', name: 'Lauren Thomas', team_name: 'Endzone Enforcers' }
    ]
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leagueId = params.id
    
    if (!leagueId) {
      return NextResponse.json({ 
        error: 'League ID is required' 
      }, { status: 400 })
    }
    
    console.log(`Public league details request for ID: ${leagueId}`)
    
    // Find the league in our mock data
    const league = MOCK_PUBLIC_LEAGUES.find(l => l.id === leagueId)
    
    if (!league) {
      return NextResponse.json({ 
        error: 'League not found' 
      }, { status: 404 })
    }
    
    // Get additional details if available
    const details = MOCK_LEAGUE_DETAILS[leagueId] || {}
    
    // Return the league with details
    return NextResponse.json({ 
      league: {
        ...league,
        details
      }
    })
  } catch (error) {
    console.error('Error in public league details API:', error)
    
    return NextResponse.json({
      error: 'Failed to fetch league details',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 