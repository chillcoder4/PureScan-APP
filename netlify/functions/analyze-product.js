/* =============================================
   PureScan — Netlify Serverless Function
   Secure backend for API calls (SERPER + GROQ)
   ============================================= */
const fs = require('fs');
const path = require('path');

// Manually load .env file by walking up from __dirname or falling back to process.cwd()
try {
  let envLoaded = false;
  let currentDir = __dirname;
  for (let i = 0; i < 10; i++) {
    const envPath = path.join(currentDir, '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return;
        const match = trimmed.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
          process.env[key] = value.trim();
        }
      });
      envLoaded = true;
      break;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }

  if (!envLoaded) {
    const cwdEnvPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(cwdEnvPath)) {
      const envContent = fs.readFileSync(cwdEnvPath, 'utf8');
      envContent.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return;
        const match = trimmed.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
          process.env[key] = value.trim();
        }
      });
    }
  }
} catch (err) {
  console.error('Failed to load .env file manually in analyze-product:', err);
}


// ==========================================
// CONFIGURATION (from Netlify env vars)
// ==========================================
const SERPER_URL = 'https://google.serper.dev/search';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

/**
 * Get API keys securely from environment variables
 */
function getSerperKeys() {
  return [
    process.env.SERPER_API_KEY,
    process.env.SERPER_API_KEY2
  ].filter(Boolean);
}

function getGroqKeys() {
  return [
    process.env.GROQ_1,
    process.env.GROQ_2,
    process.env.GROQ_3,
    process.env.GROQ_4,
    process.env.GROQ_5
  ].filter(Boolean);
}

// ==========================================
// SERPER SEARCH (with key failover)
// ==========================================
/**
 * Detect if input contains a barcode number (8-13 digit numeric string)
 */
function extractBarcode(input) {
  const match = input.match(/\b(\d{8,14})\b/);
  return match ? match[1] : null;
}

/**
 * Check if string is a pure barcode numeric identifier
 */
function isBarcode(str) {
  return /^\d{8,14}$/.test(str.trim());
}

/**
 * Fetch product details from Open Food Facts API (no key required)
 */
async function fetchFromOpenFoodFacts(barcode) {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`, {
      headers: {
        'User-Agent': 'PureScan - Web - v1.1.0'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      const data = await response.json();
      if (data.status === 1 && data.product) {
        console.log(`[PureScan] OFF match found: ${data.product.product_name || 'Unnamed'}`);
        return data.product;
      }
    }
  } catch (err) {
    console.warn(`[PureScan] OFF barcode lookup failed for ${barcode}:`, err.message);
  }
  return null;
}

async function searchProduct(searchQuery) {
  const keys = getSerperKeys();
  const errors = [];

  for (let i = 0; i < keys.length; i++) {
    try {
      const response = await fetch(SERPER_URL, {
        method: 'POST',
        headers: {
          'X-API-KEY': keys[i],
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: searchQuery,
          num: 10
        })
      });

      if (!response.ok) {
        throw new Error(`Serper API returned ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      errors.push(`Serper key ${i + 1}: ${err.message}`);
      console.warn(`Serper key ${i + 1} failed:`, err.message);
    }
  }

  console.error('All Serper keys failed:', errors);
  return null;
}

