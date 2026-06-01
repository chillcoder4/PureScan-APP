/* =============================================
   PureScan — Promotional System (sysrecte.js)
   Version: 1.0.0
   
   HOW TO USE:
   ─────────────────────────────────────────────
   ✅ Set SYSRECTION_ENABLED = true  → sysrections visible
   ❌ Set SYSRECTION_ENABLED = false → completely hidden
   
   To add new brand: push a new object to the
   `sysrections` array following the same schema.
   ============================================= */

// ──────────────────────────────────────────────
// 1. GLOBAL ON/OFF SWITCH
// ──────────────────────────────────────────────
const SYSRECTION_ENABLED = false;   // ← Change to false to hide all sysrections instantly


// ──────────────────────────────────────────────
// 2. CONFIGURATION
// ──────────────────────────────────────────────
const SYSREC_CONFIG = {
  COOLDOWN_MS:        90000,            // 1 min 30 seconds cooldown after user closes sysrec
  SLIDE_INTERVAL_MS:  4500,             // Auto-slide every 4.5 seconds
  TRANSITION_MS:      400,              // Slide fade duration (ms)
  STORAGE_KEY:        'purescan_sysrec_closed_at',
  CLICK_LOG_KEY:      'purescan_sysrec_clicks',
  BANNER_ID:          'sysrecTopBanner',
  FLOAT_ID:           'sysrecFloatCard',

  // Keywords that classify a search as food/health-related
  // (used for conditional display — Requirement 9)
  FOOD_KEYWORDS: [
    'noodles','biscuit','cookie','juice','milk','oats','cereal','protein',
    'chips','snack','chocolate','drink','energy','health','food','diet',
    'sugar','oil','sauce','ketchup','butter','bread','rice','wheat',
    'breakfast','nutrition','fiber','vitamin','supplement','weight','muscle',
    'recovery','granola','muesli','bar','glucose','honey','jam','spread',
    'cola','soda','tea','coffee','powder','shake','whey','organic','natural',
    'maggi','bournvita','horlicks','complan','kurkure','haldiram','tropicana',
    'parle','britannia','amul','nestle','cadbury','lays','pepsi','sprite',
    'tang','frooti','maaza','glucon','chyawanprash','saffola','fortune',
    'redbull','sting','real','paperboat','patanjali','yippee','kissan','heinz',
    'nutella','oreo','bourbon','monaco','marigold','hideseek','kitkat'
  ]
};


// ──────────────────────────────────────────────
// 3. SYSRECTIONS DATA ARRAY
//    Add new brands here. Each object is one sysrec.
// ──────────────────────────────────────────────
const sysrections = [
  {
    id:          'goatlife_1',
    title:       'GOAT Life Overnight Oats (Assorted Pack)',
    description: 'High-protein overnight oats — no added sugar, supports muscle recovery & weight management.',
    tagline:     '"Healthy Breakfast, Simplified"',
    image:       'https://m.media-amazon.com/images/I/71LMqFJajkL.jpg',
    link:        'https://goatlife.co.in/',
    amazonLink:  'https://amzn.in/d/6AxTY0z',
    tag:         '⭐ Recommended',
    brand:       'GOAT Life',
    cta:         'Shop Now',
    categories:  ['food', 'health', 'protein', 'breakfast']
  },

  {
    id:          'goatlife_2',
    title:       'GOAT Life Chocolate Overnight Oats',
    description: 'Chocolate-flavored protein oats — tasty & healthy breakfast alternative.',
    tagline:     '"Taste meets Nutrition"',
    image:       'https://m.media-amazon.com/images/I/71d0wtpbxJL.jpg',
    link:        'https://goatlife.co.in/',
    amazonLink:  'https://amzn.in/d/6AxTY0z',
    tag:         '🔥 Popular',
    brand:       'GOAT Life',
    cta:         'Try Now',
    categories:  ['food', 'health', 'protein', 'breakfast']
  },

  {
    id:          'goatlife_3',
    title:       'GOAT Life Mango Overnight Oats',
    description: 'Fruity mango oats with fiber & protein — perfect quick morning meal.',
    tagline:     '"Fresh Flavor Boost"',
    image:       'https://m.media-amazon.com/images/I/711YzYLHbFS._AC_UF894,1000_QL80_.jpg',
    link:        'https://goatlife.co.in/',
    amazonLink:  'https://amzn.in/d/6AxTY0z',
    tag:         '🥭 New Flavor',
    brand:       'GOAT Life',
    cta:         'Explore',
    categories:  ['food', 'health', 'breakfast']
  },

  {
    id:          'goatlife_4',
    title:       'GOAT Life High Protein Oats (20g Protein)',
    description: 'Power-packed oats with higher protein content — ideal for gym & fitness.',
    tagline:     '"Fuel Your Performance"',
    image:       'https://m.media-amazon.com/images/I/71LMqFJajkL.jpg',
    link:        'https://goatlife.co.in/',
    amazonLink:  'https://amzn.in/d/6AxTY0z',
    tag:         '💪 High Protein',
    brand:       'GOAT Life',
    cta:         'Buy Now',
    categories:  ['food', 'fitness', 'protein']
  }

  // ──────────────────────────────────────────
  // FUTURE COLLABORATIONS — add below this line
  // ──────────────────────────────────────────
  // {
  //   id:          'brand2_1',
  //   title:       'Your Brand Title Here',
  //   description: 'Short compelling description.',
  //   tagline:     '"Your tagline"',
  //   image:       'https://your-image-url.jpg',
  //   link:        'https://yourbrand.com/',
  //   amazonLink:  '',
  //   tag:         '🔥 Hot Pick',
  //   brand:       'Brand Name',
  //   cta:         'Learn More',
  //   categories:  ['food', 'health']
  // }
];


