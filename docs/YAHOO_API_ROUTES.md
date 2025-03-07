# Yahoo Fantasy API Integration Guide

This document provides an overview of the Yahoo Fantasy Sports API integration in LeagueBrawl, including all API routes, the authentication flow, and best practices.

## Authentication Flow

### 1. Initiate OAuth Flow

**Endpoint:** `POST /api/auth/yahoo/authorize`

**Request Body:**
```json
{
  "userId": "required-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "authUrl": "https://api.login.yahoo.com/oauth2/request_auth?..."
}
```

**Description:**
- Generates a Yahoo OAuth URL with state parameter for CSRF protection
- Stores state in a secure HTTP-only cookie
- User should be redirected to the returned `authUrl`

### 2. OAuth Callback

**Endpoint:** `GET /api/auth/yahoo/callback`

**Description:**
- Handles the callback from Yahoo after user grants permission
- Exchanges the authorization code for access and refresh tokens
- Stores tokens in Firestore for the user
- Redirects to profile page with success/error parameters

### 3. Refresh Tokens

**Endpoint:** `POST /api/auth/yahoo/refresh-token`

**Request Body:**
```json
{
  "userId": "required-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "tokens": {
    "accessToken": "new-access-token",
    "refreshToken": "new-refresh-token",
    "expiresAt": 1678456789000
  }
}
```

**Description:**
- Refreshes the Yahoo OAuth tokens using the stored refresh token
- Updates token storage in Firestore
- Returns new tokens (only used by internal APIs)

### 4. Disconnect Yahoo Account

**Endpoint:** `POST /api/auth/yahoo/disconnect`

**Request Body:**
```json
{
  "userId": "required-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Yahoo account disconnected successfully"
}
```

**Description:**
- Removes Yahoo tokens from the user's account
- Sets `yahooConnected` flag to false in Firestore

## League Management

### 1. Get User's Leagues

**Endpoint:** `POST /api/yahoo/user-leagues`

**Request Body:**
```json
{
  "userId": "required-user-id"
}
```

**Response:**
```json
{
  "leagues": [
    {
      "league_id": "12345",
      "league_key": "414.l.12345",
      "name": "My Fantasy League",
      "season": "2023",
      "sport": "football",
      "num_teams": 10,
      "scoring_type": "head",
      "is_finished": false,
      "logo_url": "https://example.com/logo.png",
      "draft_status": "completed"
    }
  ]
}
```

**Description:**
- Fetches all fantasy leagues for the user from Yahoo
- Returns leagues for all sports (football, basketball, baseball, hockey)

### 2. Get League Details

**Endpoint:** `GET /api/yahoo/league-details?leagueKey=414.l.12345&userId=user-id`

**Response:**
```json
{
  "league": {
    "league_id": "12345",
    "league_key": "414.l.12345",
    "name": "My Fantasy League",
    "season": "2023",
    "sport": "football",
    "num_teams": 10,
    "scoring_type": "head",
    "is_finished": false,
    "logo_url": "https://example.com/logo.png",
    "draft_status": "completed",
    "current_week": 10,
    "start_week": 1,
    "end_week": 17,
    "playoff_start_week": 15,
    "teams": [
      {
        "team_id": "1",
        "team_key": "414.l.12345.t.1",
        "name": "Team Name",
        "manager_name": "Manager Name",
        "manager_email": "email@example.com",
        "logo": "https://example.com/teamlogo.png"
      }
    ],
    "settings": {
      // League settings object
    },
    "commissioner": {
      "name": "Commissioner Name",
      "email": "commissioner@example.com",
      "teamId": "1"
    }
  }
}
```

**Description:**
- Fetches detailed information for a specific league
- Includes league settings, teams, and commissioner information

### 3. Import League

**Endpoint:** `POST /api/yahoo/import-league`

**Request Body:**
```json
{
  "userId": "required-user-id",
  "leagueKey": "414.l.12345"
}
```

**Response:**
```json
{
  "message": "League imported successfully",
  "leagueId": "yahoo-12345"
}
```

**Description:**
- Imports a Yahoo Fantasy league into the user's LeagueBrawl account
- Stores league data in Firestore
- Checks for existing imports to prevent duplicates

## General API Access

### Yahoo API Proxy

**Endpoint:** `POST /api/yahoo/proxy`

**Request Body:**
```json
{
  "userId": "required-user-id",
  "endpoint": "users;use_login=1/games",
  "params": {
    "format": "json"
  }
}
```

**Response:** Raw Yahoo API response

**Description:**
- General-purpose proxy for the Yahoo Fantasy API
- Handles authentication, token refresh, and error handling
- Useful for custom queries not covered by the specific endpoints
- Returns raw Yahoo API responses

## Best Practices

1. **Token Management**
   - Never store tokens in localStorage or client-side code
   - All token management happens server-side
   - Use the Yahoo proxy for all API calls

2. **Error Handling**
   - Handle authentication errors gracefully
   - Provide clear user feedback for connection issues
   - Automatically attempt to refresh expired tokens

3. **User Experience**
   - Show loading states during API calls
   - Provide reconnection options if authentication fails
   - Cache frequently accessed data for better performance

4. **Security**
   - Validate user permissions before accessing league data
   - Include userId in all requests for authorization
   - Use HTTPS for all API calls