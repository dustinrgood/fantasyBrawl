'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ImportedLeague {
  yahooLeagueId: string
  yahooLeagueKey: string
  name: string
  season: string
  numTeams: number
  isFinished: boolean
  importedAt: string
}

export default function ImportedYahooLeagues() {
  const { user } = useAuth()
  const router = useRouter()
  const [leagues, setLeagues] = useState<ImportedLeague[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchImportedLeagues = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const userDocRef = doc(db, 'users', user.uid)
        const userDoc = await getDoc(userDocRef)
        
        if (userDoc.exists()) {
          const userData = userDoc.data()
          if (userData.importedYahooLeagues) {
            setLeagues(userData.importedYahooLeagues)
          } else {
            setLeagues([])
          }
        } else {
          setLeagues([])
        }
      } catch (err) {
        console.error('Error fetching imported leagues:', err)
        setError('Failed to load your imported leagues')
      } finally {
        setLoading(false)
      }
    }

    fetchImportedLeagues()
  }, [user])

  const handleViewLeague = (leagueKey: string) => {
    router.push(`/leagues/${leagueKey}`)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Your Yahoo Fantasy Leagues</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Your Yahoo Fantasy Leagues</h2>
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  // If no leagues are imported yet
  if (leagues.length === 0) {
    // Check if it's currently the NFL offseason
    const currentMonth = new Date().getMonth() + 1 // JavaScript months are 0-indexed
    const isOffseason = currentMonth >= 2 && currentMonth <= 8
    
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Your Yahoo Fantasy Leagues</h2>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No active Yahoo Fantasy leagues found.</p>
          
          {isOffseason ? (
            <>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md text-left">
                <h3 className="font-medium text-blue-800 mb-2">NFL Offseason Notice</h3>
                <p className="text-blue-700 mb-2">
                  It's currently the NFL offseason (February to August). During this period, Yahoo Fantasy API typically doesn't show any active leagues. This is normal and expected.
                </p>
                <p className="text-blue-700">
                  The new fantasy football season usually begins in late August/early September.
                </p>
              </div>
              <p className="text-gray-500 mb-6">You can still prepare for the upcoming season by exploring our features or joining a Yahoo league when they become available.</p>
            </>
          ) : (
            <p className="text-gray-500 mb-6">You haven't imported any Yahoo Fantasy leagues yet. Connect your Yahoo account to get started.</p>
          )}
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/profile" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Refresh Yahoo Connection
            </Link>
            <a 
              href="https://football.fantasysports.yahoo.com/f1/signup" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Join a Yahoo League
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Show the list of imported leagues
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Your Yahoo Fantasy Leagues</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {leagues.map((league) => (
          <div 
            key={league.yahooLeagueKey} 
            className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => handleViewLeague(league.yahooLeagueKey)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">{league.name}</h3>
                <p className="text-gray-500">
                  Season: {league.season} • Teams: {league.numTeams}
                  {league.isFinished && <span className="ml-2 text-amber-600">(Completed)</span>}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Imported on {new Date(league.importedAt).toLocaleDateString()}
                </p>
              </div>
              <Link
                href={`/leagues/${league.yahooLeagueKey}`}
                onClick={(e) => e.stopPropagation()}
                className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 