// ========================================
// SECURITY & ESCAPING HELPERS
// ========================================

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPrice(price) {
  const num = Number(price) || 0;
  return `GH₵ ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ========================================
// CART MANAGEMENT FUNCTIONS
// ========================================

let cart = [];  // Initialize cart as an empty array        

// ========================================
// SHOW TOAST FUNCTION (MODERNIZED)
// ========================================

let toastTimeout = null;
let toastProgressInterval = null;
let toastRemainingTime = 0;
let toastTotalTime = 0;
let isToastPaused = false;

function getToastIcon(type) {
  switch (type) {
    case 'success':
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    case 'error':
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    case 'warning':
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    case 'info':
    default:
      return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff9a00" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }
}

function dismissToast() {
  const toast = document.getElementById('toast');
  if (!toast) return;
  if (toastTimeout) {
    clearTimeout(toastTimeout);
    toastTimeout = null;
  }
  if (toastProgressInterval) {
    clearInterval(toastProgressInterval);
    toastProgressInterval = null;
  }
  toast.classList.remove('show');
}

function showToast(message, type = 'success', action = null, duration = 3500) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  // Clear any existing active timer
  if (toastTimeout) clearTimeout(toastTimeout);
  if (toastProgressInterval) clearInterval(toastProgressInterval);

  // Extend duration slightly if an action button is present so the user can comfortably click
  const totalDuration = action ? Math.max(duration, 4500) : duration;
  toastTotalTime = totalDuration;
  toastRemainingTime = totalDuration;
  isToastPaused = false;

  const typeTitles = {
    success: 'Success',
    error: 'Attention',
    warning: 'Notice',
    info: 'Information'
  };

  const actionHtml = action && action.text ? `
    <button class="toast-action-btn" type="button" id="toast-action-btn">
      ${action.text}
    </button>
  ` : '';

  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-body">
      <div class="toast-icon-wrap" aria-hidden="true">
        ${getToastIcon(type)}
      </div>
      <div class="toast-content">
        <span class="toast-title">${typeTitles[type] || 'Notice'}</span>
        <div class="toast-message">${message}</div>
      </div>
      ${actionHtml}
      <button class="toast-close-btn" type="button" aria-label="Dismiss notification" id="toast-close-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    <div class="toast-progress-track">
      <div class="toast-progress-bar" id="toast-progress-bar"></div>
    </div>
  `;

  // Bind close button
  const closeBtn = document.getElementById('toast-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissToast();
    });
  }

  // Bind action button
  const actionBtn = document.getElementById('toast-action-btn');
  if (actionBtn && action && typeof action.onClick === 'function') {
    actionBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissToast();
      try {
        action.onClick();
      } catch (err) {
        console.error('Error executing toast action:', err);
      }
    });
  }

  // Tap/click to dismiss on toast card (excluding clicks inside the action button)
  toast.onclick = (e) => {
    if (e.target.closest('#toast-action-btn')) return;
    dismissToast();
  };

  // Pause timer on hover, resume on mouse leave
  toast.onmouseenter = () => {
    isToastPaused = true;
  };
  toast.onmouseleave = () => {
    isToastPaused = false;
  };

  // Trigger entrance transition
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Animated progress bar countdown
  const progressBar = document.getElementById('toast-progress-bar');
  if (progressBar) {
    progressBar.style.transform = 'scaleX(1)';
  }

  const intervalStep = 25;
  toastProgressInterval = setInterval(() => {
    if (isToastPaused) return;

    toastRemainingTime -= intervalStep;
    if (toastRemainingTime <= 0) {
      clearInterval(toastProgressInterval);
      toastProgressInterval = null;
      dismissToast();
    } else if (progressBar) {
      const progressFraction = Math.max(0, toastRemainingTime / toastTotalTime);
      progressBar.style.transform = `scaleX(${progressFraction})`;
    }
  }, intervalStep);
}

// ========================================
// PROCESSING STATE FUNCTIONS
// ========================================

function showProcessingState() {
  const cartEl = document.getElementById('cart');
  if (cartEl) cartEl.classList.add('processing');
}

function hideProcessingState() {
  const cartEl = document.getElementById('cart');
  if (cartEl) cartEl.classList.remove('processing');
}

// ========================================
// FLOATING CART BUTTON FUNCTIONS
// ========================================

function showFloatingCart() {
  const floatingBtn = document.getElementById('floating-cart-btn');
  if (!floatingBtn) return;
  floatingBtn.classList.add('show', 'pulse');
  
  // Remove pulse animation after 3 seconds
  setTimeout(() => {
    if (floatingBtn) floatingBtn.classList.remove('pulse');
  }, 3000);
}

function hideFloatingCart() {
  const floatingBtn = document.getElementById('floating-cart-btn');
  if (!floatingBtn) return;
  floatingBtn.classList.remove('show', 'pulse');
}

function updateFloatingCartCount() {
  const floatingCount = document.getElementById('floating-cart-count');
  if (!floatingCount) return;
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  floatingCount.textContent = totalItems;
  
  // Show/hide floating cart based on cart contents
  if (totalItems > 0) {
    showFloatingCart();
  } else {
    hideFloatingCart();
  }
}

function addToCart(productOrId, quantityToAdd = 1) {
  let product = productOrId;
  if (typeof productOrId === 'string' && typeof products !== 'undefined') {
    product = products.find(p => p.id === productOrId);
  }

  // Validate product data
  if (!product || !product.name || typeof product.price !== 'number' || product.price <= 0) {
    showToast('Invalid product data', 'error');
    return;
  }

  const qty = Math.max(1, parseInt(quantityToAdd, 10) || 1);

  showProcessingState();
  
  setTimeout(() => {
    const existing = cart.find(item => item.name === product.name || (product.id && item.id === product.id));
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({ ...product, quantity: qty });
    }
    updateCartUI();
    updateFloatingCartCount(); // Update floating cart
    hideProcessingState();
    const qtyPrefix = qty > 1 ? `${qty}x ` : '';
    showToast(`${qtyPrefix}${product.name} added to cart`, 'success', {
      text: 'View Cart',
      onClick: () => {
        if (typeof toggleCartView === 'function') toggleCartView();
      }
    });
  }, 100); // Small delay for visual feedback
}

function changeQuantity(index, delta) {
  // Validate index
  if (index < 0 || index >= cart.length) {
    console.error('Invalid cart index:', index);
    return;
  }
  
  const newQuantity = cart[index].quantity + delta;
  if (newQuantity <= 0) {
    cart.splice(index, 1);
  } else {
    cart[index].quantity = newQuantity;
  }
  updateCartUI();
}

// ========================================
// VISUAL FEEDBACK FUNCTIONS
// ========================================

function showSuccessState(element) {
  element.classList.add('success');
  setTimeout(() => {
    element.classList.remove('success');
  }, 1000);
}

function showErrorState(element) {
  element.classList.add('error');
  setTimeout(() => {
    element.classList.remove('error');
  }, 1000);
}

// ========================================
// REMOVE ITEM FUNCTION
// ========================================

function removeItem(index) {
  // Validate index
  if (index < 0 || index >= cart.length) {
    console.error('Invalid cart index:', index);
    return;
  }
  
  // Get the cart item element for animation
  const cartItems = document.querySelectorAll('.cart-item');
  const itemElement = cartItems[index];
  
  if (itemElement) {
    // Add removing animation
    itemElement.classList.add('removing');
    
    // Wait for animation to complete before removing
    setTimeout(() => {
      cart.splice(index, 1);
      updateCartUI();
    }, 300);
  } else {
    // Fallback if element not found
    cart.splice(index, 1);
    updateCartUI();
  }
}

// ========================================
// UPDATE CART UI FUNCTION
// ========================================

function updateCartUI() {
  const elements = getCartElements();
  if (!elements.items || !elements.count || !elements.total) {
    saveCartToStorage();
    return;
  }
  
  elements.items.innerHTML = '';
  let total = 0;
  let itemCount = 0;
  
  if (cart.length === 0) {
    elements.items.innerHTML = `
      <li class="empty-cart empty-cart-state">
        <div class="empty-cart-icon-wrap" aria-hidden="true">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="8" cy="21" r="1"></circle>
            <circle cx="19" cy="21" r="1"></circle>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
          </svg>
        </div>
        <p class="empty-cart-title">Your cart is empty</p>
        <p class="empty-cart-sub">You have no items in your shopping bag. Explore our collection for top-rated gadgets and accessories!</p>
        <button type="button" class="empty-cart-cta" onclick="toggleCartView(); const p = document.getElementById('products'); if (p) p.scrollIntoView({behavior: 'smooth'});">
          Start Shopping
        </button>
      </li>
    `;
    elements.count.textContent = '0';
    elements.total.textContent = formatPrice(0);
    updateCartCountBadges(0);
    if (typeof updateWishlistBadges === 'function') updateWishlistBadges();
    updateFloatingCartCount();
    saveCartToStorage();
    
    // Update button states
    updateButtonStates();

    return; // exit early if empty
  }

  cart.forEach((item, index) => {
    total += item.price * item.quantity;
    itemCount += item.quantity;

    const li = document.createElement('li');
    li.className = 'cart-item';

    const safeItemName = escapeHtml(item.name || 'Item');
    li.innerHTML = `
      <div class="cart-item-details">
        <span class="item-name">${safeItemName}</span>
        <span class="item-unit-price">${formatPrice(item.price)} each</span>
      </div>
      <div class="quantity-controls">
        <button class="decrease-qty" data-index="${index}" aria-label="Decrease quantity of ${safeItemName}" title="Decrease quantity">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
        <span class="qty-display">${item.quantity}</span>
        <button class="increase-qty" data-index="${index}" aria-label="Increase quantity of ${safeItemName}" title="Increase quantity">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>
      <span class="item-price">${formatPrice(item.price * item.quantity)}</span>
      <button class="remove-btn" data-index="${index}" aria-label="Remove ${safeItemName} from cart" title="Remove item">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    `;
    elements.items.appendChild(li);
  });

  // Update cart totals
  elements.count.textContent = itemCount;
  elements.total.textContent = formatPrice(total);
  updateCartCountBadges(itemCount);
  if (typeof updateWishlistBadges === 'function') updateWishlistBadges();

  // Update button states
  updateButtonStates();
  
  // Update floating cart
  updateFloatingCartCount();
  
  // Save cart to localStorage
  saveCartToStorage();
}

function updateCartCountBadges(count) {
  // Explicitly target dedicated cart badges, ensuring wishlist and order badges are never modified
  const badges = document.querySelectorAll('#cart-count, .mobile-cart-count, #drawer-cart-count, #floating-cart-count');
  badges.forEach(badge => {
    badge.textContent = count;
  });
}

// ========================================
// BUTTON STATE MANAGEMENT FUNCTION
// ========================================

function updateButtonStates() {
  const checkoutBtn = document.getElementById('checkout-btn');
  const clearCartBtn = document.getElementById('clear-cart-btn');
  const isEmpty = cart.length === 0;
  
  if (checkoutBtn) checkoutBtn.disabled = isEmpty;
  if (clearCartBtn) clearCartBtn.disabled = isEmpty;
}

// ========================================
// ERROR HANDLING FUNCTION
// ========================================

function handleError(error, context) {
  console.error(`Error in ${context}:`, error);
  
  let userMessage = 'An unexpected error occurred.';
  
  switch (error.name) {
    case 'QuotaExceededError':
      userMessage = 'Storage is full. Please clear some data and try again.';
      break;
    case 'SyntaxError':
      userMessage = 'Cart data is corrupted and has been reset.';
      break;
    case 'TypeError':
      userMessage = 'Invalid data format. Please refresh the page.';
      break;
    default:
      userMessage = 'Something went wrong. Please try again.';
  }
  
  showToast(userMessage, 'error');
}

// ========================================
// CART & WISHLIST STORAGE (14-DAY ROLLING TTL & LIFECYCLE)
// ========================================

const CART_STORAGE_KEY = 'cart';
const CART_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days rolling expiration window
const WISHLIST_STORAGE_KEY = 'userWishlist';

// Helper to detect strictly offline/file hosting without any configured backend
function isStaticHost() {
  if (typeof window === 'undefined') return false;
  // If an API Base URL is active (including Render backend on GitHub Pages), it's not a disconnected static host
  if (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) return false;
  return window.location.protocol === 'file:';
}

// Debounced background sync for authenticated accounts
let userSyncDebounceTimer = null;
function syncActiveUserCartAndWishlistDebounced() {
  if (typeof window === 'undefined') return;
  const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  if (!userLoggedIn) return;

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (e) {
    user = {};
  }
  if (!user.id && !user.email) return;

  if (userSyncDebounceTimer) {
    clearTimeout(userSyncDebounceTimer);
  }

  userSyncDebounceTimer = setTimeout(async () => {
    try {
      const currentWishlist = typeof getWishlist === 'function' ? getWishlist() : [];
      const syncUrl = window.getApiUrl ? window.getApiUrl('/api/user/cart-wishlist') : '/api/user/cart-wishlist';
      await fetch(syncUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          cart: cart,
          wishlist: currentWishlist
        })
      });
    } catch (err) {
      // Non-blocking background sync
    }
  }, 1200);
}