// ==========================================
// GROQ AI ANALYSIS (with 5-key failover)
// ==========================================
async function analyzeWithAI(productName, searchData, targetLanguage, barcodeNum = null, offData = null) {
  // Build context from search results and Open Food Facts
  let context = '';
  
  if (barcodeNum) {
    context += `Scanned Barcode Number: ${barcodeNum}\n\n`;
  }
  
  if (offData) {
    context += `Open Food Facts Database Entry:\n`;
    context += `Product Name: ${offData.product_name || offData.product_name_en || ''}\n`;
    context += `Brand/Manufacturer: ${offData.brands || ''}\n`;
    if (offData.ingredients_text || offData.ingredients_text_en) {
      context += `Ingredients List: ${offData.ingredients_text || offData.ingredients_text_en}\n`;
    }
    if (offData.nutriments) {
      context += `Nutritional Values (100g): ${JSON.stringify(offData.nutriments)}\n`;
    }
    context += `\n`;
  }

  if (searchData) {
    context += `Google Web Search Results:\n`;
    if (searchData.organic) {
      context += searchData.organic.map(r =>
        `Title: ${r.title}\nSnippet: ${r.snippet || ''}\nLink: ${r.link || ''}`
      ).join('\n\n');
    }
    if (searchData.knowledgeGraph) {
      const kg = searchData.knowledgeGraph;
      context += `\n\nKnowledge Graph:\nTitle: ${kg.title || ''}\nDescription: ${kg.description || ''}\n`;
      if (kg.attributes) {
        context += Object.entries(kg.attributes).map(([k, v]) => `${k}: ${v}`).join('\n');
      }
    }
  }

  const systemPrompt = `You are PureScan AI — a world-class food safety and nutrition analyst. You analyze food products and consumer goods to expose hidden truths behind marketing claims.

You MUST respond with ONLY valid JSON (no markdown, no code blocks, no extra text). The JSON must follow this exact structure:

{
  "isFood": true,
  "productName": "Full product name",
  "healthScore": <number 0-10, one decimal>,
  "verdict": "Safe" | "Moderate" | "Avoid",
  "verdictTranslated": "Translated verdict string in target language",
  "shortSummary": "One sentence summary of overall assessment",
  "sugarLevel": "None" | "Low" | "Moderate" | "High" | "Very High",
  "sugarLevelTranslated": "Translated sugar level",
  "processingLevel": "Minimal" | "Moderate" | "High" | "Ultra-Processed",
  "processingLevelTranslated": "Translated processing level",
  "additivesLevel": "None" | "Few" | "Several" | "Many",
  "additivesLevelTranslated": "Translated additives level",
  "ingredients": [
    {
      "name": "Ingredient name",
      "chemicalName": "Chemical/scientific name if applicable, else null",
      "status": "safe" | "caution" | "danger",
      "explanation": "Brief explanation of health impact"
    }
  ],
  "hiddenTruth": "Detailed paragraph exposing what the marketing hides. Be specific about misleading claims, hidden sugars, chemical additives disguised by codes (E150c, maltodextrin, etc.), palm oil presence, and real nutritional value vs marketed claims.",
  "harmfulComponents": [
    {
      "name": "Component name",
      "reason": "Why it's harmful"
    }
  ],
  "sugarOilWarning": "Detailed paragraph about sugar content, types of oils/fats used, trans fats, and their health implications.",
  "alternatives": [
    "Array of EXACTLY 2 healthier brand/product alternatives ONLY if Health Score is between 0 and 6.",
    "MUST return an empty array [] if Health Score is 7 to 10. Do not list alternatives for safe food."
  ],
  "allergyAlerts": ["List any common allergens found like gluten, dairy, nuts, soy, etc."]
}

If the product is NOT a food/beverage/consumable item, respond with:
{
  "isFood": false,
  "productName": "Detected product name if possible",
  "healthScore": 0,
  "verdict": "Not Food",
  "shortSummary": "This product is not a food-related item. Please scan only food products for analysis.",
  "sugarLevel": "None",
  "processingLevel": "None",
  "additivesLevel": "None",
  "ingredients": [],
  "hiddenTruth": "This product is not a food-related item. PureScan is designed to analyze packaged food and beverage products only.",
  "harmfulComponents": [],
  "sugarOilWarning": "Not applicable — this is not a food product.",
  "alternatives": [],
  "allergyAlerts": []
}

IMPORTANT RULES:
- First determine if this is a food/beverage/consumable product. If NOT, use the non-food response format above.
- Be truthful and evidence-based
- Decode ALL chemical names (e.g., E150c = ammonia caramel color)
- Flag palm oil, high fructose corn syrup, maltodextrin, MSG (E621), artificial sweeteners
- Score 8-10 for genuinely healthy products (whole foods, natural ingredients)
- Score 4-7 for moderately processed with some concerns
- Score 0-3 for ultra-processed, high sugar/sodium, many artificial additives
- Focus on the Indian market context
- Do NOT be lenient — expose marketing tricks honestly
- Include at least 5 ingredients in the breakdown
- CRITICAL BARCODE MATCHING RULE: If a barcode number is provided, you MUST carefully verify the web search results and database entries to ensure they belong to the product corresponding to that exact barcode. If the results are ambiguous or don't match, search your knowledge base for the product with that barcode. Do not return ingredients or information for a completely different product. Under "productName", return the correct name of the product matching the barcode.

🔥 STRICT LANGUAGE RULE: 
You MUST respond EXCLUSIVELY in ${targetLanguage}.
If ${targetLanguage} = "Hinglish", write pure Hindi using exact English alphabets (e.g., "High sugar hai, isliye isko avoid karna behtar hai").
CRITICAL UI CONSTRAINT: The exact string values for 'verdict', 'sugarLevel', 'processingLevel', and 'additivesLevel' MUST remain strictly in English (e.g. "Safe", "Moderate", "Avoid", "High", "Ultra-Processed" etc.) because our frontend code depends on these strict English enums. 
DO NOT translate those 4 specific fields. YOU MUST translate all other descriptive fields (shortSummary, hiddenTruth, ingredients, harmfulComponents, alternatives, etc.) completely into ${targetLanguage}. THIS IS MANDATORY. NO MIXED LANGUAGES ALLOWED IN THE PROSE.`;

  const userMessage = `Analyze this product: "${productName}"

Here is information gathered from the web about this product:

${context || 'No web data available — use your knowledge base.'}

Provide a thorough ingredient analysis, health score, and hidden truth report. Remember to output ONLY valid JSON.
⚠️ LANGUAGE REMINDER: Your ENTIRE response MUST be in ${targetLanguage}. Do NOT use English for any descriptive text. Only product/brand names may remain in English.`;

  const keys = getGroqKeys();
  const errors = [];

  for (let i = 0; i < keys.length; i++) {
    try {
      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keys[i]}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.3,
          max_tokens: 3000,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Groq API ${response.status}: ${errBody.substring(0, 200)}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) throw new Error('Empty response from Groq');

      return JSON.parse(content);
    } catch (err) {
      errors.push(`Groq key ${i + 1}: ${err.message}`);
      console.warn(`Groq key ${i + 1} failed:`, err.message);
    }
  }

  console.error('All Groq keys failed:', errors);
  return null;
}

