'use client'

import { useState, useEffect } from 'react'
import { useYahooFantasy } from '@/lib/hooks/useYahooFantasy'
import { fetchLeagueDetails } from '@/lib/services/yahooFantasyClient'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy, Users, Calendar, Settings, Award, 
  BarChart2, FileText, Clock, ArrowLeft, 
  ChevronDown, ChevronUp, Info, Shield
} from 'lucide-react'
import Link from 'next/link'

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
  start_date?: string
  end_date?: string
  current_week?: number
  start_week?: number
  end_week?: number
  game_code?: string
  league_type?: string
  draft_status?: string
  draft_time?: string
  weekly_deadline?: string
  is_finished?: boolean
  settings?: {
    roster_positions?: any[]
    stat_categories?: {
      stats?: any[]
    }
    max_teams?: number
    waiver_type?: string
    uses_playoff?: boolean
    playoff_start_week?: number
    uses_playoff_reseeding?: boolean
    uses_lock_eliminated_teams?: boolean
    num_playoff_teams?: number
    has_playoff_consolation_games?: boolean
  }
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
  url?: string
  team_logo?: string
  waiver_priority?: number
  number_of_moves?: number
  number_of_trades?: number
  managers?: any[]
  team_standings: TeamStandings
  [key: string]: any
}

interface LeagueResponse {
  details: LeagueDetails
  standings: {
    teams?: Team[]
    [key: string]: any
  }
  settings?: any
  scoreboard?: any
  transactions?: any
  draftResults?: any
}

