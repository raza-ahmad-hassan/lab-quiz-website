/**
 * PulseFit Pro - Shared JavaScript
 * Features: Mobile Navigation, Auto-Asset Discovery, Customizer State, Form Validation, Order Simulation
 * Designed for CIT331 E-Commerce Lab Quiz (Raza Ahmad, 24l-0006)
 */

document.addEventListener('DOMContentLoaded', function () {
  initMobileNav();
  initAssetAutoDiscovery();
  initCheckoutCartState();
});

/* --------------------------------------------------------------------------
   1. Mobile Navigation Drawer Toggle
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const drawer = document.querySelector('.mobile-nav-drawer');

  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', function () {
      const isOpen = drawer.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', isOpen);
    });
  }
}

/* --------------------------------------------------------------------------
   2. Intelligent Multi-Path Customer Asset Auto-Discovery
   Checks both ./assets/ and root ./ for user-uploaded images in multiple formats
   -------------------------------------------------------------------------- */
const candidateImagePaths = [
  'assets/hero.png',
  'assets/hero.jpg',
  'assets/hero.jpeg',
  'assets/hero.webp',
  'assets/product.png',
  'assets/product.jpg',
  'assets/product.jpeg',
  'assets/product.webp',
  'assets/watch.png',
  'assets/watch.jpg',
  'assets/1.png',
  'assets/1.jpg',
  'assets/2.png',
  'assets/2.jpg',
  'hero.png',
  'hero.jpg',
  'hero.jpeg',
  'hero.webp',
  'product.png',
  'product.jpg',
  'product.jpeg',
  'product.webp',
  'watch.png',
  'watch.jpg',
  'smartwatch.png',
  'smartwatch.jpg',
  '1.png',
  '1.jpg',
  '2.png',
  '2.jpg',
  'image.png',
  'image.jpg',
  'photo.png',
  'photo.jpg'
];

function initAssetAutoDiscovery() {
  const heroImg = document.getElementById('hero-asset-img');
  const productImg = document.getElementById('main-product-img');
  const cartImg = document.getElementById('cart-item-img');

  if (!heroImg && !productImg && !cartImg) return;

  tryLoadFirstAvailableImage(candidateImagePaths, function (discoveredSrc) {
    if (discoveredSrc) {
      if (heroImg) {
        heroImg.src = discoveredSrc;
        heroImg.style.display = 'block';
        const heroVector = document.getElementById('hero-vector-frame');
        if (heroVector) heroVector.style.display = 'none';
      }
      if (productImg) {
        productImg.src = discoveredSrc;
        productImg.style.display = 'block';
        const prodVector = document.getElementById('product-vector-fallback');
        if (prodVector) prodVector.style.display = 'none';
      }
      if (cartImg) {
        cartImg.src = discoveredSrc;
      }
    }
  });
}

function tryLoadFirstAvailableImage(paths, callback, index = 0) {
  if (index >= paths.length) {
    callback(null);
    return;
  }
  const testImg = new Image();
  testImg.onload = function () {
    callback(paths[index]);
  };
  testImg.onerror = function () {
    tryLoadFirstAvailableImage(paths, callback, index + 1);
  };
  testImg.src = paths[index];
}

/* --------------------------------------------------------------------------
   3. Product Specs & Customizer Logic (product.html)
   -------------------------------------------------------------------------- */
const productState = {
  basePrice: 299.00,
  strapPrice: 0.00,
  finish: 'Midnight Slate',
  strap: 'Fluoroelastomer Sport',
  shippingCost: 0.00,
  discount: 0.00
};

function selectFinish(finishName, colorCode1, colorCode2) {
  productState.finish = finishName;
  const finishLabel = document.getElementById('selected-finish-name');
  if (finishLabel) finishLabel.textContent = finishName;

  // Update active state in UI
  document.querySelectorAll('.finish-swatch-item').forEach(item => {
    item.classList.remove('active');
    const circle = item.querySelector('.finish-circle');
    if (circle) circle.style.borderColor = 'transparent';
  });

  if (window.event && window.event.currentTarget) {
    const activeItem = window.event.currentTarget;
    activeItem.classList.add('active');
    const circle = activeItem.querySelector('.finish-circle');
    if (circle) circle.style.borderColor = 'var(--color-mint-400)';
  }

  // Update vector watch colors if fallback is active
  const vectorCase = document.getElementById('product-vector-case');
  if (vectorCase) {
    vectorCase.style.background = `linear-gradient(145deg, ${colorCode1}, ${colorCode2})`;
  }

  saveProductToCart();
}

