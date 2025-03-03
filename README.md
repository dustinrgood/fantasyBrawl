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

### Replicate Image Generation
This application integrates with Replicate for AI-powered image generation:
- Generate custom images that match your trash talk messages
- Uses a two-step process with language models to optimize prompts
- Creates high-quality, contextual images using Stable Diffusion XL
- Seamlessly integrates with the trash talk feature

To use the Replicate integration:
1. Create an account at https://replicate.com/ and get your API key
2. Add your API key to `.env.local`:
   ```
   REPLICATE_API_KEY=your_api_key_here
   ```
3. Use the "Generate Matching Image" option in the voice-powered trash talk feature

## Technologies Used
- **Next.js 14**: React framework with App Router for server-side rendering and routing
- **TypeScript**: For type-safe code
- **TailwindCSS**: For responsive UI design
- **Firebase**: Authentication, Firestore database, and Storage
- **Yahoo Fantasy API**: For fantasy sports data integration
- **OpenAI API**: For AI-powered trash talk generation
- **Replicate API**: For AI image generation and prompt optimization
- **Deepgram API**: For voice transcription
- **Eleven Labs API**: For AI voice synthesis and text-to-speech