// ==========================================
// NETLIFY FUNCTION HANDLER
// ==========================================
exports.handler = async function (event) {
  // CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { productName, barcode, targetLanguage = 'English' } = body;

    const cleanBarcode = barcode ? String(barcode).trim() : null;
    const cleanName = productName ? productName.trim().substring(0, 200) : '';

    if (!cleanBarcode && (!cleanName || cleanName.length === 0)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Product name or barcode is required' })
      };
    }

    let searchData = null;
    let offData = null;
    let barcodeNum = cleanBarcode || (isBarcode(cleanName) ? cleanName : null);
    let resolvedProductName = cleanName;

    // Detect if input is a pure barcode numeric identifier
    if (barcodeNum) {
      console.log(`[PureScan] Barcode detected for analysis: ${barcodeNum}`);
      
      // Try Open Food Facts database lookup first
      offData = await fetchFromOpenFoodFacts(barcodeNum);
      if (offData) {
        resolvedProductName = offData.product_name || offData.product_name_en || cleanName;
        if (offData.brands) {
          resolvedProductName = `${offData.brands} ${resolvedProductName}`;
        }
        console.log(`[PureScan] Barcode resolved via OFF to product: ${resolvedProductName}`);
        
        // Search Serper with the resolved brand + product name
        const searchQuery = `${resolvedProductName} food product ingredients nutrition brand details India`;
        console.log(`[PureScan] Searching Google Serper with OFF name: ${searchQuery}`);
        searchData = await searchProduct(searchQuery);
      } else {
        // Fallback: search Serper directly with just the barcode number
        console.log(`[PureScan] OFF not found, searching Serper directly with barcode: ${barcodeNum}`);
        searchData = await searchProduct(barcodeNum);
      }
    } else {
      // Normal text search
      const searchQuery = `${cleanName} food product ingredients nutrition brand details India`;
      console.log(`[PureScan] Searching Google Serper with text: ${searchQuery}`);
      searchData = await searchProduct(searchQuery);
    }

    // Step 2: Analyze with GROQ AI
    console.log(`[PureScan] Analyzing with AI...`);
    const analysis = await analyzeWithAI(resolvedProductName, searchData, targetLanguage, barcodeNum, offData);

    if (!analysis) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          error: 'AI analysis failed. All API keys exhausted or service unavailable.'
        })
      };
    }

    // Add metadata/integrity properties
    if (barcodeNum) {
      analysis.barcode = barcodeNum;
    }
    if (offData && resolvedProductName) {
      // Hard override to guarantee 100% brand/name alignment with scanned barcode
      analysis.productName = resolvedProductName;
    }

    // Return successful analysis
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(analysis)
    };

  } catch (err) {
    console.error('[PureScan] Function error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error: ' + err.message })
    };
  }
};
