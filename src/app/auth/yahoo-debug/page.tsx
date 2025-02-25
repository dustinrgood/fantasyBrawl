import YahooLeagueImportDebug from '@/components/YahooLeagueImportDebug'

export const metadata = {
  title: 'Yahoo Fantasy API Debug',
  description: 'Debug Yahoo Fantasy API integration issues',
}

export default function YahooDebugPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Yahoo Fantasy API Debug</h1>
      <YahooLeagueImportDebug />
      
      <div className="mt-12 bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Troubleshooting Guide</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Common Issues</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <span className="font-medium">NFL Offseason:</span> During the NFL offseason (February to August), 
                Yahoo Fantasy API may not return any active leagues. This is normal and expected.
              </li>
              <li>
                <span className="font-medium">Token Expiration:</span> Yahoo tokens expire after 1 hour. 
                Check if your tokens are expired in the Token Status section.
              </li>
              <li>
                <span className="font-medium">Invalid Redirect URI:</span> The redirect URI in your Yahoo 
                Developer Console must exactly match what's configured in your app.
              </li>
              <li>
                <span className="font-medium">Insufficient Permissions:</span> Make sure your Yahoo app 
                has the correct permissions (fspt-w for write access).
              </li>
              <li>
                <span className="font-medium">API Rate Limiting:</span> Yahoo may rate limit requests. 
                Try again after a few minutes.
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Steps to Resolve</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Check if your tokens are valid and not expired</li>
              <li>Disconnect and reconnect your Yahoo account</li>
              <li>Verify your Yahoo Developer Console settings</li>
              <li>Check browser console for detailed error messages</li>
              <li>Try using a different browser or clearing cookies</li>
            </ol>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Offseason Information</h3>
            <p className="mb-2">
              The NFL fantasy season typically follows this schedule:
            </p>
            <ul className="list-disc list-inside space-y-1 mb-2">
              <li><span className="font-medium">February to July:</span> Offseason - No active leagues</li>
              <li><span className="font-medium">July to August:</span> League creation and draft preparation</li>
              <li><span className="font-medium">September to January:</span> Active fantasy season</li>
            </ul>
            <p>
              If you're testing during the offseason and need to verify your integration works, 
              consider creating a test league in Yahoo Fantasy or using mock data for development.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Yahoo API Documentation</h3>
            <p>
              Refer to the <a href="https://developer.yahoo.com/fantasysports/guide/" 
              className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                Yahoo Fantasy Sports API Documentation
              </a> for more information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 