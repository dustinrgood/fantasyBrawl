import { TrashTalkMessage, Manager, Matchup, League, FantasyTeam } from '../types/fantasy'

interface TrashTalkPrompt {
  senderManager: Manager
  receiverManager: Manager
  matchup: Matchup
  senderLeague: League
  receiverLeague: League
  senderTeam?: FantasyTeam
  receiverTeam?: FantasyTeam
  tone?: 'friendly' | 'aggressive' | 'funny' | 'trash' | 'motivational'
  format?: 'text' | 'voice'
}

// Mock trash talk responses for development without API keys
const mockTrashTalkResponses = [
  "Your fantasy team is so bad, even the bench is trying to get traded!",
  "I've seen better draft picks in a kindergarten coloring contest!",
  "Your team's performance is like a bad WiFi connection - unreliable and disappointing.",
  "My grandmother could manage a better fantasy team, and she doesn't even know what football is!",
  "Your lineup decisions are like your fashion choices - questionable at best.",
  "I'm going to beat you so badly this week, you'll need to rename your team 'The Participation Trophy'.",
  "Your team is putting up fewer points than a soccer match in a snowstorm.",
  "I heard your star player is questionable this week. Actually, your whole team is questionable.",
  "My team is going to score so many points against you, the app might crash.",
  "Your fantasy strategy is like a flip phone - outdated and ineffective."
];

export const generateTrashTalk = async (prompt: TrashTalkPrompt): Promise<string> => {
  try {
    // Check if we're in development mode without API keys
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      console.warn('AI API keys not found. Using mock implementation.');
      // Return a random mock response
      const randomIndex = Math.floor(Math.random() * mockTrashTalkResponses.length);
      return mockTrashTalkResponses[randomIndex];
    }

    const response = await fetch('/api/openai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are a fantasy sports trash talk generator. Your job is to create entertaining, 
            witty, and engaging trash talk messages for fantasy sports league managers to send to their opponents. 
            The tone should match the requested style (${prompt.tone || 'trash'}). Keep messages concise (under 100 words) 
            and focused on fantasy sports competition. Incorporate specific details about the managers, teams, and matchups when available.`
          },
          {
            role: 'user',
            content: buildTrashTalkPrompt(prompt)
          }
        ]
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate trash talk')
    }

    const data = await response.json()
    return data.content
  } catch (error) {
    console.error('Error generating trash talk:', error)
    return 'Your opponent is too scared to respond. (AI generation failed)'
  }
}

export const generateVoiceTrashTalk = async (text: string): Promise<string> => {
  try {
    // Check if we're in development mode without API keys
    if (!process.env.DEEPGRAM_API_KEY) {
      console.warn('Deepgram API key not found. Using mock implementation.');
      return text;
    }

    // This would call a text-to-speech API
    // For now, we'll just return the text as a placeholder
    return text
  } catch (error) {
    console.error('Error generating voice trash talk:', error)
    return ''
  }
}

const buildTrashTalkPrompt = (prompt: TrashTalkPrompt): string => {
  const { senderManager, receiverManager, matchup, senderLeague, receiverLeague, senderTeam, receiverTeam, tone } = prompt
  
  let promptText = `Generate fantasy sports trash talk from ${senderManager.displayName} to ${receiverManager.displayName}. `
  
  promptText += `${senderManager.displayName} is from the "${senderLeague.name}" league and ${receiverManager.displayName} is from the "${receiverLeague.name}" league. `
  
  if (senderTeam && receiverTeam) {
    promptText += `${senderManager.displayName}'s team is "${senderTeam.name}" with a record of ${senderTeam.record.wins}-${senderTeam.record.losses}-${senderTeam.record.ties}. `
    promptText += `${receiverManager.displayName}'s team is "${receiverTeam.name}" with a record of ${receiverTeam.record.wins}-${receiverTeam.record.losses}-${receiverTeam.record.ties}. `
  }
  
  if (matchup.challengerScore !== undefined && matchup.challengedScore !== undefined) {
    const senderIsChallenger = matchup.challengerManagerId === senderManager.id
    const senderScore = senderIsChallenger ? matchup.challengerScore : matchup.challengedScore
    const receiverScore = senderIsChallenger ? matchup.challengedScore : matchup.challengerScore
    
    promptText += `Current score: ${senderManager.displayName} ${senderScore} - ${receiverScore} ${receiverManager.displayName}. `
  }
  
  promptText += `Make it ${tone || 'trash'} in tone. `
  
  return promptText
} 