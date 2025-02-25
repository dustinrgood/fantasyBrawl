'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function YahooAuthErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState('')
  const [errorDetails, setErrorDetails] = useState('')

  useEffect(() => {
    // Get error from URL
    const error = searchParams.get('error')
    const description = searchParams.get('description')
    
    // Map error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      'access_denied': 'You denied access to your Yahoo Fantasy account.',
      'missing_params': 'Required parameters were missing from the Yahoo response.',
      'invalid_state': 'Security verification failed. Please try again.',
      'invalid_request': 'The request to Yahoo was invalid. Please try again.',
      'default': 'An unexpected error occurred while connecting to Yahoo Fantasy.'
    }
    
    setErrorMessage(errorMessages[error || ''] || errorMessages.default)
    
    if (description) {
      setErrorDetails(description)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Connection Failed
          </h2>
          
          <div className="mt-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="mt-4 text-lg text-gray-600">
              Failed to connect to Yahoo Fantasy
            </p>
            <p className="mt-2 text-sm text-red-500">
              {errorMessage}
            </p>
            
            {errorDetails && (
              <p className="mt-2 text-xs text-gray-500 break-words">
                Details: {errorDetails}
              </p>
            )}
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Return to Dashboard
              </button>
              
              <Link
                href="/profile"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Try Again
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 