// ──────────────────────────────────────────────
// 4. INTERNAL STATE
// ──────────────────────────────────────────────
let _bannerIndex      = 0;
let _floatIndex       = 0;
let _bannerTimer      = null;
let _floatTimer       = null;
let _bannerViews      = 0;
let _floatViews       = 0;
let _bannerClosed     = false;
let _floatClosed      = false;
let _bannerInCooldown = false;
let _floatInCooldown  = false;
let _sysrecReady      = false;


// ──────────────────────────────────────────────
// 5. UTILITY HELPERS
// ──────────────────────────────────────────────

/** Check if user closed sysrec within cooldown window */
function _isCooldownActive() {
  const closedAt = parseInt(localStorage.getItem(SYSREC_CONFIG.STORAGE_KEY) || '0', 10);
  return closedAt > 0 && (Date.now() - closedAt) < SYSREC_CONFIG.COOLDOWN_MS;
}

/** Save close timestamp for cooldown */
function _saveCooldown() {
  localStorage.setItem(SYSREC_CONFIG.STORAGE_KEY, String(Date.now()));
}

/** Track sysrec click analytics (stored in localStorage) */
function _trackClick(sysrecId) {
  try {
    const log = JSON.parse(localStorage.getItem(SYSREC_CONFIG.CLICK_LOG_KEY) || '{}');
    log[sysrecId] = (log[sysrecId] || 0) + 1;
    log[`${sysrecId}_lastClick`] = new Date().toISOString();
    localStorage.setItem(SYSREC_CONFIG.CLICK_LOG_KEY, JSON.stringify(log));
  } catch (e) { /* silent */ }
}

/** Check if a product search query is food/health related */
function _isFoodHealthQuery(query) {
  if (!query) return false;
  const q = query.toLowerCase();
  return SYSREC_CONFIG.FOOD_KEYWORDS.some(kw => q.includes(kw));
}

/** Returns the current sysrection object (handles empty array gracefully) */
function _getPromo(index) {
  return sysrections[index % sysrections.length] || null;
}


