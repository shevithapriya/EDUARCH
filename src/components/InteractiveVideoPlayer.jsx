import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, HelpCircle, Award, Wand2, RefreshCw } from 'lucide-react';
import { playSound } from '../utils/audio';

// Dynamic Cartoon Character & Scene Renderer Component
function CartoonSceneRenderer({ script, currentTime, isPlaying, playbackSpeed, language }) {
  const canvasRef = useRef(null);
  const animClockRef = useRef(0);

  // Active scene calculation
  const currentScene = script?.scenes
    ? [...script.scenes].reverse().find(s => currentTime >= s.time) || script.scenes[0]
    : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      if (isPlaying) {
        animClockRef.current += 0.04 * (playbackSpeed || 1);
      }
      const clock = animClockRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // 1. Draw Bright, Vibrant Cartoon Background
      drawCartoonBackground(ctx, w, h, script?.background || 'lab', clock);

      // 2. Draw Guest Cartoon Character / Interactive Animation
      drawGuestActor(ctx, w, h, currentScene?.actor, clock, currentTime);

      // 3. Draw Main Star Character: Archie the Animated Cartoon Owl
      drawArchieOwl(ctx, w * 0.22, h * 0.68, clock, currentScene?.pose, isPlaying);

      // 4. Draw Animated Speech Bubble
      if (currentScene?.dialogue) {
        drawSpeechBubble(ctx, w * 0.25, h * 0.22, currentScene.dialogue, currentScene.character || 'Archie');
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [script, currentTime, isPlaying, playbackSpeed, currentScene, language]);

  // Cartoon Backgrounds (Sunny, Colorful, Cheerful)
  function drawCartoonBackground(ctx, w, h, type, clock) {
    if (type === 'inner_body') {
      // Warm, colorful cartoon inner body cave
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#ff7675');
      grad.addColorStop(1, '#d63031');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Cartoon fluid ripples
      ctx.fillStyle = 'rgba(255, 234, 167, 0.25)';
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        const rx = (i * 200 + clock * 20) % w;
        ctx.arc(rx, h - 30, 80, 0, Math.PI, true);
        ctx.fill();
      }
    } else if (type === 'kitchen') {
      // Cheerful Yellow & Orange Bakery Kitchen
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#ffeaa7');
      grad.addColorStop(1, '#fdcb6e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Kitchen checkered wall
      ctx.fillStyle = 'rgba(214, 48, 49, 0.15)';
      for (let x = 0; x < w; x += 40) {
        for (let y = 0; y < 120; y += 40) {
          if ((x / 40 + y / 40) % 2 === 0) {
            ctx.fillRect(x, y, 40, 40);
          }
        }
      }
      // Kitchen counter table
      ctx.fillStyle = '#b33939';
      ctx.fillRect(0, h * 0.75, w, h * 0.25);
    } else {
      // Default: Sunny Cartoon Science Laboratory / Nature
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#74b9ff');
      skyGrad.addColorStop(0.7, '#a29bfe');
      skyGrad.addColorStop(1, '#ffeaa7');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Cartoon Floating Clouds
      for (let c = 0; c < 3; c++) {
        const cx = ((c * 280 + clock * 15) % (w + 100)) - 50;
        const cy = 40 + c * 25;
        drawCartoonCloud(ctx, cx, cy);
      }

      // Wooden lab desk
      ctx.fillStyle = '#e17055';
      ctx.fillRect(0, h * 0.78, w, h * 0.22);
      ctx.fillStyle = '#d63031';
      ctx.fillRect(0, h * 0.78, w, 8);
    }
  }

  function drawCartoonCloud(ctx, x, y) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.arc(x + 18, y - 8, 26, 0, Math.PI * 2);
    ctx.arc(x + 38, y, 20, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw The Main Star: Archie Cartoon Owl (Expressive, Animated)
  function drawArchieOwl(ctx, x, y, clock, pose, isTalking) {
    ctx.save();
    ctx.translate(x, y);

    // Body Bobbing / Breathing
    const bob = Math.sin(clock * 4) * 5;
    ctx.translate(0, bob);

    // Feet
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.ellipse(-14, 25, 10, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(14, 25, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#6c5ce7';
    ctx.strokeStyle = '#4834d4';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Belly Plumes
    ctx.fillStyle = '#a29bfe';
    ctx.beginPath();
    ctx.ellipse(0, 10, 22, 26, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears / Feather tufts
    ctx.fillStyle = '#4834d4';
    ctx.beginPath();
    ctx.moveTo(-28, -25);
    ctx.lineTo(-18, -48);
    ctx.lineTo(-8, -32);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(28, -25);
    ctx.lineTo(18, -48);
    ctx.lineTo(8, -32);
    ctx.fill();

    // Big Cartoon Eyes
    const blink = Math.sin(clock * 1.5) > 0.96;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 3;

    // Left Eye
    ctx.beginPath();
    ctx.ellipse(-14, -14, 15, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right Eye
    ctx.beginPath();
    ctx.ellipse(14, -14, 15, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (!blink) {
      // Pupils tracking motion
      const pupilOffset = Math.sin(clock * 2) * 3;
      ctx.fillStyle = '#2d3436';
      ctx.beginPath();
      ctx.arc(-14 + pupilOffset, -14, 7, 0, Math.PI * 2);
      ctx.arc(14 + pupilOffset, -14, 7, 0, Math.PI * 2);
      ctx.fill();

      // Eye Sparkles
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-16 + pupilOffset, -17, 3, 0, Math.PI * 2);
      ctx.arc(12 + pupilOffset, -17, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Closed Eye curve
      ctx.strokeStyle = '#2d3436';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(-14, -12, 10, Math.PI, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(14, -12, 10, Math.PI, 0);
      ctx.stroke();
    }

    // Talking Beak (Animates open/close while talking!)
    const beakTalk = isTalking ? (Math.sin(clock * 12) > 0 ? 8 : 2) : 2;
    ctx.fillStyle = '#f39c12';
    ctx.strokeStyle = '#d35400';
    ctx.lineWidth = 2.5;

    // Upper Beak
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(-9, 5);
    ctx.lineTo(9, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Lower Beak
    ctx.beginPath();
    ctx.moveTo(-6, 5);
    ctx.lineTo(0, 5 + beakTalk);
    ctx.lineTo(6, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Wings (Pose animations)
    ctx.fillStyle = '#574b90';
    ctx.strokeStyle = '#4834d4';
    ctx.lineWidth = 3;

    if (pose === 'pointing') {
      // Right wing points forward toward the visual actor!
      ctx.beginPath();
      ctx.ellipse(-32, 5, 12, 24, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Laser pointer wing
      ctx.beginPath();
      ctx.ellipse(35, -5, 26, 10, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Sparkle on pointing tip
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(62, -15, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (pose === 'waving') {
      // Left wing normal, right wing waving up and down
      const waveAngle = Math.sin(clock * 8) * 0.3 - 0.7;
      ctx.beginPath();
      ctx.ellipse(-32, 5, 12, 24, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.translate(28, -5);
      ctx.rotate(waveAngle);
      ctx.beginPath();
      ctx.ellipse(15, 0, 20, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else {
      // Normal standing wings
      ctx.beginPath();
      ctx.ellipse(-34, 5, 12, 24, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(34, 5, 12, 24, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  // Draw Guest Actor Props (Pizza, Stomach, Skeleton, Leaves, Teeth, etc.)
  function drawGuestActor(ctx, w, h, actor, clock, t) {
    ctx.save();
    const ax = w * 0.68;
    const ay = h * 0.52;

    if (actor === 'teeth') {
      // Cartoon Chompy Tooth Character
      const chompY = Math.sin(clock * 6) * 12;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#2d3436';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(ax - 50, ay - 60 + chompY, 100, 110, 24);
      ctx.fill();
      ctx.stroke();

      // Cartoon Face on Tooth
      ctx.fillStyle = '#2d3436';
      ctx.beginPath();
      ctx.arc(ax - 18, ay - 20 + chompY, 6, 0, Math.PI * 2);
      ctx.arc(ax + 18, ay - 20 + chompY, 6, 0, Math.PI * 2);
      ctx.fill();
      // Smile
      ctx.strokeStyle = '#2d3436';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(ax, ay - 5 + chompY, 14, 0, Math.PI);
      ctx.stroke();

      // Food sandwich being chomped
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(ax - 20, ay + 15, 40, 15);
    } else if (actor === 'stomach_acid' || actor === 'esophagus_wave') {
      // Cartoon Stomach Bag Character
      ctx.fillStyle = '#ff7675';
      ctx.strokeStyle = '#d63031';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(ax, ay, 65, 45, Math.PI / 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Big Happy Cartoon Eyes on Stomach
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ax - 18, ay - 10, 10, 0, Math.PI * 2);
      ctx.arc(ax + 18, ay - 10, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2d3436';
      ctx.beginPath();
      ctx.arc(ax - 16, ay - 10, 5, 0, Math.PI * 2);
      ctx.arc(ax + 20, ay - 10, 5, 0, Math.PI * 2);
      ctx.fill();

      // Churning acid bubbles floating out
      for (let b = 0; b < 6; b++) {
        const bx = ax - 30 + ((clock * 30 + b * 20) % 60);
        const by = ay - 40 - ((clock * 20 + b * 15) % 50);
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(bx, by, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (actor === 'half_slice' || actor === 'quarter_slice' || actor === 'pizza_dough') {
      // Cartoon Pizza Chef Scene
      const pzR = 85;
      ctx.fillStyle = '#f39c12';
      ctx.strokeStyle = '#d35400';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(ax, ay, pzR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cheese
      ctx.fillStyle = '#fed330';
      ctx.beginPath();
      ctx.arc(ax, ay, pzR - 10, 0, Math.PI * 2);
      ctx.fill();

      // Slicing Line
      ctx.strokeStyle = '#c0392b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(ax, ay - pzR);
      ctx.lineTo(ax, ay + pzR);
      ctx.stroke();

      if (actor === 'quarter_slice') {
        ctx.beginPath();
        ctx.moveTo(ax - pzR, ay);
        ctx.lineTo(ax + pzR, ay);
        ctx.stroke();
      }

      // Pepperoni Smiles
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 2 + Math.PI / 4;
        const px = ax + Math.cos(ang) * (pzR * 0.5);
        const py = ay + Math.sin(ang) * (pzR * 0.5);
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(px, py, 11, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (actor === 'skeleton' || actor === 'skull' || actor === 'ribcage') {
      // Cartoon Breakdancing Skeleton
      const dance = Math.sin(clock * 6) * 15;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#2d3436';
      ctx.lineWidth = 3;

      // Skull
      ctx.beginPath();
      ctx.arc(ax, ay - 60 + dance, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Eyes
      ctx.fillStyle = '#2d3436';
      ctx.beginPath();
      ctx.arc(ax - 9, ay - 62 + dance, 6, 0, Math.PI * 2);
      ctx.arc(ax + 9, ay - 62 + dance, 6, 0, Math.PI * 2);
      ctx.fill();

      // Spine & Ribcage
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(ax, ay - 32 + dance);
      ctx.lineTo(ax, ay + 30 + dance);
      ctx.stroke();

      // Dancing Ribs
      ctx.lineWidth = 4;
      for (let r = 0; r < 3; r++) {
        ctx.beginPath();
        ctx.moveTo(ax - 20, ay - 20 + r * 14 + dance);
        ctx.lineTo(ax + 20, ay - 20 + r * 14 + dance);
        ctx.stroke();
      }
    } else if (actor === 'chloroplast' || actor === 'leaf' || actor === 'plant' || actor === 'photosynthesis' || actor === 'cellular_view') {
      // Realistic Plant Cell & Chloroplast Microscopic Visualization
      ctx.save();
      // Outer cell wall with realistic depth gradient
      const cellGrad = ctx.createRadialGradient(ax, ay, 10, ax, ay, 75);
      cellGrad.addColorStop(0, '#2ed573');
      cellGrad.addColorStop(0.7, '#10ac84');
      cellGrad.addColorStop(1, '#057a55');
      ctx.fillStyle = cellGrad;
      ctx.strokeStyle = '#034832';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(ax, ay, 75, 55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Chlorophyll Grana stacks (thylakoids)
      ctx.fillStyle = '#0652dd';
      for (let s = -2; s <= 2; s++) {
        for (let t = 0; t < 3; t++) {
          ctx.fillStyle = '#006266';
          ctx.beginPath();
          ctx.ellipse(ax + s * 22, ay - 12 + t * 12, 9, 4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#7bed9f';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Streaming Sunlight Photons (realistic golden rays)
      ctx.strokeStyle = '#fffa65';
      ctx.lineWidth = 2.5;
      for (let r = 0; r < 4; r++) {
        const offset = ((clock * 60 + r * 30) % 120);
        ctx.beginPath();
        ctx.moveTo(ax - 60 + r * 35, ay - 65 + offset * 0.4);
        ctx.lineTo(ax - 50 + r * 35, ay - 45 + offset * 0.4);
        ctx.stroke();
      }

      // Realistic Molecular Labels
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillText("☀️ Photons (Energy)", ax - 50, ay - 60);
      ctx.fillText("H2O + CO2 ➔ C6H12O6 + O2", ax - 65, ay + 70);
      ctx.restore();
    } else if (actor === 'planet' || actor === 'space' || actor === 'solar' || actor === 'earth') {
      // Realistic Rotating Earth / Planetary Sphere
      ctx.save();
      const planetGrad = ctx.createRadialGradient(ax - 20, ay - 20, 10, ax, ay, 65);
      planetGrad.addColorStop(0, '#74b9ff');
      planetGrad.addColorStop(0.6, '#0984e3');
      planetGrad.addColorStop(1, '#0c2461');
      ctx.fillStyle = planetGrad;
      ctx.beginPath();
      ctx.arc(ax, ay, 60, 0, Math.PI * 2);
      ctx.fill();

      // Realistic Continental Landmasses
      ctx.fillStyle = '#2ed573';
      ctx.beginPath();
      const rot = (clock * 15) % 120;
      ctx.arc(ax - 30 + rot - 60, ay - 10, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ax + 10 + rot - 60, ay + 15, 18, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric Glow Ring
      ctx.strokeStyle = 'rgba(116, 185, 255, 0.6)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(ax, ay, 64, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else {
      // Realistic Scientific Holographic Analysis Core (NO EMOJIS)
      ctx.save();
      // Outer telemetry ring
      ctx.strokeStyle = '#00d2d3';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(ax, ay, 60, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating inner data reticle
      ctx.strokeStyle = '#54a0ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ax, ay, 45, clock, clock + Math.PI * 1.5);
      ctx.stroke();

      // Scientific Oscillation Wave Graph
      ctx.strokeStyle = '#10ac84';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = -35; x <= 35; x += 5) {
        const y = Math.sin((x + clock * 40) * 0.15) * 14;
        if (x === -35) ctx.moveTo(ax + x, ay + y);
        else ctx.lineTo(ax + x, ay + y);
      }
      ctx.stroke();

      // Scientific Telemetry Text
      ctx.fillStyle = '#c8d6e5';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillText("SCIENCE ANALYSIS", ax - 50, ay + 72);
      ctx.restore();
    }

    ctx.restore();
  }

  // Draw Animated Speech Bubble for Dialogue
  function drawSpeechBubble(ctx, x, y, text, character) {
    ctx.save();
    const bubbleW = 440;
    const bubbleH = 65;

    // Bubble Background
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#6c5ce7';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(x, y, bubbleW, bubbleH, 18);
    ctx.fill();
    ctx.stroke();

    // Bubble pointer pointing down to Archie
    ctx.beginPath();
    ctx.moveTo(x + 30, y + bubbleH);
    ctx.lineTo(x + 20, y + bubbleH + 14);
    ctx.lineTo(x + 45, y + bubbleH);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Speaker Name Tag
    ctx.fillStyle = '#6c5ce7';
    ctx.font = 'bold 12px Outfit, sans-serif';
    ctx.fillText(`💬 ${character.toUpperCase()}:`, x + 15, y + 20);

    // Dialogue Text
    ctx.fillStyle = '#2d3436';
    ctx.font = 'bold 13px Outfit, sans-serif';
    // Trim text if too long
    const displayLine = text.length > 60 ? text.substring(0, 58) + '...' : text;
    ctx.fillText(displayLine, x + 15, y + 44);

    ctx.restore();
  }

  return (
    <canvas 
      ref={canvasRef} 
      width={780} 
      height={340}
      style={{
        width: '100%',
        height: '100%',
        display: 'block'
      }}
    />
  );
}

export default function InteractiveVideoPlayer({ topicKey = 'DigestJourney', language = 'en', onComplete }) {
  const [cartoonScript, setCartoonScript] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [checkpointTriggered, setCheckpointTriggered] = useState(false);
  const [checkpointSolved, setCheckpointSolved] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Custom AI Cartoon Prompt State
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const timerRef = useRef(null);

  // Load cartoon video script for topic on mount
  useEffect(() => {
    loadCartoonScript();
  }, [topicKey, language]);

  const loadCartoonScript = async (customUserPrompt = '') => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-cartoon-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicKey,
          prompt: customUserPrompt,
          language
        })
      });
      const data = await res.json();
      if (data?.script) {
        setCartoonScript(data.script);
        setCurrentTime(0);
        setIsPlaying(true);
        setCheckpointTriggered(false);
        setCheckpointSolved(false);
        setShowCelebration(false);
      }
    } catch (err) {
      console.warn("Cartoon script fetch error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentScene = cartoonScript?.scenes
    ? [...cartoonScript.scenes].reverse().find(s => currentTime >= s.time) || cartoonScript.scenes[0]
    : null;

  const duration = cartoonScript?.duration || 36;

  // Timeline playback timer
  useEffect(() => {
    if (isPlaying && !checkpointTriggered && cartoonScript) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 0.5 * playbackSpeed;
          if (next >= duration) {
            clearInterval(timerRef.current);
            setIsPlaying(false);
            window.speechSynthesis?.cancel();
            // Ask checkpoint question strictly AFTER video completion
            if (cartoonScript.checkpoint && !checkpointSolved) {
              setCheckpointTriggered(true);
              playSound.chime();
            } else {
              setShowCelebration(true);
              playSound.success();
              if (onComplete) onComplete();
            }
            return duration;
          }
          return next;
        });
      }, 500);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, playbackSpeed, checkpointTriggered, checkpointSolved, cartoonScript, duration]);

  // Voice narration matching active dialogue
  useEffect(() => {
    if (isPlaying && !isMuted && window.speechSynthesis && currentScene?.dialogue) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentScene.dialogue);
      utterance.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
      utterance.rate = playbackSpeed;
      window.speechSynthesis.speak(utterance);
    }
  }, [currentScene?.dialogue, isPlaying, isMuted, language, playbackSpeed]);

  // 100% Responsive Pause / Play button handler
  const togglePlay = () => {
    playSound.click();
    if (isPlaying) {
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
    } else {
      if (currentTime >= duration) {
        setCurrentTime(0);
        setCheckpointSolved(false);
        setShowCelebration(false);
      }
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    playSound.click();
    window.speechSynthesis?.cancel();
    setCurrentTime(0);
    setIsPlaying(true);
    setCheckpointTriggered(false);
    setCheckpointSolved(false);
    setShowCelebration(false);
  };

  const handleCheckpointAnswer = (idx) => {
    setSelectedOption(idx);
    if (idx === cartoonScript.checkpoint.answer) {
      playSound.success();
      setTimeout(() => {
        setCheckpointSolved(true);
        setCheckpointTriggered(false);
        setShowCelebration(true);
        if (onComplete) onComplete();
      }, 1200);
    } else {
      playSound.buzzer();
    }
  };

  const handleCustomGenerate = (e) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    playSound.chime();
    loadCartoonScript(customPrompt);
    setCustomPrompt('');
  };

  const progressPercent = (currentTime / duration) * 100;

  return (
    <div style={{
      width: '100%',
      maxWidth: '820px',
      margin: '0 auto',
      background: '#1e272e',
      borderRadius: '26px',
      overflow: 'hidden',
      boxShadow: '0 20px 45px rgba(0,0,0,0.25)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      border: '4px solid #fff'
    }}>
      
      {/* Cartoon Studio Title Header */}
      <div style={{
        background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={20} color="#fdcb6e" />
          <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>
            {cartoonScript?.title || "🎬 Archie's AI Cartoon Adventure"}
          </span>
        </div>

        <span style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.25)', padding: '3px 10px', borderRadius: '10px', fontWeight: 'bold' }}>
          ✨ AI CARTOON STUDIO
        </span>
      </div>

      {/* Main 60fps Cartoon Canvas Viewport */}
      <div style={{
        height: '340px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#74b9ff'
      }}>
        {isGenerating ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'white' }}>
            <div style={{ fontSize: '3rem', animation: 'pulseStar 1s infinite' }}>🎨✨</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2d3436' }}>
              {language === 'en' ? 'Archie AI is Directing Your Cartoon Video...' : 'ஆர்ச்சி AI உங்கள் கார்ட்டூன் வீடியோவை உருவாக்குகிறது...'}
            </h3>
            <p style={{ color: '#636e72', fontSize: '0.85rem' }}>
              Animating scenes, characters, and voice narration!
            </p>
          </div>
        ) : (
          <>
            <CartoonSceneRenderer 
              script={cartoonScript}
              currentTime={currentTime}
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              language={language}
            />

            {/* Clickable Pause Overlay */}
            {!isPlaying && currentTime > 0 && !showCelebration && !checkpointTriggered && (
              <div 
                onClick={togglePlay}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.45)',
                  backdropFilter: 'blur(3px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 8
                }}
              >
                <div style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: '#6c5ce7',
                  border: '3px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 8px 25px rgba(108, 92, 231, 0.6)',
                  animation: 'pulseStar 1.5s infinite'
                }}>
                  <Play size={32} style={{ marginLeft: '4px' }} />
                </div>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', marginTop: '12px' }}>
                  {language === 'en' ? 'PAUSED • Click to Resume' : 'நிறுத்தப்பட்டது • தொடர கிளிக் செய்யவும்'}
                </span>
              </div>
            )}
          </>
        )}

        {/* Checkpoint Pop-up Overlay (Pause and Learn) */}
        {checkpointTriggered && cartoonScript?.checkpoint && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(24, 44, 97, 0.95)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '25px',
            color: 'white',
            zIndex: 15,
            animation: 'slideInRight 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbc531', marginBottom: '8px' }}>
              <HelpCircle size={28} />
              <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
                {language === 'en' ? 'Interactive Cartoon Checkpoint!' : 'ஊடாடும் கார்ட்டூன் வினா!'}
              </h3>
            </div>
            <p style={{ textAlign: 'center', fontSize: '1.05rem', maxWidth: '520px', margin: '10px 0 20px', fontWeight: '500' }}>
              {cartoonScript.checkpoint.question}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '420px' }}>
              {cartoonScript.checkpoint.options.map((opt, idx) => {
                const isCorrect = idx === cartoonScript.checkpoint.answer;
                const isSelected = selectedOption === idx;
                let bg = 'rgba(255,255,255,0.15)';
                if (isSelected) {
                  bg = isCorrect ? '#2ecc71' : '#e74c3c';
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleCheckpointAnswer(idx)}
                    style={{
                      background: bg,
                      border: '2px solid rgba(255,255,255,0.3)',
                      color: 'white',
                      padding: '12px 18px',
                      borderRadius: '14px',
                      fontSize: '0.95rem',
                      fontWeight: 'bold',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {idx + 1}. {opt}
                  </button>
                );
              })}
            </div>

            {selectedOption === cartoonScript.checkpoint.answer && (
              <p style={{ color: '#2ecc71', fontWeight: 'bold', marginTop: '12px', animation: 'bounceSlow 1s infinite' }}>
                🎉 {cartoonScript.checkpoint.explanation}
              </p>
            )}
          </div>
        )}

        {/* Video Completed Celebration Overlay */}
        {showCelebration && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(108, 92, 231, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            zIndex: 15
          }}>
            <div style={{ fontSize: '3.5rem', animation: 'pulseStar 1.5s infinite' }}>🏆</div>
            <h2 style={{ fontSize: '1.6rem', margin: '10px 0 5px' }}>
              {language === 'en' ? 'AI Cartoon Episode Completed!' : 'கார்ட்டூன் பகுதி முடிந்தது!'}
            </h2>
            <p style={{ opacity: 0.9, fontSize: '0.95rem', marginBottom: '18px' }}>
              {language === 'en' ? '+50 XP Earned! Ready for the Lab Game?' : '+50 XP பெற்றது! விளையாட்டுக்கு தயாரா?'}
            </p>
            <button
              onClick={handleRestart}
              className="btn-playful btn-accent"
              style={{ padding: '10px 24px', fontSize: '1rem' }}
            >
              <RotateCcw size={18} /> {language === 'en' ? 'Replay Cartoon' : 'மீண்டும் பார்'}
            </button>
          </div>
        )}
      </div>

      {/* Scrubber Progress Bar */}
      <div 
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const newPct = clickX / rect.width;
          setCurrentTime(newPct * duration);
        }}
        style={{
          width: '100%',
          height: '8px',
          background: '#485460',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <div style={{
          width: `${progressPercent}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #fdcb6e 0%, #e17055 100%)',
          transition: 'width 0.2s linear'
        }} />
        {cartoonScript?.checkpoint && (
          <div style={{
            position: 'absolute',
            left: `${(cartoonScript.checkpoint.time / duration) * 100}%`,
            top: '-4px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: checkpointSolved ? '#2ecc71' : '#f1c40f',
            border: '2px solid white',
            transform: 'translateX(-50%)',
            title: 'Checkpoint'
          }} />
        )}
      </div>

      {/* Control Bar: Play / Pause, Restart, Speed & Mute */}
      <div style={{
        background: '#2f3542',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={togglePlay}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#6c5ce7',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 4px 10px rgba(108, 92, 231, 0.4)'
            }}
            title={isPlaying ? 'Pause Video' : 'Play Video'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '3px' }} />}
          </button>

          <button
            onClick={handleRestart}
            style={{ background: 'transparent', color: '#a4b0be', cursor: 'pointer', border: 'none', padding: '6px' }}
            title="Restart"
          >
            <RotateCcw size={18} />
          </button>

          <span style={{ fontSize: '0.85rem', color: '#ced6e0', fontWeight: 'bold' }}>
            {Math.floor(currentTime)}s / {duration}s
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => {
              const speeds = [0.75, 1, 1.25];
              const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
              setPlaybackSpeed(next);
            }}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#fdcb6e',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '4px 8px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {playbackSpeed}x
          </button>

          <button
            onClick={() => {
              setIsMuted(!isMuted);
              if (!isMuted) window.speechSynthesis?.cancel();
            }}
            style={{ background: 'transparent', color: isMuted ? '#ff7675' : '#7bed9f', border: 'none', cursor: 'pointer' }}
            title={isMuted ? 'Voice Off' : 'Voice On'}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>

      {/* AI Cartoon Generator Prompt Input Bar */}
      <div style={{
        background: '#1a1e29',
        padding: '10px 18px',
        borderTop: '2px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Wand2 size={18} color="#fdcb6e" />
        <form onSubmit={handleCustomGenerate} style={{ display: 'flex', flex: 1, gap: '8px' }}>
          <input
            type="text"
            placeholder={language === 'en' ? "✨ Ask AI to create a cartoon about any doubt (e.g. why rain falls)..." : "✨ புதிய கார்ட்டூன் வீடியோ உருவாக்க கேளுங்கள்..."}
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 14px',
              borderRadius: '20px',
              border: '1.5px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.08)',
              color: 'white',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            className="btn-playful btn-accent"
            disabled={isGenerating || !customPrompt.trim()}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              borderRadius: '16px',
              boxShadow: 'none',
              opacity: customPrompt.trim() ? 1 : 0.6
            }}
          >
            {language === 'en' ? 'Create Cartoon 🎬' : 'உருவாக்கு 🎬'}
          </button>
        </form>
      </div>

    </div>
  );
}