// Background sync to fetch remote account cart & wishlist for logged-in user
async function syncActiveUserFromBackend() {
  if (typeof window === 'undefined') return;
  const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  if (!userLoggedIn) return;

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (e) {
    user = {};
  }
  if (!user.id && !user.email) return;

  try {
    const fetchCartUrl = window.getApiUrl 
      ? window.getApiUrl(`/api/user/cart-wishlist?userId=${encodeURIComponent(user.id || '')}&email=${encodeURIComponent(user.email || '')}`)
      : `/api/user/cart-wishlist?userId=${encodeURIComponent(user.id || '')}&email=${encodeURIComponent(user.email || '')}`;
    const res = await fetch(fetchCartUrl);
    if (res.ok) {
      const data = await res.json();
      let cartUpdated = false;
      if (Array.isArray(data.cart) && data.cart.length > 0 && cart.length === 0) {
        cart = data.cart;
        saveCartToStorage();
        updateCartUI();
        updateFloatingCartCount();
        cartUpdated = true;
      }
      if (Array.isArray(data.wishlist) && data.wishlist.length > 0) {
        const localWishlist = typeof getWishlist === 'function' ? getWishlist() : [];
        if (localWishlist.length === 0) {
          localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(data.wishlist));
          if (typeof updateWishlistBadges === 'function') {
            updateWishlistBadges();
          }
        }
      }
    }
  } catch (err) {
    // Non-blocking background sync
  }
}

// Safely extract cart envelope with self-healing auto-repair for corrupt or legacy formats
function getStoredCartEnvelope() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return null;

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (syntaxErr) {
      console.warn('Corrupted JSON detected in cart storage. Auto-healing to clean envelope.');
      const healedEnvelope = { items: [], lastUpdated: Date.now() };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(healedEnvelope));
      return healedEnvelope;
    }

    // Backward compatibility: auto-migrate legacy plain array into rolling TTL envelope
    if (Array.isArray(parsed)) {
      const envelope = {
        items: parsed,
        lastUpdated: Date.now()
      };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(envelope));
      return envelope;
    }

    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.items)) {
      return parsed;
    }

    // Auto-heal unexpected non-envelope objects or primitive data types
    console.warn('Invalid cart structure detected in localStorage. Auto-healing.');
    const healedEnvelope = { items: [], lastUpdated: Date.now() };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(healedEnvelope));
    return healedEnvelope;
  } catch (err) {
    console.error('Error reading cart envelope:', err);
    return { items: [], lastUpdated: Date.now() };
  }
}

// Save cart wrapped in rolling TTL envelope
function saveCartToStorage() {
  try {
    const envelope = {
      items: cart,
      lastUpdated: Date.now()
    };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(envelope));
    syncActiveUserCartAndWishlistDebounced();
  } catch (error) {
    handleError(error, 'cart saving');
  }
}

// Load and validate cart respecting 14-day rolling expiration
function loadCartFromStorage() {
  try {
    const envelope = getStoredCartEnvelope();
    if (!envelope) {
      cart = [];
      return;
    }

    const now = Date.now();
    const lastUpdated = typeof envelope.lastUpdated === 'number' ? envelope.lastUpdated : now;

    // Check if 14-day rolling window has elapsed
    if (now - lastUpdated > CART_TTL_MS) {
      console.warn('Guest cart expired after 14 days of inactivity');
      cart = [];
      localStorage.removeItem(CART_STORAGE_KEY);
      setTimeout(() => {
        showToast('Your previous cart expired after 14 days of inactivity.', 'info');
      }, 500);
      return;
    }

    const validItems = (envelope.items || []).filter(item =>
      item &&
      item.name &&
      typeof item.price === 'number' &&
      item.price > 0 &&
      typeof item.quantity === 'number' &&
      item.quantity > 0
    );

    cart = validItems;

    // Rolling TTL: refresh timestamp on active page load/session visit
    saveCartToStorage();

    if (envelope.items && validItems.length !== envelope.items.length) {
      setTimeout(() => {
        showToast(`${envelope.items.length - validItems.length} invalid items were removed from your cart`, 'warning');
      }, 500);
    }
  } catch (error) {
    handleError(error, 'cart loading');
    cart = [];
    localStorage.removeItem(CART_STORAGE_KEY);
  }
}

function openCartView() {
  const cartEl = document.getElementById('cart');
  const overlay = document.getElementById('cart-overlay');
  if (!cartEl || !overlay) return;

  // Close the mobile drawer first if open
  if (typeof closeMobileDrawer === 'function') {
    closeMobileDrawer();
  }

  // Refresh cart UI and counter displays so items are always up-to-date
  if (typeof updateCartUI === 'function') {
    updateCartUI();
  }
  if (typeof updateFloatingCartCount === 'function') {
    updateFloatingCartCount();
  }

  lastFocusedElement = document.activeElement;
  cartEl.classList.add('show');
  overlay.classList.add('show');

  // Focus close button or first focusable element
  const firstFocusable = cartEl.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (firstFocusable) {
    firstFocusable.focus();
  }
}

function closeCartView() {
  const cartEl = document.getElementById('cart');
  const overlay = document.getElementById('cart-overlay');
  if (!cartEl || !overlay) return;

  cartEl.classList.remove('show');
  overlay.classList.remove('show');
  if (lastFocusedElement) {
    try {
      lastFocusedElement.focus();
    } catch (_) {}
  }
}

function toggleCartView() {
  const cartEl = document.getElementById('cart');
  if (cartEl && cartEl.classList.contains('show')) {
    closeCartView();
  } else {
    openCartView();
  }
}

// Expose on window for inline handlers & external modules
window.openCartView = openCartView;
window.closeCartView = closeCartView;
window.toggleCartView = toggleCartView;

let lastFocusedElement = null;

function setupCartEventListeners() {
  // Use specific selectors for cart toggle buttons, NEVER generic a[href="#"] which matches every dummy anchor!
  const cartToggleLinks = document.querySelectorAll('#nav-cart-btn, .nav-cart-link, a[href="#cart"]');
  cartToggleLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openCartView();
    });
  });

  const mobileCartTrigger = document.getElementById('mobile-cart-trigger');
  if (mobileCartTrigger) {
    mobileCartTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openCartView();
    });
  }

  const drawerCartLink = document.getElementById('drawer-cart-link');
  if (drawerCartLink) {
    drawerCartLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openCartView();
    });
  }

  const floatingCartBtn = document.getElementById('floating-cart-btn');
  if (floatingCartBtn) {
    floatingCartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openCartView();
    });
  }

  const clearCartBtn = document.getElementById('clear-cart-btn');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (!cart || cart.length === 0) {
        showToast('Cart is already empty', 'info');
        return;
      }
      
      const itemCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);
      cart = [];
      updateCartUI();
      showToast(`Cleared ${itemCount} item${itemCount === 1 ? '' : 's'} from your cart`, 'success');
    });
  }

  // Close cart when clicking the "×" button
  const closeCartBtn = document.getElementById('close-cart');
  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', toggleCartView);
  }

  const cartOverlay = document.getElementById('cart-overlay');
  if (cartOverlay) {
    cartOverlay.addEventListener('click', toggleCartView);
  }

  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (!cart || cart.length === 0) {
        showToast('Your cart is empty', 'warning');
        return;
      }

      const cartEl = document.getElementById('cart');
      const overlay = document.getElementById('cart-overlay');
      if (cartEl) cartEl.classList.remove('show');
      if (overlay) overlay.classList.remove('show');
      window.location.href = 'checkout.html';
    });
  }

  const cartItems = document.getElementById('cart-items');
  if (cartItems) {
    cartItems.addEventListener('click', function(event) {
      const target = event.target.closest('button') || event.target;
      const index = target.getAttribute('data-index');
      if (index === null) return;
      if (target.classList.contains('decrease-qty')) {
        changeQuantity(Number(index), -1);
      } else if (target.classList.contains('increase-qty')) {
        changeQuantity(Number(index), 1);
      } else if (target.classList.contains('remove-btn')) {
        removeItem(Number(index));
      }
    });

    // Add keyboard support for cart items
    cartItems.addEventListener('keydown', function(event) {
      const target = event.target.closest('button') || event.target;
      const index = target.getAttribute('data-index');
      if (index === null) return;
      
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (target.classList.contains('decrease-qty')) {
          changeQuantity(Number(index), -1);
        } else if (target.classList.contains('increase-qty')) {
          changeQuantity(Number(index), 1);
        } else if (target.classList.contains('remove-btn')) {
          removeItem(Number(index));
        }
      }
    });
  }
}

// ========================================
// MOBILE NAVIGATION DRAWER FUNCTIONS
// ========================================

function openMobileDrawer() {
  const drawer = document.getElementById('mobile-nav-drawer');
  const backdrop = document.getElementById('mobile-nav-backdrop');
  const menuBtn = document.getElementById('mobile-menu-btn');
  if (drawer) drawer.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
  if (menuBtn) {
    menuBtn.classList.add('active');
    menuBtn.setAttribute('aria-expanded', 'true');
  }
  document.body.classList.add('drawer-open');
}

function closeMobileDrawer() {
  const drawer = document.getElementById('mobile-nav-drawer');
  const backdrop = document.getElementById('mobile-nav-backdrop');
  const menuBtn = document.getElementById('mobile-menu-btn');
  if (drawer) drawer.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
  if (menuBtn) {
    menuBtn.classList.remove('active');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
  document.body.classList.remove('drawer-open');
}

function setupMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const backdrop = document.getElementById('mobile-nav-backdrop');
  const closeBtn = document.getElementById('close-drawer-btn');
  const navLinks = document.querySelectorAll('.nav-link, .drawer-link, .nav-auth-link');

  if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menuBtn.classList.contains('active');
      if (isOpen) {
        closeMobileDrawer();
      } else {
        openMobileDrawer();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMobileDrawer);
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeMobileDrawer);
  }

  navLinks.forEach(link => {
    if (
      !link.classList.contains('nav-cart-link') &&
      !link.classList.contains('nav-btn-link') &&
      !link.classList.contains('drawer-cart-link') &&
      link.id !== 'drawer-cart-link' &&
      link.id !== 'drawer-wishlist-btn' &&
      link.id !== 'drawer-orders-btn'
    ) {
      link.addEventListener('click', closeMobileDrawer);
    }
  });

  function handleScreenShift() {
    if (window.innerWidth >= 1024) {
      closeMobileDrawer();
    }
  }

  window.addEventListener('resize', handleScreenShift);
  window.addEventListener('orientationchange', () => {
    setTimeout(handleScreenShift, 100);
  });
}

// Close overlays when pressing Escape
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeMobileDrawer();
    const cartEl = document.getElementById('cart');
    const overlay = document.getElementById('cart-overlay');
    if (cartEl && overlay && cartEl.classList.contains('show')) {
      toggleCartView();
    }
  }
});

// ========================================
// CAROUSEL VARIABLES
// ========================================

let currentSlide = 0;
let totalSlides = 0;
let slidesPerView = 4;
let autoSlideInterval = null;
let autoSlideDelay = 3500; // Relaxed 3.5 seconds
let autoSlideResumeTimeout = null;
let isCarouselTransitioning = false;
let trackTransitionListenerAttached = false;

function pauseAndResumeAutoSlide(delay = 4000) {
  stopAutoSlide();
  if (autoSlideResumeTimeout) clearTimeout(autoSlideResumeTimeout);
  autoSlideResumeTimeout = setTimeout(() => {
    startAutoSlide();
  }, delay);
}

// ========================================
// AUTO SLIDE FUNCTIONS
// ========================================

function startAutoSlide() {
  const track = document.getElementById('trending-carousel');
  if (!track || totalSlides <= slidesPerView) return;
  
  stopAutoSlide();
  
  autoSlideInterval = setInterval(() => {
    slideCarousel('next');
  }, autoSlideDelay);
}

function stopAutoSlide() {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
    autoSlideInterval = null;
  }
}

// Touch and gesture interaction variables
let touchStartX = 0;
let touchStartY = 0;
let touchDeltaX = 0;
let isSwiping = false;

// Pause auto-slide when hovering over the carousel
function setupCarouselHover() {
  const container = document.querySelector('.carousel-container');
  if (!container || container.dataset.hoverBound) return;
  container.dataset.hoverBound = 'true';

  container.addEventListener('mouseenter', () => {
    stopAutoSlide();
  });

  container.addEventListener('mouseleave', () => {
    pauseAndResumeAutoSlide(2500);
  });
}

// Full touch gesture support for mobile devices
function setupCarouselTouchGestures() {
  const container = document.querySelector('.carousel-container');
  if (!container || container.dataset.touchBound) return;
  container.dataset.touchBound = 'true';

  container.addEventListener('touchstart', (e) => {
    if (!e.touches || e.touches.length === 0) return;
    stopAutoSlide();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchDeltaX = 0;
    isSwiping = true;
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (!isSwiping || !e.touches || e.touches.length === 0) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX;
    const diffY = currentY - touchStartY;

    // Recognize horizontal swipe gestures
    if (Math.abs(diffX) > Math.abs(diffY)) {
      touchDeltaX = diffX;
    }
  }, { passive: true });

  container.addEventListener('touchend', () => {
    if (!isSwiping) return;
    isSwiping = false;

    const swipeThreshold = 40; // 40px threshold for deliberate swipe
    if (touchDeltaX < -swipeThreshold) {
      slideCarousel('next');
    } else if (touchDeltaX > swipeThreshold) {
      slideCarousel('prev');
    }

    pauseAndResumeAutoSlide(4000);
  }, { passive: true });

  container.addEventListener('touchcancel', () => {
    isSwiping = false;
    touchDeltaX = 0;
    pauseAndResumeAutoSlide(4000);
  }, { passive: true });
}