// ──────────────────────────────────────────────
// 6. CSS INJECTION
//    All sysrec styles live here — zero extra files
// ──────────────────────────────────────────────
function _injectStyles() {
  if (document.getElementById('sysrec-styles')) return;

  const css = `
    /* ─── SYSREC BASE ─── */
    .sysrec-hidden  { display: none !important; }
    .sysrec-visible { display: flex !important; }

    /* ─── TOP BANNER ─── */
    #sysrecTopBanner {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 9000;
      display: none;
      justify-content: center;
      align-items: stretch;
      background: linear-gradient(135deg,
        rgba(8, 8, 24, 0.96) 0%,
        rgba(16, 16, 40, 0.96) 100%);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border-bottom: 1px solid rgba(99, 102, 241, 0.25);
      box-shadow: 0 4px 32px rgba(99, 102, 241, 0.15);
      padding: 0;
      overflow: hidden;
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
                  opacity 0.4s ease;
      transform: translateY(-100%);
      opacity: 0;
    }
    #sysrecTopBanner.sysrec-slide-in {
      transform: translateY(0);
      opacity: 1;
    }

    .sysrec-banner-inner {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 10px 16px 10px 14px;
      max-width: 600px;
      width: 100%;
      box-sizing: border-box;
      position: relative;
    }

    .sysrec-banner-img {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      object-fit: cover;
      flex-shrink: 0;
      border: 1.5px solid rgba(99, 102, 241, 0.4);
      background: rgba(99,102,241,0.1);
    }

    .sysrec-banner-body {
      flex: 1;
      min-width: 0;
    }

    .sysrec-banner-tag {
      display: inline-block;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #a5b4fc;
      background: rgba(99,102,241,0.2);
      border: 1px solid rgba(99,102,241,0.35);
      border-radius: 4px;
      padding: 2px 6px;
      margin-bottom: 3px;
      text-transform: uppercase;
    }

    .sysrec-banner-title {
      font-size: 12px;
      font-weight: 700;
      color: #f8fafc;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.3;
    }

    .sysrec-banner-desc {
      font-size: 10.5px;
      color: rgba(203,213,225,0.8);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 1px;
    }

    .sysrec-banner-cta {
      flex-shrink: 0;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      color: #fff;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border: none;
      cursor: pointer;
      text-decoration: none;
      white-space: nowrap;
      transition: opacity 0.2s, transform 0.15s;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .sysrec-banner-cta:hover { opacity: 0.88; transform: scale(1.03); }

    .sysrec-banner-close {
      position: absolute;
      top: 6px; right: 8px;
      background: none;
      border: none;
      color: rgba(148,163,184,0.7);
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
      padding: 2px 4px;
      border-radius: 4px;
      transition: color 0.2s, background 0.2s;
    }
    .sysrec-banner-close:hover {
      color: #f1f5f9;
      background: rgba(255,255,255,0.08);
    }

    /* ─── FLOATING CARD ─── */
    #sysrecFloatCard {
      position: fixed;
      bottom: 24px;
      right: 16px;
      z-index: 8900;
      display: none;
      flex-direction: column;
      width: 290px;
      box-sizing: border-box;
      border-radius: 18px;
      overflow: hidden;
      background: linear-gradient(145deg,
        rgba(10, 10, 28, 0.97) 0%,
        rgba(20, 18, 45, 0.97) 100%);
      border: 1px solid rgba(99, 102, 241, 0.28);
      box-shadow:
        0 8px 40px rgba(0,0,0,0.5),
        0 0 0 1px rgba(99,102,241,0.08),
        inset 0 1px 0 rgba(255,255,255,0.06);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
                  opacity 0.4s ease;
      transform: translateY(120%) scale(0.9);
      opacity: 0;
    }
    #sysrecFloatCard.sysrec-slide-in {
      transform: translateY(0) scale(1);
      opacity: 1;
    }

    .sysrec-float-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px 6px 12px;
    }

    .sysrec-float-label {
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #a5b4fc;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .sysrec-float-label::before {
      content: '';
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #6366f1;
      animation: sysrecLabelPulse 2s infinite;
    }
    @keyframes sysrecLabelPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.5; transform: scale(0.8); }
    }

    .sysrec-float-close {
      background: none;
      border: none;
      color: rgba(148,163,184,0.6);
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
      padding: 2px 4px;
      border-radius: 6px;
      transition: color 0.2s, background 0.2s;
    }
    .sysrec-float-close:hover {
      color: #f1f5f9;
      background: rgba(255,255,255,0.08);
    }

    /* Slide Viewport */
    .sysrec-float-slides-wrap {
      position: relative;
      overflow: hidden;
    }

    .sysrec-float-slide {
      display: none;
      flex-direction: column;
      animation: sysrecFadeIn 0.4s ease;
    }
    .sysrec-float-slide.active { display: flex; }

    @keyframes sysrecFadeIn {
      from { opacity: 0; transform: translateX(12px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    .sysrec-float-img-wrap {
      position: relative;
      width: 100%;
      height: 130px;
      overflow: hidden;
      background: rgba(15,15,35,0.6);
    }

    .sysrec-float-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 6s ease;
    }
    #sysrecFloatCard:hover .sysrec-float-img {
      transform: scale(1.05);
    }

    .sysrec-float-tag {
      position: absolute;
      top: 8px; left: 8px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.05em;
      border-radius: 6px;
      padding: 3px 8px;
    }

    .sysrec-float-body {
      padding: 10px 12px 4px 12px;
    }

    .sysrec-float-brand {
      font-size: 9px;
      font-weight: 700;
      color: #818cf8;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 3px;
    }

    .sysrec-float-title {
      font-size: 13px;
      font-weight: 700;
      color: #f8fafc;
      line-height: 1.35;
      margin-bottom: 4px;
    }

    .sysrec-float-desc {
      font-size: 11px;
      color: rgba(203,213,225,0.75);
      line-height: 1.5;
      margin-bottom: 4px;
    }

    .sysrec-float-tagline {
      font-size: 10px;
      font-style: italic;
      color: #a5b4fc;
      margin-bottom: 10px;
    }

    .sysrec-float-actions {
      display: flex;
      gap: 7px;
      padding: 0 12px 12px 12px;
    }

    .sysrec-btn-primary {
      flex: 1;
      padding: 8px 10px;
      border-radius: 10px;
      font-size: 11.5px;
      font-weight: 700;
      color: #fff;
      background: linear-gradient(135deg, #6366f1 0%, #7c3aed 100%);
      border: none;
      cursor: pointer;
      text-decoration: none;
      text-align: center;
      transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
      box-shadow: 0 4px 14px rgba(99,102,241,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }
    .sysrec-btn-primary:hover {
      opacity: 0.9;
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(99,102,241,0.5);
    }

    .sysrec-btn-secondary {
      padding: 8px 12px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
      color: #a5b4fc;
      background: rgba(99,102,241,0.12);
      border: 1.5px solid rgba(99,102,241,0.28);
      cursor: pointer;
      text-decoration: none;
      text-align: center;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      white-space: nowrap;
    }
    .sysrec-btn-secondary:hover {
      background: rgba(99,102,241,0.22);
      color: #c7d2fe;
    }

    /* Dots indicator */
    .sysrec-float-dots {
      display: flex;
      justify-content: center;
      gap: 5px;
      padding: 0 12px 10px 12px;
    }
    .sysrec-dot {
      width: 5px; height: 5px;
      border-radius: 50%;
      background: rgba(99,102,241,0.3);
      border: none;
      cursor: pointer;
      padding: 0;
      transition: all 0.3s;
    }
    .sysrec-dot.active {
      width: 16px;
      border-radius: 3px;
      background: #6366f1;
    }

    /* Alternative recommendation inline card */
    .sysrec-alt-card {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      box-sizing: border-box;
      background: linear-gradient(135deg,
        rgba(99,102,241,0.08) 0%,
        rgba(139,92,246,0.06) 100%);
      border: 1px solid rgba(99,102,241,0.25);
      border-radius: 14px;
      padding: 12px 14px;
      margin-top: 12px;
      cursor: pointer;
      text-decoration: none;
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
      animation: sysrecFadeIn 0.5s ease;
    }
    .sysrec-alt-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(99,102,241,0.2);
      border-color: rgba(99,102,241,0.45);
    }

    .sysrec-alt-img {
      width: 52px;
      height: 52px;
      border-radius: 10px;
      object-fit: cover;
      flex-shrink: 0;
      border: 1.5px solid rgba(99,102,241,0.3);
      background: rgba(99,102,241,0.1);
    }

    .sysrec-alt-body { flex: 1; min-width: 0; }
    .sysrec-alt-badge {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #818cf8;
      background: rgba(99,102,241,0.15);
      border-radius: 4px;
      padding: 1px 6px;
      display: inline-block;
      margin-bottom: 3px;
    }
    .sysrec-alt-title {
      font-size: 12.5px;
      font-weight: 700;
      color: #f1f5f9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sysrec-alt-desc {
      font-size: 10.5px;
      color: rgba(203,213,225,0.7);
      margin-top: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .sysrec-alt-arrow {
      color: #6366f1;
      font-size: 18px;
      flex-shrink: 0;
    }

    /* Light theme overrides */
    [data-theme="light"] #sysrecTopBanner {
      background: linear-gradient(135deg, rgba(240,241,255,0.97), rgba(230,232,255,0.97));
      border-bottom-color: rgba(99,102,241,0.2);
    }
    [data-theme="light"] .sysrec-banner-title { color: #1e1b4b; }
    [data-theme="light"] .sysrec-banner-desc  { color: #4338ca; }
    [data-theme="light"] .sysrec-banner-close { color: #6366f1; }

    [data-theme="light"] #sysrecFloatCard {
      background: linear-gradient(145deg, rgba(240,241,255,0.98), rgba(235,236,255,0.98));
      border-color: rgba(99,102,241,0.25);
      box-shadow: 0 8px 40px rgba(99,102,241,0.12), 0 0 0 1px rgba(99,102,241,0.06);
    }
    [data-theme="light"] .sysrec-float-title { color: #1e1b4b; }
    [data-theme="light"] .sysrec-float-desc  { color: #4338ca; }
    [data-theme="light"] .sysrec-float-brand { color: #6366f1; }
    [data-theme="light"] .sysrec-float-tagline { color: #7c3aed; }
    [data-theme="light"] .sysrec-alt-card {
      background: linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04));
    }
    [data-theme="light"] .sysrec-alt-title { color: #1e1b4b; }
    [data-theme="light"] .sysrec-alt-desc  { color: #4338ca; }

    /* Responsive — Mobile compact card */
    @media (max-width: 600px) {
      #sysrecFloatCard {
        width: auto;
        right: 10px;
        left: 10px;
        bottom: 10px;
        border-radius: 14px;
      }
      body.ps-has-nav #sysrecFloatCard {
        bottom: calc(75px + env(safe-area-inset-bottom, 0px));
      }
      .sysrec-float-img-wrap { height: 90px; }
      .sysrec-float-body { padding: 8px 10px 2px 10px; }
      .sysrec-float-title { font-size: 12px; }
      .sysrec-float-desc { font-size: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      .sysrec-float-tagline { display: none; }
      .sysrec-float-actions { padding: 0 10px 10px 10px; gap: 6px; }
      .sysrec-btn-primary { font-size: 11px; padding: 7px 8px; }
      .sysrec-btn-secondary { font-size: 10px; padding: 7px 10px; }
      .sysrec-banner-desc { display: none; }
    }
  `;

  const style = document.createElement('style');
  style.id = 'sysrec-styles';
  style.textContent = css;
  document.head.appendChild(style);
}


