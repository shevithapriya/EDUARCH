import React, { useState } from 'react';
import { Award, ArrowRight, RefreshCw, Eye, Sparkles } from 'lucide-react';

const ROUNDS = [
  {
    id: 1,
    name: "Symmetric Heart ❤️",
    // 6 rows x 3 columns for left side (1 = colored, 0 = empty)
    leftPattern: [
      [0, 0, 1],
      [0, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
      [0, 1, 1],
      [0, 0, 1]
    ],
    color: '#eb3b5a', // red
    description: "Draw the matching right half of this Heart shape across the vertical mirror line!"
  },
  {
    id: 2,
    name: "Symmetric Butterfly 🦋",
    leftPattern: [
      [1, 1, 0],
      [1, 1, 1],
      [0, 1, 1],
      [1, 1, 1],
      [1, 1, 0],
      [1, 0, 0]
    ],
    color: '#00cec9', // turquoise
    description: "Complete the wings of this Butterfly. Mirror every block perfectly!"
  }
];

export default function MirrorSymmetry({ onGameComplete }) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [checked, setChecked] = useState(false);
  const [success, setSuccess] = useState(false);
  const [finished, setFinished] = useState(false);

  const activeRound = ROUNDS[roundIdx];

  // Initialize right side pattern grid (6 rows x 3 columns)
  const [rightPattern, setRightPattern] = useState(
    Array(6).fill(null).map(() => Array(3).fill(0))
  );

  const handleCellClick = (r, c) => {
    if (checked && success) return;
    const newGrid = rightPattern.map((rowArr, rowIndex) => {
      if (rowIndex === r) {
        return rowArr.map((cellVal, colIndex) => {
          if (colIndex === c) {
            return cellVal === 1 ? 0 : 1; // Toggle
          }
          return cellVal;
        });
      }
      return rowArr;
    });
    setRightPattern(newGrid);
    setFeedback('');
    setChecked(false);
  };

  const handleCheck = () => {
    setChecked(true);
    let match = true;

    // A cell on left row r, col c maps to right row r, col 2 - c (mirrored)
    // Left side: col 0 maps to Right side: col 2
    // Left side: col 1 maps to Right side: col 1
    // Left side: col 2 maps to Right side: col 0
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 3; c++) {
        const leftVal = activeRound.leftPattern[r][c];
        const rightVal = rightPattern[r][2 - c]; // Reflected index
        if (leftVal !== rightVal) {
          match = false;
          break;
        }
      }
      if (!match) break;
    }

    if (match) {
      setSuccess(true);
      setFeedback("Stunning! ✨ You reflected every pixel perfectly. The shape is 100% symmetric!");
    } else {
      setSuccess(false);
      setFeedback("Oh, it's a bit asymmetric! Make sure that every filled block on the left has a matching block at the same distance on the right.");
    }
  };

  const handleReset = () => {
    setRightPattern(Array(6).fill(null).map(() => Array(3).fill(0)));
    setFeedback('');
    setChecked(false);
    setSuccess(false);
  };

  const handleNextRound = () => {
    setChecked(false);
    setSuccess(false);
    setFeedback('');
    setRightPattern(Array(6).fill(null).map(() => Array(3).fill(0)));
    if (roundIdx < ROUNDS.length - 1) {
      setRoundIdx(prev => prev + 1);
    } else {
      setFinished(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
      
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)' }}>🦋 Symmetry Artist</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Complete the symmetric drawings! Mirror the left grid cells onto the right grid cells.
        </p>
      </div>

      {!finished ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', width: '100%', alignItems: 'center' }}>
          
          {/* Left panel: Info & Actions */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', background: 'white' }}>
            <div>
              <span style={{ background: 'var(--color-accent)', color: 'var(--color-text-dark)', padding: '3px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                ROUND {roundIdx + 1} of 2
              </span>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--color-text-dark)', marginTop: '8px' }}>
                {activeRound.name}
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '5px', lineHeight: '1.4' }}>
                {activeRound.description}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-playful btn-danger" onClick={handleReset} style={{ flex: 1, padding: '10px' }}>
                <RefreshCw size={16} /> Reset Grid
              </button>
              <button className="btn-playful btn-success" onClick={handleCheck} style={{ flex: 2, padding: '10px' }}>
                <Eye size={16} /> Check Symmetry!
              </button>
            </div>

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
                {success && (
                  <button 
                    className="btn-playful btn-primary" 
                    onClick={handleNextRound}
                    style={{ float: 'right', padding: '6px 12px', fontSize: '0.8rem', marginTop: '10px' }}
                  >
                    {roundIdx < ROUNDS.length - 1 ? 'Next Shape!' : 'Collect Stars!'} <ArrowRight size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: Symmetry Grid Drawing Area */}
          <div className="glass-panel" style={{ padding: '25px', display: 'flex', justifyContent: 'center', background: '#f8f9fa' }}>
            
            {/* 6x6 Combined Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 45px)', gap: '4px', position: 'relative', background: '#dfe4ea', padding: '8px', borderRadius: '8px' }}>
              
              {/* Vertical red dotted Line of Symmetry in center */}
              <div 
                style={{
                  position: 'absolute',
                  left: 'calc(50% - 2.5px)',
                  top: 0,
                  bottom: 0,
                  width: '5px',
                  borderLeft: '4px dotted #ff7675',
                  zIndex: 10,
                  pointerEvents: 'none'
                }}
              />

              {/* Grid cells */}
              {Array(6).fill(null).map((_, r) => {
                return Array(6).fill(null).map((_, c) => {
                  const isLeft = c < 3;
                  
                  if (isLeft) {
                    // Left cell: pre-defined, read-only
                    const isColored = activeRound.leftPattern[r][c] === 1;
                    return (
                      <div
                        key={`cell-${r}-${c}`}
                        style={{
                          width: '45px',
                          height: '45px',
                          background: isColored ? activeRound.color : '#ffffff',
                          border: '1px solid #dcdde1',
                          borderRadius: '4px',
                          opacity: isColored ? 1 : 0.4
                        }}
                      />
                    );
                  } else {
                    // Right cell: interactive, toggleable
                    const rightColIdx = c - 3;
                    const isColored = rightPattern[r][rightColIdx] === 1;
                    return (
                      <div
                        key={`cell-${r}-${c}`}
                        onClick={() => handleCellClick(r, rightColIdx)}
                        style={{
                          width: '45px',
                          height: '45px',
                          background: isColored ? activeRound.color : '#ffffff',
                          border: '1.5px solid var(--color-primary-light)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          boxShadow: isColored ? 'inset 0 0 5px rgba(0,0,0,0.1)' : 'none',
                          transition: 'background-color 0.15s'
                        }}
                      />
                    );
                  }
                });
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
          <div style={{ fontSize: '3.5rem' }}>🦋🎨✨🏆</div>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--color-success)' }}>
            Symmetry Masterpiece!
          </h3>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-dark)', maxWidth: '500px', lineHeight: '1.5' }}>
            Simply brilliant! You completed the Heart and the Butterfly using perfect mirror reflection. You have mastered line symmetry in grids!
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
