'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Trophy, ArrowLeft, Users, MessageSquare, Calendar, User } from 'lucide-react'
import Link from 'next/link'

// Mock challenge data
const mockChallenges = {
  'challenge-1': {
    homeLeague: 'Fantasy Football League',
    awayLeague: 'Touchdown Titans',
    week: 12,
    season: '2023-2024',
    status: 'Active',
    currentScore: '5-5',
    homeTeams: 10,
    awayTeams: 10,
    startDate: 'Nov 24, 2023',
    endDate: 'Dec 1, 2023',
    description: 'A head-to-head challenge between two competitive fantasy football leagues to determine which league has the stronger managers.',
    rules: [
      'Each manager from the home league is matched against a manager from the away league.',
      'The league with the most individual matchup wins takes the overall victory.',
      'In case of a tie in individual matchups, the league with the highest total points wins.',
      'Challenge results are updated after all games for the week are completed.',
      'Trash talk is encouraged but must remain respectful.'
    ]
  },
  'challenge-2': {
    homeLeague: 'Basketball Champions',
    awayLeague: 'Hoop Dreams',
    week: 18,
    season: '2023-2024',
    status: 'Pending',
    currentScore: '0-0',
    homeTeams: 8,
    awayTeams: 8,
    startDate: 'Dec 15, 2023',
    endDate: 'Dec 22, 2023',
    description: 'A friendly competition between two basketball fantasy leagues to see which league has the better fantasy managers.',
    rules: [
      'Each manager from the home league is matched against a manager from the away league.',
      'The league with the most individual matchup wins takes the overall victory.',
      'In case of a tie in individual matchups, the league with the highest total points wins.',
      'Challenge results are updated after all games for the week are completed.',
      'Trash talk is encouraged but must remain respectful.'
    ]
  }
}

export default function ChallengeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading } = useAuth()
  const [challengeDetails, setChallengeDetails] = useState<any>(null)
  const challengeId = params?.challengeId as string

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=/challenges/${challengeId}`)
    }
  }, [user, loading, router, challengeId])

  // In a real app, you would fetch the challenge details based on the challenge ID
  useEffect(() => {
    // This would be replaced with an actual API call
    const fetchChallengeData = async () => {
      // For now, we're using mock data
      if (challengeId && mockChallenges[challengeId as keyof typeof mockChallenges]) {
        setChallengeDetails(mockChallenges[challengeId as keyof typeof mockChallenges])
      } else {
        // Handle case where challenge doesn't exist
        router.push('/challenges')
      }
    }

    if (challengeId) {
      fetchChallengeData()
    }
  }, [challengeId, router])

  if (loading || !challengeDetails) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  const isActive = challengeDetails.status === 'Active'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      
      <main className="container-default py-8">
        <div className="mb-6">
          <Link href="/challenges" className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Challenges
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900 mr-3">
                  {challengeDetails.homeLeague} vs. {challengeDetails.awayLeague}
                </h1>
                <span className={`px-3 py-1 ${isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} rounded-full text-sm font-medium`}>
                  {challengeDetails.status}
                </span>
              </div>
              <p className="text-gray-600 mt-1">
                Week {challengeDetails.week} • {challengeDetails.season}
              </p>
            </div>
            
            {isActive && (
              <div className="mt-2 md:mt-0 flex items-center">
                <Trophy className="h-5 w-5 text-amber-500 mr-2" />
                <span className="font-semibold">Current Score: {challengeDetails.currentScore}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Challenge Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Challenge Information</h2>
              <p className="text-gray-700 mb-6">{challengeDetails.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <User className="h-5 w-5 text-indigo-500 mt-0.5 mr-2" />
                  <div>
                    <p className="font-medium text-gray-900">Teams</p>
                    <p className="text-gray-600">{challengeDetails.homeTeams} vs {challengeDetails.awayTeams}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-indigo-500 mt-0.5 mr-2" />
                  <div>
                    <p className="font-medium text-gray-900">Duration</p>
                    <p className="text-gray-600">{challengeDetails.startDate} - {challengeDetails.endDate}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Challenge Rules */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Challenge Rules</h2>
              <ul className="space-y-2 text-gray-700">
                {challengeDetails.rules.map((rule: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                <Link 
                  href={`/challenges/${challengeId}/matchups`}
                  className="flex items-center justify-between w-full px-4 py-3 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors"
                >
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    <span className="font-medium">View Matchups</span>
                  </div>
                  <ArrowLeft className="h-4 w-4 transform rotate-180" />
                </Link>
                
                <Link 
                  href={`/challenges/${challengeId}/trash-talk`}
                  className="flex items-center justify-between w-full px-4 py-3 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors"
                >
                  <div className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    <span className="font-medium">Trash Talk</span>
                  </div>
                  <ArrowLeft className="h-4 w-4 transform rotate-180" />
                </Link>
              </div>
            </div>
            
            {/* League Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">League Information</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">{challengeDetails.homeLeague}</h3>
                  <p className="text-gray-600">Home League • {challengeDetails.homeTeams} Teams</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">{challengeDetails.awayLeague}</h3>
                  <p className="text-gray-600">Away League • {challengeDetails.awayTeams} Teams</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 