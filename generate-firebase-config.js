const fs = require('fs');
const path = require('path');

console.log("[PureScan Config Builder] Starting Firebase environment audit...");

// 1. Manually load environment variables from .env
function loadEnv() {
  const envVars = { ...process.env };
  try {
    let currentDir = __dirname;
    let envLoaded = false;
    for (let i = 0; i < 10; i++) {
      const envPath = path.join(currentDir, '.env');
      if (fs.existsSync(envPath)) {
        console.log(`[PureScan Config Builder] Found .env file at: ${envPath}`);
        const content = fs.readFileSync(envPath, 'utf8');
        parseEnvContent(content, envVars);
        envLoaded = true;
        break;
      }
      const parent = path.dirname(currentDir);
      if (parent === currentDir) break;
      currentDir = parent;
    }
    if (!envLoaded) {
      const cwdEnv = path.join(process.cwd(), '.env');
      if (fs.existsSync(cwdEnv)) {
        console.log(`[PureScan Config Builder] Found .env file at: ${cwdEnv}`);
        const content = fs.readFileSync(cwdEnv, 'utf8');
        parseEnvContent(content, envVars);
      }
    }
  } catch (err) {
    console.error("[PureScan Config Builder] Error loading .env file:", err.message);
  }
  return envVars;
}

function parseEnvContent(content, envVars) {
  const lines = content.split(/\r?\n/);
  const keysInFile = new Set();
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return;
    const match = trimmed.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      
      if (keysInFile.has(key)) {
        console.warn(`[PureScan Config Builder] ⚠️ Duplicate env variable detected in .env line ${idx + 1}: ${key}`);
      }
      keysInFile.add(key);
      envVars[key] = value.trim();
    }
  });
}

const env = loadEnv();

// Required Firebase Keys
const REQUIRED_KEYS = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_APP_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_PROJECT_NUMBER'
];

let hasErrors = false;
const verifiedVars = {};

console.log("[PureScan Config Builder] Validating environment keys...");
REQUIRED_KEYS.forEach(key => {
  const val = env[key];
  if (!val) {
    console.error(`[PureScan Config Builder] ❌ Missing environment variable: ${key}`);
    hasErrors = true;
  } else if (val.includes('[') || val.includes(']')) {
    console.error(`[PureScan Config Builder] ❌ Invalid value for ${key} (contains template braces): ${val}`);
    hasErrors = true;
  } else {
    console.log(`[PureScan Config Builder] ✅ Verified ${key} (Length: ${val.length})`);
    verifiedVars[key] = val;
  }
});

// Detect potentially unused or misspelled keys starting with FIREBASE_
Object.keys(env).forEach(key => {
  if (key.startsWith('FIREBASE_') && !REQUIRED_KEYS.includes(key)) {
    console.warn(`[PureScan Config Builder] ⚠️ Unused or unrecognized Firebase key: ${key}`);
  }
});

if (hasErrors) {
  console.error("[PureScan Config Builder] ❌ Configuration failed validation. Missing keys in environment.");
  process.exit(1);
}

// 2. Perform replacement
try {
  const templatePath = path.join(__dirname, 'js', 'firebase-config.template.js');
  const outputPath = path.join(__dirname, 'js', 'firebase-config.js');

  if (!fs.existsSync(templatePath)) {
    console.error(`[PureScan Config Builder] ❌ Template file not found: ${templatePath}`);
    process.exit(1);
  }

  let content = fs.readFileSync(templatePath, 'utf8');

  content = content.replace(/\[\[FIREBASE_PROJECT_ID\]\]/g, verifiedVars.FIREBASE_PROJECT_ID);
  content = content.replace(/\[\[FIREBASE_APP_ID\]\]/g, verifiedVars.FIREBASE_APP_ID);
  content = content.replace(/\[\[FIREBASE_STORAGE_BUCKET\]\]/g, verifiedVars.FIREBASE_STORAGE_BUCKET);
  content = content.replace(/\[\[FIREBASE_API_KEY\]\]/g, verifiedVars.FIREBASE_API_KEY);
  content = content.replace(/\[\[FIREBASE_AUTH_DOMAIN\]\]/g, verifiedVars.FIREBASE_AUTH_DOMAIN);
  content = content.replace(/\[\[FIREBASE_MESSAGING_SENDER_ID\]\]/g, verifiedVars.FIREBASE_MESSAGING_SENDER_ID);
  content = content.replace(/\[\[FIREBASE_PROJECT_NUMBER\]\]/g, verifiedVars.FIREBASE_PROJECT_NUMBER);

  fs.writeFileSync(outputPath, content, 'utf8');
  console.log("[PureScan Config Builder] 🎉 Successfully generated js/firebase-config.js");
} catch (err) {
  console.error("[PureScan Config Builder] ❌ Failed to write config file:", err.message);
  process.exit(1);
}