// ──────────────────────────────────────────────
// 7. BUILD TOP BANNER HTML
// ──────────────────────────────────────────────
function _buildBanner() {
  const existing = document.getElementById(SYSREC_CONFIG.BANNER_ID);
  if (existing) existing.remove();

  _bannerIndex = Math.floor(Math.random() * sysrections.length);
  const sysrec = _getPromo(_bannerIndex);
  if (!sysrec) return;

  const banner = document.createElement('div');
  banner.id = SYSREC_CONFIG.BANNER_ID;
  banner.setAttribute('role', 'banner');
  banner.setAttribute('aria-label', 'Sponsored recommendation');
  banner.innerHTML = `
    <div class="sysrec-banner-inner">
      <img
        class="sysrec-banner-img"
        src="${sysrec.image}"
        alt="${sysrec.brand} product"
        loading="lazy"
        onerror="this.src='https://via.placeholder.com/48x48/6366f1/ffffff?text=AD'"
      >
      <div class="sysrec-banner-body">
        <div class="sysrec-banner-tag">${sysrec.tag || 'Sponsored'}</div>
        <div class="sysrec-banner-title">${sysrec.title}</div>
        <div class="sysrec-banner-desc">${sysrec.description}</div>
      </div>
      <a
        class="sysrec-banner-cta"
        href="${sysrec.link}"
        target="_blank"
        rel="noopener sponsored"
        id="sysrecBannerCTA"
        aria-label="Visit ${sysrec.brand}"
      >${sysrec.cta || 'Shop Now'} ↗</a>
      <button class="sysrec-banner-close" id="sysrecBannerClose" aria-label="Close sysrection">✕</button>
    </div>
  `;

  document.body.prepend(banner);

  document.getElementById('sysrecBannerCTA').addEventListener('click', () => {
    _trackClick(_getPromo(_bannerIndex)?.id);
  });

  document.getElementById('sysrecBannerClose').addEventListener('click', () => {
    if (window.PureScanPromo) window.PureScanPromo.close();
  });

  _adjustBodyOffset(true);
}