function selectStrap(strapName, additionalPrice) {
  productState.strap = strapName;
  productState.strapPrice = additionalPrice;

  const strapLabel = document.getElementById('selected-strap-name');
  if (strapLabel) {
    strapLabel.textContent = `${strapName} (+ $${additionalPrice})`;
  }

  document.querySelectorAll('.strap-options .strap-pill').forEach(pill => {
    pill.classList.remove('active');
  });

  if (window.event && window.event.currentTarget) {
    window.event.currentTarget.classList.add('active');
  }

  updateProductPriceDisplay();
  saveProductToCart();
}

function updateProductPriceDisplay() {
  const priceDisplay = document.getElementById('product-price-display');
  if (priceDisplay) {
    const total = productState.basePrice + productState.strapPrice;
    priceDisplay.textContent = `$${total.toFixed(2)}`;
  }
}

function switchProductView(view) {
  document.querySelectorAll('.thumbnail-pill').forEach(btn => btn.classList.remove('active'));
  if (window.event && window.event.currentTarget) {
    window.event.currentTarget.classList.add('active');
  }

  const img = document.getElementById('main-product-img');
  if (img) {
    img.style.transition = 'transform 0.3s ease';
    if (view === 'side') {
      img.style.transform = 'rotateY(40deg) scale(0.95)';
    } else if (view === 'sensors') {
      img.style.transform = 'rotate(180deg) scale(0.95)';
    } else if (view === 'box') {
      img.style.transform = 'scale(0.85)';
    } else {
      img.style.transform = 'none';
    }
  }
}

function saveProductToCart() {
  try {
    localStorage.setItem('pulsefit_cart', JSON.stringify({
      title: 'PulseFit Pro',
      finish: productState.finish,
      strap: productState.strap,
      basePrice: productState.basePrice,
      strapPrice: productState.strapPrice,
      totalItemPrice: productState.basePrice + productState.strapPrice
    }));
  } catch (e) {
    console.warn('localStorage unavailable', e);
  }
}

function handleAddToCartAndCheckout() {
  saveProductToCart();
  window.location.href = 'order.html';
}

/* --------------------------------------------------------------------------
   4. Checkout Page & Summary Calculations (order.html)
   -------------------------------------------------------------------------- */
function initCheckoutCartState() {
  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryFinalTotal = document.getElementById('summary-final-total');
  const variantLabel = document.getElementById('cart-variant-label');
  const itemPriceDisplay = document.getElementById('cart-item-price-display');
  const strapCostDisplay = document.getElementById('summary-strap-cost');

  if (!summarySubtotal) return;

  try {
    const saved = localStorage.getItem('pulsefit_cart');
    if (saved) {
      const data = JSON.parse(saved);
      productState.finish = data.finish || 'Midnight Slate';
      productState.strap = data.strap || 'Fluoroelastomer Sport';
      productState.strapPrice = data.strapPrice || 0;
      if (variantLabel) {
        variantLabel.textContent = `Finish: ${productState.finish} • ${productState.strap}`;
      }
      if (strapCostDisplay) {
        strapCostDisplay.textContent = `$${productState.strapPrice.toFixed(2)}`;
      }
      if (itemPriceDisplay) {
        itemPriceDisplay.textContent = `$${(productState.basePrice + productState.strapPrice).toFixed(2)}`;
      }
    }
  } catch (e) {
    console.warn('Could not read cart', e);
  }

  recalculateOrderTotal();
}

function selectShippingMethod(cost, element) {
  productState.shippingCost = cost;
  document.querySelectorAll('.shipping-radio-box').forEach(box => box.classList.remove('active'));
  if (element) {
    element.classList.add('active');
    const radio = element.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  }

  const shippingDisplay = document.getElementById('summary-shipping');
  if (shippingDisplay) {
    shippingDisplay.textContent = cost === 0 ? 'FREE' : `+$${cost.toFixed(2)}`;
    shippingDisplay.style.color = cost === 0 ? 'var(--color-mint-400)' : 'var(--color-white)';
  }

  recalculateOrderTotal();
}

function applyCouponCode() {
  const input = document.getElementById('coupon-code-input');
  const msg = document.getElementById('coupon-msg');
  if (!input || !msg) return;

  const code = input.value.trim().toUpperCase();
  msg.style.display = 'block';

  if (code === 'LAUNCH50') {
    productState.discount = 50.00;
    msg.style.color = 'var(--color-mint-400)';
    msg.textContent = '✓ $50 Launch Discount applied!';
    showDiscountRow(50.00);
  } else if (code === 'PULSE20') {
    const sub = productState.basePrice + productState.strapPrice;
    const discount = sub * 0.20;
    productState.discount = discount;
    msg.style.color = 'var(--color-mint-400)';
    msg.textContent = `✓ 20% Discount (-$${discount.toFixed(2)}) applied!`;
    showDiscountRow(discount);
  } else if (code === '') {
    msg.style.color = 'var(--color-red-500)';
    msg.textContent = 'Please enter a valid coupon code.';
  } else {
    productState.discount = 0.00;
    msg.style.color = 'var(--color-red-500)';
    msg.textContent = 'Invalid promo code. Try "LAUNCH50".';
    hideDiscountRow();
  }

  recalculateOrderTotal();
}

