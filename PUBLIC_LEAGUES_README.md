# Public Leagues Feature

This feature allows users to browse, view, and import public fantasy leagues into their account.

## Implementation

The public leagues feature consists of the following components:

1. **Mock Leagues Service (`src/lib/services/mockLeaguesService.ts`)**
   - Provides mock data for public leagues
   - Used as a fallback when the Yahoo API is unavailable or during the NFL offseason

2. **API Routes**
   - `src/app/api/yahoo/public-leagues/route.ts` - Fetches a list of public leagues
   - `src/app/api/yahoo/league-details/route.ts` - Fetches details for a specific league

3. **UI Components**
   - `src/components/PublicLeaguesBrowser.tsx` - Main component for browsing public leagues
   - `src/components/PublicLeaguesPage.tsx` - Page layout for public leagues browser
   - `src/components/LeagueDetailsPage.tsx` - Page component to view details of a specific league

4. **League Storage Service (`src/lib/services/leagueStorage.ts`)**
   - Handles importing public leagues into the user's account
   - Manages league data in Firestore

5. **Page Routes**
   - `src/app/leagues/public/page.tsx` - Route for browsing public leagues
   - `src/app/leagues/public/[leagueId]/page.tsx` - Route for viewing a specific league

## Customization

### Using Real Yahoo Data

By default, the API routes are configured to always use mock data (`ALWAYS_USE_MOCK = true`). To use real data from the Yahoo Fantasy API:

1. Open `src/app/api/yahoo/public-leagues/route.ts` and set `ALWAYS_USE_MOCK = false`
2. Open `src/app/api/yahoo/league-details/route.ts` and set `ALWAYS_USE_MOCK = false`
3. Implement the actual Yahoo API integration in the API routes

### Modifying Mock Data

You can modify the mock data in `src/lib/services/mockLeaguesService.ts` to change:

- Available leagues
- League details
- Sport types
- Team roster configurations
- Scoring systems

## Navigation Integration

To integrate the public leagues feature into your navigation:

1. Add a link to `/leagues/public` in your Navigation component (see `navigation-update.txt`)
2. Add a "Browse Public Leagues" button on your leagues page (see `leagues-page-update.txt`)

## Feature Workflow

1. User navigates to `/leagues/public` to browse available public leagues
2. User can filter leagues by sport and team size
3. User can view details of a specific league by clicking "View Details"
4. On the league details page, user can see comprehensive information about the league
5. User can import the league into their account by clicking "Import League"
6. After importing, user is redirected to the imported league page

## Development Notes

- The feature uses mock data by default, which is useful for development, testing, or when the Yahoo API is unavailable
- League import functionality is implemented but requires Firebase Firestore to be properly configured
- The UI follows the existing design patterns in your app (using Tailwind CSS)
- Filter functionality is implemented on the server-side for better performance 