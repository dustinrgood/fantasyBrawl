// src/app/how-it-works/layout.tsx - Created a layout for the How It Works page
import { ReactNode } from 'react'

export default function HowItWorksLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <main>
      {children}
    </main>
  )
} 