// src/data/skills.js
// The only skills a user can pick. Add to this list to grow the catalogue.
// Each entry: [name, category, ...extra search keywords]
// "Related" suggestions in the picker come from sharing a category or keyword.

const RAW = [
  // --- Programming & Web ---
  ["JavaScript", "Programming", "js", "web", "frontend", "node"],
  ["TypeScript", "Programming", "ts", "web", "frontend"],
  ["Python", "Programming", "py", "data", "scripting", "ai"],
  ["Java", "Programming", "backend", "android", "oop"],
  ["C", "Programming", "systems", "embedded"],
  ["C++", "Programming", "cpp", "systems", "dsa", "competitive"],
  ["C#", "Programming", "csharp", ".net", "unity", "games"],
  ["Go", "Programming", "golang", "backend"],
  ["Rust", "Programming", "systems", "backend"],
  ["PHP", "Programming", "web", "backend", "laravel"],
  ["Kotlin", "Programming", "android", "mobile"],
  ["Swift", "Programming", "ios", "mobile", "apple"],
  ["SQL", "Programming", "database", "data", "mysql", "postgres"],
  ["Data Structures & Algorithms", "Programming", "dsa", "competitive", "coding interview", "leetcode"],
  ["Competitive Programming", "Programming", "dsa", "codeforces", "leetcode"],
  ["Git & GitHub", "Programming", "version control", "git", "github"],
  ["Linux & Shell Scripting", "Programming", "bash", "terminal", "command line"],
  ["Web Development", "Web", "html", "css", "frontend", "full stack", "website"],
  ["HTML & CSS", "Web", "frontend", "web", "website", "styling"],
  ["React", "Web", "reactjs", "frontend", "javascript", "web"],
  ["Next.js", "Web", "nextjs", "react", "frontend", "full stack"],
  ["Vue.js", "Web", "vue", "frontend", "javascript"],
  ["Angular", "Web", "frontend", "typescript"],
  ["Tailwind CSS", "Web", "tailwind", "css", "frontend", "styling"],
  ["Node.js", "Web", "node", "backend", "javascript", "express"],
  ["Express.js", "Web", "express", "node", "backend"],
  ["Django", "Web", "python", "backend"],
  ["Flask", "Web", "python", "backend"],
  ["REST API Design", "Web", "api", "backend"],
  ["GraphQL", "Web", "api", "backend"],
  ["Firebase", "Web", "backend", "firestore", "auth"],
  ["MongoDB", "Web", "database", "nosql", "backend"],
  ["PostgreSQL", "Web", "database", "sql", "backend"],
  ["WordPress", "Web", "cms", "website", "php"],
  ["Mobile App Development", "Mobile", "android", "ios", "app"],
  ["Android Development", "Mobile", "kotlin", "java", "app"],
  ["iOS Development", "Mobile", "swift", "app", "apple"],
  ["Flutter", "Mobile", "dart", "app", "cross platform"],
  ["React Native", "Mobile", "app", "javascript", "cross platform"],

  // --- AI, Data & Security ---
  ["Machine Learning", "AI & Data", "ml", "ai", "data science"],
  ["Deep Learning", "AI & Data", "neural networks", "ai", "pytorch", "tensorflow"],
  ["Artificial Intelligence", "AI & Data", "ai", "ml"],
  ["Natural Language Processing", "AI & Data", "nlp", "ai", "text", "llm"],
  ["Computer Vision", "AI & Data", "cv", "opencv", "ai", "image"],
  ["Prompt Engineering", "AI & Data", "llm", "ai", "chatgpt"],
  ["Data Science", "AI & Data", "data", "analytics", "python", "ml"],
  ["Data Analysis", "AI & Data", "analytics", "excel", "python", "sql"],
  ["Data Visualization", "AI & Data", "charts", "tableau", "power bi", "analytics"],
  ["Power BI", "AI & Data", "dashboard", "analytics", "microsoft"],
  ["Tableau", "AI & Data", "dashboard", "analytics"],
  ["Microsoft Excel", "AI & Data", "excel", "spreadsheet", "analytics", "office"],
  ["Statistics", "AI & Data", "probability", "data", "maths"],
  ["Cryptography", "Security", "encryption", "security", "cyber"],
  ["Network Security", "Security", "cyber", "security", "firewall"],
  ["Cybersecurity", "Security", "security", "hacking", "infosec"],
  ["Ethical Hacking", "Security", "pentest", "cyber", "security", "kali"],
  ["Computer Networks", "Security", "networking", "tcp", "ccna"],
  ["Cloud Computing", "DevOps", "aws", "azure", "gcp", "cloud"],
  ["AWS", "DevOps", "amazon", "cloud"],
  ["Docker", "DevOps", "containers", "devops"],
  ["Kubernetes", "DevOps", "containers", "devops", "k8s"],
  ["DevOps", "DevOps", "ci cd", "docker", "automation"],
  ["Embedded Systems", "Electronics", "arduino", "microcontroller", "iot"],
  ["Arduino", "Electronics", "embedded", "iot", "electronics"],
  ["Raspberry Pi", "Electronics", "embedded", "iot", "electronics"],
  ["Internet of Things", "Electronics", "iot", "embedded", "sensors"],
  ["Electronics", "Electronics", "circuits", "hardware"],
  ["Robotics", "Electronics", "automation", "arduino", "engineering"],
  ["Game Development", "Games", "unity", "unreal", "games", "gamedev"],
  ["Unity", "Games", "game development", "c#", "games"],
  ["Blockchain", "Programming", "web3", "crypto", "ethereum"],
  ["Software Testing", "Programming", "qa", "automation", "selenium"],

  // --- Design & Creative ---
  ["UI/UX Design", "Design", "ui", "ux", "user interface", "product design"],
  ["Figma", "Design", "ui", "ux", "prototyping", "design"],
  ["Graphic Design", "Design", "photoshop", "illustrator", "branding", "poster"],
  ["Logo Design", "Design", "branding", "graphic design"],
  ["Adobe Photoshop", "Design", "photoshop", "photo editing", "graphic design"],
  ["Adobe Illustrator", "Design", "vector", "graphic design", "illustration"],
  ["Canva", "Design", "graphic design", "social media", "poster"],
  ["Motion Graphics", "Design", "after effects", "animation", "video"],
  ["Animation", "Design", "2d", "3d", "motion", "blender"],
  ["3D Modeling", "Design", "blender", "maya", "cad"],
  ["Blender", "Design", "3d", "animation", "modeling"],
  ["AutoCAD", "Design", "cad", "drafting", "engineering"],
  ["Illustration", "Design", "drawing", "digital art", "art"],
  ["Drawing & Sketching", "Art", "pencil", "art", "sketch"],
  ["Painting", "Art", "watercolor", "acrylic", "oil", "art"],
  ["Calligraphy", "Art", "handwriting", "lettering", "art"],
  ["Mehndi Design", "Art", "henna", "art", "indian"],
  ["Rangoli", "Art", "art", "indian", "festival"],
  ["Photography", "Creative", "camera", "photo", "lightroom"],
  ["Photo Editing", "Creative", "lightroom", "photoshop", "photography"],
  ["Videography", "Creative", "video", "camera", "filming"],
  ["Video Editing", "Creative", "premiere pro", "davinci resolve", "reels", "youtube"],
  ["Adobe Premiere Pro", "Creative", "video editing", "adobe"],
  ["DaVinci Resolve", "Creative", "video editing", "color grading"],
  ["Content Creation", "Creative", "youtube", "instagram", "social media", "reels"],
  ["Podcasting", "Creative", "audio", "content", "recording"],
  ["Fashion Design", "Creative", "sewing", "clothing", "textile"],
  ["Interior Design", "Creative", "decor", "home", "architecture"],

  // --- Music & Performing Arts ---
  ["Guitar", "Music", "acoustic", "electric", "strings"],
  ["Piano", "Music", "keyboard", "keys"],
  ["Keyboard", "Music", "piano", "synth"],
  ["Violin", "Music", "strings"],
  ["Drums", "Music", "percussion"],
  ["Tabla", "Music", "indian classical", "percussion"],
  ["Flute", "Music", "wind", "bansuri"],
  ["Ukulele", "Music", "strings"],
  ["Singing", "Music", "vocals", "voice"],
  ["Hindustani Classical Music", "Music", "indian classical", "vocals", "raag"],
  ["Carnatic Music", "Music", "indian classical", "vocals"],
  ["Music Production", "Music", "fl studio", "ableton", "beats", "dj"],
  ["DJing", "Music", "music production", "mixing"],
  ["Songwriting", "Music", "lyrics", "composition"],
  ["Music Theory", "Music", "composition", "notation"],
  ["Dancing", "Performing Arts", "dance", "choreography"],
  ["Bollywood Dance", "Performing Arts", "dance", "indian"],
  ["Classical Dance", "Performing Arts", "bharatanatyam", "kathak", "indian", "dance"],
  ["Hip Hop Dance", "Performing Arts", "dance", "street"],
  ["Acting", "Performing Arts", "theatre", "drama"],
  ["Stand-up Comedy", "Performing Arts", "comedy", "performance"],
  ["Public Speaking", "Communication", "speech", "presentation", "confidence"],
  ["Anchoring & Hosting", "Performing Arts", "emcee", "public speaking"],

  // --- Languages ---
  ["English Speaking", "Languages", "english", "spoken english", "fluency", "communication"],
  ["English Writing", "Languages", "english", "writing", "grammar"],
  ["IELTS Preparation", "Languages", "english", "exam", "ielts"],
  ["Hindi", "Languages", "language", "indian"],
  ["Marathi", "Languages", "language", "indian"],
  ["Gujarati", "Languages", "language", "indian"],
  ["Tamil", "Languages", "language", "indian"],
  ["Telugu", "Languages", "language", "indian"],
  ["Kannada", "Languages", "language", "indian"],
  ["Malayalam", "Languages", "language", "indian"],
  ["Bengali", "Languages", "language", "indian"],
  ["Punjabi", "Languages", "language", "indian"],
  ["Urdu", "Languages", "language", "indian"],
  ["Sanskrit", "Languages", "language", "indian"],
  ["Spanish", "Languages", "language", "espanol"],
  ["French", "Languages", "language", "francais"],
  ["German", "Languages", "language", "deutsch"],
  ["Japanese", "Languages", "language", "nihongo", "jlpt"],
  ["Korean", "Languages", "language", "hangul", "topik"],
  ["Mandarin Chinese", "Languages", "language", "chinese"],
  ["Arabic", "Languages", "language"],
  ["Russian", "Languages", "language"],
  ["Italian", "Languages", "language"],
  ["Portuguese", "Languages", "language"],
  ["Sign Language", "Languages", "language", "accessibility"],

  // --- Business, Career & Writing ---
  ["Digital Marketing", "Business", "marketing", "seo", "social media", "ads"],
  ["SEO", "Business", "digital marketing", "search", "website"],
  ["Social Media Marketing", "Business", "digital marketing", "instagram", "content"],
  ["Content Writing", "Writing", "blog", "copywriting", "seo"],
  ["Copywriting", "Writing", "marketing", "ads", "content"],
  ["Creative Writing", "Writing", "stories", "poetry", "fiction"],
  ["Technical Writing", "Writing", "documentation", "content"],
  ["Poetry", "Writing", "creative writing", "shayari"],
  ["Blogging", "Writing", "content", "writing"],
  ["Resume & Interview Prep", "Career", "career", "jobs", "placement", "interview"],
  ["Entrepreneurship", "Business", "startup", "business", "founder"],
  ["Startup Fundraising", "Business", "startup", "pitch", "investors"],
  ["Product Management", "Business", "product", "agile", "startup"],
  ["Project Management", "Business", "agile", "scrum", "management"],
  ["Business Analysis", "Business", "analytics", "requirements"],
  ["Financial Literacy", "Finance", "money", "budgeting", "personal finance"],
  ["Stock Market Basics", "Finance", "investing", "trading", "shares"],
  ["Accounting", "Finance", "tally", "bookkeeping", "gst"],
  ["Tally", "Finance", "accounting", "gst"],
  ["Sales & Negotiation", "Business", "selling", "communication"],
  ["Leadership", "Business", "management", "teams"],
  ["Time Management", "Productivity", "productivity", "study skills"],
  ["Notion & Productivity Tools", "Productivity", "notion", "organization"],
  ["Study Skills", "Productivity", "exam", "learning", "memory"],
  ["Speed Reading", "Productivity", "reading", "study skills"],
  ["Critical Thinking", "Productivity", "logic", "reasoning"],

  // --- Academics & Exams ---
  ["Mathematics", "Academics", "maths", "algebra", "calculus"],
  ["Physics", "Academics", "science", "jee", "neet"],
  ["Chemistry", "Academics", "science", "jee", "neet"],
  ["Biology", "Academics", "science", "neet"],
  ["JEE Preparation", "Academics", "engineering entrance", "physics", "maths", "chemistry"],
  ["NEET Preparation", "Academics", "medical entrance", "biology", "physics", "chemistry"],
  ["GATE Preparation", "Academics", "engineering", "exam"],
  ["UPSC Preparation", "Academics", "civil services", "ias", "exam", "current affairs"],
  ["MPSC Preparation", "Academics", "civil services", "exam", "maharashtra"],
  ["CAT Preparation", "Academics", "mba", "aptitude", "exam"],
  ["Quantitative Aptitude", "Academics", "maths", "aptitude", "placement"],
  ["Logical Reasoning", "Academics", "aptitude", "placement", "logic"],
  ["Economics", "Academics", "commerce", "finance"],
  ["History", "Academics", "humanities", "upsc"],
  ["Geography", "Academics", "humanities", "upsc"],
  ["Psychology", "Academics", "mind", "behaviour"],
  ["Chess", "Games", "strategy", "board game"],
  ["Rubik's Cube", "Games", "puzzle", "speedcubing"],
  ["Sudoku & Puzzles", "Games", "logic", "puzzle"],

  // --- Lifestyle, Health & Hobbies ---
  ["Yoga", "Health & Fitness", "wellness", "flexibility", "meditation"],
  ["Meditation", "Health & Fitness", "mindfulness", "wellness", "yoga"],
  ["Pranayama", "Health & Fitness", "breathing", "yoga", "wellness"],
  ["Gym & Strength Training", "Health & Fitness", "workout", "fitness", "weights"],
  ["Calisthenics", "Health & Fitness", "bodyweight", "fitness", "workout"],
  ["Running", "Health & Fitness", "marathon", "fitness", "cardio"],
  ["Cycling", "Health & Fitness", "bike", "fitness", "outdoors"],
  ["Swimming", "Health & Fitness", "sports", "fitness"],
  ["Cricket", "Sports", "bat", "bowling", "sports"],
  ["Football", "Sports", "soccer", "sports"],
  ["Badminton", "Sports", "racket", "sports"],
  ["Table Tennis", "Sports", "racket", "sports"],
  ["Basketball", "Sports", "sports"],
  ["Volleyball", "Sports", "sports"],
  ["Kabaddi", "Sports", "indian", "sports"],
  ["Martial Arts", "Sports", "karate", "taekwondo", "self defence"],
  ["Karate", "Sports", "martial arts", "self defence"],
  ["Self Defence", "Sports", "martial arts", "safety"],
  ["Nutrition & Diet Planning", "Health & Fitness", "diet", "food", "fitness", "health"],
  ["Cooking", "Food", "recipes", "kitchen", "chef"],
  ["Indian Cooking", "Food", "cooking", "recipes", "curry"],
  ["Baking", "Food", "cakes", "bread", "desserts"],
  ["Cake Decorating", "Food", "baking", "desserts"],
  ["Gardening", "Hobbies", "plants", "organic", "terrace garden"],
  ["Knitting & Crochet", "Crafts", "crafts", "yarn", "handmade"],
  ["Sewing & Stitching", "Crafts", "tailoring", "fashion", "handmade"],
  ["Embroidery", "Crafts", "stitching", "handmade"],
  ["Origami & Paper Craft", "Crafts", "crafts", "handmade", "diy"],
  ["Pottery", "Crafts", "clay", "handmade", "art"],
  ["Woodworking", "Crafts", "carpentry", "diy", "handmade"],
  ["DIY & Home Repair", "Crafts", "repair", "tools", "handmade"],
  ["Candle & Soap Making", "Crafts", "handmade", "diy"],
  ["Driving (Car)", "Life Skills", "car", "learner", "license"],
  ["Two-Wheeler Riding", "Life Skills", "bike", "scooter", "learner"],
  ["Mobile Repair", "Life Skills", "repair", "electronics"],
  ["Travel Planning", "Life Skills", "trips", "budget travel", "itinerary"],
  ["Trekking & Hiking", "Hobbies", "outdoors", "adventure", "camping"],
  ["Birdwatching", "Hobbies", "nature", "outdoors"],
  ["Astronomy", "Hobbies", "stars", "space", "science"],
  ["Magic Tricks", "Hobbies", "performance", "cards"],
  ["Parenting & Child Care", "Life Skills", "kids", "family"],
  ["First Aid", "Life Skills", "safety", "health"],
];

