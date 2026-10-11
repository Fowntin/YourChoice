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

// ========================================
// ADD TO CART FUNCTION
// ========================================

function addToCart(product) {
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
    clearCartBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast('Cart is already empty', 'info');
        return;
      }
      
      if (confirm(`Are you sure you want to clear ${cart.length} item(s) from your cart?`)) {
        cart = [];
        updateCartUI();
        showToast('Cart cleared successfully', 'success');
      }
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
      if (cart.length === 0) {
        alert('Your cart is empty.');
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
  const drawerLinks = document.querySelectorAll('.drawer-link');

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

  drawerLinks.forEach(link => {
    if (!link.classList.contains('drawer-cart-link')) {
      link.addEventListener('click', closeMobileDrawer);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
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
let autoSlideDelay = 2000; // 2 seconds for faster continuous sliding

let autoSlideResumeTimeout = null;

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
  if (!track) return;
  
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
  }
  
  autoSlideInterval = setInterval(() => {
    if (currentSlide < totalSlides - slidesPerView) {
      slideCarousel('next');
    } else {
      // Seamlessly loop back to first slide
      currentSlide = 0;
      const currentTrack = document.getElementById('trending-carousel');
      if (!currentTrack) return;
      currentTrack.style.transition = 'none'; // Disable transition for instant reset
      currentTrack.style.transform = 'translateX(0)';
      
      // Re-enable transition after a brief moment
      setTimeout(() => {
        if (currentTrack) currentTrack.style.transition = 'transform 0.2s ease-in-out';
      }, 5);
      
      updateCarouselButtons();
      updateCarouselDots();
    }
  }, autoSlideDelay);
}

function stopAutoSlide() {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
    autoSlideInterval = null;
  }
}

// Update carousel hover to use pauseAndResumeAutoSlide
function setupCarouselHover() {
  document.addEventListener('mouseover', (event) => {
    if (event.target && event.target.tagName === 'BUTTON' && event.target.textContent && event.target.textContent.includes('Add to Cart')) {
      pauseAndResumeAutoSlide();
    }
  });
  document.addEventListener('mouseout', (event) => {
    if (event.target && event.target.tagName === 'BUTTON' && event.target.textContent && event.target.textContent.includes('Add to Cart')) {
      // No need to do anything here, auto-slide will resume after delay
    }
  });
}

// ========================================
// CAROUSEL FUNCTIONS
// ========================================

function slideCarousel(direction) {
  const track = document.getElementById('trending-carousel');
  if (!track) return;
  const card = track.querySelector('.product-card');
  const style = window.getComputedStyle(track);
  const gap = parseFloat(style.gap) || 0;
  const cardWidth = card ? card.offsetWidth + gap : 312; // fallback to 312 if not found

  if (direction === 'next') {
    if (currentSlide < totalSlides - slidesPerView) {
      currentSlide++;
    } else {
      // Seamlessly loop to first slide
      currentSlide = 0;
      track.style.transition = 'none';
      track.style.transform = 'translateX(0)';
      setTimeout(() => {
        if (track) track.style.transition = 'transform 0.2s ease-in-out';
      }, 5);
      updateCarouselButtons();
      updateCarouselDots();
      return;
    }
  } else if (direction === 'prev') {
    if (currentSlide > 0) {
      currentSlide--;
    } else {
      // Seamlessly loop to last slide
      currentSlide = totalSlides - slidesPerView;
      track.style.transition = 'none';
      const translateX = -currentSlide * cardWidth;
      track.style.transform = `translateX(${translateX}px)`;
      setTimeout(() => {
        if (track) track.style.transition = 'transform 0.2s ease-in-out';
      }, 5);
      updateCarouselButtons();
      updateCarouselDots();
      return;
    }
  }

  const translateX = -currentSlide * cardWidth;
  track.style.transform = `translateX(${translateX}px)`;

  updateCarouselButtons();
  updateCarouselDots();
}

function updateCarouselButtons() {
  // With infinite scrolling, buttons are never disabled
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  
  if (prevBtn) prevBtn.disabled = false;
  if (nextBtn) nextBtn.disabled = false;
}

function updateCarouselDots() {
  const dots = document.querySelectorAll('.carousel-dot');
  if (!dots || dots.length === 0) return;
  dots.forEach((dot, index) => {
    // Handle infinite scrolling for dots
    let activeIndex = currentSlide;
    if (activeIndex < 0) activeIndex = 0;
    if (activeIndex >= dots.length) activeIndex = dots.length - 1;
    
    dot.classList.toggle('active', index === activeIndex);
  });
}

function goToSlide(slideIndex) {
  const track = document.getElementById('trending-carousel');
  if (!track) return;
  const card = track.querySelector('.product-card');
  const style = window.getComputedStyle(track);
  const gap = parseFloat(style.gap) || 0;
  const cardWidth = card ? card.offsetWidth + gap : 312;

  currentSlide = slideIndex;
  const translateX = -currentSlide * cardWidth;
  track.style.transform = `translateX(${translateX}px)`;

  updateCarouselButtons();
  updateCarouselDots();
}

function createCarouselDots(totalSlides) {
  const dotsContainer = document.getElementById('carousel-dots');
  if (!dotsContainer) return;
  dotsContainer.innerHTML = '';
  
  for (let i = 0; i <= totalSlides - slidesPerView; i++) {
    const dot = document.createElement('div');
    dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }
}

// ========================================
// PRODUCT DISPLAY FUNCTIONS
// ========================================

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
  let featuresDisplay = '';
  if (product.features && product.features.length > 0) {
    featuresDisplay = '<div class="product-features">';
    product.features.slice(0, 3).forEach(feature => {
      featuresDisplay += `<span class="feature-tag">${feature}</span>`;
    });
    featuresDisplay += '</div>';
  }
  
  card.innerHTML = `
    ${badges}
    <img src="${product.images[0]}" alt="${product.name}" />
    <h3>${product.name}</h3>
    ${featuresDisplay}
    ${priceDisplay}
    ${stockInfo}
    <button onclick="addToCart({
      id: '${product.id}',
      name: '${product.name}',
      price: ${product.price},
      sku: '${product.sku}'
    })">
      Add to Cart
    </button>
  `;
  
  return card;
}

