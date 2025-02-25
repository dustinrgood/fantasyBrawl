'use client'

import { useState, useEffect } from 'react'
import { useYahooFantasy } from '@/lib/hooks/useYahooFantasy'
import { fetchLeagueDetails } from '@/lib/services/yahooFantasyClient'

interface YahooLeagueDetailsProps {
  leagueKey: string
  onBack?: () => void
}

// Define interfaces for the response data
interface LeagueDetails {
  name: string
  season: string
  num_teams: number
  scoring_type: string
  [key: string]: any
}

interface TeamStandings {
  rank: number
  playoff_seed: number
  outcome_totals: {
    wins: number
    losses: number
    ties: number
    percentage: string
  }
  points_for: number
  points_against: number
}

interface Team {
  team_key: string
  team_id: string
  name: string
  team_standings: TeamStandings
  [key: string]: any
}

interface LeagueResponse {
  details: LeagueDetails
  standings: {
    teams?: Team[]
    [key: string]: any
  }
}

export default function YahooLeagueDetails({ leagueKey, onBack }: YahooLeagueDetailsProps) {
  const { isLoading: isYahooLoading } = useYahooFantasy()
  const [leagueDetails, setLeagueDetails] = useState<LeagueDetails | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchDetails = async () => {
      if (!leagueKey) return
      
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch league details using the Yahoo Fantasy client
        const data = await fetchLeagueDetails(leagueKey) as LeagueResponse
        
        if (data) {
          console.log('League details:', data)
          
          // Set league details
          if (data.details) {
            setLeagueDetails(data.details as LeagueDetails)
          }
          
          // Extract teams from standings
          if (data.standings && Array.isArray(data.standings.teams)) {
            setTeams(data.standings.teams as Team[])
          }
        }
        
        setIsLoading(false)
      } catch (err) {
        console.error('Error fetching league details:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch league details')
        setIsLoading(false)
      }
    }
    
    fetchDetails()
  }, [leagueKey])
  
  if (isYahooLoading || isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Loading League Details</h2>
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              &larr; Back to Leagues
            </button>
          )}
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Error Loading League</h2>
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              &larr; Back to Leagues
            </button>
          )}
        </div>
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }
  
  if (!leagueDetails) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">No League Data</h2>
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              &larr; Back to Leagues
            </button>
          )}
        </div>
        <p className="text-gray-600">No data available for this league.</p>
      </div>
    )
  }
  
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{leagueDetails.name}</h2>
        {onBack && (
          <button
            onClick={onBack}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            &larr; Back to Leagues
          </button>
        )}
      </div>
      
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Season</h3>
            <p className="mt-1 text-lg font-semibold">{leagueDetails.season}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Teams</h3>
            <p className="mt-1 text-lg font-semibold">{leagueDetails.num_teams}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Scoring Type</h3>
            <p className="mt-1 text-lg font-semibold">{leagueDetails.scoring_type}</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Team Standings</h3>
        
        {teams.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">W-L-T</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teams.map((team, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{team.team_standings.rank}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {team.team_standings.outcome_totals.wins}-
                      {team.team_standings.outcome_totals.losses}-
                      {team.team_standings.outcome_totals.ties}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{team.team_standings.points_for.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No team data available.</p>
        )}
      </div>
    </div>
  )
} 