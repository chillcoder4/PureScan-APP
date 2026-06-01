/* =============================================
   PureScan — Main Application Logic
   Modular Vanilla JS with real API integration
   ============================================= */

// ==========================================
// CONFIGURATION & API KEYS
// ==========================================
const CONFIG = {
  HISTORY_KEY: 'purescan_history',
  THEME_KEY: 'purescan_theme',
  LANG_KEY: 'purescan_lang',
  MAX_HISTORY: 20
};

// ==========================================
// INTERNATIONALIZATION (i18n)
// ==========================================
// TRANSLATIONS object is now loaded from translations.js

// ==========================================
// APPLICATION STATE
// ==========================================
const AppState = {
  currentScreen: 'splashScreen',
  currentLang: 'en',
  currentTheme: 'dark',
  productName: '',
  analysisResult: null,
  uploadedImage: null,
  scannedBarcode: null,
  barcodeScanner: null,
  isScannerRunning: false,
  isAnalyzing: false,
};

// Language code → English name map for AI prompt injection
const LANG_CODE_TO_NAME = {
  'en': 'English',
  'hi': 'Hindi',
  'hinglish': 'Hinglish',
  'mr': 'Marathi',
  'gu': 'Gujarati',
  'ta': 'Tamil',
  'te': 'Telugu',
  'bn': 'Bengali',
  'kn': 'Kannada',
  'ml': 'Malayalam',
  'pa': 'Punjabi'
};

// ==========================================
// DOM REFERENCES (cached for performance)
// ==========================================
const DOM = {};

function cacheDOMElements() {
  DOM.screens = document.querySelectorAll('.screen');
  DOM.themeToggle = document.getElementById('themeToggle');
  DOM.langToggle = document.getElementById('langToggle');
  DOM.langLabel = document.getElementById('langLabel');

  // Splash
  DOM.btnStartScanning = document.getElementById('btnStartScanning');

  // How It Works
  DOM.btnContinue = document.getElementById('btnContinue');

  // Input Screen
  DOM.productSearchInput = document.getElementById('productSearchInput');
  DOM.searchSuggestions = document.getElementById('searchSuggestions');
  DOM.btnVoiceInput = document.getElementById('btnVoiceInput');
  DOM.btnAnalyze = document.getElementById('btnAnalyze');
  DOM.barcodeScannerArea = document.getElementById('barcodeScannerArea');
  DOM.barcodeScannerViewfinder = document.getElementById('barcodeScannerViewfinder');
  DOM.btnStartScanner = document.getElementById('btnStartScanner');
  DOM.btnStopScanner = document.getElementById('btnStopScanner');
  DOM.btnUploadBarcode = document.getElementById('btnUploadBarcode');
  DOM.barcodeFileInput = document.getElementById('barcodeFileInput');
  DOM.barcodeResult = document.getElementById('barcodeResult');
  DOM.barcodeValue = document.getElementById('barcodeValue');
  DOM.btnClearBarcode = document.getElementById('btnClearBarcode');
  DOM.historySection = document.getElementById('historySection');
  DOM.historyList = document.getElementById('historyList');

  // Tabs
  DOM.tabBtns = document.querySelectorAll('.tab-btn');
  DOM.tabContents = document.querySelectorAll('.tab-content');

  // Loading
  DOM.loadingStatus = document.getElementById('loadingStatus');
  DOM.loadingProgress = document.getElementById('loadingProgress');
  DOM.lstep1 = document.getElementById('lstep1');
  DOM.lstep2 = document.getElementById('lstep2');
  DOM.lstep3 = document.getElementById('lstep3');

  // Result
  DOM.resultBadge = document.getElementById('resultBadge');
  DOM.resultScore = document.getElementById('resultScore');
  DOM.resultProductName = document.getElementById('resultProductName');
  DOM.resultVerdict = document.getElementById('resultVerdict');
  DOM.tlGreen = document.getElementById('tlGreen');
  DOM.tlYellow = document.getElementById('tlYellow');
  DOM.tlRed = document.getElementById('tlRed');
  DOM.scaleMarker = document.getElementById('scaleMarker');
  DOM.markerValue = document.getElementById('markerValue');
  DOM.hlSugar = document.getElementById('hlSugar');
  DOM.hlProcessing = document.getElementById('hlProcessing');
  DOM.hlAdditives = document.getElementById('hlAdditives');
  DOM.hlSugarVal = document.getElementById('hlSugarVal');
  DOM.hlProcessingVal = document.getElementById('hlProcessingVal');
  DOM.hlAdditivesVal = document.getElementById('hlAdditivesVal');
  DOM.allergyAlert = document.getElementById('allergyAlert');
  DOM.allergyAlertText = document.getElementById('allergyAlertText');
  DOM.btnViewReport = document.getElementById('btnViewReport');
  DOM.btnScanAnother = document.getElementById('btnScanAnother');

  // Report
  DOM.reportProductSub = document.getElementById('reportProductSub');
  DOM.ingredientList = document.getElementById('ingredientList');
  DOM.hiddenTruthContent = document.getElementById('hiddenTruthContent');
  DOM.harmfulList = document.getElementById('harmfulList');
  DOM.sugarOilContent = document.getElementById('sugarOilContent');

  DOM.btnBackToResult = document.getElementById('btnBackToResult');
  DOM.btnShareReport = document.getElementById('btnShareReport');

  // Modal
  DOM.errorModal = document.getElementById('errorModal');
  DOM.errorMessage = document.getElementById('errorMessage');
  DOM.btnCloseError = document.getElementById('btnCloseError');

  // About
  DOM.aboutToggle = document.getElementById('aboutToggle');
  DOM.aboutModal = document.getElementById('aboutModal');
  DOM.btnCloseAbout = document.getElementById('btnCloseAbout');

  // Language Modal
  DOM.languageModal = document.getElementById('languageModal');
  DOM.btnCloseLanguage = document.getElementById('btnCloseLanguage');
  DOM.languageGrid = document.getElementById('languageGrid');

  // Back buttons
  DOM.backBtns = document.querySelectorAll('.btn-back');

  // UI Select
  DOM.uiSelectToggle = document.getElementById('uiSelectToggle');
  DOM.uiSelectModal = document.getElementById('uiSelectModal');
  DOM.btnCloseUiSelect = document.getElementById('btnCloseUiSelect');
  DOM.uiThemeBtns = document.querySelectorAll('.ui-theme-btn');
}

