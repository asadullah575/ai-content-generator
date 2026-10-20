import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      topic, 
      platform, 
      tone, 
      targetAudience, 
      campaignGoal, 
      language,
      includeEmojis = true,
      includeHashtags = true,
      includeCTA = true
    } = body;

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

    const formattingRules = [
      includeEmojis ? '- Include engaging, relevant emojis throughout.' : '- DO NOT use any emojis in the output.',
      includeHashtags ? `- Include 3 to 5 targeted viral hashtags for ${platform || 'Instagram'}.` : '- DO NOT include any hashtags.',
      includeCTA ? '- Include a strong, explicit Call-To-Action (CTA) encouraging comments, shares, or link clicks.' : '- DO NOT include a Call-To-Action.'
    ].join('\n');

    const prompt = `You are an expert social media manager, visual creative director, and viral content strategist.
Generate 3 distinct social media caption options along with 1 matching AI Image Prompt tailored for ${platform || 'Instagram'}.

Target Language for Captions: Write the entire caption section in ${language || 'English'}.
Topic / Core Message: ${topic}
Desired Tone: ${tone || 'Casual & Relatable'}
Target Audience: ${targetAudience || 'General Audience'}
Campaign Goal: ${campaignGoal || 'Drive Engagement'}

Formatting Constraints:
${formattingRules}

Format your response strictly using this structure:

=== CAPTIONS ===
Option 1 (Short & Punchy):
[Caption text]

Option 2 (Storytelling):
[Caption text]

Option 3 (Detailed / Value-Focused):
[Caption text]

=== AI IMAGE PROMPT ===
[Provide a descriptive, high-quality prompt in English suitable for Midjourney/DALL-E 3 that visually captures the concept of this post. Include style, lighting, mood, color palette, and composition details.]`;

    let generatedText = '';
    
    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-pro',
      'gemini-flash-latest'
    ];
    let lastErrorDetails = '';

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
        lastErrorDetails = err?.message || JSON.stringify(err);
      }
    }

    if (!generatedText) {
      return NextResponse.json(
        { error: `The AI service is temporarily experiencing heavy traffic. Details: ${lastErrorDetails}` },
        { status: 503 }
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