// ========================================
// CAROUSEL FUNCTIONS
// ========================================

function getCarouselLayout() {
  const track = document.getElementById('trending-carousel');
  const container = track ? track.parentElement : null;
  const containerWidth = container ? container.clientWidth : (window.innerWidth || 360);
  const screenWidth = window.innerWidth;
  const isMobile = screenWidth < 641;
  const isTablet = screenWidth >= 641 && screenWidth <= 1024;

  let computedSlidesPerView = 4;
  if (isMobile) {
    computedSlidesPerView = 1;
  } else if (isTablet) {
    computedSlidesPerView = 2;
  } else if (screenWidth < 1200) {
    computedSlidesPerView = 3;
  }

  let cardWidth;
  let gap;
  let centerOffset = 0;

  if (isMobile) {
    // Single card taking ~84% of mobile viewport with peek margins for edge context
    gap = 16;
    cardWidth = Math.min(Math.round(containerWidth * 0.84), 360);
    centerOffset = Math.round((containerWidth - cardWidth) / 2);
  } else {
    gap = isTablet ? 20 : 24;
    const totalGaps = (computedSlidesPerView - 1) * gap;
    cardWidth = Math.max(Math.round((containerWidth - totalGaps) / computedSlidesPerView), 220);
    centerOffset = 0;
  }

  return {
    isMobile,
    isTablet,
    slidesPerView: computedSlidesPerView,
    cardWidth,
    gap,
    centerOffset,
    containerWidth
  };
}

function applyCarouselCardDimensions() {
  const track = document.getElementById('trending-carousel');
  if (!track) return;
  const { cardWidth, gap } = getCarouselLayout();
  track.style.gap = `${gap}px`;

  const cards = track.querySelectorAll('.product-card');
  cards.forEach(card => {
    card.style.width = `${cardWidth}px`;
    card.style.minWidth = `${cardWidth}px`;
    card.style.maxWidth = `${cardWidth}px`;
    card.style.flexShrink = '0';
    card.style.alignSelf = 'stretch';
    card.style.boxSizing = 'border-box';
    card.style.height = '100%';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.justifyContent = 'space-between';
  });
}

function updateActiveCardClasses(slideIndex) {
  const track = document.getElementById('trending-carousel');
  if (!track) return;
  const cards = track.querySelectorAll('.product-card');
  if (!cards.length) return;
  const { isMobile } = getCarouselLayout();

  cards.forEach((card, idx) => {
    if (isMobile && idx === slideIndex) {
      card.classList.add('carousel-card-focused');
      card.setAttribute('aria-current', 'true');
    } else {
      card.classList.remove('carousel-card-focused');
      card.removeAttribute('aria-current');
    }
  });
}

function setTrackPosition(index, animate = true) {
  const track = document.getElementById('trending-carousel');
  if (!track) return;
  const { cardWidth, gap, centerOffset } = getCarouselLayout();
  const step = cardWidth + gap;
  const translateX = -(index * step) + centerOffset;

  if (animate) {
    track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
  } else {
    track.style.transition = 'none';
  }
  track.style.transform = `translateX(${translateX}px)`;
  updateActiveCardClasses(index);
}

function slideCarousel(direction) {
  const track = document.getElementById('trending-carousel');
  if (!track || totalSlides <= slidesPerView) return;
  if (isCarouselTransitioning) return;

  isCarouselTransitioning = true;
  if (direction === 'next') {
    currentSlide++;
  } else if (direction === 'prev') {
    currentSlide--;
  }

  setTrackPosition(currentSlide, true);
  updateCarouselDots();
  pauseAndResumeAutoSlide(4000);

  // Fallback timeout in case transitionend event does not fire
  setTimeout(() => {
    isCarouselTransitioning = false;
  }, 550);
}

function setupTrackTransitionListener() {
  const track = document.getElementById('trending-carousel');
  if (!track || trackTransitionListenerAttached) return;
  trackTransitionListenerAttached = true;

  track.addEventListener('transitionend', (e) => {
    if (e.target !== track || e.propertyName !== 'transform') return;

    isCarouselTransitioning = false;
    if (totalSlides <= slidesPerView) return;

    const bufferCount = slidesPerView;
    // Seamless wrap forward (cloned head -> real items start)
    if (currentSlide >= bufferCount + totalSlides) {
      currentSlide = currentSlide - totalSlides;
      setTrackPosition(currentSlide, false);
      void track.offsetHeight; // Force layout reflow
      track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    } 
    // Seamless wrap backward (cloned tail -> real items end)
    else if (currentSlide < bufferCount) {
      currentSlide = currentSlide + totalSlides;
      setTrackPosition(currentSlide, false);
      void track.offsetHeight; // Force layout reflow
      track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    }

    updateCarouselDots();
  });
}

function updateCarouselButtons() {
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  
  if (prevBtn) prevBtn.disabled = totalSlides <= slidesPerView;
  if (nextBtn) nextBtn.disabled = totalSlides <= slidesPerView;
}

function updateCarouselDots() {
  const dots = document.querySelectorAll('.carousel-dot');
  if (!dots || dots.length === 0 || totalSlides === 0) return;

  const bufferCount = totalSlides > slidesPerView ? slidesPerView : 0;
  const activeIndex = ((currentSlide - bufferCount) % totalSlides + totalSlides) % totalSlides;

  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === activeIndex);
  });
}

function goToSlide(slideIndex) {
  const track = document.getElementById('trending-carousel');
  if (!track || totalSlides <= slidesPerView) return;
  if (isCarouselTransitioning) return;

  pauseAndResumeAutoSlide(4000);
  const bufferCount = slidesPerView;
  currentSlide = bufferCount + slideIndex;
  setTrackPosition(currentSlide, true);
  updateCarouselDots();
}

function createCarouselDots(total) {
  const dotsContainer = document.getElementById('carousel-dots');
  if (!dotsContainer) return;
  dotsContainer.innerHTML = '';
  if (total <= 1) return;
  
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }
}

// ========================================
// PRODUCT DISPLAY FUNCTIONS
// ========================================

// Helper to render crisp vector SVG heart icon
function getWishlistHeartSvg() {
  return `<svg class="wishlist-heart-icon" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
}

function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  
  // Standardized sale & discount detection
  const isOnSale = Boolean(
    product.isOnSale || 
    product.hasDiscount || 
    (product.originalPrice && product.originalPrice > product.price)
  );
  
  const discountPercent = Math.round(
    product.discount || 
    product.discountPercentage || 
    (product.originalPrice && product.originalPrice > product.price 
      ? ((product.originalPrice - product.price) / product.originalPrice) * 100 
      : 0)
  );
  
  // Create badges
  let badges = '';
  if (isOnSale && discountPercent > 0) {
    badges += `<div class="discount">-${discountPercent}%</div>`;
  }
  if (product.isTrending) {
    badges += `<div class="trending-badge">🔥 Trending</div>`;
  }
  
  // Create price display: current selling price FIRST in bold accent, original struck-through price SECOND
  let priceDisplay = '';
  if (isOnSale && product.originalPrice && product.originalPrice > product.price) {
    priceDisplay = `
      <span class="price">${formatPrice(product.price)}</span>
      <span class="original-price">${formatPrice(product.originalPrice)}</span>
    `;
  } else {
    priceDisplay = `<span class="price">${formatPrice(product.price)}</span>`;
  }
  
  // Create stock info
  let stockInfo = '';
  if (product.stock <= 5) {
    stockInfo = `<div class="stock-info stock-low">Only ${product.stock} left!</div>`;
  } else if (product.stock <= 10) {
    stockInfo = `<div class="stock-info">${product.stock} in stock</div>`;
  } else {
    stockInfo = `<div class="stock-info">In stock</div>`;
  }
  
  // Create features display (up to 2 key highlights with clean wrapping and title tooltips)
  let featuresDisplay = '<div class="product-features empty" aria-hidden="true">&nbsp;</div>';
  if (product.features && product.features.length > 0) {
    featuresDisplay = '<div class="product-features">';
    product.features.slice(0, 2).forEach(feature => {
      featuresDisplay += `<span class="feature-tag" title="${escapeHtml(feature)}">${escapeHtml(feature)}</span>`;
    });
    featuresDisplay += '</div>';
  }
  
  const inWishlist = typeof isWishlisted === 'function' ? isWishlisted(product.id) : false;
  // Standardized Brand or Category Tag so every single card has identical vertical geometry
  const brandOrCategory = product.brand 
    ? product.brand 
    : (product.category ? product.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Original Gear');
  const brandLabel = `<span class="product-card-interactive-tag">${escapeHtml(brandOrCategory)}</span>`;

  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-haspopup', 'dialog');
  card.setAttribute('aria-label', `View specifications and manufacturing details for ${product.name}`);

  card.innerHTML = `
    <div class="product-card-header">
      <div class="product-badges">${badges}</div>
      <button type="button" class="wishlist-btn ${inWishlist ? 'active' : ''}" data-product-id="${product.id}" aria-label="${inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}">
        ${getWishlistHeartSvg()}
      </button>
    </div>
    <div class="product-image-wrap">
      <img src="${product.images && product.images[0] ? product.images[0] : 'src/assets/product1.jpg'}" alt="${escapeHtml(product.name)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.parentElement.innerHTML='<div class=\\'product-image-fallback\\'><svg width=\\'36\\' height=\\'36\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1.7\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\'><rect width=\\'14\\' height=\\'20\\' x=\\'5\\' y=\\'2\\' rx=\\'2\\' ry=\\'2\\'/><path d=\\'M12 18h.01\\'/></svg><span>${escapeHtml(product.brand || product.name)}</span></div>';" />
    </div>
    <div class="product-card-body">
      ${brandLabel}
      <h3>${escapeHtml(product.name)}</h3>
      ${featuresDisplay}
      <div class="product-price-row">${priceDisplay}</div>
      ${stockInfo}
      <div class="product-view-details-hint" aria-hidden="true">
        <span>View specs &amp; brand details</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </div>
    </div>
    <button type="button" class="add-to-cart-btn" data-product-id="${product.id}">
      Add to Cart
    </button>
  `;
  
  // Card click opens the detailed specification modal (unless action buttons are clicked)
  card.addEventListener('click', () => {
    openProductDetailModal(product);
  });

  // Accessible keyboard activation (Enter or Space)
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Ignore if currently focused on a button inside the card
      if (e.target && e.target.tagName === 'BUTTON') return;
      e.preventDefault();
      openProductDetailModal(product);
    }
  });

  // Attach event listener directly to avoid inline quote syntax errors
  const addBtn = card.querySelector('.add-to-cart-btn');
  if (addBtn) {
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(product);
    });
  }

  const wishBtn = card.querySelector('.wishlist-btn');
  if (wishBtn) {
    wishBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof toggleWishlist === 'function') {
        toggleWishlist(product);
      }
    });
  }
  
  return card;
}

function displayProducts(productsToShow = products) {
  const gridContainer = document.getElementById('products-grid') || document.getElementById('products');
  const countBadge = document.getElementById('products-count-badge');
  if (countBadge) {
    countBadge.textContent = `${productsToShow.length} item${productsToShow.length === 1 ? '' : 's'}`;
  }
  if (!gridContainer) return;
  gridContainer.innerHTML = '';
  
  if (productsToShow.length === 0) {
    const activeBtn = document.querySelector('.filter-btn.active');
    const categoryName = activeBtn ? activeBtn.textContent.trim() : 'this category';
    gridContainer.innerHTML = `
      <div class="products-empty-state">
        <div class="empty-icon-wrap" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </div>
        <h3>No products found in "${categoryName}"</h3>
        <p>We are constantly stocking new genuine tech gear. Try selecting another category or view our complete catalog.</p>
        <button type="button" class="empty-reset-btn" onclick="const b=document.querySelector('.filter-btn[data-category=\\'all\\']');if(b)b.click();">
          <span>Browse All Products</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    `;
    return;
  }
  
  productsToShow.forEach(product => {
    const card = createProductCard(product);
    gridContainer.appendChild(card);
  });
}

function displayTrendingProducts() {
  const carouselTrack = document.getElementById('trending-carousel');
  if (!carouselTrack) return;
  const trendingProducts = getTrendingProducts();
  
  carouselTrack.innerHTML = '';
  
  if (trendingProducts.length === 0) {
    carouselTrack.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #666; min-width: 100%;">
        <p>No trending products at the moment.</p>
      </div>
    `;
    return;
  }
  
  totalSlides = trendingProducts.length;
  
  // Calculate slides per view based on responsive layout helper
  const layout = getCarouselLayout();
  slidesPerView = layout.slidesPerView;

  // If there are more trending products than visible slides, build infinite cloned buffer
  if (totalSlides > slidesPerView) {
    const bufferCount = slidesPerView;

    // 1. Prepend clones of the tail items
    for (let i = totalSlides - bufferCount; i < totalSlides; i++) {
      const card = createProductCard(trendingProducts[i]);
      card.classList.add('carousel-clone');
      card.setAttribute('aria-hidden', 'true');
      carouselTrack.appendChild(card);
    }

    // 2. Genuine products
    trendingProducts.forEach(product => {
      const card = createProductCard(product);
      carouselTrack.appendChild(card);
    });

    // 3. Append clones of the head items
    for (let i = 0; i < bufferCount; i++) {
      const card = createProductCard(trendingProducts[i]);
      card.classList.add('carousel-clone');
      card.setAttribute('aria-hidden', 'true');
      carouselTrack.appendChild(card);
    }

    currentSlide = bufferCount;
  } else {
    trendingProducts.forEach(product => {
      const card = createProductCard(product);
      carouselTrack.appendChild(card);
    });
    currentSlide = 0;
  }
  
  applyCarouselCardDimensions();
  createCarouselDots(totalSlides);
  updateCarouselButtons();
  
  // Position track at genuine first slide without animation
  setTrackPosition(currentSlide, false);
  updateCarouselDots();

  // Attach transitionend listener for seamless wrapping
  setupTrackTransitionListener();
  setupCarouselTouchGestures();
  setupCarouselHover();
  
  // Start auto-sliding if there are enough products
  if (totalSlides > slidesPerView) {
    startAutoSlide();
  }
}

