const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const groqKeyMatch = envFile.match(/GROQ_1=(.+)/);
const apiKey = groqKeyMatch ? groqKeyMatch[1].trim() : null;

if (!apiKey) {
  console.error("GROQ_1 key not found");
  process.exit(1);
}

const en = {
  tagline: 'PROTOTYPE <br> Listen to Science, Not Marketing.',
  splashDesc: 'Exposing the truth behind misleading food labels and empowering every household to make smarter, healthier decisions.',
  startScanning: 'Start Scanning',
  productsScanned: 'Products Scanned',
  accuracy: 'Accuracy',
  userRating: 'User Rating',
  howItWorks: 'How It Works',
  howItWorksSub: 'Three simple steps to uncover the truth',
  step1Title: 'Scan Barcode',
  step1Desc: 'Scan a product barcode using your camera or type the product name to begin analysis.',
  step2Title: 'AI Analyzes',
  step2Desc: 'Our AI decodes every ingredient, chemical, and hidden additive in seconds.',
  step3Title: 'Get Your Verdict',
  step3Desc: 'Receive a color-coded health score with detailed breakdown and alternatives.',
  continue: 'Continue',
  analyzeProduct: 'Analyze a Product',
  analyzeProductSub: 'Choose how you want to scan',
  textSearch: 'Text Search',
  cameraUpload: 'Barcode Scan',
  searchPlaceholder: 'e.g. Maggi Noodles, Bournvita, Coca-Cola...',
  startCamera: 'Start Camera Scanner',
  stopCamera: 'Stop Camera',
  uploadBarcode: 'Upload Barcode Image',
  barcodeDetected: 'Barcode Detected',
  barcodeNotDetected: 'Could not detect a barcode. Please try again with a clearer image.',
  analyzeProduct2: 'Analyze Product',
  recentScans: 'Recent Scans',
  analyzing: 'Analyzing Product...',
  fetchingData: 'Fetching product data from the web...',
  lStep1: 'Searching product info',
  lStep2: 'Analyzing ingredients',
  lStep3: 'Calculating health score',
  healthScale: 'Health Scale',
  avoid: 'Avoid',
  moderate: 'Moderate',
  safe: 'Safe',
  sugarLevel: 'Sugar Level',
  processing: 'Processing',
  additives: 'Additives',
  allergyWarning: 'Allergy Warning',
  viewFullReport: 'View Full Report',
  scanAnother: 'Scan Another Product',
  detailedReport: 'Detailed Report',
  ingredientBreakdown: 'Ingredient Breakdown',
  hiddenTruth: 'The Hidden Truth',
  harmfulComponents: 'Harmful Components',
  sugarOilWarning: 'Sugar & Oil Warning',
  alternatives: 'Healthier Alternatives',
  backToSummary: 'Back to Summary',
  shareReport: 'Share Report',
  oops: 'Oops!',
  tryAgain: 'Try Again',
  safe_verdict: 'Safe to Consume',
  moderate_verdict: 'Use with Caution',
  avoid_verdict: 'Avoid This Product',
  noResults: 'No results found. Try a different product name.',
  apiError: 'Could not connect to the analysis service. Please check your internet connection and try again.',
  voiceNotSupported: 'Voice input is not supported in your browser.',
  copied: 'Report link copied!',
  aboutTagline: 'Listen to Science, Not Marketing.',
  aboutDesc: 'PureScan is an AI-powered transparency app that exposes the hidden truth behind misleading food labels and empowers every Indian household to make smarter, healthier decisions.',
  founders: 'Founders',
  developer: 'Developer',
  madeWithLove: 'Made with ❤️ in India',
  or: 'or'
};

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'hinglish', name: 'Hinglish' },
  { code: 'mr', name: 'मराठी' },
  { code: 'gu', name: 'ગુજરાતી' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'മലയാളം' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ' }
];

async function translate(langName) {
  const prompt = `Translate the following JSON object's values into ${langName}. 
  Maintain strictly the same JSON structure and keys. 
  Do NOT translate the HTML tags like <br>. 
  ONLY return the translated valid JSON object and absolutely no other text.
  JSON to translate:
  ${JSON.stringify(en)}
  `;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    })
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API Error: ${res.status} HTTP - ${txt}`);
  }

  const data = await res.json();
  if (!data.choices) throw new Error("No choices returned: " + JSON.stringify(data));
  return JSON.parse(data.choices[0].message.content);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  const result = { en };
  for (const lang of languages) {
    if (lang.code === 'en') continue;
    console.log(`Translating to ${lang.name}...`);
    let success = false;
    let attempts = 0;
    while (!success && attempts < 3) {
      try {
        const trans = await translate(lang.name);
        result[lang.code] = trans;
        success = true;
      } catch (e) {
        attempts++;
        console.error(`Failed ${lang.name} (Attempt ${attempts}):`, e.message);
        if (attempts < 3) {
          console.log("Sleeping for 5 seconds before retry...");
          await sleep(5000);
        }
      }
    }
    await sleep(2000); // Prevent rate limiting
  }
  
  const content = `const TRANSLATIONS = ${JSON.stringify(result, null, 2)};`;
  fs.writeFileSync('translations_generated.js', content);
  console.log('Done writing translations_generated.js');
}

run();
