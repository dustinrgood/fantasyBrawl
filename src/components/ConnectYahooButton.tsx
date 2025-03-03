import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Loader2 } from 'lucide-react'

export default function ConnectYahooButton() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  
  const handleConnectYahoo = async () => {
    if (!user) {
      router.push('/login?redirect=/profile')
      return
    }
    
    try {
      setIsLoading(true)
      
      // Initiate Yahoo OAuth flow
      const response = await fetch('/api/auth/yahoo/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.uid })
      })
      
      if (!response.ok) {
        throw new Error('Failed to initiate Yahoo authorization')
      }
      
      const data = await response.json()
      
      // Redirect to Yahoo authorization URL
      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        throw new Error('No authorization URL returned')
      }
    } catch (error) {
      console.error('Error connecting to Yahoo:', error)
      alert('Failed to connect to Yahoo. Please try again.')
      setIsLoading(false)
    }
  }
  
  return (
    <button
      onClick={handleConnectYahoo}
      disabled={isLoading}
      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Connecting...
        </>
      ) : (
        'Connect Yahoo Leagues'
      )}
    </button>
  )
} 