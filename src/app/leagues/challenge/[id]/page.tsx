'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ChallengePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const [wagerType, setWagerType] = useState<'points' | 'money'>('points')
  const [wagerAmount, setWagerAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push('/login')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/challenges/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leagueId: params.id,
          wagerType,
          wagerAmount: parseFloat(wagerAmount),
          challengerId: user.uid,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create challenge')
      }

      const data = await response.json()
      router.push('/challenges')
    } catch (err) {
      console.error('Error creating challenge:', err)
      setError(err instanceof Error ? err.message : 'Failed to create challenge')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-default py-8">
      <Link href="/leagues/public" className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Public Leagues
      </Link>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Challenge</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wager Type
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setWagerType('points')}
                className={`flex-1 py-2 px-4 rounded-md ${
                  wagerType === 'points'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Points
              </button>
              <button
                type="button"
                onClick={() => setWagerType('money')}
                className={`flex-1 py-2 px-4 rounded-md ${
                  wagerType === 'money'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Money
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="wagerAmount" className="block text-sm font-medium text-gray-700 mb-2">
              Wager Amount ({wagerType === 'points' ? 'Points' : '$'})
            </label>
            <input
              type="number"
              id="wagerAmount"
              value={wagerAmount}
              onChange={(e) => setWagerAmount(e.target.value)}
              min="0"
              step={wagerType === 'points' ? '1' : '0.01'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={wagerType === 'points' ? 'Enter points' : 'Enter amount'}
              required
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Challenge Rules</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Both leagues must accept the challenge</li>
              <li>• Wagers are locked once the challenge is accepted</li>
              <li>• Points/money are held in escrow until the challenge is complete</li>
              <li>• Winner takes all at the end of the challenge period</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading || !wagerAmount}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Creating Challenge...' : 'Create Challenge'}
          </button>
        </form>
      </div>
    </div>
  )
} 