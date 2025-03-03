'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

export default function MatchupsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [matchups, setMatchups] = useState(mockMatchups)
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [challengeDetails, setChallengeDetails] = useState({
    homeLeague: 'Fantasy Football League',
    awayLeague: 'Touchdown Titans',
    week: 12,
    season: '2023-2024',
    status: 'Active',
    currentScore: '5-5'
  })

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/matchups')
    }
  }, [user, loading, router])

  // In a real app, you would fetch the matchups data based on the challenge ID
  useEffect(() => {
    // This would be replaced with an actual API call
    const fetchMatchups = async () => {
      // For now, we're using mock data
      setMatchups(mockMatchups)
    }

    if (challengeId) {
      fetchMatchups()
    }
  }, [challengeId])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="container-default py-8">
        <div className="mb-6">
          <Link href="/challenges" className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Challenges
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
              <span className="font-semibold">Current Score: {challengeDetails.currentScore}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-indigo-100">
                  <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-indigo-800 uppercase tracking-wider w-2/5">
                    {challengeDetails.homeLeague} Manager
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-sm font-medium text-indigo-800 uppercase tracking-wider w-1/5">
                    Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-sm font-medium text-indigo-800 uppercase tracking-wider w-1/5">
                    Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-sm font-medium text-indigo-800 uppercase tracking-wider w-2/5">
                    {challengeDetails.awayLeague} Manager
                  </th>
                </tr>
              </thead>
              <tbody>
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
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${homeWins ? 'text-green-600 font-semibold' : ''}`}>
                        {matchup.homeScore.toFixed(1)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-center ${awayWins ? 'text-green-600 font-semibold' : ''}`}>
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