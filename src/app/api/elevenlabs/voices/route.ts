import { NextResponse } from "next/server";

// Use Node.js runtime for this API route
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    // Get the API key from environment variables
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key is not configured" },
        { status: 500 }
      );
    }

    // Fetch voices from ElevenLabs API
    const response = await fetch(
      "https://api.elevenlabs.io/v1/voices",
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "xi-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("ElevenLabs API error:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch voices", details: errorData },
        { status: response.status }
      );
    }

    // Parse the response
    const data = await response.json();
    
    // Return the voices data
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching voices:", error);
    return NextResponse.json(
      { error: "Failed to fetch voices" },
      { status: 500 }
    );
  }
} 