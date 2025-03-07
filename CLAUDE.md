# CLAUDE.md - Development Guide

## Build & Development Commands
- `npm run dev` - Start the development server with HTTPS on port 3001
- `npm run build` - Build the production version
- `npm run lint` - Run ESLint for code quality checks
- `npm run certs` - Generate self-signed SSL certificates for HTTPS development

## Code Style Guidelines
- **Components**: Use PascalCase for React components, include "use client" directive when needed
- **Variables/Functions**: Use camelCase
- **Constants**: Use UPPER_SNAKE_CASE
- **Imports**: Group imports (React, libraries, components, utils/types)
- **Formatting**: Single quotes, no semicolons (follows Prettier standards)
- **Types**: Use TypeScript types for all props, state, and function parameters
- **Error Handling**: Wrap API calls in try/catch blocks with appropriate error messages
- **API Routes**: All API routes should use proper error handling and status codes

## Project Structure
- Views/pages in `src/app/`
- Components in `src/components/`
- API routes in `src/app/api/`
- Utility functions in `src/lib/`
- Context providers in `src/lib/contexts/`
- Custom hooks in `src/lib/hooks/`

## Important Notes
- Always check `memory.md` and `steps.md` for project context before making changes
- Yahoo API integration requires proper HTTPS setup
- Follow Tailwind CSS conventions for styling
- All new/modified files should include a comment header noting changes