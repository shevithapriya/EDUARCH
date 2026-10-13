import React, { useState } from 'react';
import { Award, ArrowRight, Smile, CheckCircle2 } from 'lucide-react';

const TASKS = [
  {
    id: 1,
    title: "Kick the Soccer Ball!",
    description: "Swing the knee joint back and forth to launch the ball. What type of joint is your knee?",
    jointType: "hinge",
    targetAngle: 90,
    sliderMin: 0,
    sliderMax: 90,
    sliderLabel: "Knee Bend (Angle)",
    animPart: "leg",
    successMsg: "GOAL! ⚽ The knee joint acts exactly like a door hinge, swinging back and forth in one direction!"
  },
  {
    id: 2,
    title: "Nod 'Yes' to the Teacher!",
    description: "Turn the neck joint up and down to nod your head. What type of joint connects the skull to your spine?",
    jointType: "pivot",
    targetAngle: 45,
    sliderMin: -45,
    sliderMax: 45,
    sliderLabel: "Head Tilting",
    animPart: "head",
    successMsg: "Nodded! 🦉 The pivot joint in your neck allows your skull to turn, rotate, and nod side-to-side and up-and-down!"
  },
  {
    id: 3,
    title: "Wave to the Crowd!",
    description: "Rotate the arm fully at the shoulder in all directions. What type of joint is the shoulder?",
    jointType: "ball_socket",
    targetAngle: 360,
    sliderMin: 0,
    sliderMax: 360,
    sliderLabel: "Arm Swing",
    animPart: "arm",
    successMsg: "Waving high! 👋 The ball-and-socket joint at the shoulder has a round ball fitting into a cup, allowing circular motion in all directions!"
  }
];

const JOINT_OPTIONS = [
  { id: 'hinge', name: '🚪 Hinge Joint' },
  { id: 'pivot', name: '🎡 Pivot Joint' },
  { id: 'ball_socket', name: '🔮 Ball and Socket Joint' },
  { id: 'gliding', name: '🛷 Gliding Joint' }
];