// ==========================================
// NAVIGATION
// ==========================================
function navigateTo(screenId) {
  const currentScreen = document.querySelector('.screen.active');
  if (currentScreen) {
    currentScreen.style.opacity = '0';
    currentScreen.style.transform = 'translateY(20px)';
    setTimeout(() => {
      currentScreen.classList.remove('active');
      currentScreen.style.display = 'none';
      showScreen(screenId);
    }, 300);
  } else {
    showScreen(screenId);
  }
}

function showScreen(screenId) {
  const screen = document.getElementById(screenId);
  if (!screen) return;

  screen.style.display = 'flex';
  screen.style.opacity = '0';
  screen.style.transform = 'translateY(20px)';

  // Force reflow
  screen.offsetHeight;

  requestAnimationFrame(() => {
    screen.classList.add('active');
    screen.style.opacity = '1';
    screen.style.transform = 'translateY(0)';
  });

  AppState.currentScreen = screenId;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Re-initialize icons on new screen
  if (window.lucide) {
    setTimeout(() => lucide.createIcons(), 50);
  }
}

// ==========================================
// THEME MANAGEMENT
// ==========================================
function initTheme() {
  const saved = localStorage.getItem(CONFIG.THEME_KEY);
  if (saved) {
    AppState.currentTheme = saved;
  }
  document.documentElement.setAttribute('data-theme', AppState.currentTheme);
}

