// AITutor.jsx
// Chat panel for Archie the AI Tutor: text + mic input, bilingual (English/Tamil)
// speech recognition, spoken replies, thinking indicator, and video creator integration.

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Volume2, Video } from 'lucide-react';
import { useBilingualVoice } from './src/components/useBilingualVoice';

export default function AITutor({
  grade = 4,
  subject = 'science',
  lesson = '',
  topic = '',
  topicIndex = 1,
  userApiKey,
  onOpenVideoCreator
}) {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hi! I'm Archie 🦉 Ask me anything about this lesson — or any general question you're curious about!" }
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('en'); // 'en' | 'ta'
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const { isListening, micError, startListening, stopListening, speak } = (useBilingualVoice ? useBilingualVoice({
    preferredLang: language,
    onResult: ({ transcript, lang }) => {
      setInput(transcript);
      sendMessage(transcript, lang);
    }
  }) : { isListening: false, micError: null, startListening: () => {}, stopListening: () => {}, speak: () => {} });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  async function sendMessage(text, langOverride) {
    const messageText = (text ?? input).trim();
    if (!messageText || isSending) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const effectiveLang = langOverride || language;
    setMessages(prev => [...prev, { sender: 'user', text: messageText }]);
    setInput('');
    setIsSending(true);

    try {
      // Limit to most recent 6 messages to optimize latency
      const recentHistory = messages.slice(-6).map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          message: messageText,
          chatHistory: recentHistory,
          grade,
          subject,
          lesson,
          topic,
          topicIndex,
          userApiKey,
          language: effectiveLang
        })
      });

      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      const replyText = data.text || "Hmm, I didn't quite get an answer — try asking again?";

      setMessages(prev => [...prev, {
        sender: 'ai',
        text: replyText,
        action: data.action || null
      }]);
      speak(replyText, effectiveLang);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Chat request failed:', err);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: effectiveLang === 'ta'
          ? "மன்னிக்கவும், ஒரு சிக்கல் ஏற்பட்டது. மீண்டும் முயற்சிக்கவா? 🦉"
          : "Oops, I got a bit tangled up! Can we try that again? 🦉"
      }]);
    } finally {
      setIsSending(false);
    }
  }

  const handleTriggerVideo = (action) => {
    if (onOpenVideoCreator) {
      onOpenVideoCreator({
        topic: action?.topic || topic || 'Science',
        subject,
        grade,
        language
      });
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-white rounded-2xl shadow-lg border border-orange-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-orange-100">
        <h3 className="font-semibold text-orange-600">🦉 Archie — AI Tutor</h3>
        <div className="flex gap-1 text-sm">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded-md ${language === 'en' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600'}`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('ta')}
            className={`px-2 py-1 rounded-md ${language === 'ta' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600'}`}
          >
            தமிழ்
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
              m.sender === 'user' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-gray-800'
            }`}>
              {m.text}
              {m.sender === 'ai' && (
                <button
                  onClick={() => speak(m.text, language)}
                  className="ml-2 inline-flex align-middle text-orange-400 hover:text-orange-600"
                  title="Play reply"
                >
                  <Volume2 size={14} />
                </button>
              )}
              {m.sender === 'ai' && m.action && m.action.type === 'create_video' && (
                <div className="mt-2">
                  <button
                    onClick={() => handleTriggerVideo(m.action)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition"
                  >
                    <Video size={12} />
                    {m.action.label || '🎬 Create Video'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isSending && <div className="text-xs text-gray-400 italic">Archie is thinking... 🦉</div>}
        <div ref={chatEndRef} />
      </div>

      {micError && (
        <div className="px-4 py-1 text-xs text-red-500">{micError}</div>
      )}

      {/* Input row */}
      <div className="flex items-center gap-2 px-3 py-3 border-t border-orange-100">
        <button
          onClick={() => (isListening ? stopListening() : startListening())}
          className={`p-2 rounded-full ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-orange-100 text-orange-600'}`}
          title={isListening ? 'Stop listening' : 'Ask by voice'}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          disabled={isSending}
          placeholder={language === 'ta' ? 'உங்கள் கேள்வியை எழுதுங்கள்...' : 'Ask Archie any question...'}
          className="flex-1 border border-orange-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <button
          onClick={() => sendMessage()}
          disabled={isSending || !input.trim()}
          className="p-2 rounded-full bg-orange-500 text-white disabled:opacity-40"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
