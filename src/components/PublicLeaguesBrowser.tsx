'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { League } from '@/lib/types/fantasy'
import { Trophy, Users, Filter, ArrowRight, Loader2, Check } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'

interface PublicLeaguesBrowserProps {
  initialLeagues?: League[]
}

export default function PublicLeaguesBrowser({ initialLeagues = [] }: PublicLeaguesBrowserProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [leagues, setLeagues] = useState<League[]>(initialLeagues)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [selectedSport, setSelectedSport] = useState<string>('')
  const [selectedTeamSizes, setSelectedTeamSizes] = useState<number[]>([])
  
  // Available options for filters
  const sportOptions = [
    { value: '', label: 'All Sports' },
    { value: 'football', label: 'Football' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'baseball', label: 'Baseball' },
    { value: 'hockey', label: 'Hockey' }
  ]
  
  const teamSizeOptions = [
    { value: 8, label: '8 Teams' },
    { value: 10, label: '10 Teams' },
    { value: 12, label: '12 Teams' },
    { value: 14, label: '14 Teams' }
  ]
  
  useEffect(() => {
    if (user) {
      fetchLeagues()
    } else {
      setLeagues(initialLeagues)
      setLoading(false)
    }
  }, [selectedSport, selectedTeamSizes, user, initialLeagues])
  
  const fetchLeagues = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // Build the query parameters
      const params = new URLSearchParams()
      
      if (selectedSport) {
        params.append('sport', selectedSport)
      }
      
      if (selectedTeamSizes.length > 0) {
        params.append('teamSizes', selectedTeamSizes.join(','))
      }
      
      const response = await fetch(`/api/yahoo/public-leagues?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`)
      }
      
      const data = await response.json()
      setLeagues(data.leagues || [])
    } catch (err) {
      console.error('Error fetching public leagues:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch leagues')
    } finally {
      setLoading(false)
    }
  }
  
  const handleChallenge = (league: League) => {
    if (!user) {
      alert('Please sign in to challenge leagues')
      router.push('/login?redirect=/leagues/public')
      return
    }
    
    // Navigate to the challenge page with the league info
    router.push(`/leagues/challenge/${league.id}`)
  }
  
  const handleSportChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSport(e.target.value)
  }
  
  const handleTeamSizeToggle = (size: number) => {
    setSelectedTeamSizes(prev => {
      if (prev.includes(size)) {
        return prev.filter(s => s !== size)
      } else {
        return [...prev, size]
      }
    })
  }
  
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="text-lg font-medium">Filter Leagues</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-1">
              Sport
            </label>
            <select
              id="sport"
              value={selectedSport}
              onChange={handleSportChange}
              className="w-full px-3 py-2 pl-4 pr-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {sportOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-1">
              Team Size
            </p>
            <div className="flex flex-wrap gap-2">
              {teamSizeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleTeamSizeToggle(option.value)}
                  className={`px-3 py-1 text-sm border rounded-full ${
                    selectedTeamSizes.includes(option.value)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* League List */}
      <div>
        <h2 className="text-xl font-bold mb-4">Available Public Leagues</h2>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-500">Loading leagues...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchLeagues}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : leagues.length === 0 ? (
          <div className="p-6 bg-white rounded-lg shadow text-center">
            <p className="text-gray-500">No leagues found matching your filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leagues.map(league => (
              <div key={league.id} className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{league.name}</h3>
                    {league.record && (
                      <p className="text-sm text-gray-500 mb-2">Record: {league.record}</p>
                    )}
                    <p className="text-gray-600 mb-2">{league.description}</p>
                    
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center text-gray-700">
                        <Trophy className="h-4 w-4 mr-1 text-indigo-600" />
                        <span className="capitalize">{league.sport}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-700">
                        <Users className="h-4 w-4 mr-1 text-indigo-600" />
                        <span>{league.managerIds.length} Teams</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Link
                      href={`/leagues/public/${league.id}`}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 active:bg-indigo-800 shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                    >
                      View Details
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                    
                    <button
                      onClick={() => handleChallenge(league)}
                      className="px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Challenge
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}