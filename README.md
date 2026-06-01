# 🔬 PureScan — Listen to Science, Not Marketing

PureScan is an AI-powered food transparency app that exposes the hidden truth behind misleading food labels. It analyzes ingredients, rates product health, and empowers smarter dietary choices.

---

## 🏗️ Architecture

```
/project
├── index.html                          # Main single-page application
├── style.css                           # Core styling
├── health-modules.css                  # Health modules styling
├── product-images.css                  # Product images styling
├── script.js                           # Main app logic
├── health-modules.js                   # AI Chat, Weight, Fitness, Nutrition modules
├── product-images.js                   # Product image fetching & display
├── netlify.toml                        # Netlify configuration
├── package.json                        # Node dependencies
├── .env                                # Local environment variables (NOT committed)
├── .gitignore                          # Git ignore rules
└── netlify/
    └── functions/
        ├── analyze-product.js          # Product analysis (SERPER + GROQ AI)
        ├── health-chat.js              # AI Health Chat Assistant (GROQ AI)
        └── fetch-image.js              # Product image search (SERPER Images)
```

---

## 🔐 Environment Variables

The app requires these API keys. **NEVER put them in frontend code.**

| Variable          | Description                  | Get From                                          |
| ----------------- | ---------------------------- | ------------------------------------------------- |
| `SERPER_API_KEY`  | Google search API (primary)  | [serper.dev](https://serper.dev)                   |
| `SERPER_API_KEY2` | Google search API (backup)   | [serper.dev](https://serper.dev)                   |
| `GROQ_1`          | Groq AI key (primary)        | [console.groq.com](https://console.groq.com)      |
| `GROQ_2`          | Groq AI key (failover 2)     | [console.groq.com](https://console.groq.com)      |
| `GROQ_3`          | Groq AI key (failover 3)     | [console.groq.com](https://console.groq.com)      |
| `GROQ_4`          | Groq AI key (failover 4)     | [console.groq.com](https://console.groq.com)      |
| `GROQ_5`          | Groq AI key (failover 5)     | [console.groq.com](https://console.groq.com)      |

---

## 🖥️ Local Development Setup

### Prerequisites
- **Node.js** v18+ installed → [Download](https://nodejs.org/)
- **Netlify CLI** (installed via npm)

### Step-by-Step

1. **Clone or open the project folder**
   ```bash
   cd "path/to/Ai image"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** in the project root with your API keys:
   ```env
   SERPER_API_KEY=your_serper_key_here
   SERPER_API_KEY2=your_backup_serper_key_here
   GROQ_1=your_groq_key_1
   GROQ_2=your_groq_key_2
   GROQ_3=your_groq_key_3
   GROQ_4=your_groq_key_4
   GROQ_5=your_groq_key_5
   ```

4. **Start the local dev server**
   ```bash
   npm start
   ```
   This runs `netlify dev` which:
   - Serves the frontend on `http://localhost:8888`
   - Makes all serverless functions available at `/.netlify/functions/`
   - Reads `.env` for environment variables automatically

5. **Open the app**
   - Browser will auto-open `http://localhost:8888`
   - All features (Scan, Chat, Images) will work!

> ⚠️ **IMPORTANT:** Do NOT open `index.html` directly as `file://`. Always use `npm start` (netlify dev) so the serverless functions are available.

---

## 🚀 Deploy to Netlify

### Method 1: Netlify CLI (Recommended)

1. **Login to Netlify**
   ```bash
   npx netlify login
   ```

2. **Link or create a new site**
   ```bash
   npx netlify init
   ```

3. **Set environment variables on Netlify**
   ```bash
   npx netlify env:set SERPER_API_KEY "your_key"
   npx netlify env:set SERPER_API_KEY2 "your_key"
   npx netlify env:set GROQ_1 "your_key"
   npx netlify env:set GROQ_2 "your_key"
   npx netlify env:set GROQ_3 "your_key"
   npx netlify env:set GROQ_4 "your_key"
   npx netlify env:set GROQ_5 "your_key"
   ```

4. **Deploy**
   ```bash
   npx netlify deploy --prod
   ```

### Method 2: Netlify Dashboard (UI)

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub repository
4. Build settings:
   - **Build command:** (leave empty)
   - **Publish directory:** `.`
   - **Functions directory:** `netlify/functions`
5. Go to **Site settings** → **Environment variables**
6. Add all 7 API keys listed above
7. Click **Deploy**

### Method 3: Drag & Drop

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the entire project folder
3. After deploy, go to **Site settings** → **Environment variables**
4. Add all 7 API keys
5. **Redeploy** (important — functions need env vars)

---

## ⚙️ How the API Architecture Works

```
[Browser] ───→ /.netlify/functions/analyze-product ───→ Serper API + Groq AI
[Browser] ───→ /.netlify/functions/health-chat     ───→ Groq AI
[Browser] ───→ /.netlify/functions/fetch-image      ───→ Serper Images API
```

- **Frontend** never touches API keys directly
- **Serverless functions** handle all API calls securely
- **Key failover:** If one API key fails, the next one is tried automatically (up to 5 Groq keys, 2 Serper keys)

---

## 🐛 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Failed to fetch` / Network error | Not running via `netlify dev` | Run `npm start` instead of opening HTML directly |
| `502 Bad Gateway` | All API keys exhausted or expired | Check/replace API keys in `.env` or Netlify dashboard |
| `404 Not Found` on functions | Functions not deployed | Redeploy with `npx netlify deploy --prod` |
| Chat not responding | Groq API rate limited | Wait 1 minute and try again |
| Images not loading | Serper API quota exceeded | Wait or add new Serper API key |
| `CORS error` | Wrong development method | Use `npm start` (netlify dev), not other servers |
| `.env` keys not working on Netlify | Env vars not set in dashboard | Add keys via Netlify dashboard or CLI |

---

## 📋 Features

- 🔍 **Product Scanner** — Analyze any food product by name
- 📸 **Image Upload** — Upload product photos for analysis
- 🤖 **AI Health Chat** — Chat with AI health assistant (text + image)
- ⚖️ **Weight Management** — Weight loss/gain tips & BMI calculator
- 🏋️ **Fitness & Gym** — Pre/post workout nutrition & weekly diet plan
- 💊 **Nutrition Hub** — Vitamins, minerals & deficiency guide
- 🌐 **Bilingual** — English & Hindi support
- 🌙 **Dark/Light Mode** — Theme toggle
- 📱 **Mobile Responsive** — Works on all devices
- 📤 **Share Reports** — Share via WhatsApp or clipboard

---

## 🔒 Security

- ✅ API keys stored in environment variables only
- ✅ No keys exposed in frontend JavaScript
- ✅ CORS headers configured
- ✅ Input sanitization in serverless functions
- ✅ Request body size limits
- ✅ Security headers (X-Frame-Options, XSS Protection, etc.)

---

## 👨‍💻 Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Icons:** Lucide Icons (CDN)
- **Fonts:** Google Fonts (Inter, Space Grotesk)
- **Backend:** Netlify Serverless Functions (Node.js)
- **AI:** Groq API (LLaMA 3.3 70B)
- **Search:** Serper.dev (Google Search API)
- **Deployment:** Netlify

---

Made with ❤️ in India
