import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import GameContainer from './components/GameContainer';
import AITutor from './components/AITutor';
import AIVideoGenerator from './components/AIVideoGenerator';
import AchievementsModal from './components/AchievementsModal';
import { playSound } from './utils/audio';
import { Sparkles, MessageCircle, LogOut, Globe, Trophy, Flame, Film } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [stars, setStars] = useState(0);
  const [xp, setXp] = useState(50);
  const [streak, setStreak] = useState(3);
  const [completedTopics, setCompletedTopics] = useState({});
  const [selectedSubject, setSelectedSubject] = useState('science');
  const [language, setLanguage] = useState('en'); // 'en' | 'ta'
  const [aiTutorOpen, setAiTutorOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);

  // AI Video Generator State
  const [videoGeneratorOpen, setVideoGeneratorOpen] = useState(false);
  const [videoGeneratorConfig, setVideoGeneratorConfig] = useState({
    topic: 'Photosynthesis',
    subject: 'Science',
    grade: 4,
    language: 'en'
  });

  // Load active user session on boot
  useEffect(() => {
    const active = localStorage.getItem('active_user');
    if (active) {
      try {
        const profile = JSON.parse(active);
        setCurrentUser(profile);
        setLanguage(profile.language || 'en');
      } catch (e) {
        console.error("Profile parse error:", e);
      }
    }

    const savedStars = localStorage.getItem('eduarch_stars');
    if (savedStars) setStars(parseInt(savedStars, 10) || 0);

    const savedXp = localStorage.getItem('eduarch_xp');
    if (savedXp) setXp(parseInt(savedXp, 10) || 50);

    const savedStreak = localStorage.getItem('eduarch_streak');
    if (savedStreak) setStreak(parseInt(savedStreak, 10) || 3);

    const savedCompleted = localStorage.getItem('eduarch_completed');
    if (savedCompleted) {
      try {
        setCompletedTopics(JSON.parse(savedCompleted));
      } catch (e) {}
    }
  }, []);

  const handleLoginSuccess = (profile) => {
    setCurrentUser(profile);
    setLanguage(profile.language || 'en');
  };

  const handleLogout = () => {
    playSound.click();
    localStorage.removeItem('active_user');
    setCurrentUser(null);
    setActiveTopic(null);
  };

  const handleSelectTopic = (topic) => {
    playSound.click();
    setActiveTopic(topic);
  };

  const handleBackToDashboard = () => {
    playSound.click();
    setActiveTopic(null);
  };

  const handleTopicComplete = (topicId, starsEarned) => {
    const key = `g${currentUser.grade}_${activeTopic.gameType}_t${topicId}`;
    
    const newStars = stars + starsEarned;
    const newXp = xp + 150;
    setStars(newStars);
    setXp(newXp);

    localStorage.setItem('eduarch_stars', newStars.toString());
    localStorage.setItem('eduarch_xp', newXp.toString());

    const updated = {
      ...completedTopics,
      [key]: true
    };
    setCompletedTopics(updated);
    localStorage.setItem('eduarch_completed', JSON.stringify(updated));

    setActiveTopic(null);
  };

  const handleAwardPoints = ({ stars: addStars = 0, xp: addXp = 0 }) => {
    const newStars = stars + addStars;
    const newXp = xp + addXp;
    setStars(newStars);
    setXp(newXp);
    localStorage.setItem('eduarch_stars', newStars.toString());
    localStorage.setItem('eduarch_xp', newXp.toString());
  };

  const handleOpenVideoCreator = (customConfig) => {
    playSound.click();
    if (customConfig) {
      setVideoGeneratorConfig({
        topic: customConfig.topic || (activeTopic ? activeTopic.name : 'Photosynthesis'),
        subject: customConfig.subject || selectedSubject || 'Science',
        grade: customConfig.grade || currentUser?.grade || 4,
        language: customConfig.language || language || 'en'
      });
    } else {
      setVideoGeneratorConfig({
        topic: activeTopic ? activeTopic.name : 'Photosynthesis',
        subject: selectedSubject === 'maths' ? 'Mathematics' : 'Science',
        grade: currentUser?.grade || 4,
        language: language || 'en'
      });
    }
    setVideoGeneratorOpen(true);
  };

  const handleLanguageToggle = () => {
    playSound.click();
    const nextLang = language === 'en' ? 'ta' : 'en';
    setLanguage(nextLang);
    if (currentUser) {
      const updatedProfile = { ...currentUser, language: nextLang };
      setCurrentUser(updatedProfile);
      localStorage.setItem('active_user', JSON.stringify(updatedProfile));
    }
  };

  if (!currentUser) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="edu-container">
      
      {/* Decorative floating clouds */}
      <div className="cloud-bg" style={{ width: '200px', height: '60px', top: '8%', left: '5%', animation: 'float 12s infinite' }} />
      <div className="cloud-bg" style={{ width: '250px', height: '70px', top: '22%', right: '8%', animation: 'float 16s infinite 2s' }} />
      <div className="cloud-bg" style={{ width: '180px', height: '55px', bottom: '15%', left: '10%', animation: 'float 10s infinite 1s' }} />

      {/* Persistent Global Header Status bar */}
      <div 
        className="glass-panel" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '12px 24px', 
          marginBottom: '20px', 
          background: 'rgba(255,255,255,0.94)',
          zIndex: 100,
          position: 'relative',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>👋</span>
          <span style={{ fontWeight: 'bold', fontSize: '1.15rem' }}>
            {language === 'en' ? `Hi, ${currentUser.name}!` : `வணக்கம், ${currentUser.name}!`}
          </span>
          <span style={{ background: 'var(--color-primary-light)', color: 'white', padding: '3px 10px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold' }}>
            Grade {currentUser.grade}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* AI Video Creator Button in Header */}
          <button
            onClick={() => handleOpenVideoCreator()}
            className="btn-playful btn-primary"
            style={{
              padding: '6px 14px',
              fontSize: '0.85rem',
              borderRadius: '12px',
              boxShadow: 'none',
              borderBottom: '2.5px solid rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Film size={15} /> {language === 'en' ? '🎬 AI Video Creator' : '🎬 AI வீடியோ'}
          </button>

          {/* Trophies Button */}
          <button
            onClick={() => { playSound.click(); setAchievementsOpen(true); }}
            className="btn-playful btn-accent"
            style={{
              padding: '6px 14px',
              fontSize: '0.85rem',
              borderRadius: '12px',
              boxShadow: 'none',
              borderBottom: '2.5px solid rgba(0,0,0,0.1)'
            }}
          >
            <Trophy size={15} /> {language === 'en' ? 'Trophies & XP' : 'சாதனைகள்'}
          </button>

          {/* Language Toggle */}
          <button
            onClick={handleLanguageToggle}
            className="btn-playful btn-secondary"
            style={{
              padding: '6px 14px',
              fontSize: '0.85rem',
              borderRadius: '12px',
              boxShadow: 'none',
              borderBottom: '2.5px solid rgba(0,0,0,0.1)'
            }}
          >
            <Globe size={15} /> {language === 'en' ? 'தமிழ்' : 'English'}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="btn-playful btn-danger"
            style={{
              padding: '6px 12px',
              fontSize: '0.85rem',
              borderRadius: '12px',
              boxShadow: 'none',
              borderBottom: '2.5px solid rgba(0,0,0,0.1)'
            }}
            title={language === 'en' ? 'Log Out' : 'வெளியேறு'}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', position: 'relative', zIndex: 10 }}>
        {activeTopic ? (
          <GameContainer 
            topic={activeTopic}
            grade={currentUser.grade}
            subject={selectedSubject}
            lesson={activeTopic.name || 'Lesson'}
            language={language}
            onBack={handleBackToDashboard}
            onTopicComplete={handleTopicComplete}
          />
        ) : (
          <Dashboard 
            stars={stars}
            xp={xp}
            streak={streak}
            completedTopics={completedTopics}
            onSelectTopic={handleSelectTopic}
            selectedGrade={currentUser.grade}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            language={language}
            onOpenAchievements={() => setAchievementsOpen(true)}
          />
        )}
      </div>

      {/* Floating Archie AI Tutor Chat Trigger */}
      <button
        onClick={() => { playSound.click(); setAiTutorOpen(!aiTutorOpen); }}
        className="btn-playful btn-accent animate-bounce-slow"
        style={{
          position: 'fixed',
          bottom: '25px',
          right: '25px',
          borderRadius: '50%',
          width: '68px',
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 999,
          border: '4px solid white',
          padding: 0
        }}
        title={language === 'en' ? "Chat with Archie AI Tutor!" : "ஆர்ச்சி AI உடன் உரையாடு!"}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '1.8rem', lineHeight: '1' }}>🦉</span>
          <span style={{ fontSize: '0.6rem', fontWeight: 'bold', color: '#2d3436' }}>ARCHIE</span>
        </div>
      </button>

      {/* Persistent AI Tutor Side Drawer */}
      <AITutor 
        grade={currentUser.grade}
        subject={selectedSubject}
        lesson={activeTopic ? activeTopic.name : 'CBSE Curriculum'}
        topic={activeTopic ? activeTopic.name : 'General Doubts & Curiosity'}
        topicIndex={activeTopic ? activeTopic.id : 1}
        language={language}
        isOpen={aiTutorOpen}
        onClose={() => setAiTutorOpen(false)}
        onOpenVideoCreator={handleOpenVideoCreator}
      />

      {/* Dedicated AI Video Generator Modal */}
      <AIVideoGenerator
        isOpen={videoGeneratorOpen}
        onClose={() => setVideoGeneratorOpen(false)}
        initialTopic={videoGeneratorConfig.topic}
        initialSubject={videoGeneratorConfig.subject}
        initialGrade={videoGeneratorConfig.grade}
        initialLanguage={videoGeneratorConfig.language}
        onAwardPoints={handleAwardPoints}
      />

      {/* Achievements & Trophies Modal */}
      <AchievementsModal
        isOpen={achievementsOpen}
        onClose={() => setAchievementsOpen(false)}
        stars={stars}
        xp={xp}
        streak={streak}
        completedTopics={completedTopics}
        language={language}
        userName={currentUser.name}
        userGrade={currentUser.grade}
      />

    </div>
  );
}
