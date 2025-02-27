'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'

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

// Mock messages data
const mockMessages = [
  {
    id: 1,
    sender: 'John Smith',
    league: 'Fantasy Football League',
    message: 'Get ready to lose this week! My team is on fire 🔥',
    timestamp: '2023-11-25T14:30:00Z',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: 2,
    sender: 'Mike Johnson',
    league: 'Touchdown Titans',
    message: 'Talk is cheap. We\'ll see who\'s laughing on Sunday!',
    timestamp: '2023-11-25T14:45:00Z',
    avatar: 'https://randomuser.me/api/portraits/men/44.jpg'
  },
  {
    id: 3,
    sender: 'Sarah Williams',
    league: 'Fantasy Football League',
    message: 'My QB is going to throw for 400 yards against your defense 😎',
    timestamp: '2023-11-25T15:10:00Z',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg'
  },
  {
    id: 4,
    sender: 'David Brown',
    league: 'Touchdown Titans',
    message: 'Your QB couldn\'t throw for 400 yards against a high school team!',
    timestamp: '2023-11-25T15:30:00Z',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg'
  },
  {
    id: 5,
    sender: 'Emily Davis',
    league: 'Fantasy Football League',
    message: 'History doesn\'t lie. We\'ve won the last 3 challenges against your league.',
    timestamp: '2023-11-25T16:15:00Z',
    avatar: 'https://randomuser.me/api/portraits/women/17.jpg'
  }
]

export default function TrashTalkPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading } = useAuth()
  const [challengeDetails, setChallengeDetails] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const challengeId = params?.challengeId as string

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=/challenges/${challengeId}/trash-talk`)
    }
  }, [user, loading, router, challengeId])

  // In a real app, you would fetch the challenge details and messages based on the challenge ID
  useEffect(() => {
    // This would be replaced with actual API calls
    const fetchData = async () => {
      // For now, we're using mock data
      if (challengeId && mockChallenges[challengeId as keyof typeof mockChallenges]) {
        setChallengeDetails(mockChallenges[challengeId as keyof typeof mockChallenges])
        setMessages(mockMessages)
      } else {
        // Handle case where challenge doesn't exist
        router.push('/challenges')
      }
    }

    if (challengeId) {
      fetchData()
    }
  }, [challengeId, router])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim()) return
    
    // In a real app, you would send this to your backend
    const newMessageObj = {
      id: messages.length + 1,
      sender: user?.displayName || 'Anonymous User',
      league: 'Fantasy Football League', // This would come from user's profile
      message: newMessage,
      timestamp: new Date().toISOString(),
      avatar: user?.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg'
    }
    
    setMessages([...messages, newMessageObj])
    setNewMessage('')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />
      
      <main className="container-default py-8 flex-grow flex flex-col">
        <div className="mb-6">
          <Link href={`/challenges/${challengeId}`} className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Challenge Details
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Trash Talk: {challengeDetails.homeLeague} vs. {challengeDetails.awayLeague}
              </h1>
              <p className="text-gray-600">
                Week {challengeDetails.week} • {challengeDetails.season}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow flex-grow flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">Challenge Chat</h2>
            <p className="text-sm text-gray-500">Keep it fun and respectful</p>
          </div>
          
          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="flex items-start space-x-3">
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
                  <p className="text-gray-700">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                disabled={!newMessage.trim()}
              >
                <Send className="h-4 w-4 mr-1" />
                Send
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
} 