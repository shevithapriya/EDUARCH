import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { randomUUID } from 'node:crypto';
import { mkdir, open, rename, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDirectory = path.dirname(fileURLToPath(import.meta.url));
if (!process.env.GEMINI_API_KEY?.trim()) delete process.env.GEMINI_API_KEY;
dotenv.config({ path: path.join(projectDirectory, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const GEMINI_TEXT_MODEL = process.env.GEMINI_MODEL?.trim() || 'gemini-3.8-flash';

// -------------------------------------------------------------
// In-Memory Asynchronous Video Job Queue
// -------------------------------------------------------------
const videoJobs = new Map();
const pendingVideoJobs = [];
const queueLimit = Number.parseInt(process.env.MAX_QUEUED_VIDEO_JOBS, 10);
const timeoutLimit = Number.parseInt(process.env.VIDEO_GENERATION_TIMEOUT_MS, 10);
const MAX_QUEUED_VIDEO_JOBS = Number.isFinite(queueLimit) && queueLimit > 0 ? Math.min(queueLimit, 10) : 3;
const VIDEO_GENERATION_TIMEOUT_MS = Number.isFinite(timeoutLimit) && timeoutLimit > 0
  ? Math.max(timeoutLimit, 60000)
  : 600000;
const VIDEO_MODEL = process.env.VEO_MODEL?.trim() || 'veo-3.1-lite-generate-preview';
const VIDEO_DURATION_SECONDS = 8;
const generatedVideosDirectory = path.join(projectDirectory, 'generated-videos');
let videoWorkerRunning = false;

// Jobs exist only in memory and are lost on server restart; generated MP4 files remain on disk.
app.use('/api/generated-videos', express.static(generatedVideosDirectory, {
  fallthrough: false,
  immutable: true,
  maxAge: '1d'
}));

// Gemini credentials are configured on the server and never accepted from browser requests.
const getApiKey = () => process.env.GEMINI_API_KEY?.trim() || '';
const generateGeminiContent = async (apiKey, input, config = {}) => {
  const ai = new GoogleGenAI({ apiKey });
  const { responseMimeType, maxOutputTokens, ...generationConfig } = config;
  const interaction = await ai.interactions.create({
    model: GEMINI_TEXT_MODEL,
    input,
    generation_config: {
      ...generationConfig,
      ...(maxOutputTokens ? { max_output_tokens: maxOutputTokens } : {})
    },
    ...(responseMimeType
      ? { response_format: { type: 'text', mime_type: responseMimeType } }
      : {}),
    store: false
  });
  if (interaction.status !== 'completed') {
    throw new Error(`Gemini interaction ended with status ${interaction.status}.`);
  }
  return { text: interaction.output_text || '' };
};
const sanitizeProviderError = error => {
  let message = String(error?.message || error || 'Unknown provider error');
  const apiKey = getApiKey();
  if (apiKey) message = message.replaceAll(apiKey, '[redacted]');
  return message.replace(/AIza[0-9A-Za-z_-]{20,}/g, '[redacted]').slice(0, 500);
};

// Detect Tamil script or common Tanglish transliterations
const detectTamilOrTanglish = (text = '') => {
  if (!text) return { isTamil: false, isTanglish: false };
  // Unicode Tamil block
  const hasTamilUnicode = /[\u0B80-\u0BFF]/.test(text);
  if (hasTamilUnicode) return { isTamil: true, isTanglish: false };

  // Common Tanglish keywords used by Tamil students
  const tanglishPatterns = /\b(vanakkam|solunga|sollunga|eppadi|enna|solren|puriyala|puriyavillai|padikkanum|theriyuma|ungalukku|ungaluku|nandri|romba|aamaam|illai|nalla|katrukkol|katrukol)\b/i;
  const isTanglish = tanglishPatterns.test(text);
  return { isTamil: isTanglish, isTanglish };
};

// Detect math calculation query like "25 * 12", "what is 5/8", "25 x 12"
const solveSimpleMath = (text = '') => {
  const cleaned = text.trim().toLowerCase();
  // Pattern: what is 25 * 12, 25 x 12, 25 * 12, 100 / 4, 15 + 35, etc.
  const mathRegex = /(?:what\s+is\s+)?(\d+(?:\.\d+)?)\s*([\+\-\*\/x×÷])\s*(\d+(?:\.\d+)?)/i;
  const match = cleaned.match(mathRegex);
  if (match) {
    const num1 = parseFloat(match[1]);
    let op = match[2];
    const num2 = parseFloat(match[3]);
    let result;
    if (op === '+' ) result = num1 + num2;
    else if (op === '-') result = num1 - num2;
    else if (op === '*' || op === 'x' || op === '×') result = num1 * num2;
    else if (op === '/' || op === '÷') result = num2 !== 0 ? (num1 / num2) : 'undefined (cannot divide by zero)';

    if (result !== undefined) {
      return `${num1} ${op} ${num2} = **${result}**! 🧮 That's a great maths question. Keep calculating!`;
    }
  }

  // Fraction query like "what is 5/8"
  const fractionMatch = cleaned.match(/(?:what\s+is\s+)?(\d+)\s*\/\s*(\d+)/i);
  if (fractionMatch) {
    const num = parseInt(fractionMatch[1], 10);
    const den = parseInt(fractionMatch[2], 10);
    const dec = (num / den).toFixed(3);
    return `${num}/${den} means ${num} parts out of ${den} equal parts of a whole shape! 🍕 In decimals, it equals approximately **${dec}**.`;
  }

  return null;
};

// Detect intent to watch or create a video, or expressing confusion on a topic
const detectVideoIntent = (text = '', topic = '') => {
  const lower = text.toLowerCase();
  const videoKeywords = ['video', 'watch', 'show me', 'animation', 'cartoon', 'visual', 'explain with video', 'create video'];
  const confusionKeywords = ["don't understand", "dont understand", "confused about", "puriyala", "hard to understand", "not getting"];

  const wantsVideo = videoKeywords.some(k => lower.includes(k));
  const isConfused = confusionKeywords.some(k => lower.includes(k));

  if (!wantsVideo && !isConfused) return null;

  // Extract topic from query or fallback to active topic
  let detectedTopic = topic || 'Science';
  const topicRegex = /(?:video (?:about|on|for)|understand|explain)\s+([a-zA-Z\s]{3,30})/i;
  const match = lower.match(topicRegex);
  if (match && match[1]) {
    detectedTopic = match[1].replace(/[?!.]/g, '').trim();
  }

  return {
    type: 'create_video',
    topic: detectedTopic,
    label: wantsVideo ? '🎬 Create Video' : '🎬 Explain with Video'
  };
};

// Rich offline knowledge bank for fast fallback responses (Grade 4-5 friendly)
const OFFLINE_KNOWLEDGE_BASE = [
  {
    keywords: ['photosynthesis', 'plant', 'food'],
    en: "Photosynthesis is the process plants use to make their own food using sunlight, water, and carbon dioxide! 🌱 Green chlorophyll in leaves traps sunlight energy, turning water from roots and air into sweet plant food and releasing fresh oxygen. Think of a plant leaf as a tiny solar-powered kitchen! ☀️",
    ta: "ஒளிச்சேர்க்கை என்பது தாவரங்கள் சூரிய ஒளி, நீர் மற்றும் கார்பன் டை ஆக்சைடைப் பயன்படுத்தி தங்களுக்குத் தேவையான உணவைத் தயாரிக்கும் முறையாகும்! 🌱 இலைகளில் உள்ள பச்சையம் சூரிய ஒளியைப் பிடித்து உணவு தயாரித்து, நாம் சுவாசிக்க ஆக்சிஜனை வெளியிடுகிறது."
  },
  {
    keywords: ['sky', 'blue'],
    en: "The sky looks blue because of Rayleigh scattering! ☁️ Sunlight looks white, but it contains all the colors of the rainbow. Blue light travels in smaller, shorter waves, so when it hits Earth's atmospheric gases, the blue light scatters across the entire sky in every direction! 🌈",
    ta: "சூரிய ஒளியில் வானவில்லின் 7 நிறங்களும் உள்ளன. நீல நிற ஒளி மிகக் குறைந்த அலைநீளம் கொண்டிருப்பதால், பூமியின் வளிமண்டல வாயுக்களால் அனைத்து திசைகளிலும் சிதறடிக்கப்படுகிறது. அதனால்தான் வானம் நீலமாகத் தெரிகிறது! ☁️"
  },
  {
    keywords: ['gravity', 'who discovered', 'fall', 'apple'],
    en: "Gravity is the invisible pulling force that attracts objects toward each other! 🌍 Earth's huge gravity pulls everything toward its center, which is why dropped apples fall down and we stay grounded. It was famously discovered and studied by Sir Isaac Newton when he watched an apple fall from a tree! 🍎",
    ta: "புவியீர்ப்பு என்பது பூமியின் மையத்தை நோக்கி பொருட்களை இழுக்கும் அருவமான விசை ஆகும்! 🌍 ஒரு ஆப்பிள் கீழே விழுவதைக் கண்டு சர் ஐசக் நியூட்டன் புவியீர்ப்பு விசையைக் கண்டறிந்தார். இதனால்தான் நாம் விண்வெளியில் மிதக்காமல் பூமியில் நடக்க முடிகிறது! 🍎"
  },
  {
    keywords: ['noun', 'grammar', 'english'],
    en: "A noun is a naming word! 📚 It is the name of a person, place, animal, or thing. For example: Archie (person/character), School (place), Owl (animal), and Book (thing). Can you spot a noun in your room right now? 🎒",
    ta: "பெயர்ச்சொல் (Noun) என்பது ஒரு நபர், இடம், விலங்கு அல்லது பொருளின் பெயரைக் குறிக்கும் சொல்! 📚 உதாரணம்: பள்ளி (இடம்), ஆர்ச்சி (பெயர்), புத்தகம் (பொருள்)."
  },
  {
    keywords: ['digestive', 'digestion', 'stomach', 'mouth'],
    en: "Digestion is the journey where food is broken down into tiny nutrients that your body can absorb for energy! 🍎 It starts in your mouth with chewing teeth and saliva, moves down the esophagus food pipe into the stomach acid bath, and finishes in the small intestine where nutrients enter your blood! 🥪",
    ta: "செரிமானம் என்பது நாம் உண்ணும் உணவை உடல் உறிஞ்சும் ஊட்டச்சத்துகளாக மாற்றும் செயல்முறை ஆகும்! 🍎 இது வாயில் தொடங்கி, உணவுக்குழாய் வழியாக வயிற்றை அடைந்து, சிறுகுடலில் சத்துக்களை ரத்தத்தில் சேர்க்கிறது."
  },
  {
    keywords: ['skeleton', 'bone', 'muscle'],
    en: "Your skeleton is made of 206 hard bones that give your body structure and protect organs like your brain (skull) and heart (ribcage)! 💀 Muscles work in antagonistic pairs like biceps and triceps to pull bones and help you jump, dance, and run! 💪",
    ta: "நமது எலும்புக்கூடு 206 எலும்புகளால் ஆனது. இது உடலுக்கு வடிவம் தந்து, மூளை மற்றும் இதயத்தைப் பாதுகாக்கிறது! 💀 தசைகள் எலும்புகளை இழுத்து நாம் நடக்க, ஓட உதவுகின்றன! 💪"
  },
  {
    keywords: ['fraction', 'equivalent'],
    en: "A fraction shows equal parts of a whole! 🍕 The top number is the numerator (parts chosen), and the bottom number is the denominator (total equal parts). For example, 1/2 of a pizza means 1 slice out of 2 equal slices! 1/2 is also equal to 2/4. 🍕",
    ta: "பின்னம் என்பது ஒரு முழுப் பொருளின் சமமான பகுதியைக் குறிக்கும்! 🍕 மேல் உள்ள எண் தொகுதி (எடுத்த பங்கு), கீழ் உள்ள எண் பகுதி (மொத்த பங்குகள்). 1/2 என்பது இரண்டு சம பங்குகளில் ஒரு பங்கு ஆகும்!"
  }
];

const matchOfflineKnowledge = (message = '', lang = 'en') => {
  const lower = message.toLowerCase();
  for (const item of OFFLINE_KNOWLEDGE_BASE) {
    if (item.keywords.some(k => lower.includes(k))) {
      return lang === 'ta' ? item.ta : item.en;
    }
  }
  return null;
};

// Optimized system prompt for fast, engaging, bilingual Archie
const createSystemPrompt = ({ grade = 4, subject = 'science', lesson = '', topic = '', language = 'en' }) => {
  const langLabel = language === 'ta' ? 'Tamil' : 'English';
  return `You are "Archie the Owl", an energetic, encouraging, and friendly AI learning companion for CBSE Grade ${grade} students (age 9-11) on the EduArch platform.

Key Guidelines:
1. Subject Context: Currently exploring ${subject} (Unit: "${lesson || 'Curriculum'}", Topic: "${topic || 'General Science & Maths'}").
2. GENERAL KNOWLEDGE: You answer ANY reasonable educational question the student asks—maths, science, language, facts, or curious questions. Never refuse to answer because it's not the active lesson.
3. LANGUAGE: Language mode is "${langLabel}".
   - If asked in Tamil or Tanglish, reply in warm, simple, natural Tamil suitable for a 9-year-old child.
   - If asked in English, reply in simple, clear English.
4. TONE & LENGTH:
   - Keep replies concise (2-4 sentences for simple questions).
   - For complex questions or maths calculations, explain step-by-step with a friendly example.
   - Use simple real-world analogies children love (pizza slices, toy cars, solar factories, superheroes).
   - Use emojis sparingly and warmly (🦉, 🌱, ✨, 🍕, 🚀).
5. ENGAGEMENT:
   - When appropriate, add a quick engaging mini-question, fun fact, or check ("Quick check: What gives plants energy?"). Do not force it if unnatural.
   - If the student asks for a video or expresses confusion ("I don't understand fractions", "show me a video"), affirmatively offer: "I can create an animated learning video about this for you!"
6. SAFETY & PERSONA:
   - Never say "I am an AI model" or "I am trained to". Simply be Archie the friendly owl.
   - Never tell the student to enter an API key.`;
};

// Safe fallback answer when API key is missing or model fails
const getFriendlyFallbackAnswer = ({ language = 'en', message = '' }) => {
  const mathAnswer = solveSimpleMath(message);
  if (mathAnswer) return mathAnswer;

  const offline = matchOfflineKnowledge(message, language);
  if (offline) return offline;

  if (language === 'ta') {
    return "சிறப்பான கேள்வி! 🦉 தாவரங்கள், மனித உடல், விண்வெளி மற்றும் கணிதக் கேள்விகளை என்னிடம் கேட்கலாம். நான் எப்போதும் உதவத் தயார்! 🌱";
  }
  return "That's a wonderful curiosity question! 🦉 As your learning buddy, I love exploring science, maths, and the world with you. What would you like to explore next? ✨";
};

// -------------------------------------------------------------
// 1. IMPROVED ARCHIE AI CHATBOT (/api/chat)
// -------------------------------------------------------------
app.post('/api/chat', async (req, res) => {
  const {
    message = '',
    chatHistory = [],
    grade = 4,
    subject = 'science',
    lesson = '',
    topic = '',
    language = 'en'
  } = req.body || {};

  const apiKey = getApiKey();
  const langDetection = detectTamilOrTanglish(message);
  const userLanguage = langDetection.isTamil ? 'ta' : language;

  // Check for video creation action intent
  const videoAction = detectVideoIntent(message, topic);

  // Check fast local math solver for instant calculation response
  const directMath = solveSimpleMath(message);
  if (directMath && !videoAction) {
    return res.json({
      text: directMath,
      source: 'solver',
      action: null
    });
  }

  // If no Gemini key available, provide high-quality fallback immediately
  if (!apiKey) {
    const text = getFriendlyFallbackAnswer({ language: userLanguage, message });
    return res.json({
      text,
      source: 'offline_knowledge',
      action: videoAction
    });
  }

  try {
    const systemInstruction = createSystemPrompt({
      grade,
      subject,
      lesson,
      topic,
      language: userLanguage
    });

    // Limit conversation history to the most recent 6 messages to reduce latency and token usage
    const recentHistory = (Array.isArray(chatHistory) ? chatHistory : [])
      .slice(-6)
      .map(item => {
        const role = (item.sender === 'archie' || item.sender === 'ai') ? 'Archie' : 'Student';
        return `${role}: ${item.text}`;
      })
      .join('\n');

    const prompt = `${systemInstruction}\n\nRecent Conversation:\n${recentHistory}\n\nStudent: ${message}\nArchie:`;

    const result = await generateGeminiContent(apiKey, prompt, {
      temperature: 0.6,
      maxOutputTokens: 350
    });

    const reply = result?.text;
    if (!reply || !reply.trim()) {
      return res.json({
        text: getFriendlyFallbackAnswer({ language: userLanguage, message }),
        source: 'fallback',
        action: videoAction
      });
    }

    return res.json({
      text: reply.trim(),
      source: 'gemini',
      action: videoAction
    });
  } catch (error) {
    console.error('Chat generation error:', sanitizeProviderError(error));
    return res.json({
      text: getFriendlyFallbackAnswer({ language: userLanguage, message }),
      source: 'fallback',
      action: videoAction
    });
  }
});

// Generate a structured lesson plan to guide one short cartoon video clip.
const createVideoPrompt = ({ topic, grade, subject, language, duration = '60 seconds' }) => {
  return `Create an accurate, age-appropriate storyboard for an EduArch CBSE Grade ${grade} lesson (children aged 9-11).

Topic: ${topic}
Subject: ${subject}
Language: ${language === 'ta' ? 'Tamil' : 'English'}
Requested lesson length: ${duration}. The Veo clip itself is one short 8-second excerpt, not the full storyboard.
Use simple, factual language. Avoid frightening or unrelated content. Write all lesson text in the selected language.

Respond ONLY with valid JSON (no markdown):
{
  "title": "Short lesson title",
  "grade": ${grade},
  "subject": "${subject}",
  "topic": "${topic}",
  "language": "${language}",
  "learningObjectives": ["Two or three clear objectives"],
  "introduction": "Short introduction",
  "theme": "${subject.toLowerCase().includes('math') ? 'maths' : 'science'}",
  "background": "nature" or "lab" or "space" or "microscope",
  "scenes": [
    {
      "sceneNumber": 1,
      "time": 0,
      "heading": "Introduction",
      "visualDescription": "High-definition realistic documentary footage showing...",
      "narration": "Archie explains the opening phenomenon with clear science",
      "characterPose": "presenting",
      "actor": "microscope",
      "caption": "Accurate scientific subtitle"
    },
    {
      "sceneNumber": 2,
      "time": 12,
      "heading": "The Mechanism",
      "visualDescription": "Detailed realistic 3D scientific diagram of...",
      "narration": "Clear explanation of how the mechanism works",
      "characterPose": "explaining",
      "actor": "cellular_view",
      "caption": "Accurate scientific subtitle"
    },
    {
      "sceneNumber": 3,
      "time": 24,
      "heading": "Visual Breakdown",
      "visualDescription": "Photorealistic cross-section showing...",
      "narration": "Detailed scientific walkthrough of the process",
      "characterPose": "pointing",
      "actor": "chemical_reaction",
      "caption": "Accurate scientific subtitle"
    },
    {
      "sceneNumber": 4,
      "time": 38,
      "heading": "Real-World Evidence",
      "visualDescription": "Real-world footage demonstrating the concept...",
      "narration": "Concrete everyday example children can relate to",
      "characterPose": "demonstrating",
      "actor": "nature_observation",
      "caption": "Accurate scientific subtitle"
    },
    {
      "sceneNumber": 5,
      "time": 50,
      "heading": "Scientific Summary",
      "visualDescription": "Comprehensive scientific overview diagram...",
      "narration": "Summary of key learning points",
      "characterPose": "recap",
      "actor": "summary_diagram",
      "caption": "Accurate scientific subtitle"
    }
  ],
  "realLifeExamples": ["One or two examples related to the lesson"],
  "recap": "A short recap",
  "quiz": [
    {
      "question": "Lesson question",
      "options": ["Correct answer", "Plausible wrong answer", "Plausible wrong answer"],
      "answer": 0,
      "explanation": "Simple explanation"
    },
    {
      "question": "Another lesson question",
      "options": ["Plausible wrong answer", "Correct answer", "Plausible wrong answer"],
      "answer": 1,
      "explanation": "Simple explanation"
    },
    {
      "question": "A final lesson question",
      "options": ["Plausible wrong answer", "Plausible wrong answer", "Correct answer"],
      "answer": 2,
      "explanation": "Simple explanation"
    }
  ],
  "checkpoint": {
    "question": "A clear, realistic conceptual question based directly on the video",
    "options": ["Correct Answer", "Plausible Distractor 1", "Plausible Distractor 2"],
    "answer": 0,
    "explanation": "Scientifically accurate explanation of why this answer is correct"
  }
}`;
};

// Safe lesson content used when Gemini returns malformed or incomplete storyboard JSON.
const generateFallbackStoryboard = ({ topic, grade, subject, language }) => {
  const isTa = language === 'ta';
  return {
    title: isTa ? `🦉 ஆர்ச்சியின் ${topic} சாகசம்!` : `🦉 Archie's ${topic} Adventure!`,
    grade,
    subject,
    topic,
    language,
    learningObjectives: isTa
      ? [`${topic} பற்றிய அடிப்படை கருத்தைப் புரிந்துகொள்.`, 'அதை ஒரு எளிய உதாரணத்துடன் இணைத்துப் பார்.']
      : [`Understand the basic idea of ${topic}.`, 'Connect it to a simple everyday example.'],
    introduction: isTa
      ? `இன்று நாம் ${topic} பற்றி எளிதாகக் கற்றுக்கொள்வோம்.`
      : `Today we will explore ${topic} in a simple, friendly way.`,
    theme: subject.toLowerCase().includes('math') ? 'maths' : 'science',
    background: 'nature',
    durationSeconds: 60,
    scenes: [
      {
        sceneNumber: 1,
        time: 0,
        heading: isTa ? "அறிமுகம்" : "Introduction",
        visualDescription: `Archie the Owl flies in holding a magnifying glass to explore ${topic}.`,
        narration: isTa 
          ? `வணக்கம் நண்பா! நான் ஆர்ச்சி. இன்று நாம் ${topic} பற்றி ஒரு அற்புதமான விஷயம் கற்றுக்கொள்ளப் போகிறோம்!` 
          : `Hello explorers! I'm Archie the Owl. Today we are embarking on a journey to discover ${topic}!`,
        characterPose: "waving",
        actor: "telescope",
        caption: isTa ? `கற்கலாம்: ${topic}` : `Let's Explore: ${topic}`
      },
      {
        sceneNumber: 2,
        time: 12,
        heading: isTa ? "முக்கிய கருத்து" : "Core Concept",
        visualDescription: `A dynamic visual breakdown illustrating the fundamentals of ${topic}.`,
        narration: isTa
          ? `${topic} என்பது நமது அன்றாட வாழ்க்கையில் மிக முக்கியமான ஒரு அறிவியல்/கணித உண்மை ஆகும்.`
          : `${topic} is a super important concept that shapes the world all around us every single day!`,
        characterPose: "pointing",
        actor: "diagram",
        caption: isTa ? "கருத்து விளக்கம்" : "Understanding the Concept"
      },
      {
        sceneNumber: 3,
        time: 24,
        heading: isTa ? "காட்சி விளக்கம்" : "Visualizing It",
        visualDescription: `Step-by-step animated animation displaying how ${topic} operates.`,
        narration: isTa
          ? "இங்கே பாருங்கள்! ஒவ்வொன்றாக படிப்படியாக எவ்வாறு இது செயல்படுகிறது என்பதை கவனிப்போம்."
          : "Look closely right here! Watch how each part connects together like pieces of a puzzle.",
        characterPose: "pointing",
        actor: "atom",
        caption: isTa ? "செயல்முறை" : "How It Works"
      },
      {
        sceneNumber: 4,
        time: 38,
        heading: isTa ? "நிஜ வாழ்க்கை உதாரணம்" : "Real-World Example",
        visualDescription: `A practical everyday life demonstration of ${topic}.`,
        narration: isTa
          ? "நமது அன்றாட வாழ்வில் இதனை எளிதாக நாம் காண முடிகிறது!"
          : "You can see this happening in nature, at home, and in our everyday lives!",
        characterPose: "celebrating",
        actor: "apple_tree",
        caption: isTa ? "நிஜ வாழ்க்கை உதாரணம்" : "Real-Life Example"
      },
      {
        sceneNumber: 5,
        time: 50,
        heading: isTa ? "முடிவுரை" : "Summary",
        visualDescription: `Archie summarizes key learning points with sparkles.`,
        narration: isTa
          ? "அருமை! இன்று நாம் புதிய பல விஷயங்களைக் கற்றுக்கொண்டோம். இப்போது ஒரு சிறிய கேள்வி!"
          : "Awesome job! We mastered the big ideas today. Now get ready for a fun quick check!",
        characterPose: "waving",
        actor: "badge",
        caption: isTa ? "நினைவில் கொள்க!" : "Key Takeaway!"
      }
    ],
    realLifeExamples: isTa
      ? [`நமது அன்றாட வாழ்க்கையில் ${topic} தொடர்பான உதாரணங்களைக் கவனிப்போம்.`]
      : [`Look for examples of ${topic} in everyday life.`],
    recap: isTa
      ? `${topic} பற்றிய முக்கிய கருத்தை நினைவில் கொண்டு, அதைச் சுற்றியுள்ள உலகில் கவனிப்போம்.`
      : `Remember the main idea of ${topic} and look for it in the world around you.`,
    quiz: isTa
      ? [
          { question: `${topic} பற்றி கற்கும்போது எது உதவும்?`, options: ['கவனித்து கேள்வி கேட்பது', 'எதையும் பார்க்காமல் இருப்பது', 'பயிற்சி செய்யாமல் இருப்பது'], answer: 0, explanation: 'கவனிப்பதும் கேள்வி கேட்பதும் புதிய கருத்துகளைப் புரிந்துகொள்ள உதவும்.' },
          { question: 'ஆர்ச்சி என்ன செய்கிறார்?', options: ['பாடத்தை விளக்குகிறார்', 'பாடத்தை மறைக்கிறார்', 'கேள்விகளைத் தவிர்க்கிறார்'], answer: 0, explanation: 'ஆர்ச்சி பாடத்தை எளிதாக விளக்குகிறார்.' },
          { question: 'ஒரு புதிய கருத்தைப் புரிந்துகொள்ள எது சிறந்தது?', options: ['உதாரணத்துடன் பயிற்சி செய்வது', 'முயற்சியை நிறுத்துவது', 'கேள்விகளைத் தவிர்ப்பது'], answer: 0, explanation: 'எளிய உதாரணமும் பயிற்சியும் கற்றலை வலுப்படுத்தும்.' }
        ]
      : [
          { question: `What helps us learn about ${topic}?`, options: ['Observing and asking questions', 'Ignoring examples', 'Avoiding practice'], answer: 0, explanation: 'Observing and asking questions helps us understand new ideas.' },
          { question: 'What does Archie do?', options: ['Explains the lesson', 'Hides the lesson', 'Avoids questions'], answer: 0, explanation: 'Archie guides us through the lesson.' },
          { question: 'What is a helpful way to understand a new idea?', options: ['Practise with an example', 'Stop trying', 'Avoid questions'], answer: 0, explanation: 'Examples and practice help make learning clear.' }
        ],
    checkpoint: {
      question: isTa 
        ? `${topic} பற்றிய முக்கிய கருத்து என்ன?`
        : `What is the most important takeaway about ${topic}?`,
      options: [
        isTa ? "இது இயற்கையின் ஒரு முக்கிய விதியாகும்" : "It helps us understand nature and science accurately",
        isTa ? "இது எந்த பயனும் இல்லாதது" : "It has no practical use in daily life",
        isTa ? "இது மனிதனால் உருவாக்க முடியாதது" : "It only exists in outer space"
      ],
      answer: 0,
      explanation: isTa
        ? "அருமை! நீங்கள் சரியாகக் கூறினீர்கள்! 🌟"
        : "Excellent! 🌟 You got it! Understanding this concept helps us learn how the world works."
    }
  };
};

const isValidQuestion = (question) => (
  question
  && typeof question.question === 'string'
  && question.question.trim()
  && Array.isArray(question.options)
  && question.options.length >= 2
  && question.options.every(option => typeof option === 'string' && option.trim())
  && Number.isInteger(question.answer)
  && question.answer >= 0
  && question.answer < question.options.length
  && typeof question.explanation === 'string'
  && question.explanation.trim()
);

const isValidStoryboard = (storyboard) => (
  storyboard
  && typeof storyboard.title === 'string'
  && storyboard.title.trim()
  && Array.isArray(storyboard.learningObjectives)
  && storyboard.learningObjectives.length >= 1
  && typeof storyboard.introduction === 'string'
  && storyboard.introduction.trim()
  && Array.isArray(storyboard.scenes)
  && storyboard.scenes.length >= 1
  && storyboard.scenes.every(scene => (
    scene
    && typeof scene.heading === 'string'
    && scene.heading.trim()
    && typeof scene.visualDescription === 'string'
    && scene.visualDescription.trim()
    && typeof scene.narration === 'string'
    && scene.narration.trim()
    && typeof scene.caption === 'string'
    && scene.caption.trim()
  ))
  && Array.isArray(storyboard.realLifeExamples)
  && storyboard.realLifeExamples.length >= 1
  && typeof storyboard.recap === 'string'
  && storyboard.recap.trim()
  && Array.isArray(storyboard.quiz)
  && storyboard.quiz.length >= 3
  && storyboard.quiz.length <= 5
  && storyboard.quiz.every(isValidQuestion)
  && isValidQuestion(storyboard.checkpoint)
);

const describeVideoFailure = (error) => {
  const message = sanitizeProviderError(error);
  if (/storyboard generation failed/i.test(message)) {
    const detail = message.replace(/^Storyboard generation failed:\s*/i, '');
    if (/project has been denied access|permission_denied/i.test(detail)) {
      return `Google denied Gemini API access to this project (HTTP 403). The server loaded its key, but project access is blocked. Check the project's Gemini API access and key restrictions, then contact Google support if access remains denied.`;
    }
    if (/api.?key.*(invalid|not valid|missing)|invalid api key|unauthenticated/i.test(detail)) {
      return 'Gemini rejected the server API key. Verify the key in the project .env file and confirm it is enabled for the Gemini API.';
    }
    if (/api.?key|unauthenticated|permission_denied|403/i.test(detail)) {
      return `Gemini denied access to the configured text model "${GEMINI_TEXT_MODEL}" (HTTP 403). Check this Google project’s Gemini API and model permissions.`;
    }
    if (/resource_exhausted|quota|billing|429/i.test(detail)) {
      return 'Gemini text-generation quota or billing limit was reached. Check the account usage and billing settings.';
    }
    if (/model.*(not found|unsupported)|not found.*model|404/i.test(detail)) {
      return `The Gemini text model "${GEMINI_TEXT_MODEL}" is unavailable to this account. Check GEMINI_MODEL and account access.`;
    }
    if (/fetch failed|network|ECONN|ENOTFOUND|ETIMEDOUT/i.test(detail)) {
      return 'Could not connect to the Gemini API while creating the lesson outline. Check the server network connection and retry.';
    }
    return `Could not create the lesson outline with ${GEMINI_TEXT_MODEL}: ${detail}`;
  }
  if (/api.?key|unauthenticated|permission_denied|403/i.test(message)) {
    return 'Video generation is unavailable. Check the server GEMINI_API_KEY and confirm that this account can use the configured Veo model.';
  }
  if (/resource_exhausted|quota|billing|429/i.test(message)) {
    return 'The video provider quota or billing limit was reached. Check the account quota and billing settings before trying again.';
  }
  if (/timed out|timeout/i.test(message)) {
    return 'Video generation took too long and was stopped. Check the provider status before starting another generation.';
  }
  if (/model.*(not found|unsupported)|not found.*model|404/i.test(message)) {
    return 'The configured Veo model is unavailable to this account. Check VEO_MODEL and the account’s model access.';
  }
  return 'Video generation failed before a playable video could be saved. Please check the server logs and try again.';
};

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

const removeTemporaryVideo = async filePath => {
  try {
    await unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Could not remove temporary generated video:', error.message);
    }
  }
};

const buildVeoPrompt = ({ topic, grade, subject, language, storyboard }) => {
  const keyScenes = storyboard.scenes.slice(0, 3).map(scene => (
    `${scene.heading}: ${scene.visualDescription}. Narration idea: ${scene.narration}`
  )).join('\n');
  return `Create one short 8-second educational video clip for CBSE Grade ${grade} students (ages 9-11).
Subject: ${subject}. Lesson: ${topic}.
Visual style: polished, colorful 3D cartoon animation, gentle motion, smooth transitions, safe and positive for children.
Show a friendly recurring owl teacher named Archie clearly demonstrating one important visual concept from the lesson. Keep the science or maths visually accurate. No frightening imagery, no unrelated stock footage, and no text or labels embedded in frames.
Selected lesson language: ${language === 'ta' ? 'Tamil' : 'English'}. ${language === 'en' ? 'Use brief, clear English spoken narration if audio is generated.' : 'Do not generate speech; Tamil narration is shown separately in the lesson text.'}
This is a single short excerpt inspired by these storyboard details, not a complete rendering of every scene:
${keyScenes}`;
};

// Asynchronous Video Job Worker
async function processVideoJob(jobId, { topic, grade, subject, language, duration }) {
  const job = videoJobs.get(jobId);
  if (!job) return;
  const temporaryFile = path.join(generatedVideosDirectory, `${jobId}.partial.mp4`);
  const outputFileName = `${jobId}.mp4`;
  const outputFile = path.join(generatedVideosDirectory, outputFileName);

  try {
    job.status = 'processing';
    job.progress = 10;
    job.statusMessage = language === 'ta' ? 'பாடத் திட்டம் தயாராகிறது...' : 'Preparing the lesson storyboard...';

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured on the server.');
    let storyboard = null;

    const prompt = createVideoPrompt({ topic, grade, subject, language, duration });
    let result;
    try {
      result = await generateGeminiContent(apiKey, prompt, {
        responseMimeType: 'application/json',
        temperature: 0.4,
        maxOutputTokens: 2500
      });
    } catch (error) {
      throw new Error(`Storyboard generation failed: ${sanitizeProviderError(error)}`);
    }

    const raw = result?.text || '';
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      const parsed = JSON.parse(cleaned);
      if (isValidStoryboard(parsed)) storyboard = parsed;
    } catch (parseError) {
      console.warn(`Storyboard JSON was invalid for ${jobId}; using a safe lesson template: ${parseError.message}`);
    }
    if (!storyboard) {
      console.warn(`Storyboard structure was incomplete for ${jobId}; using a safe lesson template.`);
    }

    if (!storyboard) {
      storyboard = generateFallbackStoryboard({ topic, grade, subject, language });
    }

    job.progress = 25;
    job.statusMessage = language === 'ta' ? 'கார்ட்டூன் காட்சி உருவாக்கப்படுகிறது...' : 'Generating the short cartoon lesson clip...';
    job.storyboard = storyboard;
    job.title = storyboard.title;
    job.checkpoint = storyboard.checkpoint;
    job.scenes = storyboard.scenes;

    await mkdir(generatedVideosDirectory, { recursive: true });
    const ai = new GoogleGenAI({ apiKey });
    let operation = await ai.models.generateVideos({
      model: VIDEO_MODEL,
      prompt: buildVeoPrompt({ topic, grade, subject, language, storyboard }),
      config: {
        numberOfVideos: 1,
        durationSeconds: VIDEO_DURATION_SECONDS,
        aspectRatio: '16:9',
        resolution: '720p',
        generateAudio: language === 'en',
        negativePrompt: 'frightening, unsafe, unrelated stock footage, misspelled text, embedded labels'
      }
    });

    const startedAt = Date.now();
    while (!operation.done) {
      if (Date.now() - startedAt >= VIDEO_GENERATION_TIMEOUT_MS) {
        throw new Error('Video generation timed out while waiting for the configured Veo model.');
      }
      await sleep(10000);
      operation = await ai.operations.getVideosOperation({ operation });
      job.progress = Math.min(85, job.progress + 5);
      job.statusMessage = language === 'ta' ? 'வீடியோ காட்சி இன்னும் உருவாகிறது...' : 'The video clip is still being generated...';
    }

    if (operation.error) {
      throw new Error(String(operation.error.message || JSON.stringify(operation.error)));
    }

    const generatedVideo = operation.response?.generatedVideos?.[0]?.video;
    if (!generatedVideo) {
      throw new Error('The Veo operation completed without returning a video file.');
    }

    job.progress = 90;
    job.statusMessage = language === 'ta' ? 'வீடியோ கோப்பு சேமிக்கப்படுகிறது...' : 'Saving the generated MP4...';
    await ai.files.download({ file: generatedVideo, downloadPath: temporaryFile });

    const fileHandle = await open(temporaryFile, 'r');
    let header;
    try {
      header = Buffer.alloc(12);
      await fileHandle.read(header, 0, header.length, 0);
    } finally {
      await fileHandle.close();
    }
    const { size } = await stat(temporaryFile);
    if (size <= 0 || header.toString('ascii', 4, 8) !== 'ftyp') {
      throw new Error('The downloaded output is empty or is not a valid MP4 file.');
    }

    await rename(temporaryFile, outputFile);
    const savedVideo = await stat(outputFile);
    if (savedVideo.size <= 0) {
      throw new Error('The generated video file was not saved correctly.');
    }

    job.status = 'completed';
    job.progress = 100;
    job.videoUrl = `/api/generated-videos/${outputFileName}`;
    job.videoDurationSeconds = VIDEO_DURATION_SECONDS;
    job.statusMessage = language === 'ta' ? 'உங்கள் உண்மையான AI வீடியோ தயார்!' : 'Your AI-generated video is ready!';
    job.completedAt = Date.now();
  } catch (err) {
    const logMessage = String(err?.message || err).replace(process.env.GEMINI_API_KEY || '\0', '[redacted]');
    console.error(`Video generation job ${jobId} failed: ${logMessage}`);
    job.status = 'failed';
    job.progress = 0;
    job.error = describeVideoFailure(err);
    job.statusMessage = language === 'ta' ? 'வீடியோ உருவாக்க முடியவில்லை.' : 'The video could not be generated.';
    await removeTemporaryVideo(temporaryFile);
    await removeTemporaryVideo(outputFile);
  }
}

const runNextVideoJob = () => {
  if (videoWorkerRunning || pendingVideoJobs.length === 0) return;
  const jobId = pendingVideoJobs.shift();
  videoWorkerRunning = true;
  processVideoJob(jobId, videoJobs.get(jobId))
    .finally(() => {
      videoWorkerRunning = false;
      runNextVideoJob();
    });
};

// POST /api/generate-video (Asynchronous Video Generation Starter)
app.post('/api/generate-video', async (req, res) => {
  const body = req.body || {};
  const { topic, subject = 'Science', language = 'en' } = body;
  const grade = body.grade ?? 4;

  if (typeof topic !== 'string' || !topic.trim() || topic.trim().length > 160) {
    return res.status(400).json({ error: 'Enter a lesson topic of 1 to 160 characters.' });
  }
  if (![4, 5].includes(Number(grade))) {
    return res.status(400).json({ error: 'Grade must be 4 or 5.' });
  }
  const normalizedSubject = typeof subject === 'string' && /^math/i.test(subject)
    ? 'Mathematics'
    : typeof subject === 'string' && /^science$/i.test(subject)
      ? 'Science'
      : null;
  if (!normalizedSubject) {
    return res.status(400).json({ error: 'Subject must be Science or Mathematics.' });
  }
  if (!['en', 'ta'].includes(language)) {
    return res.status(400).json({ error: 'Language must be en or ta.' });
  }
  if (!process.env.GEMINI_API_KEY?.trim()) {
    return res.status(503).json({
      error: 'The backend did not load GEMINI_API_KEY. Add it to the project .env file and restart the backend. This is a missing-key error; Veo account access is checked only after a key is loaded.'
    });
  }
  if (pendingVideoJobs.length >= MAX_QUEUED_VIDEO_JOBS) {
    return res.status(429).json({ error: 'The video queue is full. Please wait for a current lesson video to finish.' });
  }

  const jobId = `job_${randomUUID()}`;
  const newJob = {
    id: jobId,
    status: 'queued',
    progress: 0,
    statusMessage: language === 'ta' ? 'வீடியோ பணி வரிசையில் சேர்க்கப்பட்டது...' : 'Video job queued...',
    topic: topic.trim(),
    grade: Number(grade),
    subject: normalizedSubject,
    language,
    duration: '8 seconds',
    createdAt: Date.now()
  };

  videoJobs.set(jobId, newJob);
  pendingVideoJobs.push(jobId);
  setImmediate(runNextVideoJob);

  return res.json({
    jobId,
    status: 'queued',
    message: 'Video generation started in the background. One short 8-second clip will be generated.'
  });
});

// GET /api/video-status/:jobId (Polling Endpoint)
app.get('/api/video-status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = videoJobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Video job not found.' });
  }

  return res.json({
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    statusMessage: job.statusMessage,
    videoUrl: job.videoUrl || null,
    title: job.title || null,
    checkpoint: job.checkpoint || null,
    scenes: job.scenes || [],
    storyboard: job.storyboard || null,
    videoDurationSeconds: job.videoDurationSeconds || null,
    error: job.error || null
  });
});

