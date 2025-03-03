'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { ArrowLeft, Send, Image, X, Smile, Mic, Zap, Loader2, ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { useDeepgram } from '@/lib/contexts/DeepgramContext'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

// Mock challenge data
const mockChallenges = {
  'challenge-1': {
    homeLeague: 'Fantasy Football League',
    awayLeague: 'Touchdown Titans',
    week: 12,
    season: '2023-2024',
    status: 'Active',
    currentScore: '5-5'
  },
  'challenge-2': {
    homeLeague: 'Basketball Champions',
    awayLeague: 'Hoop Dreams',
    week: 18,
    season: '2023-2024',
    status: 'Pending',
    currentScore: '0-0'
  }
}

// Mock messages data
const mockMessages = [
  {
    id: 1,
    sender: 'John Smith',
    league: 'Fantasy Football League',
    message: 'Get ready to lose this week! My team is on fire 🔥',
    timestamp: '2023-11-25T14:30:00Z',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    mediaType: null,
    mediaUrl: null,
    audioUrl: null
  },
  {
    id: 2,
    sender: 'Mike Johnson',
    league: 'Touchdown Titans',
    message: 'Talk is cheap. We\'ll see who\'s laughing on Sunday!',
    timestamp: '2023-11-25T14:45:00Z',
    avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
    mediaType: 'gif',
    mediaUrl: 'https://media.giphy.com/media/3o7TKUZfJKUKuSWTZe/giphy.gif',
    audioUrl: null
  },
  {
    id: 3,
    sender: 'Sarah Williams',
    league: 'Fantasy Football League',
    message: 'My QB is going to throw for 400 yards against your defense 😎',
    timestamp: '2023-11-25T15:10:00Z',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    mediaType: null,
    mediaUrl: null,
    audioUrl: null
  },
  {
    id: 4,
    sender: 'David Brown',
    league: 'Touchdown Titans',
    message: 'Your QB couldn\'t throw for 400 yards against a high school team!',
    timestamp: '2023-11-25T15:30:00Z',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    mediaType: 'meme',
    mediaUrl: 'https://i.imgflip.com/7z5o1e.jpg',
    audioUrl: null
  },
  {
    id: 5,
    sender: 'Emily Davis',
    league: 'Fantasy Football League',
    message: 'History doesn\'t lie. We\'ve won the last 3 challenges against your league.',
    timestamp: '2023-11-25T16:15:00Z',
    avatar: 'https://randomuser.me/api/portraits/women/17.jpg',
    mediaType: 'gif',
    mediaUrl: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
    audioUrl: null
  },
  {
    id: 6,
    sender: 'Dustin Good',
    league: 'Fantasy Football League',
    message: 'Your defense is as effective as a screen door on a submarine!',
    timestamp: '2024-02-28T10:15:00Z',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    mediaType: 'meme',
    mediaUrl: 'https://i.imgflip.com/7z5ogg.jpg',
    audioUrl: null
  },
  {
    id: 7,
    sender: 'Alex Thompson',
    league: 'Fantasy Football League',
    message: '',
    timestamp: '2024-02-28T11:30:00Z',
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
    mediaType: null,
    mediaUrl: null,
    audioUrl: '/mock-audio/trash-talk-sample.mp3'
  }
]

