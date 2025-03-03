'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ConnectYahooButton from '@/components/ConnectYahooButton'

export default function YahooErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string>('Unknown error')
  const [description, setDescription] = useState<string>('An error occurred during Yahoo authentication.')
  
  useEffect(() => {
    // Get error details from URL parameters
    const errorParam = searchParams.get('error')
    const descriptionParam = searchParams.get('description')
    
    if (errorParam) {
      setError(errorParam)
    }
    
    if (descriptionParam) {
      setDescription(descriptionParam)
    } else {
      // Set default descriptions based on error type
      switch (errorParam) {
        case 'missing_params':
          setDescription('Required parameters were missing from the Yahoo callback.')
          break
        case 'invalid_state':
          setDescription('Security validation failed. Please try again.')
          break
        case 'state_mismatch':
          setDescription('Security token mismatch. Please try again.')
          break
        case 'token_exchange_failed':
          setDescription('Failed to exchange authorization code for tokens.')
          break
        case 'token_storage_failed':
          setDescription('Failed to store authentication tokens.')
          break
        case 'missing_credentials':
          setDescription('Yahoo API credentials are not properly configured.')
          break
        default:
          setDescription('An error occurred during Yahoo authentication.')
      }
    }
  }, [searchParams])
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Authentication Failed</h2>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <h3 className="font-medium text-red-800 mb-1">Error: {error}</h3>
          <p className="text-red-700">{description}</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <ConnectYahooButton />
          </div>
          
          <div className="flex justify-between">
            <Link
              href="/profile"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Back to Profile
            </Link>
            
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Go to Dashboard
            </Link>
          </div>
          
          <div className="text-center mt-6">
            <Link
              href="/auth/yahoo-debug"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              View Debug Information
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 