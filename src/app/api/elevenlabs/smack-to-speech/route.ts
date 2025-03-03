import { NextResponse } from "next/server";

// Use Node.js runtime for this API route
export const runtime = "nodejs";

// Define the interface for the request body
interface SmackToSpeechRequest {
  targetTeam: string;
  targetPlayer?: string;
  userTeam?: string;
  sportType?: string;
  style?: string;
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}

export async function POST(req: Request) {
  try {
    // Get the API key from environment variables
    const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!elevenlabsApiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key is not configured" },
        { status: 500 }
      );
    }

    // Parse the request body
    const {
      targetTeam,
      targetPlayer,
      userTeam,
      sportType = "fantasy football",
      style = "funny",
      voiceId = "21m00Tcm4TlvDq8ikWAM", // Default voice ID (Rachel)
      modelId = "eleven_monolingual_v1", // Default model
      stability = 0.5,
      similarityBoost = 0.75,
    }: SmackToSpeechRequest = await req.json();

    // Validate required fields
    if (!targetTeam) {
      return NextResponse.json(
        { error: "Target team is required" },
        { status: 400 }
      );
    }

    // Create a prompt that will generate personalized trash talk
    const prompt = `Generate a creative trash talk message for fantasy sports. 
    ${targetPlayer ? `Specifically mock ${targetPlayer} who plays for ${targetTeam}.` : `Mock the team ${targetTeam}.`}
    ${userTeam ? `The trash talk is coming from a fan of ${userTeam}.` : ''}
    The sport is ${sportType}.
    Make it ${style} and keep it under 150 characters.
    Don't use hashtags or emojis.
    Make it sound like something a real fan would say, not an AI.
    Be creative and specific to the sport.`;

    // Generate the trash talk text using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a sports fan who loves trash talking. Keep responses concise and authentic.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("OpenAI API error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate trash talk", details: errorData },
        { status: response.status }
      );
    }

    const openaiData = await response.json();
    const trashTalkText = openaiData.choices[0].message.content.trim();

    // Now convert the text to speech using ElevenLabs
    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": elevenlabsApiKey,
        },
        body: JSON.stringify({
          text: trashTalkText,
          model_id: modelId,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errorData = await ttsResponse.json().catch(() => null);
      console.error("ElevenLabs API error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate speech", details: errorData },
        { status: ttsResponse.status }
      );
    }

    // Get the audio data
    const audioBuffer = await ttsResponse.arrayBuffer();
    
    // Return the audio as a response with the text in the headers
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "X-Trash-Talk-Text": encodeURIComponent(trashTalkText),
      },
    });
  } catch (error) {
    console.error("Error generating speech:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
} 