function initUITheme() {
  const savedUI = localStorage.getItem('ps_custom_ui') || 'default';
  document.documentElement.setAttribute('data-ui-theme', savedUI);
  
  if (DOM.uiThemeBtns) {
    DOM.uiThemeBtns.forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.ui-theme-btn[data-theme-val="${savedUI}"]`);
    if (activeBtn) activeBtn.classList.add('active');
  }
  
  const activeLabel = document.getElementById('activeUiLabel');
  if (activeLabel) {
    if (savedUI === 'neumorphic') activeLabel.textContent = 'Neumorphic 3D';
    else if (savedUI === 'vibrant') activeLabel.textContent = 'Vibrant Glass';
    else activeLabel.textContent = 'Default Glass';
  }
}

function toggleTheme() {
  AppState.currentTheme = AppState.currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', AppState.currentTheme);
  localStorage.setItem(CONFIG.THEME_KEY, AppState.currentTheme);
  if (window.lucide) lucide.createIcons();
}

// ==========================================
// LANGUAGE MANAGEMENT
// ==========================================
function initLanguage() {
  const saved = localStorage.getItem(CONFIG.LANG_KEY);
  if (saved) {
    AppState.currentLang = saved;
  }
  
  // Populate Language Grid
  const langInfos = [
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
  
  DOM.languageGrid.innerHTML = langInfos.map(lang => `
    <button class="lang-btn ${AppState.currentLang === lang.code ? 'active' : ''}" data-lang-code="${lang.code}">
      <span class="lang-btn-name">${lang.name}</span>
      <span class="lang-btn-code">${lang.code}</span>
    </button>
  `).join('');

  DOM.languageGrid.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.getAttribute('data-lang-code'));
      hideLanguageModal();
    });
  });

  applyLanguage();
}

function showLanguageModal() {
  DOM.languageModal.style.display = 'flex';
  if (window.lucide) lucide.createIcons();
}

function hideLanguageModal() {
  DOM.languageModal.style.display = 'none';
}

async function setLanguage(langCode) {
  if (AppState.currentLang === langCode) return;
  
  AppState.currentLang = langCode;
  localStorage.setItem(CONFIG.LANG_KEY, AppState.currentLang);
  
  // Update UI active state
  DOM.languageGrid.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang-code') === langCode);
  });
  
  applyLanguage();

  // Handle dynamic translation for results screen instantly
  if ((AppState.currentScreen === 'resultScreen' || AppState.currentScreen === 'reportScreen') && AppState.analysisResult) {
    await translateCurrentAnalysis(langCode);
  }
}

async function translateCurrentAnalysis(targetLanguage) {
  // Show localized loader on screen
  navigateTo('loadingScreen');
  resetLoadingUI();
  updateLoadingStep(1, 'done', 33);
  updateLoadingStep(2, 'active', 66);
  DOM.loadingStatus.textContent = t('analyzing');

  try {
    const finalLang = LANG_CODE_TO_NAME[targetLanguage] || 'English';

    const response = await fetch('/.netlify/functions/translate-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetLanguage: finalLang,
        analysisData: AppState.analysisResult
      })
    });
    
    if(!response.ok) throw new Error('Translation failed');
    const translated = await response.json();
    AppState.analysisResult = translated;
    
    // update cache with the NEW language
    const cacheKey = AppState.productName.toLowerCase().trim() + '_' + targetLanguage;
    try {
      const store = JSON.parse(localStorage.getItem('ps_analysis_cache') || '{}');
      store[cacheKey] = translated;
      localStorage.setItem('ps_analysis_cache', JSON.stringify(store));
    } catch(e) {}
    
  } catch(e) {
    console.error('Dynamic translation failed:', e);
  }
  
  // Restore screen
  displayResults(AppState.analysisResult);
  navigateTo('resultScreen');
}

function applyLanguage() {
  const lang = AppState.currentLang;
  const tVals = TRANSLATIONS[lang] || TRANSLATIONS.en;
  let labelCode = lang === 'hinglish' ? 'HI-EN' : lang.toUpperCase();
  DOM.langLabel.textContent = labelCode;

  // Update all i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (tVals[key]) {
      el.innerHTML = tVals[key];
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (tVals[key]) {
      el.placeholder = tVals[key];
    }
  });

  // Notify health-modules and other plugins of language change
  if (typeof window.onPureScanLanguageChange === 'function') {
    window.onPureScanLanguageChange(lang);
  }
}

function t(key) {
  return (TRANSLATIONS[AppState.currentLang] && TRANSLATIONS[AppState.currentLang][key]) || TRANSLATIONS.en[key] || key;
}

// ==========================================
// TAB MANAGEMENT
// ==========================================
function initTabs() {
  DOM.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      DOM.tabBtns.forEach(b => b.classList.remove('active'));
      DOM.tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(targetTab).classList.add('active');

      updateAnalyzeButtonState();
    });
  });
}

// ==========================================
// SEARCH SUGGESTIONS
// ==========================================
const POPULAR_PRODUCTS = [
  'Maggi Noodles', 'Bournvita', 'Coca-Cola', 'Kurkure', 'Parle-G',
  'Amul Butter', 'Haldiram Bhujia', 'Tropicana Juice', 'Britannia Good Day',
  'Nestle KitKat', 'Cadbury Dairy Milk', 'Lays Chips', 'Mountain Dew',
  'Red Bull', 'Horlicks', 'Complan', 'Tang', 'Frooti', 'Maaza',
  'Pepsi', 'Sprite', 'Thums Up', 'Patanjali Noodles', 'Yippee Noodles',
  'Kissan Ketchup', 'Heinz Ketchup', 'Maggi Sauce', 'Nutella',
  'Oreo', 'Hide & Seek', 'Bourbon', 'Marie Gold', 'Monaco',
  'Real Juice', 'Paper Boat', 'Sting Energy', 'Glucon-D',
  'Chyawanprash', 'Saffola Oil', 'Fortune Oil', 'Mother Dairy Milk'
];

function initSearchSuggestions() {
  DOM.productSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    updateAnalyzeButtonState();

    if (query.length < 2) {
      DOM.searchSuggestions.classList.remove('visible');
      DOM.searchSuggestions.innerHTML = '';
      return;
    }

    const matches = POPULAR_PRODUCTS.filter(p =>
      p.toLowerCase().includes(query)
    ).slice(0, 5);

    if (matches.length > 0) {
      DOM.searchSuggestions.innerHTML = matches.map(name => `
        <div class="suggestion-item" data-name="${name}">
          <i data-lucide="search"></i>
          <span>${highlightMatch(name, query)}</span>
        </div>
      `).join('');

      DOM.searchSuggestions.classList.add('visible');
      if (window.lucide) lucide.createIcons();

      // Attach click handlers
      DOM.searchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
          DOM.productSearchInput.value = item.getAttribute('data-name');
          DOM.searchSuggestions.classList.remove('visible');
          updateAnalyzeButtonState();
        });
      });
    } else {
      DOM.searchSuggestions.classList.remove('visible');
    }
  });

  // Hide suggestions on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) {
      DOM.searchSuggestions.classList.remove('visible');
    }
  });

  // Enter key to analyze
  DOM.productSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && DOM.productSearchInput.value.trim()) {
      startAnalysis();
    }
  });
}

function highlightMatch(text, query) {
  const idx = text.toLowerCase().indexOf(query);
  if (idx === -1) return text;
  return text.substring(0, idx) +
    `<strong>${text.substring(idx, idx + query.length)}</strong>` +
    text.substring(idx + query.length);
}

// ==========================================
// BARCODE SCANNER
// ==========================================
function initBarcodeScanner() {
  // Start camera scanner button
  DOM.btnStartScanner.addEventListener('click', startBarcodeScanner);

  // Stop camera scanner button  
  DOM.btnStopScanner.addEventListener('click', stopBarcodeScanner);

  // Upload barcode image button
  DOM.btnUploadBarcode.addEventListener('click', () => DOM.barcodeFileInput.click());

  // Handle barcode image file selection
  DOM.barcodeFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleBarcodeImageUpload(e.target.files[0]);
    }
  });

  // Clear barcode button
  DOM.btnClearBarcode.addEventListener('click', clearBarcodeResult);
}

async function startBarcodeScanner() {
  if (AppState.isScannerRunning) return;

  // Security Context Check
  if (!window.isSecureContext) {
    showError('Camera access requires a secure connection (HTTPS). Please try using "Upload Barcode Image" or switch to a secure connection.');
    return;
  }

  // Change button text temporarily
  const originalText = DOM.btnStartScanner.innerHTML;
  DOM.btnStartScanner.innerHTML = '<i data-lucide="camera"></i> Requesting Permission...';

  // Step 1: Request camera permission using library's safe method
  let selectedCameraId = null;
  try {
    const devices = await Html5Qrcode.getCameras();
    if (devices && devices.length > 0) {
      // Find the best back/rear camera
      selectedCameraId = devices[0].id; // Fallback to first camera
      for (const device of devices) {
        const label = device.label.toLowerCase();
        if (label.includes('back') || label.includes('rear') || label.includes('environment') || label.includes('0')) {
          selectedCameraId = device.id;
          // Don't break immediately in case another one is even better, but usually the first "back" works well
          if (label.includes('back')) break; 
        }
      }
    } else {
      showError('No camera found on this device. Please use "Upload Barcode Image" instead.');
      DOM.btnStartScanner.innerHTML = originalText;
      return;
    }
  } catch (permErr) {
    console.error('Camera permission/hardware error:', permErr);
    showError('Camera permission denied or camera not accessible. Please allow camera access in your browser settings. Or use "Upload Barcode Image".');
    DOM.btnStartScanner.innerHTML = originalText;
    return;
  }

  // Restore button text
  DOM.btnStartScanner.innerHTML = originalText;

  // Step 2: Now start the barcode scanner (permission already granted)
  try {
    // Clean up old scanner
    if (AppState.barcodeScanner) {
      try { await AppState.barcodeScanner.clear(); } catch(e) {}
      AppState.barcodeScanner = null;
    }

    // Clear the viewfinder div content
    DOM.barcodeScannerViewfinder.innerHTML = '';

    AppState.barcodeScanner = new Html5Qrcode('barcodeScannerViewfinder', {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.QR_CODE
      ],
      verbose: false
    });

    DOM.barcodeScannerViewfinder.classList.add('scanner-active');
    DOM.btnStartScanner.style.display = 'none';
    DOM.btnStopScanner.style.display = 'flex';

    await AppState.barcodeScanner.start(
      { deviceId: { exact: selectedCameraId } },
      {
        fps: 10,
        qrbox: function(viewfinderWidth, viewfinderHeight) {
          let minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          let qrboxWidth = Math.floor(minEdge * 0.8);
          let qrboxHeight = Math.floor(qrboxWidth * 0.45);
          return { width: Math.max(qrboxWidth, 200), height: Math.max(qrboxHeight, 80) };
        },
        aspectRatio: 1.0,
        disableFlip: false
      },
      (decodedText) => {
        onBarcodeDetected(decodedText);
        stopBarcodeScanner();
      },
      (errorMessage) => {
        // Scan in progress — ignore per-frame errors
      }
    );

    AppState.isScannerRunning = true;
  } catch (err) {
    console.error('Scanner start failed:', err);
    
    if (AppState.barcodeScanner) {
      try { await AppState.barcodeScanner.clear(); } catch(e) {}
      AppState.barcodeScanner = null;
    }
    DOM.barcodeScannerViewfinder.classList.remove('scanner-active');
    DOM.btnStartScanner.style.display = 'flex';
    DOM.btnStopScanner.style.display = 'none';
    showError('Camera scanner failed to start. Please use "Upload Barcode Image" instead.');
  }
}

async function stopBarcodeScanner() {
  if (AppState.barcodeScanner && AppState.isScannerRunning) {
    try {
      await AppState.barcodeScanner.stop();
      await AppState.barcodeScanner.clear();
    } catch (e) {
      // Ignore stop errors
    }
    AppState.barcodeScanner = null;
  }
  AppState.isScannerRunning = false;
  DOM.barcodeScannerViewfinder.classList.remove('scanner-active');
  DOM.btnStartScanner.style.display = 'flex';
  DOM.btnStopScanner.style.display = 'none';
}

async function handleBarcodeImageUpload(file) {
  if (!file.type.startsWith('image/')) {
    showError('Please select an image file.');
    return;
  }

  try {
    // Create a temporary hidden div for the file scanner
    let tempDiv = document.getElementById('tempBarcodeScanner');
    if (!tempDiv) {
      tempDiv = document.createElement('div');
      tempDiv.id = 'tempBarcodeScanner';
      tempDiv.style.display = 'none';
      document.body.appendChild(tempDiv);
    }
    const tempScanner = new Html5Qrcode('tempBarcodeScanner', {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.QR_CODE
      ],
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true
      },
      verbose: false
    });

    const result = await tempScanner.scanFile(file, true);
    onBarcodeDetected(result);
    await tempScanner.clear();
  } catch (err) {
    console.error('Barcode image scan failed:', err);
    showError(t('barcodeNotDetected'));
  }
  DOM.barcodeFileInput.value = '';
}

function onBarcodeDetected(barcodeText) {
  AppState.scannedBarcode = barcodeText;
  DOM.barcodeValue.textContent = barcodeText;
  DOM.barcodeResult.style.display = 'flex';
  updateAnalyzeButtonState();

  // Haptic feedback if available
  if (navigator.vibrate) navigator.vibrate(100);

  if (window.lucide) lucide.createIcons();
}

function clearBarcodeResult() {
  AppState.scannedBarcode = null;
  DOM.barcodeResult.style.display = 'none';
  DOM.barcodeValue.textContent = '—';
  updateAnalyzeButtonState();
}

function generateBarcodeQuery(barcode) {
  return `${barcode} food product ingredients nutrition brand details India packaged food label`;
}

// ==========================================
// VOICE INPUT
// ==========================================
function initVoiceInput() {
  DOM.btnVoiceInput.addEventListener('click', () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showError(t('voiceNotSupported'));
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = AppState.currentLang === 'hi' ? 'hi-IN' : 'en-US';
    recognition.interimResults = false;

    DOM.btnVoiceInput.classList.add('recording');

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      DOM.productSearchInput.value = transcript;
      DOM.btnVoiceInput.classList.remove('recording');
      updateAnalyzeButtonState();
    };

    recognition.onerror = () => {
      DOM.btnVoiceInput.classList.remove('recording');
    };

    recognition.onend = () => {
      DOM.btnVoiceInput.classList.remove('recording');
    };

    recognition.start();
  });
}

// ==========================================
// ANALYZE BUTTON STATE
// ==========================================
function updateAnalyzeButtonState() {
  const textTabActive = document.querySelector('.tab-btn.active')?.getAttribute('data-tab') === 'textTab';
  const hasTextInput = DOM.productSearchInput.value.trim().length > 0;
  const hasBarcode = AppState.scannedBarcode !== null;

  DOM.btnAnalyze.disabled = !(textTabActive ? hasTextInput : hasBarcode);
}

// ==========================================
// ANALYSIS FLOW (VIA NETLIFY BACKEND)
// ==========================================
async function startAnalysis() {
  if (AppState.isAnalyzing) return;
  AppState.isAnalyzing = true;

  // Determine product name / barcode query
  const textTabActive = document.querySelector('.tab-btn.active')?.getAttribute('data-tab') === 'textTab';
  if (textTabActive) {
    AppState.productName = DOM.productSearchInput.value.trim();
  } else {
    // For barcode scans, generate smart search query
    if (AppState.scannedBarcode) {
      AppState.productName = generateBarcodeQuery(AppState.scannedBarcode);
    } else {
      AppState.productName = '';
    }
  }

  if (!AppState.productName) {
    if (textTabActive) {
      DOM.productSearchInput.classList.add('shake');
      setTimeout(() => DOM.productSearchInput.classList.remove('shake'), 400);
    }
    AppState.isAnalyzing = false;
    return;
  }

  // Stop barcode scanner if running
  if (AppState.isScannerRunning) {
    await stopBarcodeScanner();
  }

  // Navigate to loading screen
  navigateTo('loadingScreen');

  // Reset loading UI
  resetLoadingUI();

  try {
    const cacheKey = AppState.productName.toLowerCase().trim() + '_' + AppState.currentLang;
    let analysis = null;

    try {
      const store = JSON.parse(localStorage.getItem('ps_analysis_cache') || '{}');
      if (store[cacheKey]) {
        analysis = store[cacheKey];
      }
    } catch(e) {}

    if (analysis) {
      // CACHE HIT - Skip API calls
      updateLoadingStep(1, 'done', 50);
      updateLoadingStep(2, 'done', 80);
      await sleep(400); // UX smoothing
      updateLoadingStep(3, 'active', 90);
      DOM.loadingStatus.textContent = t('lStep3');
    } else {
      // CACHE MISS - Full API Flow
      // Step 1: Search product info via backend
      updateLoadingStep(1, 'active', 30);
      DOM.loadingStatus.textContent = t('fetchingData');

      const targetLangName = LANG_CODE_TO_NAME[AppState.currentLang] || 'English';

      // Call secure Netlify serverless function
      const response = await fetch('/.netlify/functions/analyze-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: AppState.productName, targetLanguage: targetLangName })
      });

      updateLoadingStep(1, 'done', 50);

      // Step 2: Process AI analysis
      updateLoadingStep(2, 'active', 70);
      DOM.loadingStatus.textContent = t('lStep2');

      if (!response.ok) {
        let errMsg = t('apiError');
        try {
          const errData = await response.json();
          if (errData.error) errMsg = errData.error;
        } catch (e) {}
        throw new Error(errMsg);
      }

      analysis = await response.json();

      if (!analysis || !analysis.healthScore) {
        throw new Error(t('apiError'));
      }

      // Check if the product is food-related
      if (analysis.isFood === false) {
        showError(analysis.shortSummary || 'This product is not a food-related item. Please scan only food products for analysis.');
        navigateTo('inputScreen');
        AppState.isAnalyzing = false;
        return;
      }

      // Save to Cache
      try {
        const store = JSON.parse(localStorage.getItem('ps_analysis_cache') || '{}');
        store[cacheKey] = analysis;
        const keys = Object.keys(store);
        if (keys.length > 50) delete store[keys[0]]; // Max 50 items
        localStorage.setItem('ps_analysis_cache', JSON.stringify(store));
      } catch(e) {}

      updateLoadingStep(2, 'done', 80);

      // Step 3: Calculate & display
      updateLoadingStep(3, 'active', 90);
      DOM.loadingStatus.textContent = t('lStep3');
    }

    await sleep(600); // Brief pause for UX
    updateLoadingStep(3, 'done', 100);

    AppState.analysisResult = analysis;

    // Save to history
    saveToHistory(analysis);

    await sleep(400);

    // Navigate to results
    displayResults(analysis);
    navigateTo('resultScreen');

  } catch (error) {
    console.error('Analysis failed:', error);
    showError(error.message || t('apiError'));
    navigateTo('inputScreen');
  } finally {
    AppState.isAnalyzing = false;
  }
}

function resetLoadingUI() {
  DOM.loadingProgress.style.width = '0%';
  ['lstep1', 'lstep2', 'lstep3'].forEach(id => {
    DOM[id].classList.remove('active', 'done');
  });
}

function updateLoadingStep(step, status, progress) {
  const stepEl = DOM[`lstep${step}`];

  if (status === 'active') {
    stepEl.classList.add('active');
    stepEl.classList.remove('done');
  } else if (status === 'done') {
    stepEl.classList.remove('active');
    stepEl.classList.add('done');
  }

  DOM.loadingProgress.style.width = `${progress}%`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// DISPLAY RESULTS
// ==========================================
function displayResults(data) {
  const score = parseFloat(data.healthScore) || 5;
  const verdict = data.verdict || 'Moderate';

  // Product name
  DOM.resultProductName.textContent = data.productName || AppState.productName;
  DOM.reportProductSub.textContent = `for ${data.productName || AppState.productName}`;

  // Score badge
  DOM.resultScore.textContent = score.toFixed(1);

  // Color classification
  let colorClass, verdictClass, verdictText, activeLight;
  if (score >= 8) {
    colorClass = 'badge-green';
    verdictClass = 'verdict-green';
    verdictText = t('safe_verdict');
    activeLight = 'tlGreen';
  } else if (score >= 4) {
    colorClass = 'badge-yellow';
    verdictClass = 'verdict-yellow';
    verdictText = t('moderate_verdict');
    activeLight = 'tlYellow';
  } else {
    colorClass = 'badge-red';
    verdictClass = 'verdict-red';
    verdictText = t('avoid_verdict');
    activeLight = 'tlRed';
  }

  DOM.resultBadge.className = `result-badge ${colorClass}`;
  DOM.resultVerdict.className = `result-verdict ${verdictClass}`;
  DOM.resultVerdict.innerHTML = `<i data-lucide="${score >= 8 ? 'shield-check' : score >= 4 ? 'alert-triangle' : 'shield-x'}"></i><span>${verdictText}</span>`;

  // Traffic lights
  ['tlGreen', 'tlYellow', 'tlRed'].forEach(id => {
    DOM[id].classList.toggle('active', id === activeLight);
  });

  // Health scale
  const scalePercent = (score / 10) * 100;
  DOM.scaleMarker.style.left = `${scalePercent}%`;
  DOM.markerValue.textContent = score.toFixed(1);

  // Quick highlights
  setHighlightCard(DOM.hlSugar, DOM.hlSugarVal, data.sugarLevel || 'Unknown');
  setHighlightCard(DOM.hlProcessing, DOM.hlProcessingVal, data.processingLevel || 'Unknown');
  setHighlightCard(DOM.hlAdditives, DOM.hlAdditivesVal, data.additivesLevel || 'Unknown');

  // Allergy alert
  if (data.allergyAlerts && data.allergyAlerts.length > 0 && data.allergyAlerts[0] !== 'None') {
    DOM.allergyAlert.style.display = 'flex';
    DOM.allergyAlertText.textContent = data.allergyAlerts.join(', ');
  } else {
    DOM.allergyAlert.style.display = 'none';
  }

  // Populate detailed report
  populateReport(data);

  // Refresh icons
  if (window.lucide) setTimeout(() => lucide.createIcons(), 50);
}

function setHighlightCard(card, valueEl, value) {
  valueEl.textContent = value;
  const lowerVal = value.toLowerCase();

  card.classList.remove('hl-green', 'hl-yellow', 'hl-red');

  if (['none', 'low', 'minimal', 'few'].includes(lowerVal)) {
    card.classList.add('hl-green');
  } else if (['moderate', 'several'].includes(lowerVal)) {
    card.classList.add('hl-yellow');
  } else {
    card.classList.add('hl-red');
  }
}

// ==========================================
// POPULATE DETAILED REPORT
// ==========================================
function populateReport(data) {
  // Ingredient Breakdown
  if (data.ingredients && data.ingredients.length > 0) {
    DOM.ingredientList.innerHTML = data.ingredients.map(ing => `
      <div class="ingredient-item">
        <div class="ingredient-name">
          <span class="ingredient-dot dot-${ing.status || 'caution'}"></span>
          <span>${ing.name}${ing.chemicalName ? ` <small style="color:var(--text-muted)">(${ing.chemicalName})</small>` : ''}</span>
        </div>
        <span class="ingredient-status status-${ing.status || 'caution'}">${
          ing.status === 'safe' ? '✓ Safe' : ing.status === 'danger' ? '✗ Harmful' : '⚠ Caution'
        }</span>
      </div>
    `).join('');
  } else {
    DOM.ingredientList.innerHTML = '<p style="color:var(--text-muted)">No ingredient data available.</p>';
  }

  // Hidden Truth
  DOM.hiddenTruthContent.innerHTML = `<p>${data.hiddenTruth || 'No hidden truth analysis available.'}</p>`;

  // Harmful Components
  if (data.harmfulComponents && data.harmfulComponents.length > 0) {
    DOM.harmfulList.innerHTML = data.harmfulComponents.map(h => `
      <div class="harmful-item">
        <i data-lucide="alert-triangle" class="harmful-icon"></i>
        <div>
          <h4>${h.name}</h4>
          <p>${h.reason}</p>
        </div>
      </div>
    `).join('');
  } else {
    DOM.harmfulList.innerHTML = '<p style="color:var(--text-muted)">No harmful components detected.</p>';
  }

  // Sugar & Oil Warning
  DOM.sugarOilContent.innerHTML = `<p>${data.sugarOilWarning || 'No sugar or oil warnings.'}</p>`;


  if (window.lucide) setTimeout(() => lucide.createIcons(), 50);
}

// ==========================================
// HISTORY MANAGEMENT
// ==========================================
function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(CONFIG.HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function saveToHistory(data) {
  const history = getHistory();
  const entry = {
    id: Date.now(),
    productName: data.productName || AppState.productName,
    healthScore: data.healthScore,
    verdict: data.verdict,
    date: new Date().toLocaleDateString(),
    data: data
  };

  // Avoid duplicates (by name in last 5 items)
  const filtered = history.filter(h =>
    h.productName.toLowerCase() !== entry.productName.toLowerCase()
  );

  filtered.unshift(entry);

  // Limit history
  if (filtered.length > CONFIG.MAX_HISTORY) {
    filtered.length = CONFIG.MAX_HISTORY;
  }

  localStorage.setItem(CONFIG.HISTORY_KEY, JSON.stringify(filtered));
}

function renderHistory() {
  const history = getHistory();
  const emptyState = document.getElementById('historyEmptyState');
  const clearBtn = document.getElementById('btnClearHistory');
  
  if (history.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    if (clearBtn) clearBtn.style.opacity = '0.5';
    DOM.historyList.innerHTML = '';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (clearBtn) clearBtn.style.opacity = '1';

  DOM.historyList.innerHTML = history.map(item => {
    const score = parseFloat(item.healthScore) || 5;
    let scoreClass = 'score-yellow';
    if (score >= 8) scoreClass = 'score-green';
    else if (score < 4) scoreClass = 'score-red';

    return `
      <div class="history-item" data-history-id="${item.id}">
        <div class="history-item-info">
          <div class="history-score ${scoreClass}">${score.toFixed(1)}</div>
          <div>
            <div class="history-name">${item.productName}</div>
            <div class="history-date">${item.date}</div>
          </div>
        </div>
        <i data-lucide="chevron-right" style="color:var(--text-muted); width:16px;"></i>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();

  // Click to view history item
  DOM.historyList.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = parseInt(item.getAttribute('data-history-id'));
      const history = getHistory();
      const entry = history.find(h => h.id === id);
      if (entry && entry.data) {
        AppState.analysisResult = entry.data;
        AppState.productName = entry.productName;
        displayResults(entry.data);
        navigateTo('resultScreen');
        // Close history drawer
        const drawer = document.getElementById('historyDrawer');
        if (drawer) {
          drawer.classList.remove('open');
          setTimeout(() => drawer.style.display = 'none', 300);
        }
      }
    });
  });
}

