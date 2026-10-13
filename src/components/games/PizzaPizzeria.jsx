import React, { useState } from 'react';
import { Award, ArrowRight, Smile, Heart, CheckCircle2, RotateCcw } from 'lucide-react';

const ORDERS = [
  {
    id: 1,
    slices: 4,
    text: "I want a pizza that is 2/4 Cheese and 2/4 Pepperoni!",
    target: { cheese: 2, pepperoni: 2, olives: 0 }
  },
  {
    id: 2,
    slices: 4,
    text: "Can I get a pizza that is 2/4 Cheese, 1/4 Pepperoni, and 1/4 Olives?",
    target: { cheese: 2, pepperoni: 1, olives: 1 }
  },
  {
    id: 3,
    slices: 8,
    text: "I'd like a large pizza: 4/8 Olives, 2/8 Cheese, and 2/8 Pepperoni!",
    target: { cheese: 2, pepperoni: 2, olives: 4 }
  }
];

const TOPPINGS = [
  { id: 'cheese', name: '🧀 Cheese', color: '#fed330' },
  { id: 'pepperoni', name: '🍕 Pepperoni', color: '#eb3b5a' },
  { id: 'olives', name: '🫒 Black Olives', color: '#2d3436' }
];

export default function PizzaPizzeria({ onGameComplete }) {
  const [currentOrderIdx, setCurrentOrderIdx] = useState(0);
  const [selectedTopping, setSelectedTopping] = useState('cheese');
  // State representing the toppings placed on each slice (array of strings, length = current slices)
  const [slicesState, setSlicesState] = useState(Array(ORDERS[0].slices).fill('cheese'));
  const [feedback, setFeedback] = useState('');
  const [served, setServed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);

  const activeOrder = ORDERS[currentOrderIdx];

  const handleSliceClick = (sliceIndex) => {
    if (served) return;
    const newState = [...slicesState];
    newState[sliceIndex] = selectedTopping;
    setSlicesState(newState);
    setFeedback('');
  };

  const handleResetPizza = () => {
    setSlicesState(Array(activeOrder.slices).fill(''));
    setFeedback('');
  };

  const handleServePizza = () => {
    const counts = { cheese: 0, pepperoni: 0, olives: 0 };
    slicesState.forEach(topping => {
      if (topping) counts[topping]++;
    });

    const isMatch = 
      counts.cheese === activeOrder.target.cheese &&
      counts.pepperoni === activeOrder.target.pepperoni &&
      counts.olives === activeOrder.target.olives;

    setServed(true);

    if (isMatch) {
      setScore(prev => prev + 1);
      setFeedback("Delicious! 🎉 That is exactly the correct fraction. The customer is super happy!");
    } else {
      setFeedback("Oh! The toppings are not in the correct fraction. Let's look: you put cheese on " + counts.cheese + "/" + activeOrder.slices + ", pepperoni on " + counts.pepperoni + "/" + activeOrder.slices + ", and olives on " + counts.olives + "/" + activeOrder.slices + ". Click Reset to try again!");
    }
  };

  const handleNextOrder = () => {
    setServed(false);
    setFeedback('');
    if (currentOrderIdx < ORDERS.length - 1) {
      const nextIdx = currentOrderIdx + 1;
      setCurrentOrderIdx(nextIdx);
      setSlicesState(Array(ORDERS[nextIdx].slices).fill(''));
    } else {
      setFinished(true);
    }
  };

  const drawPizzaSlices = () => {
    const n = activeOrder.slices;
    const elements = [];
    for (let i = 0; i < n; i++) {
      const rotation = (360 / n) * i;
      const toppingType = slicesState[i];
      const toppingData = TOPPINGS.find(t => t.id === toppingType);

      // Create slice paths using conic-gradient-like coordinates or rotated divs
      // For children simplicity, we can do rotated slices using clip-path, or circular segments!
      // Div rotating around center:
      elements.push(
        <div
          key={i}
          onClick={() => handleSliceClick(i)}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            left: 0,
            top: 0,
            transform: `rotate(${rotation}deg)`,
            transformOrigin: '50% 50%',
            clipPath: n === 4 
              ? 'polygon(50% 50%, 50% 0, 100% 0, 100% 50%)' 
              : 'polygon(50% 50%, 50% 0, 85% 15%, 85% 50%)', // rough clip for 8 slices
            background: toppingData ? toppingData.color : '#f1f2f6',
            border: '2px solid #ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s',
            zIndex: 1
          }}
        >
          {/* Label inside slice so it is readable */}
          <div 
            style={{ 
              transform: `rotate(-${rotation}deg)`, 
              fontSize: '1.4rem',
              pointerEvents: 'none',
              marginTop: '-50px',
              marginLeft: '50px'
            }}
          >
            {toppingType === 'cheese' && '🧀'}
            {toppingType === 'pepperoni' && '🍕'}
            {toppingType === 'olives' && '🫒'}
            {!toppingType && '🥣'}
          </div>
        </div>
      );
    }
    return elements;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
      
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)' }}>🍕 Pizza Chef fractions</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Learn fractions by baking pizzas! Click a topping, then click on the pizza slices to decorate them.
        </p>
      </div>

      {!finished ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', width: '100%', alignItems: 'center' }}>
          
          {/* Left Panel: Customer Ticket & Selection */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', background: 'white' }}>
            <div style={{ background: '#fcfcfc', border: '3px dashed var(--color-accent)', padding: '15px', borderRadius: '15px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-accent)' }}>👩‍🍳 CUSTOMER ORDER #{activeOrder.id}</span>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--color-text-dark)', marginTop: '8px', lineHeight: '1.4' }}>
                "{activeOrder.text}"
              </h3>
            </div>

            {/* Topping Tools */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>Topping Brush:</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                {TOPPINGS.map(topping => (
                  <button
                    key={topping.id}
                    onClick={() => setSelectedTopping(topping.id)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '12px',
                      border: selectedTopping === topping.id ? '3px solid var(--color-primary)' : '2px solid #dfe4ea',
                      background: selectedTopping === topping.id ? 'var(--color-primary-light)' : 'white',
                      color: selectedTopping === topping.id ? 'white' : 'var(--color-text-dark)',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px'
                    }}
                  >
                    {topping.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button 
                className="btn-playful btn-danger"
                onClick={handleResetPizza}
                style={{ flex: 1, padding: '10px' }}
                disabled={served}
              >
                <RotateCcw size={16} /> Reset
              </button>
              <button 
                className="btn-playful btn-success"
                onClick={handleServePizza}
                style={{ flex: 2, padding: '10px' }}
                disabled={served}
              >
                🔔 Serve Pizza!
              </button>
            </div>

            {/* Feedback & Progression */}
            {feedback && (
              <div 
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: served && feedback.includes('Delicious') ? 'rgba(46, 204, 113, 0.1)' : 'rgba(255, 118, 117, 0.1)',
                  border: served && feedback.includes('Delicious') ? '2.5px solid var(--color-success)' : '2.5px solid var(--color-danger)',
                  fontSize: '0.95rem',
                  color: 'var(--color-text-dark)',
                  lineHeight: '1.4'
                }}
              >
                {feedback}
                {served && feedback.includes('Delicious') && (
                  <button 
                    className="btn-playful btn-primary"
                    onClick={handleNextOrder}
                    style={{ float: 'right', padding: '6px 12px', fontSize: '0.8rem', marginTop: '10px' }}
                  >
                    Next Order <ArrowRight size={14} />
                  </button>
                )}
                {served && !feedback.includes('Delicious') && (
                  <button 
                    className="btn-playful btn-danger"
                    onClick={() => { setServed(false); handleResetPizza(); }}
                    style={{ float: 'right', padding: '6px 12px', fontSize: '0.8rem', marginTop: '10px' }}
                  >
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: The Interactive Pizza Oven */}
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#ffeaa7', minHeight: '340px' }}>
            
            {/* The Pizza Circle Container */}
            <div 
              style={{
                width: '260px',
                height: '260px',
                borderRadius: '50%',
                background: '#e58e26', // golden crust outline
                border: '8px solid #d35400', // baked border
                position: 'relative',
                boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                overflow: 'hidden'
              }}
            >
              {drawPizzaSlices()}
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
          <div style={{ fontSize: '3rem' }}>🍕✨🏆</div>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--color-success)' }}>
            Fractions Pizza Master!
          </h3>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-dark)', maxWidth: '500px', lineHeight: '1.5' }}>
            Incredible baking skills, Chef! You served every customer their pizza with the exact fraction of toppings requested. You now have an excellent understanding of fractions!
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