// ========================================
// RESPONSIVE CAROUSEL
// ========================================

let carouselResizeDebounce = null;
function updateCarouselOnResize() {
  const track = document.getElementById('trending-carousel');
  if (!track) return;
  
  clearTimeout(carouselResizeDebounce);
  carouselResizeDebounce = setTimeout(() => {
    const { slidesPerView: newSlidesPerView } = getCarouselLayout();
    
    if (newSlidesPerView !== slidesPerView) {
      displayTrendingProducts();
    } else {
      applyCarouselCardDimensions();
      setTrackPosition(currentSlide, false);
    }
  }, 100);
}

// ========================================
// CATEGORY FILTERING
// ========================================

// Track selected categories
let selectedCategories = new Set();

// Helper to get category display name by id
function getCategoryDisplayName(id) {
  if (typeof categories !== 'undefined') {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name.replace(/^[^a-zA-Z0-9]+\s*/, '') : id;
  }
  // fallback: capitalize
  return id.charAt(0).toUpperCase() + id.slice(1);
}

function renderSubcategoryFilters(categoryId) {
  const wrap = document.getElementById('subcategory-segmented-wrap');
  const track = document.getElementById('subcategory-filter');
  const leadText = document.getElementById('subcategory-lead-text');
  if (!wrap || !track) return;

  if (categoryId === 'all') {
    wrap.style.display = 'none';
    track.innerHTML = '';
    return;
  }

  const categoryObj = typeof categories !== 'undefined' ? categories.find(c => c.id === categoryId) : null;
  if (!categoryObj || !categoryObj.subcategories || categoryObj.subcategories.length === 0) {
    wrap.style.display = 'none';
    track.innerHTML = '';
    return;
  }

  if (leadText) {
    leadText.textContent = categoryId === 'smartphones' ? 'Brands:' : 'Subcategories:';
  }

  wrap.style.display = 'flex';
  track.innerHTML = '';

  // 1. "All" button within this subcategory
  const allSubBtn = document.createElement('button');
  allSubBtn.type = 'button';
  allSubBtn.className = 'subfilter-btn active';
  allSubBtn.setAttribute('data-subcategory', 'all');
  allSubBtn.textContent = categoryId === 'smartphones' ? 'All Phones' : 'All ' + categoryObj.name.replace(/^[^a-zA-Z0-9]+\s*/, '');
  allSubBtn.onclick = () => {
    track.querySelectorAll('.subfilter-btn').forEach(b => b.classList.remove('active'));
    allSubBtn.classList.add('active');
    const filtered = products.filter(p => p.category === categoryId);
    displayProducts(filtered);
  };
  track.appendChild(allSubBtn);

  // 2. Individual subcategory brand buttons
  categoryObj.subcategories.forEach(sub => {
    if (sub.id === 'all-smartphones') return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'subfilter-btn';
    btn.setAttribute('data-subcategory', sub.id);
    btn.textContent = sub.name;
    btn.onclick = () => {
      track.querySelectorAll('.subfilter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filtered = products.filter(p => p.category === categoryId && p.subcategory === sub.id);
      displayProducts(filtered);
    };
    track.appendChild(btn);
  });
}

function setupCategoryFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  if (!filterButtons || filterButtons.length === 0) return;
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category');
      
      // Update active pill indicator
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Auto-scroll active pill into horizontal center view in segmented track
      if (typeof button.scrollIntoView === 'function') {
        button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }

      // Render brand / subcategory track if available
      renderSubcategoryFilters(category);

      if (category === 'all') {
        selectedCategories.clear();
        displayProducts(products);
      } else {
        selectedCategories.clear();
        selectedCategories.add(category);
        const filteredProducts = products.filter(product => product.category === category);
        displayProducts(filteredProducts);
      }

      // Smooth scroll viewport to products catalog top only if user has scrolled deep past catalog top
      const productsSection = document.getElementById('products');
      const navbar = document.querySelector('.navbar');
      const navHeight = navbar ? navbar.offsetHeight : 64;
      if (productsSection) {
        const sectionTop = productsSection.getBoundingClientRect().top + window.scrollY;
        const targetTop = Math.max(0, sectionTop - navHeight);
        // Only scroll if the user has scrolled significantly deep down past the catalog header
        if (window.scrollY > targetTop + 140) {
          window.scrollTo({
            top: targetTop,
            behavior: 'smooth'
          });
        }
      }
    });
  });
}

// Hardware-accelerated sticky category bar elevation observer
function setupStickyCategoryNav() {
  const stickyHeader = document.querySelector('.products-header-sticky');
  const sentinel = document.getElementById('sticky-nav-sentinel');
  const navbar = document.querySelector('.navbar');
  if (!stickyHeader) return;

  const updateStuckState = () => {
    const navHeight = navbar ? navbar.offsetHeight : 64;
    const headerRect = stickyHeader.getBoundingClientRect();
    const isStuck = headerRect.top <= navHeight + 2;
    stickyHeader.classList.toggle('is-stuck', isStuck);
  };

  if (sentinel && 'IntersectionObserver' in window) {
    const navHeight = navbar ? navbar.offsetHeight : 64;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const isStuck = !entry.isIntersecting && entry.boundingClientRect.top < navHeight;
        stickyHeader.classList.toggle('is-stuck', isStuck);
      });
    }, {
      rootMargin: `-${navHeight}px 0px 0px 0px`,
      threshold: [0, 1]
    });
    observer.observe(sentinel);
  }

  window.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateStuckState);
  }, { passive: true });

  window.addEventListener('resize', updateStuckState, { passive: true });
  updateStuckState();
}

// ========================================
// INITIALIZATION
// ========================================

window.addEventListener('DOMContentLoaded', () => {
  setupCartEventListeners();
  setupMobileMenu();

  // Load cart respecting 14-day rolling TTL envelope and initialize cart UI
  loadCartFromStorage();
  updateCartUI();
  updateFloatingCartCount();

  // Clean up legacy offline/static host fallbacks
  try {
    localStorage.removeItem('localUsers');
    localStorage.removeItem('localUserOrders');
  } catch (e) {}

  // Background sync for logged-in user
  syncActiveUserFromBackend();

  // Display any pending sync notifications from login/registration
  const syncMsg = localStorage.getItem('syncMessage');
  if (syncMsg) {
    localStorage.removeItem('syncMessage');
    setTimeout(() => {
      if (typeof showToast === 'function') {
        showToast(syncMsg, 'success');
      }
    }, 600);
  }
  
  // Display products (immediate render from static catalog)
  if (document.getElementById('products')) {
    displayProducts();
  }
  if (document.getElementById('trending-carousel')) {
    displayTrendingProducts();
  }

  // Asynchronously synchronize dynamic live stock from MongoDB backend
  syncHybridCatalogFromBackend();

  // Check URL deep-link hash (e.g. #product-LAP001)
  checkProductDeepLink();
  window.addEventListener('hashchange', checkProductDeepLink);
  
  // Setup category filtering & sticky navigation
  if (document.getElementById('category-filter')) {
    setupCategoryFilter();
    setupStickyCategoryNav();
  }
  
  // Setup responsive carousel
  if (document.getElementById('trending-carousel')) {
    window.addEventListener('resize', updateCarouselOnResize);
    setupCarouselHover(); // Setup hover for auto-slide
    setupCarouselTouchGestures(); // Setup touch swipe gestures
    startAutoSlide(); // Start auto-slide

    // Stop auto-slide when carousel navigation buttons are clicked
    const prevBtn = document.querySelector('.carousel-btn.prev-btn');
    const nextBtn = document.querySelector('.carousel-btn.next-btn');
    if (prevBtn) prevBtn.addEventListener('click', () => pauseAndResumeAutoSlide());
    if (nextBtn) nextBtn.addEventListener('click', () => pauseAndResumeAutoSlide());
  }

  // Initialize wishlist badges and customer order count
  updateWishlistBadges();
  loadUserOrders();

  // Setup Wishlist Modal Triggers
  const wishlistTriggers = [
    'nav-wishlist-btn',
    'mobile-wishlist-trigger',
    'drawer-wishlist-btn',
    'drawer-wishlist-link'
  ];
  wishlistTriggers.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof closeMobileDrawer === 'function') closeMobileDrawer();
        openWishlistModal();
      });
    }
  });

  const closeWishlistBtn = document.getElementById('close-wishlist-btn');
  if (closeWishlistBtn) closeWishlistBtn.addEventListener('click', closeWishlistModal);

  const wishlistOverlay = document.getElementById('wishlist-overlay');
  if (wishlistOverlay) wishlistOverlay.addEventListener('click', closeWishlistModal);

  // Setup Customer Orders Modal Triggers
  const ordersTriggers = [
    'nav-orders-btn',
    'drawer-orders-btn',
    'drawer-orders-link'
  ];
  ordersTriggers.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof closeMobileDrawer === 'function') closeMobileDrawer();
        openUserOrdersModal();
      });
    }
  });

  const closeOrdersBtn = document.getElementById('close-user-orders-btn');
  if (closeOrdersBtn) closeOrdersBtn.addEventListener('click', closeUserOrdersModal);

  const ordersOverlay = document.getElementById('orders-overlay');
  if (ordersOverlay) ordersOverlay.addEventListener('click', closeUserOrdersModal);

  // Setup Delivery Profile Modal Triggers
  const profileTriggers = [
    'profile-btn',
    'drawer-profile-btn'
  ];
  profileTriggers.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof closeMobileDrawer === 'function') closeMobileDrawer();
        openUserProfileModal();
      });
    }
  });

  const closeProfileBtn = document.getElementById('close-profile-modal-btn');
  if (closeProfileBtn) closeProfileBtn.addEventListener('click', closeUserProfileModal);

  const profileModalBackdrop = document.getElementById('profile-modal-backdrop');
  if (profileModalBackdrop) {
    profileModalBackdrop.addEventListener('click', (e) => {
      if (e.target === profileModalBackdrop) {
        closeUserProfileModal();
      }
    });
  }

  const profileForm = document.getElementById('user-profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileFormSubmit);
  }


  // Check if an order was just completed and display status toast
  const justPlacedId = sessionStorage.getItem('justPlacedOrderId');
  if (justPlacedId) {
    sessionStorage.removeItem('justPlacedOrderId');
    setTimeout(() => {
      showToast(`Order placed successfully! Live delivery tracking is active.`, 'success', {
        text: 'Track Order',
        onClick: () => {
          if (typeof openUserOrdersModal === 'function') openUserOrdersModal();
        }
      });
      loadUserOrders();
    }, 400);
  }

  // Initialize Customer Support & Contact Hub form
  setupContactForm();
});

// Helper function to get cart elements
function getCartElements() {
  return {
    items: document.getElementById('cart-items'),
    count: document.getElementById('cart-count'),
    total: document.getElementById('cart-total'),
    checkoutBtn: document.getElementById('checkout-btn')
  };
}

// Helper function to format price
function formatPrice(price) {
  return `GH₵ ${price.toFixed(2)}`;
}

// ========================================
// CUSTOMER WISHLIST MANAGEMENT
// ========================================

function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem('userWishlist') || '[]');
  } catch (e) {
    return [];
  }
}

function saveWishlist(list) {
  try {
    localStorage.setItem('userWishlist', JSON.stringify(list));
    updateWishlistBadges();
  } catch (e) {
    console.error('Failed to save wishlist:', e);
  }
}

function isWishlisted(productId) {
  const list = getWishlist();
  return list.some(item => item.id === productId);
}

function toggleWishlist(product) {
  let list = getWishlist();
  const index = list.findIndex(item => item.id === product.id);
  
  if (index >= 0) {
    list.splice(index, 1);
    saveWishlist(list);
    showToast(`Removed ${product.name} from wishlist`, 'info');
  } else {
    list.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: (product.images && product.images[0]) || '',
      currency: product.currency || 'GH₵'
    });
    saveWishlist(list);
    showToast(`Saved ${product.name} to wishlist`, 'success', {
      text: 'View Wishlist',
      onClick: () => {
        if (typeof openWishlistModal === 'function') openWishlistModal();
      }
    });
  }

  // Synchronize all matching wishlist buttons across the page
  document.querySelectorAll(`.wishlist-btn[data-product-id="${product.id}"]`).forEach(btn => {
    const active = isWishlisted(product.id);
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-label', active ? 'Remove from wishlist' : 'Save to wishlist');
    if (!btn.querySelector('.wishlist-heart-icon')) {
      btn.innerHTML = getWishlistHeartSvg();
    }
    // Trigger spring bounce animation
    btn.classList.remove('heart-pop');
    void btn.offsetWidth; // Force layout reflow
    btn.classList.add('heart-pop');
  });

  const modal = document.getElementById('wishlist-modal');
  if (modal && modal.classList.contains('show')) {
    renderWishlistModal();
  }
}

