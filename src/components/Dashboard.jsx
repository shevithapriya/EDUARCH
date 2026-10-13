import React, { useState } from 'react';
import { playSound } from '../utils/audio';
import { BookOpen, Star, Trophy, Award, Sparkles, Flame, Play, CheckCircle } from 'lucide-react';

export const TRANSLATED_DATA = {
  en: {
    dashboardTitle: "Eduarch Study Space!",
    myStars: "My Stars",
    trophies: "Trophies",
    activeLesson: "Active Unit",
    selectSubject: "Select Subject",
    chooseTopic: "Choose a Topic to Start Your 4-Stage Interactive Learning Adventure!",
    scienceTab: "🧬 Science",
    mathsTab: "📐 Mathematics",
    unit1: "Unit 1",
    unit2: "Unit 2",
    topic: "TOPIC",
    completed: "⭐ Completed",
    start: "Start Learn (Video + Game)!",
    replay: "Play Again!",
    
    // Grade 4 Science - Unit 1: Food & Digestion
    g4_sci_u1_title: "Food and Digestion 🍎",
    g4_sci_u1_desc: "Discover how food fuel keeps our bodies healthy, and follow a bite of food on its epic journey!",
    g4_sci_u1_t1_name: "Nutrients in Food",
    g4_sci_u1_t1_desc: "Balance a plate with carbs, proteins, fats, and vitamins to stay fit!",
    g4_sci_u1_t2_name: "The Digestive System",
    g4_sci_u1_t2_desc: "Trace and trigger Mouth, Stomach, and Intestine enzymes down the digestive pipe!",
    g4_sci_u1_t3_name: "Food Preservation",
    g4_sci_u1_t3_desc: "Experiment with boiling stove, pickle oil, and sun drying in the food chemical lab!",

    // Grade 4 Science - Unit 2: Plants Living & Surviving
    g4_sci_u2_title: "Plants: Living and Surviving 🌱",
    g4_sci_u2_desc: "Explore green leaves making food with sunlight, terrestrial adaptations, and insect-eating plants!",
    g4_sci_u2_t1_name: "Photosynthesis: Nature's Kitchen",
    g4_sci_u2_t1_desc: "Watch leaves convert sunlight, CO2, and water into food and oxygen!",
    g4_sci_u2_t2_name: "Plant Adaptations",
    g4_sci_u2_t2_desc: "Discover how desert cactus stores water and water lilies float on ponds!",
    g4_sci_u2_t3_name: "Carnivorous Plants & Spores",
    g4_sci_u2_t3_desc: "Meet the Venus Flytrap and Pitcher Plant that digest bugs for minerals!",

    // Grade 4 Maths - Unit 1: Fractions Adventure
    g4_mat_u1_title: "Fractions Adventure 🍕",
    g4_mat_u1_desc: "Learn parts of a whole with pizza slicing, cross the river using equivalent logs, and balance fraction weights!",
    g4_mat_u1_t1_name: "Understanding Fractions",
    g4_mat_u1_t1_desc: "Become a Pizza Chef and bake orders like 1/4 and 3/8 for hungry monsters!",
    g4_mat_u1_t2_name: "Equivalent Fractions",
    g4_mat_u1_t2_desc: "Bridge a river by matching logs that share identical fraction values!",
    g4_mat_u1_t3_name: "Adding Fractions",
    g4_mat_u1_t3_desc: "Add fractions with identical denominators to level the heavy scales!",

    // Grade 4 Maths - Unit 2: Shapes & Perimeter
    g4_mat_u2_title: "Shapes, Perimeter & Measurement 📐",
    g4_mat_u2_desc: "Explore 2D and 3D shapes, calculate perimeters around sports fields, and measure lengths!",
    g4_mat_u2_t1_name: "2D & 3D Geometric Shapes",
    g4_mat_u2_t1_desc: "Identify faces, edges, and corners of cubes, spheres, and cylinders!",
    g4_mat_u2_t2_name: "Perimeter Calculation",
    g4_mat_u2_t2_desc: "Calculate total boundary distance around rectangular playgrounds!",
    g4_mat_u2_t3_name: "Pattern & Symmetry Explorer",
    g4_mat_u2_t3_desc: "Mirror decorative tile patterns along horizontal and vertical axes!",

    // Grade 5 Science - Unit 1: Skeletal & Muscular
    g5_sci_u1_title: "Skeletal & Muscular System 💀",
    g5_sci_u1_desc: "Assemble a dancing skeleton, operate bone joints, and flex muscles to lift weights!",
    g5_sci_u1_t1_name: "The Human Skeleton",
    g5_sci_u1_t1_desc: "Piece together skull, ribcage, spine, and leg bones to watch them dance!",
    g5_sci_u1_t2_name: "Joints & Movements",
    g5_sci_u1_t2_desc: "Flex hinge knee, pivot neck, and ball-and-socket shoulder joints on a puppet!",
    g5_sci_u1_t3_name: "Muscles (Flex & Relax)",
    g5_sci_u1_t3_desc: "Contract biceps and relax triceps antagonist pairs to lift metal weights!",

    // Grade 5 Science - Unit 2: Solar System & Simple Machines
    g5_sci_u2_title: "Solar System & Simple Machines 🪐",
    g5_sci_u2_desc: "Fly through 8 planetary orbits around the sun and operate levers, pulleys, and inclined planes!",
    g5_sci_u2_t1_name: "Planetary Orbits & Day/Night",
    g5_sci_u2_t1_desc: "Explore how Earth rotation gives 24h days and revolution gives seasons!",
    g5_sci_u2_t2_name: "Levers, Pulleys & Ramps",
    g5_sci_u2_t2_desc: "Lift massive stone boulders using seesaw fulcrums and wheel pulleys!",
    g5_sci_u2_t3_name: "Gravity, Friction & Energy",
    g5_sci_u2_t3_desc: "Discover how invisible gravity pulls objects and friction slows moving wheels!",

    // Grade 5 Maths - Unit 1: Angles and Symmetry
    g5_mat_u1_title: "Angles and Symmetry 📐",
    g5_mat_u1_desc: "Shoot lasers at acute/obtuse angles, complete symmetric drawings, and measure skater ramps!",
    g5_mat_u1_t1_name: "Identifying Angles",
    g5_mat_u1_t1_desc: "Align and fire a plasma laser cannon at specified acute, right, and obtuse angles!",
    g5_mat_u1_t2_name: "Symmetry Artist",
    g5_mat_u1_t2_desc: "Reflect pixel cells across a central mirror grid line to draw butterflies!",
    g5_mat_u1_t3_name: "Measuring with Protractors",
    g5_mat_u1_t3_desc: "Align virtual protractors on skater ramp vertices to measure jumps!",

    // Grade 5 Maths - Unit 2: Decimals & Fractions Lab
    g5_mat_u2_title: "Decimals & Money World 💰",
    g5_mat_u2_desc: "Master tenths, hundredths, place values, and solve practical grocery shopping problems!",
    g5_mat_u2_t1_name: "Tenths and Hundredths Grid",
    g5_mat_u2_t1_desc: "Color 10x10 grids to visualize 0.1 and 0.25 fractional decimals!",
    g5_mat_u2_t2_name: "Converting Fractions to Decimals",
    g5_mat_u2_t2_desc: "Convert 1/2 into 0.5 and 3/4 into 0.75 on a golden number line!",
    g5_mat_u2_t3_name: "Smart Shopper Decimals",
    g5_mat_u2_t3_desc: "Add decimal rupee prices and calculate change at the super market!"
  },
  ta: {
    dashboardTitle: "எடுஆர்க் கற்றல் தளம்!",
    myStars: "எனது நட்சத்திரங்கள்",
    trophies: "கோப்பைகள்",
    activeLesson: "தற்போதைய அலகு",
    selectSubject: "பாடத்தைத் தேர்ந்தெடுக்கவும்",
    chooseTopic: "ஊடாடும் 4-அடுக்கு கற்றலைத் தொடங்க தலைப்பைத் தேர்வுசெய்க!",
    scienceTab: "🧬 அறிவியல்",
    mathsTab: "📐 கணிதம்",
    unit1: "அலகு 1",
    unit2: "அலகு 2",
    topic: "தலைப்பு",
    completed: "⭐ முடிந்தது",
    start: "கற்றுக்கொள் (வீடியோ + விளையாட்டு)!",
    replay: "மீண்டும் விளையாடு!",

    // Grade 4 Science - Unit 1
    g4_sci_u1_title: "உணவும் செரிமானமும் 🍎",
    g4_sci_u1_desc: "உணவு எவ்வாறு உடலை ஆரோக்கியமாக வைத்திருக்கிறது என்பதை அறிந்து, உணவின் பயணத்தைப் பின் தொடருங்கள்!",
    g4_sci_u1_t1_name: "உணவில் உள்ள ஊட்டச்சத்துக்கள்",
    g4_sci_u1_t1_desc: "உடலை ஆரோக்கியமாக வைக்க தட்டில் கார்போஹைட்ரேட், புரதம், கொழுப்புகளைச் சேர்க்கவும்!",
    g4_sci_u1_t2_name: "செரிமான மண்டலம்",
    g4_sci_u1_t2_desc: "வாய், இரைப்பை மற்றும் குடல் நொதிகளைச் செயல்படுத்தி உணவைச் செரிக்கச் செய்யுங்கள்!",
    g4_sci_u1_t3_name: "உணவுப் பாதுகாப்பு முறைகள்",
    g4_sci_u1_t3_desc: "சூடுபடுத்துதல், ஊறுகாய் போடுதல் மற்றும் உலர்த்துதல் முறைகளை ஆய்வுக்கூடத்தில் பரிசோதியுங்கள்!",

    // Grade 4 Science - Unit 2
    g4_sci_u2_title: "தாவரங்கள்: வாழ்தலும் தப்பிப்பிழைத்தலும் 🌱",
    g4_sci_u2_desc: "சூரிய ஒளியைப் பயன்படுத்தி இலைகள் உணவு தயாரிப்பதையும், பாலைவனத் தாவரங்களின் தகவமைப்பையும் அறியுங்கள்!",
    g4_sci_u2_t1_name: "ஒளிச்சேர்க்கை: இயற்கையின் சமையலறை",
    g4_sci_u2_t1_desc: "இலைகள் சூரிய ஒளி, நீர், கார்பன் டை ஆக்சைடைப் பயன்படுத்தி உணவு தயாரிப்பதை வீடியோவில் பாருங்கள்!",
    g4_sci_u2_t2_name: "தாவரங்களின் தகவமைப்புகள்",
    g4_sci_u2_t2_desc: "பாலைவன சப்பாத்திக்கள்ளி நீர் சேமிப்பதையும், அல்லி குளத்தில் மிதப்பதையும் கற்றுக்கொள்ளுங்கள்!",
    g4_sci_u2_t3_name: "பூச்சி உண்ணும் தாவரங்கள்",
    g4_sci_u2_t3_desc: "வீனஸ் பூச்சிபொறி தாவரம் பூச்சிகளைப் பிடித்து செரிக்கும் முறையை ஆராயுங்கள்!",

    // Grade 4 Maths - Unit 1
    g4_mat_u1_title: "பின்னங்களின் பயணம் 🍕",
    g4_mat_u1_desc: "பீட்சாவை வெட்டுதல், ஆற்றில் சமமான மரக்கட்டைகளைப் பொருத்துதல் மூலம் பின்னங்களைக் கற்றுக்கொள்ளுங்கள்!",
    g4_mat_u1_t1_name: "பின்னங்களை புரிந்து கொள்ளுதல்",
    g4_mat_u1_t1_desc: "பீட்சா சமையல்காரராக மாறி 1/4 மற்றும் 3/8 பங்குகளுக்கான ஆர்டர்களைத் தயாரிக்கவும்!",
    g4_mat_u1_t2_name: "சமமான பின்னங்கள்",
    g4_mat_u1_t2_desc: "சமமான மதிப்புள்ள மரக்கட்டைகளைத் தேர்ந்தெடுத்து ஆற்றைக் கடக்கப் பாலம் கட்டுங்கள்!",
    g4_mat_u1_t3_name: "பின்னங்களைக் கூட்டுதல்",
    g4_mat_u1_t3_desc: "ஒரே பகுதி உடைய பின்னங்களைக் கூட்டி எடையைச் சமன் செய்யுங்கள்!",

    // Grade 4 Maths - Unit 2
    g4_mat_u2_title: "வடிவங்கள், சுற்றளவு & அளவீடு 📐",
    g4_mat_u2_desc: "2D/3D வடிவங்களை அடையாளம் காணுதல், விளையாட்டு மைதானத்தின் சுற்றளவைக் கணக்கிடுதல்!",
    g4_mat_u2_t1_name: "2D மற்றும் 3D வடிவங்கள்",
    g4_mat_u2_t1_desc: "கனசதுரம், உருளை, கோளங்களின் விளிம்புகள் மற்றும் மூலைகளை அறியுங்கள்!",
    g4_mat_u2_t2_name: "சுற்றளவு கணக்கிடுதல்",
    g4_mat_u2_t2_desc: "செவ்வகம் மற்றும் சதுரங்களின் எல்லை தூரத்தைக் கூட்டி சுற்றளவு காணுங்கள்!",
    g4_mat_u2_t3_name: "சமச்சீர் கோலங்கள்",
    g4_mat_u2_t3_desc: "கிடைமட்ட மற்றும் செங்குத்து அச்சுகளில் வண்ணக் கட்டங்களை சமச்சீராகப் பிரதிபலிக்கவும்!",

    // Grade 5 Science - Unit 1
    g5_sci_u1_title: "எலும்பு மற்றும் தசை மண்டலம் 💀",
    g5_sci_u1_desc: "ஆடும் எலும்புக்கூட்டை உருவாக்குங்கள், மூட்டுகளை அசைத்து எடைகளை உயர்த்துங்கள்!",
    g5_sci_u1_t1_name: "மனித எலும்புக்கூடு",
    g5_sci_u1_t1_desc: "தலை, நெஞ்சு, முதுகு எலும்புகளைப் பொருத்தி எலும்புக்கூட்டை ஆடச் செய்யுங்கள்!",
    g5_sci_u1_t2_name: "மூட்டுகள் மற்றும் அசைவுகள்",
    g5_sci_u1_t2_desc: "கீல் மூட்டு, சுழல் மூட்டு மற்றும் பந்துக்கிண்ண மூட்டுகளின் அசைவுகளைக் கற்றுக்கொள்ளுங்கள்!",
    g5_sci_u1_t3_name: "தசைகள் (சுருங்குதல் & தளர்வு)",
    g5_sci_u1_t3_desc: "இருதலைத் தசை மற்றும் முத்தலைத் தசைகளைச் சுருக்கி எடையை உயர்த்துங்கள்!",

    // Grade 5 Science - Unit 2
    g5_sci_u2_title: "சூரிய குடும்பம் & எளிய இயந்திரங்கள் 🪐",
    g5_sci_u2_desc: "8 கோள்களின் பாதைகளைச் சுற்றிப் பாருங்கள், கப்பி மற்றும் நெம்புகோல்களை இயக்குங்கள்!",
    g5_sci_u2_t1_name: "கோள்களின் சுழற்சி & இரவும் பகலும்",
    g5_sci_u2_t1_desc: "பூமியின் சுழற்சியால் பகல் இரவும், சூரியனைச் சுற்றுவதால் பருவங்களும் உருவாவதைக் காண்க!",
    g5_sci_u2_t2_name: "நெம்புகோல் & கப்பிகள்",
    g5_sci_u2_t2_desc: "எளிய நெம்புகோல் மற்றும் கப்பிகளைப் பயன்படுத்தி பெரிய பாறைகளை எளிதாகத் தூக்குங்கள்!",
    g5_sci_u2_t3_name: "ஈர்ப்பு விசை மற்றும் உராய்வு",
    g5_sci_u2_t3_desc: "கண்ணுக்குத் தெரியாத ஈர்ப்பு விசையும், சக்கரங்களை மெதுவாக்கும் உராய்வும் எப்படி வேலை செய்கின்றன!",

    // Grade 5 Maths - Unit 1
    g5_mat_u1_title: "கோணங்கள் மற்றும் சமச்சீர்மை 📐",
    g5_mat_u1_desc: "கோணங்களில் லேசரைச் செலுத்தி சமச்சீர் வண்ணத்துப்பூச்சிகளை வரையுங்கள்!",
    g5_mat_u1_t1_name: "கோணங்களைக் கண்டறிதல்",
    g5_mat_u1_t1_desc: "குறுங்கோணம், செங்கோணம் மற்றும் விரிகோணங்களில் லேசர் பீரங்கியைச் செலுத்துங்கள்!",
    g5_mat_u1_t2_name: "சமச்சீர் கலைஞர்",
    g5_mat_u1_t2_desc: "கட்டம் வரைபடத்தில் சமச்சீர் கோட்டிற்கு மறுபுறம் வண்ணங்களைப் பிரதிபலிக்கவும்!",
    g5_mat_u1_t3_name: "பாகைமானி கொண்டு அளவிடுதல்",
    g5_mat_u1_t3_desc: "சறுக்கு பலகை சரிவு கோணத்தை பாகைமானி கொண்டு துல்லியமாக அளவிடுங்கள்!",

    // Grade 5 Maths - Unit 2
    g5_mat_u2_title: "தசமங்கள் & பணவியல் உலகம் 💰",
    g5_mat_u2_desc: "பத்தில் ஒன்று, நூறில் ஒன்று தசம மதிப்புகளைக் கற்று பலசரக்கு கடை கணக்குகளைத் தீருங்கள்!",
    g5_mat_u2_t1_name: "பத்தில் மற்றும் நூறில் ஒரு பங்கு",
    g5_mat_u2_t1_desc: "10x10 கட்டங்களில் வண்ணம் தீட்டி 0.1 மற்றும் 0.25 தசமங்களை அறியுங்கள்!",
    g5_mat_u2_t2_name: "பின்னங்களை தசமங்களாக மாற்றுதல்",
    g5_mat_u2_t2_desc: "1/2 ஐ 0.5 ஆகவும், 3/4 ஐ 0.75 ஆகவும் எண் கோட்டில் மாற்றுங்கள்!",
    g5_mat_u2_t3_name: "திறமைசாலி கடைக்காரர் கணக்குகள்",
    g5_mat_u2_t3_desc: "பொருட்களின் தசம ரூபாய் விலைகளைக் கூட்டி மீதி சில்லறையைக் கணக்கிடுங்கள்!"
  }
};

