import React from 'react';
import { X, Award, Star, Flame, Trophy, CheckCircle, Lock, Printer } from 'lucide-react';
import { playSound } from '../utils/audio';

const BADGES = [
  { id: 'first_step', icon: '🌟', title: 'First Step', titleTa: 'முதல் அடி', desc: 'Complete your first lesson', descTa: 'முதல் பாடத்தை முடித்தவர்', reqStars: 3 },
  { id: 'nutritionist', icon: '🥗', title: 'Nutrition Hero', titleTa: 'ஊட்டச்சத்து நாயகன்', desc: 'Master Food and Digestion', descTa: 'உணவு முறையை முழுமையாகக் கற்றவர்', reqTopic: 'ChefPlate' },
  { id: 'fraction_master', icon: '🍕', title: 'Fraction Master', titleTa: 'பின்ன மேதை', desc: 'Master Fractions Adventure', descTa: 'பின்னங்களின் பயணத்தை வென்றவர்', reqTopic: 'PizzaChef' },
  { id: 'bone_detective', icon: '💀', title: 'Bone Detective', titleTa: 'எலும்பு ஆய்வாளர்', desc: 'Assemble the Human Skeleton', descTa: 'மனித எலும்புக்கூட்டை உருவாக்கியவர்', reqTopic: 'SkeletonPuzzle' },
  { id: 'angle_ace', icon: '📐', title: 'Laser Angle Ace', titleTa: 'கோண நிபுணர்', desc: 'Fire laser at exact angles', descTa: 'துல்லியமான கோணங்களில் லேசர் செலுத்தியவர்', reqTopic: 'LaserAngles' },
  { id: 'curious_mind', icon: '🦉', title: 'Curious Explorer', titleTa: 'ஆர்வமுள்ள மாணவர்', desc: 'Ask Archie AI Tutor for doubts', descTa: 'ஆர்ச்சியிடம் சந்தேகங்கள் கேட்டவர்', reqStars: 10 },
  { id: 'streak_hero', icon: '🔥', title: 'Streak Champion', titleTa: 'தொடர் நாயகன்', desc: 'Maintain a 3+ day learning streak', descTa: '3 நாட்கள் தொடர் கற்றல் சாதனை', reqStreak: 3 },
  { id: 'grand_scholar', icon: '👑', title: 'Grand Scholar', titleTa: 'தலைசிறந்த மேதை', desc: 'Earn 30+ total learning stars', descTa: '30 நட்சத்திரங்களை சேகரித்தவர்', reqStars: 30 }
];

