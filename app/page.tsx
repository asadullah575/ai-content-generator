'use client';

import { useState } from 'react';
import { Copy, Check, Sparkles, AlertCircle, Globe, Image as ImageIcon } from 'lucide-react';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [tone, setTone] = useState('Casual & Relatable');
  const [language, setLanguage] = useState('English');
  const [targetAudience, setTargetAudience] = useState('');
  const [campaignGoal, setCampaignGoal] = useState('Drive Clicks / Sales');
  const [resultText, setResultText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedImagePrompt, setCopiedImagePrompt] = useState(false);

  const platformLimits: Record<string, number> = {
    Instagram: 2200,
    Twitter: 280,
    LinkedIn: 3000,
    Facebook: 63206,
    TikTok: 2200,
  };

  const currentLimit = platformLimits[platform] || 2200;

  // Split response into Captions and AI Image Prompt sections
  const captionSection = resultText.includes('=== AI IMAGE PROMPT ===')
    ? resultText.split('=== AI IMAGE PROMPT ===')[0].replace('=== CAPTIONS ===', '').trim()
    : resultText;

  const imagePromptSection = resultText.includes('=== AI IMAGE PROMPT ===')
    ? resultText.split('=== AI IMAGE PROMPT ===')[1].trim()
    : '';

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError('');
    setResultText('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform, tone, language, targetAudience, campaignGoal }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }

      setResultText(data.result);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyCaptions = () => {
    if (!captionSection) return;
    navigator.clipboard.writeText(captionSection);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const copyImagePrompt = () => {
    if (!imagePromptSection) return;
    navigator.clipboard.writeText(imagePromptSection);
    setCopiedImagePrompt(true);
    setTimeout(() => setCopiedImagePrompt(false), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-400" />
            Captioniq
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Create targeted social media captions & AI image prompts instantly
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Topic / Product Idea *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. launching an organic tea brand"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-slate-100 focus:outline-none focus:border-purple-500 transition-colors text-sm"
              >
                <option value="Instagram">Instagram</option>
                <option value="Twitter">X / Twitter</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Facebook">Facebook</option>
                <option value="TikTok">TikTok</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-slate-100 focus:outline-none focus:border-purple-500 transition-colors text-sm"
              >
                <option value="Casual & Relatable">Casual & Relatable</option>
                <option value="Professional & Authoritative">Professional & Authoritative</option>
                <option value="Witty & Humorous">Witty & Humorous</option>
                <option value="Urgent & Promotional">Urgent & Promotional</option>
                <option value="Inspirational & Storytelling">Inspirational & Storytelling</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-slate-100 focus:outline-none focus:border-purple-500 transition-colors text-sm"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Urdu">Urdu</option>
                <option value="Hindi">Hindi</option>
                <option value="Arabic">Arabic</option>
                <option value="Japanese">Japanese</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target Audience (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Wellness enthusiasts"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Campaign Goal
              </label>
              <select
                value={campaignGoal}
                onChange={(e) => setCampaignGoal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="Drive Clicks / Sales">Drive Clicks / Sales</option>
                <option value="Boost Engagement / Comments">Boost Engagement / Comments</option>
                <option value="Brand Awareness">Brand Awareness</option>
                <option value="Educate / Inform">Educate / Inform</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-xl font-semibold text-white shadow-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating Captions & Image Prompt...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Captions & Image Prompt
              </>
            )}
          </button>
        </form>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-950/50 border border-red-800 rounded-xl text-red-300 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Generated Captions */}
        {captionSection && (
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Captions ({language})
              </span>
              <div className="flex items-center gap-4">
                <span className={`text-xs font-medium ${captionSection.length > currentLimit ? 'text-red-400' : 'text-slate-400'}`}>
                  {captionSection.length} / {currentLimit} chars
                </span>

                <button
                  onClick={copyCaptions}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-lg transition-colors"
                >
                  {copiedCaption ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Captions
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 text-sm whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {captionSection}
            </div>
          </div>
        )}

        {/* AI Image Prompt Section */}
        {imagePromptSection && (
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                AI Image Prompt (Midjourney / DALL-E)
              </span>

              <button
                onClick={copyImagePrompt}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-pink-300 rounded-lg transition-colors"
              >
                {copiedImagePrompt ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Image Prompt
                  </>
                )}
              </button>
            </div>

            <div className="bg-purple-950/30 border border-purple-900/50 rounded-xl p-4 text-purple-200 text-sm leading-relaxed">
              {imagePromptSection}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
