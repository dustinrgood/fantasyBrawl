'use client'

import { useEffect, useState } from 'react'
import { useYahooFantasy } from '@/lib/hooks/useYahooFantasy'
import YahooLeagueSelector from './YahooLeagueSelector'

interface YahooLeagueImportModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function YahooLeagueImportModal({ isOpen, onClose }: YahooLeagueImportModalProps) {
  const { isConnected, isLoading, error } = useYahooFantasy({ autoFetchLeagues: false })
  const [showModal, setShowModal] = useState(false)
  
  // Control modal visibility based on props and connection status
  useEffect(() => {
    if (isOpen && !isLoading) {
      setShowModal(true)
    } else {
      setShowModal(false)
    }
  }, [isOpen, isLoading])
  
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showModal) {
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleEscKey)
    return () => window.removeEventListener('keydown', handleEscKey)
  }, [showModal, onClose])
  
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [showModal])
  
  if (!showModal) return null
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Content */}
          {isLoading ? (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Loading Yahoo Fantasy</h2>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            </div>
          ) : error ? (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Connection Error</h2>
              <div className="bg-red-50 p-4 rounded-md mb-4">
                <p className="text-red-700">{error}</p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          ) : !isConnected ? (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Yahoo Fantasy Not Connected</h2>
              <p className="text-gray-600 mb-4">
                You need to connect your Yahoo Fantasy account before importing leagues.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <YahooLeagueSelector 
              onComplete={onClose}
              onCancel={onClose}
            />
          )}
        </div>
      </div>
    </div>
  )
} 