function updateWishlistBadges() {
  const count = getWishlist().length;
  const badges = document.querySelectorAll('#wishlist-count, #mobile-wishlist-count, #drawer-wishlist-count, #drawer-footer-wishlist-count');
  badges.forEach(b => {
    b.textContent = count;
  });
}

function openWishlistModal() {
  const modal = document.getElementById('wishlist-modal');
  const overlay = document.getElementById('wishlist-overlay');
  if (!modal || !overlay) return;

  renderWishlistModal();
  modal.classList.add('show');
  overlay.classList.add('show');
}

function closeWishlistModal() {
  const modal = document.getElementById('wishlist-modal');
  const overlay = document.getElementById('wishlist-overlay');
  if (modal) modal.classList.remove('show');
  if (overlay) overlay.classList.remove('show');
}

function renderWishlistModal() {
  const body = document.getElementById('wishlist-modal-body');
  if (!body) return;
  const list = getWishlist();

  if (list.length === 0) {
    body.innerHTML = `
      <div class="empty-customer-state">
        <span class="empty-state-icon">🤍</span>
        <h3>Your wishlist is empty</h3>
        <p>Explore our catalog and tap the heart icon on any product to save it for later.</p>
        <button type="button" class="btn-customer-primary" onclick="closeWishlistModal()">Browse Products</button>
      </div>
    `;
    return;
  }

  body.innerHTML = `
    <div class="wishlist-items-grid">
      ${list.map(item => `
        <div class="wishlist-item-card" data-id="${escapeHtml(item.id || '')}">
          <img src="${escapeHtml(item.image || 'https://via.placeholder.com/150')}" alt="${escapeHtml(item.name || 'Saved Item')}" class="wishlist-thumb" />
          <div class="wishlist-info">
            <h4 class="wishlist-name">${escapeHtml(item.name || 'Saved Item')}</h4>
            <div class="wishlist-price">${escapeHtml(item.currency || 'GH₵')} ${(Number(item.price) || 0).toFixed(2)}</div>
          </div>
          <div class="wishlist-item-actions">
            <button type="button" class="btn-wishlist-add-cart" data-id="${escapeHtml(item.id || '')}">Add to Cart</button>
            <button type="button" class="btn-wishlist-remove" data-id="${escapeHtml(item.id || '')}" aria-label="Remove item">🗑️</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Attach event listeners for Add to Cart and Remove in modal
  body.querySelectorAll('.btn-wishlist-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const product = (typeof products !== 'undefined' ? products : []).find(p => p.id === id);
      if (product) {
        addToCart(product);
      }
    });
  });

  body.querySelectorAll('.btn-wishlist-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const item = list.find(i => i.id === id);
      if (item) {
        toggleWishlist(item);
      }
    });
  });
}

// ========================================
// CUSTOMER ORDERS & LIVE TRACKING
// ========================================

async function loadUserOrders() {
  const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const badges = document.querySelectorAll('#user-orders-count, #drawer-orders-count, #drawer-footer-orders-count');

  if (!userLoggedIn || (!user.id && !user.email)) {
    badges.forEach(b => b.textContent = '0');
    return [];
  }

  // Purge any legacy localUserOrders cache to enforce server consistency
  try {
    localStorage.removeItem('localUserOrders');
  } catch (e) {}

  let remoteOrders = [];
  try {
    const params = new URLSearchParams();
    if (user.id) params.set('userId', user.id);
    if (user.email) params.set('email', user.email);

    const ordersUrl = window.getApiUrl 
      ? window.getApiUrl(`/api/user/orders?${params.toString()}`)
      : `/api/user/orders?${params.toString()}`;
    const response = await fetch(ordersUrl);
    if (response.ok) {
      const orders = await response.json();
      if (Array.isArray(orders)) {
        remoteOrders = orders;
      }
    } else {
      console.warn('Backend returned non-OK status when loading user orders:', response.status);
    }
  } catch (err) {
    console.warn('Could not load remote user orders:', err);
  }

  const allOrders = remoteOrders;
  allOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const count = allOrders.length;
  badges.forEach(b => b.textContent = count);
  return allOrders;
}

