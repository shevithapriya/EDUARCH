import React, { useState } from 'react';
import { Award, ArrowRight, RefreshCw, Scale } from 'lucide-react';

const ROUNDS = [
  {
    id: 1,
    targetText: "3/5",
    targetVal: 3/5,
    options: [
      { text: "1/5", value: 1/5 },
      { text: "2/5", value: 2/5 },
      { text: "4/5", value: 4/5 },
      { text: "1/6", value: 1/6 }
    ],
    hint: "Think: what plus what equals 3, with the denominator remaining 5? Try 1/5 and 2/5!"
  },
  {
    id: 2,
    targetText: "5/8",
    targetVal: 5/8,
    options: [
      { text: "1/8", value: 1/8 },
      { text: "2/8", value: 2/8 },
      { text: "3/8", value: 3/8 },
      { text: "4/8", value: 4/8 }
    ],
    hint: "We need a sum of 5/8. Which two blocks add up to 5 on top? E.g., 2/8 + 3/8 or 1/8 + 4/8!"
  },
  {
    id: 3,
    targetText: "4/6",
    targetVal: 4/6,
    options: [
      { text: "1/6", value: 1/6 },
      { text: "2/6", value: 2/6 },
      { text: "3/6", value: 3/6 },
      { text: "5/6", value: 5/6 }
    ],
    hint: "We want a sum of 4/6. Try selecting 1/6 and 3/6!"
  }
];

