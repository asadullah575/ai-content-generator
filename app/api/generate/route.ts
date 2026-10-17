import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { topic, platform, tone, audience, goal } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    let platformInstructions = '';
    if (platform === 'YouTube') {
      platformInstructions = 'Provide 3 click-worthy Video Titles and 1 engaging Video Description with timestamps placeholder and keywords.';
    } else if (platform === 'YouTube Shorts' || platform === 'TikTok') {
      platformInstructions = 'Provide 3 short, punchy hook lines, video caption, and viral hashtags.';
    } else if (platform === 'Facebook') {
      platformInstructions = 'Write 3 community-focused Facebook posts encouraging comments and shares.';
    } else {
      platformInstructions = `Write 3 engaging captions tailored specifically for ${platform}. Include relevant emojis and hashtags.`;
    }

    const prompt = `You are an expert social media strategist and copywriter.
Topic/Product: "${topic}"
Target Platform: ${platform}
Brand Tone: ${tone}
${audience ? `Target Audience: ${audience}` : ''}
${goal ? `Primary Campaign Goal: ${goal}` : ''}

Instructions:
${platformInstructions}
Ensure the captions directly address the target audience and drive towards the specified campaign goal.`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: prompt,
    });

    return NextResponse.json({ result: response.text });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}
