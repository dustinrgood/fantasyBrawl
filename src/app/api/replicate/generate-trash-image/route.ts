// This file creates a new API route for generating trash talk images using Replicate
import { NextResponse } from "next/server";
import Replicate from "replicate";

// Use Node.js runtime for this API route
export const runtime = "nodejs";

// Define the interface for the request body
interface GenerateTrashImageRequest {
  trashTalkText: string;
  targetTeam?: string;
  targetPlayer?: string;
  sportType?: string;
}

export async function POST(req: Request) {
  try {
    console.log("Starting trash talk image generation");
    
    // Get the API key from environment variables
    const replicateApiKey = process.env.REPLICATE_API_KEY;
    
    // Log environment variables for debugging (without exposing full key)
    console.log("Environment variables check:", {
      hasReplicateKey: !!replicateApiKey,
      keyPrefix: replicateApiKey ? replicateApiKey.substring(0, 5) + '...' : 'undefined',
      envKeys: Object.keys(process.env).filter(key => key.includes('REPLICATE')),
    });
    
    if (!replicateApiKey) {
      console.error("Replicate API key is not configured");
      return NextResponse.json(
        { error: "Replicate API key is not configured" },
        { status: 500 }
      );
    }

    // Parse the request body
    const {
      trashTalkText,
      targetTeam,
      targetPlayer,
      sportType = "fantasy football",
    }: GenerateTrashImageRequest = await req.json();

    console.log("Request params:", { 
      trashTalkTextLength: trashTalkText?.length,
      targetTeam,
      targetPlayer,
      sportType
    });

    // Validate required fields
    if (!trashTalkText) {
      console.error("Trash talk text is required");
      return NextResponse.json(
        { error: "Trash talk text is required" },
        { status: 400 }
      );
    }

    // Function to sanitize text to avoid NSFW detection
    const sanitizeText = (text: string): string => {
      if (!text) return "";
      
      // List of potentially problematic words to filter out
      const problematicWords = [
        'shit', 'clit', 'fuck', 'ass', 'damn', 'hell', 'crap', 'dick', 'cock', 'pussy', 
        'bitch', 'bastard', 'whore', 'slut'
      ];
      
      let sanitized = text;
      
      // Replace problematic words with more neutral alternatives
      problematicWords.forEach(word => {
        const regex = new RegExp(word, 'gi');
        sanitized = sanitized.replace(regex, 'rival');
      });
      
      return sanitized;
    };

    // Create a more humorous, meme-like prompt based on the trash talk
    const extractMainInsult = (text: string) => {
      // Try to extract the core insult or joke from the trash talk
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      return sentences.length > 0 ? sentences[0] : text;
    };

    // Sanitize inputs
    const sanitizedTrashTalk = sanitizeText(trashTalkText);
    const sanitizedTeam = sanitizeText(targetTeam || "");
    const sanitizedPlayer = targetPlayer || "";
    
    const mainInsult = extractMainInsult(sanitizedTrashTalk);
    
    // Create a more meme-oriented prompt with humor elements
    const memePrompt = `
      Funny sports meme: ${mainInsult}
      Style: Internet meme, exaggerated comedy, satirical sports illustration
      ${sanitizedPlayer ? `Feature: ${sanitizedPlayer} looking ridiculous or defeated` : ''}
      ${sanitizedTeam ? `Team context: ${sanitizedTeam}` : ''}
      Sport: ${sportType}
      Include: Exaggerated facial expressions, comic elements, bold meme-style text
      Mood: Humorous, sarcastic, over-the-top
      Quality: High detail, vibrant colors, cartoon-like exaggeration
    `.trim().replace(/\n\s+/g, ' ');
    
    console.log("Using meme-style prompt:", memePrompt);

    // Initialize the Replicate client
    const replicate = new Replicate({
      auth: replicateApiKey,
    });

    console.log("Initialized Replicate client");

    try {
      // Run the model with settings optimized for meme-like images
      console.log("Running Stable Diffusion model");
      const output = await replicate.run(
        "stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd7478",
        {
          input: {
            prompt: memePrompt,
            negative_prompt: "low quality, blurry, distorted, deformed, ugly, bad anatomy, boring, plain, photorealistic, nsfw, nude, sexual, inappropriate",
            width: 768,
            height: 768,
            num_outputs: 1,
            num_inference_steps: 30,
            guidance_scale: 8.5, // Increased for more creative results
            scheduler: "K_EULER_ANCESTRAL", // Better for creative images
          },
        }
      );

      console.log("Model output:", output);

      // The output should be an array of image URLs
      const imageUrl = Array.isArray(output) ? output[0] : output;

      if (!imageUrl) {
        throw new Error("No image URL returned from Replicate");
      }

      console.log("Image generation completed successfully");
      console.log("Generated image URL:", imageUrl);

      // Return the generated image URL and the prompt
      return NextResponse.json({
        imageUrl,
        prompt: memePrompt,
      });
    } catch (replicateError) {
      console.error("Replicate API error:", replicateError);
      
      // If NSFW content is detected, try again with a more sanitized prompt
      if (String(replicateError).includes("NSFW content detected")) {
        console.log("NSFW content detected, trying with a more generic prompt");
        
        // Create a very generic sports meme prompt
        const safePrompt = `
          Funny sports meme about a football player making mistakes
          Style: Internet meme, exaggerated comedy, satirical sports illustration
          Feature: Football player looking ridiculous or defeated
          Sport: fantasy football
          Include: Exaggerated facial expressions, comic elements, bold meme-style text
          Mood: Humorous, sarcastic, over-the-top
          Quality: High detail, vibrant colors, cartoon-like exaggeration
        `.trim().replace(/\n\s+/g, ' ');
        
        try {
          console.log("Using safe fallback prompt:", safePrompt);
          
          const safeOutput = await replicate.run(
            "stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd7478",
            {
              input: {
                prompt: safePrompt,
                negative_prompt: "low quality, blurry, distorted, deformed, ugly, bad anatomy, boring, plain, photorealistic, nsfw, nude, sexual, inappropriate",
                width: 768,
                height: 768,
                num_outputs: 1,
                num_inference_steps: 30,
                guidance_scale: 8.5,
                scheduler: "K_EULER_ANCESTRAL",
              },
            }
          );
          
          const safeImageUrl = Array.isArray(safeOutput) ? safeOutput[0] : safeOutput;
          
          if (!safeImageUrl) {
            throw new Error("No image URL returned from fallback prompt");
          }
          
          console.log("Fallback image generation completed successfully");
          console.log("Generated fallback image URL:", safeImageUrl);
          
          return NextResponse.json({
            imageUrl: safeImageUrl,
            prompt: safePrompt,
            isFallback: true
          });
        } catch (fallbackError) {
          console.error("Fallback prompt also failed:", fallbackError);
          return NextResponse.json(
            { error: "Failed to generate image with fallback prompt", details: String(fallbackError) },
            { status: 500 }
          );
        }
      }
      
      return NextResponse.json(
        { error: "Failed to generate image with Replicate", details: String(replicateError) },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error("Error generating trash talk image:", error);
    return NextResponse.json(
      { error: "Failed to generate trash talk image", details: String(error) },
      { status: 500 }
    );
  }
} 