// ==========================================
// ERROR HANDLING
// ==========================================
function showError(message) {
  DOM.errorMessage.textContent = message;
  DOM.errorModal.style.display = 'flex';
  if (window.lucide) lucide.createIcons();
}

function hideError() {
  DOM.errorModal.style.display = 'none';
}

// ==========================================
// SHARE REPORT
// ==========================================
function shareReport() {
  const data = AppState.analysisResult;
  if (!data) return;

  const text = `🔍 PureScan Report: ${data.productName}\n` +
    `Health Score: ${data.healthScore}/10 ${data.verdict === 'Safe' ? '🟢' : data.verdict === 'Moderate' ? '🟡' : '🔴'}\n` +
    `Verdict: ${data.verdict}\n\n` +
    `${data.shortSummary || ''}\n\n` +
    `Scanned with PureScan — Listen to Science, Not Marketing.`;

  if (navigator.share) {
    navigator.share({
      title: `PureScan: ${data.productName}`,
      text: text
    }).catch(() => {
      fallbackShare(text);
    });
  } else {
    fallbackShare(text);
  }
}

function fallbackShare(text) {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) {
    // Deep link directly to WhatsApp on mobile if HTTPS web share fails
    window.location.href = `whatsapp://send?text=${encodeURIComponent(text)}`;
    showShareSuccess('Sent!');
  } else {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => showShareSuccess('Copied!'))
      .catch(() => legacyCopy(text));
    } else {
      legacyCopy(text);
    }
  }
}

