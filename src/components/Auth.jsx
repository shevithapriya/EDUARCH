import React, { useState } from 'react';
import { playSound } from '../utils/audio';
import { Sparkles, GraduationCap, Globe, Shield, User } from 'lucide-react';

export default function Auth({ onLoginSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState('4');
  const [language, setLanguage] = useState('en'); // 'en' | 'ta'
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    playSound.click();

    if (!name.trim() || !password.trim()) {
      playSound.error();
      setErrorMsg(language === 'en' ? 'Please fill in all fields!' : 'அனைத்து விவரங்களையும் நிரப்பவும்!');
      return;
    }

    if (tab === 'signup') {
      // Save user profile config to localStorage
      const userProfile = {
        name: name.trim(),
        password: password.trim(),
        grade: parseInt(grade),
        language
      };
      localStorage.setItem(`user_${name.trim().toLowerCase()}`, JSON.stringify(userProfile));
      localStorage.setItem('active_user', JSON.stringify(userProfile));
      playSound.success();
      onLoginSuccess(userProfile);
    } else {
      // Login flow
      const savedUser = localStorage.getItem(`user_${name.trim().toLowerCase()}`);
      if (!savedUser) {
        playSound.error();
        setErrorMsg(language === 'en' ? 'User not found! Please sign up first.' : 'பயனர் கண்டறியப்படவில்லை! முதலில் பதிவு செய்யவும்.');
        return;
      }

      const userProfile = JSON.parse(savedUser);
      if (userProfile.password !== password.trim()) {
        playSound.error();
        setErrorMsg(language === 'en' ? 'Wrong password! Please check again.' : 'தவறான கடவுச்சொல்! மீண்டும் சரிபார்க்கவும்.');
        return;
      }

      localStorage.setItem('active_user', JSON.stringify(userProfile));
      playSound.success();
      onLoginSuccess(userProfile);
    }
  };

  const handleTabChange = (targetTab) => {
    playSound.click();
    setTab(targetTab);
    setErrorMsg('');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--color-sky-grad)', padding: '20px' }}>
      
      <div 
        className="glass-panel" 
        style={{ 
          width: '100%', 
          maxWidth: '430px', 
          padding: '30px', 
          background: 'rgba(255, 255, 255, 0.9)',
          animation: 'float 6s ease-in-out infinite',
          border: '5px solid var(--color-primary-light)'
        }}
      >
        {/* Playful Header */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles className="animate-star" color="var(--color-accent)" fill="var(--color-accent)" size={32} />
            Eduarch!
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
            {language === 'en' 
              ? 'Your Interactive AI 3D Gamified Study Space' 
              : 'உங்கள் ஊடாடும் AI 3D விளையாட்டு கற்றல் தளம்'}
          </p>
        </div>

        {/* Tab Toggle buttons */}
        <div style={{ display: 'flex', background: '#dfe4ea', borderRadius: '15px', padding: '5px', marginBottom: '20px' }}>
          <button
            onClick={() => handleTabChange('login')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '12px',
              fontWeight: 'bold',
              background: tab === 'login' ? 'white' : 'transparent',
              color: tab === 'login' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontSize: '1rem'
            }}
          >
            {language === 'en' ? '🔒 Login' : '🔒 உள்நுழைவு'}
          </button>
          <button
            onClick={() => handleTabChange('signup')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '12px',
              fontWeight: 'bold',
              background: tab === 'signup' ? 'white' : 'transparent',
              color: tab === 'signup' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontSize: '1rem'
            }}
          >
            {language === 'en' ? '📝 Sign Up' : '📝 பதிவு செய்'}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* Name input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--color-text-dark)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <User size={15} /> {language === 'en' ? 'Student Name' : 'மாணவர் பெயர்'}
            </label>
            <input
              type="text"
              placeholder={language === 'en' ? 'e.g. Adhavan' : 'உதாரணம்: ஆதவன்'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                padding: '12px 15px',
                borderRadius: '12px',
                border: '2px solid #ccc',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Password input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--color-text-dark)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Shield size={15} /> {language === 'en' ? 'Password' : 'கடவுச்சொல்'}
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: '12px 15px',
                borderRadius: '12px',
                border: '2px solid #ccc',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Signup only inputs */}
          {tab === 'signup' && (
            <>
              {/* Grade select */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--color-text-dark)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <GraduationCap size={15} /> {language === 'en' ? 'Select Grade' : 'வகுப்பைத் தேர்ந்தெடுக்கவும்'}
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: '2px solid #ccc',
                    fontSize: '1rem',
                    background: 'white',
                    outline: 'none'
                  }}
                >
                  <option value="4">{language === 'en' ? 'Grade 4 (Syllabus Filtered)' : 'வகுப்பு 4'}</option>
                  <option value="5">{language === 'en' ? 'Grade 5 (Syllabus Filtered)' : 'வகுப்பு 5'}</option>
                </select>
              </div>

              {/* Language selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--color-text-dark)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Globe size={15} /> {language === 'en' ? 'Select Language' : 'மொழியைத் தேர்ந்தெடுக்கவும்'}
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => { playSound.click(); setLanguage('en'); }}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '12px',
                      border: language === 'en' ? '2.5px solid var(--color-primary)' : '1px solid #ccc',
                      background: language === 'en' ? '#f0f3ff' : 'white',
                      fontWeight: 'bold',
                      color: 'var(--color-text-dark)'
                    }}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    type="button"
                    onClick={() => { playSound.click(); setLanguage('ta'); }}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '12px',
                      border: language === 'ta' ? '2.5px solid var(--color-primary)' : '1px solid #ccc',
                      background: language === 'ta' ? '#f0f3ff' : 'white',
                      fontWeight: 'bold',
                      color: 'var(--color-text-dark)'
                    }}
                  >
                    🇮🇳 தமிழ் (Tamil)
                  </button>
                </div>
              </div>
            </>
          )}

          {errorMsg && (
            <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'center', background: 'rgba(255,118,117,0.1)', padding: '10px', borderRadius: '8px' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Submit button */}
          <button 
            type="submit" 
            className="btn-playful btn-primary"
            style={{ padding: '12px', fontSize: '1.1rem', marginTop: '10px' }}
          >
            {tab === 'login' 
              ? (language === 'en' ? 'Go to Study Space! 🚀' : 'கற்றலைத் தொடங்கு! 🚀')
              : (language === 'en' ? 'Create Account! 🎓' : 'கணக்கை உருவாக்கு! 🎓')}
          </button>

          {/* Quick language toggle for auth view itself */}
          <button
            type="button"
            onClick={() => { playSound.click(); setLanguage(language === 'en' ? 'ta' : 'en'); }}
            style={{ background: 'transparent', color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 'bold', textDecoration: 'underline', marginTop: '5px' }}
          >
            {language === 'en' ? 'Switch to தமிழ்' : 'Switch to English'}
          </button>

        </form>
      </div>

    </div>
  );
}