function _adjustBodyOffset(add) {
  const banner = document.getElementById(SYSREC_CONFIG.BANNER_ID);
  const isVisible = add && banner && !_bannerClosed && !_bannerInCooldown;
  const offset = isVisible ? (banner.offsetHeight || 68) : 0;
  document.body.style.transition = 'padding-top 0.35s ease';
  document.body.style.paddingTop = offset > 0 ? offset + 'px' : '';
}


// ──────────────────────────────────────────────
// 8. BUILD FLOATING CARD HTML
// ──────────────────────────────────────────────
function _buildFloatCard() {
  const existing = document.getElementById(SYSREC_CONFIG.FLOAT_ID);
  if (existing) existing.remove();

  if (!sysrections.length) return;

  _floatIndex = Math.floor(Math.random() * sysrections.length);

  const slidesHTML = sysrections.map((sysrec, i) => `
    <div class="sysrec-float-slide ${i === _floatIndex ? 'active' : ''}" data-sysrec-id="${sysrec.id}">
      <div class="sysrec-float-img-wrap">
        <img
          class="sysrec-float-img"
          src="${sysrec.image}"
          alt="${sysrec.brand} product"
          loading="lazy"
          onerror="this.src='https://via.placeholder.com/290x130/6366f1/ffffff?text=AD'"
        >
        <div class="sysrec-float-tag">${sysrec.tag || 'Sponsored'}</div>
      </div>
      <div class="sysrec-float-body">
        <div class="sysrec-float-brand">${sysrec.brand}</div>
        <div class="sysrec-float-title">${sysrec.title}</div>
        <div class="sysrec-float-desc">${sysrec.description}</div>
        <div class="sysrec-float-tagline">${sysrec.tagline || ''}</div>
      </div>
      <div class="sysrec-float-actions">
        <a
          class="sysrec-btn-primary"
          href="${sysrec.link}"
          target="_blank"
          rel="noopener sponsored"
          data-sysrec-cta="${sysrec.id}"
          aria-label="Shop ${sysrec.brand}"
        >🛍 ${sysrec.cta || 'Shop Now'}</a>
        ${sysrec.amazonLink ? `
        <a
          class="sysrec-btn-secondary"
          href="${sysrec.amazonLink}"
          target="_blank"
          rel="noopener sponsored"
          data-sysrec-cta="${sysrec.id}_amz"
          aria-label="View on Amazon"
        >📦 Amazon</a>` : ''}
      </div>
    </div>
  `).join('');

  const dotsHTML = sysrections.length > 1
    ? `<div class="sysrec-float-dots">${sysrections.map((_, i) =>
        `<button class="sysrec-dot ${i === _floatIndex ? 'active' : ''}" data-slide="${i}" aria-label="Go to slide ${i + 1}"></button>`
      ).join('')}</div>`
    : '';

  const card = document.createElement('div');
  card.id = SYSREC_CONFIG.FLOAT_ID;
  card.setAttribute('role', 'complementary');
  card.setAttribute('aria-label', 'Product recommendation');
  card.innerHTML = `
    <div class="sysrec-float-header">
      <div class="sysrec-float-label">Recommended for You</div>
      <button class="sysrec-float-close" id="sysrecFloatClose" aria-label="Close recommendation">✕</button>
    </div>
    <div class="sysrec-float-slides-wrap" id="sysrecSlideWrap">
      ${slidesHTML}
    </div>
    ${dotsHTML}
  `;

  document.body.appendChild(card);

  card.querySelectorAll('[data-sysrec-cta]').forEach(el => {
    el.addEventListener('click', () => _trackClick(el.getAttribute('data-sysrec-cta')));
  });

  document.getElementById('sysrecFloatClose').addEventListener('click', () => {
    if (window.PureScanPromo) window.PureScanPromo.close();
  });

  card.querySelectorAll('.sysrec-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      _goToFloatSlide(parseInt(dot.getAttribute('data-slide'), 10));
      _stopFloatSlider();
      _startFloatSlider(); 
    });
  });
}


// ──────────────────────────────────────────────
// 9. INDEPENDENT SLIDER ENGINES
// ──────────────────────────────────────────────
function _updateBannerUI() {
  const banner = document.getElementById(SYSREC_CONFIG.BANNER_ID);
  if (!banner) return;
  const sysrec = _getPromo(_bannerIndex);
  if (!sysrec) return;

  const img = banner.querySelector('.sysrec-banner-img');
  const title = banner.querySelector('.sysrec-banner-title');
  const desc = banner.querySelector('.sysrec-banner-desc');
  const cta = banner.querySelector('.sysrec-banner-cta');
  
  if (img)   img.src = sysrec.image;
  if (title) title.textContent = sysrec.title;
  if (desc)  desc.textContent = sysrec.description;
  if (cta) {
    cta.href = sysrec.link;
    cta.textContent = `${sysrec.cta || 'Shop Now'} ↗`;
  }
}

