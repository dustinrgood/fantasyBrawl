import { NextResponse } from 'next/server'
import axios from 'axios'
import { db } from '@/lib/firebase/firebase'
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore'

export async function POST(request: Request) {
  try {
    const { userId, leagueKey } = await request.json()
    const origin = new URL(request.url).origin

    if (!userId || !leagueKey) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Get Yahoo tokens for the user
    const tokensResponse = await fetch(`${origin}/api/auth/yahoo/get-tokens?userId=${userId}`)
    
    if (!tokensResponse.ok) {
      console.error('Failed to get Yahoo tokens:', await tokensResponse.text())
      return NextResponse.json(
        { error: 'Failed to get Yahoo tokens' },
        { status: tokensResponse.status }
      )
    }
    
    const { tokens } = await tokensResponse.json()
    
    if (!tokens || !(tokens.access_token || tokens.accessToken)) {
      console.error('No valid Yahoo tokens found for user:', userId)
      return NextResponse.json(
        { error: 'No valid Yahoo tokens found' },
        { status: 401 }
      )
    }

    // Get the access token (handle both formats)
    const accessToken = tokens.access_token || tokens.accessToken

    // Check if the league is already imported
    const leaguesRef = collection(db, 'leagues')
    const q = query(
      leaguesRef, 
      where('yahooLeagueKey', '==', leagueKey),
      where('managerIds', 'array-contains', userId)
    )
    
    const existingLeagues = await getDocs(q)
    
    if (!existingLeagues.empty) {
      return NextResponse.json(
        { message: 'League already imported', leagueId: existingLeagues.docs[0].id },
        { status: 200 }
      )
    }

    // Fetch league details from Yahoo
    const leagueDetails = await fetchYahooLeagueDetails(accessToken, leagueKey)
    
    if (!leagueDetails) {
      return NextResponse.json(
        { error: 'Failed to fetch league details from Yahoo' },
        { status: 500 }
      )
    }

    // Create a new league document in Firestore
    const leagueId = `yahoo-${leagueDetails.league_id}`
    const leagueRef = doc(db, 'leagues', leagueId)
    
    await setDoc(leagueRef, {
      id: leagueId,
      name: leagueDetails.name,
      description: leagueDetails.short_name || 'Yahoo Fantasy NBA League',
      sport: 'basketball',
      season: leagueDetails.season || '2023-2024',
      managerIds: [userId], // Add the current user as a manager
      scoringSystem: { 
        type: leagueDetails.scoring_type || 'head', 
        description: leagueDetails.scoring_type === 'head' ? 'Head-to-Head' : 'Rotisserie' 
      },
      isPublic: leagueDetails.is_public === '1',
      createdAt: new Date().toISOString(),
      yahooLeagueKey: leagueKey,
      yahooLeagueId: leagueDetails.league_id,
      numTeams: leagueDetails.num_teams || 10,
      draftStatus: leagueDetails.draft_status || 'completed',
      logoUrl: leagueDetails.logo_url || null,
      commissioner: leagueDetails.commissioner || null,
      importedAt: new Date().toISOString(),
      importedBy: userId
    })

    return NextResponse.json({ 
      message: 'League imported successfully', 
      leagueId 
    })
  } catch (error) {
    console.error('Error importing Yahoo league:', error)
    return NextResponse.json(
      { error: 'Failed to import league' },
      { status: 500 }
    )
  }
}

async function fetchYahooLeagueDetails(accessToken: string, leagueKey: string) {
  try {
    // Yahoo Fantasy API endpoint for league metadata
    const url = `https://fantasysports.yahooapis.com/fantasy/v2/league/${leagueKey}/metadata?format=json`
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    
    // Extract league data from the response
    const leagueData = response.data?.fantasy_content?.league?.[0]
    
    if (!leagueData) {
      console.error('Unexpected response format from Yahoo API')
      return null
    }
    
    // Fetch commissioner info
    let commissionerInfo = null
    try {
      // Get settings to find commissioner team ID
      const settingsUrl = `https://fantasysports.yahooapis.com/fantasy/v2/league/${leagueKey}/settings?format=json`
      
      const settingsResponse = await axios.get(settingsUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      
      const commissionerTeamId = settingsResponse.data?.fantasy_content?.league?.[0]?.settings?.[0]?.commissioner_team_id
      
      if (commissionerTeamId) {
        // Fetch team info to get manager details
        const teamUrl = `https://fantasysports.yahooapis.com/fantasy/v2/team/${leagueKey}.t.${commissionerTeamId}/metadata?format=json`
        
        const teamResponse = await axios.get(teamUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
        
        const managerData = teamResponse.data?.fantasy_content?.team?.[0]?.[0]?.managers?.[0]?.manager
        
        if (managerData) {
          commissionerInfo = {
            name: managerData.nickname || 'Unknown',
            email: managerData.email || null,
            teamId: commissionerTeamId
          }
        }
      }
    } catch (err) {
      console.error('Error fetching commissioner info:', err)
    }
    
    // Return the league details with commissioner info
    return {
      ...leagueData,
      commissioner: commissionerInfo
    }
  } catch (error) {
    console.error('Error fetching Yahoo league details:', error)
    return null
  }
} 