export default function AchievementsModal({ isOpen, onClose, stars = 0, xp = 0, streak = 1, completedTopics = {}, language = 'en', userName = 'Student', userGrade = 4 }) {
  if (!isOpen) return null;

  // Calculate Level based on XP
  const level = Math.floor(xp / 100) + 1;
  const levelNames = {
    en: ['Novice Explorer 🌱', 'Junior Scientist 🔬', 'Master Scholar 📚', 'Grand Genius 👑'],
    ta: ['தொடக்க ஆய்வாளர் 🌱', 'இளம் விஞ்ஞானி 🔬', 'முதுகலை அறிஞர் 📚', 'தலைசிறந்த மேதை 👑']
  };
  const currentLevelName = (levelNames[language] || levelNames.en)[Math.min(level - 1, 3)];
  const nextLevelXp = level * 100;
  const xpInCurrentLevel = xp % 100;

  const isBadgeUnlocked = (b) => {
    if (b.reqStars && stars >= b.reqStars) return true;
    if (b.reqStreak && streak >= b.reqStreak) return true;
    if (b.reqTopic) {
      // Check if any completed topic matches
      return Object.keys(completedTopics).some(k => k.includes(b.reqTopic));
    }
    return false;
  };

  const handlePrint = () => {
    playSound.click();
    window.print();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(5px)',
          zIndex: 2500
        }}
      />

      {/* Modal Dialog */}
      <div
        className="glass-panel"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '680px',
          maxHeight: '90vh',
          background: 'white',
          borderRadius: '28px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
          zIndex: 2501,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '5px solid var(--color-primary-light)'
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
          color: 'white',
          padding: '20px 25px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              border: '2px solid white'
            }}>
              🏆
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>
                {language === 'en' ? 'Achievements & Progress' : 'சாதனைகள் மற்றும் முன்னேற்றம்'}
              </h2>
              <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                {userName} • Grade {userGrade}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handlePrint}
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
              title="Print Certificate"
            >
              <Printer size={18} />
            </button>
            <button
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '25px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Level Progress Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #f5f6fa 0%, #dfe4ea 100%)',
            padding: '16px 20px',
            borderRadius: '20px',
            border: '2px solid #dcdde1',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2d3436' }}>
                Level {level}: {currentLevelName}
              </span>
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#6c5ce7' }}>
                {xp} Total XP
              </span>
            </div>
            {/* XP Bar */}
            <div style={{ width: '100%', height: '14px', background: '#ced6e0', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{
                width: `${(xpInCurrentLevel / 100) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #6c5ce7 0%, #00cec9 100%)',
                borderRadius: '10px',
                transition: 'width 0.4s ease'
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#636e72' }}>
              <span>{xpInCurrentLevel} / 100 XP to next level</span>
              <span>🔥 {streak} Day Streak • ⭐ {stars} Stars Earned</span>
            </div>
          </div>

          {/* Badges Grid */}
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#2d3436', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={20} color="#6c5ce7" />
              {language === 'en' ? 'Trophy Cabinet (8 Badges)' : 'கோப்பை அலமாரி (8 பதக்கங்கள்)'}
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
              gap: '12px'
            }}>
              {BADGES.map(b => {
                const unlocked = isBadgeUnlocked(b);
                return (
                  <div
                    key={b.id}
                    style={{
                      background: unlocked ? 'linear-gradient(135deg, #fff 0%, #f0f3ff 100%)' : '#f1f2f6',
                      border: unlocked ? '2.5px solid #a29bfe' : '2px dashed #ced6e0',
                      borderRadius: '16px',
                      padding: '14px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      opacity: unlocked ? 1 : 0.6,
                      boxShadow: unlocked ? '0 6px 15px rgba(108, 92, 231, 0.15)' : 'none',
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      fontSize: '2.2rem',
                      marginBottom: '6px',
                      filter: unlocked ? 'none' : 'grayscale(100%)'
                    }}>
                      {b.icon}
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: unlocked ? '#2d3436' : '#747d8c' }}>
                      {language === 'en' ? b.title : b.titleTa}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#636e72', marginTop: '4px', lineHeight: '1.2' }}>
                      {language === 'en' ? b.desc : b.descTa}
                    </span>

                    {unlocked ? (
                      <span style={{ position: 'absolute', top: '6px', right: '6px', color: '#2ecc71', fontSize: '0.9rem' }}>
                        ✓
                      </span>
                    ) : (
                      <span style={{ position: 'absolute', top: '6px', right: '6px', color: '#a4b0be' }}>
                        <Lock size={12} />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Learning Passport / Summary */}
          <div style={{
            background: '#fafbfc',
            border: '2px solid #e1e6ff',
            borderRadius: '16px',
            padding: '15px 20px',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#6c5ce7' }}>
                {Object.keys(completedTopics).length}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#636e72' }}>
                {language === 'en' ? 'Topics Mastered' : 'முடித்த தலைப்புகள்'}
              </div>
            </div>
            <div style={{ width: '1px', height: '35px', background: '#dcdde1' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fdcb6e' }}>
                ⭐ {stars}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#636e72' }}>
                {language === 'en' ? 'Stars Earned' : 'நட்சத்திரங்கள்'}
              </div>
            </div>
            <div style={{ width: '1px', height: '35px', background: '#dcdde1' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#e74c3c' }}>
                🔥 {streak}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#636e72' }}>
                {language === 'en' ? 'Day Streak' : 'தொடர் நாட்கள்'}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
