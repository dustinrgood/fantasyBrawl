import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextResponse } from "next/server";

// Remove edge runtime and use Node.js runtime instead
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { 
      targetTeam, 
      targetPlayer, 
      userTeam, 
      sportType = "fantasy football",
      style = "funny"
    } = await req.json();

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

    // Stream the response
    const result = await streamText({
      model: openai("gpt-4o"),
      prompt,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error generating trash talk:", error);
    return NextResponse.json(
      { error: "Failed to generate trash talk" },
      { status: 500 }
    );
  }
} 