function displayProducts(productsToShow = products) {
  const productsContainer = document.getElementById('products');
  if (!productsContainer) return;
  productsContainer.innerHTML = '';
  
  if (productsToShow.length === 0) {
    productsContainer.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: #666;">
        <h3>No products found</h3>
        <p>Try selecting a different category or check back later.</p>
      </div>
    `;
    return;
  }
  
  productsToShow.forEach(product => {
    const card = createProductCard(product);
    productsContainer.appendChild(card);
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
  
  trendingProducts.forEach(product => {
    const card = createProductCard(product);
    carouselTrack.appendChild(card);
  });
  
  // Setup carousel
  totalSlides = trendingProducts.length;
  currentSlide = 0;
  
  // Calculate slides per view based on screen size
  const screenWidth = window.innerWidth;
  if (screenWidth < 768) {
    slidesPerView = 1;
  } else if (screenWidth < 1024) {
    slidesPerView = 2;
  } else if (screenWidth < 1200) {
    slidesPerView = 3;
  } else {
    slidesPerView = 4;
  }
  
  createCarouselDots(totalSlides);
  updateCarouselButtons();
  
  // Reset carousel position
  carouselTrack.style.transform = 'translateX(0)';
  
  // Start auto-sliding if there are enough products
  if (trendingProducts.length > slidesPerView) {
    startAutoSlide();
  }
}

// ========================================
// RESPONSIVE CAROUSEL
// ========================================

function updateCarouselOnResize() {
  const track = document.getElementById('trending-carousel');
  if (!track) return;
  const screenWidth = window.innerWidth;
  let newSlidesPerView = 4;
  
  if (screenWidth < 768) {
    newSlidesPerView = 1;
  } else if (screenWidth < 1024) {
    newSlidesPerView = 2;
  } else if (screenWidth < 1200) {
    newSlidesPerView = 3;
  }
  
  if (newSlidesPerView !== slidesPerView) {
    slidesPerView = newSlidesPerView;
    currentSlide = 0;
    track.style.transform = 'translateX(0)';
    createCarouselDots(totalSlides);
    updateCarouselButtons();
  }
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

function scrollToProductsWithOffset() {
  const productsSection = document.getElementById('products');
  const navbar = document.querySelector('.navbar');
  const categoryBar = document.getElementById('category-filter');
  const label = document.getElementById('category-label');
  let offset = 0;
  if (navbar) offset += navbar.offsetHeight;
  if (categoryBar) offset += categoryBar.offsetHeight;
  if (label) offset += label.offsetHeight;
  if (productsSection) {
    const top = productsSection.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

function setupCategoryFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  if (!filterButtons || filterButtons.length === 0) return;
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category');
      
      if (category === 'all') {
        // Clear all selections and show all products
        selectedCategories.clear();
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        displayProducts();
      } else {
        // Remove 'all' from active state
        const allButton = document.querySelector('.filter-btn[data-category="all"]');
        if (allButton) allButton.classList.remove('active');
        
        // Toggle the clicked category
        if (selectedCategories.has(category)) {
          selectedCategories.delete(category);
          button.classList.remove('active');
        } else {
          selectedCategories.add(category);
          button.classList.add('active');
        }
        
        // If no categories selected, show all products
        if (selectedCategories.size === 0) {
          if (allButton) allButton.classList.add('active');
          displayProducts();
        } else {
          // Filter products by selected categories
          const filteredProducts = getProductsByMultipleCategories(Array.from(selectedCategories));
          displayProducts(filteredProducts);
        }
      }
      // Use offset scroll for better UX
      scrollToProductsWithOffset();
    });
  });
}

function getProductsByMultipleCategories(categories) {
  return products.filter(product => categories.includes(product.category));
}

// ========================================
// CATEGORY TOGGLE FUNCTION
// ========================================

function toggleCategories() {
  const categoryFilter = document.getElementById('category-filter');
  const floatingToggleBtn = document.getElementById('floating-toggle-btn');
  if (!categoryFilter) return;
  const isHidden = categoryFilter.classList.contains('hidden');
  
  if (isHidden) {
    categoryFilter.classList.remove('hidden');
    if (floatingToggleBtn) floatingToggleBtn.classList.remove('show');
    localStorage.setItem('categoriesHidden', 'false');
  } else {
    categoryFilter.classList.add('hidden');
    if (floatingToggleBtn) floatingToggleBtn.classList.add('show');
    localStorage.setItem('categoriesHidden', 'true');
  }
}

function initializeCategoryVisibility() {
  const categoryFilter = document.getElementById('category-filter');
  const floatingToggleBtn = document.getElementById('floating-toggle-btn');
  if (!categoryFilter) return;
  const categoriesHidden = localStorage.getItem('categoriesHidden');
  
  if (categoriesHidden === 'true') {
    categoryFilter.classList.add('hidden');
    if (floatingToggleBtn) floatingToggleBtn.classList.add('show');
  }
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
  
  // Setup category filtering
  if (document.getElementById('category-filter')) {
    setupCategoryFilter();
    initializeCategoryVisibility();
  }
  
  // Setup responsive carousel
  if (document.getElementById('trending-carousel')) {
    window.addEventListener('resize', updateCarouselOnResize);
    setupCarouselHover(); // Setup hover for auto-slide
    startAutoSlide(); // Start auto-slide

    // Stop auto-slide when carousel navigation buttons are clicked
    const prevBtn = document.querySelector('.carousel-btn.prev-btn');
    const nextBtn = document.querySelector('.carousel-btn.next-btn');
    if (prevBtn) prevBtn.addEventListener('click', () => pauseAndResumeAutoSlide());
    if (nextBtn) nextBtn.addEventListener('click', () => pauseAndResumeAutoSlide());
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


