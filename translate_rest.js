const fs = require('fs');
const https = require('https');

function translateText(text, targetLang) {
  return new Promise((resolve, reject) => {
    let url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          let translated = '';
          parsed[0].forEach(p => { translated += p[0]; });
          resolve(translated);
        } catch(e) { resolve(text); } // fallback
      });
    }).on('error', (e) => reject(e));
  });
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

async function run() {
  const txt = fs.readFileSync('translations_generated.js', 'utf8');
  const match = txt.match(/const TRANSLATIONS = (\{[\s\S]+\});/);
  const result = JSON.parse(match[1]);

  for (const lang of languages) {
    console.log(`Translating to ${lang.name}...`);
    let obj = {};
    for (const [key, val] of Object.entries(en)) {
         if (val.includes('<br>')) {
             let parts = val.split('<br>');
             let t0 = await translateText(parts[0], lang.code);
             let t1 = await translateText(parts[1], lang.code);
             obj[key] = t0 + '<br>' + t1;
         } else {
             obj[key] = await translateText(val, lang.code);
         }
    }
    result[lang.code] = obj;
  }
  
  const content = `const TRANSLATIONS = ${JSON.stringify(result, null, 2)};`;
  fs.writeFileSync('translations_generated.js', content);
  console.log('All missing translations added via Google Translate API.');
}
run();
