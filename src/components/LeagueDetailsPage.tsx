'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { importPublicLeague } from '@/lib/services/leagueStorage'
import { League } from '@/lib/types/fantasy'
import { ArrowLeft, Trophy, Users, Calendar, Check, Loader2 } from 'lucide-react'

interface LeagueDetailsPageProps {
  leagueId: string
}

export default function LeagueDetailsPage({ leagueId }: LeagueDetailsPageProps) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [league, setLeague] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)
  
  // Fetch league details
  useEffect(() => {
    const fetchLeagueDetails = async () => {
      try {
        setIsLoading(true)
        // Use the public league details API route that doesn't require authentication
        const response = await fetch(`/api/yahoo/public-leagues/${leagueId}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`)
        }
        
        const data = await response.json()
        setLeague(data.league || null)
      } catch (err) {
        console.error('Error fetching league details:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch league details')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchLeagueDetails()
  }, [leagueId])
  
  // Redirect if not logged in and trying to import
  useEffect(() => {
    if (!loading && !user && importing) {
      router.push(`/login?redirect=/leagues/public/${leagueId}`)
    }
  }, [user, loading, router, leagueId, importing])
  
  const handleImportLeague = async () => {
    if (!user) {
      router.push(`/login?redirect=/leagues/public/${leagueId}`)
      return
    }
    
    try {
      setImporting(true)
      
      // Call the import service
      const newLeagueId = await importPublicLeague(league)
      
      // Mark as success
      setImportSuccess(true)
      
      // Redirect to the imported league after a short delay
      setTimeout(() => {
        router.push(`/leagues/${newLeagueId}`)
      }, 1500)
    } catch (err) {
      console.error('Error importing league:', err)
      alert(err instanceof Error ? err.message : 'Failed to import league')
      setImporting(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="container-default py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container-default py-8">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-bold text-red-800 mb-4">Error Loading League</h2>
          <p className="text-red-600">{error}</p>
          <div className="mt-6">
            <Link
              href="/leagues/public"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Back to Public Leagues
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  if (!league) {
    return (
      <div className="container-default py-8">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">League Not Found</h2>
          <p className="text-gray-600">The league you're looking for doesn't exist or you don't have permission to view it.</p>
          <div className="mt-6">
            <Link
              href="/leagues/public"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Back to Public Leagues
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container-default py-8">
      <div className="mb-6">
        <Link href="/leagues/public" className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Public Leagues
        </Link>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{league.name}</h1>
        <p className="text-gray-600 mb-4">{league.description}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <Trophy className="h-5 w-5 text-indigo-600 mr-2" />
            <h2 className="text-lg font-medium">League Details</h2>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Sport</p>
              <p className="font-medium capitalize">{league.sport}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Season</p>
              <p className="font-medium">{league.season}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Scoring System</p>
              <p className="font-medium">{league.scoringSystem?.description || 'Standard'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <Users className="h-5 w-5 text-indigo-600 mr-2" />
            <h2 className="text-lg font-medium">Team Information</h2>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Number of Teams</p>
              <p className="font-medium">{league.managerIds?.length || 0}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Availability</p>
              <p className="font-medium">{league.isPublic ? 'Public League' : 'Private League'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <Calendar className="h-5 w-5 text-indigo-600 mr-2" />
            <h2 className="text-lg font-medium">League Timeline</h2>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-medium">{new Date(league.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Import This League</h2>
        <p className="text-gray-600 mb-6">
          Import this league to your account to participate in challenges or invite friends.
        </p>
        
        <button
          onClick={handleImportLeague}
          disabled={importing || importSuccess || !user}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            importSuccess
              ? 'bg-green-600 text-white'
              : !user
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          } disabled:opacity-50 flex items-center`}
        >
          {importing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Importing League...
            </>
          ) : importSuccess ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              League Imported Successfully
            </>
          ) : !user ? (
            'Sign in to Import League'
          ) : (
            'Import League'
          )}
        </button>
        {!user && (
          <p className="mt-2 text-sm text-gray-500">
            <Link href={`/login?redirect=/leagues/public/${leagueId}`} className="text-indigo-600 hover:text-indigo-800">
              Sign in
            </Link> to import this league to your account.
          </p>
        )}
      </div>
    </div>
  )
}