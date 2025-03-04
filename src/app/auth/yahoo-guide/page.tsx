'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import YahooAuthButton from '@/app/components/YahooAuthButton'

export default function YahooGuidePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="text-2xl font-bold text-gray-900">Yahoo Fantasy Connection Guide</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Learn how to connect your Yahoo Fantasy account
            </p>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="prose max-w-none">
              <h2>Step 1: Sign in to your account</h2>
              <p>
                Before connecting to Yahoo Fantasy, you need to be signed in to your account.
                {!user && (
                  <span className="text-red-600 font-medium"> You are currently not signed in.</span>
                )}
              </p>
              
              {!user && (
                <div className="my-4">
                  <Link
                    href="/login?redirect=/auth/yahoo-guide"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Sign in first
                  </Link>
                </div>
              )}
              
              <h2>Step 2: Connect to Yahoo Fantasy</h2>
              <p>
                Once signed in, click the "Connect Yahoo Fantasy" button below. This will redirect you to Yahoo where you'll need to authorize access to your Fantasy Sports data.
              </p>
              
              <div className="my-4">
                <YahooAuthButton size="lg" />
              </div>
              
              <h2>Step 3: Authorize the application</h2>
              <p>
                On the Yahoo authorization page:
              </p>
              <ol className="list-decimal pl-6">
                <li>Sign in to your Yahoo account if prompted</li>
                <li>Review the permissions requested</li>
                <li>Click "Agree" to authorize access to your Fantasy Sports data</li>
              </ol>
              
              <h2>Step 4: Return to the application</h2>
              <p>
                After authorization, you'll be redirected back to this application. Your Yahoo Fantasy leagues will be automatically imported and available in your dashboard.
              </p>
              
              <h2>Troubleshooting</h2>
              <p>
                If you encounter any issues connecting your Yahoo Fantasy account:
              </p>
              <ul className="list-disc pl-6">
                <li>Ensure you're using HTTPS (https://localhost:3001) for local development</li>
                <li>Check that you've authorized the correct permissions on Yahoo</li>
                <li>Try clearing your browser cookies and cache</li>
                <li>Visit the <Link href="/auth/yahoo-debug" className="text-indigo-600 hover:text-indigo-500">Debug Page</Link> for more detailed diagnostics</li>
              </ul>
            </div>
            
            <div className="mt-8 flex space-x-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Return to Dashboard
              </Link>
              
              <Link
                href="/profile"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Go to Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 