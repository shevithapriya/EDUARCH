import React, { useState } from 'react';
import { Award, ArrowRight, HelpCircle, Dumbbell } from 'lucide-react';

export default function MuscleGym({ onGameComplete }) {
  const [stage, setStage] = useState(1); // 1 = lift, 2 = lower
  const [biceps, setBiceps] = useState('relaxed'); // 'relaxed' | 'contracted'
  const [triceps, setTriceps] = useState('relaxed'); // 'relaxed' | 'contracted'
  const [feedback, setFeedback] = useState('');
  const [success, setSuccess] = useState(false);
  const [finished, setFinished] = useState(false);

  const handleFlex = () => {
    if (biceps === 'contracted' && triceps === 'contracted') {
      setFeedback("Ouch! Cramp! 😣 Both muscles cannot contract at the same time. Remember, muscles work as an antagonistic pair—when one pulls (contracts), the other must relax!");
      setSuccess(false);
      return;
    }
    if (biceps === 'relaxed' && triceps === 'relaxed') {
      setFeedback("Limp arm! 🪱 If both muscles are relaxed, there is no pull force to move the bone. The arm goes completely floppy!");
      setSuccess(false);
      return;
    }

    if (stage === 1) {
      // Goal: Bend elbow to lift weight. Needs contracted biceps and relaxed triceps.
      if (biceps === 'contracted' && triceps === 'relaxed') {
        setSuccess(true);
        setFeedback("Superb! 💪 By contracting your Biceps, it gets shorter and thicker, pulling your forearm up. The Triceps relaxes to allow the movement. Dumbbell lifted!");
      } else {
        setFeedback("The dumbbell is heavy! Contracting your Triceps pulls the arm straight down, but we want to lift it up! Try contracting the Biceps instead.");
        setSuccess(false);
      }
    } else {
      // Goal: Straighten arm to lower weight. Needs relaxed biceps and contracted triceps.
      if (biceps === 'relaxed' && triceps === 'contracted') {
        setSuccess(true);
        setFeedback("Excellent! 🫳 To lower the weight, your Triceps contracts, pulling the forearm back down, while the Biceps relaxes. You controlled the pair perfectly!");
      } else {
        setFeedback("The arm is still bent! To straighten the arm, the Triceps must contract (pull) and the Biceps must relax. Adjust the toggles.");
        setSuccess(false);
      }
    }
  };

  const handleNextStage = () => {
    setSuccess(false);
    setFeedback('');
    setBiceps('relaxed');
    setTriceps('relaxed');
    if (stage === 1) {
      setStage(2);
    } else {
      setFinished(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
      
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)' }}>💪 Muscle Gym</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Explore how muscles work in pairs! Toggle Biceps and Triceps state to lift or lower the heavy dumbbell.
        </p>
      </div>

      {!finished ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', width: '100%', alignItems: 'stretch' }}>
          
          {/* Left Panel: Toggle Toggles */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifySelf: 'stretch', gap: '15px', background: 'white' }}>
            <div>
              <span style={{ background: 'var(--color-primary-light)', color: 'white', padding: '3px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                STAGE {stage} of 2
              </span>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--color-text-dark)', marginTop: '8px' }}>
                {stage === 1 ? '🏋️‍♂️ Lift the dumbbell up!' : '🫳 Lower the dumbbell back down!'}
              </h3>
            </div>

            {/* Biceps Controls */}
            <div style={{ padding: '12px', background: '#f5f6fa', borderRadius: '12px', border: biceps === 'contracted' ? '2.5px solid var(--color-primary)' : '2.5px solid #dfe4ea' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Biceps Muscle (Front)</span>
                <span style={{ fontSize: '0.8rem', background: biceps === 'contracted' ? 'var(--color-primary)' : '#b2bec3', color: 'white', padding: '2px 8px', borderRadius: '5px' }}>
                  {biceps.toUpperCase()}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => { setBiceps('relaxed'); setFeedback(''); }}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: biceps === 'relaxed' ? '2px solid var(--color-danger)' : '1px solid #ccc', background: biceps === 'relaxed' ? '#ffeaea' : 'white', fontWeight: 'bold' }}
                >
                  Relax (Go Limp)
                </button>
                <button
                  onClick={() => { setBiceps('contracted'); setFeedback(''); }}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: biceps === 'contracted' ? '2px solid var(--color-success)' : '1px solid #ccc', background: biceps === 'contracted' ? '#ebfcf0' : 'white', fontWeight: 'bold' }}
                >
                  Contract (Pull)
                </button>
              </div>
            </div>

            {/* Triceps Controls */}
            <div style={{ padding: '12px', background: '#f5f6fa', borderRadius: '12px', border: triceps === 'contracted' ? '2.5px solid var(--color-primary)' : '2.5px solid #dfe4ea' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Triceps Muscle (Back)</span>
                <span style={{ fontSize: '0.8rem', background: triceps === 'contracted' ? 'var(--color-primary)' : '#b2bec3', color: 'white', padding: '2px 8px', borderRadius: '5px' }}>
                  {triceps.toUpperCase()}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => { setTriceps('relaxed'); setFeedback(''); }}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: triceps === 'relaxed' ? '2px solid var(--color-danger)' : '1px solid #ccc', background: triceps === 'relaxed' ? '#ffeaea' : 'white', fontWeight: 'bold' }}
                >
                  Relax (Go Limp)
                </button>
                <button
                  onClick={() => { setTriceps('contracted'); setFeedback(''); }}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: triceps === 'contracted' ? '2px solid var(--color-success)' : '1px solid #ccc', background: triceps === 'contracted' ? '#ebfcf0' : 'white', fontWeight: 'bold' }}
                >
                  Contract (Pull)
                </button>
              </div>
            </div>

            {/* Flex Action */}
            {!success ? (
              <button 
                className="btn-playful btn-primary" 
                onClick={handleFlex}
                style={{ padding: '12px' }}
              >
                💪 Send Brain Signal!
              </button>
            ) : (
              <button 
                className="btn-playful btn-success" 
                onClick={handleNextStage}
                style={{ padding: '12px' }}
              >
                {stage === 1 ? 'Go to Stage 2' : 'Finish Lesson'} <ArrowRight size={16} />
              </button>
            )}

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
              </div>
            )}
          </div>

          {/* Right Panel: Muscle Diagram Visualizer */}
          <div className="glass-panel" style={{ padding: '20px', background: '#ffeaa7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', position: 'relative' }}>
            <h3 style={{ position: 'absolute', top: '15px', fontSize: '0.9rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Dumbbell size={16} /> Muscle Arm X-Ray
            </h3>

            {/* Graphic Arm Representation */}
            <div style={{ width: '200px', height: '200px', position: 'relative', marginTop: '30px' }}>
              
              {/* Shoulder joint anchor node */}
              <div style={{ position: 'absolute', top: '30px', left: '30px', width: '20px', height: '20px', borderRadius: '50%', background: '#636e72', zIndex: 10 }} />

              {/* Upper Arm Bone */}
              <div style={{ position: 'absolute', top: '38px', left: '38px', width: '100px', height: '14px', background: '#dfe4ea', border: '2px solid #7f8c8d', borderRadius: '6px', transform: 'rotate(0deg)', zIndex: 2 }} />

              {/* Biceps Muscle Graphic (Top) */}
              <div 
                style={{
                  position: 'absolute',
                  top: '15px',
                  left: '42px',
                  width: biceps === 'contracted' ? '70px' : '90px',
                  height: biceps === 'contracted' ? '28px' : '12px',
                  borderRadius: '50%',
                  background: '#ff7675',
                  border: '2.5px solid white',
                  transition: 'all 0.3s ease',
                  transform: biceps === 'contracted' ? 'translateX(10px)' : 'none',
                  zIndex: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6rem',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                {biceps === 'contracted' ? 'PULLING' : ''}
              </div>

              {/* Triceps Muscle Graphic (Bottom) */}
              <div 
                style={{
                  position: 'absolute',
                  top: '55px',
                  left: '42px',
                  width: triceps === 'contracted' ? '70px' : '90px',
                  height: triceps === 'contracted' ? '28px' : '12px',
                  borderRadius: '50%',
                  background: '#e84393',
                  border: '2.5px solid white',
                  transition: 'all 0.3s ease',
                  transform: triceps === 'contracted' ? 'translateX(10px)' : 'none',
                  zIndex: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6rem',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                {triceps === 'contracted' ? 'PULLING' : ''}
              </div>

              {/* Forearm + Weight */}
              {/* If stage=1 and success is true, or stage=2 and success is false -> arm is BENT (up) */}
              {/* Else -> arm is STRAIGHT (horizontal) */}
              {(() => {
                const isBent = (stage === 1 && success) || (stage === 2 && !success);
                const armRotation = isBent ? -55 : 0;
                
                return (
                  <div 
                    style={{
                      position: 'absolute',
                      top: '38px',
                      left: '128px',
                      width: '80px',
                      height: '14px',
                      background: '#dfe4ea',
                      border: '2px solid #7f8c8d',
                      borderRadius: '6px',
                      transform: `rotate(${armRotation}deg)`,
                      transformOrigin: '5px 7px',
                      transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      zIndex: 4
                    }}
                  >
                    {/* The Dumbbell Weight */}
                    <div 
                      style={{ 
                        position: 'absolute', 
                        right: '-10px', 
                        top: '-18px', 
                        fontSize: '2rem',
                        transform: `rotate(${-armRotation}deg)`,
                        transition: 'transform 0.4s'
                      }}
                    >
                      🏋️‍♂️
                    </div>
                  </div>
                );
              })()}

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
          <div style={{ fontSize: '3rem' }}>💪🧬🏋️‍♂️🏆</div>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--color-success)' }}>
            Antagonistic Muscle Specialist!
          </h3>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-dark)', maxWidth: '500px', lineHeight: '1.5' }}>
            Tremendous effort! You successfully lifted and lowered the dumbbell by contracting the biceps and relaxing the triceps alternately. You now know exactly how antagonistic muscles pair up to move skeletal bones!
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
