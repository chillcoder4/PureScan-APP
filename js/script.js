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
  currentUserId: null,
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

  // Register / Login
  DOM.btnContinueAsGuest = document.getElementById('btnContinueAsGuest');

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
  DOM.btnCancelError = document.getElementById('btnCancelError');

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
  if (AppState.isScannerRunning) {
    stopBarcodeScanner();
  }
  const currentScreen = document.querySelector('.screen.active');
  if (currentScreen) {
    currentScreen.style.opacity = '0';
    currentScreen.style.transform = 'translate3d(0, 20px, 0)';
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
  screen.style.transform = 'translate3d(0, 20px, 0)';

  // Force reflow
  screen.offsetHeight;

  requestAnimationFrame(() => {
    screen.classList.add('active');
    screen.style.opacity = '1';
    screen.style.transform = 'translate3d(0, 0, 0)';
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
  if (PureFirebase.auth.currentUser) {
    PureFirebase.saveSetting('theme', AppState.currentTheme).catch(e => console.warn('Theme sync error:', e));
  }
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
  if (PureFirebase.auth.currentUser) {
    PureFirebase.saveSetting('lang', langCode).catch(e => console.warn('Lang sync error:', e));
  }
  
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
// CUSTOM TOAST & CONFIRM MODALS
// ==========================================
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  else if (type === 'error') iconName = 'alert-circle';
  else if (type === 'warning') iconName = 'alert-triangle';

  toast.innerHTML = `
    <div class="toast-icon">
      <i data-lucide="${iconName}"></i>
    </div>
    <div class="toast-text">${message}</div>
  `;

  container.appendChild(toast);
  
  if (window.lucide) {
    lucide.createIcons({
      attrs: { style: 'width: 18px; height: 18px;' },
      nameAttr: 'data-lucide'
    });
  }

  // Reflow and show
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Auto-dismiss
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 350);
  }, 3500);
}

// Make globally accessible for other modules
window.showToast = showToast;

function showConfirm(messageKeyOrText, onConfirm) {
  const modal = document.getElementById('confirmModal');
  if (!modal) {
    // Fallback if HTML element not found
    if (confirm(t(messageKeyOrText))) {
      onConfirm();
    }
    return;
  }

  const msgEl = document.getElementById('confirmMessage');
  msgEl.innerHTML = t(messageKeyOrText);

  modal.style.display = 'flex';
  if (window.lucide) lucide.createIcons();

  const btnOK = document.getElementById('btnConfirmOK');
  const btnCancel = document.getElementById('btnConfirmCancel');

  const cleanUp = () => {
    modal.style.display = 'none';
    const newOK = btnOK.cloneNode(true);
    const newCancel = btnCancel.cloneNode(true);
    btnOK.parentNode.replaceChild(newOK, btnOK);
    btnCancel.parentNode.replaceChild(newCancel, btnCancel);
  };

  document.getElementById('btnConfirmOK').addEventListener('click', () => {
    cleanUp();
    onConfirm();
  });

  document.getElementById('btnConfirmCancel').addEventListener('click', () => {
    cleanUp();
  });
}

// Make globally accessible
window.showConfirm = showConfirm;

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

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function initSearchSuggestions() {
  const showSuggestionsDebounced = debounce((query) => {
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
  }, 300);

  DOM.productSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
<<<<<<< HEAD
    if (AppState.scannedBarcode) {
      clearBarcodeResult();
    }
=======
>>>>>>> a39291dd39e8f0fccb4a83481de239c8cc703ccc
    updateAnalyzeButtonState();
    showSuggestionsDebounced(query);
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

function preprocessBarcodeImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const maxDim = 800; // Optimal search space for linear barcode decoders
      let { width, height } = img;
      
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      URL.revokeObjectURL(objectUrl);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve({ blob, canvas });
        } else {
          reject(new Error('Canvas toBlob failed'));
        }
      }, 'image/jpeg', 0.9);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };
    img.src = objectUrl;
  });
}

async function handleBarcodeImageUpload(file) {
  if (!file.type.startsWith('image/')) {
    showError('Please select an image file.');
    return;
  }

  // Show a mini processing loader
  const originalUploadHTML = DOM.btnUploadBarcode.innerHTML;
  DOM.btnUploadBarcode.innerHTML = '<i data-lucide="loader"></i> Processing...';
  if (window.lucide) lucide.createIcons();

  let detectedText = null;
  let preprocessed = null;

  try {
    // Preprocess/downscale the large photo to 800px optimal search space
    preprocessed = await preprocessBarcodeImage(file);
    
    // 1. Try Native BarcodeDetector first on the preprocessed canvas if supported
    if ('BarcodeDetector' in window) {
      try {
        const supportedFormats = await BarcodeDetector.getSupportedFormats();
        const desiredFormats = [
          'ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'itf', 'qr_code'
        ].filter(f => supportedFormats.includes(f));

        if (desiredFormats.length > 0) {
          const detector = new BarcodeDetector({ formats: desiredFormats });
          const results = await detector.detect(preprocessed.canvas);
          if (results && results.length > 0) {
            detectedText = results[0].rawValue;
            console.log('Barcode detected using preprocessed canvas + native BarcodeDetector API:', detectedText);
          }
        }
      } catch (nativeErr) {
        console.warn('Native BarcodeDetector on canvas failed, falling back to Html5Qrcode:', nativeErr);
      }
    }

    // 2. Fall back to Html5Qrcode scanFile using preprocessed downscaled Blob
    if (!detectedText) {
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

      detectedText = await tempScanner.scanFile(preprocessed.blob, false);
      await tempScanner.clear();
      console.log('Barcode detected using preprocessed blob + Html5Qrcode:', detectedText);
    }

    // 3. Trigger success
    if (detectedText) {
      onBarcodeDetected(detectedText);
    } else {
      throw new Error('No barcode detected in image');
    }
  } catch (err) {
    console.error('Barcode image scan failed across all methods:', err);
    showError(t('barcodeNotDetected'));
  } finally {
    DOM.btnUploadBarcode.innerHTML = originalUploadHTML;
    if (window.lucide) lucide.createIcons();
    DOM.barcodeFileInput.value = '';
  }
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
  // Return raw barcode so the backend can perform database resolution
  return barcode;
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
<<<<<<< HEAD
  const hasTextInput = DOM.productSearchInput.value.trim().length > 0;
  const hasBarcode = AppState.scannedBarcode !== null;

  DOM.btnAnalyze.disabled = !(hasTextInput || hasBarcode);
=======
  const textTabActive = document.querySelector('.tab-btn.active')?.getAttribute('data-tab') === 'textTab';
  const hasTextInput = DOM.productSearchInput.value.trim().length > 0;
  const hasBarcode = AppState.scannedBarcode !== null;

  DOM.btnAnalyze.disabled = !(textTabActive ? hasTextInput : hasBarcode);
>>>>>>> a39291dd39e8f0fccb4a83481de239c8cc703ccc
}