// -------------------------------------------------------------
// 3. EXISTING PRESERVED ENDPOINTS & SCRIPTS (DO NOT REMOVE)
// -------------------------------------------------------------
const PREBUILT_CARTOON_SCRIPTS = {
  DigestJourney: {
    title: "🦉 Archie's Digestive Submarine Adventure!",
    theme: "biology",
    background: "inner_body",
    duration: 36,
    scenes: [
      {
        time: 0,
        character: "Archie",
        pose: "waving",
        dialogue: "Ahoy explorer! I'm Archie. Today we shrink down into our magic submarine and travel down the human digestive track!",
        actor: "submarine",
        bg: "mouth_room",
        sound: "whoosh"
      },
      {
        time: 8,
        character: "Chompy Teeth",
        pose: "chewing",
        dialogue: "First stop: The Mouth! Chompy the Teeth chew food, while salivary enzymes dissolve starches into sweet glucose!",
        actor: "teeth",
        bg: "mouth_room",
        sound: "chomp"
      },
      {
        time: 16,
        character: "Archie",
        pose: "pointing",
        dialogue: "Whoosh! Down the Esophagus food pipe via peristaltic wave squeezing! Hang on tight!",
        actor: "esophagus_wave",
        bg: "esophagus",
        sound: "slide"
      },
      {
        time: 24,
        character: "Stomach Monster",
        pose: "splashing",
        dialogue: "Splash! Inside the churning Stomach bag! Hydrochloric acid churns everything into a warm liquid soup called chyme!",
        actor: "stomach_acid",
        bg: "stomach",
        sound: "bubble"
      },
      {
        time: 30,
        character: "Villi Friends",
        pose: "absorbing",
        dialogue: "In the 6-meter Small Intestine, millions of tiny finger-like villi absorb all nutrients into the pulsing blood stream!",
        actor: "villi",
        bg: "intestine",
        sound: "magic"
      }
    ],
    checkpoint: {
      time: 18,
      question: "What wave-like muscle movement pushes food down the food pipe?",
      options: ["Peristalsis", "Photosynthesis", "Circulation"],
      answer: 0,
      explanation: "Super! Peristalsis is the rhythmic muscle wave that squeezes food downward!"
    }
  },
  PizzaChef: {
    title: "🍕 Chef Archie's Magic Fraction Bakery!",
    theme: "maths",
    background: "kitchen",
    duration: 34,
    scenes: [
      {
        time: 0,
        character: "Chef Archie",
        pose: "cooking",
        dialogue: "Welcome to my Pizza Kitchen! Today we're learning fractions by baking delicious cheesy pizzas!",
        actor: "pizza_dough",
        bg: "kitchen",
        sound: "tada"
      },
      {
        time: 8,
        character: "Chef Archie",
        pose: "cutting",
        dialogue: "Here is 1 whole pizza! Watch my rolling cutter cut it down the center into 2 equal halves. Each slice is 1/2!",
        actor: "half_slice",
        bg: "kitchen",
        sound: "slice"
      },
      {
        time: 16,
        character: "Chef Archie",
        pose: "pointing",
        dialogue: "Now another slice! 4 equal slices! 1 slice is 1/4 (one-fourth). Notice that 2 slices of 1/4 equal 1/2 of the pizza!",
        actor: "quarter_slice",
        bg: "kitchen",
        sound: "pop"
      },
      {
        time: 26,
        character: "Chef Archie",
        pose: "celebrating",
        dialogue: "Remember: The top number is Numerator (parts we eat), and bottom is Denominator (total equal slices)!",
        actor: "fraction_card",
        bg: "kitchen",
        sound: "sparkle"
      }
    ],
    checkpoint: {
      time: 18,
      question: "If a pizza has 4 equal slices and you eat 1 slice, what fraction did you eat?",
      options: ["1/2", "1/4", "3/4"],
      answer: 1,
      explanation: "Exactly! 1 slice out of 4 total slices is 1/4!"
    }
  },
  SkeletonPuzzle: {
    title: "💀 Bony the Skeleton's Breakdance Academy!",
    theme: "anatomy",
    background: "lab",
    duration: 34,
    scenes: [
      {
        time: 0,
        character: "Archie",
        pose: "waving",
        dialogue: "Meet my buddy Bony! You have 206 hard bones in your body that give you shape and protect delicate organs!",
        actor: "skeleton",
        bg: "lab",
        sound: "bones"
      },
      {
        time: 8,
        character: "Archie",
        pose: "pointing",
        dialogue: "Look at your hard Skull helmet—it protects your soft thinking brain from bumps!",
        actor: "skull",
        bg: "lab",
        sound: "knock"
      },
      {
        time: 16,
        character: "Archie",
        pose: "dancing",
        dialogue: "The Ribcage protects your beating heart and breathing lungs! While your Spine backbone lets you bend and jump!",
        actor: "ribcage",
        bg: "lab",
        sound: "heartbeat"
      },
      {
        time: 25,
        character: "Archie",
        pose: "flexing",
        dialogue: "Bones can only move with muscles! Muscles can ONLY PULL, never push—working in pairs like Biceps and Triceps!",
        actor: "muscle_pair",
        bg: "lab",
        sound: "power"
      }
    ],
    checkpoint: {
      time: 18,
      question: "Which skeletal structure acts like a helmet to protect your brain?",
      options: ["Ribcage", "The Skull", "The Spine"],
      answer: 1,
      explanation: "Spot on! The cranium skull protects your brain!"
    }
  }
};

