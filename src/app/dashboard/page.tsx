'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../../lib/hooks/useAuth'
import { Trophy, Users, MessageSquare, Plus, ArrowRight } from 'lucide-react'
import { League, Challenge } from '../../lib/types/fantasy'
import { getLeaguesByManagerId, getChallengesByLeagueId } from '../../lib/services/fantasyService'
import ImportedYahooLeagues from '@/components/ImportedYahooLeagues'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const [leagues, setLeagues] = useState<League[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      
      try {
        // In a real app, we would first get the manager profile for the user
        // For now, we'll just use a placeholder manager ID
        const managerId = 'placeholder-manager-id'
        
        // Fetch leagues
        const userLeagues = await getLeaguesByManagerId(managerId)
        setLeagues(userLeagues)
        
        // Fetch challenges for all leagues
        const allChallenges = []
        for (const league of userLeagues) {
          const leagueChallenges = await getChallengesByLeagueId(league.id)
          allChallenges.push(...leagueChallenges)
        }
        
        setChallenges(allChallenges)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoadingData(false)
      }
    }
    
    if (!loading) {
      fetchData()
    }
  }, [user, loading])

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <p className="mb-6">Please sign in to access your dashboard.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container-default section-padding">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="page-header">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Manage your leagues and challenges</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link 
              href="/leagues/create" 
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create League
            </Link>
            <Link 
              href="/lobby" 
              className="btn btn-secondary"
            >
              Find Challenges
            </Link>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="feature-icon">
                <Trophy className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{leagues.length}</h3>
                <p className="text-gray-500">Active Leagues</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <div className="feature-icon">
                <Users className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{challenges.length}</h3>
                <p className="text-gray-500">Active Challenges</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <div className="feature-icon">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">0</h3>
                <p className="text-gray-500">Unread Messages</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Challenges */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Challenges</h2>
            <Link href="/challenges" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          {challenges.length > 0 ? (
            <div className="space-y-4">
              {challenges.slice(0, 3).map((challenge) => (
                <div key={challenge.id} className="card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Trophy className="h-5 w-5 text-indigo-600 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900">Challenge #{challenge.id}</h3>
                        <p className="text-sm text-gray-500">
                          Week {challenge.weekNumber}, Season {challenge.season}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      challenge.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                      challenge.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      challenge.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-6 text-center">
              <p className="text-gray-500 mb-4">You don't have any challenges yet.</p>
              <Link href="/lobby" className="btn btn-primary">
                Find Challenges
              </Link>
            </div>
          )}
        </div>
        
        {/* My Leagues */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">My Leagues</h2>
            <Link href="/leagues" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          {leagues.length > 0 ? (
            <div className="space-y-4">
              {leagues.slice(0, 3).map((league) => (
                <div key={league.id} className="card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Trophy className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium text-gray-900">{league.name}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{league.managerIds.length} teams</span>
                          <span className="mx-2">•</span>
                          <span>{league.sport}</span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/leagues/${league.id}`} className="btn btn-secondary text-sm">
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-6 text-center">
              <p className="text-gray-500 mb-4">You don't have any leagues yet.</p>
              <div className="flex justify-center space-x-4">
                <Link href="/leagues/create" className="btn btn-primary">
                  Create League
                </Link>
                <Link href="/leagues/yahoo-picker" className="btn btn-secondary">
                  Import from Yahoo
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Yahoo Fantasy Integration */}
        <ImportedYahooLeagues />
      </main>
    </div>
  )
} 