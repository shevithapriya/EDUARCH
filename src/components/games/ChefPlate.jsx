import React, { useState } from 'react';
import { Apple, HelpCircle, RefreshCw, Award, CheckCircle } from 'lucide-react';

const FOOD_ITEMS = [
  { id: 'rice', name: '🍚 Brown Rice', category: 'carbs', weight: 30, desc: 'Carbohydrates (Energy)' },
  { id: 'bread', name: '🍞 Whole Wheat Bread', category: 'carbs', weight: 30, desc: 'Carbohydrates (Energy)' },
  { id: 'potato', name: '🥔 Sweet Potato', category: 'carbs', weight: 30, desc: 'Carbohydrates (Energy)' },
  
  { id: 'chicken', name: '🍗 Grilled Chicken', category: 'proteins', weight: 20, desc: 'Proteins (Body Building)' },
  { id: 'egg', name: '🥚 Boiled Egg', category: 'proteins', weight: 20, desc: 'Proteins (Body Building)' },
  { id: 'tofu', name: '🧀 Paneer / Tofu', category: 'proteins', weight: 20, desc: 'Proteins (Body Building)' },
  
  { id: 'butter', name: '🧈 Butter slice', category: 'fats', weight: 20, desc: 'Fats (Energy Reserve)' },
  { id: 'oil', name: '🥑 Avocado Oil / Olive', category: 'fats', weight: 20, desc: 'Fats (Energy Reserve)' },
  
  { id: 'spinach', name: '🥬 Fresh Spinach', category: 'vitamins', weight: 30, desc: 'Vitamins & Minerals (Protection)' },
  { id: 'apple', name: '🍎 Red Apple', category: 'vitamins', weight: 30, desc: 'Vitamins & Minerals (Protection)' },
  { id: 'carrot', name: '🥕 Crunchy Carrot', category: 'vitamins', weight: 30, desc: 'Vitamins & Minerals (Protection)' }
];