// POST /api/generate-cartoon-video (Preserved)
app.post('/api/generate-cartoon-video', async (req, res) => {
  const { prompt = '', topic = 'DigestJourney', grade = 4, language = 'en' } = req.body || {};
  const apiKey = getApiKey();

  if (!prompt && PREBUILT_CARTOON_SCRIPTS[topic]) {
    return res.json({ script: PREBUILT_CARTOON_SCRIPTS[topic], source: 'prebuilt' });
  }

  if (!apiKey) {
    const fallbackScript = PREBUILT_CARTOON_SCRIPTS[topic] || PREBUILT_CARTOON_SCRIPTS.DigestJourney;
    return res.json({ script: fallbackScript, source: 'fallback' });
  }

  try {
    const aiPrompt = `You are the Lead Cartoon Animation Director for Eduarch, an educational cartoon platform for CBSE Grade ${grade} kids (age 9-11).
Create a complete animated cartoon video screenplay for: "${prompt || topic}".
Language: ${language === 'ta' ? 'Tamil' : 'English'}.
The main host must be "Archie the Owl".

Respond ONLY with valid JSON (no markdown formatting, no backticks, no extra text):
{
  "title": "Short catchy cartoon title",
  "theme": "science" or "maths",
  "background": "lab" or "nature" or "space" or "kitchen",
  "duration": 35,
  "scenes": [
    {
      "time": 0,
      "character": "Archie",
      "pose": "waving",
      "dialogue": "Exciting line spoken by Archie",
      "actor": "prop_name",
      "sound": "whoosh"
    },
    {
      "time": 8,
      "character": "Archie",
      "pose": "pointing",
      "dialogue": "Educational explanation spoken clearly",
      "actor": "prop_name",
      "sound": "pop"
    },
    {
      "time": 18,
      "character": "Archie",
      "pose": "celebrating",
      "dialogue": "Fun takeaway line",
      "actor": "prop_name",
      "sound": "tada"
    }
  ],
  "checkpoint": {
    "time": 20,
    "question": "A simple conceptual question for Grade ${grade}",
    "options": ["Option A", "Option B", "Option C"],
    "answer": 0,
    "explanation": "Why this answer is correct"
  }
}`;

    const result = await generateGeminiContent(apiKey, aiPrompt);

    const text = result.text || '';
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const script = JSON.parse(cleanedText);
    return res.json({ script, source: 'gemini' });
  } catch (error) {
    console.error('AI Cartoon generation error:', sanitizeProviderError(error));
    const fallbackScript = PREBUILT_CARTOON_SCRIPTS[topic] || PREBUILT_CARTOON_SCRIPTS.DigestJourney;
    return res.json({ script: fallbackScript, source: 'fallback' });
  }
});

