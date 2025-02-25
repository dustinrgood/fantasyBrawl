# Project Memory

## Recent Bug Fixes
- Fixed Next.js startup issue by updating package.json scripts to use the full path to the Next.js binary:
  ```json
  "dev": "node ./node_modules/next/dist/bin/next dev"
  ```
- Implemented HTTPS for local development with self-signed certificates
- Fixed Yahoo Fantasy authentication flow to properly handle HTTPS redirect URIs
- Added comprehensive error handling and debugging for Yahoo OAuth process
- Updated Yahoo API proxy route to use axios instead of fetch for better SSL handling
- Added SSL certificate validation bypass for development environment
- Fixed type errors in the Yahoo API proxy route by properly typing axios errors

## Pending Issues
- Ongoing module resolution error with `private-next-rsc-mod-ref-proxy` in Next.js 14.2.7
- Dependency conflict between react-server-dom-webpack (requires React 19) and our React 18 setup
- SSL certificate validation issues when making requests to Yahoo API
- Custom HTTPS server (server.js) conflicts with Next.js App Router configuration
- Need to set up Firebase with actual credentials
- Need to implement remaining authentication flows
- Need to create remaining pages (leagues, challenges, lobby)
- Need to implement AI trash talk generation with actual API keys

## Next Development Steps
- Resolve the module resolution error by either:
  - Downgrading Next.js to a version compatible with our dependencies
  - Using a different approach for the custom server setup
  - Creating a proper workaround for the react-server-dom-webpack version conflict
- Complete the Yahoo API integration by testing with actual API calls
- Set up Firebase project and add credentials to .env.local
- Complete the authentication flow
- Implement league creation and management
- Build the challenge lobby and matchup system
- Implement the AI-powered trash talk feature
- Enhance Yahoo Fantasy integration with more detailed league data

## Completed Tasks
- Created data models for the fantasy sports app
- Implemented Firebase service functions
- Created AI service for trash talk generation
- Built the main layout and navigation
- Designed the landing page
- Created the dashboard UI
- Implemented Yahoo Fantasy OAuth integration
- Added debugging tools for Yahoo Fantasy connection
- Created user guide for Yahoo Fantasy integration
- Set up HTTPS for local development
- Updated Yahoo API proxy to use axios for better SSL handling
- Added proper error typing in the Yahoo API proxy route

## Yahoo Fantasy Integration
- Implemented OAuth 2.0 authentication flow with Yahoo
- Created secure token management with refresh capability
- Added comprehensive debugging tools
- Developed step-by-step guide for users
- Ensured HTTPS compatibility for OAuth redirect URIs
- Added dashboard quick actions for Yahoo Fantasy connection
- Updated proxy route to handle SSL certificate validation issues
- Improved error handling and timeout settings for API requests

## Technical Challenges
- Next.js 14.2.7 has compatibility issues with custom HTTPS servers
- React 18 conflicts with react-server-dom-webpack version requirements
- Yahoo API requires proper SSL certificate validation
- Module resolution errors with `private-next-rsc-mod-ref-proxy` persist despite configuration changes
- Custom server setup requires specific Next.js configuration

## Notes
- Project is using Next.js 14.2.7
- Will need Firebase for authentication and database
- Will use OpenAI/Anthropic for AI-generated trash talk content
- May use Deepgram for voice-related features
- Yahoo Fantasy integration requires HTTPS for local development
- Yahoo Developer application must have correct redirect URI: https://localhost:3000/api/auth/yahoo/callback
- Template selection page is currently displayed at the root route 
- Current workaround: Using standard Next.js dev server (npm run dev:next) instead of custom HTTPS server 