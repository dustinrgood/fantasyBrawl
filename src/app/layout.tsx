// src/app/layout.tsx
import { Inter } from 'next/font/google'
import { AuthProvider } from '../lib/contexts/AuthContext'
import { DeepgramContextProvider } from '../lib/contexts/DeepgramContext'
import Navigation from '@/components/Navigation'
import './globals.css' // Import global styles

// Use Inter with more weights for better typography
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata = {
  title: 'LeagueBrawl - Where Fantasy Leagues Unite and Compete',
  description: 'Take your fantasy sports to the next level with league vs league competition, trash talk, and epic prizes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Force reload CSS on each page load during development */}
        {process.env.NODE_ENV === 'development' && (
          <link 
            rel="stylesheet" 
            href={`/_next/static/css/app/layout.css?v=${Date.now()}`} 
          />
        )}
        {/* Temporary Tailwind CDN solution with custom configuration */}
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  fontFamily: {
                    sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                  },
                  colors: {
                    indigo: {
                      50: '#eef2ff',
                      100: '#e0e7ff',
                      200: '#c7d2fe',
                      300: '#a5b4fc',
                      400: '#818cf8',
                      500: '#6366f1',
                      600: '#4f46e5',
                      700: '#4338ca',
                      800: '#3730a3',
                      900: '#312e81',
                    },
                    gray: {
                      50: '#f9fafb',
                      100: '#f3f4f6',
                      200: '#e5e7eb',
                      300: '#d1d5db',
                      400: '#9ca3af',
                      500: '#6b7280',
                      600: '#4b5563',
                      700: '#374151',
                      800: '#1f2937',
                      900: '#111827',
                    },
                    purple: {
                      600: '#7c3aed',
                    }
                  },
                  backgroundImage: {
                    "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                    "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                  },
                },
              },
            }
          `
        }} />
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Base styles */
            body {
              color: rgb(17, 24, 39);
              background: rgb(255, 255, 255);
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }
            
            /* Custom component classes from globals.css */
            .container-default {
              max-width: 80rem;
              margin-left: auto;
              margin-right: auto;
              padding-left: 1rem;
              padding-right: 1rem;
            }
            
            .section-padding {
              padding-top: 3rem;
              padding-bottom: 3rem;
            }
            
            .page-header {
              margin-bottom: 2rem;
            }
            
            .page-title {
              font-size: 1.875rem;
              font-weight: 700;
              color: #111827;
              margin-bottom: 0.5rem;
            }
            
            .page-subtitle {
              font-size: 1.125rem;
              color: #6B7280;
            }
            
            .search-container {
              background-color: white;
              padding: 1rem;
              border-radius: 0.5rem;
              box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
              margin-bottom: 1.5rem;
            }
            
            .input-group {
              position: relative;
            }
            
            .input-icon {
              position: absolute;
              left: 0.75rem;
              top: 50%;
              transform: translateY(-50%);
              color: #9CA3AF;
              width: 1.25rem;
              height: 1.25rem;
            }
            
            .input-field {
              width: 100%;
              padding-left: 2.5rem;
              padding-right: 1rem;
              padding-top: 0.5rem;
              padding-bottom: 0.5rem;
              border: 1px solid #D1D5DB;
              border-radius: 0.375rem;
              outline: none;
            }
            
            .input-field:focus {
              outline: none;
              ring: 2px;
              ring-color: #4F46E5;
              border-color: #4F46E5;
            }
            
            .sr-only {
              position: absolute;
              width: 1px;
              height: 1px;
              padding: 0;
              margin: -1px;
              overflow: hidden;
              clip: rect(0, 0, 0, 0);
              white-space: nowrap;
              border-width: 0;
            }
            
            /* Button styles */
            .btn {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              padding: 0.5rem 1rem;
              border: 1px solid transparent;
              font-size: 0.875rem;
              font-weight: 500;
              border-radius: 0.375rem;
              box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
              transition-property: color, background-color, border-color;
              transition-duration: 200ms;
            }
            
            .btn-primary {
              background-color: #4F46E5;
              color: white;
            }
            
            .btn-primary:hover {
              background-color: #4338CA;
            }
            
            .btn-secondary {
              background-color: transparent;
              color: #4F46E5;
              border-color: #4F46E5;
            }
            
            .btn-secondary:hover {
              background-color: #EEF2FF;
            }
            
            /* Card styles */
            .card {
              background-color: white;
              border-radius: 0.5rem;
              box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
              overflow: hidden;
              transition-property: box-shadow;
              transition-duration: 300ms;
            }
            
            .card:hover {
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            
            /* Navigation styles */
            .app-navbar {
              background-color: #4F46E5;
              color: white;
              box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            }
            
            .app-nav-container {
              max-width: 80rem;
              margin-left: auto;
              margin-right: auto;
              padding-left: 1rem;
              padding-right: 1rem;
            }
            
            .app-nav-content {
              display: flex;
              align-items: center;
              justify-content: space-between;
              height: 4rem;
            }
            
            .app-logo-container {
              display: flex;
              align-items: center;
              flex-shrink: 0;
            }
            
            .app-logo-icon {
              height: 2rem;
              width: 2rem;
              margin-right: 0.5rem;
              color: #FCD34D;
            }
            
            .app-logo-text {
              font-weight: 700;
              font-size: 1.125rem;
              color: white;
            }
            
            .app-desktop-menu {
              display: none;
            }
            
            @media (min-width: 768px) {
              .app-desktop-menu {
                display: block;
              }
            }
            
            .app-nav-links {
              margin-left: 2.5rem;
              display: flex;
              align-items: baseline;
              gap: 1rem;
            }
            
            .app-nav-link {
              padding: 0.5rem 0.75rem;
              border-radius: 0.375rem;
              font-size: 0.875rem;
              font-weight: 500;
              color: white;
            }
            
            .app-nav-link:hover {
              background-color: #4338CA;
            }
            
            .app-mobile-menu-button {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              padding: 0.5rem;
              border-radius: 0.375rem;
              color: #E0E7FF;
            }
            
            @media (min-width: 768px) {
              .app-mobile-menu-button {
                display: none;
              }
            }
            
            .app-mobile-menu-button:hover {
              color: white;
              background-color: #4338CA;
            }
            
            .app-mobile-menu {
              background-color: #4338CA;
            }
            
            @media (min-width: 768px) {
              .app-mobile-menu {
                display: none;
              }
            }
            
            .app-mobile-nav-links {
              padding: 0.5rem;
              display: flex;
              flex-direction: column;
              gap: 0.25rem;
            }
            
            .app-mobile-nav-link {
              display: block;
              padding: 0.75rem;
              border-radius: 0.375rem;
              font-size: 1rem;
              font-weight: 500;
              color: white;
            }
            
            .app-mobile-nav-link:hover {
              background-color: #4F46E5;
            }
            
            /* Utility classes for login and profile pages */
            .min-h-screen {
              min-height: 100vh;
            }
            
            .flex {
              display: flex;
            }
            
            .flex-col {
              flex-direction: column;
            }
            
            .flex-grow {
              flex-grow: 1;
            }
            
            .items-center {
              align-items: center;
            }
            
            .justify-center {
              justify-content: center;
            }
            
            .justify-between {
              justify-content: space-between;
            }
            
            .space-y-8 > * + * {
              margin-top: 2rem;
            }
            
            .max-w-md {
              max-width: 28rem;
            }
            
            .max-w-3xl {
              max-width: 48rem;
            }
            
            .w-full {
              width: 100%;
            }
            
            .mx-auto {
              margin-left: auto;
              margin-right: auto;
            }
            
            .px-4 {
              padding-left: 1rem;
              padding-right: 1rem;
            }
            
            .py-5 {
              padding-top: 1.25rem;
              padding-bottom: 1.25rem;
            }
            
            .py-12 {
              padding-top: 3rem;
              padding-bottom: 3rem;
            }
            
            .mt-1 {
              margin-top: 0.25rem;
            }
            
            .mt-2 {
              margin-top: 0.5rem;
            }
            
            .mt-6 {
              margin-top: 1.5rem;
            }
            
            .text-center {
              text-align: center;
            }
            
            .text-sm {
              font-size: 0.875rem;
            }
            
            .text-lg {
              font-size: 1.125rem;
            }
            
            .text-3xl {
              font-size: 1.875rem;
            }
            
            .font-medium {
              font-weight: 500;
            }
            
            .font-extrabold {
              font-weight: 800;
            }
            
            .leading-6 {
              line-height: 1.5rem;
            }
            
            .text-gray-500 {
              color: #6B7280;
            }
            
            .text-gray-600 {
              color: #4B5563;
            }
            
            .text-gray-900 {
              color: #111827;
            }
            
            .text-indigo-600 {
              color: #4F46E5;
            }
            
            .hover\\:text-indigo-500:hover {
              color: #6366F1;
            }
            
            .bg-white {
              background-color: #FFFFFF;
            }
            
            .bg-gray-50 {
              background-color: #F9FAFB;
            }
            
            .shadow {
              box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            }
            
            .overflow-hidden {
              overflow: hidden;
            }
            
            .sm\\:rounded-lg {
              border-radius: 0.5rem;
            }
            
            .sm\\:px-6 {
              padding-left: 1.5rem;
              padding-right: 1.5rem;
            }
            
            .lg\\:px-8 {
              padding-left: 2rem;
              padding-right: 2rem;
            }
            
            .animate-spin {
              animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
            
            .h-12 {
              height: 3rem;
            }
            
            .w-12 {
              width: 3rem;
            }
            
            .rounded-full {
              border-radius: 9999px;
            }
            
            .border-b-2 {
              border-bottom-width: 2px;
            }
            
            .border-indigo-600 {
              border-color: #4F46E5;
            }
            
            .border-purple-600 {
              border-color: #7C3AED;
            }
          `
        }} />
      </head>
      <body className="antialiased min-h-screen bg-gray-50 flex flex-col">
        <AuthProvider>
          <DeepgramContextProvider>
            <Navigation />
            {children}
          </DeepgramContextProvider>
        </AuthProvider>
      </body>
    </html>
  )
}