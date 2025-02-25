'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import Navigation from '@/components/Navigation'
import YahooLeagueDetails from '@/components/YahooLeagueDetails'

interface LeaguePageProps {
  params: {
    leagueKey: string
  }
}

export default function LeaguePage({ params }: LeaguePageProps) {
  const { leagueKey } = params
  const router = useRouter()
  const { user, loading } = useAuth()
  
  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/leagues/' + leagueKey)
    }
  }, [user, loading, router, leagueKey])
  
  const handleBackToLeagues = () => {
    router.push('/dashboard')
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
      
      <div className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <YahooLeagueDetails 
            leagueKey={leagueKey} 
            onBack={handleBackToLeagues} 
          />
        </div>
      </div>
    </div>
  )
} 