export default function YahooLeagueDetails({ leagueKey, onBack }: YahooLeagueDetailsProps) {
  const { isLoading: isYahooLoading } = useYahooFantasy()
  const [leagueDetails, setLeagueDetails] = useState<LeagueDetails | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null)
  
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
            
            // Extract settings if available
            if (data.details.settings) {
              setSettings(data.details.settings)
            }
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
  
  const toggleTeamExpand = (teamKey: string) => {
    if (expandedTeam === teamKey) {
      setExpandedTeam(null)
    } else {
      setExpandedTeam(teamKey)
    }
  }
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (e) {
      return dateString
    }
  }
  
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
              <ArrowLeft className="h-4 w-4 inline mr-1" />
              Back to Leagues
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
              <ArrowLeft className="h-4 w-4 inline mr-1" />
              Back to Leagues
            </button>
          )}
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <p className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            {error}
          </p>
          <p className="mt-2 text-sm">
            This could be due to expired tokens or issues with the Yahoo Fantasy API. 
            Try refreshing the page or checking your Yahoo Fantasy account.
          </p>
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
              <ArrowLeft className="h-4 w-4 inline mr-1" />
              Back to Leagues
            </button>
          )}
        </div>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-md">
          <p className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            No data available for this league.
          </p>
          <p className="mt-2 text-sm">
            This could be because:
          </p>
          <ul className="list-disc ml-6 mt-1 text-sm">
            <li>The league may not be active or may have been deleted</li>
            <li>You may not have permission to view this league</li>
            <li>There might be an issue with the Yahoo Fantasy API</li>
            <li>Your Yahoo authentication may need to be refreshed</li>
          </ul>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{leagueDetails.name}</h2>
          <p className="text-gray-500">
            {leagueDetails.game_code?.toUpperCase() || 'Fantasy'} • {leagueDetails.season} Season
            {leagueDetails.is_finished && <span className="ml-2 text-amber-600">(Completed)</span>}
          </p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md"
          >
            <ArrowLeft className="h-4 w-4 inline mr-1" />
            Back to Leagues
          </button>
        )}
      </div>
      
      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="flex items-center">
            <Info className="h-4 w-4 mr-1" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="standings" className="flex items-center">
            <Trophy className="h-4 w-4 mr-1" />
            Standings
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center mb-2">
                  <Trophy className="h-5 w-5 text-indigo-600 mr-2" />
                  <h3 className="text-sm font-medium text-gray-500">League Info</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">League Type:</span>
                    <span className="font-medium capitalize">{leagueDetails.league_type || 'Private'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Teams:</span>
                    <span className="font-medium">{leagueDetails.num_teams}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Scoring Type:</span>
                    <span className="font-medium capitalize">{leagueDetails.scoring_type || 'Head-to-Head'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">{leagueDetails.is_finished ? 'Completed' : 'Active'}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 text-indigo-600 mr-2" />
                  <h3 className="text-sm font-medium text-gray-500">Season Timeline</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium">{formatDate(leagueDetails.start_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">End Date:</span>
                    <span className="font-medium">{formatDate(leagueDetails.end_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Week:</span>
                    <span className="font-medium">{leagueDetails.current_week || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Weeks:</span>
                    <span className="font-medium">{leagueDetails.end_week || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center mb-2">
                  <FileText className="h-5 w-5 text-indigo-600 mr-2" />
                  <h3 className="text-sm font-medium text-gray-500">Draft Information</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Draft Status:</span>
                    <span className="font-medium capitalize">{leagueDetails.draft_status || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Draft Date:</span>
                    <span className="font-medium">{leagueDetails.draft_time ? formatDate(leagueDetails.draft_time) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weekly Deadline:</span>
                    <span className="font-medium capitalize">{leagueDetails.weekly_deadline || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {settings?.roster_positions && (
            <div className="bg-indigo-50 p-4 rounded-md mb-6 border border-indigo-200">
              <div className="flex items-center mb-4">
                <Users className="h-5 w-5 text-indigo-600 mr-2" />
                <h3 className="text-md font-medium">Roster Configuration</h3>
              </div>
              
              <div className="mb-3">
                <h4 className="text-sm font-medium text-indigo-700 mb-2">Starting Positions</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {settings.roster_positions
                    .filter((position: any) => !['BN', 'IR', 'Bench', 'IL', 'Reserve'].includes(position.position))
                    .map((position: any, index: number) => (
                      <div key={index} className="bg-white p-2 rounded border border-indigo-300 flex justify-between items-center">
                        <span className="text-sm font-medium">{position.position}</span>
                        <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">{position.count}</span>
                      </div>
                    ))}
                </div>
                <p className="mt-3 text-sm text-indigo-700">
                  <Info className="h-4 w-4 inline mr-1" />
                  Only starting positions are used for league matching.
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Bench & Reserve</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {settings.roster_positions
                    .filter((position: any) => ['BN', 'IR', 'Bench', 'IL', 'Reserve'].includes(position.position))
                    .map((position: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-2 rounded border border-gray-200 flex justify-between items-center">
                        <span className="text-sm font-medium">{position.position}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{position.count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="standings">
          {teams.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">W-L-T</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Win %</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points For</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points Against</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teams.map((team, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {team.team_standings.rank}
                        {team.team_standings.playoff_seed <= 4 && (
                          <span className="ml-1 text-xs text-green-600 font-medium">(Playoff)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          {team.team_logo && (
                            <img src={team.team_logo} alt="Team Logo" className="h-6 w-6 mr-2 rounded-full" />
                          )}
                          <span>{team.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {team.team_standings.outcome_totals.wins}-
                        {team.team_standings.outcome_totals.losses}-
                        {team.team_standings.outcome_totals.ties}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {team.team_standings.outcome_totals.percentage}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof team.team_standings.points_for === 'number' 
                          ? team.team_standings.points_for.toFixed(2) 
                          : team.team_standings.points_for}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof team.team_standings.points_against === 'number' 
                          ? team.team_standings.points_against.toFixed(2) 
                          : team.team_standings.points_against}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No standings data available.</p>
          )}
        </TabsContent>
        
        <TabsContent value="teams">
          {teams.length > 0 ? (
            <div className="space-y-4">
              {teams.map((team, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleTeamExpand(team.team_key)}
                  >
                    <div className="flex items-center">
                      {team.team_logo && (
                        <img src={team.team_logo} alt="Team Logo" className="h-10 w-10 mr-3 rounded-full" />
                      )}
                      <div>
                        <h3 className="font-medium">{team.name}</h3>
                        <p className="text-sm text-gray-500">
                          Rank: {team.team_standings.rank} • Record: {team.team_standings.outcome_totals.wins}-
                          {team.team_standings.outcome_totals.losses}-
                          {team.team_standings.outcome_totals.ties}
                        </p>
                      </div>
                    </div>
                    {expandedTeam === team.team_key ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  
                  {expandedTeam === team.team_key && (
                    <div className="p-4 bg-gray-50 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Team Stats</h4>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Points For:</span>
                              <span className="text-sm font-medium">
                                {typeof team.team_standings.points_for === 'number' 
                                  ? team.team_standings.points_for.toFixed(2) 
                                  : team.team_standings.points_for}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Points Against:</span>
                              <span className="text-sm font-medium">
                                {typeof team.team_standings.points_against === 'number' 
                                  ? team.team_standings.points_against.toFixed(2) 
                                  : team.team_standings.points_against}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Win Percentage:</span>
                              <span className="text-sm font-medium">{team.team_standings.outcome_totals.percentage}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Playoff Seed:</span>
                              <span className="text-sm font-medium">{team.team_standings.playoff_seed}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Team Activity</h4>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Waiver Priority:</span>
                              <span className="text-sm font-medium">{team.waiver_priority || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Moves Made:</span>
                              <span className="text-sm font-medium">{team.number_of_moves || '0'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Trades Made:</span>
                              <span className="text-sm font-medium">{team.number_of_trades || '0'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {team.managers && team.managers.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Managers</h4>
                          <div className="space-y-2">
                            {team.managers.map((manager: any, idx: number) => (
                              <div key={idx} className="flex items-center">
                                <Shield className="h-4 w-4 text-indigo-500 mr-2" />
                                <span className="text-sm">{manager.nickname || manager.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {team.url && (
                        <div className="mt-4">
                          <a 
                            href={team.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            View on Yahoo Fantasy
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No team data available.</p>
          )}
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="space-y-6">
            {settings && (
              <>
                {settings.roster_positions && (
                  <div className="bg-indigo-50 p-4 rounded-md border border-indigo-200">
                    <div className="flex items-center mb-4">
                      <Users className="h-5 w-5 text-indigo-600 mr-2" />
                      <h3 className="text-md font-medium">Roster Positions</h3>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-indigo-700 mb-2">Starting Positions</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {settings.roster_positions
                          .filter((position: any) => !['BN', 'IR', 'Bench', 'IL', 'Reserve'].includes(position.position))
                          .map((position: any, index: number) => (
                            <div key={index} className="bg-white p-2 rounded border border-indigo-300 flex justify-between items-center">
                              <span className="text-sm font-medium">{position.position}</span>
                              <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">{position.count}</span>
                            </div>
                          ))}
                      </div>
                      <p className="mt-3 text-sm text-indigo-700">
                        <Info className="h-4 w-4 inline mr-1" />
                        Only starting positions are used for league matching.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Bench & Reserve</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {settings.roster_positions
                          .filter((position: any) => ['BN', 'IR', 'Bench', 'IL', 'Reserve'].includes(position.position))
                          .map((position: any, index: number) => (
                            <div key={index} className="bg-gray-50 p-2 rounded border border-gray-200 flex justify-between items-center">
                              <span className="text-sm font-medium">{position.position}</span>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{position.count}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center mb-4">
                    <Settings className="h-5 w-5 text-indigo-600 mr-2" />
                    <h3 className="text-md font-medium">League Settings</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Teams:</span>
                        <span className="font-medium">{settings.max_teams || leagueDetails.num_teams}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Waiver Type:</span>
                        <span className="font-medium capitalize">{settings.waiver_type || 'Standard'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Uses Playoffs:</span>
                        <span className="font-medium">{settings.uses_playoff ? 'Yes' : 'No'}</span>
                      </div>
                      {settings.uses_playoff && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Playoff Teams:</span>
                            <span className="font-medium">{settings.num_playoff_teams || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Playoff Start Week:</span>
                            <span className="font-medium">{settings.playoff_start_week || 'N/A'}</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="space-y-2">
                      {settings.uses_playoff && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Playoff Reseeding:</span>
                            <span className="font-medium">{settings.uses_playoff_reseeding ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Lock Eliminated Teams:</span>
                            <span className="font-medium">{settings.uses_lock_eliminated_teams ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Consolation Games:</span>
                            <span className="font-medium">{settings.has_playoff_consolation_games ? 'Yes' : 'No'}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-700 flex items-start">
                      <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Note about scoring:</strong> While your Yahoo league may have custom scoring settings, 
                        League Brawl uses standardized scoring across all leagues to ensure fair competition.
                      </span>
                    </p>
                  </div>
                </div>
              </>
            )}
            
            {!settings && (
              <p className="text-gray-600">No detailed settings available for this league.</p>
            )}
            
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">
                <Info className="h-4 w-4 inline mr-1" />
                Some settings may not be available depending on the league configuration and Yahoo API limitations.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 