function _goToFloatSlide(index) {
  if (!sysrections.length) return;
  _floatIndex = ((index % sysrections.length) + sysrections.length) % sysrections.length;

  const card = document.getElementById(SYSREC_CONFIG.FLOAT_ID);
  if (!card) return;

  card.querySelectorAll('.sysrec-float-slide').forEach((slide, i) => {
    slide.classList.toggle('active', i === _floatIndex);
  });
  card.querySelectorAll('.sysrec-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === _floatIndex);
  });
}

function _startBannerSlider() {
  if (sysrections.length <= 1 || _bannerClosed || _bannerInCooldown) return;
  if (_bannerTimer) return; // Already running, do not restart
  _bannerTimer = setInterval(() => {
    _bannerIndex = (_bannerIndex + 1) % sysrections.length;
    _updateBannerUI();
    _bannerViews++;
    if (_bannerViews >= (sysrections.length * 2)) { // Rotate all items 2 times before cooldown
      _triggerCooldown('banner');
    }
  }, 4500); 
}

function _startFloatSlider() {
  if (sysrections.length < 1 || _floatClosed || _floatInCooldown) return;
  if (_floatTimer) return; // Already running, do not restart
  // Bottom Float only shows 1 item, so it stays for 10 seconds then cooldown starts
  _floatTimer = setTimeout(() => {
    _triggerCooldown('float');
  }, 10000);
}

function _stopBannerSlider() {
  if (_bannerTimer) { clearInterval(_bannerTimer); _bannerTimer = null; }
}
function _stopFloatSlider() {
  if (_floatTimer) { clearTimeout(_floatTimer); _floatTimer = null; }
}

function _triggerCooldown(which) {
  _hidePromoSilent(which);
  if (which === 'banner') {
    _bannerInCooldown = true;
    _stopBannerSlider();
    setTimeout(() => {
      _bannerInCooldown = false;
      _bannerViews = 0;
      if (!_bannerClosed) _showPromo('banner');
    }, 30000); // 30 sec cooldown
  } else {
    _floatInCooldown = true;
    _stopFloatSlider();
    setTimeout(() => {
      _floatInCooldown = false;
      _floatViews = 0;
      // Pick next random slide for when it reappears
      _goToFloatSlide(Math.floor(Math.random() * sysrections.length));
      if (!_floatClosed) _showPromo('float');
    }, 45000); // 45 sec cooldown
  }
}


function _isAllowedScreen() {
  const activeScreen = document.querySelector('.screen.active');
  return activeScreen && ['inputScreen', 'resultScreen', 'reportScreen'].includes(activeScreen.id);
}

// ──────────────────────────────────────────────
// 10. SHOW / HIDE / CLOSE LOGIC
// ──────────────────────────────────────────────
function _showPromo(mode = 'both') {
  if (!_isAllowedScreen() || _isCooldownActive()) return; // Abort if user is on a protected screen or cooldown active

  const banner = document.getElementById(SYSREC_CONFIG.BANNER_ID);
  const card   = document.getElementById(SYSREC_CONFIG.FLOAT_ID);

  if ((mode === 'both' || mode === 'banner') && banner && !_bannerClosed && !_bannerInCooldown) {
    if (banner.style.display === 'none' || !banner.classList.contains('sysrec-slide-in')) {
      banner.style.display = 'flex';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => banner.classList.add('sysrec-slide-in'));
      });
      _updateBannerUI();
      _adjustBodyOffset(true);
    }
    _startBannerSlider();
  }
  
  if ((mode === 'both' || mode === 'float') && card && !_floatClosed && !_floatInCooldown) {
    if (card.style.display === 'none' || !card.classList.contains('sysrec-slide-in')) {
      card.style.display = 'flex';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          card.classList.add('sysrec-slide-in');
          setTimeout(() => _adjustScreenPadding(true), 50);
        });
      });
    }
    _startFloatSlider();
  }
}

function _hidePromo(mode) {
  if (mode === 'both' || mode === 'banner') _stopBannerSlider();
  if (mode === 'both' || mode === 'float') _stopFloatSlider();
  const banner = document.getElementById(SYSREC_CONFIG.BANNER_ID);
  const card   = document.getElementById(SYSREC_CONFIG.FLOAT_ID);

  if ((mode === 'both' || mode === 'banner') && banner) {
    banner.classList.remove('sysrec-slide-in');
    setTimeout(() => {
      banner.style.display = 'none';
      _adjustBodyOffset(false);
    }, SYSREC_CONFIG.TRANSITION_MS);
  }
  if ((mode === 'both' || mode === 'float') && card) {
    card.classList.remove('sysrec-slide-in');
    setTimeout(() => {
      card.style.display = 'none';
      _adjustScreenPadding(false);
    }, SYSREC_CONFIG.TRANSITION_MS);
  }
}

function _hidePromoSilent(mode) {
  _hidePromo(mode); // Reused since hidePromo handles transitions cleanly
}