// ==========================================
// ANALYSIS FLOW (VIA NETLIFY BACKEND)
// ==========================================
async function startAnalysis() {
  if (AppState.isAnalyzing) return;

  // Rate limit / click spam protection
  if (!window.lastAnalysisTime) {
    window.lastAnalysisTime = 0;
  }
  const now = Date.now();
  if (now - window.lastAnalysisTime < 3000) {
    const msg = t("toastTooManyRequests");
    showToast(msg === "toastTooManyRequests" ? "Too many requests. Please wait a few seconds." : msg, "warning");
    return;
  }
  window.lastAnalysisTime = now;

  AppState.isAnalyzing = true;

  // Determine product name / barcode query
<<<<<<< HEAD
  if (AppState.scannedBarcode) {
    AppState.productName = generateBarcodeQuery(AppState.scannedBarcode);
  } else {
    AppState.productName = DOM.productSearchInput.value.trim();
  }

  if (!AppState.productName) {
    DOM.productSearchInput.classList.add('shake');
    setTimeout(() => DOM.productSearchInput.classList.remove('shake'), 400);
=======
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
>>>>>>> a39291dd39e8f0fccb4a83481de239c8cc703ccc
    AppState.isAnalyzing = false;
    return;
  }

  // Stop barcode scanner if running
  if (AppState.isScannerRunning) {
    await stopBarcodeScanner();
  }

  // Close scan panel overlay if open
  const scanPanel = document.getElementById('psScanPanel');
  if (scanPanel) {
    scanPanel.classList.remove('ps-panel-open');
  }

  // Reset active navigation highlights to home
  document.querySelectorAll('.ps-nav-item').forEach(item => {
    item.classList.toggle('ps-nav-active', item.getAttribute('data-panel') === 'home');
  });

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
      console.log(`[PureScan] Initiating API analysis request for productName: "${AppState.productName}", barcode: "${AppState.scannedBarcode || ''}"`);
      const response = await fetch('/.netlify/functions/analyze-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: AppState.productName,
          barcode: AppState.scannedBarcode,
          targetLanguage: targetLangName
        })
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
      console.log(`[PureScan] Received API analysis response:`, analysis);

      if (!analysis || !analysis.healthScore) {
        throw new Error(t('apiError'));
      }

      // Validate barcode matching integrity
      if (AppState.scannedBarcode && analysis.barcode) {
        const expected = String(AppState.scannedBarcode).trim();
        const received = String(analysis.barcode).trim();
        if (expected !== received) {
          console.error(`[PureScan] Barcode mismatch! Expected: ${expected}, Received: ${received}`);
          throw new Error("Product barcode mismatch. Please scan the barcode again.");
        }
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
    await saveToHistory(analysis);

    await sleep(400);

    // Navigate to results
    displayResults(analysis);
    navigateTo('resultScreen');

  } catch (error) {
    console.error('Analysis failed:', error);
    showError(error.message || t('apiError'), () => {
      window.lastAnalysisTime = 0; // Bypass rate limit for manual retry click
      startAnalysis();
    });
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
  // Use cached Firestore history if available
  if (PureFirebase.auth.currentUser && AppState.historyCache) {
    return AppState.historyCache;
  }
  try {
    return JSON.parse(localStorage.getItem(CONFIG.HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

async function saveToHistory(data) {
  if (PureFirebase.auth.currentUser) {
    try {
      await PureFirebase.saveScan(data);
      // Refresh cache
      AppState.historyCache = await PureFirebase.getHistory();
    } catch (e) {
      console.error('Failed to save scan to Firestore:', e);
    }
  } else {
    const history = getHistory();
    const entry = {
      id: Date.now(),
      productName: data.productName || AppState.productName,
      healthScore: data.healthScore,
      verdict: data.verdict,
      date: new Date().toLocaleDateString(),
      data: data
    };
    const filtered = history.filter(h =>
      h.productName.toLowerCase() !== entry.productName.toLowerCase()
    );
    filtered.unshift(entry);
    if (filtered.length > CONFIG.MAX_HISTORY) {
      filtered.length = CONFIG.MAX_HISTORY;
    }
    localStorage.setItem(CONFIG.HISTORY_KEY, JSON.stringify(filtered));
  }
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
      const rawId = item.getAttribute('data-history-id');
      const history = getHistory();
      const entry = history.find(h => String(h.id) === rawId);
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
let currentRetryCallback = null;

function showError(message, retryCallback = null) {
  DOM.errorMessage.textContent = message;
  currentRetryCallback = retryCallback;
  
  if (retryCallback) {
    if (DOM.btnCancelError) DOM.btnCancelError.style.display = 'block';
  } else {
    if (DOM.btnCancelError) DOM.btnCancelError.style.display = 'none';
  }
  
  DOM.errorModal.style.display = 'flex';
  if (window.lucide) lucide.createIcons();
}

function hideError(isCancel = false) {
  DOM.errorModal.style.display = 'none';
  if (isCancel) {
    currentRetryCallback = null;
    return;
  }
  if (currentRetryCallback) {
    const callback = currentRetryCallback;
    currentRetryCallback = null;
    callback();
  }
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
        
        // Update LocalStorage / Firestore
        if (PureFirebase.auth.currentUser) {
          PureFirebase.saveCustomUi(themeVal).catch(e => console.error("Failed to save UI theme setting:", e));
        } else {
          localStorage.setItem('ps_custom_ui', themeVal);
        }
        
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
  DOM.btnContinue.addEventListener('click', async () => {
    localStorage.setItem('ps_onboarding_completed', '1');
    localStorage.setItem('ps_seen_update_1.1.0', '1'); // Flag as seen for new users
    if (PureFirebase.currentUserProfile) {
      try {
        await PureFirebase.saveSetting('onboardingCompleted', true);
        await PureFirebase.saveSetting('seenUpdateV110', true);
      } catch (err) {
        console.warn("[PureScan] Failed to sync onboarding/update completed state to cloud:", err.message);
      }
    }
    navigateTo('registerScreen');
  });

  if (DOM.btnContinueAsGuest) {
    DOM.btnContinueAsGuest.addEventListener('click', () => {
      localStorage.setItem('ps_guest_mode', '1');
      localStorage.removeItem('ps_user_logged_in');
      navigateTo('inputScreen');
      renderHistory();
    });
  }

  // Auth Hub state switching
  let authCurrentState = 'login'; // 'login', 'register', 'forgot'

  const authTabLogin = document.getElementById('authTabLogin');
  const authTabRegister = document.getElementById('authTabRegister');
  const btnForgotPassword = document.getElementById('btnForgotPassword');
  const btnBackToLogin = document.getElementById('btnBackToLogin');
  const btnRegisterSubmit = document.getElementById('btnRegisterSubmit');

  function showLoginState() {
    authCurrentState = 'login';
    if (authTabLogin) authTabLogin.classList.add('active');
    if (authTabRegister) authTabRegister.classList.remove('active');
    document.getElementById('authTabsToggle').style.display = 'flex';
    document.getElementById('authScreenTitle').textContent = t('loginTitle');
    document.getElementById('authScreenSub').textContent = t('loginSub');
    document.getElementById('authLogoIcon').setAttribute('data-lucide', 'log-in');
    
    document.querySelectorAll('.register-only-field').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.login-only-field').forEach(el => el.style.display = 'flex');
    document.querySelector('.auth-password-field').style.display = 'flex';
    document.getElementById('backToLoginContainer').style.display = 'none';
    
<<<<<<< HEAD
    if (btnRegisterSubmit) {
      btnRegisterSubmit.disabled = false;
      btnRegisterSubmit.innerHTML = `
        <span id="btnAuthText">${t('logIn') || 'Log In'}</span>
        <i id="btnAuthIcon" data-lucide="log-in"></i>
      `;
    }
=======
    document.getElementById('btnAuthText').textContent = t('logIn');
    document.getElementById('btnAuthIcon').setAttribute('data-lucide', 'log-in');
>>>>>>> a39291dd39e8f0fccb4a83481de239c8cc703ccc
    
    document.getElementById('regName').removeAttribute('required');
    document.getElementById('regAge').removeAttribute('required');
    document.getElementById('regPassword').setAttribute('required', 'true');
    
    if (window.lucide) lucide.createIcons();
  }

  function showRegisterState() {
    authCurrentState = 'register';
    if (authTabLogin) authTabLogin.classList.remove('active');
    if (authTabRegister) authTabRegister.classList.add('active');
    document.getElementById('authTabsToggle').style.display = 'flex';
    document.getElementById('authScreenTitle').textContent = t('createProfile');
    document.getElementById('authScreenSub').textContent = t('createProfileSub');
    document.getElementById('authLogoIcon').setAttribute('data-lucide', 'user-plus');
    
    document.querySelectorAll('.register-only-field').forEach(el => el.style.display = 'flex');
    document.querySelectorAll('.login-only-field').forEach(el => el.style.display = 'none');
    document.querySelector('.auth-password-field').style.display = 'flex';
    document.getElementById('backToLoginContainer').style.display = 'none';
    
<<<<<<< HEAD
    if (btnRegisterSubmit) {
      btnRegisterSubmit.disabled = false;
      btnRegisterSubmit.innerHTML = `
        <span id="btnAuthText">${t('createProfileAndRegister') || 'Register'}</span>
        <i id="btnAuthIcon" data-lucide="check"></i>
      `;
    }
=======
    document.getElementById('btnAuthText').textContent = t('createProfileAndRegister');
    document.getElementById('btnAuthIcon').setAttribute('data-lucide', 'check');
>>>>>>> a39291dd39e8f0fccb4a83481de239c8cc703ccc
    
    document.getElementById('regName').setAttribute('required', 'true');
    document.getElementById('regAge').setAttribute('required', 'true');
    document.getElementById('regPassword').setAttribute('required', 'true');
    
    if (window.lucide) lucide.createIcons();
  }

  function showForgotPasswordState() {
    authCurrentState = 'forgot';
    document.getElementById('authTabsToggle').style.display = 'none';
    document.getElementById('authScreenTitle').textContent = t('resetPassword');
    document.getElementById('authScreenSub').textContent = t('resetPasswordSub');
    document.getElementById('authLogoIcon').setAttribute('data-lucide', 'key-round');
    
    document.querySelectorAll('.register-only-field').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.login-only-field').forEach(el => el.style.display = 'none');
    document.querySelector('.auth-password-field').style.display = 'none';
    document.getElementById('backToLoginContainer').style.display = 'block';
    
<<<<<<< HEAD
    if (btnRegisterSubmit) {
      btnRegisterSubmit.disabled = false;
      btnRegisterSubmit.innerHTML = `
        <span id="btnAuthText">${t('sendResetLink') || 'Send Reset Link'}</span>
        <i id="btnAuthIcon" data-lucide="mail"></i>
      `;
    }
=======
    document.getElementById('btnAuthText').textContent = t('sendResetLink');
    document.getElementById('btnAuthIcon').setAttribute('data-lucide', 'mail');
>>>>>>> a39291dd39e8f0fccb4a83481de239c8cc703ccc
    
    document.getElementById('regPassword').removeAttribute('required');
    document.getElementById('regName').removeAttribute('required');
    document.getElementById('regAge').removeAttribute('required');
    
    if (window.lucide) lucide.createIcons();
  }

  if (authTabLogin) authTabLogin.addEventListener('click', showLoginState);
  if (authTabRegister) authTabRegister.addEventListener('click', showRegisterState);
  if (btnForgotPassword) btnForgotPassword.addEventListener('click', showForgotPasswordState);
  if (btnBackToLogin) btnBackToLogin.addEventListener('click', showLoginState);

  // Trigger login state by default on init
  setTimeout(showLoginState, 0);

  // Onboarding Registration Form Submit
  const formRegister = document.getElementById('formRegister');
  if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('regEmail').value.trim();
      
      if (authCurrentState === 'forgot') {
        const originalHTML = btnRegisterSubmit.innerHTML;
        btnRegisterSubmit.disabled = true;
        btnRegisterSubmit.innerHTML = '<i data-lucide="loader" class="ps-spin"></i> Sending...';
        if (window.lucide) lucide.createIcons();
        try {
          await PureFirebase.resetPassword(email);
          showToast(t("toastPasswordResetSent") || "Password reset email sent! Please check your inbox.", "success");
          showLoginState();
        } catch (err) {
          showError("Error: " + err.message);
        } finally {
          btnRegisterSubmit.disabled = false;
          btnRegisterSubmit.innerHTML = originalHTML;
          if (window.lucide) lucide.createIcons();
        }
        return;
      }
      
      const password = document.getElementById('regPassword').value;

      if (authCurrentState === 'register') {
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        if (password !== confirmPassword) {
          showError("Passwords do not match!");
          return;
        }
        
        const profile = {
          name: document.getElementById('regName').value.trim(),
          gender: document.querySelector('.gender-btn.active')?.getAttribute('data-gender') || 'Male',
          age: parseInt(document.getElementById('regAge').value) || 25,
          goal: document.getElementById('regGoal').value,
          activity: document.getElementById('regActivity').value
        };

        const originalHTML = btnRegisterSubmit.innerHTML;
        btnRegisterSubmit.disabled = true;
        btnRegisterSubmit.innerHTML = '<i data-lucide="loader" class="ps-spin"></i> Registering...';
        if (window.lucide) lucide.createIcons();

        try {
          await PureFirebase.register(email, password, profile);
          // auth status listener will navigate
        } catch (err) {
          showError("Registration failed: " + err.message);
          btnRegisterSubmit.disabled = false;
          btnRegisterSubmit.innerHTML = originalHTML;
          if (window.lucide) lucide.createIcons();
        }
      } else if (authCurrentState === 'login') {
        const originalHTML = btnRegisterSubmit.innerHTML;
        btnRegisterSubmit.disabled = true;
        btnRegisterSubmit.innerHTML = '<i data-lucide="loader" class="ps-spin"></i> Logging in...';
        if (window.lucide) lucide.createIcons();

        try {
          await PureFirebase.login(email, password);
          // auth status listener will navigate
        } catch (err) {
          showError("Login failed: " + err.message);
          btnRegisterSubmit.disabled = false;
          btnRegisterSubmit.innerHTML = originalHTML;
          if (window.lucide) lucide.createIcons();
        }
      }
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
    formEditProfile.addEventListener('submit', async (e) => {
      e.preventDefault();
      const profile = {
        name: document.getElementById('editName').value.trim(),
        email: document.getElementById('editEmail').value.trim(),
        gender: document.querySelector('.gender-edit-btn.active')?.getAttribute('data-gender') || 'Male',
        age: parseInt(document.getElementById('editAge').value),
        goal: document.getElementById('editGoal').value,
        activity: document.getElementById('editActivity').value
      };
      
      const submitBtn = formEditProfile.querySelector('button[type="submit"]');
      const originalHTML = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Saving...';
      }

      try {
        if (PureFirebase.auth.currentUser) {
          await PureFirebase.updateProfile(profile);
        } else {
          localStorage.setItem('purescan_user_profile', JSON.stringify(profile));
        }
        updateProfileDisplay();
        const editModal = document.getElementById('profileEditModal');
        if (editModal) editModal.style.display = 'none';
      } catch (err) {
        showError("Failed to update profile: " + err.message);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHTML;
        }
      }
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

  // Logout / Register Trigger
  const profLogout = document.getElementById('profLogout');
  if (profLogout) {
    profLogout.addEventListener('click', () => {
      if (PureFirebase.auth && PureFirebase.auth.currentUser) {
        showConfirm("confirmLogout", async () => {
          try {
            await PureFirebase.logout();
            localStorage.removeItem('ps_guest_mode'); // Clear guest mode cache on explicit logout
            const panel = document.getElementById('psProfilePanel');
            if (panel) panel.classList.remove('ps-panel-open');
          } catch (e) {
            showError("Logout failed: " + e.message);
          }
        });
      } else {
        // Guest user clicks "Login / Register"
        const panel = document.getElementById('psProfilePanel');
        if (panel) panel.classList.remove('ps-panel-open');
        localStorage.removeItem('ps_guest_mode'); // Clear guest mode cache so they go to registerScreen
        navigateTo('registerScreen');
      }
    });
  }

  // Avatar Upload Trigger
  const btnTriggerAvatarUpload = document.getElementById('btnTriggerAvatarUpload');
  const avatarFileInput = document.getElementById('avatarFileInput');
  if (btnTriggerAvatarUpload && avatarFileInput) {
    btnTriggerAvatarUpload.addEventListener('click', () => {
      avatarFileInput.click();
    });

    avatarFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showError("Please select a valid image file.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        showError("Image size should be less than 2MB.");
        return;
      }

      const originalHTML = btnTriggerAvatarUpload.innerHTML;
      btnTriggerAvatarUpload.innerHTML = '<i data-lucide="loader" class="ps-spin" style="color: var(--accent-primary); width:24px; height:24px;"></i>';
      if (window.lucide) lucide.createIcons();

      try {
        const downloadURL = await PureFirebase.uploadAvatar(file);
        const profileAvatar = document.querySelector('.profile-avatar');
        if (profileAvatar) {
          profileAvatar.innerHTML = `<img src="${downloadURL}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        }
      } catch (err) {
        showError("Failed to upload image: " + err.message);
        btnTriggerAvatarUpload.innerHTML = originalHTML;
        if (window.lucide) lucide.createIcons();
      }
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
  DOM.btnCloseError.addEventListener('click', () => hideError(false));
  if (DOM.btnCancelError) {
    DOM.btnCancelError.addEventListener('click', () => hideError(true));
  }
  DOM.errorModal.addEventListener('click', (e) => {
    if (e.target === DOM.errorModal) hideError(true);
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
      showConfirm("confirmClearHistory", async () => {
        if (PureFirebase.auth.currentUser) {
          try {
            await PureFirebase.clearHistory();
            AppState.historyCache = [];
            showToast(t("toastHistoryCleared"), "success");
          } catch (e) {
            console.error('Failed to clear history from Firestore:', e);
            showToast(t("toastError") || 'Failed to clear history. Please try again.', "error");
          }
        } else {
          localStorage.removeItem(CONFIG.HISTORY_KEY);
          showToast(t("toastHistoryCleared"), "success");
        }
        renderHistory();
      });
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

  // Stop scanner when switching panels via navigation bar
  document.querySelectorAll('.ps-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const panelName = item.getAttribute('data-panel');
      if (panelName !== 'scan' && AppState.isScannerRunning) {
        stopBarcodeScanner();
      }
    });
  });

  // Stop scanner when scan panel close button is clicked
  const psScanClose = document.getElementById('psScanClose');
  if (psScanClose) {
    psScanClose.addEventListener('click', () => {
      if (AppState.isScannerRunning) {
        stopBarcodeScanner();
      }
    });
  }

  // Offline / Online monitoring
  window.addEventListener('online', () => {
    showToast(t("toastOnline"), "success");
  });
  window.addEventListener('offline', () => {
    showToast(t("toastOffline"), "warning");
  });
}

// ==========================================
// PROFILE DISPLAY & EDITING
// ==========================================
function updateProfileDisplay() {
  let profile = null;
  const isAuth = !!(PureFirebase.auth && PureFirebase.auth.currentUser);
  if (isAuth && PureFirebase.currentUserProfile) {
    profile = PureFirebase.currentUserProfile;
  } else {
    const profileData = localStorage.getItem('purescan_user_profile');
    if (profileData) {
      try { profile = JSON.parse(profileData); } catch(e) {}
    }
  }
  
  try {
    // Update Profile Panel Card
    const profileNameEl = document.querySelector('#psProfilePanel .profile-name');
    const profileEmailEl = document.querySelector('#psProfilePanel .profile-email');
    if (profileNameEl) profileNameEl.textContent = profile ? (profile.name || profile.displayName || 'Guest User') : 'Guest User';
    if (profileEmailEl) profileEmailEl.textContent = profile ? (profile.email || '—') : '—';
    
    // Update avatar image in UI if photoURL exists
    const profileAvatar = document.querySelector('.profile-avatar');
    if (profileAvatar) {
      if (profile && profile.photoURL) {
        profileAvatar.innerHTML = `<img src="${profile.photoURL}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
      } else {
        profileAvatar.innerHTML = `<i data-lucide="user" id="profileAvatarIcon"></i>`;
        if (window.lucide) lucide.createIcons();
      }
    }

    // Update menu values
    const profPersonalVal = document.getElementById('profPersonalVal');
    if (profPersonalVal) {
      profPersonalVal.textContent = profile ? `${profile.age || '—'} yrs, ${profile.gender || 'Male'}` : '—';
    }
    
    const profGoalsVal = document.getElementById('profGoalsVal');
    if (profGoalsVal) {
      profGoalsVal.textContent = profile ? (profile.goal || 'Maintain Health') : 'Maintain Health';
    }
    
    const profActivityVal = document.getElementById('profActivityVal');
    if (profActivityVal) {
      profActivityVal.textContent = profile ? (profile.activity || 'Active') : 'Active';
    }

    // Dynamic adjustment of the Logout menu item for Guests vs Logged-in users
    const profLogout = document.getElementById('profLogout');
    if (profLogout) {
      const leftPart = profLogout.querySelector('.profile-menu-left');
      if (isAuth) {
        // Authenticated User: Show Logout in red
        profLogout.style.color = 'var(--red)';
        if (leftPart) {
          leftPart.innerHTML = `
            <i data-lucide="log-out" style="color: var(--red);"></i>
            <span style="color: var(--red);">Logout</span>
          `;
        }
      } else {
        // Guest User: Show Login / Register in accent color
        profLogout.style.color = 'var(--accent-primary)';
        if (leftPart) {
          leftPart.innerHTML = `
            <i data-lucide="log-in" style="color: var(--accent-primary);"></i>
            <span style="color: var(--accent-primary);">Login / Register</span>
          `;
        }
      }
      if (window.lucide) lucide.createIcons();
    }

  } catch(e) {
    console.error('Error updating profile display:', e);
  }
}

window.showProfileEditModal = function(focusFieldId = null) {
  let profile = null;
  if (PureFirebase.auth.currentUser && PureFirebase.currentUserProfile) {
    profile = PureFirebase.currentUserProfile;
  } else {
    const profileData = localStorage.getItem('purescan_user_profile');
    if (profileData) {
      try { profile = JSON.parse(profileData); } catch(e) {}
    }
  }
  if (!profile) return;
  
  try {
    document.getElementById('editName').value = profile.name || profile.displayName || '';
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

// Sync preferences (Theme, Lang, UI theme) from profile document
function syncPreferencesFromProfile() {
  if (!PureFirebase.currentUserProfile) return;
  const profile = PureFirebase.currentUserProfile;
  const settings = profile.settings || {};

  // Theme
  if (settings.theme) {
    AppState.currentTheme = settings.theme;
    document.documentElement.setAttribute('data-theme', AppState.currentTheme);
  }

  // Language
  if (settings.lang) {
    AppState.currentLang = settings.lang;
    applyLanguage();
  }

  // UI Theme
  if (settings.uiTheme) {
    document.documentElement.setAttribute('data-ui-theme', settings.uiTheme);
    if (DOM.uiThemeBtns) {
      DOM.uiThemeBtns.forEach(b => b.classList.remove('active'));
      const activeBtn = document.querySelector(`.ui-theme-btn[data-theme-val="${settings.uiTheme}"]`);
      if (activeBtn) activeBtn.classList.add('active');
    }
    const activeLabel = document.getElementById('activeUiLabel');
    if (activeLabel) {
      if (settings.uiTheme === 'neumorphic') activeLabel.textContent = 'Neumorphic 3D';
      else if (settings.uiTheme === 'vibrant') activeLabel.textContent = 'Vibrant Glass';
      else activeLabel.textContent = 'Default Glass';
    }
  }
}

// ----------------------------------------------------
// LOCAL STORAGE MIGRATION TO FIRESTORE
// ----------------------------------------------------
async function migrateLocalStorageToFirebase(uid) {
  const migrationKey = `ps_migrated_${uid}`;
  if (localStorage.getItem(migrationKey) === '1') {
    return;
  }

  console.log("[PureScan Debug] Migration started.");
  console.log("[PureScan] Checking for localStorage data to migrate for uid:", uid);
  
  // 1. Migrate user profile
  const localProfileData = localStorage.getItem('purescan_user_profile');
  if (localProfileData) {
    try {
      const localProfile = JSON.parse(localProfileData);
      const currentProfile = await PureFirebase.loadUserProfile(uid);
      if (currentProfile) {
        const updatedProfile = {
          name: currentProfile.name || localProfile.name || '',
          email: currentProfile.email || localProfile.email || '',
          gender: currentProfile.gender || localProfile.gender || 'Male',
          age: currentProfile.age || localProfile.age || 25,
          goal: currentProfile.goal || localProfile.goal || 'Maintain Health',
          activity: currentProfile.activity || localProfile.activity || 'Active'
        };
        await PureFirebase.updateProfile(updatedProfile);
      }
      console.log("[PureScan] Profile data migrated.");
    } catch (e) {
      console.error("Failed to migrate profile:", e);
    }
  }

  // 2. Migrate scan history
  const localHistoryData = localStorage.getItem(CONFIG.HISTORY_KEY);
  if (localHistoryData) {
    try {
      const localHistory = JSON.parse(localHistoryData);
      if (Array.isArray(localHistory) && localHistory.length > 0) {
        console.log(`[PureScan] Migrating ${localHistory.length} history items to Firestore...`);
        for (const item of localHistory) {
          const analysis = item.data || item.analysis;
          if (analysis) {
            await PureFirebase.saveScan(analysis);
          }
        }
      }
      console.log("[PureScan] History data migrated.");
    } catch (e) {
      console.error("Failed to migrate history:", e);
    }
  }

  // 3. Migrate Chat History
  const localChatData = localStorage.getItem('purescan_chat_history');
  if (localChatData) {
    try {
      const localChats = JSON.parse(localChatData);
      if (Array.isArray(localChats) && localChats.length > 0) {
        await PureFirebase.saveChatHistory(localChats);
      }
      console.log("[PureScan] Chat history migrated.");
    } catch (e) {
      console.error("Failed to migrate chat history:", e);
    }
  }

  // 4. Migrate BMI Data
  const localBmiData = localStorage.getItem('purescan_bmi');
  if (localBmiData) {
    try {
      const bmi = JSON.parse(localBmiData);
      if (bmi.weight && bmi.height) {
        await PureFirebase.saveBmiData(bmi.weight, bmi.height);
      }
      console.log("[PureScan] BMI data migrated.");
    } catch (e) {
      console.error("Failed to migrate BMI data:", e);
    }
  }

  // 5. Migrate Daily Tip Index
  const localTipIndex = localStorage.getItem('purescan_tip_index');
  if (localTipIndex !== null) {
    try {
      const idx = parseInt(localTipIndex);
      if (!isNaN(idx)) {
        await PureFirebase.saveDailyTip(idx);
      }
      console.log("[PureScan] Daily tip index migrated.");
    } catch (e) {
      console.error("Failed to migrate daily tip index:", e);
    }
  }

  // Mark as migrated and remove old local key dependencies
  localStorage.setItem(migrationKey, '1');
  localStorage.removeItem('purescan_user_profile');
  localStorage.removeItem(CONFIG.HISTORY_KEY);
  localStorage.removeItem('purescan_chat_history');
  localStorage.removeItem('purescan_bmi');
  localStorage.removeItem('purescan_tip_index');
  
  console.log("[PureScan Debug] Migration completed.");
  console.log("[PureScan] LocalStorage migration complete. Removed old keys.");
}

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

  // Check if first-time user for onboarding flow
  const hasOnboardedLocal = localStorage.getItem('ps_onboarding_completed') === '1';
  const wasLoggedIn = localStorage.getItem('ps_user_logged_in') === '1';
  const isGuestMode = localStorage.getItem('ps_guest_mode') === '1';

  // Synchronously activate loading mode on the splash screen for returning visitors
  // to avoid showing onboarding buttons during Firebase Auth initialization.
  if (hasOnboardedLocal) {
    if (wasLoggedIn) {
      const splashScreen = document.getElementById('splashScreen');
      if (splashScreen) {
        splashScreen.classList.add('loading-mode');
      }
    } else if (isGuestMode) {
      // If returning guest who chose guest bypass, go straight to main screen
      navigateTo('inputScreen');
    } else {
      // If returning guest who hasn't chosen guest bypass, go straight to login
      navigateTo('registerScreen');
    }
  }

  // Safety check: Fallback if Firebase fails to load
  if (typeof PureFirebase === 'undefined' || !PureFirebase.auth) {
    console.warn("[PureScan] Firebase not available. Falling back to local guest mode.");
    const splashScreen = document.getElementById('splashScreen');
    if (splashScreen) {
      splashScreen.classList.remove('loading-mode');
    }
    if (!hasOnboardedLocal) {
      setTimeout(() => {
        document.getElementById('splashScreen').classList.add('active');
      }, 100);
    } else {
<<<<<<< HEAD
      if (wasLoggedIn || isGuestMode) {
=======
      if (isGuestMode) {
>>>>>>> a39291dd39e8f0fccb4a83481de239c8cc703ccc
        navigateTo('inputScreen');
      } else {
        navigateTo('registerScreen');
      }
    }
    console.log("[PureScan Debug] App startup completed.");
    return;
  }

  console.log("[PureScan Debug] Firebase initialized.");

  let isStartupResolved = false;
  let authTimeoutId = null;

  // 2-second timeout protection callback
  function triggerAuthTimeoutFallback() {
    if (isStartupResolved) return;
    isStartupResolved = true;
    console.warn("[PureScan Debug] Auth state check timed out after 2 seconds. Proceeding to fallback.");
    
    // Remove loading spinner
    const splashScreen = document.getElementById('splashScreen');
    if (splashScreen) {
      splashScreen.classList.remove('loading-mode');
    }
    
    // Determine screen routing
    if (!hasOnboardedLocal) {
      setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if (splash) splash.classList.add('active');
      }, 100);
    } else {
<<<<<<< HEAD
      if (wasLoggedIn || isGuestMode) {
=======
      if (isGuestMode) {
>>>>>>> a39291dd39e8f0fccb4a83481de239c8cc703ccc
        navigateTo('inputScreen');
      } else {
        navigateTo('registerScreen');
      }
    }
    console.log("[PureScan Debug] App startup completed.");
  }

  // Start 2s timeout timer
  authTimeoutId = setTimeout(triggerAuthTimeoutFallback, 2000);

  console.log("[PureScan Debug] Auth listener registered.");

  // Firebase Authentication State Listener
  PureFirebase.auth.onAuthStateChanged(async (user) => {
    console.log("[PureScan Debug] Auth state received:", user ? "User found (" + user.uid + ")" : "User not found");
    
    const isFirstRun = !isStartupResolved;
    isStartupResolved = true;
    if (authTimeoutId) {
      clearTimeout(authTimeoutId);
      authTimeoutId = null;
    }

    if (user) {
      // Prevent duplicate processing if listener fires again for the same user
      if (AppState.currentUserId === user.uid) {
        console.log("[PureScan Debug] User already processed. Skipping.");
        return;
      }
      AppState.currentUserId = user.uid;

      console.log("[PureScan Debug] Processing logged-in user...");
      localStorage.setItem('ps_user_logged_in', '1'); // Set login state cache
      localStorage.removeItem('ps_guest_mode'); // Clear guest mode cache
      
      // Navigate to main screen
      navigateTo('inputScreen');
      renderHistory();
      console.log("[PureScan Debug] App startup/login completed.");

      // Now run Firestore loads and migrations asynchronously in the background
      (async () => {
        try {
          console.log("[PureScan Debug] Concurrent profile and history loading started in background.");
          
          const profilePromise = PureFirebase.loadUserProfile(user.uid);
          const historyPromise = PureFirebase.getHistory();
          const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 3000));
          const historyTimeoutPromise = new Promise((resolve) => setTimeout(() => resolve([]), 3000));

          const [profile, history] = await Promise.all([
            Promise.race([profilePromise, timeoutPromise]),
            Promise.race([historyPromise, historyTimeoutPromise])
          ]);

          if (profile) {
            console.log("[PureScan Debug] Profile loaded.");
            syncPreferencesFromProfile();
            updateProfileDisplay();
          } else {
            console.warn("[PureScan Debug] Profile load failed or timed out.");
            updateProfileDisplay();
          }

          AppState.historyCache = history || [];
          renderHistory();
          console.log("[PureScan Debug] History loaded.");

          // Background Local Storage Migration (fire-and-forget, never blocks UI)
          migrateLocalStorageToFirebase(user.uid).then(() => {
            updateProfileDisplay();
          }).catch(err => {
            console.error("Migration error in background:", err);
          });

          if (window.PureHealthModules) {
            window.PureHealthModules.initChatFromHistory();
            window.PureHealthModules.initBMI();
            window.PureHealthModules.initDailyTip();
          }

          // Sync onboarding completed state to local cache if needed
          if (profile && profile.settings) {
            if (profile.settings.onboardingCompleted === true && !hasOnboardedLocal) {
              localStorage.setItem('ps_onboarding_completed', '1');
            } else if (profile.settings.onboardingCompleted !== true && hasOnboardedLocal) {
              await PureFirebase.saveSetting('onboardingCompleted', true);
            }
          }

          // Trigger v1.1.0 update modal check
          checkAndShowUpdateModal();
        } catch (e) {
          console.error("Background loading error:", e);
        }
      })();

    } else {
      console.log("[PureScan Debug] Processing logged-out state.");
      AppState.currentUserId = null;
      localStorage.removeItem('ps_user_logged_in'); // Clear login state cache
      
      // Ensure loading-mode is removed from splash screen to prevent locking
      const splashScreen = document.getElementById('splashScreen');
      if (splashScreen) {
        splashScreen.classList.remove('loading-mode');
      }

      // Clear local states
      AppState.historyCache = [];
      updateProfileDisplay();
      
      if (window.PureHealthModules) {
        window.PureHealthModules.initChatFromHistory();
        window.PureHealthModules.initBMI();
        window.PureHealthModules.initDailyTip();
      }
      
      if (isFirstRun) {
        if (!hasOnboardedLocal) {
          // Show Splash onboarding flow for first-time visitor
          setTimeout(() => {
            document.getElementById('splashScreen').classList.add('active');
            if (typeof showLanguageModal === 'function') {
              showLanguageModal();
            }
          }, 100);
        } else {
          if (localStorage.getItem('ps_guest_mode') === '1') {
            navigateTo('inputScreen');
          } else {
            // Show login screen
            navigateTo('registerScreen');
          }
          // Trigger v1.1.0 update modal check for returning guests
          checkAndShowUpdateModal();
        }
        console.log("[PureScan Debug] App startup completed.");
      } else {
        // Explicit logout or state change to logged out
        if (localStorage.getItem('ps_guest_mode') === '1') {
          navigateTo('inputScreen');
        } else {
          navigateTo('registerScreen');
        }
      }
    }
  });

  // Check and show the What's New update modal
  function checkAndShowUpdateModal() {
    const hasSeenUpdateLocal = localStorage.getItem('ps_seen_update_1.1.0') === '1';
    let hasSeenUpdateCloud = false;

    if (PureFirebase.currentUserProfile && PureFirebase.currentUserProfile.settings) {
      hasSeenUpdateCloud = PureFirebase.currentUserProfile.settings.seenUpdateV110 === true;
    }

    // If already seen either locally or in cloud, do not show
    if (hasSeenUpdateLocal || hasSeenUpdateCloud) {
      // Sync state if authenticated and mismatch exists
      if (PureFirebase.currentUserProfile && !hasSeenUpdateCloud && hasSeenUpdateLocal) {
        PureFirebase.saveSetting('seenUpdateV110', true).catch(err => {
          console.warn("[PureScan] Failed to sync seen update to cloud:", err.message);
        });
      } else if (PureFirebase.currentUserProfile && hasSeenUpdateCloud && !hasSeenUpdateLocal) {
        localStorage.setItem('ps_seen_update_1.1.0', '1');
      }
      return;
    }

    // Display the update modal
    const updateModal = document.getElementById('updateModal');
    const btnCloseUpdate = document.getElementById('btnCloseUpdate');
    const btnReleaseNotes = document.getElementById('btnReleaseNotes');

    if (updateModal && btnCloseUpdate) {
      setTimeout(() => {
        updateModal.style.display = 'flex';
        if (window.lucide) lucide.createIcons();
      }, 1000); // 1s delay for premium UX feel

      const markAsSeen = async () => {
        updateModal.style.display = 'none';
        localStorage.setItem('ps_seen_update_1.1.0', '1');
        if (PureFirebase.currentUserProfile) {
          try {
            await PureFirebase.saveSetting('seenUpdateV110', true);
            console.log("[PureScan] Saved seen update preference to Firestore");
          } catch (err) {
            console.warn("[PureScan] Failed to save update preference to Firestore:", err.message);
          }
        }
      };

      btnCloseUpdate.addEventListener('click', markAsSeen);

      if (btnReleaseNotes) {
        btnReleaseNotes.addEventListener('click', async () => {
          await markAsSeen();
          const aboutModal = document.getElementById('aboutModal');
          if (aboutModal) {
            aboutModal.style.display = 'flex';
            if (window.lucide) lucide.createIcons();
          }
        });
      }

      updateModal.addEventListener('click', (e) => {
        if (e.target === updateModal) {
          markAsSeen();
        }
      });
    }
  }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