export default function PuppetJoints({ onGameComplete }) {
  const [taskIdx, setTaskIdx] = useState(0);
  const [angle, setAngle] = useState(0);
  const [selectedJoint, setSelectedJoint] = useState('');
  const [feedback, setFeedback] = useState('');
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [finished, setFinished] = useState(false);

  const activeTask = TASKS[taskIdx];

  const handleVerify = () => {
    if (!selectedJoint) {
      setFeedback('Select a joint type first!');
      return;
    }

    const isJointCorrect = selectedJoint === activeTask.jointType;
    const isAngleReached = Math.abs(angle - activeTask.targetAngle) <= 15 || angle === activeTask.targetAngle;

    if (isJointCorrect && isAngleReached) {
      setTaskCompleted(true);
      setFeedback(activeTask.successMsg);
    } else {
      let error = '';
      if (!isJointCorrect) {
        error += 'Wrong joint choice! Think about how this body part moves. Is it a full rotation, a back-and-forth swing, or a twist? ';
      }
      if (!isAngleReached) {
        error += `Move the slider closer to the target movement! (Goal: reach around ${activeTask.targetAngle}°).`;
      }
      setFeedback(error);
    }
  };

  const handleNextTask = () => {
    setTaskCompleted(false);
    setSelectedJoint('');
    setFeedback('');
    setAngle(0);
    if (taskIdx < TASKS.length - 1) {
      setTaskIdx(prev => prev + 1);
    } else {
      setFinished(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
      
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--color-primary)' }}>🤸 Puppet Joint Simulator</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
          Animate the joints of the puppet character! Choose the correct biological joint type and rotate the slider.
        </p>
      </div>

      {!finished ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', width: '100%', alignItems: 'stretch' }}>
          
          {/* Left: Settings, sliders and selection */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', background: 'white' }}>
            <div>
              <span style={{ background: 'var(--color-accent)', color: 'var(--color-text-dark)', padding: '3px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                TASK {taskIdx + 1} of 3
              </span>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--color-text-dark)', marginTop: '8px' }}>
                {activeTask.title}
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginTop: '5px', lineHeight: '1.4' }}>
                {activeTask.description}
              </p>
            </div>

            {/* Slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 'bold' }}>
                <span>{activeTask.sliderLabel}</span>
                <span style={{ color: 'var(--color-primary)' }}>{angle}° (Target: {activeTask.targetAngle}°)</span>
              </div>
              <input 
                type="range"
                min={activeTask.sliderMin}
                max={activeTask.sliderMax}
                value={angle}
                onChange={(e) => {
                  setAngle(Number(e.target.value));
                  setFeedback('');
                }}
                disabled={taskCompleted}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  outline: 'none',
                  cursor: 'pointer',
                  accentColor: 'var(--color-primary)'
                }}
              />
            </div>

            {/* Dropdown Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Which joint does this?</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {JOINT_OPTIONS.map(j => (
                  <button
                    key={j.id}
                    onClick={() => {
                      setSelectedJoint(j.id);
                      setFeedback('');
                    }}
                    disabled={taskCompleted}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: selectedJoint === j.id ? '3px solid var(--color-primary)' : '2px solid #dfe4ea',
                      background: selectedJoint === j.id ? 'var(--color-primary-light)' : 'white',
                      color: selectedJoint === j.id ? 'white' : 'var(--color-text-dark)',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      textAlign: 'center'
                    }}
                  >
                    {j.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Trigger */}
            {!taskCompleted ? (
              <button 
                className="btn-playful btn-primary"
                onClick={handleVerify}
                style={{ width: '100%', padding: '12px' }}
              >
                ⚙️ Activate Joint!
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(46,204,113,0.1)', border: '2.5px solid var(--color-success)', padding: '15px', borderRadius: '15px' }}>
                <div style={{ color: 'var(--color-success)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircle2 size={18} /> Task Completed!
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-dark)' }}>{feedback}</p>
                <button 
                  className="btn-playful btn-success" 
                  onClick={handleNextTask}
                  style={{ width: '100%', padding: '10px' }}
                >
                  {taskIdx < TASKS.length - 1 ? 'Go to Next Task!' : 'Complete Lesson!'} <ArrowRight size={16} />
                </button>
              </div>
            )}

            {feedback && !taskCompleted && (
              <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', padding: '8px 12px', background: 'rgba(255,118,117,0.1)', border: '2px solid var(--color-danger)', borderRadius: '8px' }}>
                ⚠️ {feedback}
              </div>
            )}
          </div>

          {/* Right: Puppet Visualization */}
          <div className="glass-panel" style={{ padding: '20px', background: '#ffeaa7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '380px', position: 'relative', overflow: 'hidden' }}>
            
            {/* The Puppet Frame */}
            <div style={{ width: '180px', height: '280px', position: 'relative' }}>
              
              {/* Head */}
              <div 
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '60px',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#ff7675',
                  border: '4px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  // Neck Pivot node: rotate head
                  transform: activeTask.animPart === 'head' ? `rotate(${angle}deg)` : 'none',
                  transformOrigin: '50% 100%',
                  transition: 'transform 0.2s',
                  zIndex: 4
                }}
              >
                😀
              </div>

              {/* Torso */}
              <div 
                style={{
                  position: 'absolute',
                  top: '74px',
                  left: '50px',
                  width: '80px',
                  height: '110px',
                  borderRadius: '15px',
                  background: '#6c5ce7',
                  border: '4px solid white',
                  zIndex: 2
                }}
              />

              {/* Arm - Rotating Shoulder (Ball & Socket) */}
              <div 
                style={{
                  position: 'absolute',
                  top: '76px',
                  left: '120px',
                  width: '80px',
                  height: '24px',
                  borderRadius: '12px',
                  background: '#fdcb6e',
                  border: '3px solid white',
                  transform: activeTask.animPart === 'arm' ? `rotate(${-angle}deg)` : 'rotate(-20deg)',
                  transformOrigin: '12px 12px',
                  transition: 'transform 0.2s',
                  zIndex: 3
                }}
              >
                {/* Hand */}
                <div style={{ position: 'absolute', right: '-12px', top: '-6px', fontSize: '1.2rem' }}>👋</div>
              </div>

              {/* Leg - Rotating Knee (Hinge) */}
              <div 
                style={{
                  position: 'absolute',
                  top: '180px',
                  left: '70px',
                  width: '32px',
                  height: '75px',
                  borderRadius: '12px',
                  background: '#00cec9',
                  border: '4px solid white',
                  // Leg Hinge node: rotate leg forward for kick
                  transform: activeTask.animPart === 'leg' ? `rotate(${angle}deg)` : 'none',
                  transformOrigin: '16px 10px',
                  transition: 'transform 0.2s',
                  zIndex: 1
                }}
              >
                {/* Foot */}
                <div style={{ position: 'absolute', bottom: '-15px', right: '-8px', fontSize: '1.2rem' }}>👟</div>
              </div>

              {/* Soccer Ball (Only in Task 1) */}
              {taskIdx === 0 && (
                <div 
                  style={{
                    position: 'absolute',
                    bottom: '5px',
                    left: angle >= 75 ? '135px' : '90px',
                    fontSize: '2rem',
                    transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    transform: angle >= 75 ? 'translate(80px, -40px) rotate(360deg)' : 'none'
                  }}
                >
                  ⚽
                </div>
              )}
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
          <div style={{ fontSize: '3rem' }}>🦵🛡️🔮🏆</div>
          <h3 style={{ fontSize: '1.8rem', color: 'var(--color-success)' }}>
            Puppet Master Completed!
          </h3>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-dark)', maxWidth: '500px', lineHeight: '1.5' }}>
            Marvelous! You animated all the movements of the puppet by identifying the correct anatomical joints (Hinge, Pivot, Ball & Socket). You have an excellent understanding of how joints allow movement!
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
