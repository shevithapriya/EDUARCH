import React, { useState, useEffect, useRef } from 'react';
import { playSound } from '../utils/audio';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Globe,
  Film,
  Video
} from 'lucide-react';

const SUGGESTED_QUICK_CHIPS = {
  en: [
    "What is photosynthesis? 🌱",
    "Why is the sky blue? ☁️",
    "What is 25 × 12? 🧮",
    "Explain gravity 🍎",
    "Can you show me a video? 🎬",
    "Explain it like I am 10 years old 🦉"
  ],
  ta: [
    "ஒளிச்சேர்க்கை என்றால் என்ன? 🌱",
    "வானம் ஏன் நீலமாக உள்ளது? ☁️",
    "புவியீர்ப்பு விசை பற்றி கூறுங்கள் 🍎",
    "25 × 12 எவ்வளவு? 🧮",
    "ஒரு வீடியோ காட்ட முடியுமா? 🎬",
    "எளிதாக விளக்குங்கள் 🦉"
  ]
};

export default function AITutor({
  grade = 4,
  subject = 'science',
  lesson = '',
  topic = '',
  topicIndex = 1,
  language = 'en',
  isOpen,
  onClose,
  onOpenVideoCreator
}) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentLang, setCurrentLang] = useState(language);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Sync with language prop changes
  useEffect(() => {
    setCurrentLang(language);
  }, [language]);

  // Remove keys saved by older versions and initialize the welcome message.
  useEffect(() => {
    localStorage.removeItem('eduarch_gemini_api_key');

    setMessages([{
      id: 1,
      sender: 'archie',
      text: currentLang === 'ta'
        ? `வணக்கம்! 🦉 நான் ஆர்ச்சி, உங்கள் AI வழிகாட்டி! "${topic || 'உங்கள் பாடம்'}" பற்றியோ, கணிதம், அறிவியல் அல்லது "வானம் ஏன் நீலம்?", "ஒளிச்சேர்க்கை என்றால் என்ன?" போன்ற எந்த பொதுக் கேள்வியும் என்னிடம் கேட்கலாம். நான் தமிழில் விளக்குவேன்!`
        : `Hi! 🦉 I'm Archie, your AI Tutor! You can ask me ANY educational question—whether it's about "${topic || 'your lesson'}", maths like "25 × 12", science like "what is photosynthesis?", or curious questions like "why is the sky blue?". I speak English and Tamil!`,
      timestamp: new Date()
    }]);
  }, [currentLang, topic]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Text-to-Speech
  const speakText = (text) => {
    if (isMuted || !window.speechSynthesis || !text?.trim()) return;
    window.speechSynthesis.cancel();

    const isTa = /[\u0B80-\u0BFF]/.test(text) || currentLang === 'ta';
    // Remove emojis and asterisks from speech text
    const cleanText = text
      .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
      .replace(/\*\*/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = isTa ? 'ta-IN' : 'en-IN';
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(v => v.lang.startsWith(isTa ? 'ta' : 'en'));
    if (match) utterance.voice = match;

    window.speechSynthesis.speak(utterance);
  };

  // Speech-to-Text
  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(currentLang === 'ta'
        ? 'குரல் உள்ளீட்டிற்கு Chrome அல்லது Edge உலாவி தேவை.'
        : 'Voice input requires Chrome or Edge browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = currentLang === 'ta' ? 'ta-IN' : 'en-IN';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0]?.transcript || '')
        .join('')
        .trim();
      if (transcript) {
        setInputValue(transcript);
        handleSendMessage(transcript);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping) return; // Prevent duplicate requests while sending

    // Abort previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Detect Tamil text in user input
    const isUserQueryTamil = /[\u0B80-\u0BFF]/.test(text);
    const effectiveLang = isUserQueryTamil ? 'ta' : currentLang;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    try {
      // Limit conversation history to the most recent 6 messages to reduce token usage and latency
      const recentChatHistory = messages.slice(-6).map(msg => ({
        sender: msg.sender,
        text: msg.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          message: text,
          chatHistory: recentChatHistory,
          grade,
          subject,
          lesson,
          topic,
          topicIndex,
          language: effectiveLang
        })
      });

      const data = await res.json();
      const replyText = data.text || (effectiveLang === 'ta'
        ? "மன்னிக்கவும், மீண்டும் ஒருமுறை கேளுங்கள் 🦉"
        : "Hmm, I didn't quite catch that. Could you ask me again? 🦉");

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'archie',
        text: replyText,
        action: data.action || null,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
      speakText(replyText);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.warn("AI chat fetch error:", err);
      const fallbackReply = effectiveLang === 'ta'
        ? "சிறிய இணைப்பு கோளாறு 🦉 மீண்டும் ஒருமுறை முயற்சி செய்வோம்!"
        : "Oops! My feathers got a little tangled 🦉 Let me try again!";

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'archie',
        text: fallbackReply,
        timestamp: new Date()
      }]);
      speakText(fallbackReply);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTriggerVideoAction = (action) => {
    playSound.chime();
    if (onOpenVideoCreator) {
      onOpenVideoCreator({
        topic: action?.topic || topic || 'Science',
        subject: subject || 'Science',
        grade: grade || 4,
        language: currentLang
      });
    }
  };

  if (!isOpen) return null;

  const chips = SUGGESTED_QUICK_CHIPS[currentLang] || SUGGESTED_QUICK_CHIPS.en;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(3px)',
          zIndex: 1999
        }}
      />

      {/* Side Drawer Chatbot */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '430px',
          maxWidth: '92vw',
          height: '100vh',
          background: 'white',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 40px rgba(0,0,0,0.2)',
          borderLeft: '5px solid var(--color-primary-light)',
          animation: 'slideInRight 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
          color: 'white',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '3px solid rgba(255,255,255,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.7rem',
              border: '2px solid white'
            }}>
              🦉
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 'bold' }}>
                {currentLang === 'ta' ? 'ஆர்ச்சி AI வழிகாட்டி' : 'Archie AI Tutor'}
              </h3>
              <span style={{ fontSize: '0.72rem', opacity: 0.9 }}>
                {currentLang === 'ta' ? 'அறிவியல் & கணித வழிகாட்டி' : 'Fast Bilingual Educational Assistant'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Create Video Action Button */}
            <button
              onClick={() => handleTriggerVideoAction({ topic })}
              style={{
                background: 'rgba(255,255,255,0.25)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: '10px',
                padding: '5px 8px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Create Video"
            >
              <Film size={14} />
              <span>{currentLang === 'ta' ? 'வீடியோ' : 'Video'}</span>
            </button>

            {/* Language switch */}
            <button
              onClick={() => {
                const next = currentLang === 'en' ? 'ta' : 'en';
                setCurrentLang(next);
                playSound.click();
              }}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: '10px',
                padding: '4px 8px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
              title="Toggle Language"
            >
              {currentLang === 'en' ? 'தமிழ்' : 'EN'}
            </button>

            {/* Mute */}
            <button
              onClick={() => { setIsMuted(!isMuted); if (!isMuted) window.speechSynthesis?.cancel(); }}
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: '#fafbfc'
        }}>
          {messages.map(msg => {
            const isArchie = msg.sender === 'archie';
            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: isArchie ? 'flex-start' : 'flex-end',
                  maxWidth: '88%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                {isArchie && (
                  <span style={{ fontSize: '0.68rem', color: '#636e72', paddingLeft: '4px', fontWeight: 'bold' }}>
                    🦉 Archie
                  </span>
                )}

                <div style={{
                  background: isArchie
                    ? 'linear-gradient(135deg, #f0f3ff 0%, #e8ecff 100%)'
                    : 'linear-gradient(135deg, #6c5ce7 0%, #a55eea 100%)',
                  color: isArchie ? '#2d3436' : 'white',
                  padding: '12px 16px',
                  borderRadius: isArchie ? '4px 20px 20px 20px' : '20px 20px 4px 20px',
                  border: isArchie ? '1.5px solid #d5daff' : 'none',
                  fontSize: '0.92rem',
                  lineHeight: '1.55',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.04)'
                }}>
                  {msg.text}

                  {/* Video Trigger Action Button (Section 8: Chat + Video Integration) */}
                  {isArchie && msg.action && msg.action.type === 'create_video' && (
                    <div style={{ marginTop: '10px' }}>
                      <button
                        onClick={() => handleTriggerVideoAction(msg.action)}
                        className="btn-playful btn-accent"
                        style={{
                          padding: '7px 14px',
                          fontSize: '0.82rem',
                          borderRadius: '10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}
                      >
                        <Video size={14} />
                        {msg.action.label || (currentLang === 'ta' ? '🎬 வீடியோ உருவாக்கு' : '🎬 Create Video')}
                      </button>
                    </div>
                  )}
                </div>

                {isArchie && !isMuted && (
                  <button
                    onClick={() => speakText(msg.text)}
                    style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#a55eea', fontSize: '0.72rem', padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    <Volume2 size={12} /> {currentLang === 'ta' ? 'கேளு' : 'Listen'}
                  </button>
                )}
              </div>
            );
          })}

          {/* Thinking Indicator (Requirement 26) */}
          {isTyping && (
            <div style={{
              alignSelf: 'flex-start',
              background: '#f0f3ff',
              border: '1.5px solid #d5daff',
              padding: '8px 14px',
              borderRadius: '4px 18px 18px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              color: '#6c5ce7',
              fontWeight: '600'
            }}>
              <span>🦉 Archie is thinking...</span>
              <div style={{ display: 'flex', gap: '3px' }}>
                <span style={{ animation: 'bounceSlow 1s infinite' }}>•</span>
                <span style={{ animation: 'bounceSlow 1s infinite 0.2s' }}>•</span>
                <span style={{ animation: 'bounceSlow 1s infinite 0.4s' }}>•</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {!isTyping && (
          <div style={{
            background: '#f5f6fa',
            borderTop: '1.5px solid #e4e7eb',
            padding: '8px 12px',
            display: 'flex',
            overflowX: 'auto',
            gap: '6px'
          }}>
            {chips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                style={{
                  background: 'white',
                  border: '1.5px solid #d5daff',
                  borderRadius: '16px',
                  padding: '5px 10px',
                  fontSize: '0.73rem',
                  color: '#6c5ce7',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input Controls */}
        <div style={{
          padding: '12px 16px',
          borderTop: '2px solid #e4e7eb',
          background: 'white',
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          {/* Voice Input (Mic) */}
          <button
            onClick={toggleVoiceInput}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: isListening ? '#ff7675' : '#f0f3ff',
              color: isListening ? 'white' : '#6c5ce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: isListening ? 'none' : '2px solid #d5daff',
              cursor: 'pointer',
              animation: isListening ? 'pulseStar 1s infinite' : 'none'
            }}
            title={currentLang === 'ta' ? 'குரலில் பேசு' : 'Ask by Voice'}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <input
            type="text"
            placeholder={currentLang === 'ta' ? "ஆர்ச்சியிடம் ஏதேனும் சந்தேகம் கேளுங்கள்..." : "Ask Archie any question or doubt..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isTyping}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '25px',
              border: '2px solid #dfe4ea',
              outline: 'none',
              fontSize: '0.92rem'
            }}
          />

          <button
            className="btn-playful btn-primary"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              boxShadow: 'none',
              opacity: (inputValue.trim() && !isTyping) ? 1 : 0.5
            }}
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isTyping}
          >
            <Send size={16} fill="white" />
          </button>
        </div>
      </div>
    </>
  );
}