export const CURRICULUM_DATA = {
  4: {
    science: [
      {
        unitId: 1,
        titleKey: "g4_sci_u1_title",
        descKey: "g4_sci_u1_desc",
        topics: [
          { id: 1, nameKey: "g4_sci_u1_t1_name", descKey: "g4_sci_u1_t1_desc", gameType: "ChefPlate" },
          { id: 2, nameKey: "g4_sci_u1_t2_name", descKey: "g4_sci_u1_t2_desc", gameType: "DigestJourney" },
          { id: 3, nameKey: "g4_sci_u1_t3_name", descKey: "g4_sci_u1_t3_desc", gameType: "Preservation" }
        ]
      },
      {
        unitId: 2,
        titleKey: "g4_sci_u2_title",
        descKey: "g4_sci_u2_desc",
        topics: [
          { id: 4, nameKey: "g4_sci_u2_t1_name", descKey: "g4_sci_u2_t1_desc", gameType: "PlantsPhotosynthesis" },
          { id: 5, nameKey: "g4_sci_u2_t2_name", descKey: "g4_sci_u2_t2_desc", gameType: "ChefPlate" },
          { id: 6, nameKey: "g4_sci_u2_t3_name", descKey: "g4_sci_u2_t3_desc", gameType: "Preservation" }
        ]
      }
    ],
    maths: [
      {
        unitId: 1,
        titleKey: "g4_mat_u1_title",
        descKey: "g4_mat_u1_desc",
        topics: [
          { id: 1, nameKey: "g4_mat_u1_t1_name", descKey: "g4_mat_u1_t1_desc", gameType: "PizzaChef" },
          { id: 2, nameKey: "g4_mat_u1_t2_name", descKey: "g4_mat_u1_t2_desc", gameType: "BridgeBuilder" },
          { id: 3, nameKey: "g4_mat_u1_t3_name", descKey: "g4_mat_u1_t3_desc", gameType: "FractionBalance" }
        ]
      },
      {
        unitId: 2,
        titleKey: "g4_mat_u2_title",
        descKey: "g4_mat_u2_desc",
        topics: [
          { id: 4, nameKey: "g4_mat_u2_t1_name", descKey: "g4_mat_u2_t1_desc", gameType: "LaserAngles" },
          { id: 5, nameKey: "g4_mat_u2_t2_name", descKey: "g4_mat_u2_t2_desc", gameType: "ProtractorHero" },
          { id: 6, nameKey: "g4_mat_u2_t3_name", descKey: "g4_mat_u2_t3_desc", gameType: "MirrorSymmetry" }
        ]
      }
    ]
  },
  5: {
    science: [
      {
        unitId: 1,
        titleKey: "g5_sci_u1_title",
        descKey: "g5_sci_u1_desc",
        topics: [
          { id: 1, nameKey: "g5_sci_u1_t1_name", descKey: "g5_sci_u1_t1_desc", gameType: "SkeletonPuzzle" },
          { id: 2, nameKey: "g5_sci_u1_t2_name", descKey: "g5_sci_u1_t2_desc", gameType: "PuppetJoints" },
          { id: 3, nameKey: "g5_sci_u1_t3_name", descKey: "g5_sci_u1_t3_desc", gameType: "MuscleGym" }
        ]
      },
      {
        unitId: 2,
        titleKey: "g5_sci_u2_title",
        descKey: "g5_sci_u2_desc",
        topics: [
          { id: 4, nameKey: "g5_sci_u2_t1_name", descKey: "g5_sci_u2_t1_desc", gameType: "SolarSpace" },
          { id: 5, nameKey: "g5_sci_u2_t2_name", descKey: "g5_sci_u2_t2_desc", gameType: "PuppetJoints" },
          { id: 6, nameKey: "g5_sci_u2_t3_name", descKey: "g5_sci_u2_t3_desc", gameType: "MuscleGym" }
        ]
      }
    ],
    maths: [
      {
        unitId: 1,
        titleKey: "g5_mat_u1_title",
        descKey: "g5_mat_u1_desc",
        topics: [
          { id: 1, nameKey: "g5_mat_u1_t1_name", descKey: "g5_mat_u1_t1_desc", gameType: "LaserAngles" },
          { id: 2, nameKey: "g5_mat_u1_t2_name", descKey: "g5_mat_u1_t2_desc", gameType: "MirrorSymmetry" },
          { id: 3, nameKey: "g5_mat_u1_t3_name", descKey: "g5_mat_u1_t3_desc", gameType: "ProtractorHero" }
        ]
      },
      {
        unitId: 2,
        titleKey: "g5_mat_u2_title",
        descKey: "g5_mat_u2_desc",
        topics: [
          { id: 4, nameKey: "g5_mat_u2_t1_name", descKey: "g5_mat_u2_t1_desc", gameType: "PizzaChef" },
          { id: 5, nameKey: "g5_mat_u2_t2_name", descKey: "g5_mat_u2_t2_desc", gameType: "BridgeBuilder" },
          { id: 6, nameKey: "g5_mat_u2_t3_name", descKey: "g5_mat_u2_t3_desc", gameType: "FractionBalance" }
        ]
      }
    ]
  }
};