// Popular memes and GIFs for fantasy sports
const popularMedia = {
  memes: [
    { url: 'https://i.imgflip.com/7z5o1e.jpg', alt: 'Fantasy football disappointment' },
    { url: 'https://i.imgflip.com/7qjpvl.jpg', alt: 'When your star player gets injured' },
    { url: 'https://i.imgflip.com/7z5oc4.jpg', alt: 'Bench player outscores starter' },
    { url: 'https://i.imgflip.com/7z5ogg.jpg', alt: 'Waiting for Monday night miracle' },
    { url: 'https://i.imgflip.com/7z5okn.jpg', alt: 'When you forget to set your lineup' },
    { url: 'https://i.imgflip.com/2wgqt1.jpg', alt: 'Fantasy football draft day' },
    { url: 'https://i.imgflip.com/1otk96.jpg', alt: 'Fantasy football addiction' },
    { url: 'https://i.imgflip.com/2xscjb.jpg', alt: 'Trash talk backfires' },
    { url: 'https://i.imgflip.com/3pmdlf.jpg', alt: 'Checking fantasy scores' },
    { url: 'https://i.imgflip.com/1ih9gk.jpg', alt: 'Losing by one point' }
  ],
  gifs: [
    { url: 'https://media.giphy.com/media/3o7TKUZfJKUKuSWTZe/giphy.gif', alt: 'Touchdown celebration' },
    { url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', alt: 'Victory dance' },
    { url: 'https://media.giphy.com/media/3ohhwH6yMO7ED5xc7S/giphy.gif', alt: 'Trash talk' },
    { url: 'https://media.giphy.com/media/xUPGcx4qh3aEPkMc1O/giphy.gif', alt: 'Shocked reaction' },
    { url: 'https://media.giphy.com/media/3o7TKF5DnsSLv4zVBu/giphy.gif', alt: 'Disappointed fan' },
    { url: 'https://media.giphy.com/media/l46CyJmS9KUbokzsI/giphy.gif', alt: 'Football spike' },
    { url: 'https://media.giphy.com/media/3oEjHGZkrolm9UgvM4/giphy.gif', alt: 'Fantasy football win' },
    { url: 'https://media.giphy.com/media/l0MYP6WAFfaR7Q1jO/giphy.gif', alt: 'Laughing at opponent' },
    { url: 'https://media.giphy.com/media/3o7TKr3nzbh5WgCFxe/giphy.gif', alt: 'Dramatic reaction' },
    { url: 'https://media.giphy.com/media/l0HlDJhyI8qoh7Wfu/giphy.gif', alt: 'Celebrating victory' }
  ]
}

// Keywords to match transcripts to memes
const memeKeywords = {
  'disappointment': 0,
  'injury': 1,
  'bench': 2,
  'monday': 3,
  'forget': 4,
  'lineup': 4,
  'lose': 0,
  'injured': 1,
  'starter': 2,
  'miracle': 3,
  'forgot': 4,
  'draft': 5,
  'addiction': 6,
  'backfire': 7,
  'checking': 8,
  'score': 8,
  'point': 9,
  'losing': 9
}

const gifKeywords = {
  'celebration': 0,
  'touchdown': 0,
  'victory': 1,
  'dance': 1,
  'trash': 2,
  'talk': 2,
  'shocked': 3,
  'surprise': 3,
  'disappointed': 4,
  'sad': 4,
  'spike': 5,
  'win': 6,
  'laugh': 7,
  'dramatic': 8,
  'celebrate': 9
}

// Find the generateTrashTalkImage function and add a feature flag at the top of the file
// Add this near the top of the file with other state variables
const ENABLE_IMAGE_GENERATION = false; // Feature flag to toggle image generation

export default function TrashTalkPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading } = useAuth()
  const [challengeDetails, setChallengeDetails] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [showMediaSelector, setShowMediaSelector] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<{type: 'meme' | 'gif' | null, url: string | null, textOverlay: {topText: string, bottomText: string, textColor: string, fontSize: string, fontWeight: string} | null}>({
    type: null,
    url: null,
    textOverlay: null
  })
  const [mediaTab, setMediaTab] = useState<'memes' | 'gifs'>('memes')
  const challengeId = params?.challengeId as string
  
  // AI Smack Generator states
  const [showSmackGenerator, setShowSmackGenerator] = useState(false)
  const [generatingSmack, setGeneratingSmack] = useState(false)
  const [smackConfig, setSmackConfig] = useState({
    targetTeam: '',
    targetPlayer: '',
    userTeam: '',
    sportType: 'fantasy football',
    style: 'funny'
  })
  
  // Enhanced Smack Generator states
  const [generatedText, setGeneratedText] = useState('')
  const [showEnhancedGenerator, setShowEnhancedGenerator] = useState(false)
  const [selectedSmackMedia, setSelectedSmackMedia] = useState<{type: 'meme' | 'gif' | null, url: string | null}>({
    type: null,
    url: null
  })
  const [textOverlay, setTextOverlay] = useState({
    topText: '',
    bottomText: '',
    textColor: 'white',
    fontSize: 'medium',
    fontWeight: 'bold'
  })
  const [previewMode, setPreviewMode] = useState(false)
  
  // Voice-powered trash talk states
  const [showVoiceGenerator, setShowVoiceGenerator] = useState(false)
  const [generatingVoice, setGeneratingVoice] = useState(false)
  const [voiceConfig, setVoiceConfig] = useState({
    voiceId: '21m00Tcm4TlvDq8ikWAM', // Default voice (Rachel)
    stability: 0.5,
    similarityBoost: 0.75
  })
  const [availableVoices, setAvailableVoices] = useState<any[]>([])
  const [voicePreviewUrl, setVoicePreviewUrl] = useState<string | null>(null)
  const [isVoicePreviewPlaying, setIsVoicePreviewPlaying] = useState(false)
  const voicePreviewRef = useRef<HTMLAudioElement | null>(null)
  const [voiceScriptText, setVoiceScriptText] = useState('')
  const [isScriptGenerated, setIsScriptGenerated] = useState(false)
  const [isGeneratingScript, setIsGeneratingScript] = useState(false)
  
  // Image generation states
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [showImagePreview, setShowImagePreview] = useState(false)
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false)
  const [recordingMode, setRecordingMode] = useState<'transcription' | 'voiceMemo'>('transcription')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  
  const { connectToDeepgram, disconnectFromDeepgram, connectionState, realtimeTranscript } = useDeepgram()

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=/challenges/${challengeId}/trash-talk`)
    }
  }, [user, loading, router, challengeId])

  // In a real app, you would fetch the challenge details and messages based on the challenge ID
  useEffect(() => {
    // This would be replaced with actual API calls
    const fetchData = async () => {
      // For now, we're using mock data
      if (challengeId && mockChallenges[challengeId as keyof typeof mockChallenges]) {
        setChallengeDetails(mockChallenges[challengeId as keyof typeof mockChallenges])
        setMessages(mockMessages)
      } else {
        // Handle case where challenge doesn't exist
        router.push('/challenges')
      }
    }

    if (challengeId) {
      fetchData()
    }
  }, [challengeId, router])

  // Function to toggle recording mode
  const toggleRecordingMode = () => {
    setRecordingMode(prev => prev === 'transcription' ? 'voiceMemo' : 'transcription')
  }

  // Function to start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      if (recordingMode === 'transcription') {
        // Use Deepgram for transcription
        await connectToDeepgram()
      } else {
        // Record audio for voice memo
        audioChunksRef.current = []
        mediaRecorderRef.current = new MediaRecorder(stream)
        
        mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        })
        
        mediaRecorderRef.current.addEventListener('stop', () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          const url = URL.createObjectURL(audioBlob)
          setAudioBlob(audioBlob)
          setAudioUrl(url)
        })
        
        mediaRecorderRef.current.start()
      }
      
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  // Function to stop recording
  const stopRecording = () => {
    if (recordingMode === 'transcription') {
      // Stop Deepgram transcription
      disconnectFromDeepgram()
      
      // Process transcript to find matching meme or GIF
      if (realtimeTranscript) {
        const transcript = realtimeTranscript.toLowerCase()
        console.debug('Voice transcript:', transcript)
        
        // Determine if we should look for memes or GIFs based on the current tab
        const keywords = mediaTab === 'memes' ? memeKeywords : gifKeywords
        const mediaList = popularMedia[mediaTab]
        
        // Find matching keywords in the transcript
        let bestMatchIndex = -1
        let maxMatches = 0
        
        Object.entries(keywords).forEach(([keyword, index]) => {
          if (transcript.includes(keyword)) {
            const matches = (transcript.match(new RegExp(keyword, 'g')) || []).length
            if (matches > maxMatches) {
              maxMatches = matches
              bestMatchIndex = index as number
            }
          }
        })
        
        // If we found a match, select the corresponding media
        if (bestMatchIndex >= 0 && bestMatchIndex < mediaList.length) {
          handleSelectMedia(
            mediaTab === 'memes' ? 'meme' : 'gif', 
            mediaList[bestMatchIndex].url
          )
        } else {
          // If no specific match, just pick the first one
          handleSelectMedia(
            mediaTab === 'memes' ? 'meme' : 'gif', 
            mediaList[0].url
          )
        }
      }
    } else {
      // Stop recording voice memo
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
    
    setIsRecording(false)
  }

  // Function to play/pause audio
  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Function to clear recorded audio
  const clearAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioBlob(null)
    setAudioUrl(null)
    setIsPlaying(false)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() && !selectedMedia.url && !audioUrl) return
    
    // In a real app, you would send this to your backend
    const newMessageObj = {
      id: messages.length + 1,
      sender: user?.displayName || 'Anonymous User',
      league: 'Fantasy Football League', // This would come from user's profile
      message: newMessage,
      timestamp: new Date().toISOString(),
      avatar: user?.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg',
      mediaType: selectedMedia.type,
      mediaUrl: selectedMedia.url,
      audioUrl: audioUrl,
      textOverlay: selectedMedia.textOverlay || null
    }
    
    setMessages([...messages, newMessageObj])
    setNewMessage('')
    setSelectedMedia({ type: null, url: null, textOverlay: null })
    clearAudio()
    setShowMediaSelector(false)
  }

  const handleSelectMedia = (type: 'meme' | 'gif', url: string, textOverlay = null) => {
    setSelectedMedia({ type, url, textOverlay })
    setShowMediaSelector(false)
  }

  const clearSelectedMedia = () => {
    setSelectedMedia({ type: null, url: null, textOverlay: null })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Function to generate AI smack talk
  const generateSmackTalk = async () => {
    if (!smackConfig.targetTeam) {
      toast.error('Target team is required')
      return
    }

    try {
      setGeneratingSmack(true)
      console.debug('Generating smack talk with config:', smackConfig)

      const response = await fetch('/api/openai/smack-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(smackConfig),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('Response body is null')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let rawText = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        rawText += chunk
        console.debug('Received chunk:', chunk)
      }

      console.debug('Raw text from stream:', rawText)

      // First, remove all metadata at the end - using a more aggressive approach
      let cleanedText = rawText
        // Remove any metadata with d:{finishReason pattern (with or without quotes)
        .replace(/d:\s*\{.*?finish[rR]eason.*?\}/g, '')
        .replace(/d:\{.*?finish[rR]eason.*?\}/g, '')
        // Also try with quotes
        .replace(/"?d:\s*\{.*?finish[rR]eason.*?\}"?/g, '')
        // Remove any JSON-like structure at the end
        .replace(/\{.*?"finish[rR]eason".*?\}$/g, '')
        .trim()
      
      console.debug('After metadata removal:', cleanedText)
      
      // Then remove encoding artifacts
      cleanedText = cleanedText
        // Remove patterns like "0:" or "1:" at the beginning of words
        .replace(/\d+:"?/g, '')
        // Remove patterns like "0:" or "1:" after quotes
        .replace(/"?\d+:/g, '')
        // Clean up double quotes
        .replace(/""/g, '"')
        // Remove quotes at word boundaries
        .replace(/\b"\b/g, '')
        // Remove standalone quotes
        .replace(/"\s+"/g, ' ')
        // Final cleanup of any remaining quotes
        .replace(/^"|"$/g, '')
        // Remove any remaining double quotes
        .replace(/"/g, '')
        // Fix line breaks - replace single newlines with spaces
        .replace(/\n/g, ' ')
        // Fix multiple spaces (but preserve single spaces between words)
        .replace(/\s{2,}/g, ' ')
        
      console.debug('After basic cleanup:', cleanedText)
      
      // Apply more specific fixes
      cleanedText = cleanedText
        // Fix any censoring attempts (like "S h i t" becoming "Shit")
        // Only target patterns where single letters are separated by spaces
        // These patterns look for isolated single letters with spaces between them
        .replace(/\b([A-Za-z])\s+([A-Za-z])\s+([A-Za-z])\s+([A-Za-z])\b/g, '$1$2$3$4')
        .replace(/\b([A-Za-z])\s+([A-Za-z])\s+([A-Za-z])\b/g, '$1$2$3')
        .replace(/\b([A-Za-z])\s+([A-Za-z])\b/g, '$1$2')
        // Fix spaces between words and punctuation
        .replace(/\s+([,.!?;:])/g, '$1')
        // Fix spaces before apostrophes
        .replace(/\s+'/g, "'")
        // Fix spaces after apostrophes
        .replace(/'\s+/g, "'")
        // Fix specific patterns seen in the example
        .replace(/Cut\s+ler/g, "Cutler")
        .replace(/sid\s+eline/g, "sideline")
        .replace(/lif\s+eless/g, "lifeless")
        .replace(/play\s+book/g, "playbook")
        
      console.debug('After specific fixes:', cleanedText)
      
      // Apply more general fixes
      cleanedText = cleanedText
        // More general fix for common word splitting issues
        // This looks for common word parts that are often incorrectly split
        .replace(/(\w+)\s+(ing|ed|er|es|ly|ment|tion|able|ible|ful|less|ness|ish|ive|ize|ise|ous|al|ic|ical|ial|ian|ent|ant|ary|ory|ance|ence|ism|ist|ity|ty|ship|hood|dom|en|ify|ate|ize|ise|fy|ize|ise|ward|wise|fold|most|like|some)\b/g, '$1$2')
        // Fix common compound words
        .replace(/play\s+off/g, "playoff")
        .replace(/touch\s+down/g, "touchdown")
        .replace(/foot\s+ball/g, "football")
        .replace(/basket\s+ball/g, "basketball")
        .replace(/base\s+ball/g, "baseball")
        .replace(/side\s+line/g, "sideline")
        .replace(/goal\s+post/g, "goalpost")
        .replace(/touch\s+down/g, "touchdown")
        .replace(/play\s+book/g, "playbook")
        .replace(/score\s+board/g, "scoreboard")
        .replace(/home\s+run/g, "homerun")
        .replace(/slam\s+dunk/g, "slamdunk")
        .replace(/fast\s+break/g, "fastbreak")
        .replace(/jump\s+shot/g, "jumpshot")
        .replace(/free\s+throw/g, "freethrow")
        .replace(/three\s+point/g, "threepoint")
        .replace(/field\s+goal/g, "fieldgoal")
        .replace(/end\s+zone/g, "endzone")
        
      console.debug('After compound word fixes:', cleanedText)
      
      // Apply more aggressive fixes
      cleanedText = cleanedText
        // Fix spaces between common words that shouldn't have spaces
        .replace(/(\w+)\s+(\w{1,3})\b/g, (match, p1, p2) => {
          // Don't join if p2 is a standalone word like "a", "an", "the", "of", "to", etc.
          const standaloneWords = ["a", "an", "the", "of", "to", "in", "on", "at", "by", "for", "is", "am", "are", "was", "were"];
          if (standaloneWords.includes(p2.toLowerCase())) {
            return `${p1} ${p2}`;
          }
          // Otherwise, check if this looks like it should be joined
          return `${p1}${p2}`;
        })
        // More aggressive fix for words that are split with a single space
        // This looks for patterns where a word is split into two parts
        // where the first part is at least 2 characters and the second part is at least 2 characters
        .replace(/(\b[a-z]{2,})\s+([a-z]{2,}\b)/gi, (match, p1, p2) => {
          // Don't join if either part is a common standalone word
          const commonWords = ["the", "and", "for", "but", "not", "with", "you", "that", "this", "from", "have", "are", "was", "were", "will", "would", "could", "should", "than", "then", "them", "they", "your", "our", "their", "his", "her", "its", "has", "had", "can", "may", "must"];
          if (commonWords.includes(p1.toLowerCase()) || commonWords.includes(p2.toLowerCase())) {
            return `${p1} ${p2}`;
          }
          
          // Check if this is likely a compound word by checking if the combined word
          // follows common English word patterns
          const combined = p1 + p2;
          // If the combined word is very long, it's probably not a real word
          if (combined.length > 12) {
            return `${p1} ${p2}`;
          }
          
          // Otherwise, join them
          return combined;
        })
        // Fix any remaining curly braces at the end (common in metadata)
        .replace(/\s*\}\s*$/, '')
        .trim()

      console.debug('Final cleaned text:', cleanedText)

      // Set the generated text and show the enhanced generator
      setGeneratedText(cleanedText)
      setShowEnhancedGenerator(true)
      setShowSmackGenerator(false)
    } catch (error) {
      console.error('Error generating smack talk:', error)
      toast.error('Failed to generate smack talk. Please try again.')
    } finally {
      setGeneratingSmack(false)
    }
  }

  // Function to handle selecting media for the enhanced generator
  const handleSelectSmackMedia = (type: 'meme' | 'gif', url: string) => {
    setSelectedSmackMedia({
      type,
      url
    })
  }

  // Function to apply text overlay to the selected media
  const applyTextOverlay = () => {
    if (!selectedSmackMedia.url) {
      toast.error('Please select a meme or GIF first')
      return
    }

    // In a real app, you would use a service like Cloudinary or a canvas-based solution
    // to overlay text on the image. For this demo, we'll just preview it.
    setPreviewMode(true)
  }

  // Function to finalize the enhanced smack talk
  const finalizeSmackTalk = () => {
    if (selectedSmackMedia.url) {
      // Set the media for the main message with text overlay
      setSelectedMedia({
        type: selectedSmackMedia.type,
        url: selectedSmackMedia.url,
        textOverlay: previewMode ? { ...textOverlay } : null
      })
    }
    
    // Set the text message
    setNewMessage(generatedText)
    
    // Close the enhanced generator
    setShowEnhancedGenerator(false)
    setPreviewMode(false)
    
    // Reset states
    setSelectedSmackMedia({
      type: null,
      url: null
    })
    setTextOverlay({
      topText: '',
      bottomText: '',
      textColor: 'white',
      fontSize: 'medium',
      fontWeight: 'bold'
    })
  }

  // Function to cancel the enhanced generator
  const cancelEnhancedGenerator = () => {
    setShowEnhancedGenerator(false)
    setPreviewMode(false)
    setSelectedSmackMedia({
      type: null,
      url: null
    })
    setTextOverlay({
      topText: '',
      bottomText: '',
      textColor: 'white',
      fontSize: 'medium',
      fontWeight: 'bold'
    })
  }

  // Function to fetch available voices from Eleven Labs
  const fetchAvailableVoices = async () => {
    try {
      const response = await fetch('/api/elevenlabs/voices');
      if (!response.ok) {
        throw new Error('Failed to fetch voices');
      }
      const data = await response.json();
      setAvailableVoices(data.voices || []);
    } catch (error) {
      console.error('Error fetching voices:', error);
      toast.error('Failed to load available voices');
    }
  };

  // Function to generate just the script without converting to speech
  const generateTrashTalkScript = async () => {
    if (!smackConfig.targetTeam) {
      toast.error('Target team is required');
      return;
    }

    try {
      setIsGeneratingScript(true);
      
      const response = await fetch('/api/elevenlabs/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...smackConfig
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setVoiceScriptText(data.script);
      setIsScriptGenerated(true);
      
    } catch (error) {
      console.error('Error generating trash talk script:', error);
      toast.error('Failed to generate trash talk script. Please try again.');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Function to convert the custom script to speech
  const convertScriptToSpeech = async () => {
    if (!voiceScriptText.trim()) {
      toast.error('Script text is required');
      return;
    }

    try {
      setGeneratingVoice(true);
      
      const response = await fetch('/api/elevenlabs/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: voiceScriptText,
          voiceId: voiceConfig.voiceId,
          stability: voiceConfig.stability,
          similarityBoost: voiceConfig.similarityBoost
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Create a blob from the audio response
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Set the audio URL for preview
      setVoicePreviewUrl(audioUrl);
      
      // Set the audio for the message
      setAudioBlob(audioBlob);
      setAudioUrl(audioUrl);
      
    } catch (error) {
      console.error('Error converting script to speech:', error);
      toast.error('Failed to convert script to speech. Please try again.');
    } finally {
      setGeneratingVoice(false);
    }
  };

  // Function to generate voice-powered trash talk
  const generateVoicedTrashTalk = async () => {
    if (!smackConfig.targetTeam) {
      toast.error('Target team is required');
      return;
    }

    try {
      setGeneratingVoice(true);
      
      const response = await fetch('/api/elevenlabs/smack-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...smackConfig,
          voiceId: voiceConfig.voiceId,
          stability: voiceConfig.stability,
          similarityBoost: voiceConfig.similarityBoost
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the trash talk text from the header
      const trashTalkText = decodeURIComponent(response.headers.get('X-Trash-Talk-Text') || '');
      if (trashTalkText) {
        setGeneratedText(trashTalkText);
      }

      // Create a blob from the audio response
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Set the audio URL for preview
      setVoicePreviewUrl(audioUrl);
      
      // Set the audio for the message
      setAudioBlob(audioBlob);
      setAudioUrl(audioUrl);
      
      // Close the voice generator modal
      setShowVoiceGenerator(false);
      
    } catch (error) {
      console.error('Error generating voiced trash talk:', error);
      toast.error('Failed to generate voiced trash talk. Please try again.');
    } finally {
      setGeneratingVoice(false);
    }
  };

  // Function to play/pause voice preview
  const toggleVoicePreview = () => {
    if (voicePreviewRef.current) {
      if (isVoicePreviewPlaying) {
        voicePreviewRef.current.pause();
      } else {
        voicePreviewRef.current.play();
      }
      setIsVoicePreviewPlaying(!isVoicePreviewPlaying);
    }
  };

  // Load available voices when the voice generator is shown
  useEffect(() => {
    if (showVoiceGenerator) {
      fetchAvailableVoices();
    }
  }, [showVoiceGenerator]);

  // Cleanup voice preview when component unmounts
  useEffect(() => {
    return () => {
      if (voicePreviewUrl) {
        URL.revokeObjectURL(voicePreviewUrl);
      }
    };
  }, [voicePreviewUrl]);

  // Function to generate an image from the trash talk script
  const generateTrashTalkImage = async () => {
    if (!voiceScriptText) {
      toast.error("Please generate a script first!");
      return;
    }

    try {
      setIsGeneratingImage(true);
      toast("Creating your trash talk meme...", { 
        icon: "🎭",
        duration: 3000 
      });

      const response = await fetch("/api/replicate/generate-trash-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trashTalkText: voiceScriptText,
          targetTeam: smackConfig.targetTeam,
          targetPlayer: smackConfig.targetPlayer,
          sportType: smackConfig.sportType
        }),
      });

      const data = await response.json();
      console.log("Image generation response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setShowImagePreview(true);
        toast.success("Trash talk meme created! 🔥", { duration: 3000 });
      } else {
        throw new Error("No image URL in response");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error(`Failed to create meme: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  if (loading || !challengeDetails) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="container-default py-8 flex-grow flex flex-col">
        <div className="mb-6">
          <Link href={`/challenges/${challengeId}`} className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Challenge Details
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Trash Talk: {challengeDetails.homeLeague} vs. {challengeDetails.awayLeague}
              </h1>
              <p className="text-gray-600">
                Week {challengeDetails.week} • {challengeDetails.season}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow flex-grow flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">Challenge Chat</h2>
            <p className="text-sm text-gray-500">Keep it fun and respectful - memes, GIFs, and voice memos encouraged!</p>
          </div>
          
          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="flex items-start space-x-3">
                <img 
                  src={msg.avatar} 
                  alt={msg.sender} 
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-grow">
                  <div className="flex items-baseline">
                    <span className="font-medium text-gray-900 mr-2">{msg.sender}</span>
                    <span className="text-xs text-gray-500">{formatDate(msg.timestamp)}</span>
                  </div>
                  <span className="text-xs text-indigo-600 mb-1 block">{msg.league}</span>
                  {msg.message && <p className="text-gray-700 mb-2">{msg.message}</p>}
                  {msg.mediaUrl && (
                    <div className="mt-1 mb-2 text-center">
                      <div className="relative inline-block rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={msg.mediaUrl} 
                          alt={`${msg.mediaType} shared by ${msg.sender}`}
                          className="max-w-full max-h-64 object-contain"
                        />
                        {msg.textOverlay && (
                          <>
                            {msg.textOverlay.topText && (
                              <div 
                                className="absolute top-2 left-0 right-0 text-center px-2 flex justify-center w-full"
                                style={{
                                  color: msg.textOverlay.textColor,
                                  fontSize: msg.textOverlay.fontSize === 'small' ? '16px' : 
                                           msg.textOverlay.fontSize === 'medium' ? '24px' : '32px',
                                  fontWeight: msg.textOverlay.fontWeight === 'normal' ? 'normal' : 'bold',
                                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                                }}
                              >
                                {msg.textOverlay.topText}
                              </div>
                            )}
                            {msg.textOverlay.bottomText && (
                              <div 
                                className="absolute bottom-2 left-0 right-0 text-center px-2 flex justify-center w-full"
                                style={{
                                  color: msg.textOverlay.textColor,
                                  fontSize: msg.textOverlay.fontSize === 'small' ? '16px' : 
                                           msg.textOverlay.fontSize === 'medium' ? '24px' : '32px',
                                  fontWeight: msg.textOverlay.fontWeight === 'normal' ? 'normal' : 'bold',
                                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                                }}
                              >
                                {msg.textOverlay.bottomText}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  {msg.audioUrl && (
                    <div className="mt-1 mb-2">
                      <audio 
                        src={msg.audioUrl} 
                        controls 
                        className="w-full max-w-md"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-200">
            {selectedMedia.url && (
              <div className="mb-3 relative">
                <div className="rounded-lg overflow-hidden border border-gray-200 relative">
                  <img 
                    src={selectedMedia.url} 
                    alt="Selected media"
                    className="max-w-full max-h-40 object-contain"
                  />
                  <button 
                    onClick={clearSelectedMedia}
                    className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full p-1 hover:bg-opacity-90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedMedia.type === 'meme' ? 'Meme' : 'GIF'} selected - click Send to share
                </p>
              </div>
            )}
            
            {audioUrl && (
              <div className="mb-3 relative">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <button 
                        onClick={toggleAudio}
                        className="mr-3 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                      >
                        {isPlaying ? (
                          <span className="block w-3 h-3 bg-white"></span>
                        ) : (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Voice Memo Ready</p>
                        <p className="text-xs text-gray-500">Click Send to share</p>
                      </div>
                    </div>
                    <button 
                      onClick={clearAudio}
                      className="p-1 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <audio ref={audioRef} src={audioUrl} className="hidden" onEnded={() => setIsPlaying(false)} />
                </div>
              </div>
            )}
            
            {isRecording && (
              <div className="mb-3 p-4 bg-gray-100 rounded-lg">
                <div className="flex items-center mb-2">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-4 h-4 bg-red-500 rounded-full mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {recordingMode === 'transcription' ? 'Recording for meme selection...' : 'Recording voice memo...'}
                  </span>
                </div>
                {recordingMode === 'transcription' && (
                  <>
                    <p className="text-sm text-gray-600 italic">"{realtimeTranscript}"</p>
                    <p className="text-xs text-gray-500 mt-1">Describe a meme or GIF you want to share</p>
                  </>
                )}
                {recordingMode === 'voiceMemo' && (
                  <p className="text-xs text-gray-500 mt-1">Recording your voice memo...</p>
                )}
              </div>
            )}
            
            {/* AI Smack Generator Modal */}
            {showSmackGenerator && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">AI Smack Generator</h3>
                    <button 
                      onClick={() => setShowSmackGenerator(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Team (required)
                      </label>
                      <input
                        type="text"
                        value={smackConfig.targetTeam}
                        onChange={(e) => setSmackConfig({...smackConfig, targetTeam: e.target.value})}
                        placeholder="e.g. Cowboys, Lakers"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Player (optional)
                      </label>
                      <input
                        type="text"
                        value={smackConfig.targetPlayer}
                        onChange={(e) => setSmackConfig({...smackConfig, targetPlayer: e.target.value})}
                        placeholder="e.g. Tom Brady, LeBron James"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Team (optional)
                      </label>
                      <input
                        type="text"
                        value={smackConfig.userTeam}
                        onChange={(e) => setSmackConfig({...smackConfig, userTeam: e.target.value})}
                        placeholder="e.g. Eagles, Celtics"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sport
                      </label>
                      <select
                        value={smackConfig.sportType}
                        onChange={(e) => setSmackConfig({...smackConfig, sportType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="fantasy football">Fantasy Football</option>
                        <option value="fantasy basketball">Fantasy Basketball</option>
                        <option value="fantasy baseball">Fantasy Baseball</option>
                        <option value="fantasy hockey">Fantasy Hockey</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Style
                      </label>
                      <select
                        value={smackConfig.style}
                        onChange={(e) => setSmackConfig({...smackConfig, style: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="funny">Funny</option>
                        <option value="savage">Savage</option>
                        <option value="sarcastic">Sarcastic</option>
                        <option value="clever">Clever</option>
                        <option value="stats-based">Stats-based</option>
                      </select>
                    </div>
                    
                    <div className="pt-2">
                      <button
                        onClick={generateSmackTalk}
                        disabled={!smackConfig.targetTeam || generatingSmack}
                        className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:bg-indigo-400"
                      >
                        {generatingSmack ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Generate Trash Talk
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Enhanced Smack Generator Modal */}
            {showEnhancedGenerator && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {previewMode ? 'Preview Your Trash Talk' : 'Customize Your Trash Talk'}
                    </h3>
                    <button 
                      onClick={cancelEnhancedGenerator}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    {previewMode ? (
                      <div className="space-y-4">
                        <div className="text-center">
                          <h4 className="text-md font-medium text-gray-700 mb-2">Preview</h4>
                          <div className="relative inline-block rounded-lg overflow-hidden border border-gray-200">
                            {selectedSmackMedia.url && (
                              <>
                                <img 
                                  src={selectedSmackMedia.url} 
                                  alt="Selected media"
                                  className="max-w-full max-h-64 object-contain"
                                />
                                {textOverlay.topText && (
                                  <div 
                                    className="absolute top-2 left-0 right-0 text-center px-2 flex justify-center w-full"
                                    style={{
                                      color: textOverlay.textColor,
                                      fontSize: textOverlay.fontSize === 'small' ? '16px' : 
                                               textOverlay.fontSize === 'medium' ? '24px' : '32px',
                                      fontWeight: textOverlay.fontWeight === 'normal' ? 'normal' : 'bold',
                                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                                    }}
                                  >
                                    {textOverlay.topText}
                                  </div>
                                )}
                                {textOverlay.bottomText && (
                                  <div 
                                    className="absolute bottom-2 left-0 right-0 text-center px-2 flex justify-center w-full"
                                    style={{
                                      color: textOverlay.textColor,
                                      fontSize: textOverlay.fontSize === 'small' ? '16px' : 
                                               textOverlay.fontSize === 'medium' ? '24px' : '32px',
                                      fontWeight: textOverlay.fontWeight === 'normal' ? 'normal' : 'bold',
                                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                                    }}
                                  >
                                    {textOverlay.bottomText}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-gray-700 text-base leading-relaxed px-4 py-2 bg-gray-50 rounded-lg">{generatedText}</p>
                        </div>
                        
                        <div className="flex justify-between pt-4">
                          <button
                            onClick={() => setPreviewMode(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                          >
                            Back to Edit
                          </button>
                          <button
                            onClick={finalizeSmackTalk}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                          >
                            Use This
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-md font-medium text-gray-700 mb-2">Generated Text</h4>
                          <textarea
                            value={generatedText}
                            onChange={(e) => setGeneratedText(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] text-base leading-relaxed"
                            placeholder="Your generated trash talk will appear here. You can edit it if needed."
                            style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}
                          />
                        </div>
                        
                        <div>
                          <h4 className="text-md font-medium text-gray-700 mb-2">Select Media (Optional)</h4>
                          <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-3">
                            <button
                              className={`flex-1 py-2 px-4 text-center font-medium ${mediaTab === 'memes' ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-gray-600'}`}
                              onClick={() => setMediaTab('memes')}
                            >
                              Memes
                            </button>
                            <button
                              className={`flex-1 py-2 px-4 text-center font-medium ${mediaTab === 'gifs' ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-gray-600'}`}
                              onClick={() => setMediaTab('gifs')}
                            >
                              GIFs
                            </button>
                          </div>
                          
                          <div className="p-3 bg-gray-50 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {popularMedia[mediaTab].map((item, index) => (
                                <div 
                                  key={index}
                                  className={`cursor-pointer rounded-lg overflow-hidden border ${selectedSmackMedia.url === item.url ? 'border-indigo-500 ring-2 ring-indigo-300' : 'border-gray-200 hover:border-indigo-400'} transition-colors bg-white`}
                                  onClick={() => handleSelectSmackMedia(mediaTab === 'memes' ? 'meme' : 'gif', item.url)}
                                >
                                  <img 
                                    src={item.url} 
                                    alt={item.alt}
                                    className="w-full h-32 object-contain p-1"
                                  />
                                  <div className="p-1 text-xs text-gray-600 text-center truncate">
                                    {item.alt}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {selectedSmackMedia.url && (
                          <div>
                            <h4 className="text-md font-medium text-gray-700 mb-2">Add Text Overlay (Optional)</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Top Text
                                </label>
                                <input
                                  type="text"
                                  value={textOverlay.topText}
                                  onChange={(e) => setTextOverlay({...textOverlay, topText: e.target.value})}
                                  placeholder="e.g. WHEN YOUR OPPONENT"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Bottom Text
                                </label>
                                <input
                                  type="text"
                                  value={textOverlay.bottomText}
                                  onChange={(e) => setTextOverlay({...textOverlay, bottomText: e.target.value})}
                                  placeholder="e.g. STARTS THE WRONG QB"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Text Color
                                  </label>
                                  <select
                                    value={textOverlay.textColor}
                                    onChange={(e) => setTextOverlay({...textOverlay, textColor: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  >
                                    <option value="white">White</option>
                                    <option value="black">Black</option>
                                    <option value="yellow">Yellow</option>
                                    <option value="red">Red</option>
                                    <option value="blue">Blue</option>
                                    <option value="green">Green</option>
                                  </select>
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Font Size
                                  </label>
                                  <select
                                    value={textOverlay.fontSize}
                                    onChange={(e) => setTextOverlay({...textOverlay, fontSize: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  >
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-between pt-4">
                          <button
                            onClick={cancelEnhancedGenerator}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                          <div className="space-x-2">
                            {selectedSmackMedia.url && (
                              <button
                                onClick={applyTextOverlay}
                                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
                              >
                                Preview
                              </button>
                            )}
                            <button
                              onClick={finalizeSmackTalk}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                            >
                              Use As Is
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Voice-Powered Trash Talk Modal */}
            {showVoiceGenerator && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Voice-Powered Trash Talk</h3>
                    <button 
                      onClick={() => setShowVoiceGenerator(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {!isScriptGenerated ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Target Team (required)
                          </label>
                          <input
                            type="text"
                            value={smackConfig.targetTeam}
                            onChange={(e) => setSmackConfig({...smackConfig, targetTeam: e.target.value})}
                            placeholder="e.g. Cowboys, Lakers"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Target Player (optional)
                          </label>
                          <input
                            type="text"
                            value={smackConfig.targetPlayer}
                            onChange={(e) => setSmackConfig({...smackConfig, targetPlayer: e.target.value})}
                            placeholder="e.g. Tom Brady, LeBron James"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Your Team (optional)
                          </label>
                          <input
                            type="text"
                            value={smackConfig.userTeam}
                            onChange={(e) => setSmackConfig({...smackConfig, userTeam: e.target.value})}
                            placeholder="e.g. Eagles, Celtics"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sport
                          </label>
                          <select
                            value={smackConfig.sportType}
                            onChange={(e) => setSmackConfig({...smackConfig, sportType: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="fantasy football">Fantasy Football</option>
                            <option value="fantasy basketball">Fantasy Basketball</option>
                            <option value="fantasy baseball">Fantasy Baseball</option>
                            <option value="fantasy hockey">Fantasy Hockey</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Style
                          </label>
                          <select
                            value={smackConfig.style}
                            onChange={(e) => setSmackConfig({...smackConfig, style: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="funny">Funny</option>
                            <option value="savage">Savage</option>
                            <option value="sarcastic">Sarcastic</option>
                            <option value="clever">Clever</option>
                            <option value="stats-based">Stats-based</option>
                          </select>
                        </div>
                        
                        <div className="pt-2">
                          <button
                            onClick={generateTrashTalkScript}
                            disabled={!smackConfig.targetTeam || isGeneratingScript}
                            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:bg-indigo-400"
                          >
                            {isGeneratingScript ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating Script...
                              </>
                            ) : (
                              'Generate Script'
                            )}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Customize Your Trash Talk Script
                          </label>
                          <textarea
                            value={voiceScriptText}
                            onChange={(e) => setVoiceScriptText(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                            placeholder="Edit your trash talk script here..."
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Feel free to edit the script to make it more personal or add your own flair.
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Voice
                          </label>
                          <select
                            value={voiceConfig.voiceId}
                            onChange={(e) => setVoiceConfig({...voiceConfig, voiceId: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            {availableVoices.length === 0 ? (
                              <option value="">Loading voices...</option>
                            ) : (
                              availableVoices.map((voice) => (
                                <option key={voice.voice_id} value={voice.voice_id}>
                                  {voice.name} ({voice.labels?.gender || 'Unknown'})
                                </option>
                              ))
                            )}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Voice Stability: {voiceConfig.stability.toFixed(1)}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={voiceConfig.stability}
                            onChange={(e) => setVoiceConfig({...voiceConfig, stability: parseFloat(e.target.value)})}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>More Variable</span>
                            <span>More Stable</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Similarity Boost: {voiceConfig.similarityBoost.toFixed(1)}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={voiceConfig.similarityBoost}
                            onChange={(e) => setVoiceConfig({...voiceConfig, similarityBoost: parseFloat(e.target.value)})}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>More Expressive</span>
                            <span>More Similar</span>
                          </div>
                        </div>
                        
                        {voicePreviewUrl && (
                          <div className="p-3 bg-gray-100 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <button 
                                  onClick={toggleVoicePreview}
                                  className="mr-3 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                                >
                                  {isVoicePreviewPlaying ? (
                                    <span className="block w-3 h-3 bg-white"></span>
                                  ) : (
                                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  )}
                                </button>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Preview Ready</p>
                                  <p className="text-xs text-gray-500">Listen to your trash talk</p>
                                </div>
                              </div>
                            </div>
                            <audio 
                              ref={voicePreviewRef} 
                              src={voicePreviewUrl} 
                              className="hidden" 
                              onEnded={() => setIsVoicePreviewPlaying(false)} 
                            />
                          </div>
                        )}
                        
                        {ENABLE_IMAGE_GENERATION && generatedImageUrl && (
                          <div className="p-3 bg-gray-100 rounded-lg">
                            <div className="mb-2">
                              <p className="text-sm font-medium text-gray-700">Generated Image</p>
                              <p className="text-xs text-gray-500">AI-generated image for your trash talk</p>
                            </div>
                            <div className="relative rounded-lg overflow-hidden border border-gray-200">
                              <img 
                                src={generatedImageUrl} 
                                alt="Generated trash talk image"
                                className="w-full h-auto object-contain"
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex space-x-2 pt-2">
                          <button
                            onClick={() => {
                              setIsScriptGenerated(false);
                              setVoiceScriptText('');
                              setVoicePreviewUrl(null);
                              setGeneratedImageUrl(null);
                              setShowImagePreview(false);
                            }}
                            className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                          >
                            Back
                          </button>
                          
                          <button
                            onClick={convertScriptToSpeech}
                            disabled={!voiceScriptText.trim() || generatingVoice}
                            className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:bg-indigo-400"
                          >
                            {generatingVoice ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Converting...
                              </>
                            ) : (
                              'Convert to Speech'
                            )}
                          </button>
                        </div>
                        
                        {ENABLE_IMAGE_GENERATION && (
                          <div className="pt-2">
                            <button
                              onClick={generateTrashTalkImage}
                              disabled={isGeneratingImage || !voiceScriptText}
                              className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center disabled:bg-purple-400"
                            >
                              {isGeneratingImage ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Creating Meme...
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="h-4 w-4" />
                                  Generate Trash Talk Meme
                                </>
                              )}
                            </button>
                          </div>
                        )}
                        
                        {(voicePreviewUrl || (ENABLE_IMAGE_GENERATION && generatedImageUrl)) && (
                          <div className="pt-2">
                            <button
                              onClick={() => {
                                setShowVoiceGenerator(false);
                              }}
                              className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                              Use This Message
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSendMessage} className="flex flex-col space-y-2">
              <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowMediaSelector(true)}
                    className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
                    title="Add Media"
                  >
                    <Image className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSmackGenerator(true)}
                    className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
                    title="AI Smack Generator"
                  >
                    <Zap className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVoiceGenerator(true)}
                    className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
                    title="Voice-Powered Trash Talk"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <line x1="12" y1="19" x2="12" y2="23"></line>
                      <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                  </button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`p-2 ${isRecording ? 'text-red-500' : 'text-gray-500 hover:text-indigo-600'} transition-colors`}
                      title={recordingMode === 'transcription' ? 'Voice Search for Media' : 'Record Voice Memo'}
                    >
                      <Mic className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={toggleRecordingMode}
                      className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                      title="Toggle recording mode"
                    >
                      {recordingMode === 'transcription' ? 'T' : 'V'}
                    </button>
                  </div>
                </div>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                  disabled={!newMessage.trim() && !selectedMedia.url && !audioUrl}
              >
                <Send className="h-4 w-4 mr-1" />
                Send
              </button>
              </div>
              
              {showMediaSelector && (
                <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex border-b border-gray-200">
                    <button
                      className={`flex-1 py-2 px-4 text-center font-medium ${mediaTab === 'memes' ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-gray-600'}`}
                      onClick={() => setMediaTab('memes')}
                    >
                      Memes
                    </button>
                    <button
                      className={`flex-1 py-2 px-4 text-center font-medium ${mediaTab === 'gifs' ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-gray-600'}`}
                      onClick={() => setMediaTab('gifs')}
                    >
                      GIFs
                    </button>
                  </div>
                  
                  <div className="p-3 bg-gray-50 max-h-60 overflow-y-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {popularMedia[mediaTab].map((item, index) => (
                        <div 
                          key={index}
                          className="cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:border-indigo-400 transition-colors bg-white"
                          onClick={() => handleSelectMedia(mediaTab === 'memes' ? 'meme' : 'gif', item.url)}
                        >
                          <img 
                            src={item.url} 
                            alt={item.alt}
                            className="w-full h-32 object-contain p-1"
                          />
                          <div className="p-1 text-xs text-gray-600 text-center truncate">
                            {item.alt}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  )
} 