function _adjustScreenPadding(add) {
  const card = document.getElementById(SYSREC_CONFIG.FLOAT_ID);
  const isMobile = window.matchMedia('(max-width: 600px)').matches;
  
  const navOffset = isMobile && document.body.classList.contains('ps-has-nav') ? 75 : 12;
  const isVisible = add && card && !_floatClosed && !_floatInCooldown && window.getComputedStyle(card).display !== 'none';
  
  // Adjusted mobile gap slightly so it doesn't leave massive empty space 
  const cardH = card ? Math.min(card.offsetHeight || 130, 140) : 130;
  const paddingVal = isVisible ? (cardH + navOffset + 8) + 'px' : '';

  const activePanel = document.querySelector('.ps-panel.ps-panel-open .ps-panel-body');
  if (activePanel) {
    activePanel.style.transition = 'padding-bottom 0.35s ease';
    activePanel.style.paddingBottom = paddingVal;
  }

  const activeScreen = document.querySelector('.screen.active .screen-content');
  if (activeScreen) {
    activeScreen.style.transition = 'padding-bottom 0.35s ease';
    activeScreen.style.paddingBottom = paddingVal;
  }

  document.body.style.transition = 'padding-bottom 0.35s ease';
  document.body.style.paddingBottom = paddingVal;
}



// ──────────────────────────────────────────────
// 11. INLINE ALTERNATIVE CARD
//     Injected into resultScreen after analysis
// ──────────────────────────────────────────────
function _buildAltCard(sysrec) {
  const el = document.createElement('a');
  el.className  = 'sysrec-alt-card';
  el.href       = sysrec.link;
  el.target     = '_blank';
  el.rel        = 'noopener sponsored';
  el.setAttribute('aria-label', `Recommended: ${sysrec.title}`);
  el.innerHTML  = `
    <img
      class="sysrec-alt-img"
      src="${sysrec.image}"
      alt="${sysrec.brand}"
      onerror="this.src='https://via.placeholder.com/52x52/6366f1/ffffff?text=AD'"
    >
    <div class="sysrec-alt-body">
      <div class="sysrec-alt-badge">${sysrec.tag || 'Sponsored'}</div>
      <div class="sysrec-alt-title">${sysrec.title}</div>
      <div class="sysrec-alt-desc">${sysrec.description}</div>
    </div>
    <span class="sysrec-alt-arrow">›</span>
  `;

  el.addEventListener('click', () => _trackClick(sysrec.id));
  return el;
}

/**
 * Public API: Call this after product analysis to inject inline
 * alternative recommendation cards into the result screen.
 *
 * @param {string} productQuery - The product text the user searched (for category detection)
 */
function showAlternativeCards(productQuery) {
  if (!SYSRECTION_ENABLED) return;

  // Remove old cards first
  document.querySelectorAll('.sysrec-alt-card').forEach(el => el.remove());

  // Filter relevant sysrections based on food/health keywords
  const isRelevant = _isFoodHealthQuery(productQuery);
  if (!isRelevant) return;

  // Pick 2 random alternatives from the pool
  const shuffled = [...sysrections].sort(() => 0.5 - Math.random());
  const toShow = shuffled.slice(0, 2); // max 2 alternatives
  if (!toShow.length) return;

  // Find the injection point (before the View Report button)
  const viewReportBtn = document.getElementById('btnViewReport');
  const resultHero = document.querySelector('.result-hero');
  
  if (!viewReportBtn && !resultHero) return;

  // Build a container
  const container = document.createElement('div');
  container.id    = 'sysrecAltContainer';
  container.style.cssText = 'margin-top: 10px; margin-bottom: 16px; width: 100%; box-sizing: border-box; overflow: hidden;';

  const heading = document.createElement('div');
  heading.style.cssText = `
    font-size: 10.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted, rgba(148,163,184,0.7));
    padding: 0 0 6px 0;
  `;
  heading.textContent = '✦ Healthier Alternatives';
  container.appendChild(heading);

  toShow.forEach(sysrec => container.appendChild(_buildAltCard(sysrec)));

  if (viewReportBtn) {
    viewReportBtn.before(container);
  } else {
    resultHero.after(container);
  }
}


// ──────────────────────────────────────────────
// 12. HOOK INTO PURESCAN NAVIGATION
//     Listens for screen transitions and shows/
//     hides sysrection contextually.
// ──────────────────────────────────────────────
function _hookNavigation() {
  // Monkey-patch the global navigateTo if available
  const origNavigateTo = window.navigateTo;
  if (typeof origNavigateTo === 'function') {
    window.navigateTo = function(screenId) {
      origNavigateTo(screenId);

      if (!SYSRECTION_ENABLED || _isCooldownActive()) return;

      if (screenId === 'inputScreen' || screenId === 'resultScreen' || screenId === 'reportScreen') {
        // ✅ Show BOTH banner and float on Home (input), Result, and Report screens
        setTimeout(() => _showPromo('banner'), 800);
        setTimeout(() => _showPromo('float'), 1200);

      } else if (screenId === 'loadingScreen') {
        // ⏳ Hide float cleanly during analysis
        _hidePromoSilent('float');

      } else {
        // 🏠 Splash / HowItWorks — no ads yet, keep everything hidden
        _hidePromoSilent('both');
      }
    };
  }

  // Hook into Health Modules bottom navigation clicks
  document.addEventListener('click', (e) => {
    const navItem = e.target.closest('.ps-nav-item');
    if (navItem) {
      if (!SYSRECTION_ENABLED || _isCooldownActive()) return;
      // Re-trigger padding adjustment for the new panel after it slides up
      setTimeout(() => {
        _adjustScreenPadding(true);
      }, 150);
    }
  });
}