export default function Dashboard({ 
  stars = 0, 
  xp = 0,
  streak = 1,
  completedTopics = {}, 
  onSelectTopic, 
  selectedGrade = 4, 
  selectedSubject = 'science', 
  setSelectedSubject,
  language = 'en',
  onOpenAchievements
}) {
  const [selectedUnitIdx, setSelectedUnitIdx] = useState(0);
  const t = TRANSLATED_DATA[language || 'en'];

  const gradeCurriculum = CURRICULUM_DATA[selectedGrade] || CURRICULUM_DATA[4];
  const subjectUnits = gradeCurriculum[selectedSubject] || gradeCurriculum.science;
  const currentUnit = subjectUnits[selectedUnitIdx] || subjectUnits[0];

  const handleSubjectChange = (sub) => {
    playSound.click();
    setSelectedSubject(sub);
    setSelectedUnitIdx(0);
  };

  const handleUnitChange = (idx) => {
    playSound.click();
    setSelectedUnitIdx(idx);
  };

  const handleStartGame = (topic) => {
    playSound.chime();
    const localizedTopic = {
      ...topic,
      name: t[topic.nameKey],
      desc: t[topic.descKey],
      quizKey: `g${selectedGrade}_${selectedSubject}_u${currentUnit.unitId}_t${topic.id}`
    };
    onSelectTopic(localizedTopic);
  };

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', width: '100%', zIndex: 10, position: 'relative' }}>
      
      {/* 3D Glassmorphic Header */}
      <header 
        className="glass-panel" 
        style={{ 
          padding: '22px 25px', 
          marginBottom: '25px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '15px',
          background: 'rgba(255, 255, 255, 0.94)',
          borderBottom: '6px solid var(--color-primary-light)'
        }}
      >
        <div>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={34} color="var(--color-accent)" className="animate-star" />
            {t.dashboardTitle}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginTop: '4px', fontWeight: '500' }}>
            {language === 'en' 
              ? `CBSE Grade ${selectedGrade} Interactive AI 3D Study Platform` 
              : `சிபிஎஸ்இ வகுப்பு ${selectedGrade} முப்பரிமாண (3D) கல்விப் பக்கம்`}
          </p>
        </div>

        {/* Gamification HUD Scorecards */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Daily Streak */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'white',
            padding: '8px 14px',
            borderRadius: '16px',
            border: '2.5px solid #ff7675',
            boxShadow: '0 4px 0px rgba(0,0,0,0.05)'
          }}>
            <Flame size={20} color="#ff7675" fill="#ff7675" />
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{streak}</span>
            <span style={{ fontSize: '0.75rem', color: '#636e72' }}>{language === 'en' ? 'Streak' : 'தொடர்'}</span>
          </div>

          {/* Stars Scorecard */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'white',
            padding: '8px 14px',
            borderRadius: '16px',
            border: '2.5px solid var(--color-accent)',
            boxShadow: '0 4px 0px rgba(0,0,0,0.05)'
          }}>
            <Star fill="var(--color-accent)" color="var(--color-accent)" size={20} className="animate-star" />
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'var(--font-fun)' }}>{stars}</span>
          </div>

          {/* Total XP & Achievements Trigger */}
          <button
            onClick={() => { playSound.click(); if (onOpenAchievements) onOpenAchievements(); }}
            className="btn-playful btn-accent"
            style={{
              padding: '8px 16px',
              fontSize: '0.95rem',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title={language === 'en' ? 'View Trophies & XP' : 'கோப்பைகளைப் பார்'}
          >
            <Trophy size={18} />
            <span>{xp} XP</span>
          </button>
        </div>
      </header>

      {/* Subject and Unit Tabs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
        
        {/* Subject Toggle */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            className={`btn-playful ${selectedSubject === 'science' ? 'btn-accent' : 'btn-success'}`}
            style={{ flex: 1, padding: '14px', fontSize: '1.2rem', borderRadius: '18px' }}
            onClick={() => handleSubjectChange('science')}
          >
            {t.scienceTab}
          </button>
          <button 
            className={`btn-playful ${selectedSubject === 'maths' ? 'btn-accent' : 'btn-primary'}`}
            style={{ flex: 1, padding: '14px', fontSize: '1.2rem', borderRadius: '18px' }}
            onClick={() => handleSubjectChange('maths')}
          >
            {t.mathsTab}
          </button>
        </div>

        {/* Unit Selector Pills */}
        <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.85)', padding: '10px 15px', borderRadius: '18px', border: '2px solid white' }}>
          {subjectUnits.map((u, idx) => (
            <button
              key={u.unitId}
              onClick={() => handleUnitChange(idx)}
              style={{
                flex: 1,
                padding: '10px 15px',
                borderRadius: '12px',
                background: selectedUnitIdx === idx ? 'var(--color-primary)' : 'transparent',
                color: selectedUnitIdx === idx ? 'white' : 'var(--color-text-dark)',
                border: 'none',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>{t[`unit${idx + 1}`]}:</span>
              <span>{t[u.titleKey].split(' ')[0]}</span>
            </button>
          ))}
        </div>

      </div>

      {/* Active Unit Banner */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '24px 28px', 
          marginBottom: '25px', 
          background: 'linear-gradient(135deg, #ffffff 0%, #f1f2f6 100%)',
          borderBottom: '8px solid var(--color-primary)',
          boxShadow: '0 15px 35px rgba(0,0,0,0.08)'
        }}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ background: 'var(--color-primary-light)', color: 'white', padding: '4px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 'bold' }}>
            GRADE {selectedGrade} • {selectedSubject.toUpperCase()} • {t[`unit${selectedUnitIdx + 1}`]}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ff9f43', fontSize: '0.85rem', fontWeight: 'bold' }}>
            <Flame size={16} fill="#ff9f43" /> {t.activeLesson}
          </span>
        </div>
        <h2 style={{ fontSize: '2rem', color: 'var(--color-text-dark)', marginBottom: '8px' }}>
          {t[currentUnit.titleKey]}
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: '1.5' }}>
          {t[currentUnit.descKey]}
        </p>
      </div>

      {/* Topics Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '50px' }}>
        <h3 style={{ fontSize: '1.3rem', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.3)', fontFamily: 'var(--font-fun)' }}>
          📚 {t.chooseTopic}
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '22px' }}>
          {currentUnit.topics.map((topic, index) => {
            const isCompleted = completedTopics[`g${selectedGrade}_${topic.gameType}_t${topic.id}`];
            const isUnlocked = index === 0 || completedTopics[`g${selectedGrade}_${currentUnit.topics[index - 1].gameType}_t${currentUnit.topics[index - 1].id}`];
            
            return (
              <div 
                key={topic.id}
                className="glass-panel"
                style={{
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '15px',
                  opacity: isUnlocked ? 1 : 0.75,
                  background: isCompleted ? 'rgba(235, 252, 240, 0.96)' : 'rgba(255, 255, 255, 0.94)',
                  border: isCompleted ? '4px solid var(--color-success)' : '4px solid white',
                  borderBottom: isCompleted ? '8px solid var(--color-success)' : '8px solid #dfe4ea',
                  pointerEvents: isUnlocked ? 'auto' : 'none',
                  borderRadius: '24px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                      {t.topic} {index + 1}
                    </span>
                    {isCompleted && (
                      <span style={{ background: 'var(--color-success)', color: 'white', padding: '3px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {t.completed}
                      </span>
                    )}
                    {!isUnlocked && (
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                        🔒 Locked
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--color-text-dark)', marginBottom: '8px' }}>
                    {t[topic.nameKey]}
                  </h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: '1.4' }}>
                    {t[topic.descKey]}
                  </p>

                  {/* 4-Stage Feature Badges */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                      🎬 Video
                    </span>
                    <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                      📖 Flashcards
                    </span>
                    <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                      🎮 Lab Game
                    </span>
                    <span style={{ background: '#f3e8ff', color: '#7e22ce', fontSize: '0.7rem', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                      🏆 Quiz
                    </span>
                  </div>
                </div>

                <button 
                  className={`btn-playful ${isCompleted ? 'btn-success' : 'btn-primary'}`}
                  style={{ width: '100%', padding: '12px', fontSize: '1rem', borderRadius: '14px' }}
                  onClick={() => handleStartGame(topic)}
                  disabled={!isUnlocked}
                >
                  {isCompleted ? t.replay : t.start}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}
