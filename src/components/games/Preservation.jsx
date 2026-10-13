import React, { useState } from 'react';
import { Award, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

const ITEMS = [
  { id: 'milk', name: '🥛 Fresh Milk', method: 'boil', hint: 'Boiling kills germs in liquid milk and keeps it fresh!', action: 'Boil it!' },
  { id: 'mango', name: '🥭 Raw Mangoes', method: 'pickle', hint: 'Putting mangoes in oil and vinegar (pickling) preserves them!', action: 'Pickle it!' },
  { id: 'grapes', name: '🍇 Sweet Grapes', method: 'dry', hint: 'Drying grapes in the sun removes water and makes raisins!', action: 'Dry them!' }
];

const METHODS = [
  { id: 'boil', name: '🔥 Boiling Stove', desc: 'Kills bacteria with high heat' },
  { id: 'pickle', name: '🏺 Pickle Jar', desc: 'Uses oil and acid to preserve' },
  { id: 'dry', name: '☀️ Sun Dehydrator', desc: 'Removes moisture so mold cannot grow' }
];

export default function Preservation({ onGameComplete }) {
  const [activeItemIdx, setActiveItemIdx] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [feedback, setFeedback] = useState('');
  const [success, setSuccess] = useState(false);
  const [finished, setFinished] = useState(false);

  const activeItem = ITEMS[activeItemIdx];

  const handlePreserve = () => {
    if (!selectedMethod) {
      setFeedback('Select a preservation tool first!');
      return;
    }

    if (selectedMethod === activeItem.method) {
      setSuccess(true);
      setFeedback(`Excellent! 🎉 ${activeItem.hint}`);
    } else {
      setSuccess(false);
      setFeedback(`Oh no! That method didn't preserve the ${activeItem.name.split(' ')[1]} properly and it spoiled! Try another tool.`);
    }
  };

  const handleNext = () => {
    setSelectedMethod('');
    setFeedback('');
    setSuccess(false);
    if (activeItemIdx < ITEMS.length - 1) {
      setActiveItemIdx(prev => prev + 1);
    } else {
      setFinished(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
      
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)' }}>🏺 Food Preservation Lab</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Stop food from spoiling in the Eduarch Kitchen! Choose the correct scientific method to preserve each item.
        </p>
      </div>

      {!finished ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px', width: '100%', alignItems: 'stretch' }}>
          
          {/* Left panel: Active food to preserve */}
          <div className="glass-panel" style={{ padding: '20px', background: 'white', display: 'flex', flexDirection: 'column', justifySelf: 'stretch', gap: '15px' }}>
            <div>
              <span style={{ background: 'var(--color-accent)', color: 'var(--color-text-dark)', padding: '3px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                LAB TEST {activeItemIdx + 1} of 3
              </span>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--color-text-dark)', marginTop: '8px' }}>
                Preserve the {activeItem.name}!
              </h3>
            </div>

            {/* Food Visual */}
            <div style={{ height: '140px', background: '#f8f9fa', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4.5rem', border: '3px solid #dfe4ea' }}>
              <span className={success ? '' : 'animate-float'}>{activeItem.name.split(' ')[0]}</span>
            </div>

            {/* Tool selectors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Choose Laboratory Method:</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {METHODS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedMethod(m.id); setFeedback(''); }}
                    disabled={success}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '10px',
                      border: selectedMethod === m.id ? '2.5px solid var(--color-primary)' : '1.5px solid #dfe4ea',
                      background: selectedMethod === m.id ? 'var(--color-primary-light)' : 'white',
                      color: selectedMethod === m.id ? 'white' : 'var(--color-text-dark)',
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{m.name.split(' ')[0]}</span>
                    <span>{m.name.split(' ').slice(1).join(' ')}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            {!success ? (
              <button className="btn-playful btn-primary" onClick={handlePreserve} style={{ padding: '12px' }}>
                🧪 Apply Preservation!
              </button>
            ) : (
              <button className="btn-playful btn-success" onClick={handleNext} style={{ padding: '12px' }}>
                {activeItemIdx < ITEMS.length - 1 ? 'Preserve Next Item!' : 'Finish Lab!'}
              </button>
            )}
          </div>

          {/* Right panel: Feedback & Explanations */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '15px', background: '#f5f6fa' }}>
            {!feedback ? (
              <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '3rem' }}>🔬</span>
                <p style={{ fontSize: '0.95rem' }}>Select a preservation tool on the left to see the chemical effect on the food.</p>
              </div>
            ) : (
              <div 
                style={{ 
                  width: '100%', 
                  padding: '20px', 
                  borderRadius: '15px',
                  background: 'white',
                  border: success ? '3px solid var(--color-success)' : '3px solid var(--color-danger)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '2.5rem' }}>
                  {success ? '😋' : '🤢'}
                </div>
                <h4 style={{ color: success ? 'var(--color-success)' : 'var(--color-danger)', fontSize: '1.15rem' }}>
                  {success ? 'Preserved Perfectly!' : 'Food Spoiled!'}
                </h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-dark)', lineHeight: '1.4' }}>
                  {feedback}
                </p>
              </div>
            )}
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
          <div style={{ fontSize: '3rem' }}>🥛🥭🍇🏆</div>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--color-success)' }}>
            Food Scientist Certified!
          </h3>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-dark)', maxWidth: '500px', lineHeight: '1.5' }}>
            Sensational work! You preserved all foods correctly and understand the science of boiling, pickling, and drying. No germs can spoil your pantry now!
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