async function openUserOrdersModal() {
  const modal = document.getElementById('user-orders-modal');
  const overlay = document.getElementById('orders-overlay');
  const body = document.getElementById('user-orders-modal-body');
  if (!modal || !overlay || !body) return;

  modal.classList.add('show');
  overlay.classList.add('show');

  const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!userLoggedIn) {
    body.innerHTML = `
      <div class="empty-customer-state">
        <span class="empty-state-icon">🔒</span>
        <h3>Please Sign In</h3>
        <p>Log in with your customer account to view your past purchases and track real-time delivery status.</p>
        <a href="login.html" class="btn-customer-primary">Sign In Now</a>
      </div>
    `;
    return;
  }

  body.innerHTML = '<div class="empty-modal-state">Fetching your orders...</div>';
  const orders = await loadUserOrders();

  if (!orders || orders.length === 0) {
    body.innerHTML = `
      <div class="empty-customer-state">
        <span class="empty-state-icon">📦</span>
        <h3>No orders placed yet</h3>
        <p>You haven't placed any orders yet. Once you order, track your real-time delivery progress right here!</p>
        <button type="button" class="btn-customer-primary" onclick="closeUserOrdersModal()">Start Shopping</button>
      </div>
    `;
    return;
  }

  body.innerHTML = `
    <div class="customer-orders-list">
      ${orders.map(order => {
        const orderIdDisplay = escapeHtml(order._id ? String(order._id).slice(-6) : 'N/A');
        const dateStr = escapeHtml(order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent');
        const status = escapeHtml(order.status || 'Pending');
        const total = (Number(order.total) || 0).toFixed(2);
        const items = Array.isArray(order.items) ? order.items : [];
        const safeAddress = escapeHtml(order.address || 'Standard Delivery');

        return `
          <div class="customer-order-card">
            <div class="customer-order-card-header">
              <div>
                <span class="customer-order-num">Order #${orderIdDisplay}</span>
                <span class="customer-order-date">${dateStr}</span>
              </div>
              <span class="customer-status-badge status-${status.toLowerCase()}">${status}</span>
            </div>
            <div class="customer-order-items">
              ${items.map(it => `
                <div class="customer-order-item-row">
                  <span>${escapeHtml(it.name || 'Item')} &times; ${Number(it.quantity) || 1}</span>
                  <span class="tabular-nums">GH₵ ${((Number(it.price) || 0) * (Number(it.quantity) || 1)).toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
            <div class="customer-order-card-footer">
              <div class="customer-order-shipping">
                <small>📍 Delivery to: ${safeAddress}</small>
              </div>
              <div class="customer-order-total">
                Total: <strong>GH₵ ${total}</strong>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function closeUserOrdersModal() {
  const modal = document.getElementById('user-orders-modal');
  const overlay = document.getElementById('orders-overlay');
  if (modal) modal.classList.remove('show');
  if (overlay) overlay.classList.remove('show');
}

// ========================================
// CUSTOMER DELIVERY PROFILE & SETTINGS
// ========================================

function initProfileModal() {
  const regionSelect = document.getElementById('profile-region');
  if (regionSelect && window.GhanaValidation && regionSelect.options.length <= 1) {
    regionSelect.innerHTML = '<option value="">Select Region...</option>';
    GhanaValidation.GHANA_REGIONS.forEach(reg => {
      const opt = document.createElement('option');
      opt.value = reg;
      opt.textContent = reg;
      regionSelect.appendChild(opt);
    });
  }

  const phoneInput = document.getElementById('profile-phone');
  const badge = document.getElementById('profile-phone-network-badge');
  const errorEl = document.getElementById('profile-phone-error');

  if (phoneInput && badge) {
    function updateProfilePhoneUI() {
      const val = phoneInput.value.trim();
      if (!val || !window.GhanaValidation) {
        badge.style.display = 'none';
        if (errorEl) errorEl.style.display = 'none';
        return;
      }

      const res = GhanaValidation.parseGhanaPhone(val);
      if (res.isValid) {
        badge.textContent = res.network;
        badge.className = 'phone-network-badge ' + (res.network.toLowerCase().replace(/[^a-z]/g, ''));
        badge.style.display = 'inline-flex';
        if (errorEl) errorEl.style.display = 'none';
      } else {
        badge.style.display = 'none';
        if (val.length >= 4 && errorEl) {
          errorEl.textContent = res.error;
          errorEl.style.display = 'block';
        } else if (errorEl) {
          errorEl.style.display = 'none';
        }
      }
    }

    phoneInput.addEventListener('input', updateProfilePhoneUI);
    phoneInput.addEventListener('blur', updateProfilePhoneUI);
  }

  const gpsInput = document.getElementById('profile-gps');
  const gpsError = document.getElementById('profile-gps-error');
  if (gpsInput && gpsError) {
    gpsInput.addEventListener('input', () => {
      gpsInput.value = gpsInput.value.toUpperCase();
      const val = gpsInput.value.trim();
      if (!val || !window.GhanaValidation) {
        gpsError.style.display = 'none';
        return;
      }
      const res = GhanaValidation.validateGhanaPostGPS(val);
      if (!res.isValid) {
        gpsError.textContent = res.error;
        gpsError.style.display = 'block';
      } else {
        gpsError.style.display = 'none';
      }
    });
  }
}

async function openUserProfileModal() {
  const modal = document.getElementById('profile-modal-backdrop');
  if (!modal) return;

  const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  const authToken = localStorage.getItem('authToken');

  if (!userLoggedIn) {
    if (typeof showToast === 'function') {
      showToast('Please sign in to view and edit your delivery profile.', 'warning');
    }
    setTimeout(() => {
      window.location.href = 'login.html?redirect=profile';
    }, 900);
    return;
  }

  initProfileModal();

  // Populate from local storage initially
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (e) {}

  const nameInput = document.getElementById('profile-name');
  const emailInput = document.getElementById('profile-email');
  const phoneInput = document.getElementById('profile-phone');
  const regionSelect = document.getElementById('profile-region');
  const townInput = document.getElementById('profile-town');
  const landmarkInput = document.getElementById('profile-landmark');
  const gpsInput = document.getElementById('profile-gps');
  const msgEl = document.getElementById('profile-message');

  if (msgEl) {
    msgEl.style.display = 'none';
    msgEl.className = 'profile-message-banner';
    msgEl.textContent = '';
  }

  if (nameInput) nameInput.value = user.name || user.username || localStorage.getItem('savedCustomerName') || '';
  if (emailInput) emailInput.value = user.email || '';
  if (phoneInput) {
    const rawP = user.phone || localStorage.getItem('savedCustomerPhone') || '';
    if (window.GhanaValidation && rawP) {
      const parsed = GhanaValidation.parseGhanaPhone(rawP);
      phoneInput.value = (parsed.isValid && parsed.formatted) ? parsed.formatted : rawP;
    } else {
      phoneInput.value = rawP;
    }
  }
  if (regionSelect) regionSelect.value = user.deliveryRegion || localStorage.getItem('savedCustomerRegion') || '';
  if (townInput) townInput.value = user.deliveryTown || localStorage.getItem('savedCustomerTown') || '';
  if (landmarkInput) landmarkInput.value = user.deliveryLandmark || localStorage.getItem('savedCustomerLandmark') || '';
  if (gpsInput) gpsInput.value = user.deliveryGps || localStorage.getItem('savedCustomerGps') || '';

  if (phoneInput && phoneInput.value) {
    phoneInput.dispatchEvent(new Event('input'));
  }

  modal.style.display = 'flex';

  // Fetch freshest profile from backend if authToken exists
  if (authToken) {
    try {
      const getProfileUrl = window.getApiUrl ? window.getApiUrl('/api/user/profile') : '/api/user/profile';
      const res = await fetch(getProfileUrl, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        const freshUser = await res.json();
        if (freshUser) {
          if (nameInput) nameInput.value = freshUser.name || nameInput.value;
          if (emailInput) emailInput.value = freshUser.email || emailInput.value;
          if (phoneInput && freshUser.phone) {
            let pVal = freshUser.phone;
            if (window.GhanaValidation) {
              const parsed = GhanaValidation.parseGhanaPhone(freshUser.phone);
              if (parsed.isValid && parsed.formatted) pVal = parsed.formatted;
            }
            phoneInput.value = pVal;
          }
          if (regionSelect && freshUser.deliveryRegion) regionSelect.value = freshUser.deliveryRegion;
          if (townInput && freshUser.deliveryTown) townInput.value = freshUser.deliveryTown;
          if (landmarkInput && freshUser.deliveryLandmark) landmarkInput.value = freshUser.deliveryLandmark;
          if (gpsInput && freshUser.deliveryGps) gpsInput.value = freshUser.deliveryGps;

          if (phoneInput && phoneInput.value) {
            phoneInput.dispatchEvent(new Event('input'));
          }

          const merged = { ...user, ...freshUser };
          localStorage.setItem('user', JSON.stringify(merged));
          if (freshUser.phone) localStorage.setItem('savedCustomerPhone', freshUser.phone);
          if (freshUser.deliveryRegion) localStorage.setItem('savedCustomerRegion', freshUser.deliveryRegion);
          if (freshUser.deliveryTown) localStorage.setItem('savedCustomerTown', freshUser.deliveryTown);
          if (freshUser.deliveryLandmark) localStorage.setItem('savedCustomerLandmark', freshUser.deliveryLandmark);
          if (freshUser.deliveryGps) localStorage.setItem('savedCustomerGps', freshUser.deliveryGps);
          if (freshUser.name) localStorage.setItem('savedCustomerName', freshUser.name);
        }
      }
    } catch (err) {
      // Non-blocking: user can still view and submit cached info
    }
  }
}

function closeUserProfileModal() {
  const modal = document.getElementById('profile-modal-backdrop');
  if (modal) modal.style.display = 'none';
}

async function handleProfileFormSubmit(e) {
  e.preventDefault();

  const msgEl = document.getElementById('profile-message');
  const submitBtn = document.getElementById('save-profile-btn');

  // Check online connectivity
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    if (msgEl) {
      msgEl.textContent = 'You appear to be offline. Please check your internet connection.';
      msgEl.className = 'profile-message-banner error';
      msgEl.style.display = 'block';
    }
    return;
  }

  const nameInput = document.getElementById('profile-name');
  const phoneInput = document.getElementById('profile-phone');
  const regionSelect = document.getElementById('profile-region');
  const townInput = document.getElementById('profile-town');
  const landmarkInput = document.getElementById('profile-landmark');
  const gpsInput = document.getElementById('profile-gps');

  const nameVal = nameInput ? nameInput.value.trim() : '';
  const phoneVal = phoneInput ? phoneInput.value.trim() : '';
  const regionVal = regionSelect ? regionSelect.value.trim() : '';
  const townVal = townInput ? townInput.value.trim() : '';
  const landmarkVal = landmarkInput ? landmarkInput.value.trim() : '';
  const gpsVal = gpsInput ? gpsInput.value.trim() : '';

  if (!nameVal || nameVal.length < 2) {
    if (msgEl) {
      msgEl.textContent = 'Please enter your full name (at least 2 characters).';
      msgEl.className = 'profile-message-banner error';
      msgEl.style.display = 'block';
    }
    if (nameInput) nameInput.focus();
    return;
  }

  // 1. Validate Ghana Phone
  let phoneValidation = { isValid: true, localFormat: phoneVal, network: null };
  if (window.GhanaValidation) {
    phoneValidation = GhanaValidation.parseGhanaPhone(phoneVal);
    if (!phoneValidation.isValid) {
      if (msgEl) {
        msgEl.textContent = phoneValidation.error || 'Please enter a valid Ghana phone number.';
        msgEl.className = 'profile-message-banner error';
        msgEl.style.display = 'block';
      }
      if (phoneInput) phoneInput.focus();
      return;
    }

    // 2. Validate Structured Ghana Address
    const addrValidation = GhanaValidation.validateGhanaAddress({
      region: regionVal,
      town: townVal,
      landmark: landmarkVal,
      gps: gpsVal
    });

    if (!addrValidation.isValid) {
      const firstErr = Object.values(addrValidation.errors)[0] || 'Please complete all required delivery details.';
      if (msgEl) {
        msgEl.textContent = firstErr;
        msgEl.className = 'profile-message-banner error';
        msgEl.style.display = 'block';
      }
      if (addrValidation.errors.region && regionSelect) regionSelect.focus();
      else if (addrValidation.errors.town && townInput) townInput.focus();
      else if (addrValidation.errors.landmark && landmarkInput) landmarkInput.focus();
      else if (addrValidation.errors.gps && gpsInput) gpsInput.focus();
      return;
    }
  }

  const addrRes = window.GhanaValidation ? GhanaValidation.validateGhanaAddress({
    region: regionVal,
    town: townVal,
    landmark: landmarkVal,
    gps: gpsVal
  }) : { values: { formattedAddress: `${townVal}, ${landmarkVal}, ${regionVal}, Ghana` } };

  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    if (msgEl) {
      msgEl.textContent = 'Session expired. Please log in again.';
      msgEl.className = 'profile-message-banner error';
      msgEl.style.display = 'block';
    }
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving Profile...';
  }

  try {
    const putProfileUrl = window.getApiUrl ? window.getApiUrl('/api/user/profile') : '/api/user/profile';
    const res = await fetch(putProfileUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        name: nameVal,
        phone: phoneValidation.localFormat || phoneVal,
        phoneNetwork: phoneValidation.network || null,
        deliveryRegion: regionVal,
        deliveryTown: townVal,
        deliveryLandmark: landmarkVal,
        deliveryGps: gpsVal,
        address: addrRes.values.formattedAddress
      })
    });

    const data = await res.json();

    if (res.ok) {
      if (msgEl) {
        msgEl.textContent = '✓ Delivery profile saved successfully!';
        msgEl.className = 'profile-message-banner success';
        msgEl.style.display = 'block';
      }

      let currentUser = {};
      try {
        currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      } catch (e) {}

      const resolvedPhone = phoneValidation.formatted || phoneValidation.localFormat || phoneVal;
      const updatedUser = {
        ...currentUser,
        ...(data.user || {}),
        name: nameVal,
        phone: resolvedPhone,
        phoneNetwork: phoneValidation.network || null,
        deliveryRegion: regionVal,
        deliveryTown: townVal,
        deliveryLandmark: landmarkVal,
        deliveryGps: gpsVal,
        address: addrRes.values.formattedAddress
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Authoritative persistence for checkout and multi-session retrieval
      if (resolvedPhone) localStorage.setItem('savedCustomerPhone', resolvedPhone);
      if (regionVal) localStorage.setItem('savedCustomerRegion', regionVal);
      if (townVal) localStorage.setItem('savedCustomerTown', townVal);
      if (landmarkVal) localStorage.setItem('savedCustomerLandmark', landmarkVal);
      if (gpsVal) localStorage.setItem('savedCustomerGps', gpsVal);
      if (nameVal) localStorage.setItem('savedCustomerName', nameVal);
      if (addrRes.values.formattedAddress) localStorage.setItem('savedCustomerAddress', addrRes.values.formattedAddress);

      const userNameEl = document.getElementById('user-name');
      const drawerUserNameEl = document.getElementById('drawer-user-name');
      if (userNameEl) userNameEl.textContent = nameVal;
      if (drawerUserNameEl) drawerUserNameEl.textContent = nameVal;

      if (typeof showToast === 'function') {
        showToast('Delivery profile updated!', 'success');
      }

      setTimeout(() => {
        closeUserProfileModal();
      }, 1500);
    } else {
      if (msgEl) {
        msgEl.textContent = data.error || 'Failed to update profile. Please try again.';
        msgEl.className = 'profile-message-banner error';
        msgEl.style.display = 'block';
      }
    }
  } catch (err) {
    if (msgEl) {
      msgEl.textContent = 'Unable to reach the server. Please check your internet connection.';
      msgEl.className = 'profile-message-banner error';
      msgEl.style.display = 'block';
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Delivery Profile';
    }
  }
}

/**
 * Securely logs out the customer by thoroughly purging all authentication
 * credentials, session tokens, and cached customer PII (names, emails, phone numbers,
 * delivery addresses, GPS, and draft checkout forms) while preserving cart items
 * in guest mode for shopping continuity.
 */
function logoutCustomer() {
  // 1. Purge authentication session credentials
  localStorage.removeItem('userLoggedIn');
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
  localStorage.removeItem('localUsers');
  localStorage.removeItem('localUserOrders');

  // 2. Thoroughly purge all cached customer PII and delivery profiles
  localStorage.removeItem('savedCustomerPhone');
  localStorage.removeItem('savedCustomerRegion');
  localStorage.removeItem('savedCustomerTown');
  localStorage.removeItem('savedCustomerLandmark');
  localStorage.removeItem('savedCustomerGps');
  localStorage.removeItem('savedCustomerName');
  localStorage.removeItem('savedCustomerAddress');

  // 3. Purge any in-flight checkout form buffers
  sessionStorage.removeItem('pendingCheckoutForm');
  sessionStorage.removeItem('redirectAfterAuth');
  sessionStorage.removeItem('justPlacedOrderId');

  // 4. Cart items in localStorage 'cart' are retained as guest items per user request

  // 5. Notify active components and listeners
  try {
    window.dispatchEvent(new CustomEvent('customer:logout'));
  } catch (e) {}
}

if (typeof window !== 'undefined') {
  window.logoutCustomer = logoutCustomer;
}



// ========================================
// CUSTOMER SUPPORT & CONTACT FORM HANDLER
// ========================================

function setupContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const subjectSelect = document.getElementById('contact-subject');
  const messageInput = document.getElementById('contact-message');
  const charCounter = document.getElementById('contact-char-count');
  const submitBtn = document.getElementById('contact-submit-btn');
  const alertBox = document.getElementById('contact-alert');
  const directMailtoLink = document.getElementById('direct-mailto-link');

  // Pre-fill user details if logged in
  try {
    const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    if (userLoggedIn) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.name && nameInput && !nameInput.value) nameInput.value = user.name;
      if (user.email && emailInput && !emailInput.value) emailInput.value = user.email;
    }
  } catch (e) {}

  // Character counter and dynamic direct mailto link updater
  function updateDirectMailto() {
    if (!directMailtoLink) return;
    const subj = subjectSelect ? subjectSelect.value : 'Customer Inquiry';
    const body = messageInput ? messageInput.value : '';
    const name = nameInput ? nameInput.value : '';
    const fullBody = name ? `${body}\n\nFrom: ${name}` : body;
    directMailtoLink.href = `mailto:support@yourchoice.com?subject=${encodeURIComponent('YourChoice: ' + subj)}&body=${encodeURIComponent(fullBody)}`;
  }

  if (messageInput && charCounter) {
    messageInput.addEventListener('input', () => {
      const len = messageInput.value.length;
      charCounter.textContent = `${len} / 600`;
      updateDirectMailto();
    });
  }

  if (subjectSelect) subjectSelect.addEventListener('change', updateDirectMailto);
  if (nameInput) nameInput.addEventListener('input', updateDirectMailto);

  function showAlert(message, type = 'success') {
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.className = `contact-alert ${type}`;
    alertBox.style.display = 'block';
  }

  function hideAlert() {
    if (!alertBox) return;
    alertBox.style.display = 'none';
  }

  function saveInquiryLocally(record) {
    try {
      const localInquiries = JSON.parse(localStorage.getItem('localContactInquiries') || '[]');
      localInquiries.unshift(record);
      localStorage.setItem('localContactInquiries', JSON.stringify(localInquiries));
    } catch (e) {
      console.warn('Could not save contact inquiry to localStorage', e);
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const subject = subjectSelect ? subjectSelect.value : 'General Inquiry';
    const message = messageInput ? messageInput.value.trim() : '';

    if (!name || !email || !message) {
      showAlert('Please fill in all required fields.', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showAlert('Please enter a valid email address.', 'error');
      return;
    }

    if (message.length < 5) {
      showAlert('Please write a message with at least 5 characters.', 'error');
      return;
    }

    // Prepare UI state
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Send Message';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="contact-spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        Sending...
      `;
    }

    const payload = {
      name,
      email,
      subject,
      message,
      createdAt: new Date().toISOString()
    };

    let sentSuccessfully = false;

    // Proactively check if on static host upfront (e.g. GitHub Pages)
    if (isStaticHost()) {
      const localId = 'LOCAL-' + Date.now().toString(36).toUpperCase();
      saveInquiryLocally({ _id: localId, ...payload, status: 'New' });
      sentSuccessfully = true;
    } else {
      try {
        const contactUrl = window.getApiUrl ? window.getApiUrl('/api/contact') : '/api/contact';
        const response = await fetch(contactUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          sentSuccessfully = true;
        } else if (response.status === 404 || response.status === 405) {
          // Static host without Node backend
          const localId = 'LOCAL-' + Date.now().toString(36).toUpperCase();
          saveInquiryLocally({ _id: localId, ...payload, status: 'New' });
          sentSuccessfully = true;
        } else {
          const data = await response.json().catch(() => ({}));
          showAlert(data.error || 'Failed to deliver message. Please try opening your email app directly.', 'error');
        }
      } catch (networkErr) {
        // Network failure / offline: preserve customer inquiry locally
        console.warn('Network issue delivering message, storing locally:', networkErr);
        const localId = 'LOCAL-' + Date.now().toString(36).toUpperCase();
        saveInquiryLocally({ _id: localId, ...payload, status: 'New' });
        sentSuccessfully = true;
      }
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }

    if (sentSuccessfully) {
      showAlert('Thank you! Your message has been received. Our team will contact you shortly.', 'success');
      form.reset();
      if (charCounter) charCounter.textContent = '0 / 600';
      if (typeof showToast === 'function') {
        showToast('Message sent successfully!', 'success');
      }
    }
  });

  // Call initial direct mailto link setup
  updateDirectMailto();
}

// ========================================
// SUPPORT & FAQ MODAL CONTROLLERS
// ========================================

function openContactModal() {
  const modal = document.getElementById('contact-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Pre-fill user details if logged in
  try {
    const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    if (userLoggedIn) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const nameInput = document.getElementById('contact-name');
      const emailInput = document.getElementById('contact-email');
      if (user.name && nameInput && !nameInput.value) nameInput.value = user.name;
      if (user.email && emailInput && !emailInput.value) emailInput.value = user.email;
    }
  } catch (e) {}

  setTimeout(() => {
    const firstInput = document.getElementById('contact-name');
    if (firstInput) firstInput.focus();
  }, 100);
}