function showShareSuccess(msg) {
  const original = DOM.btnShareReport.innerHTML;
  DOM.btnShareReport.innerHTML = `<i data-lucide="check"></i> ${msg}`;
  if (window.lucide) lucide.createIcons();
  setTimeout(() => {
    DOM.btnShareReport.innerHTML = original;
    if (window.lucide) lucide.createIcons();
  }, 2000);
}

function legacyCopy(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showShareSuccess('Copied!');
  } catch (err) {}
  document.body.removeChild(textArea);
}

// ==========================================
// ABOUT MODAL
// ==========================================
function showAbout() {
  DOM.aboutModal.style.display = 'flex';
  if (window.lucide) lucide.createIcons();
}

function hideAbout() {
  DOM.aboutModal.style.display = 'none';
}

// ==========================================
// EVENT BINDINGS
// ==========================================
function bindEvents() {
  // Settings Dropdown
  const settingsContainer = document.getElementById('settingsContainer');
  const settingsToggle = document.getElementById('settingsToggle');
  if (settingsToggle && settingsContainer) {
    settingsToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsContainer.classList.toggle('open');
      settingsToggle.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
      if (!settingsContainer.contains(e.target)) {
        settingsContainer.classList.remove('open');
        settingsToggle.classList.remove('active');
      }
    });
  }

  // Theme & Language
  DOM.themeToggle.addEventListener('click', toggleTheme);
  DOM.langToggle.addEventListener('click', showLanguageModal);

  // Language Modal events
  DOM.btnCloseLanguage.addEventListener('click', hideLanguageModal);
  DOM.languageModal.addEventListener('click', (e) => {
    if (e.target === DOM.languageModal) hideLanguageModal();
  });

  // UI Select Modal events
  if (DOM.uiSelectToggle && DOM.uiSelectModal) {
    DOM.uiSelectToggle.addEventListener('click', () => {
      DOM.uiSelectModal.style.display = 'flex';
      if (window.lucide) lucide.createIcons();
    });
    DOM.btnCloseUiSelect.addEventListener('click', () => {
      DOM.uiSelectModal.style.display = 'none';
    });
    DOM.uiSelectModal.addEventListener('click', (e) => {
      if (e.target === DOM.uiSelectModal) DOM.uiSelectModal.style.display = 'none';
    });
    // Handle theme switching
    DOM.uiThemeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const themeVal = btn.getAttribute('data-theme-val');
        
        // Update LocalStorage
        localStorage.setItem('ps_custom_ui', themeVal);
        
        // Update DOM
        document.documentElement.setAttribute('data-ui-theme', themeVal);
        
        // Update Active Button State
        DOM.uiThemeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update Dropdown Label
        const activeLabel = document.getElementById('activeUiLabel');
        if (activeLabel) {
          if (themeVal === 'neumorphic') activeLabel.textContent = 'Neumorphic 3D';
          else if (themeVal === 'vibrant') activeLabel.textContent = 'Vibrant Glass';
          else activeLabel.textContent = 'Default Glass';
        }
        
        DOM.uiSelectModal.style.display = 'none';
      });
    });
  }

  // Navigation
  DOM.btnStartScanning.addEventListener('click', () => navigateTo('howItWorksScreen'));
  DOM.btnContinue.addEventListener('click', () => {
    navigateTo('registerScreen');
  });

  // Onboarding Registration Form Submit
  const formRegister = document.getElementById('formRegister');
  if (formRegister) {
    formRegister.addEventListener('submit', (e) => {
      e.preventDefault();
      const profile = {
        name: document.getElementById('regName').value.trim(),
        email: document.getElementById('regEmail').value.trim(),
        gender: document.querySelector('.gender-btn.active')?.getAttribute('data-gender') || 'Male',
        age: parseInt(document.getElementById('regAge').value),
        goal: document.getElementById('regGoal').value,
        activity: document.getElementById('regActivity').value
      };
      localStorage.setItem('purescan_user_profile', JSON.stringify(profile));
      localStorage.setItem('ps_onboarded', '1');
      updateProfileDisplay();
      navigateTo('inputScreen');
      renderHistory();
    });
  }

  // Onboarding Gender Buttons Toggle
  document.querySelectorAll('.gender-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Profile Edit Form Submit
  const formEditProfile = document.getElementById('formEditProfile');
  if (formEditProfile) {
    formEditProfile.addEventListener('submit', (e) => {
      e.preventDefault();
      const profile = {
        name: document.getElementById('editName').value.trim(),
        email: document.getElementById('editEmail').value.trim(),
        gender: document.querySelector('.gender-edit-btn.active')?.getAttribute('data-gender') || 'Male',
        age: parseInt(document.getElementById('editAge').value),
        goal: document.getElementById('editGoal').value,
        activity: document.getElementById('editActivity').value
      };
      localStorage.setItem('purescan_user_profile', JSON.stringify(profile));
      updateProfileDisplay();
      const editModal = document.getElementById('profileEditModal');
      if (editModal) editModal.style.display = 'none';
    });
  }

  // Edit Modal Gender Buttons Toggle
  document.querySelectorAll('.gender-edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.gender-edit-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Close Profile Edit Modal
  const btnCloseProfileEdit = document.getElementById('btnCloseProfileEdit');
  if (btnCloseProfileEdit) {
    btnCloseProfileEdit.addEventListener('click', () => {
      const editModal = document.getElementById('profileEditModal');
      if (editModal) editModal.style.display = 'none';
    });
  }

  DOM.btnAnalyze.addEventListener('click', startAnalysis);
  DOM.btnViewReport.addEventListener('click', () => navigateTo('reportScreen'));
  DOM.btnScanAnother.addEventListener('click', () => {
    DOM.productSearchInput.value = '';
    clearBarcodeResult();
    updateAnalyzeButtonState();
    navigateTo('inputScreen');
    renderHistory();
  });
  DOM.btnBackToResult.addEventListener('click', () => navigateTo('resultScreen'));
  DOM.btnShareReport.addEventListener('click', shareReport);

  // Back buttons
  DOM.backBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      navigateTo(target);
      if (target === 'inputScreen') renderHistory();
    });
  });

  // Error modal
  DOM.btnCloseError.addEventListener('click', hideError);
  DOM.errorModal.addEventListener('click', (e) => {
    if (e.target === DOM.errorModal) hideError();
  });

  // About modal
  DOM.aboutToggle.addEventListener('click', showAbout);
  DOM.btnCloseAbout.addEventListener('click', hideAbout);
  DOM.aboutModal.addEventListener('click', (e) => {
    if (e.target === DOM.aboutModal) hideAbout();
  });

  // REDESIGNED HOME SCREEN & HISTORY DRAWER EVENTS
  const drawer = document.getElementById('historyDrawer');
  const openHistoryBtn = document.getElementById('btnOpenHistory');
  const closeHistoryBtn = document.getElementById('btnCloseHistory');
  const clearHistoryBtn = document.getElementById('btnClearHistory');

  if (openHistoryBtn && drawer) {
    openHistoryBtn.addEventListener('click', () => {
      drawer.style.display = 'block';
      // Force reflow
      drawer.offsetHeight;
      drawer.classList.add('open');
      renderHistory();
    });
  }

  if (closeHistoryBtn && drawer) {
    closeHistoryBtn.addEventListener('click', () => {
      drawer.classList.remove('open');
      setTimeout(() => {
        drawer.style.display = 'none';
      }, 300);
    });
  }

  if (drawer) {
    drawer.addEventListener('click', (e) => {
      if (e.target === drawer) {
        drawer.classList.remove('open');
        setTimeout(() => {
          drawer.style.display = 'none';
        }, 300);
      }
    });
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      if (confirm('Clear all scan history?')) {
        localStorage.removeItem(CONFIG.HISTORY_KEY);
        renderHistory();
      }
    });
  }

  // settings dropdown in header
  const homeSettingsToggle = document.getElementById('homeSettingsToggle');
  if (homeSettingsToggle) {
    homeSettingsToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const settingsToggle = document.getElementById('settingsToggle');
      if (settingsToggle) settingsToggle.click();
    });
  }

  // Feature cards click handlers
  const btnFeatureQuickScan = document.getElementById('btnFeatureQuickScan');
  if (btnFeatureQuickScan) {
    btnFeatureQuickScan.addEventListener('click', () => {
      // Find scan button in bottom nav and click it
      const scanNavBtn = document.querySelector('.ps-nav-item[data-panel="scan"]');
      if (scanNavBtn) scanNavBtn.click();
    });
  }

  const btnFeatureAiInsight = document.getElementById('btnFeatureAiInsight');
  if (btnFeatureAiInsight) {
    btnFeatureAiInsight.addEventListener('click', () => {
      const chatNavBtn = document.querySelector('.ps-nav-item[data-panel="chat"]');
      if (chatNavBtn) chatNavBtn.click();
    });
  }

  const searchCameraBtn = document.getElementById('searchCameraBtn');
  if (searchCameraBtn) {
    searchCameraBtn.addEventListener('click', () => {
      const scanNavBtn = document.querySelector('.ps-nav-item[data-panel="scan"]');
      if (scanNavBtn) scanNavBtn.click();
    });
  }
}

