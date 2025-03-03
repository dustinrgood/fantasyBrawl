import { NextResponse } from 'next/server'

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

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')
    const teamSizesParam = searchParams.get('teamSizes')
    
    // Filter leagues based on query parameters
    let filteredLeagues = [...MOCK_PUBLIC_LEAGUES]
    
    if (sport) {
      filteredLeagues = filteredLeagues.filter(league => 
        league.sport.toLowerCase() === sport.toLowerCase()
      )
    }
    
    if (teamSizesParam) {
      const teamSizes = teamSizesParam.split(',').map(size => parseInt(size))
      filteredLeagues = filteredLeagues.filter(league => 
        teamSizes.includes(league.managerIds.length)
      )
    }
    
    // Return the filtered leagues
    return NextResponse.json({ leagues: filteredLeagues })
  } catch (error) {
    console.error('Error fetching public leagues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch public leagues' },
      { status: 500 }
    )
  }
} 