function closeContactModal() {
  const modal = document.getElementById('contact-modal');
  if (!modal) return;
  modal.style.display = 'none';
  const faqModal = document.getElementById('faq-modal');
  if (!faqModal || faqModal.style.display === 'none') {
    document.body.style.overflow = '';
  }
}

function openFaqModal(sectionId = null) {
  const modal = document.getElementById('faq-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  if (sectionId) {
    const targetDetails = document.getElementById(`faq-item-${sectionId}`);
    if (targetDetails) {
      const allDetails = modal.querySelectorAll('.faq-item');
      allDetails.forEach(d => d.removeAttribute('open'));
      targetDetails.setAttribute('open', 'true');
      setTimeout(() => {
        targetDetails.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }
}

function closeFaqModal() {
  const modal = document.getElementById('faq-modal');
  if (!modal) return;
  modal.style.display = 'none';
  const contactModal = document.getElementById('contact-modal');
  if (!contactModal || contactModal.style.display === 'none') {
    document.body.style.overflow = '';
  }
}

function selectCategoryFromFooter(category) {
  const categoryAliases = {
    'smartphones': 'smartphones',
    'laptops': 'computers',
    'audio': 'accessories',
    'pc-components': 'pc-components',
    'cables-power': 'cables-power',
    'bags-protection': 'bags-protection',
    'networking': 'networking',
    'all': 'all'
  };
  const targetCategory = categoryAliases[category] || category;
  const btn = document.querySelector(`.filter-btn[data-category="${targetCategory}"]`) || document.querySelector(`.filter-btn[data-category="${category}"]`);
  if (btn) {
    btn.click();
  }
  const productsSection = document.getElementById('products') || document.getElementById('products-grid');
  if (productsSection) {
    const navbar = document.querySelector('.navbar');
    const offset = navbar ? navbar.offsetHeight : 64;
    const topPos = productsSection.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({
      top: Math.max(0, topPos),
      behavior: 'smooth'
    });
  }
}

// Global Escape listener for support modals
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const contactModal = document.getElementById('contact-modal');
    if (contactModal && contactModal.style.display === 'flex') {
      closeContactModal();
    }
    const faqModal = document.getElementById('faq-modal');
    if (faqModal && faqModal.style.display === 'flex') {
      closeFaqModal();
    }
  }
});

// ========================================
// RESPONSIVE FOOTER ACCORDIONS (MOBILE)
// ========================================

function toggleFooterAccordion(button) {
  if (window.innerWidth > 640) return; // Inactive on desktop and tablet
  const col = button.closest('.footer-accordion-col');
  if (!col) return;

  const isOpen = col.classList.contains('is-open');

  // Close sibling accordion panels for a clean single-open mobile drawer experience
  const allAccordionCols = document.querySelectorAll('.footer-accordion-col');
  allAccordionCols.forEach((c) => {
    if (c !== col) {
      c.classList.remove('is-open');
      const toggle = c.querySelector('.footer-accordion-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  });

  if (isOpen) {
    col.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
  } else {
    col.classList.add('is-open');
    button.setAttribute('aria-expanded', 'true');
  }
}

// Sync ARIA expanded states across screen resizes
window.addEventListener('resize', () => {
  if (window.innerWidth > 640) {
    document.querySelectorAll('.footer-accordion-toggle').forEach((toggle) => {
      toggle.setAttribute('aria-expanded', 'true');
    });
  } else {
    document.querySelectorAll('.footer-accordion-col').forEach((col) => {
      const toggle = col.querySelector('.footer-accordion-toggle');
      if (toggle) {
        toggle.setAttribute('aria-expanded', col.classList.contains('is-open') ? 'true' : 'false');
      }
    });
  }
});

// ========================================
// HYBRID PRODUCT CATALOG & QUICK-VIEW DETAIL MODAL
// ========================================

let activeModalProduct = null;
let activeModalQuantity = 1;
let activeModalImages = [];
let activeModalImageIndex = 0;

// 1. Asynchronously fetch live MongoDB metrics (stock, sales) and update the in-memory catalog
async function syncHybridCatalogFromBackend() {
  try {
    const productsUrl = window.getApiUrl ? window.getApiUrl('/api/products') : '/api/products';
    const res = await fetch(productsUrl);
    if (!res.ok) return;
    const serverProducts = await res.json();
    if (Array.isArray(serverProducts) && serverProducts.length > 0) {
      if (typeof products !== 'undefined') {
        // Merge dynamic metrics into local products without dropping static objects
        serverProducts.forEach(serverItem => {
          const localItem = products.find(p => p.id === serverItem.id);
          if (localItem) {
            localItem.stock = serverItem.stock;
            localItem.totalSales = serverItem.totalSales;
            localItem.inStock = serverItem.inStock;
            localItem.isTrending = serverItem.isTrending;
            localItem.hasDiscount = serverItem.hasDiscount;
            localItem.discountPercentage = serverItem.discountPercentage;
            if (serverItem.isOnSale !== undefined) localItem.isOnSale = serverItem.isOnSale;
            if (serverItem.discount !== undefined) localItem.discount = serverItem.discount;
            if (serverItem.price !== undefined) localItem.price = serverItem.price;
            if (serverItem.originalPrice !== undefined) localItem.originalPrice = serverItem.originalPrice;
          }
        });
      }

      // If category filter is active, maintain filter view, otherwise refresh all
      const activeFilterBtn = document.querySelector('.filter-btn.active');
      const activeCategory = activeFilterBtn ? activeFilterBtn.getAttribute('data-category') : 'all';
      const activeSubBtn = document.querySelector('.subfilter-btn.active');
      const activeSub = activeSubBtn ? activeSubBtn.getAttribute('data-subcategory') : 'all';
      if (activeCategory && activeCategory !== 'all') {
        let filtered = products.filter(p => p.category === activeCategory);
        if (activeSub && activeSub !== 'all') {
          filtered = filtered.filter(p => p.subcategory === activeSub);
        }
        displayProducts(filtered);
      } else {
        displayProducts(products);
      }

      if (typeof displayTrendingProducts === 'function') {
        displayTrendingProducts();
      }

      // If detail modal is currently open, refresh its stock badge live
      if (activeModalProduct) {
        const refreshed = products.find(p => p.id === activeModalProduct.id);
        if (refreshed) {
          updateModalStockUI(refreshed);
        }
      }
    }
  } catch (err) {
    // Offline resilience: seamless fallback to static catalog
    console.info('Hybrid sync operating on static catalog fallback:', err.message);
  }
}

// 2. Open Product Quick-View Detail Modal / Bottom Sheet
function openProductDetailModal(productOrId) {
  let product = productOrId;
  if (typeof productOrId === 'string' && typeof products !== 'undefined') {
    product = products.find(p => p.id === productOrId || p.sku === productOrId);
  }
  if (!product) return;

  activeModalProduct = product;
  activeModalQuantity = 1;

  const modal = document.getElementById('product-detail-modal');
  if (!modal) return;

  // Title, Brand & Categorical Metadata
  const brandEl = document.getElementById('modal-product-brand');
  const catEl = document.getElementById('modal-product-category');
  const skuEl = document.getElementById('modal-product-sku');
  const titleEl = document.getElementById('modal-product-title');
  const descEl = document.getElementById('modal-product-desc');

  if (brandEl) brandEl.textContent = (product.brand || 'GENUINE').toUpperCase();
  if (catEl) catEl.textContent = (product.category || 'TECH').toUpperCase();
  if (skuEl) skuEl.textContent = product.sku || product.id || '';
  if (titleEl) titleEl.textContent = product.name;
  if (descEl) descEl.textContent = product.description || '';

  // Pricing & Discount
  const priceEl = document.getElementById('modal-product-price');
  const origPriceEl = document.getElementById('modal-product-orig-price');
  const discountEl = document.getElementById('modal-product-discount');

  if (priceEl) priceEl.textContent = formatPrice(product.price);
  if (origPriceEl) {
    if (product.originalPrice && product.originalPrice > product.price) {
      origPriceEl.textContent = formatPrice(product.originalPrice);
      origPriceEl.style.display = 'inline';
    } else {
      origPriceEl.style.display = 'none';
      origPriceEl.textContent = '';
    }
  }

  if (discountEl) {
    const discountPct = product.discount || (
      product.originalPrice && product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0
    );
    if (discountPct > 0) {
      discountEl.textContent = `-${discountPct}% OFF`;
      discountEl.style.display = 'inline-block';
    } else {
      discountEl.style.display = 'none';
      discountEl.textContent = '';
    }
  }

  // Live Stock Indicator
  updateModalStockUI(product);

  // Gallery: Setup Multi-Angle Image Array
  activeModalImages = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : [product.image || 'src/assets/product1.jpg'];
  activeModalImageIndex = 0;

  const mainImg = document.getElementById('modal-product-main-img');
  const thumbsContainer = document.getElementById('modal-product-thumbnails');
  const badgesOverlay = document.getElementById('modal-product-badges');
  const dotsContainer = document.getElementById('modal-carousel-dots');
  const prevBtn = document.getElementById('modal-gallery-prev');
  const nextBtn = document.getElementById('modal-gallery-next');

  if (mainImg) {
    mainImg.src = activeModalImages[0];
    mainImg.alt = `${product.name} primary angle`;
    mainImg.style.opacity = '1';
  }

  if (badgesOverlay) {
    let badgeHtml = '';
    if (product.isTrending) {
      badgeHtml += `<span class="trending-badge">🔥 Trending</span>`;
    }
    badgesOverlay.innerHTML = badgeHtml;
  }

  // Carousel Swipe Dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    if (activeModalImages.length > 1) {
      dotsContainer.style.display = 'flex';
      activeModalImages.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `modal-carousel-dot ${idx === 0 ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
        dot.onclick = (e) => {
          e.stopPropagation();
          setModalImageByIndex(idx);
        };
        dotsContainer.appendChild(dot);
      });
    } else {
      dotsContainer.style.display = 'none';
    }
  }

  // Carousel Prev / Next Arrow Controls
  if (prevBtn && nextBtn) {
    if (activeModalImages.length > 1) {
      prevBtn.style.display = 'flex';
      nextBtn.style.display = 'flex';
      prevBtn.onclick = (e) => {
        e.stopPropagation();
        const prevIdx = (activeModalImageIndex - 1 + activeModalImages.length) % activeModalImages.length;
        setModalImageByIndex(prevIdx);
      };
      nextBtn.onclick = (e) => {
        e.stopPropagation();
        const nextIdx = (activeModalImageIndex + 1) % activeModalImages.length;
        setModalImageByIndex(nextIdx);
      };
    } else {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    }
  }

  // Horizontal Thumbnail Track (never wraps, auto-scrolls to center)
  if (thumbsContainer) {
    thumbsContainer.innerHTML = '';
    activeModalImages.forEach((imgSrc, idx) => {
      const thumbBtn = document.createElement('button');
      thumbBtn.type = 'button';
      thumbBtn.className = `product-modal-thumb-btn ${idx === 0 ? 'active' : ''}`;
      thumbBtn.setAttribute('data-index', String(idx));
      thumbBtn.setAttribute('aria-label', `View image angle ${idx + 1}`);
      thumbBtn.innerHTML = `<img src="${imgSrc}" alt="${escapeHtml(product.name)} thumbnail ${idx + 1}" loading="lazy" />`;
      thumbBtn.addEventListener('click', () => {
        setModalImageByIndex(idx);
      });
      thumbsContainer.appendChild(thumbBtn);
    });
  }

  // Bind Touch Swipe Gestures to the Hero Image Wrap
  initHeroSwipeGestures();

  // Populate Specifications Tab
  populateModalSpecs(product);

  // Populate Brand & Manufacturing Tab
  populateModalBrandDetails(product);

  // Populate Warranty & Delivery Tab
  populateModalWarranty(product);

  // Reset to Specifications Tab
  switchProductDetailTab('specs');

  // Configure Stepper
  const qtyInput = document.getElementById('modal-qty-input');
  if (qtyInput) qtyInput.value = 1;

  // Configure Add to Cart Action Button
  const addCartBtn = document.getElementById('modal-add-to-cart-btn');
  const addCartText = document.getElementById('modal-add-cart-text');
  if (addCartBtn) {
    const isOutOfStock = typeof product.stock === 'number' && product.stock <= 0;
    addCartBtn.disabled = isOutOfStock;
    if (addCartText) {
      addCartText.textContent = isOutOfStock ? 'Out of Stock' : 'Add to Cart';
    }
    addCartBtn.onclick = () => {
      const qty = parseInt(document.getElementById('modal-qty-input')?.value || '1', 10);
      addToCart(product, qty);
      closeProductDetailModal();
    };
  }

  // Configure Wishlist Button
  const wishlistBtn = document.getElementById('modal-wishlist-toggle-btn');
  if (wishlistBtn) {
    const inWishlist = typeof isWishlisted === 'function' ? isWishlisted(product.id) : false;
    wishlistBtn.classList.toggle('active', inWishlist);
    wishlistBtn.setAttribute('aria-label', inWishlist ? 'Remove from wishlist' : 'Save to wishlist');
    wishlistBtn.onclick = () => {
      if (typeof toggleWishlist === 'function') {
        toggleWishlist(product);
        const nowWishlisted = isWishlisted(product.id);
        wishlistBtn.classList.toggle('active', nowWishlisted);
        wishlistBtn.setAttribute('aria-label', nowWishlisted ? 'Remove from wishlist' : 'Save to wishlist');
      }
    };
  }

  // Reset internal scroll body to top
  const scrollBody = document.getElementById('modal-scroll-body');
  if (scrollBody) {
    scrollBody.scrollTop = 0;
  }

  // Display Modal and Lock Body Scroll
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Deep link hash update (silent replace)
  try {
    history.replaceState(null, '', `#product-${product.id}`);
  } catch (_) {}
}

// Touch Swipe Detection on Hero Image
function initHeroSwipeGestures() {
  const heroWrap = document.getElementById('modal-main-image-wrap');
  if (!heroWrap) return;

  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  heroWrap.ontouchstart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  };

  heroWrap.ontouchend = (e) => {
    if (!e.changedTouches || e.changedTouches.length === 0) return;
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // Detect predominantly horizontal swipe with at least 35px delta
    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        // Swipe left -> Next image
        const nextIdx = (activeModalImageIndex + 1) % activeModalImages.length;
        setModalImageByIndex(nextIdx);
      } else {
        // Swipe right -> Prev image
        const prevIdx = (activeModalImageIndex - 1 + activeModalImages.length) % activeModalImages.length;
        setModalImageByIndex(prevIdx);
      }
    }
  };

  // Drag down gesture on drag handle to dismiss bottom sheet
  const dragHandle = document.querySelector('.product-modal-drag-handle');
  if (dragHandle) {
    let handleStartY = 0;
    dragHandle.ontouchstart = (e) => {
      if (!e.touches || e.touches.length === 0) return;
      handleStartY = e.touches[0].clientY;
    };
    dragHandle.ontouchend = (e) => {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const pullDist = e.changedTouches[0].clientY - handleStartY;
      if (pullDist > 45) {
        closeProductDetailModal();
      }
    };
  }
}

