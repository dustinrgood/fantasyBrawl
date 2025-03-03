'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Trophy, ArrowLeft, MessageCircle, ChevronRight } from 'lucide-react'
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

// Mock messages data for trash talk preview
const mockMessages = [
  {
    id: 1,
    sender: 'John Smith',
    league: 'Fantasy Football League',
    message: '',
    timestamp: '2023-11-25T14:30:00Z',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    mediaType: 'meme',
    mediaUrl: 'https://i.imgflip.com/7z5o1e.jpg'
  },
  {
    id: 2,
    sender: 'Mike Johnson',
    league: 'Touchdown Titans',
    message: 'Talk is cheap. We\'ll see who\'s laughing on Sunday!',
    timestamp: '2023-11-25T14:45:00Z',
    avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
    mediaType: 'gif',
    mediaUrl: 'https://media.giphy.com/media/3o7TKUZfJKUKuSWTZe/giphy.gif'
  },
  {
    id: 3,
    sender: 'Sarah Williams',
    league: 'Fantasy Football League',
    message: '',
    timestamp: '2023-11-25T15:10:00Z',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    mediaType: 'meme',
    mediaUrl: 'https://i.imgflip.com/7z5oc4.jpg'
  }
]

export default function ChallengeMatchupsPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading } = useAuth()
  const [matchups, setMatchups] = useState(mockMatchups)
  const [challengeDetails, setChallengeDetails] = useState<any>(null)
  const [trashTalkMessages, setTrashTalkMessages] = useState(mockMessages)
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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
        
        {/* Trash Talk Preview Section */}
        <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-indigo-50 px-6 py-4 flex justify-between items-center border-b border-indigo-100">
            <div className="flex items-center">
              <MessageCircle className="h-5 w-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-bold text-gray-900">Memes & Trash Talk</h2>
            </div>
            <Link 
              href={`/challenges/${challengeId}/trash-talk`}
              className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="divide-y divide-gray-100">
            {trashTalkMessages.slice(0, 3).map((msg) => (
              <div key={msg.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  <img 
                    src={msg.avatar} 
                    alt={msg.sender} 
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-grow">
                    <div className="flex items-baseline">
                      <span className="font-medium text-gray-900 mr-2">{msg.sender}</span>
                      <span className="text-xs text-gray-500">{formatDate(msg.timestamp)}</span>
                    </div>
                    <span className="text-xs text-indigo-600 mb-1 block">{msg.league}</span>
                    {msg.message && <p className="text-gray-700 mb-2">{msg.message}</p>}
                    {msg.mediaUrl && (
                      <div className="mt-1 rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={msg.mediaUrl} 
                          alt={`${msg.mediaType || 'media'} shared by ${msg.sender}`}
                          className="w-full h-auto max-h-48 object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
            <Link 
              href={`/challenges/${challengeId}/trash-talk`}
              className="w-full flex items-center justify-center text-indigo-600 hover:text-indigo-800 font-medium py-2"
            >
              Join the meme war
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
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