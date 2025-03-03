import { Metadata } from 'next'
import YahooLeaguePicker from '@/components/YahooLeaguePicker'
import PageHeader from '@/components/PageHeader'

export const metadata: Metadata = {
  title: 'Import Yahoo Leagues | Fantasy League Manager',
  description: 'Import your Yahoo Fantasy leagues to Fantasy League Manager',
}

export default function YahooLeaguePickerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Import Yahoo Leagues"
        description="Select and import your Yahoo Fantasy leagues"
      />
      
      <div className="mt-8">
        <YahooLeaguePicker />
      </div>
    </div>
  )
} 