/**
 * Hide one component (banner or float) silently without cooldown.
 * @param {'banner'|'float'|'both'} which
 */
function _hidePromoSilent(which) {
  if (which === 'both' || which === 'banner') _stopBannerSlider();
  if (which === 'both' || which === 'float') _stopFloatSlider();
  const banner = document.getElementById(SYSREC_CONFIG.BANNER_ID);
  const card   = document.getElementById(SYSREC_CONFIG.FLOAT_ID);

  if ((which === 'both' || which === 'float') && card) {
    _adjustScreenPadding(false);  // restore page padding
    card.classList.remove('sysrec-slide-in');
    setTimeout(() => { card.style.display = 'none'; }, SYSREC_CONFIG.TRANSITION_MS);
  }
  if ((which === 'both' || which === 'banner') && banner) {
    banner.classList.remove('sysrec-slide-in');
    setTimeout(() => { banner.style.display = 'none'; }, SYSREC_CONFIG.TRANSITION_MS);
  }
}


// ──────────────────────────────────────────────
// 13. PUBLIC API (exposed on window)
// ──────────────────────────────────────────────

/**
 * PureScan Promotions public surface:
 *
 *   window.PureScanPromo.show()               → force show both
 *   window.PureScanPromo.hide()               → hide without cooldown
 *   window.PureScanPromo.close()              → hide + set cooldown
 *   window.PureScanPromo.showAlternatives(q)  → show inline alt cards
 *   window.PureScanPromo.goToSlide(n)         → jump to slide index
 *   window.PureScanPromo.getClickStats()      → returns click log object
 *   window.PureScanPromo.reset()              → clear cooldown (dev util)
 */
window.PureScanPromo = {
  show:             ()  => _showPromo('both'),
  showBanner:       ()  => _showPromo('banner'),
  showFloat:        ()  => _showPromo('float'),
  hide:             ()  => _hidePromo('both'),
  close:            ()  => {
    _bannerClosed = true;
    _floatClosed = true;
    _saveCooldown();
    _hidePromo('both');
    setTimeout(() => {
      _bannerClosed = false;
      _floatClosed = false;
      if (!_isCooldownActive()) _showPromo('both');
    }, SYSREC_CONFIG.COOLDOWN_MS);
  },
  showAlternatives: (q) => showAlternativeCards(q),
  goToSlide:        (n) => { _bannerIndex = n; _updateBannerUI(); _goToFloatSlide(n); },
  getClickStats:    ()  => {
    try { return JSON.parse(localStorage.getItem(SYSREC_CONFIG.CLICK_LOG_KEY) || '{}'); }
    catch(e) { return {}; }
  },
  reset: () => {
    localStorage.removeItem(SYSREC_CONFIG.STORAGE_KEY);
    console.info('[PureScanPromo] Cooldown cleared. Promotions will show on next display.');
  }
};


// ──────────────────────────────────────────────
// 14. INITIALIZATION
//     Runs automatically on DOMContentLoaded
// ──────────────────────────────────────────────
function initPromotions() {
  console.log('[PureScanPromo] Initializing...');
  if (!SYSRECTION_ENABLED) { console.log('[PureScanPromo] Disabled via config.'); return; }
  if (!sysrections.length) { console.log('[PureScanPromo] No sysrections to show.'); return; }

  // Clear cooldown on every reload so testing is easy (remove in prod if needed)
  try { localStorage.removeItem(SYSREC_CONFIG.STORAGE_KEY); } catch(e) {}

  _injectStyles();
  _buildBanner();
  _buildFloatCard();
  _hookNavigation();

  _sysrecReady = true;

  // Fallback: If user is ALREADY on inputScreen/resultScreen/reportScreen on load, force ads
  const activeScreen = document.querySelector('.screen.active');
  if (activeScreen && ['inputScreen', 'resultScreen', 'reportScreen'].includes(activeScreen.id)) {
    console.log('[PureScanPromo] Fallback ad trigger - already on ' + activeScreen.id);
    setTimeout(() => _showPromo('banner'), 400);
    setTimeout(() => _showPromo('float'), 800);
  } else {
    console.log('[PureScanPromo] Waiting for user to reach Home/Scan screen...');
  }

  // Hook into PureScan's analysis complete event to show inline alternatives
  // This works because script.js calls displayResults() after analysis
  const origDisplayResults = window.displayResults;
  if (typeof origDisplayResults === 'function') {
    window.displayResults = function(data) {
      origDisplayResults(data);
      // Remove stale alt cards
      const old = document.getElementById('sysrecAltContainer');
      if (old) old.remove();
      // Wait for DOM to render then inject alt cards
      setTimeout(() => {
        const query = (data && data.productName) || (window.AppState && window.AppState.productName) || '';
        showAlternativeCards(query);
      }, 200);
    };
  }
}

// Auto-start
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPromotions);
} else {
  // DOM is already ready — schedule after other scripts initialize
  setTimeout(initPromotions, 300);
}
