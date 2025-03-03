import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Yahoo Fantasy API Debug',
  description: 'Debug Yahoo Fantasy API integration issues',
}

export default function YahooDebugLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 