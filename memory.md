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
- Fixed routing issues by removing the static HTML file in public directory and updating server.js to let Next.js handle all routes
- Fixed styling issues across all pages by ensuring proper Tailwind classes and background colors
- Updated layout.tsx to add proper background color to the body element
- Updated AppNavbar component to use semantic HTML (nav element) and added shadow
- Ensured consistent port usage (3001) across server.js and package.json
- Fixed NSFW content detection issues in Replicate image generation by implementing content filtering and fallback mechanisms
- Resolved port conflicts by implementing proper process termination before server restart
- Fixed "User ID is required" error in Yahoo Fantasy client by ensuring user ID is passed in all API requests
- Fixed authentication issues in league details page by properly handling user authentication state

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
- Enhance Yahoo Fantasy integration with more detailed league data
- Add more comprehensive error handling for edge cases
- Improve mobile responsiveness across all pages
- Consider re-enabling the image generation feature with better prompt engineering if needed

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
- Fixed routing and navigation between pages
- Fixed styling issues across all pages
- Pushed code to GitHub repository (https://github.com/dustinrgood/fantasyBrawl)
- Implemented Eleven Labs voice-powered trash talk feature with customizable scripts
- Added script customization to allow users to edit AI-generated trash talk before converting to speech
- Integrated Replicate for AI image generation (currently disabled via feature flag)
- Added voice selection, stability, and similarity boost controls for the voice generation
- Implemented audio preview functionality for generated voice messages
- Added sorting functionality to ImportedYahooLeagues component (sort by year, sport, and league name)
- Removed scoring categories section from YahooLeagueDetails component to standardize scoring across leagues
- Improved league details UI with clearer organization of league information
- Added note about standardized scoring in league settings tab

## Yahoo Fantasy Integration
- Implemented OAuth 2.0 authentication flow with Yahoo
- Created secure token management with refresh capability
- Added comprehensive debugging tools
- Developed step-by-step guide for users
- Ensured HTTPS compatibility for OAuth redirect URIs
- Added dashboard quick actions for Yahoo Fantasy connection
- Updated proxy route to handle SSL certificate validation issues
- Improved error handling and timeout settings for API requests
- Enhanced league details page with better organization of league information
- Standardized scoring across leagues for better matchmaking
- Added sorting functionality to imported leagues for better user experience

## AI Integration
- Implemented Eleven Labs voice API for generating voice-powered trash talk
- Created a two-step process for trash talk generation:
  1. Generate script with AI (customizable by user)
  2. Convert script to speech with selected voice and parameters
- Added voice customization options (voice selection, stability, similarity boost)
- Integrated Replicate for image generation (currently disabled)
- Implemented content filtering for AI-generated prompts to avoid NSFW detection
- Added fallback mechanisms for handling API errors

## Technical Challenges
- Next.js 14.2.7 has compatibility issues with custom HTTPS servers
- React 18 conflicts with react-server-dom-webpack version requirements
- Yahoo API requires proper SSL certificate validation
- Module resolution errors with `private-next-rsc-mod-ref-proxy` persist despite configuration changes
- Custom server setup requires specific Next.js configuration
- Static HTML file in public directory conflicted with Next.js routing
- Replicate API requires billing setup and has NSFW content detection that can reject prompts
- Port conflicts when restarting the development server

## Notes
- Project is using Next.js 14.2.7
- Will need Firebase for authentication and database
- Using OpenAI/Anthropic for AI-generated trash talk content
- Using Eleven Labs for voice generation
- Replicate integration for image generation is implemented but disabled via feature flag
- Yahoo Fantasy integration requires HTTPS for local development
- Yahoo Developer application must have correct redirect URI: https://localhost:3001/api/auth/yahoo/callback
- Server is running on port 3001 (https://localhost:3001)
- Code is now hosted on GitHub at https://github.com/dustinrgood/fantasyBrawl
- Key files for styling issues:
  - src/app/globals.css
  - tailwind.config.ts
  - src/app/layout.tsx
  - src/components/AppNavbar.tsx
  - postcss.config.mjs
  - server.js 
- Key files for AI integration:
  - src/app/api/elevenlabs/generate-script/route.ts
  - src/app/api/elevenlabs/text-to-speech/route.ts
  - src/app/api/replicate/generate-trash-image/route.ts
  - src/app/challenges/[challengeId]/trash-talk/page.tsx 