import React, { useState } from 'react';
import { Award, ArrowRight, RefreshCw, Smile, Eye } from 'lucide-react';

const ROUNDS = [
  {
    id: 1,
    rampName: "Easy Street Ramp 🛹",
    angle: 45,
    options: [30, 45, 60, 90],
    trick: "Awesome Kickflip! 🛹💨",
    hint: "Align the flat baseline of the protractor with the ground, put the center dot on the corner, and read where the ramp slope points! It is exactly halfway to 90 degrees."
  },
  {
    id: 2,
    rampName: "Mega X-Games Slope 🛹",
    angle: 60,
    options: [30, 45, 60, 75],
    trick: "Spectacular 360 Spin! 🌀✨",
    hint: "This ramp is steeper! Align the protractor base and trace the line. It passes exactly through the 60 degree mark on the inner scale!"
  }
];

export default function ProtractorHero({ onGameComplete }) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [selectedAngle, setSelectedAngle] = useState(null);
  const [showProtractor, setShowProtractor] = useState(false);
  const [protractorRotation, setProtractorRotation] = useState(0);
  const [skating, setSkating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [finished, setFinished] = useState(false);

  const activeRound = ROUNDS[roundIdx];

  const handleAngleSelect = (angleOption) => {
    if (skating) return;
    setSelectedAngle(angleOption);

    if (angleOption === activeRound.angle) {
      setSuccess(true);
      setSkating(true);
      setFeedback(`CORRECT! 🥳 The ramp is exactly ${activeRound.angle}°. Preparing launcher...`);
      
      // Skateboard trick animation duration
      setTimeout(() => {
        setFeedback(`WOAH! 🛹 The skater launched at ${activeRound.angle}° and performed a ${activeRound.trick}!`);
        setSkating(false);
      }, 1500);

    } else {
      setSuccess(false);
      setFeedback(`Oh! That is not the correct slope. Enable the Protractor Helper tool and align the baseline to double check the degrees!`);
    }
  };

  const handleNextRound = () => {
    setSelectedAngle(null);
    setFeedback('');
    setSuccess(false);
    setShowProtractor(false);
    setProtractorRotation(0);
    if (roundIdx < ROUNDS.length - 1) {
      setRoundIdx(prev => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const handleRetry = () => {
    setSelectedAngle(null);
    setFeedback('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
      
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)' }}>🛹 Protractor Ramp Hero</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Measure the slope of the jump ramps using your virtual protractor to help the skateboarder land tricks!
        </p>
      </div>

      {!finished ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', width: '100%', alignItems: 'center' }}>
          
          {/* Left panel: Info & options */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', background: 'white' }}>
            <div>
              <span style={{ background: 'var(--color-accent)', color: 'var(--color-text-dark)', padding: '3px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                ROUND {roundIdx + 1} of 2
              </span>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--color-text-dark)', marginTop: '8px' }}>
                {activeRound.rampName}
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '5px', lineHeight: '1.4' }}>
                Activate your protractor tool, measure the angle of the slope, and select the correct degree below!
              </p>
            </div>

            {/* Protractor Tool Toggle */}
            <button
              onClick={() => setShowProtractor(!showProtractor)}
              className="btn-playful"
              style={{
                background: showProtractor ? 'var(--color-primary)' : 'white',
                border: '2.5px solid var(--color-primary)',
                color: showProtractor ? 'white' : 'var(--color-primary)',
                padding: '8px 12px',
                fontSize: '0.9rem',
                boxShadow: 'none'
              }}
            >
              📐 {showProtractor ? 'Hide Protractor Tool' : 'Show Protractor Tool'}
            </button>

            {/* Rotation control for protractor if shown */}
            {showProtractor && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '10px', background: '#f1f2f6', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  <span>Align Protractor (Rotate):</span>
                  <span>{protractorRotation}°</span>
                </div>
                <input 
                  type="range"
                  min="-30"
                  max="30"
                  value={protractorRotation}
                  onChange={(e) => setProtractorRotation(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                />
              </div>
            )}

            {/* Multiple Choice Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Select Measured Angle:</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {activeRound.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleAngleSelect(opt)}
                    disabled={success}
                    style={{
                      padding: '12px 6px',
                      borderRadius: '12px',
                      border: selectedAngle === opt ? '3px solid var(--color-primary)' : '2px solid #dfe4ea',
                      background: selectedAngle === opt 
                        ? (opt === activeRound.angle ? 'var(--color-success)' : 'var(--color-danger)') 
                        : 'white',
                      color: selectedAngle === opt ? 'white' : 'var(--color-text-dark)',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      fontFamily: 'var(--font-fun)'
                    }}
                  >
                    {opt}°
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback / Progression */}
            {feedback && (
              <div 
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: success ? 'rgba(46,204,113,0.1)' : 'rgba(255,118,117,0.1)',
                  border: success ? '2px solid var(--color-success)' : '2px solid var(--color-danger)',
                  fontSize: '0.95rem',
                  lineHeight: '1.45',
                  color: 'var(--color-text-dark)'
                }}
              >
                {feedback}
                {success && !skating && (
                  <button 
                    className="btn-playful btn-success" 
                    onClick={handleNextRound}
                    style={{ float: 'right', padding: '6px 12px', fontSize: '0.8rem', marginTop: '10px' }}
                  >
                    {roundIdx < ROUNDS.length - 1 ? 'Next Ramp!' : 'Collect Stars!'} <ArrowRight size={14} />
                  </button>
                )}
                {!success && (
                  <button 
                    className="btn-playful btn-danger" 
                    onClick={handleRetry}
                    style={{ float: 'right', padding: '6px 12px', fontSize: '0.8rem', marginTop: '10px' }}
                  >
                    Try Again
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: Skating Visualizer */}
          <div className="glass-panel" style={{ padding: '20px', background: '#a29bfe', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '340px', position: 'relative', overflow: 'hidden', border: '4px solid #74b9ff' }}>
            
            {/* Ground Line */}
            <div style={{ position: 'absolute', bottom: '30px', left: 0, right: 0, height: '4px', background: '#2d3436' }} />

            {/* The Ramp line */}
            <div 
              style={{
                position: 'absolute',
                bottom: '30px',
                left: '60px',
                width: '180px',
                height: '4px',
                background: '#eb3b5a',
                transformOrigin: '0% 50%',
                // Rotate ramp based on round angle
                transform: `rotate(${-activeRound.angle}deg)`,
                zIndex: 2
              }}
            >
              {/* Ramp slope board visual */}
              <div style={{ width: '100%', height: '15px', background: '#d35400', border: '1.5px solid white', borderRadius: '4px', transform: 'translateY(-15px)' }} />
            </div>

            {/* Vertex Point Marker (Corner of angle) */}
            <div style={{ position: 'absolute', bottom: '26px', left: '56px', width: '12px', height: '12px', borderRadius: '50%', background: '#2d3436', zIndex: 3 }} />

            {/* Virtual Protractor Overlay */}
            {showProtractor && (
              <div 
                style={{
                  position: 'absolute',
                  bottom: '30px', // Align baseline with ground
                  left: '60px',  // Align center mark with vertex
                  width: '200px',
                  height: '100px',
                  background: 'rgba(0, 206, 201, 0.45)', // transparent cyan protractor
                  border: '3px solid #00cec9',
                  borderBottom: 'none',
                  borderRadius: '100px 100px 0 0',
                  transformOrigin: '50% 100%',
                  transform: `translate(-50%, 0) rotate(${protractorRotation}deg)`,
                  zIndex: 5,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center'
                }}
              >
                {/* Center marker */}
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white', position: 'absolute', bottom: '-3px' }} />
                
                {/* 90 deg marking line */}
                <div style={{ position: 'absolute', height: '100%', width: '2px', background: 'rgba(255,255,255,0.7)', left: '50%' }} />
                
                {/* 45 deg marking line */}
                <div style={{ position: 'absolute', height: '100%', width: '1.5px', background: 'rgba(255,255,255,0.4)', left: '50%', transformOrigin: '50% 100%', transform: 'rotate(-45deg)' }} />

                {/* 60 deg marking line */}
                <div style={{ position: 'absolute', height: '100%', width: '1.5px', background: 'rgba(255,255,255,0.4)', left: '50%', transformOrigin: '50% 100%', transform: 'rotate(-60deg)' }} />

                {/* Degree indicators text */}
                <div style={{ position: 'absolute', top: '15px', color: 'white', fontSize: '0.65rem', fontWeight: 'bold' }}>90°</div>
                <div style={{ position: 'absolute', top: '35px', right: '35px', color: 'white', fontSize: '0.65rem', fontWeight: 'bold', transform: 'rotate(45deg)' }}>45°</div>
                <div style={{ position: 'absolute', top: '25px', right: '55px', color: 'white', fontSize: '0.65rem', fontWeight: 'bold', transform: 'rotate(60deg)' }}>60°</div>
              </div>
            )}

            {/* Skater character */}
            <div 
              style={{
                position: 'absolute',
                // Skater animation path
                // If skating, trigger launch
                bottom: skating ? '150px' : '30px',
                left: skating ? '220px' : '15px',
                fontSize: '2.5rem',
                zIndex: 6,
                transition: skating ? 'all 1.5s cubic-bezier(0.19, 1, 0.22, 1)' : 'none',
                transform: skating ? 'rotate(360deg) scale(1.2)' : 'none'
              }}
            >
              🛹
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
          <div style={{ fontSize: '3.5rem' }}>🛹📐🌀🏆</div>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--color-success)' }}>
            Protractor Champ Landing!
          </h3>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-dark)', maxWidth: '500px', lineHeight: '1.5' }}>
            Incredible skill, Protractor Hero! You measured all skater slopes with absolute precision and helped the skater launch extreme tricks safely. You've mastered angle measurement!
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
