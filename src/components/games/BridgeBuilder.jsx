import React, { useState } from 'react';
import { Award, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

const ROUNDS = [
  {
    id: 1,
    target: "1/2",
    targetVal: 0.5,
    options: [
      { text: "2/4", value: 0.5, isCorrect: true },
      { text: "2/5", value: 0.4, isCorrect: false },
      { text: "3/8", value: 0.375, isCorrect: false }
    ],
    explanation: "2/4 is equivalent to 1/2 because 2 is exactly half of 4. (If you multiply top and bottom of 1/2 by 2, you get 2/4!)"
  },
  {
    id: 2,
    target: "1/3",
    targetVal: 0.333,
    options: [
      { text: "3/5", value: 0.6, isCorrect: false },
      { text: "2/6", value: 0.333, isCorrect: true },
      { text: "4/10", value: 0.4, isCorrect: false }
    ],
    explanation: "2/6 is equivalent to 1/3. Multiplying both numbers in 1/3 by 2 gives 2/6. The ratio remains the same!"
  },
  {
    id: 3,
    target: "2/3",
    targetVal: 0.666,
    options: [
      { text: "3/4", value: 0.75, isCorrect: false },
      { text: "6/10", value: 0.6, isCorrect: false },
      { text: "4/6", value: 0.666, isCorrect: true }
    ],
    explanation: "4/6 is equivalent to 2/3 because multiplying both the numerator (2) and denominator (3) by 2 gives 4/6!"
  }
];

export default function BridgeBuilder({ onGameComplete }) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [success, setSuccess] = useState(false);
  const [finished, setFinished] = useState(false);

  const activeRound = ROUNDS[roundIdx];

  const handleOptionClick = (option) => {
    if (selectedOpt) return; // Answered already
    setSelectedOpt(option.text);

    if (option.isCorrect) {
      setSuccess(true);
      setFeedback(`Woohoo! ${option.text} is correct! ${activeRound.explanation}`);
    } else {
      setSuccess(false);
      setFeedback(`Oh no! ${option.text} is not equivalent to ${activeRound.target}. Look closely: if we simplify ${option.text}, does it equal ${activeRound.target}? Try clicking another log!`);
    }
  };

  const handleNextRound = () => {
    setSelectedOpt(null);
    setFeedback('');
    if (roundIdx < ROUNDS.length - 1) {
      setRoundIdx(prev => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const handleRetry = () => {
    setSelectedOpt(null);
    setFeedback('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
      
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)' }}>🪵 River Bridge Builder</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Help Cosmo cross the roaring river! Select the floating log that matches the target equivalent fraction.
        </p>
      </div>

      {!finished ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', width: '100%' }}>
          
          {/* River Simulation Visual Area */}
          <div 
            className="glass-panel" 
            style={{ 
              height: '180px', 
              background: '#0984e3', // deep blue river
              position: 'relative', 
              borderRadius: '20px', 
              overflow: 'hidden', 
              border: '6px solid white',
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
            }}
          >
            {/* River banks */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '60px', background: '#2ecc71', borderRight: '4px solid #27ae60' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '60px', background: '#2ecc71', borderLeft: '4px solid #27ae60' }} />
            
            {/* Waves animation in background */}
            <div style={{ position: 'absolute', top: '25%', left: '-10%', width: '120%', height: '20px', background: 'rgba(255,255,255,0.15)', transform: 'rotate(-2deg)', filter: 'blur(2px)' }} className="animate-float" />
            <div style={{ position: 'absolute', top: '65%', left: '-10%', width: '120%', height: '20px', background: 'rgba(255,255,255,0.15)', transform: 'rotate(1deg)', filter: 'blur(2px)' }} className="animate-bounce-slow" />

            {/* Character on Left Bank */}
            <div 
              style={{ 
                position: 'absolute', 
                left: '15px', 
                top: '40%', 
                fontSize: '2.5rem', 
                zIndex: 10,
                transform: `translateX(${roundIdx * 60}px)`, 
                transition: 'transform 0.8s ease'
              }}
            >
              🧑‍🚀
            </div>

            {/* Target indicator on right bank */}
            <div 
              style={{ 
                position: 'absolute', 
                right: '70px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                background: 'white', 
                border: '3px solid var(--color-accent)', 
                borderRadius: '12px', 
                padding: '5px 12px',
                textAlign: 'center',
                boxShadow: '0 4px 0 rgba(0,0,0,0.08)'
              }}
            >
              <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--color-text-muted)' }}>TARGET BRIDGE</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-primary)', fontFamily: 'var(--font-fun)' }}>
                {activeRound.target}
              </div>
            </div>

            {/* Bridge construction blocks */}
            <div style={{ position: 'absolute', left: '60px', right: '140px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '8px' }}>
              {ROUNDS.map((r, idx) => {
                const isBuilt = idx < roundIdx;
                const isCurrentBuilding = idx === roundIdx && selectedOpt && success;
                return (
                  <div 
                    key={r.id}
                    style={{
                      flex: 1,
                      height: '40px',
                      background: isBuilt || isCurrentBuilding ? '#d35400' : 'rgba(255,255,255,0.15)',
                      border: isBuilt || isCurrentBuilding ? '3px solid #e67e22' : '3px dashed rgba(255,255,255,0.3)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      fontFamily: 'var(--font-fun)',
                      boxShadow: isBuilt || isCurrentBuilding ? '0 4px 0 #ba4c00' : 'none'
                    }}
                  >
                    {isBuilt ? r.target : (isCurrentBuilding ? r.target : '')}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Option Logs Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              🌊 Choose the correct floating log to lock into the bridge:
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', width: '100%' }}>
              {activeRound.options.map((opt, idx) => {
                const isCurrent = selectedOpt === opt.text;
                let bg = '#e67e22'; // wooden orange
                let border = '4px solid #d35400';
                let shadow = '0 6px 0 #ba4c00';
                
                if (selectedOpt) {
                  if (isCurrent) {
                    bg = opt.isCorrect ? 'var(--color-success)' : 'var(--color-danger)';
                    border = opt.isCorrect ? '4px solid #27ae60' : '4px solid #c0392b';
                    shadow = opt.isCorrect ? '0 6px 0 #219653' : '0 6px 0 #962d22';
                  } else {
                    bg = '#b2bec3';
                    border = '4px solid #95a5a6';
                    shadow = '0 6px 0 #7f8c8d';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(opt)}
                    disabled={!!selectedOpt}
                    style={{
                      background: bg,
                      border: border,
                      boxShadow: shadow,
                      borderRadius: '18px',
                      padding: '20px 10px',
                      color: 'white',
                      fontSize: '1.6rem',
                      fontWeight: 'bold',
                      fontFamily: 'var(--font-fun)',
                      transform: isCurrent ? 'translateY(2px)' : 'none',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>🪵</span>
                    <span style={{ borderBottom: '2.5px solid white', width: '30px', textAlign: 'center', display: 'block', paddingBottom: '2px' }}>
                      {opt.text.split('/')[0]}
                    </span>
                    <span>
                      {opt.text.split('/')[1]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback Section */}
          {selectedOpt && (
            <div 
              className="glass-panel animate-float"
              style={{
                padding: '20px',
                border: success ? '4px solid var(--color-success)' : '4px solid var(--color-danger)',
                background: success ? 'rgba(235, 252, 240, 0.95)' : 'rgba(255, 242, 242, 0.95)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                {success ? <CheckCircle2 color="var(--color-success)" /> : <AlertCircle color="var(--color-danger)" />}
                {success ? 'Log Locked Successfully!' : 'Oops, Bridge Broke!'}
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-dark)', lineHeight: '1.4' }}>
                {feedback}
              </p>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                {success ? (
                  <button className="btn-playful btn-success" onClick={handleNextRound}>
                    {roundIdx < ROUNDS.length - 1 ? 'Build Next Section!' : 'Finish Crossing!'} <ArrowRight size={16} />
                  </button>
                ) : (
                  <button className="btn-playful btn-danger" onClick={handleRetry}>
                    Try Another Log
                  </button>
                )}
              </div>
            </div>
          )}

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
          <div style={{ fontSize: '3rem' }}>🏃‍♂️🪵🏞️🏆</div>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--color-success)' }}>
            Bridge Builder Champ!
          </h3>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-dark)', maxWidth: '500px', lineHeight: '1.5' }}>
            Incredible! You matched all the equivalent logs and built a solid path to help Cosmo safely cross the river. You're an equivalent fractions wizard!
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
