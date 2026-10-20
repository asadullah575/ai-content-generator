'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Sparkles, AlertCircle, Globe, Image as ImageIcon, History, Trash2, ChevronRight, Hash, Smile, Megaphone, Crown, Zap } from 'lucide-react';

interface HistoryItem {
  id: string;
  topic: string;
  platform: string;
  language: string;
  captions: string;
  imagePrompt: string;
  timestamp: string;
}

export default function Home() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [tone, setTone] = useState('Casual & Relatable');
  const [language, setLanguage] = useState('English');
  const [targetAudience, setTargetAudience] = useState('');
  const [campaignGoal, setCampaignGoal] = useState('Drive Clicks / Sales');

  // Formatting Toggles
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeCTA, setIncludeCTA] = useState(true);

  const [resultText, setResultText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedImagePrompt, setCopiedImagePrompt] = useState(false);

  // Credits & Subscription State
  const [credits, setCredits] = useState<number>(5);
  const [isPro, setIsPro] = useState<boolean>(false);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Load history
    const savedHistory = localStorage.getItem('captioniq_history');
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) {}
    }

    // Load credits or pro status
    const savedPro = localStorage.getItem('captioniq_is_pro');
    if (savedPro === 'true') {
      setIsPro(true);
    } else {
      const savedCredits = localStorage.getItem('captioniq_credits');
      if (savedCredits !== null) {
        setCredits(parseInt(savedCredits, 10));
      } else {
        localStorage.setItem('captioniq_credits', '5');
      }
    }
  }, []);

  const platformLimits: Record<string, number> = {
    Instagram: 2200,
    Twitter: 280,
    LinkedIn: 3000,
    Facebook: 63206,
    TikTok: 2200,
  };

  const currentLimit = platformLimits[platform] || 2200;

  const parseResponse = (text: string) => {
    const caps = text.includes('=== AI IMAGE PROMPT ===')
      ? text.split('=== AI IMAGE PROMPT ===')[0].replace('=== CAPTIONS ===', '').trim()
      : text;

    const img = text.includes('=== AI IMAGE PROMPT ===')
      ? text.split('=== AI IMAGE PROMPT ===')[1].trim()
      : '';

    return { caps, img };
  };

  const { caps: captionSection, img: imagePromptSection } = parseResponse(resultText);

  const saveToHistory = (rawText: string, topicInput: string, platformInput: string, langInput: string) => {
    const { caps, img } = parseResponse(rawText);
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      topic: topicInput,
      platform: platformInput,
      language: langInput,
      captions: caps,
      imagePrompt: img,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [newItem, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('captioniq_history', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('captioniq_history');
  };

  const handleUpgradeToPro = () => {
    // In production, this would redirect to your Stripe Checkout URL (e.g. https://buy.stripe.com/your_link_id)
    // For demo purposes, we simulate activating Pro:
    setIsPro(true);
    localStorage.setItem('captioniq_is_pro', 'true');
    alert('🎉 Simulated Stripe Checkout Successful! Welcome to Captioniq Pro.');
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    if (!isPro && credits <= 0) {
      setError('You have run out of free generations! Please upgrade to Pro for unlimited usage.');
      return;
    }

    setLoading(true);
    setError('');
    setResultText('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic, 
          platform, 
          tone, 
          language, 
          targetAudience, 
          campaignGoal,
          includeEmojis,
          includeHashtags,
          includeCTA
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }

      setResultText(data.result);
      saveToHistory(data.result, topic, platform, language);

      // Deduct credit if not Pro
      if (!isPro) {
        const newCredits = credits - 1;
        setCredits(newCredits);
        localStorage.setItem('captioniq_credits', newCredits.toString());
      }

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyCaptions = (text?: string) => {
    const target = text || captionSection;
    if (!target) return;
    navigator.clipboard.writeText(target);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const copyImagePrompt = (text?: string) => {
    const target = text || imagePromptSection;
    if (!target) return;
    navigator.clipboard.writeText(target);
    setCopiedImagePrompt(true);
    setTimeout(() => setCopiedImagePrompt(false), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-x-hidden">
      
      {/* Top Bar Controls (History & Credits / Pro) */}
      <div className="fixed top-4 right-4 z-20 flex items-center gap-3">
        {/* Credits / Pro Badge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 shadow-xl text-xs font-medium">
          {isPro ? (
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <Crown className="w-4 h-4" /> PRO UNLIMITED
            </span>
          ) : (
            <span className="flex items-center gap-1 text-purple-400">
              <Zap className="w-3.5 h-3.5" /> {credits} Free Credits Left
            </span>
          )}
        </div>

        {/* History Toggle Button */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white hover:border-purple-500 shadow-xl transition-all"
        >
          <History className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium">History ({history.length})</span>
        </button>
      </div>

      {/* History Drawer Sidebar */}
      {showHistory && (
        <div className="fixed inset-y-0 right-0 z-30 w-full max-w-md bg-slate-900 border-l border-slate-800 p-6 shadow-2xl flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-purple-400" />
              Generation History
            </h2>
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                  title="Clear History"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setShowHistory(false)}
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {history.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No saved generations yet.</p>
            ) : (
              history.map((item) => (
                <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-purple-400">{item.platform} • {item.language}</span>
                    <span>{item.timestamp}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-200 line-clamp-1">"{item.topic}"</p>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() => copyCaptions(item.captions)}
                      className="text-xs text-purple-300 hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copy Captions
                    </button>
                    {item.imagePrompt && (
                      <button
                        onClick={() => copyImagePrompt(item.imagePrompt)}
                        className="text-xs text-pink-300 hover:underline flex items-center gap-1 ml-auto"
                      >
                        <ImageIcon className="w-3 h-3" /> Copy Prompt
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Generator Form */}
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
        
        {/* Upgrade Banner for Free Users */}
        {!isPro && (
          <div className="bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-red-900/40 border border-purple-500/40 rounded-xl p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" /> Captioniq Pro
              </h3>
              <p className="text-xs text-slate-300">Unlock unlimited generations & advanced features for $9/mo</p>
            </div>
            <button
              onClick={handleUpgradeToPro}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white rounded-lg text-xs font-semibold shadow-md transition-all shrink-0"
            >
              Upgrade ($9)
            </button>
          </div>
        )}

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

          {/* Formatting Options Toggles */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Formatting Preferences
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setIncludeEmojis(!includeEmojis)}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  includeEmojis 
                    ? 'bg-purple-950/60 border-purple-500 text-purple-200' 
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Smile className="w-3.5 h-3.5" />
                Emojis
              </button>

              <button
                type="button"
                onClick={() => setIncludeHashtags(!includeHashtags)}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  includeHashtags 
                    ? 'bg-purple-950/60 border-purple-500 text-purple-200' 
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Hash className="w-3.5 h-3.5" />
                Hashtags
              </button>

              <button
                type="button"
                onClick={() => setIncludeCTA(!includeCTA)}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  includeCTA 
                    ? 'bg-purple-950/60 border-purple-500 text-purple-200' 
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                Call-To-Action
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || (!isPro && credits <= 0) || !topic.trim()}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-xl font-semibold text-white shadow-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating Captions & Image Prompt...
              </>
            ) : (!isPro && credits <= 0) ? (
              <>Out of Free Credits - Upgrade to Pro</>
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
                  onClick={() => copyCaptions()}
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
                onClick={() => copyImagePrompt()}
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
