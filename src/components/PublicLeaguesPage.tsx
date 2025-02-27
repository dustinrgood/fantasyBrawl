'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import PublicLeaguesBrowser from './PublicLeaguesBrowser'
import { ArrowLeft } from 'lucide-react'

export default function PublicLeaguesPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [initialLeagues, setInitialLeagues] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Perform initial data fetch
  useEffect(() => {
    const fetchInitialLeagues = async () => {
      try {
        const response = await fetch('/api/yahoo/public-leagues')
        if (response.ok) {
          const data = await response.json()
          setInitialLeagues(data.leagues || [])
        }
      } catch (error) {
        console.error('Error fetching initial leagues:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchInitialLeagues()
  }, [])
  
  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/leagues/public')
    }
  }, [user, loading, router])
  
  if (loading || isLoading) {
    return (
      <div className="container-default py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    )
  }
  
  if (!user) {
    return null // Will redirect in useEffect
  }
  
  return (
    <div className="container-default py-8">
      <div className="mb-6">
        <Link href="/leagues/my" className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to My Leagues
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Public Leagues</h1>
            <p className="text-gray-600">
              Browse and import public leagues to challenge or join
            </p>
          </div>
        </div>
      </div>
      
      <PublicLeaguesBrowser initialLeagues={initialLeagues} />
      
      <div className="mt-10 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-800 mb-2">About Public Leagues</h3>
        <p className="text-blue-700 mb-4">
          Public leagues are open for anyone to view and challenge. When you import a public league:
        </p>
        <ul className="list-disc list-inside text-blue-700 space-y-2">
          <li>A copy of the league will be added to your account</li>
          <li>You can use this league to challenge other leagues</li>
          <li>Your imported league will remain even if the original is deleted</li>
          <li>You will be the owner of your imported copy</li>
        </ul>
      </div>
    </div>
  )
}