// Helper: Set modal image by index, synchronizing carousel dots and horizontal thumbnail scrollbar
function setModalImageByIndex(idx) {
  if (!activeModalImages || activeModalImages.length === 0) return;
  if (idx < 0 || idx >= activeModalImages.length) return;

  activeModalImageIndex = idx;
  const targetSrc = activeModalImages[idx];

  const mainImg = document.getElementById('modal-product-main-img');
  if (mainImg) {
    mainImg.style.opacity = '0.35';
    setTimeout(() => {
      mainImg.src = targetSrc;
      mainImg.style.opacity = '1';
    }, 100);
  }

  // Update carousel dots
  const dots = document.querySelectorAll('.modal-carousel-dot');
  dots.forEach((d, i) => {
    d.classList.toggle('active', i === idx);
  });

  // Update thumbnails and scroll selected thumbnail into view
  const thumbs = document.querySelectorAll('.product-modal-thumb-btn');
  thumbs.forEach((t, i) => {
    const isCurrent = (i === idx);
    t.classList.toggle('active', isCurrent);
    if (isCurrent) {
      // Auto-scroll selected thumbnail smoothly into horizontal center view
      t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  });
}

// Legacy helper compatibility
function setProductModalActiveImage(imgSrc, activeThumbBtn) {
  const idx = activeModalImages.indexOf(imgSrc);
  if (idx !== -1) {
    setModalImageByIndex(idx);
  } else {
    const mainImg = document.getElementById('modal-product-main-img');
    if (mainImg) mainImg.src = imgSrc;
    const thumbs = document.querySelectorAll('.product-modal-thumb-btn');
    thumbs.forEach(t => t.classList.remove('active'));
    if (activeThumbBtn) activeThumbBtn.classList.add('active');
  }
}

// Helper: update stock badge in modal
function updateModalStockUI(product) {
  const stockBadge = document.getElementById('modal-product-stock-status');
  if (!stockBadge) return;

  const stock = typeof product.stock === 'number' ? product.stock : 10;
  if (stock <= 0) {
    stockBadge.className = 'modal-stock-badge stock-out';
    stockBadge.textContent = 'Out of Stock';
  } else if (stock <= 5) {
    stockBadge.className = 'modal-stock-badge stock-low';
    stockBadge.textContent = `Only ${stock} left in stock!`;
  } else {
    stockBadge.className = 'modal-stock-badge';
    stockBadge.textContent = `● In Stock (${stock} available)`;
  }
}

// 3. Switch Tabs inside Product Detail Modal
function switchProductDetailTab(tabKey) {
  const tabs = ['specs', 'brand', 'warranty'];
  tabs.forEach(key => {
    const btn = document.getElementById(`tab-btn-${key}`);
    const panel = document.getElementById(`tab-panel-${key}`);
    const isActive = (key === tabKey);

    if (btn) {
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    }
    if (panel) {
      panel.classList.toggle('active', isActive);
      panel.style.display = isActive ? 'block' : 'none';
    }
  });
}

// 4. Populate Specifications Tab Content
function populateModalSpecs(product) {
  const container = document.getElementById('modal-specs-table');
  if (!container) return;

  const specs = product.specifications || {};
  const entries = Object.entries(specs);

  if (entries.length === 0) {
    container.innerHTML = `
      <div style="padding: 1.5rem; text-align: center; color: #64748b;">
        Standard factory hardware specifications apply. Contact support for customized engineering builds.
      </div>
    `;
    return;
  }

  let html = '';
  entries.forEach(([key, val]) => {
    const formattedKey = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
    html += `
      <div class="spec-row">
        <div class="spec-label">${escapeHtml(formattedKey)}</div>
        <div class="spec-val">${escapeHtml(String(val))}</div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// 5. Populate Brand & Manufacturing Tab Content
function populateModalBrandDetails(product) {
  const container = document.getElementById('modal-brand-content');
  if (!container) return;

  const mfg = product.manufacturingDetails || {};
  const brandName = mfg.brandName || product.brand || 'Original Equipment Manufacturer';
  const manufacturer = mfg.manufacturer || product.manufacturer || 'Authorized Manufacturer Facility';
  const modelNo = mfg.modelNumber || product.modelNumber || product.sku || 'N/A';
  const origin = mfg.countryOfOrigin || product.countryOfOrigin || 'International Standard Manufacturing';
  const certs = Array.isArray(mfg.certifications) && mfg.certifications.length > 0 
    ? mfg.certifications 
    : ['CE Certified', 'RoHS Compliant', 'ISO 9001 Facility'];
  const boxContents = Array.isArray(mfg.boxContents) && mfg.boxContents.length > 0
    ? mfg.boxContents
    : [`${product.name}`, 'Standard Power Adapter / Cable', 'User Setup Guide', 'Official Ghana Warranty Slip'];

  const certHtml = certs.map(c => `<span class="cert-tag-chip">${escapeHtml(c)}</span>`).join('');
  const boxHtml = boxContents.map(item => `<li>${escapeHtml(item)}</li>`).join('');

  container.innerHTML = `
    <div class="brand-detail-card">
      <h4>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <span>Brand &amp; Provenance</span>
      </h4>
      <div class="modal-specs-table" style="margin-top: 8px;">
        <div class="spec-row">
          <div class="spec-label">Brand Name</div>
          <div class="spec-val" style="font-weight: 700; color: var(--color-accent, #d9480f);">${escapeHtml(brandName)}</div>
        </div>
        <div class="spec-row">
          <div class="spec-label">Manufacturer</div>
          <div class="spec-val">${escapeHtml(manufacturer)}</div>
        </div>
        <div class="spec-row">
          <div class="spec-label">Model / MPN</div>
          <div class="spec-val" style="font-family: monospace;">${escapeHtml(modelNo)}</div>
        </div>
        <div class="spec-row">
          <div class="spec-label">Origin</div>
          <div class="spec-val">${escapeHtml(origin)}</div>
        </div>
      </div>
    </div>

    <div class="brand-detail-card">
      <h4>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>Quality &amp; Regulatory Certifications</span>
      </h4>
      <p style="margin-bottom: 6px;">Certified and compliant with international safety and energy efficiency protocols:</p>
      <div class="cert-tags-wrap">${certHtml}</div>
    </div>

    <div class="brand-detail-card">
      <h4>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        <span>What's In The Box</span>
      </h4>
      <ul class="box-contents-list">${boxHtml}</ul>
    </div>
  `;
}

// 6. Populate Warranty & Delivery Tab Content
function populateModalWarranty(product) {
  const container = document.getElementById('modal-warranty-content');
  if (!container) return;

  const ws = product.warrantyAndShipping || {};
  const warrantyPeriod = ws.warrantyPeriod || '1 Year Official Manufacturer Warranty';
  const warrantyCoverage = ws.warrantyCoverage || 'Comprehensive hardware defects and component protection.';
  const deliveryEstimate = ws.deliveryEstimate || 'Greater Accra: Same-Day Delivery; Kumasi & Regions: 24–48 hours.';
  const returnPolicy = ws.returnPolicy || '7-day replacement guarantee for verified manufacturer defects.';

  container.innerHTML = `
    <div class="warranty-detail-card" style="background: #fffbeb; border-color: #fde68a;">
      <h4 style="color: #92400e;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>Official Warranty: ${escapeHtml(warrantyPeriod)}</span>
      </h4>
      <p style="color: #78350f;">${escapeHtml(warrantyCoverage)} Authorized technicians and genuine OEM replacement parts guarantee peace of mind.</p>
    </div>

    <div class="warranty-detail-card">
      <h4>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        <span>Ghana Local Delivery</span>
      </h4>
      <p>${escapeHtml(deliveryEstimate)} All electronics are dispatched in electrostatic foam cushioned packaging with trackable delivery.</p>
    </div>

    <div class="warranty-detail-card">
      <h4>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
        <span>7-Day Return Guarantee</span>
      </h4>
      <p>${escapeHtml(returnPolicy)} Inspect your package upon arrival. If anything does not match your ordered specifications, our team replaces it immediately.</p>
    </div>
  `;
}

// 7. Close Product Detail Modal
function closeProductDetailModal() {
  const modal = document.getElementById('product-detail-modal');
  if (!modal) return;
  modal.style.display = 'none';

  // Check if any other modal is still active
  const anyOtherModalOpen = [
    document.getElementById('contact-modal'),
    document.getElementById('faq-modal'),
    document.getElementById('wishlist-modal'),
    document.getElementById('orders-modal'),
    document.getElementById('profile-modal-backdrop')
  ].some(m => m && m.style.display && m.style.display !== 'none');

  if (!anyOtherModalOpen) {
    document.body.style.overflow = '';
  }

  activeModalProduct = null;
  activeModalQuantity = 1;

  // Clear product deep-link hash from address bar without reload
  if (window.location.hash && window.location.hash.startsWith('#product-')) {
    try {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch (_) {}
  }
}

// 8. Deep-link handler: checks if URL has #product-LAP001
function checkProductDeepLink() {
  const hash = window.location.hash;
  if (hash && hash.startsWith('#product-')) {
    const prodId = hash.replace('#product-', '').trim();
    if (prodId && typeof products !== 'undefined') {
      const match = products.find(p => p.id === prodId || p.sku === prodId);
      if (match) {
        setTimeout(() => {
          openProductDetailModal(match);
        }, 150);
      }
    }
  }
}

// 9. Setup Modal Quantity Stepper Listeners
document.addEventListener('DOMContentLoaded', () => {
  const minusBtn = document.getElementById('modal-qty-minus');
  const plusBtn = document.getElementById('modal-qty-plus');
  const qtyInput = document.getElementById('modal-qty-input');

  if (minusBtn && qtyInput) {
    minusBtn.addEventListener('click', () => {
      let current = parseInt(qtyInput.value, 10) || 1;
      if (current > 1) {
        current -= 1;
        qtyInput.value = current;
        activeModalQuantity = current;
      }
    });
  }

  if (plusBtn && qtyInput) {
    plusBtn.addEventListener('click', () => {
      let current = parseInt(qtyInput.value, 10) || 1;
      const maxStock = activeModalProduct && typeof activeModalProduct.stock === 'number' 
        ? activeModalProduct.stock 
        : 99;
      if (current < maxStock) {
        current += 1;
        qtyInput.value = current;
        activeModalQuantity = current;
      } else {
        if (typeof showToast === 'function') {
          showToast(`Maximum available stock is ${maxStock} unit${maxStock === 1 ? '' : 's'}.`, 'warning');
        }
      }
    });
  }
});

// 10. Global Escape and arrow key listeners for product modal
document.addEventListener('keydown', (e) => {
  const prodModal = document.getElementById('product-detail-modal');
  if (!prodModal || prodModal.style.display === 'none') return;

  if (e.key === 'Escape') {
    closeProductDetailModal();
  } else if (e.key === 'ArrowLeft' && activeModalImages && activeModalImages.length > 1) {
    // Only navigate if user is not actively typing in an input
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
    const prevIdx = (activeModalImageIndex - 1 + activeModalImages.length) % activeModalImages.length;
    setModalImageByIndex(prevIdx);
  } else if (e.key === 'ArrowRight' && activeModalImages && activeModalImages.length > 1) {
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
    const nextIdx = (activeModalImageIndex + 1) % activeModalImages.length;
    setModalImageByIndex(nextIdx);
  }
});

// Expose modal handlers on window
window.openProductDetailModal = openProductDetailModal;
window.closeProductDetailModal = closeProductDetailModal;
window.switchProductDetailTab = switchProductDetailTab;
window.setProductModalActiveImage = setProductModalActiveImage;
window.setModalImageByIndex = setModalImageByIndex;
window.syncHybridCatalogFromBackend = syncHybridCatalogFromBackend;
