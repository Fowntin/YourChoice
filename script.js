// ========================================
// CART MANAGEMENT FUNCTIONS
// ========================================

let cart = [];  // Initialize cart as an empty array        

// ========================================
// SHOW TOAST FUNCTION
// ========================================

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast show ${type}`; // Add type class

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
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
    showToast(`${product.name} added to cart`, 'success');
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
    elements.items.innerHTML = '<li class="empty-cart">Your cart is empty.</li>';
    elements.count.textContent = '0';
    elements.total.textContent = formatPrice(0);
    updateCartCountBadges(0);
    updateFloatingCartCount();
    saveCartToStorage();
    
    // Update button states
    updateButtonStates();
    
    // Hide the cart modal and overlay if the cart is empty
    const cartEl = document.getElementById('cart');
    const overlay = document.getElementById('cart-overlay');
    if (cartEl) cartEl.classList.remove('show');
    if (overlay) overlay.classList.remove('show');

    return; // exit early if empty
  }

  cart.forEach((item, index) => {
    total += item.price * item.quantity;
    itemCount += item.quantity;

    const li = document.createElement('li');
    li.className = 'cart-item';

    li.innerHTML = `
      <span class="item-name">${item.name}</span>
      <div class="quantity-controls">
        <button class="decrease-qty" data-index="${index}" aria-label="Decrease quantity of ${item.name}">➖</button>
        <span>${item.quantity}</span>
        <button class="increase-qty" data-index="${index}" aria-label="Increase quantity of ${item.name}">➕</button>
      </div>
      <span class="item-price">${formatPrice(item.price * item.quantity)}</span>
      <button class="remove-btn" data-index="${index}" aria-label="Remove ${item.name} from cart">🗑️</button>
    `;
    elements.items.appendChild(li);
  });

  // Update cart totals
  elements.count.textContent = itemCount;
  elements.total.textContent = formatPrice(total);
  updateCartCountBadges(itemCount);

  // Update button states
  updateButtonStates();
  
  // Update floating cart
  updateFloatingCartCount();
  
  // Save cart to localStorage
  saveCartToStorage();
}

function updateCartCountBadges(count) {
  const badges = document.querySelectorAll('.cart-count, .mobile-cart-count, .drawer-cart-count, #cart-count, #floating-cart-count');
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
// SAVE CART TO LOCAL STORAGE FUNCTION
// ========================================

function saveCartToStorage() {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    handleError(error, 'cart saving');
    // Optionally, you could implement a fallback storage method
  }
}

function toggleCartView() {
  const cartEl = document.getElementById('cart');
  const overlay = document.getElementById('cart-overlay');
  if (!cartEl || !overlay) return;
  
  if (cartEl.classList.contains('show')) {
    // Closing cart
    cartEl.classList.remove('show');
    overlay.classList.remove('show');
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  } else {
    // Opening cart
    lastFocusedElement = document.activeElement;
    cartEl.classList.add('show');
    overlay.classList.add('show');
    // Focus the first focusable element in the cart
    const firstFocusable = cartEl.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }
}

let lastFocusedElement = null;

function setupCartEventListeners() {
  const cartToggleLinks = document.querySelectorAll('a[href="#"], a[href="#cart"], .nav-cart-link');
  cartToggleLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      toggleCartView();
    });
  });

  const mobileCartTrigger = document.getElementById('mobile-cart-trigger');
  if (mobileCartTrigger) {
    mobileCartTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      toggleCartView();
    });
  }

  const drawerCartLink = document.getElementById('drawer-cart-link');
  if (drawerCartLink) {
    drawerCartLink.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileDrawer();
      toggleCartView();
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
      const target = event.target;
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
      const target = event.target;
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
  document.body.style.overflow = 'hidden';
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
  document.body.style.overflow = '';
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
    if (!link.classList.contains('nav-cart-link') && !link.classList.contains('nav-btn-link')) {
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
    gridContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #666;">
        <h3 style="font-size: 1.2rem; color: #333; margin-bottom: 0.5rem;">No products found</h3>
        <p style="font-size: 0.95rem;">Try selecting a different category tab above.</p>
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

      // Smooth scroll viewport to products top if already scrolled past or docked
      const stickyHeader = document.querySelector('.products-header-sticky');
      const navbar = document.querySelector('.navbar');
      const navHeight = navbar ? navbar.offsetHeight : 64;
      if (stickyHeader) {
        const rect = stickyHeader.getBoundingClientRect();
        if (rect.top <= navHeight + 8) {
          const targetTop = window.scrollY + rect.top - navHeight;
          window.scrollTo({
            top: Math.max(0, targetTop),
            behavior: 'smooth'
          });
        }
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
    });
  });
}

// ========================================
// INITIALIZATION
// ========================================

window.addEventListener('DOMContentLoaded', () => {
  setupCartEventListeners();
  setupMobileMenu();

  // Load cart from localStorage
  try {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      
      if (Array.isArray(parsedCart)) {
        const validCart = parsedCart.filter(item => 
          item && 
          item.name && 
          typeof item.price === 'number' && 
          item.price > 0 && 
          typeof item.quantity === 'number' && 
          item.quantity > 0
        );
        
        cart = validCart;
        updateCartUI();
        updateFloatingCartCount(); // Initialize floating cart
        
        if (validCart.length !== parsedCart.length) {
          showToast(`${parsedCart.length - validCart.length} invalid items were removed from your cart`, 'warning');
        }
      } else {
        throw new Error('Cart is not an array');
      }
    }
  } catch (error) {
    handleError(error, 'cart loading');
    cart = [];
    localStorage.removeItem('cart');
    updateCartUI();
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

  // Check if an order was just completed and display status toast
  const justPlacedId = sessionStorage.getItem('justPlacedOrderId');
  if (justPlacedId) {
    sessionStorage.removeItem('justPlacedOrderId');
    setTimeout(() => {
      showToast(`Order placed! Tap "📦 Orders" to track live delivery.`, 'success');
      loadUserOrders();
    }, 400);
  }
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
    showToast(`Saved ${product.name} to wishlist ❤️`, 'success');
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
        <div class="wishlist-item-card" data-id="${item.id}">
          <img src="${item.image || 'https://via.placeholder.com/150'}" alt="${item.name}" class="wishlist-thumb" />
          <div class="wishlist-info">
            <h4 class="wishlist-name">${item.name}</h4>
            <div class="wishlist-price">${item.currency || 'GH₵'} ${(Number(item.price) || 0).toFixed(2)}</div>
          </div>
          <div class="wishlist-item-actions">
            <button type="button" class="btn-wishlist-add-cart" data-id="${item.id}">Add to Cart</button>
            <button type="button" class="btn-wishlist-remove" data-id="${item.id}" aria-label="Remove item">🗑️</button>
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
        showToast(`Moved ${product.name} to cart!`, 'success');
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

  try {
    const params = new URLSearchParams();
    if (user.id) params.set('userId', user.id);
    if (user.email) params.set('email', user.email);

    const response = await fetch(`/api/user/orders?${params.toString()}`);
    if (response.ok) {
      const orders = await response.json();
      const count = Array.isArray(orders) ? orders.length : 0;
      badges.forEach(b => b.textContent = count);
      return orders;
    }
  } catch (err) {
    console.warn('Could not load user orders:', err);
  }
  return [];
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
        const orderIdDisplay = order._id ? order._id.slice(-6) : 'N/A';
        const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent';
        const status = order.status || 'Pending';
        const total = (Number(order.total) || 0).toFixed(2);
        const items = order.items || [];

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
                  <span>${it.name} &times; ${it.quantity}</span>
                  <span class="tabular-nums">GH₵ ${((it.price || 0) * (it.quantity || 1)).toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
            <div class="customer-order-card-footer">
              <div class="customer-order-shipping">
                <small>📍 Delivery to: ${order.address || 'Standard Delivery'}</small>
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


