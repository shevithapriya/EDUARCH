import React, { useState } from 'react';
import { Award, ArrowDown, Smile, ShieldAlert, Heart } from 'lucide-react';

const ORGANS = [
  {
    id: 'mouth',
    name: 'Mouth 👄',
    description: 'We chew food here with our teeth and mix it with wet Saliva which starts breaking down starch.',
    actionWord: 'Chew and Crunch!'
  },
  {
    id: 'esophagus',
    name: 'Food Pipe (Esophagus) 🥖',
    description: 'A muscular tube that pushes the swallowed food down into the stomach using wave-like movements.',
    actionWord: 'Squeeze Downward!'
  },
  {
    id: 'stomach',
    name: 'Stomach 🧪',
    description: 'A J-shaped bag that churns food with strong acidic juices to kill bacteria and break down proteins.',
    actionWord: 'Mix with Acid!'
  },
  {
    id: 'small_intestine',
    name: 'Small Intestine 🌀',
    description: 'A long, coiled tube where major digestion takes place and all useful nutrients are absorbed into the blood.',
    actionWord: 'Absorb Nutrients!'
  },
  {
    id: 'large_intestine',
    name: 'Large Intestine 🧻',
    description: 'A wider tube that absorbs water from remaining undigested food and turns it into solid waste.',
    actionWord: 'Absorb Water!'
  }
];

export default function DigestJourney({ onGameComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const targetOrgan = ORGANS[currentStep];

  const handleOrganSelect = (organId) => {
    setSelectedOrgan(organId);
    setErrorMsg('');

    if (organId === targetOrgan.id) {
      setShowExplanation(true);
      setScore(prev => prev + 1);
    } else {
      setErrorMsg('Oops! That organ doesn\'t perform this step. Read the description and try again!');
    }
  };

  const handleNextStep = () => {
    setShowExplanation(false);
    setSelectedOrgan(null);
    if (currentStep < ORGANS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setFinished(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
      
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)' }}>🌀 Digestive Journey</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Follow the bite of food as it travels through the digestive system! Match the description to the correct organ.
        </p>
      </div>

      {!finished ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', width: '100%', alignItems: 'stretch' }}>
          
          {/* Left Panel: Description & Action */}
          <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px', background: 'white' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ background: 'var(--color-accent)', color: 'var(--color-text-dark)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  STEP {currentStep + 1} of 5
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  Active Food: 🍎 Sweet Apple Slice
                </span>
              </div>

              <h3 style={{ fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '10px' }}>
                Where does the food go now?
              </h3>
              
              <div style={{ background: '#f8f9fa', borderLeft: '5px solid var(--color-primary-light)', padding: '15px', borderRadius: '4px 12px 12px 4px', fontSize: '1.05rem', lineHeight: '1.5', margin: '15px 0' }}>
                💡 <em>"{targetOrgan.description}"</em>
              </div>
            </div>

            {/* Answer Feedback / Next Button */}
            {showExplanation ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '15px', background: 'rgba(46, 204, 113, 0.1)', border: '2px solid var(--color-success)', borderRadius: '12px' }}>
                <div style={{ color: 'var(--color-success)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Smile /> Correct! It's the {targetOrgan.name}!
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-dark)' }}>
                  Action Triggered: <strong>{targetOrgan.actionWord}</strong>. The food particle successfully passes through this stage!
                </div>
                <button 
                  className="btn-playful btn-success" 
                  onClick={handleNextStep}
                  style={{ alignSelf: 'flex-end', padding: '8px 20px', marginTop: '5px' }}
                >
                  Next Organ <ArrowDown size={16} />
                </button>
              </div>
            ) : (
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '15px' }}>
                👈 Click the matching organ in the Digestive Diagram!
              </div>
            )}

            {errorMsg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)', fontSize: '0.9rem', padding: '10px', background: 'rgba(255, 118, 117, 0.1)', border: '2.5px solid var(--color-danger)', borderRadius: '12px' }}>
                <ShieldAlert size={18} /> {errorMsg}
              </div>
            )}
          </div>

          {/* Right Panel: Interactive Diagram Layout */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', position: 'relative' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-dark)', borderBottom: '2px solid #f1f2f6', paddingBottom: '6px', width: '100%', textAlign: 'center' }}>
              👤 Digestive Tract Map
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', position: 'relative' }}>
              {ORGANS.map((organ, index) => {
                const isActive = index === currentStep;
                const isSelected = selectedOrgan === organ.id;
                const isPassed = index < currentStep;

                let borderStyle = '3px solid #dfe4ea';
                let bgStyle = 'white';
                if (isActive) {
                  borderStyle = '3px dashed var(--color-primary)';
                  bgStyle = 'rgba(108, 92, 231, 0.05)';
                }
                if (isPassed) {
                  borderStyle = '3px solid var(--color-success)';
                  bgStyle = 'rgba(46, 204, 113, 0.05)';
                }
                if (isSelected) {
                  borderStyle = organ.id === targetOrgan.id ? '3px solid var(--color-success)' : '3px solid var(--color-danger)';
                  bgStyle = organ.id === targetOrgan.id ? 'rgba(46, 204, 113, 0.15)' : 'rgba(255, 118, 117, 0.1)';
                }

                return (
                  <div key={organ.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <button
                      onClick={() => handleOrganSelect(organ.id)}
                      disabled={showExplanation}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '15px',
                        border: borderStyle,
                        background: bgStyle,
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        textAlign: 'center',
                        color: 'var(--color-text-dark)',
                        position: 'relative',
                        boxShadow: '0 4px 0 rgba(0,0,0,0.02)'
                      }}
                    >
                      {organ.name}
                      {isActive && (
                        <span 
                          style={{ 
                            position: 'absolute', 
                            right: '15px', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            fontSize: '1.2rem',
                            animation: 'bounceSlow 1s infinite'
                          }}
                        >
                          🍎
                        </span>
                      )}
                    </button>
                    {index < ORGANS.length - 1 && (
                      <ArrowDown 
                        size={18} 
                        color={isPassed ? 'var(--color-success)' : '#b2bec3'} 
                        style={{ margin: '4px 0' }} 
                      />
                    )}
                  </div>
                );
              })}
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
          <div style={{ fontSize: '3rem' }}>🍏 ➔ 💩</div>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--color-success)' }}>
            Digestion Journey Completed!
          </h3>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-dark)', maxWidth: '500px', lineHeight: '1.5' }}>
            Congratulations, Explorer! You successfully guided the apple through all the digestive organs. You understand exactly how food is broken down to power your body!
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
