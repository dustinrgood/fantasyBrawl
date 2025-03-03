import { NextResponse } from "next/server";

// Use Node.js runtime for this API route
export const runtime = "nodejs";

// Define the interface for the request body
interface TextToSpeechRequest {
  text: string;
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  speakerBoost?: boolean;
}

export async function POST(req: Request) {
  try {
    // Get the API key from environment variables
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key is not configured" },
        { status: 500 }
      );
    }

    // Parse the request body
    const {
      text,
      voiceId = "21m00Tcm4TlvDq8ikWAM", // Default voice ID (Rachel)
      modelId = "eleven_monolingual_v1", // Default model
      stability = 0.5,
      similarityBoost = 0.75,
      style = 0,
      speakerBoost = true
    }: TextToSpeechRequest = await req.json();

    // Validate required fields
    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Prepare the request to ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style,
            use_speaker_boost: speakerBoost,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("ElevenLabs API error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate speech", details: errorData },
        { status: response.status }
      );
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer();
    
    // Return the audio as a response
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
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