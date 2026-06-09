/* =============================================
   PureScan — Health Chat Netlify Function
   AI-powered health assistant using GROQ API
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
  console.error('Failed to load .env file manually in health-chat:', err);
}


const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

function getGroqKeys() {
  return [
    process.env.GROQ_1,
    process.env.GROQ_2,
    process.env.GROQ_3,
    process.env.GROQ_4,
    process.env.GROQ_5
  ].filter(Boolean);
}

const SYSTEM_PROMPT = `You are PureScan AI Health Assistant — a friendly, knowledgeable health and nutrition expert. You provide advice in simple, easy-to-understand language suitable for everyday users (not doctors or scientists).

YOUR ROLE:
- Answer questions about diet, nutrition, weight loss, weight gain, fitness, vitamins, and food health
- Analyze food products and their ingredients when asked
- Provide personalized diet suggestions
- Give simple scientific explanations in beginner-friendly language
- Suggest healthier alternatives to unhealthy foods

RESPONSE STYLE:
- Keep responses concise but informative (200-400 words max)
- Use simple language — imagine explaining to a friend
- Include practical, actionable tips
- Use bullet points and numbered lists for clarity
- Add relevant emojis sparingly for friendliness
- Mention specific Indian food options when relevant (dal, roti, paneer, etc.)
- Always clarify you're an AI and suggest consulting a doctor for medical concerns

TOPICS YOU COVER:
1. Product analysis (ingredients, health ratings, hidden chemicals)
2. Weight loss diet plans & calorie deficit guidance
3. Weight gain / muscle building nutrition
4. Pre-workout and post-workout meals
5. Vitamin deficiencies and natural food sources
6. General health tips and lifestyle advice
7. Food alternatives (healthier swaps)
8. Basic nutrition science in easy language

IMPORTANT RULES:
- Never prescribe medication
- Never diagnose medical conditions
- Always recommend consulting a healthcare professional for serious concerns
- Make health advice practical and affordable for Indian households
- If a barcode number is provided in the message, use the search context to identify and analyze the product`;

const SERPER_URL = 'https://google.serper.dev/search';

function getSerperKeys() {
  return [
    process.env.SERPER_API_KEY,
    process.env.SERPER_API_KEY2
  ].filter(Boolean);
}

// Serper Search
async function searchWeb(query) {
  const keys = getSerperKeys();
  for (let i = 0; i < keys.length; i++) {
    try {
      const response = await fetch(SERPER_URL, {
        method: 'POST',
        headers: { 'X-API-KEY': keys[i], 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: `${query} ingredients health nutrition facts india`, num: 5 })
      });
      if (response.ok) return await response.json();
    } catch (e) {}
  }
  return null;
}

async function chatWithAI(userMessage, conversationContext, targetLanguage = "English") {
  let searchContext = '';

  // If message contains a barcode-like pattern, search for product info
  const barcodeMatch = userMessage.match(/\b(\d{8,13})\b/);
  if (barcodeMatch) {
    console.log(`[HealthChat] Barcode detected in message: ${barcodeMatch[1]}. Running Serper search...`);
    const searchData = await searchWeb(`${barcodeMatch[1]} food product ingredients nutrition India`);
    
    if (searchData && searchData.organic) {
      searchContext = "Internet Search Results for Context:\n" + searchData.organic.map(r => 
        `Title: ${r.title}\nSnippet: ${r.snippet}`
      ).join('\n\n');
      console.log('[HealthChat] Gathered Serper context for barcode query.');
    }
  }

  const dynamicSystemPrompt = `${SYSTEM_PROMPT}

🔥 STRICT LANGUAGE RULE: 
You MUST respond EXCLUSIVELY in ${targetLanguage}.
Do NOT use ANY English text unless it's a brand/product name.
If ${targetLanguage} === "Hinglish", write pure Hindi using exact English alphabets (e.g., "High sugar hai, isliye isko avoid karna behtar hai").
THIS IS MANDATORY. NO MIXED LANGUAGES ALLOWED.`;

  const messages = [
    { role: 'system', content: dynamicSystemPrompt }
  ];

  // Add conversation context (last few messages)
  if (conversationContext && Array.isArray(conversationContext)) {
    const recentContext = conversationContext.slice(-6);
    recentContext.forEach(msg => {
      if (msg.role && msg.content) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content.substring(0, 500)
        });
      }
    });
  }

  // Add current user message with search context if available
  let finalMessage = searchContext 
    ? `${userMessage}\n\n${searchContext}`
    : userMessage;
  // Failsafe: reinforce language in user message too
  if (targetLanguage !== 'English') {
    finalMessage += `\n\n⚠️ IMPORTANT: Respond STRICTLY in ${targetLanguage} only. No English allowed except brand/product names.`;
  }
  messages.push({ role: 'user', content: finalMessage });

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
          messages: messages,
          temperature: 0.7,
          max_tokens: 1500,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Groq API ${response.status}: ${errBody.substring(0, 200)}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) throw new Error('Empty response from Groq');

      return content;
    } catch (err) {
      errors.push(`Groq key ${i + 1}: ${err.message}`);
      console.warn(`[HealthChat] Groq key ${i + 1} failed:`, err.message);
    }
  }

  console.error('[HealthChat] All Groq keys failed:', errors);
  return null;
}

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { message, context, targetLanguage = 'English' } = body;

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    const cleanMessage = message.trim().substring(0, 1000);

    console.log(`[HealthChat] User: ${cleanMessage.substring(0, 100)}...`);

    const reply = await chatWithAI(cleanMessage, context, targetLanguage);

    if (!reply) {
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({
          error: 'AI service unavailable. Please try again.',
          reply: 'I\'m sorry, I\'m having trouble connecting right now. Please try again in a moment. 🙏'
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    console.error('[HealthChat] Function error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        reply: 'Something went wrong on my end. Please try again. 🙏'
      })
    };
  }
};
