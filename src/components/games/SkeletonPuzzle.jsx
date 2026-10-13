import React, { useState } from 'react';
import { Award, AlertCircle, RefreshCw } from 'lucide-react';

const BONES = [
  { id: 'skull', name: '💀 Skull', zone: 'head', desc: 'Protects the Brain like a hard helmet!' },
  { id: 'ribcage', name: '🩻 Ribcage', zone: 'chest', desc: 'Forms a protective cage around your Heart and Lungs!' },
  { id: 'spine', name: '🧬 Spine (Backbone)', zone: 'back', desc: 'Protects your Spinal Cord and keeps your body standing straight!' },
  { id: 'limbs', name: '🦵 Limb Bones (Femur)', zone: 'legs', desc: 'Supports your weight and lets you run, walk, and jump!' }
];

export default function SkeletonPuzzle({ onGameComplete }) {
  const [selectedBone, setSelectedBone] = useState(null);
  const [assembledBones, setAssembledBones] = useState({}); // e.g. { head: 'skull' }
  const [feedback, setFeedback] = useState('');
  const [finished, setFinished] = useState(false);

  const handleBoneSelect = (bone) => {
    setSelectedBone(bone);
    setFeedback(`Click on the body map zone where the "${bone.name}" belongs!`);
  };

  const handleZoneClick = (zoneId) => {
    if (!selectedBone) {
      setFeedback('Select a bone from the basket first!');
      return;
    }

    if (selectedBone.zone === zoneId) {
      const newAssembled = { ...assembledBones, [zoneId]: selectedBone };
      setAssembledBones(newAssembled);
      setFeedback(`Great job! The ${selectedBone.name} is in place. ${selectedBone.desc}`);
      setSelectedBone(null);

      // Check if finished
      if (Object.keys(newAssembled).length === BONES.length) {
        setFinished(true);
      }
    } else {
      setFeedback(`Oops! That's not the correct spot for the "${selectedBone.name}". Think about which body area this bone supports or protects!`);
    }
  };

  const handleReset = () => {
    setAssembledBones({});
    setSelectedBone(null);
    setFeedback('');
    setFinished(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
      
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)' }}>💀 Skeleton Assembly Puzzle</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Put the human skeleton back together! Select a bone from the basket, then click its target zone on the body chart.
        </p>
      </div>

      {!finished ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', width: '100%', alignItems: 'stretch' }}>
          
          {/* Left Panel: Bone Basket & Instructions */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', background: 'white' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-dark)', borderBottom: '2px solid #f1f2f6', paddingBottom: '6px' }}>
              🧺 Bone Basket
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {BONES.map(bone => {
                const isPlaced = Object.values(assembledBones).some(b => b.id === bone.id);
                const isSelected = selectedBone?.id === bone.id;
                
                return (
                  <button
                    key={bone.id}
                    onClick={() => handleBoneSelect(bone)}
                    disabled={isPlaced}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: isSelected ? '3px solid var(--color-primary)' : '2px solid #dfe4ea',
                      background: isSelected ? 'var(--color-primary-light)' : (isPlaced ? '#f1f2f6' : 'white'),
                      color: isSelected ? 'white' : (isPlaced ? '#b2bec3' : 'var(--color-text-dark)'),
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      opacity: isPlaced ? 0.6 : 1
                    }}
                  >
                    <span>{bone.name}</span>
                    <span>{isPlaced ? '✔️ Placed' : (isSelected ? '👈 Active' : 'Select')}</span>
                  </button>
                );
              })}
            </div>

            {/* Instruction / Feedback Bubble */}
            <div 
              style={{
                marginTop: '10px',
                padding: '15px',
                borderRadius: '15px',
                background: '#f8f9fa',
                borderLeft: '5px solid var(--color-accent)',
                fontSize: '0.95rem',
                lineHeight: '1.45',
                color: 'var(--color-text-dark)'
              }}
            >
              {feedback || 'Select a bone from the basket above to start assembling!'}
            </div>

            <button className="btn-playful btn-danger" onClick={handleReset} style={{ padding: '10px', marginTop: '10px' }}>
              <RefreshCw size={16} /> Start Over
            </button>
          </div>

          {/* Right Panel: Body Map Layout */}
          <div 
            className="glass-panel" 
            style={{ 
              padding: '20px', 
              background: '#2d3436', // dark background for high-tech skeleton xray scan look
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              position: 'relative',
              minHeight: '380px',
              border: '4px solid #636e72'
            }}
          >
            {/* Scanlines overlay for xray effect */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 6px 100%', pointerEvents: 'none' }} />

            {/* Target Zones on the Body Map */}
            <div style={{ width: '160px', height: '340px', position: 'relative', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '20px' }}>
              
              {/* HEAD ZONE */}
              <div 
                onClick={() => handleZoneClick('head')}
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '35px',
                  width: '90px',
                  height: '70px',
                  borderRadius: '50%',
                  border: assembledBones.head ? 'none' : '3px dashed #00cec9',
                  background: assembledBones.head ? 'transparent' : 'rgba(0, 206, 201, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#00cec9',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}
              >
                {assembledBones.head ? (
                  <span style={{ fontSize: '3rem' }}>💀</span>
                ) : 'Skull Zone'}
              </div>

              {/* CHEST ZONE */}
              <div 
                onClick={() => handleZoneClick('chest')}
                style={{
                  position: 'absolute',
                  top: '90px',
                  left: '25px',
                  width: '110px',
                  height: '90px',
                  borderRadius: '12px',
                  border: assembledBones.chest ? 'none' : '3px dashed #00cec9',
                  background: assembledBones.chest ? 'transparent' : 'rgba(0, 206, 201, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#00cec9',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}
              >
                {assembledBones.chest ? (
                  <span style={{ fontSize: '4.5rem', lineHeight: 1 }}>🩻</span>
                ) : 'Ribcage Zone'}
              </div>

              {/* SPINE ZONE */}
              <div 
                onClick={() => handleZoneClick('back')}
                style={{
                  position: 'absolute',
                  top: '95px',
                  left: '70px',
                  width: '20px',
                  height: '140px',
                  borderRadius: '5px',
                  border: assembledBones.back ? 'none' : '3px dashed #fdcb6e',
                  background: assembledBones.back ? 'transparent' : 'rgba(253, 203, 110, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#fdcb6e',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  writingMode: 'vertical-rl',
                  zIndex: 2
                }}
              >
                {assembledBones.back ? (
                  <span style={{ fontSize: '3rem', transform: 'scaleY(1.3)' }}>🧬</span>
                ) : 'Spine'}
              </div>

              {/* LIMBS ZONE */}
              <div 
                onClick={() => handleZoneClick('legs')}
                style={{
                  position: 'absolute',
                  top: '190px',
                  left: '15px',
                  width: '130px',
                  height: '130px',
                  borderRadius: '12px',
                  border: assembledBones.legs ? 'none' : '3px dashed #e84393',
                  background: assembledBones.legs ? 'transparent' : 'rgba(232, 67, 147, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#e84393',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}
              >
                {assembledBones.legs ? (
                  <span style={{ fontSize: '4.5rem' }}>🦵</span>
                ) : 'Limb Bones'}
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
          {/* Dancing skeleton visual */}
          <div className="animate-skeleton" style={{ fontSize: '6rem', lineHeight: '1' }}>
            💀<br />🩻<br />🦵
          </div>
          
          <h3 style={{ fontSize: '1.8rem', color: 'var(--color-success)', marginTop: '10px' }}>
            Skeleton Fully Assembled!
          </h3>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-dark)', maxWidth: '500px', lineHeight: '1.5' }}>
            Incredible! The skeleton came alive and did a victory dance! You placed every bone in its correct anatomical place and know exactly what organ each bone protects. Outstanding!
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
