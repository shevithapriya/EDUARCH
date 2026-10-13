import React, { useState, useEffect } from 'react';
import { playSound } from '../utils/audio';
import { ArrowLeft, Star, Award, CheckCircle2, AlertCircle, Play, BookOpen, Volume2, Sparkles, HelpCircle } from 'lucide-react';
import InteractiveVideoPlayer from './InteractiveVideoPlayer';

// Import all game components
import ChefPlate from './games/ChefPlate';
import DigestJourney from './games/DigestJourney';
import Preservation from './games/Preservation';
import PizzaPizzeria from './games/PizzaPizzeria';
import BridgeBuilder from './games/BridgeBuilder';
import FractionBalance from './games/FractionBalance';
import SkeletonPuzzle from './games/SkeletonPuzzle';
import PuppetJoints from './games/PuppetJoints';
import MuscleGym from './games/MuscleGym';
import LaserAngles from './games/LaserAngles';
import MirrorSymmetry from './games/MirrorSymmetry';
import ProtractorHero from './games/ProtractorHero';

// Multilingual slide contents (2 slides per topic)
const LEARNING_SLIDES = {
  en: {
    ChefPlate: [
      {
        title: "📚 What are Nutrients?",
        content: "Nutrients are chemical substances in food that our body needs to grow, get energy, and stay healthy! The main nutrient groups are Carbohydrates (for energy), Proteins (for body-building and muscles), Fats (for warmth and energy storage), and Vitamins/Minerals (to protect us from germs and diseases).",
        visual: "🍚 Carbohydrates • 🍗 Proteins • 🥑 Fats • 🍎 Vitamins"
      },
      {
        title: "⚖️ What is a Balanced Diet?",
        content: "A balanced diet means eating food that contains the right proportions of all nutrients. If we only eat rice (carbs) or chicken (protein), our body misses out on other essential builders! In this game, your goal is to add items from all groups onto the plate to balance the body scales.",
        visual: "🍽️ Balanced Plate Goal: Carbs + Proteins + Fats + Vitamins!"
      }
    ],
    DigestJourney: [
      {
        title: "👄 The Digestive Journey Begins",
        content: "Digestion is the process of breaking down complex food into smaller, soluble particles that our blood can absorb. It starts in the Mouth where teeth chew and saliva softens food. Swallowed food then travels down the Esophagus (food pipe) by wave-like squeezing movements.",
        visual: "🍎 Mouth 👄 ➔ Food Pipe 🥖"
      },
      {
        title: "🧪 Into the Chemical Mixers",
        content: "Next, the food enters the J-shaped Stomach bag which churns it with acids to break down proteins. In the long Small Intestine, digestion is completed and useful nutrients are absorbed into the blood. The wider Large Intestine absorbs water, turning waste into solids.",
        visual: "Stomach 🧪 ➔ Small Intestine 🌀 ➔ Large Intestine 🧻"
      }
    ],
    Preservation: [
      {
        title: "🔬 Why does Food Spoil?",
        content: "Germs, bacteria, and molds love moisture and warmth! When left open, they grow on food and spoil it, making it smell bad and unsafe to eat. To stop this, we use food preservation—methods that stop germs from growing.",
        visual: "🦠 Moisture + Warmth = Germ Spoilage!"
      },
      {
        title: "☀️ Methods of Preservation",
        content: "Common methods include: 1) Boiling (high heat kills germs), 2) Pickling (uses oil/acid to block oxygen), and 3) Sun Drying / Dehydration (removes moisture so bacteria cannot drink or survive). Let's save the food in our kitchen lab!",
        visual: "🔥 Boiling stove • 🏺 Vinegar Jar • ☀️ Dehydrator"
      }
    ],
    PlantsPhotosynthesis: [
      {
        title: "🌱 Nature's Solar Kitchen",
        content: "Green plants are unique living producers! They capture golden sunlight using green chlorophyll pigments in their leaves. Leaves absorb carbon dioxide from the air and roots drink water from soil.",
        visual: "☀️ Sunlight + 💨 CO2 + 💧 Water ➔ 🍯 Glucose + 🌬️ Oxygen!"
      },
      {
        title: "🌿 Plant Adaptations",
        content: "Plants adapt to their habitats! Desert cactus stores water in fleshy green stems and turns leaves into sharp spines to prevent water loss. Water lilies have broad waxy floating leaves with breathing stomata on top!",
        visual: "🌵 Desert Cactus vs 🪷 Floating Water Lily"
      }
    ],
    PizzaChef: [
      {
        title: "🍕 What is a Fraction?",
        content: "A fraction represents equal parts of a whole shape! For example, if a circular pizza is sliced into 4 equal pieces, each piece is 1/4 (one-quarter). The top number (Numerator) is the parts we have, and the bottom number (Denominator) is the total equal parts.",
        visual: "1/4 ➔ [1 Slice Chosen (Top)] / [4 Slices Total (Bottom)]"
      },
      {
        title: "👨‍🍳 How to Bake Fractions?",
        content: "If a customer asks for a pizza that is 2/4 Cheese, you must slice the pizza into 4 parts and add Cheese topping to exactly 2 slices. 2/4 means half the pizza is cheese! Let's dress the pizzas correctly.",
        visual: "🧀 🧀 🥣 🥣 ➔ 2 Slices cheese out of 4 slices = 2/4!"
      }
    ],
    BridgeBuilder: [
      {
        title: "🪵 Equivalent Fractions Concept",
        content: "Equivalent fractions look different because they have different numbers, but they represent the exact same size or value! For example, eating 1/2 of a pizza is the exact same amount of food as eating 2/4 or 3/6 of the pizza.",
        visual: "1/2 = 2/4 = 3/6 = 4/8 (Same space filled!)"
      },
      {
        title: "🌉 Building the Ratio Bridge",
        content: "To find equivalent fractions, you multiply or divide the top and bottom numbers by the same number. E.g., multiplying top and bottom of 1/2 by 2 gives 2/4! You will use these matching values to bridge floating river logs.",
        visual: "1/2 ➔ Multiply top and bottom by 2 ➔ 2/4!"
      }
    ],
    FractionBalance: [
      {
        title: "⚖️ Adding Like Fractions",
        content: "When we add fractions that have the same denominator (called like fractions), the math is easy! We just add the top numbers (numerators) together and keep the bottom number (denominator) exactly the same.",
        visual: "1/5 + 2/5 = 3/5 (Bottom 5 stays identical!)"
      },
      {
        title: "🛍️ Visualizing the Sum",
        content: "Think of an apple cut into 5 slices. If you take 1 slice (1/5) and add 2 more slices (2/5), you now have 3 slices out of 5 (3/5). You will place fractional weight blocks on a lab balance scale to balance the target sums.",
        visual: "🏋️‍♂️ 1/5 + 🏋️‍♂️ 2/5 ➔ Balances 🏋️‍♂️ 3/5 on scale!"
      }
    ],
    SkeletonPuzzle: [
      {
        title: "💀 The Human Skeletal System",
        content: "Our skeletal system is the rigid framework of 206 bones that supports our body, gives us shape, and protects our soft internal organs. Without bones, we would collapse into a floppy puddle of jelly!",
        visual: "🦴 206 Bones framework = Body Shape & Protection!"
      },
      {
        title: "🛡️ What do Bones Protect?",
        content: "1) The Skull protects your soft brain. 2) The Ribcage protects your heart and lungs. 3) The Spine (backbone) keeps you standing straight and protects the spinal cord. 4) Limbs (arms and legs) contain long bones to support weight and help you move.",
        visual: "💀 Skull 🧠 • 🩻 Ribcage 🫁❤️ • Spine 🧬"
      }
    ],
    PuppetJoints: [
      {
        title: "🤸 What are Bone Joints?",
        content: "Joints are places in our body where two or more bones meet. Joints allow our rigid bones to move. Different types of joints allow different kinds of movements! Without joints, you wouldn't be able to bend your arm or turn your neck.",
        visual: "🦴 Joint Node 🦴 = Allows bend, rotation, or slide!"
      },
      {
        title: "⚙️ Types of Joints",
        content: "1) Hinge Joint: Moves back and forth like a door hinge (Knees/Elbows). 2) Ball & Socket Joint: Allows circular rotation in all directions (Shoulder/Hips). 3) Pivot Joint: Allows rotation and turning (Neck). You will test these joint sliders on a model puppet!",
        visual: "🚪 Hinge (Knee) • 🔮 Ball & Socket (Shoulder) • 🎡 Pivot (Neck)"
      }
    ],
    MuscleGym: [
      {
        title: "💪 How do Muscles Move Bones?",
        content: "Bones cannot move by themselves; they need muscles! Muscles are attached to bones and pull them by contracting (becoming shorter and thicker) or relaxing. Crucially, muscles can only pull—they can NEVER push!",
        visual: "🧠 Brain Signal ➔ Muscle contracts (Pulls bone!)"
      },
      {
        title: "🏋️‍♂️ Antagonistic Pair Coordination",
        content: "Because muscles can only pull, they must work in pairs called antagonistic pairs. When you bend your elbow, the Biceps contracts and Triceps relaxes. To straighten the arm, they switch: Triceps contracts and Biceps relaxes. Let's lift dumbbells in the gym!",
        visual: "💪 Biceps pull (up) • Triceps pull (down)"
      }
    ],
    SolarSpace: [
      {
        title: "🪐 The Solar System Family",
        content: "The Sun is our cosmic star anchor! 8 planets orbit around the sun in elliptical paths: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Earth is in the habitable Goldilocks zone with water and oxygen!",
        visual: "☀️ Sun ➔ 🪐 8 Orbiting Planets ➔ 🌙 Earth's Moon"
      },
      {
        title: "⚙️ Simple Machines in Space & Earth",
        content: "Simple machines make work easier by multiplying force or changing direction. Levers use a fulcrum pivot (like a seesaw), pulleys lift heavy loads upward with ropes, and inclined planes (ramps) let us roll heavy weights up slopes!",
        visual: "⚖️ Lever Seesaw • 🎡 Wheel Pulley • 📐 Inclined Ramp"
      }
    ],
    LaserAngles: [
      {
        title: "📐 What is an Angle?",
        content: "An angle is formed when two straight lines meet at a common corner point called a vertex. We measure angles in degrees (°). The full rotation of a circle is 360°, and a straight flat line represents 180°.",
        visual: "📐 Line 1 ➔ Vertex Corner ➔ Line 2"
      },
      {
        title: "🎯 Angle Classifications",
        content: "1) Acute Angle: Small and sharp, measuring less than 90°. 2) Right Angle: Exactly 90°, forming an 'L' shape. 3) Obtuse Angle: Wide and open, measuring between 90° and 180°. You will rotate and fire a laser canon at targets matching these values!",
        visual: "📐 Acute (<90°) • 📐 Right (90°) • 📐 Obtuse (>90°)"
      }
    ],
    MirrorSymmetry: [
      {
        title: "🦋 Line Symmetry Grid",
        content: "A shape has line symmetry if it can be divided into identical halves by a line. If you place a mirror on this line (Line of Symmetry), the reflection matches the other side perfectly. A butterfly, a square, and a heart are beautiful symmetric shapes.",
        visual: "🦋 Left Wing | Dotted Mirror Line | Right Wing"
      },
      {
        title: "🎨 How to Mirror Cells?",
        content: "On a grid map, a cell on the left must be reflected at the exact same distance on the right across the mirror line. If column 1 is colored, its mirror counterpart is column 4! You will complete half-drawn shapes by mirroring grids.",
        visual: "█ █ ░ | ░ █ █ ➔ Column 1 mirrors onto column 4!"
      }
    ],
    ProtractorHero: [
      {
        title: "📐 Meet the Protractor",
        content: "A protractor is a semi-circular mathematical tool used to measure and draw angles. It has markings from 0 to 180 degrees. To measure an angle, place the center dot on the vertex corner and align the baseline with one arm.",
        visual: "📐 Semi-circle grid markings: 0° to 180°"
      },
      {
        title: "🛹 Skater Ramp Slope Measuring",
        content: "To help a skater jump and land tricks, you must measure the angle of the slope. Align your virtual protractor tool's baseline, and check where the ramp line intersects the degree scale. Let's do skateboard jumps!",
        visual: "🛹 Skater ramp slope vertex alignment ➔ measure slope!"
      }
    ]
  },
  ta: {
    ChefPlate: [
      {
        title: "📚 ஊட்டச்சத்துக்கள் என்றால் என்ன?",
        content: "ஊட்டச்சத்துக்கள் என்பது நமது உடல் வளரவும், ஆற்றல் பெறவும், ஆரோக்கியமாக இருக்கவும் உதவும் உணவில் உள்ள சிறப்புப் பொருட்களாகும்! முக்கிய ஊட்டச்சத்துக்கள்: கார்போஹைட்ரேட்டுகள் (ஆற்றல்), புரதங்கள் (உடல் வளர்ச்சி), கொழுப்புகள் (வெப்பம்) மற்றும் வைட்டமின்கள்/தாதுக்கள் (நோய் எதிர்ப்பு சக்தி).",
        visual: "🍚 கார்போஹைட்ரேட் • 🍗 புரதம் • 🥑 கொழுப்பு • 🍎 வைட்டமின்கள்"
      },
      {
        title: "⚖️ சமச்சீர் உணவு என்றால் என்ன?",
        content: "சமச்சீர் உணவு என்பது அனைத்து ஊட்டச்சத்துக்களும் சரியான விகிதத்தில் உள்ள உணவாகும். நாம் ஒரு சத்தான உணவை மட்டுமே சாப்பிட்டால் மற்ற சத்துக்கள் கிடைக்காது! இந்த விளையாட்டில், ஆரோக்கியமான சமச்சீர் உணவை உருவாக்க தட்டில் அனைத்து ஊட்டச்சத்துக்களையும் சேர்க்க வேண்டும்.",
        visual: "🍽️ இலக்கு: மாவுச்சத்து + புரதம் + கொழுப்பு + வைட்டமின்!"
      }
    ],
    DigestJourney: [
      {
        title: "👄 செரிமானப் பயணம் தொடங்குகிறது",
        content: "நாம் சாப்பிடும் உணவை உடல் உறிஞ்சக்கூடிய எளிய பொருட்களாக மாற்றுவதே செரிமானம் எனப்படும். இது வாயில் தொடங்குகிறது, அங்கு பற்கள் உணவை மென்று உமிழ்நீருடன் கலக்கின்றன. பின் உணவு Esophagus (உணவுக் குழாய்) வழியாக அலை போன்ற இயக்கத்தால் கீழே தள்ளப்படுகிறது.",
        visual: "🍎 வாய் 👄 ➔ உணவுக் குழாய் 🥖"
      },
      {
        title: "🧪 இரைப்பை மற்றும் குடல் நொதிகள்",
        content: "அடுத்து, உணவு இரைப்பையை அடைகிறது. அங்குள்ள அமிலங்கள் உணவைக் கடைந்து புரதங்களை உடைக்கின்றன. சிறு குடலில் செரிமானம் முடிந்து சத்துக்கள் இரத்தத்தில் உறிஞ்சப்படுகின்றன. பெருங்குடல் தண்ணீரை உறிஞ்சி கழிவுகளை வெளியேற்றுகிறது.",
        visual: "இரைப்பை 🧪 ➔ சிறு குடல் 🌀 ➔ பெருங்குடல் 🧻"
      }
    ],
    Preservation: [
      {
        title: "🔬 உணவு ஏன் கெட்டுப்போகிறது?",
        content: "ஈரப்பதம் மற்றும் வெப்பம் இருக்கும்போது நுண்கிருமிகள் உணவில் மிக வேகமாக வளரும்! இதனால் உணவு கெட்டுப்போய், துர்நாற்றம் வீசும், சாப்பிட தகுதியற்றதாகிவிடும். இதைத் தடுக்கவே நாம் ஊறுகாய் போடுதல், உலர்த்துதல் போன்ற உணவுப் பாதுகாப்பு முறைகளைப் பயன்படுத்துகிறோம்.",
        visual: "🦠 ஈரப்பதம் + வெப்பம் = கிருமிகள் பெருக்கம்!"
      },
      {
        title: "☀️ உணவுப் பாதுகாப்பு முறைகள்",
        content: "முக்கிய முறைகள்: 1) கொதிக்க வைத்தல் (கிருமிகளை அழிக்கும்), 2) ஊறுகாய் போடுதல் (எண்ணெய்/அமிலம் கிருமிகளைத் தடுக்கும்), 3) உலர்த்துதல் (ஈரப்பதத்தை நீக்கும், கிருமிகள் வாழ முடியாது). வாருங்கள், உணவை ஆய்வுக்கூடத்தில் பாதுகாப்போம்!",
        visual: "🔥 கொதிக்கவைத்தல் • 🏺 ஊறுகாய் ஜாடி • ☀️ உலர்த்தி"
      }
    ],
    PlantsPhotosynthesis: [
      {
        title: "🌱 தாவரங்களின் சமையலறை",
        content: "பசுமையான தாவரங்கள் தங்களுக்குத் தேவையான உணவைத் தாமே தயாரிக்கின்றன! இலைகளில் உள்ள பச்சையம் சூரிய ஒளியை ஈர்க்கிறது. வேர்கள் நீரையும், இலைகள் கார்பன் டை ஆக்சைடையும் எடுத்துக்கொண்டு உணவையும் ஆக்சிஜனையும் உருவாக்குகின்றன.",
        visual: "☀️ சூரிய ஒளி + நீர் + கார்பன் டை ஆக்சைடு ➔ ஆக்சிஜன்!"
      },
      {
        title: "🌿 தாவரங்களின் தகவமைப்புகள்",
        content: "பாலைவன சப்பாத்திக்கள்ளி நீர் ஆவியாவதைத் தடுக்க இலைகளை முட்களாக மாற்றியுள்ளது! நீர் அல்லி இலைகள் தண்ணீரில் மிதக்க மெழுகு பூச்சைக் கொண்டுள்ளன.",
        visual: "🌵 பாலைவன சப்பாத்திக்கள்ளி • 🪷 நீர் அல்லி"
      }
    ],
    PizzaChef: [
      {
        title: "🍕 பின்னம் என்றால் என்ன?",
        content: "ஒரு முழுமையான பொருளின் சமமான பகுதிகளைக் குறிப்பதே பின்னம் ஆகும்! உதாரணமாக, ஒரு பீட்சாவை 4 சம பாகங்களாக வெட்டினால், ஒரு பாகம் 1/4 ஆகும். மேல் எண் (தொகுதி) நாம் எடுத்த பகுதியைக் குறிக்கும், கீழ் எண் (பகுதி) மொத்த சம பாகங்களைக் குறிக்கும்.",
        visual: "1/4 ➔ [எடுத்த பகுதி (மேலே)] / [மொத்த பகுதிகள் (கீழே)]"
      },
      {
        title: "👨‍🍳 பின்ன பீட்சா செய்வது எப்படி?",
        content: "ஒரு வாடிக்கையாளர் 2/4 சீஸ் பீட்சா கேட்டால், நீங்கள் பீட்சாவை 4 சம துண்டுகளாக வெட்டி, அதில் 2 துண்டுகளில் சீஸ் சேர்க்க வேண்டும். 2/4 என்பது சரிபாதி ஆகும்! வாருங்கள், பீட்சாக்களைச் செய்வோம்.",
        visual: "🧀 🧀 🥣 🥣 ➔ 4ல் 2 துண்டுகள் சீஸ் = 2/4 பீட்சா!"
      }
    ],
    SkeletonPuzzle: [
      {
        title: "💀 மனித எலும்பு மண்டலம்",
        content: "நமது எலும்பு மண்டலம் 206 எலும்புகளைக் கொண்ட ஒரு வலிமையான கட்டமைப்பாகும். இது உடலுக்கு வடிவம் தருகிறது மற்றும் உள் உறுப்புகளைப் பாதுகாக்கிறது. எலும்புகள் இல்லையென்றால் நாம் ஜெல்லி போல தளர்ந்து விடுவோம்!",
        visual: "🦴 206 எலும்புகள் = உடலின் வடிவம் & பாதுகாப்பு!"
      },
      {
        title: "🛡️ எலும்புகள் எதைப் பாதுகாக்கின்றன?",
        content: "1) மண்டை ஓடு மூளையைப் பாதுகாக்கிறது. 2) விலா எலும்புகள் இதயம் மற்றும் நுரையீரலைப் பாதுகாக்கின்றன. 3) முதுகெலும்பு நேராக நிற்க உதவுகிறது மற்றும் தண்டுவடத்தைப் பாதுகாக்கிறது.",
        visual: "💀 மண்டை ஓடு 🧠 • 🩻 விலா எலும்பு 🫁❤️ • முதுகெலும்பு 🧬"
      }
    ]
  }
};

