import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, platform, tone, targetAudience, campaignGoal, language } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY environment variable is missing on Vercel.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert social media manager and viral content creator.
Generate 3 distinct, engaging social media caption options tailored for ${platform || 'Instagram'}.

Target Language: Write the ENTIRE output strictly in ${language || 'English'}.
Topic / Core Message: ${topic}
Desired Tone: ${tone || 'Casual & Relatable'}
Target Audience: ${targetAudience || 'General Audience'}
Campaign Goal: ${campaignGoal || 'Drive Engagement'}

Requirements:
- Provide 3 structured variations (e.g. Option 1: Short & Punchy, Option 2: Storytelling, Option 3: Call-To-Action focused).
- Include relevant emojis.
- Include 3 to 5 targeted hashtags for ${platform}.
- Format with clear line breaks so it is easily readable.`;

    let generatedText = '';

    // Attempt generation with recommended models
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
        });

        if (response && response.text) {
          generatedText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Failed with model ${modelName}:`, err?.message || err);
        lastError = err;
      }
    }

    if (!generatedText) {
      throw new Error(
        lastError?.message || 'Failed to generate captions from Gemini models.'
      );
    }

    return NextResponse.json({ result: generatedText });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while generating content.' },
      { status: 500 }
    );
  }
}
