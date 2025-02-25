# Ansh & Riley Full-Stack Template

This is a full-stack template project for Software Composers to create applications with AI.

## Getting started
To create a new project, you go to `/paths`, choose from our list of Paths, and then use Cursor's Composer feature to quickly scaffold your project!

You can also edit the Path's prompt template to be whatever you like!

## Features

### Yahoo Fantasy Integration
This application includes a complete integration with Yahoo Fantasy Sports API:
- OAuth 2.0 authentication flow with Yahoo
- Secure token management and refresh
- League data retrieval
- Comprehensive debugging tools
- Step-by-step guide for users

To use the Yahoo Fantasy integration:
1. Set up your Yahoo Developer application at https://developer.yahoo.com/apps/
2. Add your credentials to `.env.local`:
   ```
   YAHOO_CLIENT_ID=your_client_id
   YAHOO_CLIENT_SECRET=your_client_secret
   NEXT_PUBLIC_YAHOO_CLIENT_ID=your_client_id
   NEXT_PUBLIC_APP_URL=https://localhost:3000
   ```
3. Ensure you're running the app with HTTPS (default with `npm run dev`)
4. Navigate to the profile page or use the dashboard quick actions to connect

### HTTPS for Local Development
This template includes built-in HTTPS support for local development:
- Self-signed certificates are generated automatically
- HTTPS server is configured and ready to use
- Required for OAuth integrations like Yahoo Fantasy

To start the development server with HTTPS:
```
npm run dev
```

## Technologies used
This doesn't really matter, but is useful for the AI to understand more about this project. We are using the following technologies
- React with Next.js 14 App Router
- TailwindCSS
- Firebase Auth, Storage, and Database
- Multiple AI endpoints including OpenAI, Anthropic, and Replicate using Vercel's AI SDK