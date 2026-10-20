/**
 * YourChoice Universal Environment Configuration
 * Provides environment-agnostic API endpoint resolution across GitHub Pages, Render, and Local Development.
 */
(function () {
  'use strict';

  // Configurable default production backend URL hosted on Render
  // If hosted on GitHub Pages and no override is set, requests will automatically route here
  const DEFAULT_RENDER_BACKEND = 'https://yourchoice-backend.onrender.com';

  /**
   * Resolves the active API base URL.
   * Priority:
   * 1. Explicit localStorage override (YOURCHOICE_API_URL or API_BASE_URL)
   * 2. Window runtime configuration injection (__RUNTIME_CONFIG__.API_BASE_URL)
   * 3. GitHub Pages detection (*.github.io -> DEFAULT_RENDER_BACKEND)
   * 4. Same-origin fallback ('' for monolith / localhost / AI Studio preview)
   */
  function resolveApiBaseUrl() {
    try {
      // 1. Explicit manual override in browser storage
      const storedUrl = localStorage.getItem('YOURCHOICE_API_URL') || localStorage.getItem('API_BASE_URL');
      if (storedUrl && storedUrl.trim()) {
        return storedUrl.trim().replace(/\/+$/, '');
      }

      // 2. Global runtime config object
      if (window.__RUNTIME_CONFIG__ && window.__RUNTIME_CONFIG__.API_BASE_URL) {
        return window.__RUNTIME_CONFIG__.API_BASE_URL.trim().replace(/\/+$/, '');
      }

      // 3. GitHub Pages environment detection
      const hostname = (window.location && window.location.hostname) ? window.location.hostname.toLowerCase() : '';
      if (hostname.endsWith('github.io')) {
        return DEFAULT_RENDER_BACKEND;
      }
    } catch (_) {
      // Fallback in environments where localStorage is restricted
    }

    // 4. Same-origin relative API path
    return '';
  }

  const initialBaseUrl = resolveApiBaseUrl();

  window.APP_CONFIG = {
    API_BASE_URL: initialBaseUrl,
    DEFAULT_RENDER_BACKEND: DEFAULT_RENDER_BACKEND,
    IS_GITHUB_PAGES: (window.location && window.location.hostname) ? window.location.hostname.toLowerCase().endsWith('github.io') : false,

    /**
     * Resolves any API endpoint into a fully qualified URL when cross-origin,
     * or a clean relative path when same-origin.
     * @param {string} endpoint - e.g. '/api/products' or '/api/admin/login'
     * @returns {string} Fully qualified or relative URL
     */
    getApiUrl: function (endpoint) {
      if (!endpoint || typeof endpoint !== 'string') return '';
      // If already an absolute URL (http:// or https://), leave untouched
      if (/^https?:\/\//i.test(endpoint)) {
        return endpoint;
      }

      const cleanPath = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
      const base = (window.APP_CONFIG && typeof window.APP_CONFIG.API_BASE_URL === 'string')
        ? window.APP_CONFIG.API_BASE_URL.replace(/\/+$/, '')
        : '';

      return base ? `${base}${cleanPath}` : cleanPath;
    },

    /**
     * Set or clear a custom backend URL at runtime (e.g., from admin connection settings).
     * @param {string|null} url - Custom Render backend URL, or empty string to reset
     */
    setCustomBackendUrl: function (url) {
      try {
        if (!url || !url.trim()) {
          localStorage.removeItem('YOURCHOICE_API_URL');
          localStorage.removeItem('API_BASE_URL');
        } else {
          localStorage.setItem('YOURCHOICE_API_URL', url.trim().replace(/\/+$/, ''));
        }
      } catch (_) {}
      window.APP_CONFIG.API_BASE_URL = resolveApiBaseUrl();
      console.log('🔗 [YourChoice] Active API Base URL set to:', window.APP_CONFIG.API_BASE_URL || '(Same-Origin)');
      return window.APP_CONFIG.API_BASE_URL;
    }
  };

  // Expose convenient global helper function
  window.getApiUrl = window.APP_CONFIG.getApiUrl;

  // Expose convenient global apiFetch helper
  window.apiFetch = function (resource, init) {
    const targetUrl = (typeof resource === 'string')
      ? window.APP_CONFIG.getApiUrl(resource)
      : resource;
    return window.fetch(targetUrl, init);
  };

  // Safe fetch interceptor: only wrap if window.fetch is writable/configurable in current browser/iframe context
  try {
    const desc = Object.getOwnPropertyDescriptor(window, 'fetch') ||
                 Object.getOwnPropertyDescriptor(Object.getPrototypeOf(window), 'fetch');
    const isWritable = !desc || desc.writable === true || typeof desc.set === 'function';
    if (isWritable && typeof window.fetch === 'function') {
      const nativeFetch = window.fetch.bind(window);
      window.fetch = function (resource, init) {
        if (typeof resource === 'string' && resource.startsWith('/api/')) {
          const rewritten = window.APP_CONFIG.getApiUrl(resource);
          return nativeFetch(rewritten, init);
        }
        return nativeFetch(resource, init);
      };
    }
  } catch (_) {
    // Silently fall through if environment defines window.fetch as a read-only getter;
    // explicit window.getApiUrl calls throughout frontend handle endpoint routing cleanly.
  }

  // Diagnostic log for development verification
  if (window.location && window.location.hostname && !window.location.hostname.endsWith('github.io')) {
    console.log(`[YourChoice Config] Initialized. Environment: ${window.APP_CONFIG.IS_GITHUB_PAGES ? 'GitHub Pages' : 'Local / Same-Origin'}. API URL: ${window.APP_CONFIG.API_BASE_URL || '(Same-Origin)'}`);
  }
})();