const lessonQuizQuestion = (questionEn, optionsEn, questionTa, optionsTa, answer = 0) => ({
  en: { question: questionEn, options: optionsEn, answer },
  ta: { question: questionTa, options: optionsTa, answer }
});

const LESSON_QUIZ_BANK = {
  g4_science_u1_t1: [
    lessonQuizQuestion('Which nutrient is the body’s main source of energy?', ['Carbohydrates', 'Vitamins', 'Water'], 'உடலுக்கு முக்கிய ஆற்றலை வழங்கும் ஊட்டச்சத்து எது?', ['கார்போஹைட்ரேட்', 'வைட்டமின்கள்', 'நீர்']),
    lessonQuizQuestion('Which food is a good source of protein for growth?', ['Pulses', 'Sugar', 'Salt'], 'வளர்ச்சிக்கு புரதம் தரும் உணவு எது?', ['பருப்பு வகைகள்', 'சர்க்கரை', 'உப்பு']),
    lessonQuizQuestion('What makes a diet balanced?', ['It includes different nutrients in suitable amounts', 'It contains only one kind of food', 'It contains only sweets'], 'சமச்சீர் உணவு என்பது எது?', ['பல ஊட்டச்சத்துகள் சரியான அளவில் உள்ள உணவு', 'ஒரே வகை உணவு மட்டும்', 'இனிப்புகள் மட்டும்'])
  ],
  g4_science_u1_t2: [
    lessonQuizQuestion('Where does digestion begin?', ['Mouth', 'Stomach', 'Small intestine'], 'செரிமானம் முதலில் எங்கு தொடங்குகிறது?', ['வாய்', 'வயிறு', 'சிறுகுடல்']),
    lessonQuizQuestion('What does the food pipe do?', ['Moves swallowed food to the stomach', 'Absorbs all nutrients', 'Chews food'], 'உணவுக் குழாய் என்ன செய்கிறது?', ['விழுங்கிய உணவை வயிற்றுக்கு எடுத்துச் செல்கிறது', 'அனைத்து ஊட்டச்சத்துகளையும் உறிஞ்சுகிறது', 'உணவை மெல்கிறது']),
    lessonQuizQuestion('Where are most digested nutrients absorbed into the blood?', ['Small intestine', 'Mouth', 'Food pipe'], 'செரிக்கப்பட்ட ஊட்டச்சத்துகள் பெரும்பாலும் எங்கு இரத்தத்தில் உறிஞ்சப்படுகின்றன?', ['சிறுகுடல்', 'வாய்', 'உணவுக் குழாய்'])
  ],
  g4_science_u1_t3: [
    lessonQuizQuestion('Why does drying help preserve food?', ['It removes moisture that many germs need', 'It adds more water', 'It makes food colder'], 'உணவை உலர்த்துவது ஏன் பாதுகாக்க உதவுகிறது?', ['கிருமிகள் வளரத் தேவையான ஈரப்பதத்தை நீக்குகிறது', 'மேலும் நீரைச் சேர்க்கிறது', 'உணவைக் குளிர்விக்கிறது']),
    lessonQuizQuestion('Which method uses salt, oil, or vinegar to preserve food?', ['Pickling', 'Freezing in sunlight', 'Washing'], 'உணவைப் பாதுகாக்க உப்பு, எண்ணெய் அல்லது வினிகரைப் பயன்படுத்தும் முறை எது?', ['ஊறுகாய் செய்தல்', 'வெயிலில் உறையவைத்தல்', 'கழுவுதல்']),
    lessonQuizQuestion('What should you do before eating preserved food?', ['Check that it was stored safely and is not spoiled', 'Eat it even if it smells bad', 'Leave it uncovered'], 'பாதுகாக்கப்பட்ட உணவை உண்பதற்கு முன் என்ன செய்ய வேண்டும்?', ['பாதுகாப்பாக வைக்கப்பட்டதா, கெட்டுப்போகவில்லையா எனப் பார்க்க வேண்டும்', 'கெட்ட நாற்றம் இருந்தாலும் சாப்பிட வேண்டும்', 'மூடாமல் வைக்க வேண்டும்'])
  ],
  g4_science_u2_t1: [
    lessonQuizQuestion('What do green plants use to make food?', ['Sunlight, water, and carbon dioxide', 'Only soil', 'Only oxygen'], 'பச்சைத் தாவரங்கள் உணவு தயாரிக்க எவற்றைப் பயன்படுத்துகின்றன?', ['சூரிய ஒளி, நீர், கார்பன் டை ஆக்சைடு', 'மண் மட்டும்', 'ஆக்சிஜன் மட்டும்']),
    lessonQuizQuestion('Which part of a plant usually captures sunlight for photosynthesis?', ['Leaves', 'Roots', 'Flowers only'], 'ஒளிச்சேர்க்கைக்காக சூரிய ஒளியைப் பொதுவாகப் பிடிக்கும் பகுதி எது?', ['இலைகள்', 'வேர்கள்', 'பூக்கள் மட்டும்']),
    lessonQuizQuestion('Which gas is released by plants during photosynthesis?', ['Oxygen', 'Nitrogen', 'Carbon monoxide'], 'ஒளிச்சேர்க்கையின் போது தாவரங்கள் வெளியிடும் வாயு எது?', ['ஆக்சிஜன்', 'நைட்ரஜன்', 'கார்பன் மோனாக்சைடு'])
  ],
  g4_science_u2_t2: [
    lessonQuizQuestion('How does a cactus reduce water loss?', ['Its leaves are changed into spines', 'It grows very wide soft leaves', 'It lives underwater'], 'கற்றாழை நீர் இழப்பைக் குறைப்பது எப்படி?', ['அதன் இலைகள் முட்களாக மாறியுள்ளன', 'அதற்கு அகன்ற மென்மையான இலைகள் உள்ளன', 'அது நீருக்குள் வாழ்கிறது']),
    lessonQuizQuestion('Which feature helps a water lily float?', ['Broad, waxy leaves', 'Deep underground flowers', 'Sharp dry spines'], 'நீர்த்தாமரை மிதக்க உதவும் அம்சம் எது?', ['அகன்ற மெழுகுப் போன்ற இலைகள்', 'ஆழமான நிலத்தடி பூக்கள்', 'கூர்மையான உலர் முட்கள்']),
    lessonQuizQuestion('Why do plants have different adaptations?', ['To survive in their habitats', 'To stop growing', 'To avoid using sunlight everywhere'], 'தாவரங்களுக்கு வெவ்வேறு தகவமைப்புகள் ஏன் உள்ளன?', ['அவை வாழும் சூழலில் உயிர்வாழ', 'வளர்வதை நிறுத்த', 'எங்கும் சூரிய ஒளியைத் தவிர்க்க'])
  ],
  g4_science_u2_t3: [
    lessonQuizQuestion('Why does a Venus flytrap catch insects?', ['To obtain nutrients such as minerals', 'To get sunlight', 'To drink salt water'], 'வீனஸ் பூச்சிப்பிடி ஏன் பூச்சிகளைப் பிடிக்கிறது?', ['தாதுக்கள் போன்ற ஊட்டச்சத்துகளைப் பெற', 'சூரிய ஒளியைப் பெற', 'உப்பு நீரைக் குடிக்க']),
    lessonQuizQuestion('What can grow into a new plant in some plants?', ['A spore', 'A bone', 'A feather'], 'சில தாவரங்களில் புதிய தாவரமாக வளரக்கூடியது எது?', ['வித்து', 'எலும்பு', 'இறகு']),
    lessonQuizQuestion('Which plant traps insects with a pitcher-shaped leaf?', ['Pitcher plant', 'Rose', 'Coconut palm'], 'குடம் போன்ற இலையால் பூச்சிகளைப் பிடிக்கும் தாவரம் எது?', ['குடுவைத் தாவரம்', 'ரோஜா', 'தென்னை'])
  ],
  g4_maths_u1_t1: [
    lessonQuizQuestion('In the fraction 3/8, what does the 8 represent?', ['The total number of equal parts', 'The number of parts selected', 'The number of whole pizzas'], '3/8 என்ற பின்னத்தில் 8 எதைக் குறிக்கிறது?', ['சமமான மொத்தப் பகுதிகளின் எண்ணிக்கை', 'தேர்ந்தெடுத்த பகுதிகளின் எண்ணிக்கை', 'முழு பீட்சாக்களின் எண்ணிக்கை']),
    lessonQuizQuestion('A shape is divided into 4 equal parts and 1 part is shaded. What fraction is shaded?', ['1/4', '4/1', '3/4'], 'ஒரு வடிவம் 4 சமப் பகுதிகளாகப் பிரிக்கப்பட்டு 1 பகுதி நிறமிடப்பட்டுள்ளது. நிறமிட்ட பின்னம் எது?', ['1/4', '4/1', '3/4']),
    lessonQuizQuestion('What must be true of the parts when a fraction describes parts of a whole?', ['The parts are equal in size', 'The parts are different shapes', 'There is no whole'], 'ஒரு முழுவடிவத்தின் பகுதிகளைப் பின்னம் குறிக்கும்போது, அந்தப் பகுதிகள் எப்படி இருக்க வேண்டும்?', ['அனைத்தும் சம அளவில் இருக்க வேண்டும்', 'வெவ்வேறு வடிவங்களாக இருக்க வேண்டும்', 'முழுவடிவம் இருக்கக் கூடாது'])
  ],
  g4_maths_u1_t2: [
    lessonQuizQuestion('Which fraction is equivalent to 1/2?', ['2/4', '1/3', '3/5'], '1/2க்கு சமமான பின்னம் எது?', ['2/4', '1/3', '3/5']),
    lessonQuizQuestion('How do you make an equivalent fraction?', ['Multiply or divide the numerator and denominator by the same number', 'Change only the denominator', 'Add 1 to the numerator only'], 'சமமான பின்னத்தை எப்படிக் கண்டுபிடிப்பது?', ['தொகுதியையும் பகுதியையும் ஒரே எண்ணால் பெருக்குதல் அல்லது வகுத்தல்', 'பகுதியை மட்டும் மாற்றுதல்', 'தொகுதியுடன் மட்டும் 1ஐக் கூட்டுதல்']),
    lessonQuizQuestion('Which fraction has the same value as 3/6?', ['1/2', '1/3', '2/3'], '3/6க்கு சமமான மதிப்புள்ள பின்னம் எது?', ['1/2', '1/3', '2/3'])
  ],
  g4_maths_u1_t3: [
    lessonQuizQuestion('What is 1/5 + 2/5?', ['3/5', '3/10', '2/5'], '1/5 + 2/5 எவ்வளவு?', ['3/5', '3/10', '2/5']),
    lessonQuizQuestion('When adding fractions with the same denominator, what stays the same?', ['The denominator', 'The numerator', 'The answer'], 'ஒரே பகுதியைக் கொண்ட பின்னங்களைச் சேர்க்கும்போது எது மாறாமல் இருக்கும்?', ['பகுதி', 'தொகுதி', 'விடை']),
    lessonQuizQuestion('What is 2/8 + 3/8?', ['5/8', '5/16', '6/8'], '2/8 + 3/8 எவ்வளவு?', ['5/8', '5/16', '6/8'])
  ],
  g4_maths_u2_t1: [
    lessonQuizQuestion('How many sides does a triangle have?', ['3', '4', '5'], 'முக்கோணத்திற்கு எத்தனை பக்கங்கள் உள்ளன?', ['3', '4', '5']),
    lessonQuizQuestion('Which solid shape has 6 square faces?', ['Cube', 'Sphere', 'Cone'], '6 சதுர முகங்களைக் கொண்ட கனவடிவம் எது?', ['கனசதுரம்', 'கோளம்', 'கூம்பு']),
    lessonQuizQuestion('How many edges does a cube have?', ['12', '6', '8'], 'ஒரு கனசதுரத்திற்கு எத்தனை விளிம்புகள் உள்ளன?', ['12', '6', '8'])
  ],
  g4_maths_u2_t2: [
    lessonQuizQuestion('How do you find the perimeter of a rectangle?', ['Add the lengths of all four sides', 'Multiply its length by its width', 'Count only its corners'], 'செவ்வகத்தின் சுற்றளவை எப்படிக் கணக்கிடலாம்?', ['நான்கு பக்கங்களின் நீளங்களையும் கூட்டி', 'நீளத்தையும் அகலத்தையும் பெருக்கி', 'மூலைகளை மட்டும் எண்ணி']),
    lessonQuizQuestion('A square has sides of 5 cm. What is its perimeter?', ['20 cm', '10 cm', '25 cm'], '5 செ.மீ பக்கமுள்ள சதுரத்தின் சுற்றளவு எவ்வளவு?', ['20 செ.மீ', '10 செ.மீ', '25 செ.மீ']),
    lessonQuizQuestion('Which unit is suitable for the perimeter of a playground?', ['Metres', 'Square metres', 'Litres'], 'விளையாட்டு மைதானத்தின் சுற்றளவுக்கு ஏற்ற அலகு எது?', ['மீட்டர்', 'சதுர மீட்டர்', 'லிட்டர்'])
  ],
  g4_maths_u2_t3: [
    lessonQuizQuestion('What does a line of symmetry do to a shape?', ['Divides it into matching mirror halves', 'Makes it larger', 'Changes it into a circle'], 'சமச்சீர் கோடு ஒரு வடிவத்தை எப்படிப் பிரிக்கிறது?', ['ஒன்றுக்கொன்று பொருந்தும் பிரதிபலிப்பு பகுதிகளாக', 'பெரியதாக', 'வட்டமாக']),
    lessonQuizQuestion('Which shape has at least one line of symmetry?', ['Square', 'Scalene triangle', 'Uneven open curve'], 'குறைந்தது ஒரு சமச்சீர் கோடு கொண்ட வடிவம் எது?', ['சதுரம்', 'சமமற்ற பக்க முக்கோணம்', 'ஒழுங்கற்ற திறந்த வளைவு']),
    lessonQuizQuestion('If you fold a symmetric shape on its symmetry line, what happens?', ['The two halves match', 'The halves disappear', 'The shape doubles in size'], 'சமச்சீர் வடிவத்தை அதன் சமச்சீர் கோட்டில் மடித்தால் என்ன நடக்கும்?', ['இரு பகுதிகளும் ஒன்றுடன் ஒன்று பொருந்தும்', 'பகுதிகள் மறையும்', 'வடிவம் இருமடங்காகும்'])
  ],
  g5_science_u1_t1: [
    lessonQuizQuestion('Which bone protects the brain?', ['Skull', 'Rib', 'Kneecap'], 'மூளையைப் பாதுகாக்கும் எலும்பு எது?', ['மண்டை ஓடு', 'விலா எலும்பு', 'முழங்கால் சில்லு']),
    lessonQuizQuestion('What does the rib cage protect?', ['Heart and lungs', 'Stomach only', 'Hands and feet'], 'விலா எலும்புக் கூடு எவற்றைப் பாதுகாக்கிறது?', ['இதயம் மற்றும் நுரையீரல்', 'வயிறு மட்டும்', 'கைகள் மற்றும் பாதங்கள்']),
    lessonQuizQuestion('What is one important job of the skeleton?', ['Support the body and protect organs', 'Digest food', 'Pump blood'], 'எலும்புக்கூட்டின் முக்கியப் பணி எது?', ['உடலைத் தாங்கி உறுப்புகளைப் பாதுகாத்தல்', 'உணவைச் செரித்தல்', 'இரத்தத்தை உந்துதல்'])
  ],
  g5_science_u1_t2: [
    lessonQuizQuestion('What is a joint?', ['A place where bones meet', 'A type of muscle', 'A part of the stomach'], 'மூட்டு என்பது எது?', ['எலும்புகள் சந்திக்கும் இடம்', 'ஒரு வகை தசை', 'வயிற்றின் ஒரு பகுதி']),
    lessonQuizQuestion('Which joint lets your elbow bend mainly back and forth?', ['Hinge joint', 'Ball-and-socket joint', 'Fixed joint'], 'முழங்கை முன்-பின் மடங்க உதவும் மூட்டு எது?', ['கீல் மூட்டு', 'பந்து-கிண்ண மூட்டு', 'அசையா மூட்டு']),
    lessonQuizQuestion('Which joint allows movement in many directions at the shoulder?', ['Ball-and-socket joint', 'Hinge joint', 'Fixed joint'], 'தோள்பட்டை பல திசைகளில் அசைய உதவும் மூட்டு எது?', ['பந்து-கிண்ண மூட்டு', 'கீல் மூட்டு', 'அசையா மூட்டு'])
  ],
  g5_science_u1_t3: [
    lessonQuizQuestion('What do muscles do to move bones?', ['They pull on bones', 'They push bones apart', 'They turn into bones'], 'எலும்புகளை அசைக்க தசைகள் என்ன செய்கின்றன?', ['எலும்புகளை இழுக்கின்றன', 'எலும்புகளைத் தள்ளுகின்றன', 'எலும்புகளாக மாறுகின்றன']),
    lessonQuizQuestion('How do muscles often work around a joint?', ['In pairs, one contracts as the other relaxes', 'Both disappear', 'Only one muscle is ever used'], 'மூட்டின் அருகே தசைகள் பொதுவாக எப்படிச் செயல்படுகின்றன?', ['சோடியாக, ஒன்று சுருங்கும்போது மற்றொன்று தளர்கிறது', 'இரண்டும் மறைகின்றன', 'ஒரு தசை மட்டும் எப்போதும் செயல்படுகிறது']),
    lessonQuizQuestion('Which muscle action bends your arm at the elbow?', ['The biceps contracts', 'The bones contract', 'The rib cage contracts'], 'முழங்கையில் கையை மடக்கும்போது எந்தச் செயல் நடக்கிறது?', ['இருதலைத் தசை சுருங்குகிறது', 'எலும்புகள் சுருங்குகின்றன', 'விலா எலும்புக் கூடு சுருங்குகிறது'])
  ],
  g5_science_u2_t1: [
    lessonQuizQuestion('What causes day and night on Earth?', ['Earth rotates on its axis', 'Earth stops moving', 'The Moon circles Earth once a day'], 'பூமியில் பகலும் இரவும் ஏற்படுவது எதனால்?', ['பூமி தன் அச்சில் சுழல்வதால்', 'பூமி நகராமல் இருப்பதால்', 'நிலா தினமும் ஒருமுறை பூமியைச் சுற்றுவதால்']),
    lessonQuizQuestion('What is an orbit?', ['The path one object follows around another', 'A type of cloud', 'The centre of a planet'], 'சுற்றுப்பாதை என்பது எது?', ['ஒரு பொருள் மற்றொன்றைச் சுற்றிச் செல்லும் பாதை', 'ஒரு வகை மேகம்', 'கோளின் மையம்']),
    lessonQuizQuestion('Which object is at the centre of our solar system?', ['The Sun', 'Earth', 'The Moon'], 'நமது சூரியக் குடும்பத்தின் மையத்தில் உள்ள பொருள் எது?', ['சூரியன்', 'பூமி', 'நிலா'])
  ],
  g5_science_u2_t2: [
    lessonQuizQuestion('What is the fixed turning point of a lever called?', ['Fulcrum', 'Pulley', 'Ramp'], 'நெம்புகோல் சுழலும் நிலையான புள்ளி எவ்வாறு அழைக்கப்படுகிறது?', ['ஆதாரப்புள்ளி', 'கப்பி', 'சாய்வுதளம்']),
    lessonQuizQuestion('How can a pulley help lift a load?', ['It changes the direction of the pulling force', 'It removes gravity', 'It makes the load disappear'], 'சுமையைத் தூக்க கப்பி எவ்வாறு உதவும்?', ['இழுக்கும் விசையின் திசையை மாற்றுகிறது', 'புவியீர்ப்பை நீக்குகிறது', 'சுமையை மறையச் செய்கிறது']),
    lessonQuizQuestion('Which simple machine is a sloping surface?', ['Inclined plane', 'Wheel only', 'Fulcrum'], 'சாய்வான பரப்பாக இருக்கும் எளிய இயந்திரம் எது?', ['சாய்தளம்', 'சக்கரம் மட்டும்', 'ஆதாரப்புள்ளி'])
  ],
  g5_science_u2_t3: [
    lessonQuizQuestion('What force pulls objects toward Earth?', ['Gravity', 'Friction', 'Light'], 'பொருட்களைப் பூமியை நோக்கி இழுக்கும் விசை எது?', ['புவியீர்ப்பு', 'உராய்வு', 'ஒளி']),
    lessonQuizQuestion('What does friction usually do to a moving object?', ['It opposes motion and can slow it down', 'It makes it weightless', 'It creates a new object'], 'உராய்வு நகரும் பொருளுக்கு பொதுவாக என்ன செய்கிறது?', ['இயக்கத்தை எதிர்த்து வேகத்தைக் குறைக்கலாம்', 'எடையற்றதாக மாற்றுகிறது', 'புதிய பொருளை உருவாக்குகிறது']),
    lessonQuizQuestion('Why are sports shoes often made with rough soles?', ['To increase grip and friction', 'To remove gravity', 'To make the floor slippery'], 'விளையாட்டு காலணிகளின் அடிப்பகுதி கரடுமுரடாக இருப்பது ஏன்?', ['பிடிப்பையும் உராய்வையும் அதிகரிக்க', 'புவியீர்ப்பை நீக்க', 'தரையை வழுக்கச் செய்ய'])
  ],
  g5_maths_u1_t1: [
    lessonQuizQuestion('How many degrees are in a right angle?', ['90°', '45°', '180°'], 'செங்கோணம் எத்தனை பாகைகள் கொண்டது?', ['90°', '45°', '180°']),
    lessonQuizQuestion('Which angle is smaller than 90°?', ['Acute angle', 'Obtuse angle', 'Straight angle'], '90°-ஐ விடச் சிறிய கோணம் எது?', ['குறுங்கோணம்', 'விரிகோணம்', 'நேர்கோணம்']),
    lessonQuizQuestion('Which angle is greater than 90° but less than 180°?', ['Obtuse angle', 'Acute angle', 'Right angle'], '90°-ஐ விடப் பெரியதும் 180°-ஐ விடச் சிறியதுமான கோணம் எது?', ['விரிகோணம்', 'குறுங்கோணம்', 'செங்கோணம்'])
  ],
  g5_maths_u1_t2: [
    lessonQuizQuestion('What is symmetry?', ['A shape has matching parts on either side of a line', 'A shape has no sides', 'A shape is always a circle'], 'சமச்சீர் என்பது எது?', ['ஒரு கோட்டின் இருபுறமும் பொருந்தும் பகுதிகள் இருப்பது', 'வடிவத்திற்கு பக்கங்கள் இல்லாதது', 'வடிவம் எப்போதும் வட்டமாக இருப்பது']),
    lessonQuizQuestion('How many lines of symmetry does a square have?', ['4', '2', '1'], 'ஒரு சதுரத்திற்கு எத்தனை சமச்சீர் கோடுகள் உள்ளன?', ['4', '2', '1']),
    lessonQuizQuestion('Which object is approximately symmetrical down its middle?', ['A butterfly with matching wings', 'A one-sided arrow', 'A bent line'], 'நடுவில் தோராயமாக சமச்சீராக இருப்பது எது?', ['ஒத்த இரு இறக்கைகள் கொண்ட வண்ணத்துப்பூச்சி', 'ஒருபக்க அம்பு', 'வளைந்த கோடு'])
  ],
  g5_maths_u1_t3: [
    lessonQuizQuestion('Which tool measures angles in degrees?', ['Protractor', 'Ruler only', 'Compass'], 'கோணங்களைப் பாகையில் அளக்கும் கருவி எது?', ['பாகைமானி', 'அளவுகோல் மட்டும்', 'கவராயம்']),
    lessonQuizQuestion('Where should the centre mark of a protractor be placed?', ['On the angle’s vertex', 'At the end of one arm', 'Anywhere on the page'], 'பாகைமானியின் மையக் குறியை எங்கு வைக்க வேண்டும்?', ['கோணத்தின் உச்சியில்', 'ஒரு கையின் முடிவில்', 'பக்கத்தில் எங்கும்']),
    lessonQuizQuestion('What does the vertex of an angle mean?', ['The point where its two arms meet', 'The longest arm', 'The space outside the angle'], 'கோணத்தின் உச்சி எது?', ['அதன் இரு கைகளும் சந்திக்கும் புள்ளி', 'நீளமான கை', 'கோணத்திற்கு வெளியே உள்ள இடம்'])
  ],
  g5_maths_u2_t1: [
    lessonQuizQuestion('In the decimal 0.7, what does the 7 represent?', ['7 tenths', '7 hundredths', '7 ones'], '0.7 என்ற தசமத்தில் 7 எதைக் குறிக்கிறது?', ['7 பத்தில் ஒன்று', '7 நூற்றில் ஒன்று', '7 ஒன்று']),
    lessonQuizQuestion('How many hundredths make one whole?', ['100', '10', '1'], 'ஒரு முழுவடிவத்திற்கு எத்தனை நூற்றிலங்கள் தேவை?', ['100', '10', '1']),
    lessonQuizQuestion('Which decimal represents 25 hundredths?', ['0.25', '2.5', '0.025'], '25 நூற்றிலங்களைக் குறிக்கும் தசமம் எது?', ['0.25', '2.5', '0.025'])
  ],
  g5_maths_u2_t2: [
    lessonQuizQuestion('What is 1/2 written as a decimal?', ['0.5', '0.2', '1.2'], '1/2ஐ தசமமாக எழுதினால் எது?', ['0.5', '0.2', '1.2']),
    lessonQuizQuestion('What is 3/4 written as a decimal?', ['0.75', '0.34', '0.8'], '3/4ஐ தசமமாக எழுதினால் எது?', ['0.75', '0.34', '0.8']),
    lessonQuizQuestion('What is 1/10 written as a decimal?', ['0.1', '1.0', '0.01'], '1/10ஐ தசமமாக எழுதினால் எது?', ['0.1', '1.0', '0.01'])
  ],
  g5_maths_u2_t3: [
    lessonQuizQuestion('A toy costs ₹12.50 and a book costs ₹7.25. What is the total cost?', ['₹19.75', '₹19.25', '₹5.25'], 'ஒரு பொம்மை ₹12.50, புத்தகம் ₹7.25. மொத்த விலை என்ன?', ['₹19.75', '₹19.25', '₹5.25']),
    lessonQuizQuestion('You pay ₹20 for an item costing ₹13.50. How much change should you get?', ['₹6.50', '₹7.50', '₹6.05'], '₹13.50 விலையுள்ள பொருளுக்கு ₹20 கொடுத்தால் எவ்வளவு மீதி கிடைக்கும்?', ['₹6.50', '₹7.50', '₹6.05']),
    lessonQuizQuestion('When adding prices with decimals, how should you line them up?', ['Align the decimal points', 'Align the last digits only', 'Ignore the decimal points'], 'தசம விலைகளைக் கூட்டும்போது அவற்றை எப்படிச் சீரமைக்க வேண்டும்?', ['தசமப் புள்ளிகளை ஒரே நேர்கோட்டில் வைக்க', 'கடைசி இலக்கங்களை மட்டும் சீரமைக்க', 'தசமப் புள்ளிகளைப் புறக்கணிக்க'])
  ]
};