const SKILLS = RAW.map(([name, category, ...keywords]) => ({
  name,
  category,
  keywords: keywords.map((k) => k.toLowerCase()),
  _name: name.toLowerCase(),
}));

export const SKILL_NAMES = new Set(SKILLS.map((s) => s.name));

export function isValidSkill(name) {
  return SKILL_NAMES.has(name);
}

// Case-insensitive lookup that returns the canonical spelling (or null).
export function canonicalSkill(name) {
  const n = (name || "").trim().toLowerCase();
  const hit = SKILLS.find((s) => s._name === n);
  return hit ? hit.name : null;
}

// Returns { matches, related }.
//  matches = skills whose name/keywords match what was typed (best first)
//  related = other skills in the same category as the top matches
export function searchSkills(query, { exclude = [], limit = 8, relatedLimit = 4 } = {}) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return { matches: [], related: [] };
  const excluded = new Set(exclude.map((e) => e.toLowerCase()));

  const scored = [];
  for (const s of SKILLS) {
    if (excluded.has(s._name)) continue;
    let score = 0;
    if (s._name === q) score = 100;
    else if (s._name.startsWith(q)) score = 90;
    else if (s._name.split(/[\s/&.-]+/).some((w) => w.startsWith(q))) score = 75;
    else if (s.keywords.some((k) => k === q)) score = 80;
    else if (q.length >= 3 && s._name.includes(q)) score = 60;
    else if (s.keywords.some((k) => k.startsWith(q))) score = 45;
    else if (q.length >= 3 && s.keywords.some((k) => k.includes(q))) score = 30;
    else if (s.category.toLowerCase().startsWith(q)) score = 25;
    if (score) scored.push({ s, score });
  }
  scored.sort((a, b) => b.score - a.score || a.s.name.localeCompare(b.s.name));

  const matches = scored.slice(0, limit).map((x) => x.s);

  const matchedNames = new Set(matches.map((m) => m.name));
  const topCategories = [...new Set(matches.slice(0, 3).map((m) => m.category))];
  const related = SKILLS.filter(
    (s) => topCategories.includes(s.category) && !matchedNames.has(s.name) && !excluded.has(s._name)
  ).slice(0, relatedLimit);

  return { matches, related };
}

export default SKILLS;