// ==========================================
// PROFILE DISPLAY & EDITING
// ==========================================
function updateProfileDisplay() {
  const profileData = localStorage.getItem('purescan_user_profile');
  if (!profileData) return;
  
  try {
    const profile = JSON.parse(profileData);
    
    // Update Profile Panel Card
    const profileNameEl = document.querySelector('#psProfilePanel .profile-name');
    const profileEmailEl = document.querySelector('#psProfilePanel .profile-email');
    if (profileNameEl) profileNameEl.textContent = profile.name || 'John Doe';
    if (profileEmailEl) profileEmailEl.textContent = profile.email || 'john.doe@mail.com';
    
    // Update menu values
    const profPersonalVal = document.getElementById('profPersonalVal');
    if (profPersonalVal) {
      profPersonalVal.textContent = `${profile.age || '—'} yrs, ${profile.gender || 'Male'}`;
    }
    
    const profGoalsVal = document.getElementById('profGoalsVal');
    if (profGoalsVal) {
      profGoalsVal.textContent = profile.goal || 'Maintain Health';
    }
    
    const profActivityVal = document.getElementById('profActivityVal');
    if (profActivityVal) {
      profActivityVal.textContent = profile.activity || 'Active';
    }
  } catch(e) {
    console.error('Error updating profile display:', e);
  }
}

