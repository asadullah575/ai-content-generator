'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Loader2, History, Trash2, Target, Megaphone, Hash } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface HistoryItem {
  id: string;
  topic: string;
  platform: string;
  result: string;
  date: string;
}

export default function Home() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [tone, setTone] = useState('Casual');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('Drive Website Clicks');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load history from localStorage on page load
  useEffect(() => {
    const saved = localStorage.getItem('caption_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history');
      }
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem('caption_history', JSON.stringify(newHistory));
  };

  // Get character limit guideline based on platform
  const getCharacterLimit = () => {
    switch (platform) {
      case 'Twitter / X': return 280;
      case 'TikTok': return 2200;
      case 'Instagram': return 2200;
      case 'Threads': return 500;
      case 'LinkedIn': return 3000;
      default: return 5000;
    }
  };

  // Extract all unique hashtags from generated text
  const extractHashtags = (text: string) => {
    const regex = /#[a-zA-Z0-9_]+/g;
    const matches = text.match(regex);
    if (!matches) return [];
    return Array.from(new Set(matches));
  };

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform, tone, audience, goal }),
      });

      const data = await res.json();
      if (data.result) {
        setResult(data.result);

        // Add to history list (keep top 5)
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          topic,
          platform,
          result: data.result,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        saveHistory([newItem, ...history.slice(0, 4)]);
      } else {
        setResult(data.error || 'Failed to generate content');
      }
    } catch (err) {
      setResult('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (id) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyHashtagsOnly = () => {
    const hashtags = extractHashtags(result);
    if (hashtags.length === 0) return;
    navigator.clipboard.writeText(hashtags.join(' '));
    setCopiedHashtags(true);
    setTimeout(() => setCopiedHashtags(false), 2000);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('caption_history');
  };

  const extractedHashtags = extractHashtags(result);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 py-10">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          AI Content Generator
        </h1>
        <p className="text-slate-400 text-sm text-center mt-1">
          Create targeted, viral social media captions instantly
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Topic / Product Idea *
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. launching a new productivity app for founders"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="YouTube">YouTube (Title & Description)</option>
                <option value="YouTube Shorts">YouTube Shorts</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Twitter / X">Twitter / X</option>
                <option value="TikTok">TikTok</option>
                <option value="Threads">Threads</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="Casual">Casual & Relatable</option>
                <option value="Professional">Professional & Authoritative</option>
                <option value="Humorous">Humorous & Witty</option>
                <option value="Energetic">Energetic & Hype</option>
                <option value="Urgent">Urgent (FOMO)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Target className="w-3 h-3 text-purple-400" /> Target Audience (Optional)
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Small business owners"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Megaphone className="w-3 h-3 text-pink-400" /> Campaign Goal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="Drive Website Clicks">Drive Clicks / Sales</option>
                <option value="Maximize Comments">Maximize Engagement & Comments</option>
                <option value="Brand Awareness">Brand Awareness</option>
                <option value="Promote Event">Promote Event / Launch</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !topic}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium py-2 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Targeted Captions...
              </>
            ) : (
              'Generate Captions'
            )}
          </button>
        </div>

        {result && (
          <div className="mt-6 bg-slate-950 border border-slate-800 rounded-lg p-4 relative">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800/80">
              <span className="text-xs font-semibold text-purple-400">
                Generated Result:
              </span>
              <div className="flex items-center gap-2">
                {extractedHashtags.length > 0 && (
                  <button
                    onClick={handleCopyHashtagsOnly}
                    className="text-slate-300 hover:text-white transition flex items-center gap-1 text-xs bg-purple-950/60 hover:bg-purple-900/60 px-2.5 py-1 rounded border border-purple-800/50 cursor-pointer"
                  >
                    {copiedHashtags ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-green-400 font-medium">Hashtags Copied!</span>
                      </>
                    ) : (
                      <>
                        <Hash className="w-3.5 h-3.5 text-purple-400" />
                        <span>Copy Hashtags ({extractedHashtags.length})</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => handleCopy(result)}
                  className="text-slate-400 hover:text-white transition flex items-center gap-1 text-xs bg-slate-900 px-2.5 py-1 rounded border border-slate-800 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-green-400">Copied All!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy All</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="text-sm text-slate-200 leading-relaxed space-y-2">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
              <span>Platform limit: ~{getCharacterLimit()} chars</span>
              <div className="flex items-center gap-3">
                <span>{extractedHashtags.length} hashtags</span>
                <span>•</span>
                <span>{result.length} chars</span>
              </div>
            </div>
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-8 border-t border-slate-800 pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-slate-300 text-sm font-semibold">
                <History className="w-4 h-4 text-purple-400" />
                <span>Recent History</span>
              </div>
              <button
                onClick={clearHistory}
                className="text-xs text-slate-500 hover:text-red-400 transition flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear History</span>
              </button>
            </div>

            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-300"
                >
                  <div className="flex items-center justify-between text-slate-400 mb-1.5">
                    <span className="font-medium text-purple-300">
                      {item.platform} • "{item.topic}"
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500">{item.date}</span>
                      <button
                        onClick={() => handleCopy(item.result, item.id)}
                        className="hover:text-white transition p-1 bg-slate-900 rounded border border-slate-800 cursor-pointer"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="line-clamp-2 text-slate-400">
                    <ReactMarkdown>{item.result}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
