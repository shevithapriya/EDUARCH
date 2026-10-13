import React, { useState } from 'react';
import { Award, ArrowRight, Zap, Target, RefreshCw } from 'lucide-react';

const ROUNDS = [
  {
    id: 1,
    instruction: "🎯 Aim the laser at an ACUTE Angle! (Less than 90°)",
    targetType: "acute",
    check: (angle) => angle > 10 && angle < 90,
    hint: "Acute angles are small and sharp, measuring between 0° and 90°!"
  },
  {
    id: 2,
    instruction: "🎯 Aim the laser at a RIGHT Angle! (Exactly 90°)",
    targetType: "right",
    check: (angle) => angle === 90,
    hint: "Right angles look like an 'L' shape and are exactly 90°!"
  },
  {
    id: 3,
    instruction: "🎯 Aim the laser at an OBTUSE Angle! (Between 90° and 180°)",
    targetType: "obtuse",
    check: (angle) => angle > 90 && angle < 180,
    hint: "Obtuse angles are wide and open, measuring between 90° and 180°!"
  }
];

export default function LaserAngles({ onGameComplete }) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [angle, setAngle] = useState(45);
  const [fired, setFired] = useState(false);
  const [success, setSuccess] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [finished, setFinished] = useState(false);

  const activeRound = ROUNDS[roundIdx];

  const handleFire = () => {
    setFired(true);
    const isCorrect = activeRound.check(angle);

    setTimeout(() => {
      if (isCorrect) {
        setSuccess(true);
        setFeedback(`BOOM! 💥 Hit! You hit the target at ${angle}°. That is indeed a perfect ${activeRound.targetType.toUpperCase()} angle!`);
      } else {
        setSuccess(false);
        setFeedback(`Missed! 💨 You fired at ${angle}°. That is not an ${activeRound.targetType.toUpperCase()} angle. Hint: ${activeRound.hint}`);
      }
    }, 800); // laser duration
  };

  const handleNextRound = () => {
    setFired(false);
    setSuccess(false);
    setFeedback('');
    setAngle(roundIdx === 0 ? 90 : 120); // default starting angle for next rounds
    if (roundIdx < ROUNDS.length - 1) {
      setRoundIdx(prev => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const handleRetry = () => {
    setFired(false);
    setFeedback('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
      
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)' }}>⚡ Laser Angle Shooter</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Rotate the protractor-aligned laser cannon to lock onto specified angle ranges!
        </p>
      </div>

      {!finished ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', width: '100%', alignItems: 'center' }}>
          
          {/* Left panel controls */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', background: 'white' }}>
            <div>
              <span style={{ background: 'var(--color-accent)', color: 'var(--color-text-dark)', padding: '3px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                ROUND {roundIdx + 1} of 3
              </span>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-text-dark)', marginTop: '8px' }}>
                {activeRound.instruction}
              </h3>
            </div>

            {/* Slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 'bold' }}>
                <span>Cannon Angle Pointer:</span>
                <span style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-fun)', fontSize: '1.2rem' }}>
                  {angle}°
                </span>
              </div>
              <input 
                type="range"
                min="0"
                max="180"
                value={angle}
                onChange={(e) => {
                  setAngle(Number(e.target.value));
                  setFeedback('');
                }}
                disabled={fired}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  outline: 'none',
                  cursor: 'pointer',
                  accentColor: 'var(--color-primary)'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#b2bec3', fontWeight: 'bold' }}>
                <span>0° (Flat Right)</span>
                <span>90° (Vertical Up)</span>
                <span>180° (Flat Left)</span>
              </div>
            </div>

            {/* Shoot Action */}
            {!fired ? (
              <button 
                className="btn-playful btn-danger animate-bounce-slow"
                onClick={handleFire}
                style={{ padding: '12px', fontSize: '1.1rem' }}
              >
                <Zap size={18} fill="white" /> FIRE LASER CANNON!
              </button>
            ) : (
              <div style={{ textAlign: 'center', padding: '10px' }}>
                {!feedback ? (
                  <span style={{ fontWeight: 'bold', color: 'var(--color-primary-light)', animation: 'beamPulse 0.5s infinite' }}>
                    ⚡ LASER BEAM CHARGING... ⚡
                  </span>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div 
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        background: success ? 'rgba(46,204,113,0.1)' : 'rgba(255,118,117,0.1)',
                        border: success ? '2px solid var(--color-success)' : '2px solid var(--color-danger)',
                        fontSize: '0.9rem',
                        lineHeight: '1.45'
                      }}
                    >
                      {feedback}
                    </div>

                    {success ? (
                      <button className="btn-playful btn-success" onClick={handleNextRound}>
                        {roundIdx < ROUNDS.length - 1 ? 'Next Target!' : 'Finish Training!'} <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button className="btn-playful btn-danger" onClick={handleRetry}>
                        <RefreshCw size={14} /> Re-Align Cannon
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: Cannon Arena View */}
          <div className="glass-panel" style={{ padding: '20px', background: '#2c3e50', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '340px', position: 'relative', overflow: 'hidden', border: '4px solid #34495e' }}>
            
            {/* Protractor markings in background */}
            <div 
              style={{
                position: 'absolute',
                bottom: '10px',
                width: '280px',
                height: '140px',
                border: '4px dashed rgba(255,255,255,0.15)',
                borderBottom: 'none',
                borderRadius: '140px 140px 0 0',
                pointerEvents: 'none'
              }}
            />
            {/* 90 degree indicator */}
            <div style={{ position: 'absolute', bottom: '150px', color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', fontWeight: 'bold' }}>90°</div>
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', fontWeight: 'bold' }}>180°</div>
            <div style={{ position: 'absolute', bottom: '10px', right: '10px', color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', fontWeight: 'bold' }}>0°</div>

            {/* Laser Beam Rendering (only when fired is true) */}
            {fired && (
              <div 
                style={{
                  position: 'absolute',
                  bottom: '18px',
                  left: '50%',
                  width: '4px',
                  height: '240px',
                  background: success ? '#2ecc71' : '#e74c3c',
                  boxShadow: success ? '0 0 15px #2ecc71, 0 0 30px #2ecc71' : '0 0 15px #e74c3c, 0 0 30px #e74c3c',
                  transformOrigin: '50% 100%',
                  // Protractor angle 0 is Right, 180 is Left. Standard CSS rotate goes clockwise.
                  // So we map: CSS rotation = 90 - angle (e.g. 90deg is up, 0deg is flat left... wait)
                  // Let's do: angle=90 -> CSS rotation = 0. angle=0 -> CSS rotation = 90. angle=180 -> CSS rotation = -90.
                  // So CSS rotation = 90 - angle!
                  transform: `translateX(-50%) rotate(${90 - angle}deg)`,
                  zIndex: 2,
                  animation: 'beamPulse 0.15s infinite'
                }}
              />
            )}

            {/* Target Ring */}
            {/* Position target on different quadrants based on target type */}
            <div 
              style={{
                position: 'absolute',
                // Acute: right quadrant (e.g. bottom 50px, right 40px)
                // Right: top quadrant (e.g. top 25px, left 130px)
                // Obtuse: left quadrant (e.g. bottom 50px, left 40px)
                bottom: activeRound.targetType === 'right' ? '180px' : '90px',
                left: activeRound.targetType === 'right' ? 'calc(50% - 20px)' : (activeRound.targetType === 'obtuse' ? '40px' : 'auto'),
                right: activeRound.targetType === 'acute' ? '40px' : 'auto',
                color: success && fired ? 'var(--color-success)' : 'var(--color-accent)',
                animation: 'bounceSlow 2s infinite',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 3
              }}
            >
              <Target size={36} className={success && fired ? '' : 'animate-star'} />
              <span style={{ fontSize: '0.65rem', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '5px', color: 'white', fontWeight: 'bold', marginTop: '3px' }}>
                {activeRound.targetType.toUpperCase()}
              </span>
            </div>

            {/* Laser Cannon Base */}
            <div 
              style={{
                position: 'absolute',
                bottom: '0',
                width: '60px',
                height: '36px',
                background: '#7f8c8d',
                border: '3px solid white',
                borderRadius: '30px 30px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 4
              }}
            >
              {/* Cannon Barrel */}
              <div 
                style={{
                  width: '12px',
                  height: '40px',
                  background: '#95a5a6',
                  border: '2px solid white',
                  borderRadius: '4px',
                  position: 'absolute',
                  bottom: '15px',
                  transformOrigin: '50% 100%',
                  transform: `rotate(${90 - angle}deg)`,
                  transition: 'transform 0.15s'
                }}
              />
              <span style={{ fontSize: '0.8rem', color: 'white', zIndex: 5, fontWeight: 'bold' }}>📡</span>
            </div>

          </div>

        </div>
      ) : (
        <div 
          className="glass-panel" 
          style={{ 
            width: '100%', 
            padding: '40px 20px', 
            border: '4px solid var(--color-success)',
            background: 'rgba(235, 252, 240, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '3rem' }}>⚡📐🎯🏆</div>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--color-success)' }}>
            Laser Angle Sniper!
          </h3>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-dark)', maxWidth: '500px', lineHeight: '1.5' }}>
            Spectacular shooting, Cadet! You aligned the laser cannon perfectly and blasted all targets. You can identify Acute, Right, and Obtuse angles instantly!
          </p>

          <button 
            className="btn-playful btn-accent animate-star" 
            onClick={() => onGameComplete(5)}
            style={{ marginTop: '10px', fontSize: '1.2rem', padding: '12px 30px' }}
          >
            <Award size={22} /> Collect 5 Stars!
          </button>
        </div>
      )}

    </div>
  );
}