function showDiscountRow(amount) {
  const row = document.getElementById('summary-discount-row');
  const val = document.getElementById('summary-discount-val');
  if (row && val) {
    row.style.display = 'flex';
    val.textContent = `-$${amount.toFixed(2)}`;
  }
}

function hideDiscountRow() {
  const row = document.getElementById('summary-discount-row');
  if (row) row.style.display = 'none';
}

function recalculateOrderTotal() {
  const total = Math.max(0, productState.basePrice + productState.strapPrice + productState.shippingCost - productState.discount);
  const finalDisplay = document.getElementById('summary-final-total');
  if (finalDisplay) {
    finalDisplay.textContent = `$${total.toFixed(2)}`;
  }
}

/* --------------------------------------------------------------------------
   5. Card Input Masking & Utilities
   -------------------------------------------------------------------------- */
function formatCardNumber(input) {
  let val = input.value.replace(/\D/g, '');
  val = val.substring(0, 16);
  const parts = [];
  for (let i = 0; i < val.length; i += 4) {
    parts.push(val.substring(i, i + 4));
  }
  input.value = parts.join(' ');
}

function formatExpiry(input) {
  let val = input.value.replace(/\D/g, '');
  if (val.length >= 2) {
    input.value = val.substring(0, 2) + '/' + val.substring(2, 4);
  } else {
    input.value = val;
  }
}

/* --------------------------------------------------------------------------
   6. Form Validation & Order Confirmation Modal
   -------------------------------------------------------------------------- */
function handleCheckoutSubmit(e) {
  e.preventDefault();

  const requiredFields = [
    { id: 'first-name', fieldId: 'field-first-name' },
    { id: 'last-name', fieldId: 'field-last-name' },
    { id: 'email', fieldId: 'field-email', validate: (v) => /\S+@\S+\.\S+/.test(v) },
    { id: 'phone', fieldId: 'field-phone' },
    { id: 'address', fieldId: 'field-address' },
    { id: 'city', fieldId: 'field-city' },
    { id: 'state', fieldId: 'field-state' },
    { id: 'postal-code', fieldId: 'field-postal-code' },
    { id: 'card-number', fieldId: 'field-card-number', validate: (v) => v.replace(/\s/g, '').length >= 15 },
    { id: 'card-name', fieldId: 'field-card-name' },
    { id: 'card-exp', fieldId: 'field-card-exp', validate: (v) => /^\d{2}\/\d{2}$/.test(v) },
    { id: 'card-cvv', fieldId: 'field-card-cvv', validate: (v) => v.length >= 3 }
  ];

  let isValid = true;
  let firstInvalid = null;

  requiredFields.forEach(item => {
    const input = document.getElementById(item.id);
    const fieldContainer = document.getElementById(item.fieldId);
    if (!input || !fieldContainer) return;

    let fieldValid = input.value.trim().length > 0;
    if (fieldValid && item.validate) {
      fieldValid = item.validate(input.value.trim());
    }

    if (!fieldValid) {
      isValid = false;
      fieldContainer.classList.add('has-error');
      input.classList.add('is-invalid');
      if (!firstInvalid) firstInvalid = input;
    } else {
      fieldContainer.classList.remove('has-error');
      input.classList.remove('is-invalid');
    }
  });

  if (!isValid) {
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  // Populate Modal
  const firstName = document.getElementById('first-name').value.trim();
  const modalName = document.getElementById('modal-customer-name');
  if (modalName) modalName.textContent = firstName || 'Customer';

  const orderIdSpan = document.getElementById('modal-order-id');
  const randomRef = 'PF-' + Math.floor(10000 + Math.random() * 90000);
  if (orderIdSpan) orderIdSpan.textContent = randomRef;

  const totalAmount = document.getElementById('summary-final-total');
  const modalAmount = document.getElementById('modal-amount-paid');
  if (totalAmount && modalAmount) {
    modalAmount.textContent = totalAmount.textContent;
  }

  const modalProduct = document.getElementById('modal-product-summary');
  if (modalProduct) {
    modalProduct.textContent = `PulseFit Pro (${productState.finish}, ${productState.strap})`;
  }

  // Show Modal
  const modal = document.getElementById('confirmation-modal');
  if (modal) {
    modal.classList.add('active');
  }

  // Clear cart after checkout
  try {
    localStorage.removeItem('pulsefit_cart');
  } catch (e) {}
}
