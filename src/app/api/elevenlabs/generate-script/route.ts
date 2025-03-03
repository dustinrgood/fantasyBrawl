// This file creates a new API route for generating trash talk scripts without converting to speech
import { NextResponse } from "next/server";

// Use Node.js runtime for this API route
export const runtime = "nodejs";

// Define the interface for the request body
interface GenerateScriptRequest {
  targetTeam: string;
  targetPlayer?: string;
  userTeam?: string;
  sportType?: string;
  style?: string;
}

export async function POST(req: Request) {
  try {
    // Parse the request body
    const {
      targetTeam,
      targetPlayer,
      userTeam,
      sportType = "fantasy football",
      style = "funny",
    }: GenerateScriptRequest = await req.json();

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

    // Return the generated script
    return NextResponse.json({ script: trashTalkText });
    
  } catch (error) {
    console.error("Error generating script:", error);
    return NextResponse.json(
      { error: "Failed to generate script" },
      { status: 500 }
    );
  }
} 