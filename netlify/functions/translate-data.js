/* =============================================
   PureScan — Netlify Serverless Function
   Dynamic AI json translation (GROQ)
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
  console.error('Failed to load .env file manually in translate-data:', err);
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
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { targetLanguage, analysisData } = body;

    if (!targetLanguage || !analysisData) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'targetLanguage and analysisData required' }) };
    }

    const systemPrompt = `You are an expert translator specializing in food safety and nutrition.
Your exact task is to translate the provided JSON object data's string values into ${targetLanguage}.
If ${targetLanguage} is "Hinglish", use Hindi written in English alphabetic letters (e.g. "High sugar hai, avoid karo").

CRITICAL INSTRUCTIONS:
- You MUST maintain the exact same JSON structure, keys, and array lengths.
- Do NOT translate or change JSON keys. Only translate the values.
- 🔥 CRITICAL UI CONSTRAINT: DO NOT translate the values for these specific keys: 'verdict', 'sugarLevel', 'processingLevel', and 'additivesLevel'. These MUST remain exactly as they are in English (e.g. "Safe", "High") because the frontend code breaks otherwise.
- Do NOT output any markdown blocks or explanations, ONLY the raw translated JSON object.
- If a value is empty or not applicable, keep it empty.`;

    const userMessage = `Translate this JSON object into ${targetLanguage}:
${JSON.stringify(analysisData, null, 2)}`;

    const keys = getGroqKeys();
    const errors = [];

    for (let i = 0; i < keys.length; i++) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${keys[i]}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage }
            ],
            temperature: 0.1,
            response_format: { type: 'json_object' }
          })
        });

        if (!response.ok) throw new Error(`Groq API error ${response.status}`);

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        return {
          statusCode: 200,
          headers,
          body: content
        };
      } catch (err) {
        errors.push(err.message);
      }
    }

    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: 'Translation failed', details: errors })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error: ' + err.message })
    };
  }
};