export default function ChefPlate({ onGameComplete }) {
  const [plate, setPlate] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [analyzed, setAnalyzed] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Calculate current distribution
  const totals = plate.reduce(
    (acc, item) => {
      acc[item.category] += item.weight;
      return acc;
    },
    { carbs: 0, proteins: 0, fats: 0, vitamins: 0 }
  );

  const totalAdded = plate.length;

  const handleAddFood = (item) => {
    if (plate.find(p => p.id === item.id)) return; // No duplicates
    setPlate([...plate, item]);
    setAnalyzed(false);
    setFeedback('');
  };

  const handleRemoveFood = (itemId) => {
    setPlate(plate.filter(p => p.id !== itemId));
    setAnalyzed(false);
    setFeedback('');
  };

  const handleReset = () => {
    setPlate([]);
    setFeedback('');
    setAnalyzed(false);
    setIsSuccess(false);
  };

  const handleAnalyze = () => {
    if (plate.length === 0) {
      setFeedback('Your plate is empty! Add some delicious food items first.');
      return;
    }

    setAnalyzed(true);

    const hasCarbs = totals.carbs > 0;
    const hasProteins = totals.proteins > 0;
    const hasFats = totals.fats > 0;
    const hasVitamins = totals.vitamins > 0;

    // Check if plate has at least one item from each of the 4 nutrient categories
    if (hasCarbs && hasProteins && hasFats && hasVitamins) {
      setIsSuccess(true);
      setFeedback('Fantastic job, Chef! 🎉 Your plate has a perfect balance of Carbohydrates, Proteins, Fats, and Vitamins/Minerals! This is a healthy Balanced Diet!');
    } else {
      setIsSuccess(false);
      const missing = [];
      if (!hasCarbs) missing.push('Carbohydrates (for energy)');
      if (!hasProteins) missing.push('Proteins (for growth)');
      if (!hasFats) missing.push('Fats (for warmth)');
      if (!hasVitamins) missing.push('Vitamins & Minerals (to fight disease)');
      
      setFeedback(`Almost there! Your plate is missing: ${missing.join(', ')}. Try to include all nutrient groups to create a Balanced Diet!`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
      
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)' }}>🍳 Chef's Balanced Plate</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Drag or click food items to fill your plate. A healthy body needs a Balanced Diet containing all 4 key nutrient types!
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', width: '100%', alignItems: 'start' }}>
        
        {/* Left: Food Pantry Selection */}
        <div className="glass-panel" style={{ padding: '20px', background: 'white' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', borderBottom: '2px solid #f1f2f6', paddingBottom: '6px', color: 'var(--color-text-dark)' }}>
            🥦 Food Pantry
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {FOOD_ITEMS.map(item => {
              const isAdded = plate.some(p => p.id === item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleAddFood(item)}
                  disabled={isAdded}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: isAdded ? '#f1f2f6' : 'white',
                    border: isAdded ? '2px solid #dcdde1' : '2px solid var(--color-primary-light)',
                    color: isAdded ? 'var(--color-text-muted)' : 'var(--color-text-dark)',
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    boxShadow: isAdded ? 'none' : '0 4px 0 var(--color-primary-light)',
                    transform: isAdded ? 'translateY(2px)' : 'none',
                    opacity: isAdded ? 0.7 : 1
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{item.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: The Plate Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          
          {/* Circular Plate */}
          <div 
            className="drop-zone active"
            style={{
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              background: '#f8f9fa',
              border: '10px solid #ffffff',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1), inset 0 0 15px rgba(0,0,0,0.05)',
              position: 'relative',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignContent: 'center',
              gap: '8px',
              padding: '25px',
              overflow: 'hidden'
            }}
          >
            {/* Sector divisions overlay in background to suggest balance */}
            <div style={{ position: 'absolute', inset: 0, border: '2px dashed #dcdde1', borderRadius: '50%', pointerEvents: 'none' }} />
            
            {plate.length === 0 ? (
              <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', fontSize: '0.9rem', width: '100%' }}>
                🍽️ Plate is empty.<br />Click foods to add!
              </div>
            ) : (
              plate.map(item => (
                <span 
                  key={item.id}
                  onClick={() => handleRemoveFood(item.id)}
                  style={{
                    background: 'white',
                    padding: '6px 12px',
                    borderRadius: '15px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    border: '2px solid var(--color-primary)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    animation: 'bounceSlow 2s infinite'
                  }}
                  title="Click to remove"
                >
                  {item.name.split(' ')[0]} {item.name.split(' ').slice(1).join(' ')} ✕
                </span>
              ))
            )}
          </div>

          {/* Current balanced meter */}
          <div className="glass-panel" style={{ width: '100%', padding: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold' }}>
              <span>Carbs: {totals.carbs ? '✔️' : '❌'}</span>
              <span>Proteins: {totals.proteins ? '✔️' : '❌'}</span>
              <span>Fats: {totals.fats ? '✔️' : '❌'}</span>
              <span>Vitamins: {totals.vitamins ? '✔️' : '❌'}</span>
            </div>
            <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', background: '#e4e7eb', marginTop: '5px' }}>
              <div style={{ width: `${totals.carbs ? 25 : 0}%`, background: 'var(--color-accent)', transition: 'width 0.3s' }} />
              <div style={{ width: `${totals.proteins ? 25 : 0}%`, background: 'var(--color-primary)', transition: 'width 0.3s' }} />
              <div style={{ width: `${totals.fats ? 25 : 0}%`, background: 'var(--color-danger)', transition: 'width 0.3s' }} />
              <div style={{ width: `${totals.vitamins ? 25 : 0}%`, background: 'var(--color-success)', transition: 'width 0.3s' }} />
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
            <button 
              className="btn-playful btn-danger" 
              onClick={handleReset} 
              style={{ flex: 1, padding: '10px' }}
            >
              <RefreshCw size={18} /> Reset
            </button>
            <button 
              className="btn-playful btn-success" 
              onClick={handleAnalyze} 
              style={{ flex: 2, padding: '10px' }}
            >
              🍳 Analyze Plate!
            </button>
          </div>

        </div>

      </div>

      {/* Feedback Panel */}
      {analyzed && (
        <div 
          className="glass-panel" 
          style={{ 
            width: '100%', 
            padding: '20px', 
            border: isSuccess ? '4px solid var(--color-success)' : '4px solid var(--color-danger)',
            background: isSuccess ? 'rgba(235, 252, 240, 0.95)' : 'rgba(255, 242, 242, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontWeight: 'bold' }}>
            {isSuccess ? (
              <CheckCircle size={28} color="var(--color-success)" />
            ) : (
              <HelpCircle size={28} color="var(--color-danger)" />
            )}
            {isSuccess ? 'Balanced Diet Approved!' : 'Needs More Balance!'}
          </div>
          <p style={{ fontSize: '1rem', color: 'var(--color-text-dark)', lineHeight: '1.4' }}>
            {feedback}
          </p>

          {isSuccess && (
            <button 
              className="btn-playful btn-accent animate-star" 
              onClick={() => onGameComplete(5)}
              style={{ marginTop: '10px', fontSize: '1.2rem', padding: '12px 30px' }}
            >
              <Award size={22} /> Collect 5 Stars!
            </button>
          )}
        </div>
      )}

    </div>
  );
}