window.showProfileEditModal = function(focusFieldId = null) {
  const profileData = localStorage.getItem('purescan_user_profile');
  if (!profileData) return;
  
  try {
    const profile = JSON.parse(profileData);
    document.getElementById('editName').value = profile.name || '';
    document.getElementById('editEmail').value = profile.email || '';
    document.getElementById('editAge').value = profile.age || '';
    document.getElementById('editGoal').value = profile.goal || 'Maintain Health';
    document.getElementById('editActivity').value = profile.activity || 'Active';
    
    document.querySelectorAll('.gender-edit-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-gender') === (profile.gender || 'Male'));
    });
    
    const editModal = document.getElementById('profileEditModal');
    if (editModal) {
      editModal.style.display = 'flex';
      if (window.lucide) lucide.createIcons();
      
      if (focusFieldId) {
        const field = document.getElementById(focusFieldId);
        if (field) setTimeout(() => field.focus(), 100);
      }
    }
  } catch(e) {
    console.error('Error showing profile edit modal:', e);
  }
};

// ==========================================
// INITIALIZATION
// ==========================================
function init() {
  cacheDOMElements();
  initTheme();
  initUITheme();
  initLanguage();
  initTabs();
  initSearchSuggestions();
  initBarcodeScanner();
  initVoiceInput();
  bindEvents();

  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Check if user has visited before
  const hasVisited = localStorage.getItem('ps_onboarded');
  const profileSaved = localStorage.getItem('purescan_user_profile');

  if (hasVisited && profileSaved) {
    // Returning user with profile → skip splash & how-it-works, go direct to home
    updateProfileDisplay();
    navigateTo('inputScreen');
    renderHistory();
  } else if (hasVisited && !profileSaved) {
    // Visited but somehow no profile -> register screen
    navigateTo('registerScreen');
  } else {
    // First-time user → show full onboarding flow
    setTimeout(() => {
      document.getElementById('splashScreen').classList.add('active');
    }, 100);
  }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
