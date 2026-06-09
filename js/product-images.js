/* =============================================
   PureScan — Product Images Module
   Fetches and displays product images dynamically
   Uses existing Serper API via Netlify function
   + wsrv.nl proxy for hotlink-safe rendering
   ============================================= */

(function () {
  'use strict';

  // ==========================================
  // IMAGE PROXY & WRAPPER
  // ==========================================

  /**
   * Wrap a raw image URL through wsrv.nl proxy CDN
   * to bypass hotlinking / CORS restrictions.
   * @param {string} url  — raw image URL
   * @param {object} opts — optional sizing: { w, h, fit }
   * @returns {string} proxied URL
   */
  function proxyUrl(url, opts = {}) {
    if (!url) return '';
    // Don't double-proxy
    if (url.includes('wsrv.nl')) return url;
    // Skip data URIs
    if (url.startsWith('data:')) return url;

    const w = opts.w || 400;
    const h = opts.h || 400;
    const fit = opts.fit || 'cover';
    // wsrv.nl accepts raw URL — no encodeURIComponent needed
    return `https://wsrv.nl/?url=${url}&w=${w}&h=${h}&fit=${fit}&n=-1`;
  }

  /**
   * Build a multi-source fallback chain for an image.
   * Order: proxy → original → thumbnail proxy → thumbnail → null
   */
  function buildFallbackChain(imageUrl, thumbnailUrl, opts = {}) {
    const chain = [];
    if (imageUrl) {
      chain.push(proxyUrl(imageUrl, opts));   // 1. proxied full image
      chain.push(imageUrl);                    // 2. original full image
    }
    if (thumbnailUrl) {
      chain.push(proxyUrl(thumbnailUrl, opts)); // 3. proxied thumbnail
      chain.push(thumbnailUrl);                  // 4. original thumbnail
    }
    console.log('[ProductImages] Fallback chain:', chain);
    return chain;
  }

  /**
   * Load an image through a fallback chain.
   * Tries each source in order; calls onSuccess(img) or onFail().
   */
  function loadImageWithFallback(chain, altText, onSuccess, onFail) {
    let index = 0;
    let settled = false;

    // Safety timeout — if nothing loads in 15s, show placeholder
    const safetyTimer = setTimeout(() => {
      if (!settled) {
        settled = true;
        console.warn('[ProductImages] Safety timeout — no image loaded in 15s');
        if (onFail) onFail();
      }
    }, 15000);

    function tryNext() {
      if (settled) return;
      if (index >= chain.length) {
        settled = true;
        clearTimeout(safetyTimer);
        console.warn('[ProductImages] All sources exhausted');
        if (onFail) onFail();
        return;
      }

      const currentSrc = chain[index];
      console.log(`[ProductImages] Trying source ${index + 1}/${chain.length}:`, currentSrc);

      const img = new Image();
      img.alt = altText || 'Product';
      img.referrerPolicy = 'no-referrer';

      img.onload = () => {
        if (settled) return;
        console.log(`[ProductImages] ✅ Loaded (${img.naturalWidth}x${img.naturalHeight}):`, currentSrc);
        // Verify it's not a tiny tracking pixel
        if (img.naturalWidth < 10 || img.naturalHeight < 10) {
          console.warn('[ProductImages] Skipping tracking pixel');
          index++;
          tryNext();
          return;
        }
        settled = true;
        clearTimeout(safetyTimer);
        if (onSuccess) onSuccess(img);
      };

      img.onerror = () => {
        if (settled) return;
        console.warn(`[ProductImages] ❌ Failed source ${index + 1}:`, currentSrc);
        index++;
        tryNext();
      };

      img.src = currentSrc;
    }

    tryNext();
  }

  // ==========================================
  // IMAGE CACHE (in-memory + localStorage)
  // ==========================================
  const IMAGE_CACHE_KEY = 'purescan_img_cache';
  const imageMemCache = new Map();

  function getCachedImage(query) {
    const key = query.toLowerCase().trim();
    if (imageMemCache.has(key)) return imageMemCache.get(key);
    try {
      const stored = JSON.parse(localStorage.getItem(IMAGE_CACHE_KEY) || '{}');
      if (stored[key]) {
        imageMemCache.set(key, stored[key]);
        return stored[key];
      }
    } catch (e) {}
    return null;
  }

  function setCachedImage(query, url) {
    const key = query.toLowerCase().trim();
    imageMemCache.set(key, url);
    try {
      const stored = JSON.parse(localStorage.getItem(IMAGE_CACHE_KEY) || '{}');
      stored[key] = url;
      // Keep cache small (max 30 entries)
      const keys = Object.keys(stored);
      if (keys.length > 30) delete stored[keys[0]];
      localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(stored));
    } catch (e) {}
  }

  // ==========================================
  // FETCH IMAGE URL (via Netlify function)
  // ==========================================
  async function fetchProductImage(query, type = 'main') {
    const cacheKey = `${query}_${type}`;
    // Check cache first
    const cached = getCachedImage(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(
        `/.netlify/functions/fetch-image?query=${encodeURIComponent(query)}&type=${encodeURIComponent(type)}`,
        { signal: AbortSignal.timeout(8000) }
      );

      if (!res.ok) return null;

      const data = await res.json();
      
      if (data.imageUrl || data.thumbnailUrl) {
        const resultArgs = {
          imageUrl: data.imageUrl,
          thumbnailUrl: data.thumbnailUrl
        };
        setCachedImage(cacheKey, resultArgs);
        return resultArgs;
      }
    } catch (e) {
      console.warn('[ProductImages] Fetch failed:', e.message);
    }

    return null;
  }

  // ==========================================
  // PLACEHOLDER / ERROR HTML GENERATORS
  // ==========================================
  function createPlaceholderHTML(message, isMini = false) {
    const sizeClass = isMini ? 'ps-img-placeholder-block--mini' : '';
    return `
      <div class="ps-img-placeholder-block ${sizeClass}">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
             stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.4">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
        <span>${escapeText(message)}</span>
      </div>`;
  }

  // ==========================================
  // INJECT PRODUCT IMAGE INTO RESULT SCREEN
  // ==========================================
  function injectProductImage() {
    const productName = document.getElementById('resultProductName')?.textContent;
    if (!productName || productName === 'Product Name') return;

    // Remove existing image if any (user scanned a new product)
    const existing = document.getElementById('psProductImage');
    if (existing) existing.remove();

    // Create image container
    const imgWrap = document.createElement('div');
    imgWrap.className = 'ps-product-img-wrap';
    imgWrap.id = 'psProductImage';
    imgWrap.innerHTML = `<div class="ps-img-skeleton"><div class="ps-skeleton-shimmer"></div></div>`;

    // Insert before the result badge (top of hero card)
    const resultHero = document.querySelector('.result-hero');
    const resultBadge = document.getElementById('resultBadge');
    if (resultHero && resultBadge) {
      resultHero.insertBefore(imgWrap, resultBadge);
    }

    // Fetch and display image
    const searchQuery = productName;
    fetchProductImage(searchQuery, 'main').then(imgData => {
      if (imgData && (imgData.imageUrl || imgData.thumbnailUrl)) {
        const chain = buildFallbackChain(imgData.imageUrl, imgData.thumbnailUrl, { w: 400, h: 400 });

        loadImageWithFallback(
          chain,
          productName,
          // onSuccess
          (img) => {
            img.className = 'ps-product-img';
            imgWrap.innerHTML = '';
            imgWrap.appendChild(img);
          },
          // onFail — show placeholder, never hide
          () => {
            imgWrap.innerHTML = createPlaceholderHTML('Image blocked by source');
          }
        );
      } else {
        imgWrap.innerHTML = createPlaceholderHTML('No image available');
      }
    });
  }


  // ==========================================
  // ESCAPE HTML TEXT
  // ==========================================
  function escapeText(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ==========================================
  // OBSERVERS — Hook into existing screens
  // ==========================================
  function setupObservers() {
    // When result screen becomes active → inject product image
    const resultScreen = document.getElementById('resultScreen');
    if (resultScreen) {
      new MutationObserver(() => {
        if (resultScreen.classList.contains('active')) {
          setTimeout(injectProductImage, 150);
        }
      }).observe(resultScreen, { attributes: true, attributeFilter: ['class'] });
    }

  }

  // ==========================================
  // INIT
  // ==========================================
  function init() {
    if (document.getElementById('psProductImage__init')) return;

    // Mark as initialized
    const marker = document.createElement('div');
    marker.id = 'psProductImage__init';
    marker.style.display = 'none';
    document.body.appendChild(marker);

    setupObservers();
    
    // Expose prefetch function for parallel loading
    window.psPrefetchImage = function(query, type) {
      if (query) fetchProductImage(query, type);
    };

    // Expose proxyUrl globally for any other modules that need it
    window.psProxyUrl = proxyUrl;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 250));
  } else {
    setTimeout(init, 250);
  }

})();
