'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Trophy, Clock, CheckCircle, XCircle } from 'lucide-react'

interface Challenge {
  id: string
  leagueId: string
  wagerType: 'points' | 'money'
  wagerAmount: number
  challengerId: string
  status: 'pending' | 'active' | 'completed'
  createdAt: any
  leagueName?: string
  sport?: string
  teamCount?: number
}

export default function ChallengesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    fetchChallenges()
  }, [user])

  const fetchChallenges = async () => {
    try {
      const response = await fetch(`/api/challenges?userId=${user?.uid}`)
      if (!response.ok) {
        throw new Error('Failed to fetch challenges')
      }

      const data = await response.json()
      setChallenges(data.challenges)
    } catch (err) {
      console.error('Error fetching challenges:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch challenges')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'active':
        return <Trophy className="h-5 w-5 text-green-500" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      default:
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-red-50 text-red-700 border-red-200'
    }
  }

  return (
    <div className="container-default py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Challenges</h1>
          <p className="text-gray-600 mt-1">View and manage your league challenges</p>
        </div>
        <button
          onClick={() => router.push('/leagues/public')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Trophy className="h-5 w-5" />
          New Challenge
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : challenges.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <Trophy className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Challenges</h2>
          <p className="text-gray-600 mb-6">Start your first challenge by finding a league to compete with!</p>
          <button
            onClick={() => router.push('/leagues/public')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            Browse Public Leagues
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  {getStatusIcon(challenge.status)}
                  <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(challenge.status)}`}>
                    {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    League {challenge.leagueName || challenge.leagueId}
                  </h3>
                  <p className="text-gray-600">Fantasy League</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-indigo-500" />
                      Wager: {challenge.wagerType === 'points' 
                        ? `${challenge.wagerAmount} Points` 
                        : `$${challenge.wagerAmount}`}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      Created {new Date(challenge.createdAt?.seconds * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/challenges/${challenge.id}`)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 