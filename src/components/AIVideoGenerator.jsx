import React, { useState, useEffect, useRef } from 'react';
import { playSound } from '../utils/audio';
import {
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Film,
  Download,
  Share2,
  X,
  Award,
  HelpCircle,
  Clock,
  Layers,
  BookOpen
} from 'lucide-react';

const QUICK_TOPIC_CHIPS = [
  { label: 'Photosynthesis 🌱', topic: 'Photosynthesis', subject: 'Science' },
  { label: 'Fractions 🍕', topic: 'Fractions & Equivalent Slices', subject: 'Mathematics' },
  { label: 'Human Skeleton 💀', topic: 'The Human Skeleton & Bones', subject: 'Science' },
  { label: 'Digestive System 🍎', topic: 'The Digestive Journey', subject: 'Science' },
  { label: 'Gravity 🌍', topic: 'Gravity and Motion', subject: 'Science' },
  { label: 'Solar System 🪐', topic: 'Solar System & Earth Rotation', subject: 'Science' },
  { label: 'Perimeter 📐', topic: 'Perimeter Calculation', subject: 'Mathematics' }
];

export default function AIVideoGenerator({
  isOpen,
  onClose,
  initialTopic = '',
  initialSubject = 'Science',
  initialGrade = 4,
  initialLanguage = 'en',
  onAwardPoints
}) {
  const [topic, setTopic] = useState(initialTopic || 'Photosynthesis');
  const [subject, setSubject] = useState(/math/i.test(initialSubject) ? 'Mathematics' : 'Science');
  const [grade, setGrade] = useState(initialGrade || 4);
  const [language, setLanguage] = useState(initialLanguage || 'en');

  // Asynchronous generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [videoData, setVideoData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Interactive Quick Check State (unlocked ONLY after video completes)
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [videoPlaybackProgress, setVideoPlaybackProgress] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const pollIntervalRef = useRef(null);
  const pollErrorsRef = useRef(0);
  const generationLockRef = useRef(false);
  const quizSubmittedRef = useRef(false);

  // Sync initial props when opened
  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
    if (initialSubject) setSubject(/math/i.test(initialSubject) ? 'Mathematics' : 'Science');
    if (initialGrade) setGrade(initialGrade);
    if (initialLanguage) setLanguage(initialLanguage);
  }, [initialTopic, initialSubject, initialGrade, initialLanguage, isOpen]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleStartGeneration = async () => {
    if (!topic.trim() || generationLockRef.current) return;
    generationLockRef.current = true;
    playSound.click();
    setIsGenerating(true);
    setProgress(5);
    setStatusMessage(language === 'ta' ? 'வீடியோ பணி தொடங்குகிறது...' : 'Starting video generation job...');
    setVideoData(null);
    setJobId(null);
    setErrorMessage('');
    setIsVideoFinished(false);
    setVideoPlaybackProgress(0);
    setSelectedOption(null);
    setQuizSubmitted(false);
    quizSubmittedRef.current = false;

    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          grade: Number(grade),
          subject,
          language
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || `Server returned ${res.status}`);
      }

      if (!data.jobId) {
        throw new Error('No job ID returned from video generator.');
      }

      setJobId(data.jobId);
      startPolling(data.jobId);
    } catch (err) {
      console.error('Video start failed:', err);
      setIsGenerating(false);
      generationLockRef.current = false;
      setErrorMessage(err.message || (language === 'ta'
        ? 'வீடியோ உருவாக்கத்தை தொடங்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'
        : 'Could not start video generation. Please try again.'));
      playSound.error();
    }
  };

  const startPolling = (currentJobId) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollErrorsRef.current = 0;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/video-status/${currentJobId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Status request failed (${res.status}).`);
        }
        pollErrorsRef.current = 0;
        setProgress(Number.isFinite(data.progress) ? data.progress : 10);
        if (data.statusMessage) {
          setStatusMessage(data.statusMessage);
        }

        if (data.status === 'completed') {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          setIsGenerating(false);
          generationLockRef.current = false;
          setVideoData(data);
          setErrorMessage('');
          playSound.success();

          // Save video watch statistics
          recordVideoActivity({
            topic: topic.trim(),
            status: 'watched',
            title: data.title || topic
          });
        } else if (data.status === 'failed') {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          setIsGenerating(false);
          generationLockRef.current = false;
          setErrorMessage(data.error || 'Video generation failed.');
          playSound.error();
        }
      } catch (pollErr) {
        console.warn('Status poll error:', pollErr);
        pollErrorsRef.current += 1;
        if (pollErrorsRef.current >= 5) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          setIsGenerating(false);
          generationLockRef.current = false;
          setErrorMessage(language === 'ta'
            ? 'பணியின் நிலையைப் பெற முடியவில்லை. சேவையக இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.'
            : 'Could not check the video job status after several attempts. Check the server connection and retry.');
        }
      }
    }, 4000);
  };

  const handleSelectOption = (index) => {
    if (quizSubmitted) return;
    playSound.click();
    setSelectedOption(index);
  };

  const handleCheckAnswer = () => {
    if (quizSubmittedRef.current || selectedOption === null || !videoData?.checkpoint) return;
    quizSubmittedRef.current = true;
    const correctIdx = videoData.checkpoint.answer;
    const isAnsCorrect = selectedOption === correctIdx;
    setIsCorrect(isAnsCorrect);
    setQuizSubmitted(true);

    if (isAnsCorrect) {
      playSound.success();
      if (onAwardPoints) {
        onAwardPoints({ stars: 1, xp: 50 });
      }
    } else {
      playSound.error();
    }

    // Save quiz attempt in localStorage
    recordVideoActivity({
      topic: topic.trim(),
      status: 'quiz_completed',
      score: isAnsCorrect ? 100 : 0,
      isCorrect: isAnsCorrect
    });
  };

  const recordVideoActivity = (entry) => {
    try {
      const existing = JSON.parse(localStorage.getItem('eduarch_video_stats') || '[]');
      existing.unshift({
        ...entry,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('eduarch_video_stats', JSON.stringify(existing.slice(0, 30)));
    } catch (e) {
      console.warn('Failed to save video stats:', e);
    }
  };

  const handleDownload = () => {
    if (!videoData?.videoUrl) return;
    playSound.click();
    window.open(videoData.videoUrl, '_blank');
  };

  const handleShare = () => {
    playSound.click();
    if (navigator.share) {
      navigator.share({
        title: videoData?.title || 'EduArch Learning Video',
        text: `Watch Archie's educational video about ${topic}!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert(language === 'ta' ? 'இணைப்பு நகலெடுக்கப்பட்டது!' : 'Video link copied to clipboard!');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        padding: '16px'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '92vh',
          background: 'white',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: 'white',
            padding: '16px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '3px solid rgba(255,255,255,0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.7rem',
                border: '2px solid white'
              }}
            >
              🦉
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>
                {language === 'ta' ? 'ஆர்ச்சி AI வீடியோ தயாரிப்பாளர்' : 'Archie AI Video Creator'}
              </h3>
              <span style={{ fontSize: '0.78rem', opacity: 0.9 }}>
                {language === 'ta'
                  ? 'CBSE வகுப்பு 4-5க்கான அனிமேஷன் கற்றல் வீடியோக்கள்'
                  : 'Animated educational videos for CBSE Grade 4 & 5'}
              </span>
            </div>
          </div>

          <button
            onClick={() => { playSound.click(); onClose(); }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* Configuration Form (shown if not currently viewing completed video, or can be toggled) */}
          {!videoData && !isGenerating && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Topic Input */}
              <div>
                <label style={{ fontSize: '0.88rem', fontWeight: 'bold', color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                  {language === 'ta' ? 'கற்க வேண்டிய தலைப்பு (Topic):' : 'Lesson Topic:'}
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={language === 'ta' ? 'எ.கா. ஒளிச்சேர்க்கை, பின்னங்கள்...' : 'e.g. Photosynthesis, Fractions, Solar System...'}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    border: '2px solid #cbd5e1',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>

              {/* Quick Suggestion Chips */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                  {language === 'ta' ? 'விரைவு தலைப்புகள்:' : 'Quick Ideas:'}
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {QUICK_TOPIC_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        playSound.click();
                        setTopic(chip.topic);
                        setSubject(chip.subject);
                      }}
                      style={{
                        background: '#f1f5f9',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '20px',
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        color: '#334155',
                        fontWeight: '600'
                      }}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selectors Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                {/* Subject */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    {language === 'ta' ? 'பாடம் (Subject):' : 'Subject:'}
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: '2px solid #cbd5e1',
                      fontSize: '0.9rem',
                      background: 'white'
                    }}
                  >
                    <option value="Science">🧬 Science</option>
                    <option value="Mathematics">📐 Mathematics</option>
                  </select>
                </div>

                {/* Grade */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    {language === 'ta' ? 'வகுப்பு (Grade):' : 'Grade:'}
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: '2px solid #cbd5e1',
                      fontSize: '0.9rem',
                      background: 'white'
                    }}
                  >
                    <option value={4}>Grade 4 (CBSE)</option>
                    <option value={5}>Grade 5 (CBSE)</option>
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    {language === 'ta' ? 'மொழி (Language):' : 'Language:'}
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: '2px solid #cbd5e1',
                      fontSize: '0.9rem',
                      background: 'white'
                    }}
                  >
                    <option value="en">English 🇬🇧</option>
                    <option value="ta">தமிழ் 🇮🇳</option>
                  </select>
                </div>

              </div>

              <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem' }}>
                {language === 'ta'
                  ? 'Veo ஒரு உண்மையான 8-விநாடி கார்ட்டூன் காட்சியை உருவாக்கும்; இது முழுப் பாட வீடியோ அல்ல.'
                  : 'Veo generates one real 8-second cartoon clip, not a complete lesson video.'}
              </p>
              <p style={{ margin: 0, color: '#92400e', fontSize: '0.82rem' }}>
                {language === 'ta'
                  ? 'வீடியோ உருவாக்கத்திற்கு கட்டணம் இருக்கலாம்; முயற்சிக்கும் முன் உங்கள் Google API திட்டத்தின் விலையைச் சரிபார்க்கவும்.'
                  : 'Video generation may be billable. Check your Google API plan and current model pricing before generating.'}
              </p>

              {/* Action Button */}
              <div style={{ marginTop: '10px' }}>
                <button
                  className="btn-playful btn-primary"
                  onClick={handleStartGeneration}
                  disabled={!topic.trim()}
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '1.08rem',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  <Sparkles size={20} />
                  {language === 'ta' ? '✨ கல்வி வீடியோவை உருவாக்கு' : '✨ Generate Learning Video'}
                </button>
              </div>

              {errorMessage && (
                <div role="alert" aria-live="polite" style={{ padding: '10px 14px', background: '#fef2f2', border: '1.5px solid #f87171', borderRadius: '12px', color: '#b91c1c', fontSize: '0.85rem' }}>
                  {errorMessage}
                </div>
              )}
            </div>
          )}

          {/* Loading / Progress State */}
          {isGenerating && (
            <div style={{ padding: '30px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
              <div
                style={{
                  fontSize: '3.5rem',
                  animation: 'bounceSlow 1.5s infinite',
                  display: 'inline-block'
                }}
              >
                🦉
              </div>
              <h4 style={{ margin: 0, fontSize: '1.3rem', color: '#1e293b' }}>
                {language === 'ta' ? 'உங்கள் பாடம் தயாராகிறது...' : 'Generating your lesson...'}
              </h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                {statusMessage}
              </p>

              {/* Progress Bar */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '460px',
                  height: '18px',
                  background: '#e2e8f0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '2px solid #cbd5e1'
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
                    borderRadius: '10px',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4f46e5' }}>
                {progress}%
              </span>
            </div>
          )}

          {/* Completed Video Player & Engagement */}
          {videoData && !isGenerating && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Title Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', color: '#1e293b' }}>
                    {videoData.title || `Learning: ${topic}`}
                  </h4>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 'bold' }}>
                      CBSE Grade {grade}
                    </span>
                    <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 'bold' }}>
                      {subject}
                    </span>
                    <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 'bold' }}>
                      {videoData.videoDurationSeconds || 8}s generated clip
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleStartGeneration}
                    className="btn-playful btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '0.82rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <RotateCcw size={14} />
                    {language === 'ta' ? 'மீண்டும் உருவாக்கு' : 'Regenerate'}
                  </button>

                  {videoData.videoUrl && (
                    <button
                      onClick={handleDownload}
                      className="btn-playful btn-accent"
                      style={{ padding: '8px 12px', fontSize: '0.82rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Download size={14} />
                      {language === 'ta' ? 'பதிவிறக்கு' : 'Download'}
                    </button>
                  )}

                  <button
                    onClick={handleShare}
                    className="btn-playful btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '0.82rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Share2 size={14} />
                    {language === 'ta' ? 'பகிர்' : 'Share'}
                  </button>
                </div>
              </div>

              {/* Video Player */}
              <div
                style={{
                  width: '100%',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  background: '#0f172a',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  position: 'relative'
                }}
              >
                {videoData.videoUrl ? (
                  <video
                    src={videoData.videoUrl}
                    controls
                    autoPlay
                    playsInline
                    onError={() => setErrorMessage(language === 'ta'
                      ? 'சேமிக்கப்பட்ட வீடியோவை இயக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'
                      : 'The saved video could not be played. Please try generating it again.')}
                    onEnded={() => {
                      setIsVideoFinished(true);
                      playSound.chime();
                    }}
                    onTimeUpdate={(e) => {
                      const v = e.target;
                      if (v.duration > 0) {
                        const pct = Math.floor((v.currentTime / v.duration) * 100);
                        setVideoPlaybackProgress(pct);
                        if (v.currentTime >= v.duration - 0.5) {
                          setIsVideoFinished(true);
                        }
                      }
                    }}
                    style={{
                      width: '100%',
                      maxHeight: '420px',
                      display: 'block'
                    }}
                  />
                ) : (
                  <div style={{ padding: '40px', color: 'white', textAlign: 'center' }}>
                    <Film size={40} style={{ margin: '0 auto 12px', opacity: 0.7 }} />
                    <p>{language === 'ta' ? 'வீடியோ காட்சி தயாராக உள்ளது!' : 'Animated video ready!'}</p>
                  </div>
                )}
              </div>

              {errorMessage && (
                <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1.5px solid #f87171', borderRadius: '12px', color: '#b91c1c', fontSize: '0.85rem' }}>
                  {errorMessage}
                </div>
              )}

              {language === 'ta' && (
                <div style={{ padding: '10px 14px', background: '#eef2ff', border: '1.5px solid #c7d2fe', borderRadius: '12px', color: '#3730a3', fontSize: '0.85rem' }}>
                  தமிழ் குரல் உருவாக்கம் உறுதிப்படுத்தப்படாததால், வீடியோவில் குரல் இயக்கப்படவில்லை. கீழே உள்ள காட்சிப் பகுதியில் தமிழ் விளக்கத்தைப் படிக்கலாம்.
                </div>
              )}

              {/* Video Playback State: Locked Banner vs Finished */}
              {!isVideoFinished && (
                <div
                  style={{
                    background: '#f8fafc',
                    border: '2px dashed #94a3b8',
                    borderRadius: '16px',
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Clock size={22} color="#6366f1" />
                    <div>
                      <h6 style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b', fontWeight: 'bold' }}>
                        {language === 'ta' ? 'வீடியோ முடிந்ததும் கேள்விகள் கேட்கப்படும்' : 'Questions Will Be Asked After Video Completion'}
                      </h6>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {language === 'ta'
                          ? `கற்றல் முன்னேற்றம்: ${videoPlaybackProgress}% • வீடியோவை முழுமையாகப் பார்க்கவும்`
                          : `Lesson Progress: ${videoPlaybackProgress}% • Watch the full video to unlock the Quick Check!`}
                      </span>
                    </div>
                  </div>

                </div>
              )}

              {/* Storyboard Scene Breakdown */}
              {videoData.scenes && videoData.scenes.length > 0 && (
                <div>
                  <h5 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={16} />
                    {language === 'ta' ? 'காட்சி விளக்கம் (Storyboard Scenes):' : 'Scene Breakdown:'}
                  </h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                    {videoData.scenes.map((scene, i) => (
                      <div
                        key={i}
                        style={{
                          background: '#f8fafc',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '10px 14px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: '#6366f1' }}>
                            Scene {scene.sceneNumber || i + 1}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            {scene.time || i * 12}s
                          </span>
                        </div>
                        <h6 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#1e293b' }}>
                          {scene.heading || `Part ${i + 1}`}
                        </h6>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: '1.4' }}>
                          {scene.narration || scene.visualDescription}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 🎯 Quick Check Interactive Quiz (ONLY AFTER VIDEO COMPLETION) */}
              {isVideoFinished && videoData.checkpoint && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                    border: '2.5px solid #fde68a',
                    borderRadius: '18px',
                    padding: '20px',
                    marginTop: '8px',
                    animation: 'popIn 0.3s ease-out'
                  }}
                >
                  {/* Completion announcement */}
                  <div style={{
                    background: '#ecfdf5',
                    border: '1.5px solid #a7f3d0',
                    borderRadius: '14px',
                    padding: '10px 16px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#065f46',
                    fontWeight: 'bold',
                    fontSize: '0.92rem'
                  }}>
                    <CheckCircle2 size={18} color="#059669" />
                    <span>
                      {language === 'ta'
                        ? '🎉 வீடியோ முடிந்தது! இப்போது உங்கள் புரிதலை சோதிக்கவும்:'
                        : '🎉 Video Completed! Now test what you learned in Archie’s Quick Check:'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '1.4rem' }}>🎯</span>
                    <h5 style={{ margin: 0, fontSize: '1.1rem', color: '#92400e', fontWeight: 'bold' }}>
                      {language === 'ta' ? 'விரைவு சோதனை (Quick Check)!' : 'Quick Check!'}
                    </h5>
                  </div>

                  <p style={{ fontSize: '0.95rem', color: '#78350f', fontWeight: '600', marginBottom: '14px' }}>
                    {videoData.checkpoint.question}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                    {videoData.checkpoint.options.map((option, idx) => {
                      const isSelected = selectedOption === idx;
                      let bg = 'white';
                      let borderColor = '#fde68a';
                      let textColor = '#78350f';

                      if (quizSubmitted) {
                        if (idx === videoData.checkpoint.answer) {
                          bg = '#dcfce7';
                          borderColor = '#22c55e';
                          textColor = '#15803d';
                        } else if (isSelected) {
                          bg = '#fee2e2';
                          borderColor = '#ef4444';
                          textColor = '#b91c1c';
                        }
                      } else if (isSelected) {
                        bg = '#fef08a';
                        borderColor = '#eab308';
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(idx)}
                          disabled={quizSubmitted}
                          style={{
                            background: bg,
                            border: `2px solid ${borderColor}`,
                            borderRadius: '12px',
                            padding: '10px 14px',
                            fontSize: '0.9rem',
                            textAlign: 'left',
                            color: textColor,
                            fontWeight: isSelected ? 'bold' : '500',
                            cursor: quizSubmitted ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.2s'
                          }}
                        >
                          <span>{String.fromCharCode(65 + idx)}. {option}</span>
                          {quizSubmitted && idx === videoData.checkpoint.answer && (
                            <CheckCircle2 size={18} color="#15803d" />
                          )}
                          {quizSubmitted && isSelected && idx !== videoData.checkpoint.answer && (
                            <XCircle size={18} color="#b91c1c" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {!quizSubmitted ? (
                    <button
                      className="btn-playful btn-accent"
                      onClick={handleCheckAnswer}
                      disabled={selectedOption === null}
                      style={{
                        padding: '10px 20px',
                        fontSize: '0.9rem',
                        borderRadius: '12px',
                        boxShadow: 'none'
                      }}
                    >
                      {language === 'ta' ? 'பதிலைச் சரிபார்க்கவும்' : 'Submit Answer'}
                    </button>
                  ) : (
                    <div
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: isCorrect ? '#ecfdf5' : '#fff1f2',
                        border: `1.5px solid ${isCorrect ? '#a7f3d0' : '#fecdd3'}`,
                        fontSize: '0.92rem',
                        fontWeight: 'bold',
                        color: isCorrect ? '#065f46' : '#9f1239'
                      }}
                    >
                      {isCorrect
                        ? (language === 'ta' ? 'அருமை! 🌟 நீங்கள் சரியாகக் கூறினீர்கள்! +50 XP' : 'Excellent! 🌟 You got it! +50 XP awarded!')
                        : (language === 'ta' ? 'கிட்டத்தட்ட சரி! 🦉 சரியான பதிலையும் விளக்கத்தையும் பாருங்கள்.' : 'Almost! 🦉 Check the correct answer and explanation below.')}
                      {videoData.checkpoint.explanation && (
                        <div style={{ marginTop: '6px', fontSize: '0.82rem', fontWeight: 'normal', color: '#475569' }}>
                          {videoData.checkpoint.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