export default function FractionBalance({ onGameComplete }) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [selectedWeights, setSelectedWeights] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [success, setSuccess] = useState(false);
  const [finished, setFinished] = useState(false);

  const activeRound = ROUNDS[roundIdx];

  const handleWeightToggle = (weight) => {
    if (success) return;
    
    let nextWeights;
    if (selectedWeights.some(w => w.text === weight.text)) {
      // Remove
      nextWeights = selectedWeights.filter(w => w.text !== weight.text);
    } else {
      // Add
      if (selectedWeights.length >= 2) {
        setFeedback("You can only place up to 2 weights on the scale pan!");
        return;
      }
      nextWeights = [...selectedWeights, weight];
    }
    setSelectedWeights(nextWeights);
    setFeedback('');

    // Check balance automatically if 2 weights selected
    if (nextWeights.length === 2) {
      const sum = nextWeights.reduce((acc, curr) => acc + curr.value, 0);
      const isMatch = Math.abs(sum - activeRound.targetVal) < 0.001;

      if (isMatch) {
        setSuccess(true);
        const sumText = `${nextWeights[0].text} + ${nextWeights[1].text} = ${activeRound.targetText}`;
        setFeedback(`Balanced! ⚖️ Perfect balance! ${sumText}. Since the denominators are the same, we just add the numerators!`);
      } else {
        setSuccess(false);
        const sumText = `${nextWeights[0].text} + ${nextWeights[1].text} = ${(nextWeights[0].value + nextWeights[1].value).toFixed(2)}`;
        setFeedback(`Scale tilted! ❌ That adds up to ${((nextWeights[0].value + nextWeights[1].value) * 5).toFixed(1)}/5 (or equivalent), which does not balance the target ${activeRound.targetText}. Press Reset or change weights!`);
      }
    }
  };

  const handleReset = () => {
    setSelectedWeights([]);
    setFeedback('');
    setSuccess(false);
  };

  const handleNextRound = () => {
    setSelectedWeights([]);
    setFeedback('');
    setSuccess(false);
    if (roundIdx < ROUNDS.length - 1) {
      setRoundIdx(prev => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const currentSumVal = selectedWeights.reduce((acc, curr) => acc + curr.value, 0);
  // Scale tilt logic:
  // If targetVal > currentSum -> left side tilts down.
  // If targetVal < currentSum -> right side tilts down.
  // If equal -> balanced.
  let scaleTilt = 0; // 0 is balanced, negative is left tilted, positive is right tilted
  if (currentSumVal < activeRound.targetVal) scaleTilt = -15;
  if (currentSumVal > activeRound.targetVal) scaleTilt = 15;
  if (Math.abs(currentSumVal - activeRound.targetVal) < 0.001) scaleTilt = 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
      
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)' }}>⚖️ Fraction Balance Scale</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Learn fraction additions! Place exactly two weights on the right scale pan to balance the target weight on the left.
        </p>
      </div>

      {!finished ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', width: '100%', alignItems: 'stretch' }}>
          
          {/* Left panel: weight selection controls */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifySelf: 'stretch', gap: '15px', background: 'white' }}>
            <div>
              <span style={{ background: 'var(--color-accent)', color: 'var(--color-text-dark)', padding: '3px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                ROUND {roundIdx + 1} of 3
              </span>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--color-text-dark)', marginTop: '8px' }}>
                Balance Target: <span style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-fun)', fontSize: '1.5rem' }}>{activeRound.targetText}</span>
              </h3>
            </div>

            {/* Weights Selector Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Click 2 weights to load:</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {activeRound.options.map(opt => {
                  const isSelected = selectedWeights.some(w => w.text === opt.text);
                  return (
                    <button
                      key={opt.text}
                      onClick={() => handleWeightToggle(opt)}
                      disabled={success && !isSelected}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        border: isSelected ? '3px solid var(--color-primary)' : '2px solid #dfe4ea',
                        background: isSelected ? 'var(--color-primary-light)' : 'white',
                        color: isSelected ? 'white' : 'var(--color-text-dark)',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        fontFamily: 'var(--font-fun)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px'
                      }}
                    >
                      <span>🏋️‍♂️</span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button className="btn-playful btn-danger" onClick={handleReset} style={{ padding: '10px' }}>
              <RefreshCw size={16} /> Reset Scale
            </button>

            {/* Feedback alert */}
            {feedback && (
              <div 
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: success ? 'rgba(46,204,113,0.1)' : 'rgba(255,118,117,0.1)',
                  border: success ? '2px solid var(--color-success)' : '2px solid var(--color-danger)',
                  fontSize: '0.9rem',
                  lineHeight: '1.4',
                  color: 'var(--color-text-dark)'
                }}
              >
                {feedback}
                {success && (
                  <button 
                    className="btn-playful btn-success" 
                    onClick={handleNextRound}
                    style={{ float: 'right', padding: '6px 12px', fontSize: '0.8rem', marginTop: '10px' }}
                  >
                    {roundIdx < ROUNDS.length - 1 ? 'Next Balance!' : 'Finish Game!'} <ArrowRight size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: Balance Scale Graphics */}
          <div className="glass-panel" style={{ padding: '20px', background: '#ffeaa7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '340px', position: 'relative' }}>
            <h3 style={{ position: 'absolute', top: '15px', color: 'var(--color-text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Scale size={18} /> Laboratory Balance
            </h3>

            {/* The Balance Beam structure */}
            <div style={{ width: '220px', height: '180px', position: 'relative', marginTop: '40px' }}>
              
              {/* Stand Column */}
              <div style={{ position: 'absolute', bottom: 0, left: '105px', width: '10px', height: '130px', background: '#7f8c8d', border: '1.5px solid white' }} />
              {/* Base */}
              <div style={{ position: 'absolute', bottom: 0, left: '60px', width: '100px', height: '12px', background: '#2c3e50', borderRadius: '4px' }} />

              {/* Rotatable Balance Beam */}
              <div 
                style={{
                  position: 'absolute',
                  top: '40px',
                  left: '10px',
                  width: '200px',
                  height: '8px',
                  background: '#bdc3c7',
                  border: '1.5px solid white',
                  borderRadius: '4px',
                  transformOrigin: '50% 50%',
                  transform: `rotate(${scaleTilt}deg)`,
                  transition: 'transform 0.5s ease',
                  zIndex: 2
                }}
              >
                {/* Left Pan (Target weight) */}
                {/* Hanging string left */}
                <div style={{ position: 'absolute', left: '10px', top: '6px', width: '2px', height: '45px', background: '#95a5a6' }} />
                <div style={{ position: 'absolute', left: '0px', top: '50px', width: '22px', height: '6px', background: '#e74c3c', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Weight label */}
                  <span style={{ fontSize: '0.6rem', color: 'white', fontWeight: 'bold', marginTop: '-15px' }}>
                    {activeRound.targetText}
                  </span>
                </div>

                {/* Right Pan (Selected weights) */}
                {/* Hanging string right */}
                <div style={{ position: 'absolute', right: '10px', top: '6px', width: '2px', height: '45px', background: '#95a5a6' }} />
                <div style={{ position: 'absolute', right: '0px', top: '50px', width: '22px', height: '6px', background: '#2ecc71', borderRadius: '2px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  {/* Selected weight text bubbles */}
                  {selectedWeights.map((w, idx) => (
                    <span 
                      key={idx} 
                      style={{ 
                        fontSize: '0.65rem', 
                        background: 'white', 
                        border: '1px solid var(--color-primary)', 
                        padding: '1px 3px', 
                        borderRadius: '4px', 
                        fontWeight: 'bold',
                        marginTop: idx === 0 ? '-35px' : '-20px',
                        zIndex: 10
                      }}
                    >
                      {w.text}
                    </span>
                  ))}
                </div>

              </div>

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
          <div style={{ fontSize: '3rem' }}>⚖️➕📐🏆</div>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--color-success)' }}>
            Addition Balance Expert!
          </h3>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-dark)', maxWidth: '500px', lineHeight: '1.5' }}>
            Sensational balancing, mathematician! You matched the targets perfectly by adding the fraction numerators together. You are ready for any fraction sum!
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