export default function GameContainer({ topic, grade, subject, lesson, language = 'en', onBack, onTopicComplete }) {
  // 4-Stage Learning Pipeline: 'video' -> 'slides' -> 'playing' -> 'quiz' -> 'summary'
  const [stage, setStage] = useState('video');
  const [slideIdx, setSlideIdx] = useState(0);
  const [gameStars, setGameStars] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [bonusStars, setBonusStars] = useState(0);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizError, setQuizError] = useState(false);

  const langPack = LEARNING_SLIDES[language] || LEARNING_SLIDES.en;
  const slides = langPack[topic.gameType] || langPack['ChefPlate'] || LEARNING_SLIDES.en.ChefPlate;

  const handleVideoCompleted = () => {
    playSound.success();
    // Auto prompt moving to next stage
  };

  const handleVoiceReadout = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const activeSlide = slides[slideIdx];
    const textToSpeak = `${activeSlide.title}. ${activeSlide.content}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const handleNextSlide = () => {
    playSound.click();
    window.speechSynthesis?.cancel();
    if (slideIdx < slides.length - 1) {
      setSlideIdx(prev => prev + 1);
    } else {
      setStage('playing');
    }
  };

  const handleGameComplete = (starsEarned) => {
    setGameStars(starsEarned);
    loadQuizQuestions();
  };

  const loadQuizQuestions = async () => {
    setLoadingQuiz(true);
    setStage('quiz');
    setQuizError(false);

    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade,
          subject,
          topicIndex: topic.id,
          topic: topic.name || lesson,
          quizKey: topic.quizKey,
          language
        })
      });

      const data = await res.json();
      if (res.ok && data.quiz && data.quiz.length > 0) {
        setQuizQuestions(data.quiz);
      } else {
        throw new Error("No quiz data");
      }
    } catch (err) {
      console.error("Quiz load error:", err);
      setQuizError(true);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleSelectOption = (idx) => {
    if (answerSubmitted) return;
    setSelectedAnswer(idx);
    playSound.click();
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    setAnswerSubmitted(true);

    const question = quizQuestions[currentQuizIdx];
    const isCorrect = selectedAnswer === question.answer;

    if (isCorrect) {
      playSound.success();
      setBonusStars(prev => prev + 1);
    } else {
      playSound.buzzer();
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedAnswer(null);
    setAnswerSubmitted(false);

    if (currentQuizIdx < quizQuestions.length - 1) {
      setCurrentQuizIdx(prev => prev + 1);
      playSound.click();
    } else {
      setStage('summary');
      playSound.chime();
    }
  };

  const handleFinished = () => {
    playSound.chime();
    const totalStars = gameStars + bonusStars + 2; // includes video bonus
    onTopicComplete(topic.id, totalStars);
  };

  const renderGame = () => {
    switch (topic.gameType) {
      case 'ChefPlate':
      case 'PlantsPhotosynthesis':
        return <ChefPlate onGameComplete={handleGameComplete} />;
      case 'DigestJourney':
        return <DigestJourney onGameComplete={handleGameComplete} />;
      case 'Preservation':
        return <Preservation onGameComplete={handleGameComplete} />;
      case 'PizzaChef':
        return <PizzaPizzeria onGameComplete={handleGameComplete} />;
      case 'BridgeBuilder':
        return <BridgeBuilder onGameComplete={handleGameComplete} />;
      case 'FractionBalance':
        return <FractionBalance onGameComplete={handleGameComplete} />;
      case 'SkeletonPuzzle':
      case 'SolarSpace':
        return <SkeletonPuzzle onGameComplete={handleGameComplete} />;
      case 'PuppetJoints':
        return <PuppetJoints onGameComplete={handleGameComplete} />;
      case 'MuscleGym':
        return <MuscleGym onGameComplete={handleGameComplete} />;
      case 'LaserAngles':
        return <LaserAngles onGameComplete={handleGameComplete} />;
      case 'MirrorSymmetry':
        return <MirrorSymmetry onGameComplete={handleGameComplete} />;
      case 'ProtractorHero':
        return <ProtractorHero onGameComplete={handleGameComplete} />;
      default:
        return <ChefPlate onGameComplete={handleGameComplete} />;
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', zIndex: 10 }}>
      
      {/* Top Header: Back + 4-Stage Learning Pipeline Navigation Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <button 
          onClick={onBack} 
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            border: '2.5px solid white',
            borderRadius: '14px',
            padding: '8px 16px',
            color: 'var(--color-primary)',
            fontSize: '0.95rem',
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 0 rgba(0,0,0,0.05)',
            cursor: 'pointer'
          }}
        >
          ← {language === 'en' ? 'Back to Dashboard' : 'பின்னே செல்'}
        </button>

        {/* 4-Stage Step Tracker */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.92)',
          borderRadius: '16px',
          padding: '4px',
          border: '2px solid white',
          boxShadow: '0 4px 0 rgba(0,0,0,0.05)'
        }}>
          {[
            { id: 'video', label: '🎬 Video', labelTa: '🎬 வீடியோ' },
            { id: 'slides', label: '📖 Concepts', labelTa: '📖 கருத்துகள்' },
            { id: 'playing', label: '🎮 Game Lab', labelTa: '🎮 விளையாட்டு' },
            { id: 'quiz', label: '🏆 Quiz', labelTa: '🏆 வினா' }
          ].map((st, i) => {
            const isActive = stage === st.id;
            return (
              <button
                key={st.id}
                onClick={() => { playSound.click(); setStage(st.id); }}
                style={{
                  background: isActive ? 'var(--color-primary)' : 'transparent',
                  color: isActive ? 'white' : '#636e72',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {language === 'en' ? st.label : st.labelTa}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '25px', 
          minHeight: '440px', 
          display: 'flex', 
          flexDirection: 'column', 
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '26px'
        }}
      >
        
        {/* Stage 1: Interactive Video Lesson */}
        {stage === 'video' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #dfe4ea', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#0984e3', fontWeight: 'bold', background: '#e1f5fe', padding: '3px 10px', borderRadius: '8px' }}>
                  STAGE 1 / 4 • VIDEO DEMO
                </span>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text-dark)', marginTop: '4px' }}>
                  {topic.name}
                </h2>
              </div>
              <button
                onClick={() => setStage('slides')}
                className="btn-playful btn-accent"
                style={{ padding: '8px 18px', fontSize: '0.9rem', borderRadius: '12px' }}
              >
                {language === 'en' ? 'Skip to Flashcards ➔' : 'கருத்துகளுக்கு செல் ➔'}
              </button>
            </div>

            {/* Video Player Component */}
            <InteractiveVideoPlayer 
              topicKey={topic.gameType}
              language={language}
              onComplete={handleVideoCompleted}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button 
                className="btn-playful btn-primary"
                onClick={() => setStage('slides')}
                style={{ padding: '12px 28px', fontSize: '1.05rem', borderRadius: '14px' }}
              >
                {language === 'en' ? 'Continue to Concept Flashcards ➔' : 'அடுத்த கட்டத்திற்கு செல் ➔'}
              </button>
            </div>
          </div>
        )}

        {/* Stage 2: Concept Slides */}
        {stage === 'slides' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #dfe4ea', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 'bold', background: '#fef3c7', padding: '3px 10px', borderRadius: '8px' }}>
                  STAGE 2 / 4 • CONCEPT FLASHCARDS
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>
                  ({slideIdx + 1} / {slides.length})
                </span>
              </div>
              <button
                onClick={handleVoiceReadout}
                style={{
                  background: '#f0f3ff',
                  border: '1.5px solid #d5daff',
                  borderRadius: '10px',
                  padding: '6px 12px',
                  color: '#6c5ce7',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Volume2 size={16} /> {language === 'en' ? 'Listen Aloud' : 'கேளுங்கள்'}
              </button>
            </div>

            <h2 style={{ fontSize: '1.7rem', color: 'var(--color-text-dark)', fontFamily: 'var(--font-fun)' }}>
              {slides[slideIdx].title}
            </h2>
            
            <p style={{ fontSize: '1.15rem', color: 'var(--color-text-dark)', lineHeight: '1.7' }}>
              {slides[slideIdx].content}
            </p>

            {/* Interactive Concept Box */}
            <div style={{
              background: '#f5f6fa',
              border: '3px dashed var(--color-primary-light)',
              padding: '20px',
              borderRadius: '18px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: 'var(--color-primary)',
              margin: '10px 0',
              textAlign: 'center'
            }}>
              {slides[slideIdx].visual}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <button
                onClick={() => setStage('video')}
                style={{ background: 'transparent', border: 'none', color: '#636e72', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                ← {language === 'en' ? 'Re-watch Video' : 'வீடியோவை மீண்டும் பார்'}
              </button>
              
              <button 
                className="btn-playful btn-accent animate-bounce-slow" 
                onClick={handleNextSlide}
                style={{ padding: '12px 30px', fontSize: '1.1rem', borderRadius: '14px' }}
              >
                {slideIdx < slides.length - 1 
                  ? (language === 'en' ? 'Next Concept ➔' : 'அடுத்த கருத்து ➔') 
                  : (language === 'en' ? "Let's Play Game! 🚀" : 'விளையாட்டைத் தொடங்கு! 🚀')}
              </button>
            </div>
          </div>
        )}

        {/* Stage 3: Game Simulation Lab */}
        {stage === 'playing' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #dfe4ea', paddingBottom: '10px', marginBottom: '15px' }}>
              <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 'bold', background: '#dcfce7', padding: '3px 10px', borderRadius: '8px' }}>
                STAGE 3 / 4 • INTERACTIVE LAB GAME
              </span>
              <span style={{ fontSize: '0.85rem', color: '#636e72' }}>
                {language === 'en' ? 'Clear the game task to unlock the Quiz!' : 'விளையாட்டை முடித்து வினாவை திறக்கவும்!'}
              </span>
            </div>
            {renderGame()}
          </div>
        )}

        {/* Stage 4: Quiz Challenge */}
        {stage === 'quiz' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%', borderBottom: '3px solid #dfe4ea', paddingBottom: '15px' }}>
              <div style={{ fontSize: '2.5rem', animation: 'float 2s infinite' }}>🦉</div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#7e22ce', fontWeight: 'bold', background: '#f3e8ff', padding: '3px 10px', borderRadius: '8px' }}>
                  STAGE 4 / 4 • CHECKPOINT QUIZ
                </span>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', margin: '4px 0 0' }}>
                  {language === 'en' ? "Archie's Knowledge Check!" : "ஆர்ச்சியின் அறிவுத் தேர்வு!"}
                </h2>
              </div>
            </div>

            {loadingQuiz ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '40px' }}>
                <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid var(--color-primary-light)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }} />
                <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                  {language === 'en' ? 'Loading Quiz Questions...' : 'வினாக்கள் தயாராகின்றன...'}
                </span>
              </div>
            ) : quizError || quizQuestions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>Could not load the quiz questions.</p>
                <button className="btn-playful btn-primary" onClick={loadQuizQuestions} style={{ marginTop: '10px' }}>
                  Retry
                </button>
              </div>
            ) : (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-text-muted)' }}>
                  <span>QUESTION {currentQuizIdx + 1} of {quizQuestions.length}</span>
                  <span style={{ color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Star size={14} fill="var(--color-accent)" /> Bonus: +{bonusStars} Stars
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-text-dark)', lineHeight: '1.4' }}>
                  {quizQuestions[currentQuizIdx].question}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {quizQuestions[currentQuizIdx].options.map((opt, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === quizQuestions[currentQuizIdx].answer;

                    let btnBorder = '2.5px solid #dfe4ea';
                    let btnBg = 'white';

                    if (answerSubmitted) {
                      if (isCorrect) {
                        btnBorder = '2.5px solid var(--color-success)';
                        btnBg = 'rgba(46,204,113,0.15)';
                      } else if (isSelected) {
                        btnBorder = '2.5px solid var(--color-danger)';
                        btnBg = 'rgba(255,118,117,0.15)';
                      }
                    } else if (isSelected) {
                      btnBorder = '2.5px solid var(--color-primary)';
                      btnBg = '#f0f3ff';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        style={{
                          padding: '14px 18px',
                          border: btnBorder,
                          borderRadius: '16px',
                          background: btnBg,
                          fontSize: '1rem',
                          textAlign: 'left',
                          fontWeight: isSelected ? 'bold' : 'normal',
                          color: 'var(--color-text-dark)',
                          cursor: answerSubmitted ? 'default' : 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span>{idx + 1}. {opt}</span>
                        {answerSubmitted && isCorrect && <CheckCircle2 size={18} color="var(--color-success)" />}
                        {answerSubmitted && isSelected && !isCorrect && <AlertCircle size={18} color="var(--color-danger)" />}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  {!answerSubmitted ? (
                    <button
                      className="btn-playful btn-primary"
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                      style={{ opacity: selectedAnswer === null ? 0.5 : 1, padding: '12px 28px' }}
                    >
                      {language === 'en' ? 'Check Answer' : 'விடையைச் சரிபார்'}
                    </button>
                  ) : (
                    <button
                      className="btn-playful btn-accent animate-bounce-slow"
                      onClick={handleNextQuizQuestion}
                      style={{ padding: '12px 28px' }}
                    >
                      {currentQuizIdx < quizQuestions.length - 1 
                        ? (language === 'en' ? 'Next Question ➔' : 'அடுத்த வினா ➔')
                        : (language === 'en' ? 'See Scorecard! 🏆' : 'மதிப்பெண்களைக் காண்க! 🏆')}
                    </button>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {/* Stage 5: Summary Scorecard */}
        {stage === 'summary' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px', padding: '20px 0' }}>
            <div style={{ fontSize: '4.5rem', animation: 'pulseStar 1.5s infinite' }}>🎉</div>
            
            <h2 style={{ fontSize: '2.2rem', color: 'var(--color-primary)' }}>
              {language === 'en' ? 'Topic Mastered!' : 'தலைப்பு நிறைவுற்றது!'}
            </h2>
            
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '480px' }}>
              {language === 'en' 
                ? `Outstanding effort! You watched the video, reviewed the concepts, aced the lab simulation, and passed the quiz!`
                : `சிறந்த முயற்சி! வீடியோ பாடத்தை பார்த்து, விளையாட்டை முடித்து, வினாடி வினாவிலும் வெற்றி பெற்றுள்ளீர்கள்!`}
            </p>

            <div style={{ display: 'flex', gap: '20px', margin: '15px 0' }}>
              <div style={{ background: '#f5f6fa', border: '3px solid var(--color-accent)', padding: '15px 25px', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#f39c12' }}>
                  +{gameStars + bonusStars + 2} ⭐
                </span>
                <span style={{ fontSize: '0.85rem', color: '#7f8c8d', fontWeight: 'bold' }}>
                  {language === 'en' ? 'Stars Earned' : 'பெற்ற நட்சத்திரங்கள்'}
                </span>
              </div>

              <div style={{ background: '#f5f6fa', border: '3px solid #6c5ce7', padding: '15px 25px', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#6c5ce7' }}>
                  +150 XP
                </span>
                <span style={{ fontSize: '0.85rem', color: '#7f8c8d', fontWeight: 'bold' }}>
                  {language === 'en' ? 'XP Points' : 'XP புள்ளிகள்'}
                </span>
              </div>
            </div>

            <button 
              className="btn-playful btn-success animate-bounce-slow"
              onClick={handleFinished}
              style={{ padding: '14px 40px', fontSize: '1.2rem', borderRadius: '20px' }}
            >
              {language === 'en' ? 'Save & Return to Dashboard 🚀' : 'சேமித்து தளத்திற்கு திரும்பு 🚀'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