// POST /api/generate-quiz (Preserved)
app.post('/api/generate-quiz', (req, res) => {
  const { grade = 4, subject = 'science', quizKey = '', language = 'en' } = req.body || {};
  const isMathSubject = /^math/i.test(String(subject));
  const expectedQuizPrefix = `g${Number(grade)}_${isMathSubject ? 'maths' : 'science'}_`;
  if (!['4', '5'].includes(String(grade)) || typeof quizKey !== 'string' || !quizKey.startsWith(expectedQuizPrefix)) {
    return res.status(400).json({ error: 'The lesson quiz key does not match the selected grade and subject.' });
  }
  const lessonQuestions = LESSON_QUIZ_BANK[quizKey];
  if (!Array.isArray(lessonQuestions)) {
    return res.status(400).json({ error: 'A valid lesson quiz key is required to load lesson-specific questions.' });
  }
  const defaultQuiz = lessonQuestions.map(question => question[language === 'ta' ? 'ta' : 'en']);

  return res.json({ quiz: defaultQuiz, source: 'lesson-bank' });
});

app.get('/', (req, res) => {
  res.send('Eduarch Archie backend is running with AI Tutor and Video Generator.');
});

app.listen(PORT, () => {
  console.log(`Eduarch backend running on port ${PORT}`);
  if (!getApiKey()) {
    console.warn('GEMINI_API_KEY is not configured; video-generation requests will be rejected.');
  }
});
