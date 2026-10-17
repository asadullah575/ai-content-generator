import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { topic, platform, tone, targetAudience, campaignGoal, language } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured in environment variables' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert social media manager and viral content creator.
Generate 3 distinct, engaging social media caption options tailored for ${platform}.

Target Language: Write the ENTIRE output strictly in ${language || 'English'}.
Topic / Core Message: ${topic}
Desired Tone: ${tone}
Target Audience: ${targetAudience || 'General Audience'}
Campaign Goal: ${campaignGoal}

Requirements:
- Provide 3 structured variations (e.g. Option 1: Short & Punchy, Option 2: Storytelling, Option 3: Call-To-Action focused).
- Include relevant emojis.
- Include 3 to 5 targeted hashtags for ${platform}.
- Format with clear line breaks so it is easily readable.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    return NextResponse.json({ result: response.text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while generating content.' },
      { status: 500 }
    );
  }
}
