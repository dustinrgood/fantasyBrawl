'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Trophy, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Mock data for demonstration purposes
const mockMatchups = [
  { homeManager: 'John Smith', homeScore: 105.6, awayScore: 98.2, awayManager: 'Mike Johnson' },
  { homeManager: 'Sarah Williams', homeScore: 112.3, awayScore: 115.8, awayManager: 'David Brown' },
  { homeManager: 'Emily Davis', homeScore: 95.7, awayScore: 92.1, awayManager: 'Chris Wilson' },
  { homeManager: 'Alex Taylor', homeScore: 108.9, awayScore: 108.9, awayManager: 'Sam Miller' },
  { homeManager: 'Jordan Lee', homeScore: 120.5, awayScore: 88.7, awayManager: 'Casey Thomas' },
  { homeManager: 'Morgan White', homeScore: 101.2, awayScore: 104.6, awayManager: 'Riley Green' },
  { homeManager: 'Taylor Clark', homeScore: 99.8, awayScore: 110.3, awayManager: 'Jamie Scott' },
  { homeManager: 'Quinn Adams', homeScore: 118.4, awayScore: 97.5, awayManager: 'Avery Martin' },
  { homeManager: 'Parker Hall', homeScore: 105.1, awayScore: 102.8, awayManager: 'Drew Young' },
  { homeManager: 'Blake King', homeScore: 93.6, awayScore: 96.9, awayManager: 'Reese Baker' },
]

// Mock challenge data
const mockChallenges = {
  'challenge-1': {
    homeLeague: 'Fantasy Football League',
    awayLeague: 'Touchdown Titans',
    week: 12,
    season: '2023-2024',
    status: 'Active',
    currentScore: '5-5'
  },
  'challenge-2': {
    homeLeague: 'Basketball Champions',
    awayLeague: 'Hoop Dreams',
    week: 18,
    season: '2023-2024',
    status: 'Pending',
    currentScore: '0-0'
  }
}

export default function ChallengeMatchupsPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading } = useAuth()
  const [matchups, setMatchups] = useState(mockMatchups)
  const [challengeDetails, setChallengeDetails] = useState<any>(null)
  const challengeId = params?.challengeId as string

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=/challenges/${challengeId}/matchups`)
    }
  }, [user, loading, router, challengeId])

  // In a real app, you would fetch the challenge details and matchups data based on the challenge ID
  useEffect(() => {
    // This would be replaced with an actual API call
    const fetchChallengeData = async () => {
      // For now, we're using mock data
      if (challengeId && mockChallenges[challengeId as keyof typeof mockChallenges]) {
        setChallengeDetails(mockChallenges[challengeId as keyof typeof mockChallenges])
        setMatchups(mockMatchups)
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

  // Calculate the total scores and determine the overall winner
  const totalHomeScore = matchups.reduce((sum, match) => sum + match.homeScore, 0)
  const totalAwayScore = matchups.reduce((sum, match) => sum + match.awayScore, 0)
  const homeWins = matchups.filter(match => match.homeScore > match.awayScore).length
  const awayWins = matchups.filter(match => match.awayScore > match.homeScore).length
  const ties = matchups.filter(match => match.homeScore === match.awayScore).length

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      
      <main className="container-default py-8">
        <div className="mb-6">
          <Link href={`/challenges/${challengeId}`} className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Challenge Details
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {challengeDetails.homeLeague} vs. {challengeDetails.awayLeague}
              </h1>
              <p className="text-gray-600">
                Week {challengeDetails.week} • {challengeDetails.season} • {challengeDetails.status}
              </p>
            </div>
            
            <div className="mt-2 md:mt-0 flex items-center">
              <Trophy className="h-5 w-5 text-amber-500 mr-2" />
              <span className="font-semibold">Current Score: {homeWins}-{awayWins}{ties > 0 ? `-${ties}` : ''}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-indigo-100">
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-indigo-800 uppercase tracking-wider w-1/3">
                    {challengeDetails.homeLeague} Manager
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-sm font-medium text-indigo-800 uppercase tracking-wider w-1/6">
                    Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-sm font-medium text-indigo-800 uppercase tracking-wider w-1/6">
                    Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-sm font-medium text-indigo-800 uppercase tracking-wider w-1/3">
                    {challengeDetails.awayLeague} Manager
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {matchups.map((matchup, index) => {
                  // Determine winner for styling
                  const homeWins = matchup.homeScore > matchup.awayScore
                  const awayWins = matchup.awayScore > matchup.homeScore
                  const tie = matchup.homeScore === matchup.awayScore
                  
                  return (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${homeWins ? 'text-green-600 font-semibold' : ''}`}>
                        {matchup.homeManager}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-medium ${homeWins ? 'text-green-600 font-semibold' : ''}`}>
                        {matchup.homeScore.toFixed(1)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-medium ${awayWins ? 'text-green-600 font-semibold' : ''}`}>
                        {matchup.awayScore.toFixed(1)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${awayWins ? 'text-green-600 font-semibold' : ''}`}>
                        {matchup.awayManager}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-semibold">
                  <td className="px-6 py-4 text-sm">
                    Total
                  </td>
                  <td className="px-6 py-4 text-sm text-center font-medium">
                    {totalHomeScore.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 text-sm text-center font-medium">
                    {totalAwayScore.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    Total
                  </td>
                </tr>
                <tr className="bg-gray-100">
                  <td colSpan={4} className="px-6 py-4 text-sm text-center">
                    <div className="flex justify-center items-center space-x-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-green-600"></span>
                      <span className="text-gray-600">Indicates winner of the matchup</span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Challenge Rules</h2>
          <div className="space-y-3 text-gray-600">
            <p>• Each manager from {challengeDetails.homeLeague} is matched against a manager from {challengeDetails.awayLeague}.</p>
            <p>• The league with the most individual matchup wins takes the overall victory.</p>
            <p>• In case of a tie in individual matchups, the league with the highest total points wins.</p>
            <p>• Challenge results are updated after all games for the week are completed.</p>
          </div>
        </div>
      </main>
    </div>
  )
} 