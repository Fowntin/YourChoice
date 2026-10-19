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

function addToCart(productOrId) {
  let product = productOrId;
  if (typeof productOrId === 'string' && typeof products !== 'undefined') {
    product = products.find(p => p.id === productOrId);
  }

  // Validate product data
  if (!product || !product.name || typeof product.price !== 'number' || product.price <= 0) {
    showToast('Invalid product data', 'error');
    return;
  }

  showProcessingState();
  
  setTimeout(() => {
    const existing = cart.find(item => item.name === product.name);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    updateCartUI();
    updateFloatingCartCount(); // Update floating cart
    hideProcessingState();
    showToast(`${product.name} added to cart`, 'success', {
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

// Helper to detect static hosting environments (e.g., GitHub Pages)
function isStaticHost() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname || '';
  return host.endsWith('github.io') || window.location.protocol === 'file:';
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
      await fetch('/api/user/cart-wishlist', {
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
    const res = await fetch(`/api/user/cart-wishlist?userId=${encodeURIComponent(user.id || '')}&email=${encodeURIComponent(user.email || '')}`);
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

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
      closeMobileDrawer();
    }
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
    gap = isTablet ? 20 : 32;
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
  
  // Create badges
  let badges = '';
  if (product.isOnSale && product.discount > 0) {
    badges += `<div class="discount">-${product.discount}%</div>`;
  }
  if (product.isTrending) {
    badges += `<div class="trending-badge">🔥 Trending</div>`;
  }
  
  // Create price display
  let priceDisplay = '';
  if (product.isOnSale && product.originalPrice > product.price) {
    priceDisplay = `
      <span class="original-price">${product.currency} ${product.originalPrice.toFixed(2)}</span>
      <span class="price">${product.currency} ${product.price.toFixed(2)}</span>
    `;
  } else {
    priceDisplay = `<span class="price">${product.currency} ${product.price.toFixed(2)}</span>`;
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
  
  // Create features display
  let featuresDisplay = '<div class="product-features empty" aria-hidden="true"></div>';
  if (product.features && product.features.length > 0) {
    featuresDisplay = '<div class="product-features">';
    product.features.slice(0, 3).forEach(feature => {
      featuresDisplay += `<span class="feature-tag">${feature}</span>`;
    });
    featuresDisplay += '</div>';
  }
  
  const inWishlist = typeof isWishlisted === 'function' ? isWishlisted(product.id) : false;
  card.innerHTML = `
    <div class="product-card-header">
      <div class="product-badges">${badges}</div>
      <button type="button" class="wishlist-btn ${inWishlist ? 'active' : ''}" data-product-id="${product.id}" aria-label="${inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}">
        ${getWishlistHeartSvg()}
      </button>
    </div>
    <div class="product-image-wrap">
      <img src="${product.images[0]}" alt="${product.name}" loading="lazy" />
    </div>
    <div class="product-card-body">
      <h3>${product.name}</h3>
      ${featuresDisplay}
      <div class="product-price-row">${priceDisplay}</div>
      ${stockInfo}
    </div>
    <button type="button" class="add-to-cart-btn" data-product-id="${product.id}">
      Add to Cart
    </button>
  `;
  
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

      if (category === 'all') {
        selectedCategories.clear();
        displayProducts(products);
      } else {
        selectedCategories.clear();
        selectedCategories.add(category);
        const filteredProducts = products.filter(product => product.category === category);
        displayProducts(filteredProducts);
      }

      // Smooth scroll viewport to products catalog top if already scrolled past or docked
      const productsSection = document.getElementById('products');
      const navbar = document.querySelector('.navbar');
      const navHeight = navbar ? navbar.offsetHeight : 64;
      if (productsSection) {
        const sectionTop = productsSection.getBoundingClientRect().top + window.scrollY;
        const targetTop = Math.max(0, sectionTop - navHeight);
        // Only scroll if the user has scrolled down into the products catalog
        if (window.scrollY > targetTop + 8) {
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
  
  // Display products
  if (document.getElementById('products')) {
    displayProducts();
  }
  if (document.getElementById('trending-carousel')) {
    displayTrendingProducts();
  }
  
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

    const response = await fetch(`/api/user/orders?${params.toString()}`);
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
      const res = await fetch('/api/user/profile', {
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
    const res = await fetch('/api/user/profile', {
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
        const response = await fetch('/api/contact', {
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
    'smartphones': 'computers',
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
