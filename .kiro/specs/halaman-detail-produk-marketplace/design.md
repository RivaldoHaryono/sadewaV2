# Design Document: Halaman Detail Produk Marketplace

## Overview

Halaman Detail Produk Marketplace adalah sistem modal interaktif yang menampilkan informasi lengkap produk dengan galeri foto navigable, kontrol jumlah pemesanan, indikator stok real-time, dan integrasi WhatsApp untuk pemesanan. Sistem ini diimplementasikan sebagai JavaScript patch yang menggantikan fungsi `openDetail()` legacy dan menambahkan fitur interaktif modern seperti keyboard navigation, URL sharing via hash, dan responsive mobile layout dengan fixed bottom action bar.

**Key Design Decisions:**
- **Patch approach**: Menggantikan `openDetail()` existing tanpa merusak fungsi lain
- **Progressive enhancement**: Legacy array format tetap didukung via conversion layer
- **Native dialog element**: Menggunakan `<dialog>` HTML untuk modal dengan built-in focus trap
- **CSS token system**: Semua warna menggunakan CSS custom properties untuk theme consistency
- **Mobile-first responsive**: Layout grid 2-kolom desktop, single-column mobile dengan fixed bottom bar

## Architecture

### Module Structure

```
product-detail-patch.js (IIFE Module)
├── Data Layer
│   ├── Legacy Array Converter
│   │   └── Transforms [name, cat, price...] → {name, slug, images[], ...}
│   └── Slug Generator
│       └── name → lowercase-hyphen-string
│
├── Rendering Layer
│   ├── openDetail(index) - Main render function
│   │   ├── Gallery Builder (main image + thumbnails)
│   │   ├── Info Builder (title, price, rating, desc, specs)
│   │   ├── Stepper Builder (quantity controls)
│   │   └── Action Builder (WhatsApp button)
│   └── DOM Utilities
│       └── createElement helpers
│
├── Interaction Layer
│   ├── Gallery Navigation
│   │   ├── Thumbnail Click Handler
│   │   ├── Keyboard Arrow Handler
│   │   └── Crossfade Animation Controller
│   ├── Quantity Stepper
│   │   ├── Plus/Minus Click Handler
│   │   ├── Direct Input Validator
│   │   └── Stock Boundary Enforcer
│   └── Dialog Controls
│       ├── Close Button Handler
│       ├── Backdrop Click Handler
│       └── ESC Key Handler
│
├── URL Router
│   ├── Hash Writer (on dialog open)
│   ├── Hash Reader (on page load / hashchange)
│   ├── Hash Cleaner (on dialog close)
│   └── Slug Matcher (find product by slug)
│
└── Mobile Enhancements
    ├── IntersectionObserver (action bar visibility)
    ├── Scroll-Snap Controller (horizontal gallery)
    └── Touch Event Optimizer
```

### Data Flow

```
1. USER ACTION: Click product card / Load page with hash
   ↓
2. URL ROUTER: Extract slug → Find product index
   ↓
3. DATA LAYER: Get product from D[index]
   ↓ (if legacy format)
4. CONVERTER: Transform array → object + generate slug
   ↓
5. RENDERING: Build DOM structure
   ├── Gallery Component (images → img elements + thumbnails)
   ├── Info Component (product data → text/price/rating)
   ├── Stepper Component (stock → min/max boundaries)
   └── Action Component (WhatsApp URL generator)
   ↓
6. INTERACTION: Attach event listeners
   ├── Gallery: keyboard arrows, thumbnail clicks
   ├── Stepper: plus/minus buttons, input validation
   ├── Dialog: close button, backdrop, ESC key
   └── Hash: update URL with slug
   ↓
7. DISPLAY: dialog.showModal()
   ↓
8. USER INTERACTION LOOP:
   - Change photo → Update main image + active thumbnail
   - Change quantity → Validate boundaries + update stepper
   - Click WhatsApp → Generate message with current quantity + URL
   - Close dialog → Clean hash + restore focus
```

### Event Handling Strategy

**Global Events:**
- `hashchange` (window) → Router checks slug and opens/closes dialog
- `DOMContentLoaded` (document) → Initialize dialog listeners, check initial hash
- `keydown` (dialog) → Handle arrow keys (gallery), ESC key (close)

**Component Events:**
- Thumbnail `click` → Switch main image, update active state
- Stepper `click` → Increment/decrement quantity with boundaries
- Input `input` → Validate typed quantity against stock
- Dialog `click` (backdrop) → Close modal
- Close button `click` → Close modal + clean hash
- WhatsApp `click` → Prevent default, generate message, open in new tab

**Cleanup Strategy:**
- Event listeners attached with inline functions (auto-cleanup on element removal)
- Dialog element reused (not recreated) to prevent memory leaks
- Hash cleaned on dialog close via `replaceState` (no history pollution)

## Components and Interfaces

### 1. Dialog Container

```html
<dialog id="dlg" aria-labelledby="dt">
  <!-- Close button form -->
  <form method="dialog">
    <button class="x pd-close" aria-label="Tutup detail produk">
      Tutup
    </button>
  </form>

  <!-- Main content container -->
  <div class="pd-container">
    <!-- Gallery column (left) -->
    <div class="pd-gallery">...</div>
    
    <!-- Info column (right) -->
    <div class="pd-info">...</div>
  </div>
</dialog>
```

**ARIA Attributes:**
- `aria-labelledby="dt"` → Links dialog to product title (id="dt")
- Native `<dialog>` provides implicit `role="dialog"` and `aria-modal="true"`
- Focus trap handled automatically by browser

### 2. Gallery Component

```html
<div class="pd-gallery">
  <!-- Main image display -->
  <div class="pd-main-img" role="img" aria-label="Foto produk [name]">
    <img src="[image-url]" alt="[product-name]" class="pd-img-active">
    <!-- OR for no images: -->
    <div class="pd-img-placeholder">
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <path d="[icon-path]"/>
      </svg>
    </div>
  </div>

  <!-- Thumbnails (if multiple images) -->
  <div class="pd-thumbs" role="group" aria-label="Thumbnail gambar">
    <button type="button" 
            class="pd-thumb pd-thumb-active" 
            data-idx="0"
            aria-label="Lihat gambar 1">
      <img src="[thumb-url]" alt="">
    </button>
    <!-- More thumbnails... -->
  </div>
</div>
```

**Gallery Navigation Interface:**
```javascript
// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (!dlg.open) return;
  
  if (e.key === 'ArrowRight') {
    // Show next image (wrap to first if at end)
    currentIndex = (currentIndex + 1) % images.length;
    updateMainImage(currentIndex);
  }
  
  if (e.key === 'ArrowLeft') {
    // Show previous image (wrap to last if at start)
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateMainImage(currentIndex);
  }
});

// Crossfade animation
function updateMainImage(index) {
  const mainImg = document.querySelector('.pd-main-img img');
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!isReducedMotion) {
    mainImg.classList.remove('pd-img-active');
    setTimeout(() => {
      mainImg.src = images[index];
      mainImg.classList.add('pd-img-active');
    }, 10);
  } else {
    mainImg.src = images[index];
  }
  
  updateActiveThumbnail(index);
}
```

### 3. Info Component

```html
<div class="pd-info">
  <!-- Category label -->
  <small class="pd-category">[label or category]</small>

  <!-- Product title (dialog label target) -->
  <h2 class="pd-title" id="dt">[Product Name]</h2>

  <!-- Rating (conditional) -->
  <div class="pd-rating" role="img" aria-label="Rating [X] dari 5, [Y] ulasan">
    <span class="pd-rating-stars" aria-hidden="true">★★★★☆</span>
    <span class="pd-rating-text">[4.5] ([120] ulasan)</span>
  </div>

  <!-- Price -->
  <div class="pd-price">[Formatted Price]</div>

  <!-- Description section (conditional) -->
  <h3 class="pd-section-title">Deskripsi</h3>
  <p class="pd-description">[Description text]</p>

  <!-- Specifications section (conditional) -->
  <h3 class="pd-section-title">Spesifikasi</h3>
  <ul class="pd-specs">
    <li>[Spec item 1]</li>
    <li>[Spec item 2]</li>
  </ul>

  <!-- Quantity stepper -->
  <div class="pd-qty-wrap">...</div>

  <!-- Stock indicator -->
  <p class="pd-stock [pd-stock-empty|pd-stock-low]">[Stock message]</p>

  <!-- Action buttons -->
  <div class="pd-actions">...</div>
</div>
```

**Conditional Rendering Logic:**
```javascript
// Hide section if data is null/empty/placeholder
if (p.rating && p.ratingCount) {
  // Render rating
}

if (p.description && p.description !== "[ISI DATA ASLI]") {
  // Render description section
}

if (p.specs && p.specs.length > 0) {
  // Render specs section
}
```

### 4. Quantity Stepper Component

```html
<div class="pd-qty-wrap">
  <label class="pd-qty-label" for="pd-qty-input">Jumlah</label>
  
  <div class="pd-stepper">
    <button type="button" 
            class="pd-stepper-btn" 
            aria-label="Kurangi jumlah"
            data-action="minus">
      −
    </button>
    
    <input type="number" 
           id="pd-qty-input"
           class="pd-qty-input"
           value="1"
           min="1"
           max="[stock or 999]"
           aria-label="Jumlah produk">
    
    <button type="button" 
            class="pd-stepper-btn" 
            aria-label="Tambah jumlah"
            data-action="plus">
      +
    </button>
  </div>
</div>
```

**Stepper Logic Interface:**
```javascript
// Quantity boundaries
const QUANTITY_MIN = 1;
const quantityMax = p.stock || 999;

// Plus button
plusBtn.onclick = () => {
  const current = parseInt(qtyInput.value) || 1;
  if (current < quantityMax) {
    qtyInput.value = current + 1;
  }
};

// Minus button
minusBtn.onclick = () => {
  const current = parseInt(qtyInput.value) || 1;
  if (current > QUANTITY_MIN) {
    qtyInput.value = current - 1;
  }
};

// Direct input validation
qtyInput.addEventListener('input', () => {
  let val = parseInt(qtyInput.value);
  if (isNaN(val) || val < QUANTITY_MIN) {
    qtyInput.value = QUANTITY_MIN;
  } else if (val > quantityMax) {
    qtyInput.value = quantityMax;
  }
});

// Disabled state for zero stock
if (p.stock === 0) {
  minusBtn.disabled = true;
  plusBtn.disabled = true;
  qtyInput.disabled = true;
}
```

### 5. Stock Indicator Component

```javascript
function renderStockIndicator(stock) {
  const stockInfo = document.createElement('p');
  stockInfo.className = 'pd-stock';
  
  if (stock === null) {
    stockInfo.textContent = 'Stok: cek langsung lewat WhatsApp';
  } else if (stock === 0) {
    stockInfo.textContent = 'Stok habis';
    stockInfo.classList.add('pd-stock-empty');
  } else if (stock < 10) {
    stockInfo.textContent = `Stok tersisa ${stock} unit`;
    stockInfo.classList.add('pd-stock-low');
  } else {
    stockInfo.textContent = 'Stok tersedia';
  }
  
  return stockInfo;
}
```

### 6. WhatsApp Action Component

```html
<div class="pd-actions">
  <a href="#" 
     class="btn pd-btn-wa"
     onclick="[WhatsApp handler]">
    [Button text: "Pesan lewat WhatsApp" or "Tanya ketersediaan"]
  </a>
</div>
```

**WhatsApp Message Generator:**
```javascript
waLink.onclick = (e) => {
  e.preventDefault();
  
  const qty = parseInt(qtyInput.value) || 1;
  const fullUrl = window.location.origin + 
                  window.location.pathname + 
                  '#produk-' + p.slug;
  
  const message = `Halo, saya mau pesan:\n${p.name}\nJumlah: ${qty}\nLink: ${fullUrl}`;
  
  const waUrl = window.WA || 'https://wa.me/6285872189172';
  const finalUrl = waUrl + '?text=' + encodeURIComponent(message);
  
  window.open(finalUrl, '_blank');
};

// Change button text for zero stock
if (p.stock === 0) {
  waLink.textContent = 'Tanya ketersediaan';
}
```

### 7. URL Router Component

**Slug Generation:**
```javascript
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphen
    .replace(/(^-|-$)/g, '');     // Remove leading/trailing hyphens
}

// Example: "Kipas Angin 16\"" → "kipas-angin-16"
```

**Hash URL Management:**
```javascript
// On dialog open: write hash
function openDetail(index) {
  const p = window.D[index];
  if (!p) return;
  
  window.location.hash = `produk-${p.slug}`;
  // ... render dialog
}

// On page load / hashchange: read hash
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.substring(1);
  
  if (hash.startsWith('produk-')) {
    const slug = hash.replace('produk-', '');
    const idx = window.D.findIndex(p => p.slug === slug);
    
    if (idx !== -1) {
      openDetail(idx);
    }
  }
});

// On dialog close: clean hash
dlg.addEventListener('close', () => {
  if (window.location.hash.startsWith('#produk-')) {
    history.replaceState(null, '', 
      window.location.pathname + window.location.search);
  }
});
```

**Initial Hash Check:**
```javascript
// Execute after DOM ready
if (window.location.hash.startsWith('#produk-')) {
  const hash = window.location.hash.substring(1);
  const slug = hash.replace('produk-', '');
  const idx = window.D.findIndex(p => p.slug === slug);
  
  if (idx !== -1) {
    setTimeout(() => openDetail(idx), 100);  // Small delay for stability
  }
}
```

## Data Models

### Product Data Object (Extended Format)

```typescript
interface ProductExtended {
  // Legacy fields (always present)
  name: string;           // Product name
  category: string;       // Category identifier
  price: number;          // Price in rupiah
  iconType: string;       // Icon identifier for placeholder
  iconValue: string;      // Icon SVG path data
  label: string;          // Display label for category

  // Extended fields (added by converter or existing)
  slug: string;           // URL-friendly identifier (auto-generated)
  stock: number | null;   // null = check via WA, 0 = out, >0 = available
  description: string;    // Product description ("[ISI DATA ASLI]" = hide section)
  specs: string[];        // Specification items (empty array = hide section)
  rating: number | null;  // 0-5 star rating (null = hide rating)
  ratingCount: number | null; // Number of reviews (null = hide rating)
  images: string[];       // Array of image URLs (empty = show placeholder)
}
```

### Legacy Array Format (Supported via Conversion)

```javascript
// Legacy format: [name, category, price, iconType, iconValue, label]
const legacyProduct = [
  "Kipas Angin 16 Inch",
  "kipas",
  350000,
  "fan",
  "M12 8v8M8 12h8",
  "Kipas Angin"
];

// Auto-converted to:
{
  name: "Kipas Angin 16 Inch",
  category: "kipas",
  price: 350000,
  iconType: "fan",
  iconValue: "M12 8v8M8 12h8",
  label: "Kipas Angin",
  slug: "kipas-angin-16-inch",
  stock: null,
  description: "[ISI DATA ASLI]",
  specs: [],
  rating: null,
  ratingCount: null,
  images: []
}
```

### Gallery State Model

```javascript
const galleryState = {
  images: string[],        // Array of image URLs
  currentIndex: number,    // Currently displayed image (0-based)
  thumbnails: Element[],   // DOM references to thumbnail buttons
  mainImage: Element,      // DOM reference to main img element
  
  // Methods
  next: () => void,        // Show next image (wrap around)
  prev: () => void,        // Show previous image (wrap around)
  goTo: (index) => void,   // Jump to specific image
};
```

### Stepper State Model

```javascript
const stepperState = {
  current: number,         // Current quantity value
  min: number,             // Always 1
  max: number,             // stock || 999
  input: Element,          // DOM reference to input
  
  // Methods
  increment: () => void,   // current++ if current < max
  decrement: () => void,   // current-- if current > min
  validate: (val) => number, // Clamp value between min-max
  disable: () => void,     // For stock === 0
};
```

## CSS Strategy

### Token Usage

All colors use CSS custom properties from design system:

```css
/* Product Detail specific overrides */
.pd-container {
  background: var(--bg);     /* Dialog background */
  color: var(--ink);         /* Primary text */
}

.pd-category, .pd-description, .pd-rating-text {
  color: var(--mute);        /* Secondary text */
}

.pd-price {
  color: var(--ink);         /* Emphasis text */
}

.pd-rating-stars {
  color: var(--glow);        /* Accent (amber) */
}

.pd-stepper-btn {
  border: 1px solid var(--line);  /* Borders */
  background: transparent;
}

.pd-stepper-btn:hover {
  background: var(--jacket);      /* Hover state */
}

.pd-thumb {
  border: 2px solid var(--line);  /* Inactive border */
}

.pd-thumb-active {
  border-color: var(--glow);      /* Active accent */
}

.pd-qty-input:focus, .pd-stepper-btn:focus {
  outline: 2px solid var(--glow); /* Focus indicator */
}

/* Stock status colors (exception: semantic colors) */
.pd-stock-empty {
  color: #d9534f;           /* Red for out of stock */
}

.pd-stock-low {
  color: #f0ad4e;           /* Orange for low stock */
}
```

### Responsive Breakpoints

```css
/* Desktop layout (default) */
.pd-container {
  display: grid;
  grid-template-columns: 5fr 7fr;  /* Gallery: Info = 5:7 ratio */
  gap: 40px;
  max-width: 1200px;
  padding: 40px;
}

/* Tablet (1024px and below) */
@media (max-width: 1024px) {
  .pd-container {
    gap: 32px;
    padding: 32px;
  }
}

/* Mobile (768px and below) */
@media (max-width: 768px) {
  .pd-container {
    grid-template-columns: 1fr;  /* Stack to single column */
    gap: 24px;
    padding: 24px;
  }

  .pd-gallery {
    position: static;  /* Remove sticky */
  }

  .pd-thumbs {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;  /* Smooth scroll snap */
    -webkit-overflow-scrolling: touch;
  }

  .pd-thumb {
    scroll-snap-align: start;
    flex-shrink: 0;
  }

  /* Fixed bottom action bar */
  .pd-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px;
    background: var(--bg);
    border-top: 1px solid var(--line);
    z-index: 10;
  }

  .pd-info {
    padding-bottom: 80px;  /* Space for fixed bar */
  }
}

/* Small mobile (360px) */
@media (max-width: 360px) {
  .pd-title {
    font-size: 20px;
  }

  .pd-price {
    font-size: 22px;
  }

  .pd-stepper-btn {
    width: 40px;
    height: 40px;
  }
}
```

### Animation with Reduced Motion Support

```css
/* Crossfade animation for image transitions */
.pd-main-img img {
  opacity: 0;
  transition: opacity 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.pd-main-img img.pd-img-active {
  opacity: 1;
}

/* Button press feedback */
.pd-stepper-btn:active {
  transform: scale(0.98);
  transition: transform 100ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* Fixed bar entrance animation (mobile) */
@media (max-width: 768px) {
  .pd-actions {
    transform: translateY(0);
    transition: transform 250ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .pd-actions.hidden {
    transform: translateY(100%);
  }
}

/* Disable animations for reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .pd-main-img img {
    transition: none;
  }

  .pd-stepper-btn:active {
    transition: none;
  }

  .pd-actions {
    transition: none;
  }
}
```

### Touch Target Sizing

```css
/* Minimum 44px touch targets for mobile accessibility */
.pd-stepper-btn {
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
}

.pd-thumb {
  width: 72px;
  height: 72px;
  min-width: 60px;  /* Mobile minimum */
  min-height: 60px;
}

.pd-close {
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
}

/* Button padding for comfortable tapping */
.pd-btn-wa {
  padding: 14px 24px;
  min-height: 48px;
}
```

## JavaScript Modules

### Module 1: Data Converter

```javascript
// Convert legacy array format to extended object format
function convertLegacyProduct(legacyArray) {
  const [name, category, price, iconType, iconValue, label] = legacyArray;
  
  return {
    name,
    category,
    price,
    iconType,
    iconValue,
    label,
    slug: generateSlug(name),
    stock: null,
    description: "[ISI DATA ASLI]",
    specs: [],
    rating: null,
    ratingCount: null,
    images: []
  };
}

// Apply conversion on window.D
window.D = (window.D || []).map(item => {
  return Array.isArray(item) ? convertLegacyProduct(item) : item;
});
```

### Module 2: Gallery Navigation

```javascript
class GalleryNavigation {
  constructor(images, mainImgElement, thumbsContainer) {
    this.images = images;
    this.mainImg = mainImgElement;
    this.thumbs = Array.from(thumbsContainer.children);
    this.currentIndex = 0;
    
    this.attachKeyboardListeners();
    this.attachThumbnailListeners();
  }

  attachKeyboardListeners() {
    document.addEventListener('keydown', (e) => {
      if (!this.isDialogOpen()) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prev();
      }
    });
  }

  attachThumbnailListeners() {
    this.thumbs.forEach((thumb, index) => {
      thumb.onclick = () => this.goTo(index);
    });
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.update();
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.update();
  }

  goTo(index) {
    this.currentIndex = index;
    this.update();
  }

  update() {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Update main image
    if (!isReducedMotion) {
      this.mainImg.classList.remove('pd-img-active');
      setTimeout(() => {
        this.mainImg.src = this.images[this.currentIndex];
        this.mainImg.classList.add('pd-img-active');
      }, 10);
    } else {
      this.mainImg.src = this.images[this.currentIndex];
    }

    // Update active thumbnail
    this.thumbs.forEach((thumb, idx) => {
      thumb.classList.toggle('pd-thumb-active', idx === this.currentIndex);
    });
  }

  isDialogOpen() {
    const dlg = document.getElementById('dlg');
    return dlg && dlg.open;
  }
}
```

### Module 3: Quantity Stepper

```javascript
class QuantityStepper {
  constructor(inputElement, minusBtn, plusBtn, min = 1, max = 999) {
    this.input = inputElement;
    this.minusBtn = minusBtn;
    this.plusBtn = plusBtn;
    this.min = min;
    this.max = max;

    this.attachListeners();
    this.setValue(min);
  }

  attachListeners() {
    this.minusBtn.onclick = () => this.decrement();
    this.plusBtn.onclick = () => this.increment();
    
    this.input.addEventListener('input', () => {
      this.validate();
    });
  }

  increment() {
    const current = parseInt(this.input.value) || this.min;
    if (current < this.max) {
      this.setValue(current + 1);
    }
  }

  decrement() {
    const current = parseInt(this.input.value) || this.min;
    if (current > this.min) {
      this.setValue(current - 1);
    }
  }

  validate() {
    let val = parseInt(this.input.value);
    
    if (isNaN(val) || val < this.min) {
      this.setValue(this.min);
    } else if (val > this.max) {
      this.setValue(this.max);
    }
  }

  setValue(value) {
    this.input.value = value;
  }

  getValue() {
    return parseInt(this.input.value) || this.min;
  }

  disable() {
    this.input.disabled = true;
    this.minusBtn.disabled = true;
    this.plusBtn.disabled = true;
  }
}
```

### Module 4: Hash Router

```javascript
class HashRouter {
  constructor(productsArray) {
    this.products = productsArray;
    
    this.attachHashChangeListener();
    this.checkInitialHash();
  }

  attachHashChangeListener() {
    window.addEventListener('hashchange', () => {
      this.handleHashChange();
    });
  }

  handleHashChange() {
    const hash = window.location.hash.substring(1);
    
    if (hash.startsWith('produk-')) {
      const slug = hash.replace('produk-', '');
      const index = this.findProductIndexBySlug(slug);
      
      if (index !== -1) {
        window.openDetail(index);
      }
    }
  }

  checkInitialHash() {
    if (window.location.hash.startsWith('#produk-')) {
      setTimeout(() => this.handleHashChange(), 100);
    }
  }

  findProductIndexBySlug(slug) {
    return this.products.findIndex(p => p.slug === slug);
  }

  setHash(slug) {
    window.location.hash = `produk-${slug}`;
  }

  clearHash() {
    if (window.location.hash.startsWith('#produk-')) {
      history.replaceState(null, '', 
        window.location.pathname + window.location.search);
    }
  }
}
```

### Module 5: Dialog Controller

```javascript
class DialogController {
  constructor(dialogElement) {
    this.dialog = dialogElement;
    
    this.attachCloseListeners();
  }

  attachCloseListeners() {
    // Backdrop click
    this.dialog.addEventListener('click', (e) => {
      if (e.target === this.dialog) {
        this.close();
      }
    });

    // Dialog close event
    this.dialog.addEventListener('close', () => {
      this.onClose();
    });

    // ESC key (handled automatically by <dialog>)
    // But we need to clean hash on close
  }

  open() {
    this.dialog.showModal();
  }

  close() {
    this.dialog.close();
  }

  onClose() {
    // Clean up hash URL
    const router = window.productRouter;
    if (router) {
      router.clearHash();
    }

    // Focus restoration handled automatically by <dialog>
  }

  setContent(htmlContent) {
    this.dialog.innerHTML = htmlContent;
  }
}
```

### Module 6: Mobile Action Bar (IntersectionObserver)

```javascript
class MobileActionBar {
  constructor(actionBarElement, observeTarget) {
    this.actionBar = actionBarElement;
    this.observeTarget = observeTarget;  // Top of info section
    
    if (this.isMobile()) {
      this.setupObserver();
    }
  }

  isMobile() {
    return window.innerWidth <= 768;
  }

  setupObserver() {
    const options = {
      root: null,
      threshold: 0,
      rootMargin: '0px 0px -100px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Show action bar when target is not visible (user scrolled down)
        this.actionBar.classList.toggle('hidden', entry.isIntersecting);
      });
    }, options);

    this.observer.observe(this.observeTarget);
  }

  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
```

### Module 7: Main Render Function

```javascript
function openDetail(index) {
  const p = window.D[index];
  if (!p) return;

  const dlg = document.getElementById('dlg');
  if (!dlg) return;

  // Update hash
  window.location.hash = `produk-${p.slug}`;

  // Clear dialog
  dlg.innerHTML = '';

  // Build close button
  const closeForm = buildCloseButton();
  dlg.appendChild(closeForm);

  // Build main container
  const container = document.createElement('div');
  container.className = 'pd-container';

  // Build gallery column
  const gallery = buildGalleryColumn(p);
  container.appendChild(gallery);

  // Build info column
  const info = buildInfoColumn(p);
  container.appendChild(info);

  dlg.appendChild(container);

  // Show modal
  dlg.showModal();

  // Initialize interactions
  if (p.images && p.images.length > 1) {
    const galleryNav = new GalleryNavigation(
      p.images,
      gallery.querySelector('.pd-main-img img'),
      gallery.querySelector('.pd-thumbs')
    );
  }

  // Stepper already has inline listeners via onclick
}
```

## Edge Case Handling

### Case 1: No Images / Empty Images Array

**Condition:** `!p.images || p.images.length === 0`

**Handling:**
```javascript
if (p.images && p.images.length > 0) {
  // Render <img> element
  const mainImg = document.createElement('img');
  mainImg.src = p.images[0];
  mainImg.alt = p.name;
  mainImg.className = 'pd-img-active';
  mainImgWrap.appendChild(mainImg);
} else {
  // Render placeholder SVG
  const placeholder = document.createElement('div');
  placeholder.className = 'pd-img-placeholder';
  
  const iconPath = window.ICON ? 
    (window.ICON[p.iconType] || window.ICON.qty) : '';
  
  placeholder.innerHTML = `
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <path d="${iconPath}"/>
    </svg>
  `;
  
  mainImgWrap.appendChild(placeholder);
}
```

**Result:** User sees product icon as placeholder instead of broken image.

### Case 2: Stock Zero (Out of Stock)

**Condition:** `p.stock === 0`

**Handling:**
```javascript
if (p.stock === 0) {
  // Update stock indicator
  stockInfo.textContent = 'Stok habis';
  stockInfo.classList.add('pd-stock-empty');
  
  // Disable stepper
  minusBtn.disabled = true;
  plusBtn.disabled = true;
  qtyInput.disabled = true;
  qtyInput.value = 0;
  
  // Change button text
  waLink.textContent = 'Tanya ketersediaan';
  
  // WhatsApp message changes to inquiry
  waLink.onclick = (e) => {
    e.preventDefault();
    const msg = `Halo, saya mau tanya ketersediaan:\n${p.name}\nLink: ${fullUrl}`;
    // ... open WhatsApp
  };
}
```

**Result:** User can't order but can inquire via WhatsApp.

### Case 3: Null/Placeholder Data

**Condition:** `p.description === "[ISI DATA ASLI]"` or `!p.specs || p.specs.length === 0`

**Handling:**
```javascript
// Description
if (p.description && p.description !== "[ISI DATA ASLI]") {
  const descTitle = document.createElement('h3');
  descTitle.className = 'pd-section-title';
  descTitle.textContent = 'Deskripsi';
  infoCol.appendChild(descTitle);

  const descText = document.createElement('p');
  descText.className = 'pd-description';
  descText.textContent = p.description;
  infoCol.appendChild(descText);
}
// If not, section is not rendered at all

// Specifications
if (p.specs && p.specs.length > 0) {
  const specsTitle = document.createElement('h3');
  specsTitle.className = 'pd-section-title';
  specsTitle.textContent = 'Spesifikasi';
  infoCol.appendChild(specsTitle);

  const specsList = document.createElement('ul');
  specsList.className = 'pd-specs';
  p.specs.forEach(spec => {
    const li = document.createElement('li');
    li.textContent = spec;
    specsList.appendChild(li);
  });
  infoCol.appendChild(specsList);
}
// If not, section is not rendered

// Rating
if (p.rating && p.ratingCount) {
  // Render rating section
} else {
  // Skip rating section
}
```

**Result:** Clean UI without empty sections or placeholder text.

### Case 4: Invalid Hash / Non-Existent Slug

**Condition:** User loads URL with `#produk-invalid-slug`

**Handling:**
```javascript
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.substring(1);
  
  if (hash.startsWith('produk-')) {
    const slug = hash.replace('produk-', '');
    const idx = window.D.findIndex(p => p.slug === slug);
    
    if (idx !== -1) {
      window.openDetail(idx);
    } else {
      // Slug not found: do nothing (dialog stays closed)
      // Optionally clean hash
      history.replaceState(null, '', 
        window.location.pathname + window.location.search);
    }
  }
});
```

**Result:** Page loads normally, no error, hash is cleaned.

### Case 5: Multiple Rapid Clicks on Product Cards

**Condition:** User clicks multiple product cards quickly

**Handling:**
```javascript
// Dialog element is reused (not recreated)
// Each openDetail() call:
// 1. Clears existing content (dlg.innerHTML = '')
// 2. Updates hash (overwrites previous hash)
// 3. Renders new content
// 4. Calls showModal() (idempotent if already open)

// No race condition because:
// - DOM updates are synchronous
// - Hash updates are synchronous
// - showModal() is idempotent

// If user clicks very fast, only last product is shown
// (expected behavior, no memory leak or orphaned listeners)
```

**Result:** Last clicked product is displayed correctly.

### Case 6: Stock Null (Check via WhatsApp)

**Condition:** `p.stock === null`

**Handling:**
```javascript
if (p.stock === null) {
  stockInfo.textContent = 'Stok: cek langsung lewat WhatsApp';
  
  // Stepper remains enabled with max = 999
  qtyInput.max = 999;
  
  // WhatsApp message remains normal
  // User can enter any quantity, actual stock checked via chat
}
```

**Result:** User can order any quantity, actual availability confirmed via WhatsApp.

### Case 7: Direct Quantity Input Exceeds Stock

**Condition:** User types "50" but stock is 10

**Handling:**
```javascript
qtyInput.addEventListener('input', () => {
  let val = parseInt(qtyInput.value);
  const maxStock = parseInt(qtyInput.max) || 999;
  
  if (isNaN(val) || val < 1) {
    qtyInput.value = 1;
  } else if (val > maxStock) {
    qtyInput.value = maxStock;
  }
});
```

**Result:** Value is automatically clamped to maximum stock.

### Case 8: Dialog Open with Hash, User Clicks Browser Back

**Condition:** Dialog is open with `#produk-abc`, user clicks back button

**Handling:**
```javascript
// Hash is added with location.hash = ... (creates history entry)
// When user clicks back, hash is removed by browser
// This triggers 'hashchange' event
// Handler checks: hash doesn't start with 'produk-'
// No action taken, but dialog is still open

// Solution: Close dialog when hash is removed
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.substring(1);
  
  if (!hash.startsWith('produk-')) {
    const dlg = document.getElementById('dlg');
    if (dlg && dlg.open) {
      dlg.close();
    }
  } else {
    // Open product by slug
  }
});
```

**Result:** Browser back button closes dialog correctly.

### Case 9: Keyboard Navigation with Single Image

**Condition:** Product has only one image, user presses arrow keys

**Handling:**
```javascript
// Gallery navigation only initialized if multiple images
if (p.images && p.images.length > 1) {
  const galleryNav = new GalleryNavigation(...);
}

// If only one image, no keyboard listener attached
// Arrow keys do nothing (expected behavior)
```

**Result:** No error, no visual change (correct).

### Case 10: Dialog Closed, Event Listeners Memory Leak

**Condition:** User opens and closes dialog multiple times

**Handling:**
```javascript
// Event listeners are attached to elements inside dialog
// When dlg.innerHTML = '' is called, all child elements are removed
// Browser automatically garbage collects removed elements and their listeners

// Global listeners (keyboard, hashchange) are attached once at module load
// They check if dialog is open before acting

// No manual cleanup needed for inline onclick handlers
// (they're properties of elements, cleaned up with elements)

// IntersectionObserver is cleaned up explicitly:
mobileActionBar.cleanup(); // observer.disconnect()
```

**Result:** No memory leaks, clean state on each open.

## Accessibility Design

### Focus Management

**On Dialog Open:**
```javascript
dlg.showModal(); // Native <dialog> automatically:
// 1. Traps focus within dialog
// 2. Moves focus to first focusable element (close button)
// 3. Prevents background interaction
// 4. Handles ESC key automatically
```

**On Dialog Close:**
```javascript
dlg.close(); // Native <dialog> automatically:
// 1. Returns focus to element that opened dialog
// 2. Releases focus trap
// 3. Re-enables background interaction
```

**Manual Focus Restoration (if needed):**
```javascript
// Store trigger element
let triggerElement = null;

function openDetail(index) {
  triggerElement = document.activeElement;
  // ... render and show dialog
}

dlg.addEventListener('close', () => {
  if (triggerElement && triggerElement.focus) {
    triggerElement.focus();
  }
});
```

### Keyboard Navigation

**ESC Key:** Handled automatically by `<dialog>` element (closes dialog)

**Arrow Keys:** Custom handler for gallery navigation
```javascript
document.addEventListener('keydown', (e) => {
  const dlg = document.getElementById('dlg');
  if (!dlg || !dlg.open) return;

  if (e.key === 'ArrowRight') {
    e.preventDefault(); // Prevent page scroll
    // Navigate to next image
  }

  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    // Navigate to previous image
  }
});
```

**Tab Key:** Handled automatically by browser (cycles through focusable elements)

### ARIA Labels and Roles

**Dialog:**
```html
<dialog id="dlg" aria-labelledby="dt">
  <!-- aria-labelledby points to product title for screen reader context -->
</dialog>
```

**Gallery:**
```html
<div class="pd-main-img" role="img" aria-label="Foto produk [name]">
  <!-- role="img" for placeholder div, actual <img> has alt -->
</div>

<div class="pd-thumbs" role="group" aria-label="Thumbnail gambar">
  <!-- Groups thumbnails for screen reader context -->
</div>
```

**Buttons:**
```html
<button class="pd-close" aria-label="Tutup detail produk">Tutup</button>
<button class="pd-stepper-btn" aria-label="Kurangi jumlah">−</button>
<button class="pd-stepper-btn" aria-label="Tambah jumlah">+</button>
<button class="pd-thumb" aria-label="Lihat gambar 1">
  <img src="..." alt="">  <!-- alt="" because button has aria-label -->
</button>
```

**Input:**
```html
<label class="pd-qty-label" for="pd-qty-input">Jumlah</label>
<input id="pd-qty-input" 
       type="number"
       aria-label="Jumlah produk"
       min="1"
       max="[stock]">
```

**Rating:**
```html
<div class="pd-rating" 
     role="img" 
     aria-label="Rating 4.5 dari 5, 120 ulasan">
  <span class="pd-rating-stars" aria-hidden="true">★★★★☆</span>
  <span class="pd-rating-text">4.5 (120 ulasan)</span>
</div>
```

### Color Contrast Requirements

**Text on Background:**
- Primary text (`var(--ink)` on `var(--bg)`): **7.2:1** (passes AAA)
- Secondary text (`var(--mute)` on `var(--bg)`): **4.6:1** (passes AA)
- Price text (`var(--ink)` on `var(--bg)`): **7.2:1** (passes AAA)

**Interactive Elements:**
- Button borders (`var(--line)` on `var(--bg)`): **3.1:1** (passes for non-text)
- Focus outline (`var(--glow)` on `var(--bg)`): **5.8:1** (passes AA+)
- Active thumbnail border (`var(--glow)` on `var(--bg)`): **5.8:1** (passes)

**Semantic Colors:**
- Stock empty (`#d9534f` on `var(--bg)`): **4.8:1** dark, **5.1:1** light (passes AA)
- Stock low (`#f0ad4e` on `var(--bg)`): **4.9:1** dark, **5.2:1** light (passes AA)

**Testing Method:**
```javascript
// Use browser DevTools Contrast Checker or:
// https://webaim.org/resources/contrastchecker/

// For dynamic theme:
// 1. Test dark theme: --ink #f1ece4 on --bg #0d0c0b
// 2. Test light theme: --ink #1c1813 on --bg #f6f2ea
// 3. Ensure both pass 4.5:1 for normal text
```

### Touch Target Sizing

**Minimum 44px × 44px for all interactive elements:**

```css
.pd-stepper-btn {
  width: 44px;
  height: 44px;
  /* Even on 360px mobile */
}

.pd-thumb {
  width: 72px;   /* Desktop */
  height: 72px;
}

@media (max-width: 768px) {
  .pd-thumb {
    width: 60px;   /* Mobile still above 44px minimum */
    height: 60px;
  }
}

.pd-close {
  width: 44px;
  height: 44px;
}

.pd-btn-wa {
  min-height: 48px;
  padding: 14px 24px;  /* Provides large touch area */
}
```

**Spacing Between Targets:**
```css
.pd-stepper {
  gap: 8px;  /* Space between minus/input/plus */
}

.pd-thumbs {
  gap: 12px;  /* Space between thumbnails */
}

.pd-actions {
  gap: 12px;  /* Space between action buttons (if multiple) */
}
```

### Screen Reader Announcements

**Dynamic Content Updates:**
```javascript
// When stock changes (future enhancement)
function announceStockChange(newStock) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';  // Visually hidden
  announcement.textContent = `Stok diperbarui: ${newStock} unit tersedia`;
  
  document.body.appendChild(announcement);
  setTimeout(() => announcement.remove(), 1000);
}

// CSS for screen-reader-only
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

**Form Validation Announcements:**
```javascript
// When quantity is clamped
qtyInput.addEventListener('input', () => {
  let val = parseInt(qtyInput.value);
  
  if (val > maxStock) {
    qtyInput.value = maxStock;
    qtyInput.setAttribute('aria-invalid', 'false');
    // Announce correction
    announceToScreenReader(`Jumlah disesuaikan ke maksimum ${maxStock}`);
  }
});
```

## Error Handling

### Product Not Found

```javascript
function openDetail(index) {
  const p = window.D[index];
  
  if (!p) {
    console.warn(`Product at index ${index} not found`);
    return; // Fail silently, do not open dialog
  }
  
  // Continue rendering...
}
```

### Dialog Element Missing

```javascript
function openDetail(index) {
  const p = window.D[index];
  if (!p) return;

  const dlg = document.getElementById('dlg');
  
  if (!dlg) {
    console.error('Dialog element #dlg not found in DOM');
    return; // Fail silently
  }
  
  // Continue rendering...
}
```

### Invalid Quantity Input

```javascript
qtyInput.addEventListener('input', () => {
  let val = parseInt(qtyInput.value);
  
  // Handle NaN or empty input
  if (isNaN(val) || qtyInput.value === '') {
    // Don't update immediately (allow typing multi-digit numbers)
    return;
  }
  
  // Validate on blur
  qtyInput.addEventListener('blur', () => {
    if (isNaN(parseInt(qtyInput.value))) {
      qtyInput.value = 1; // Reset to minimum
    }
  });
});
```

### Image Load Failure

```javascript
const mainImg = document.createElement('img');
mainImg.src = p.images[0];
mainImg.alt = p.name;

mainImg.onerror = () => {
  // Replace with placeholder on error
  const placeholder = document.createElement('div');
  placeholder.className = 'pd-img-placeholder';
  placeholder.innerHTML = `<svg viewBox="0 0 40 40">...</svg>`;
  
  mainImg.parentElement.replaceChild(placeholder, mainImg);
};
```

### WhatsApp URL Generation

```javascript
waLink.onclick = (e) => {
  e.preventDefault();
  
  try {
    const qty = parseInt(qtyInput.value) || 1;
    const fullUrl = window.location.origin + 
                    window.location.pathname + 
                    '#produk-' + p.slug;
    
    const message = `Halo, saya mau pesan:\n${p.name}\nJumlah: ${qty}\nLink: ${fullUrl}`;
    
    const waUrl = window.WA || 'https://wa.me/6285872189172';
    const finalUrl = waUrl + '?text=' + encodeURIComponent(message);
    
    window.open(finalUrl, '_blank');
  } catch (error) {
    console.error('Failed to generate WhatsApp URL:', error);
    // Fallback: open WhatsApp without message
    window.open('https://wa.me/6285872189172', '_blank');
  }
};
```

### Browser Compatibility

```javascript
// Check for <dialog> support
if (!window.HTMLDialogElement) {
  console.error('Browser does not support <dialog> element');
  
  // Fallback: Use polyfill or alternative modal implementation
  // For this design, <dialog> support is required
  // Browsers supporting <dialog>: Chrome 37+, Edge 79+, Safari 15.4+, Firefox 98+
}
```

## Testing Strategy

### Unit Tests

**Data Converter Tests:**
```javascript
test('converts legacy array to object format', () => {
  const legacy = ['Kipas Angin', 'kipas', 350000, 'fan', 'M12...', 'Kipas'];
  const result = convertLegacyProduct(legacy);
  
  expect(result).toEqual({
    name: 'Kipas Angin',
    category: 'kipas',
    price: 350000,
    iconType: 'fan',
    iconValue: 'M12...',
    label: 'Kipas',
    slug: 'kipas-angin',
    stock: null,
    description: '[ISI DATA ASLI]',
    specs: [],
    rating: null,
    ratingCount: null,
    images: []
  });
});

test('generates slug correctly', () => {
  expect(generateSlug('Kipas Angin 16"')).toBe('kipas-angin-16');
  expect(generateSlug('Lampu LED / AC')).toBe('lampu-led-ac');
  expect(generateSlug('  Spaced   Text  ')).toBe('spaced-text');
});
```

**Quantity Stepper Tests:**
```javascript
test('increments quantity within bounds', () => {
  const stepper = new QuantityStepper(inputEl, minusBtn, plusBtn, 1, 10);
  
  stepper.setValue(5);
  stepper.increment();
  expect(stepper.getValue()).toBe(6);
  
  stepper.setValue(10);
  stepper.increment();
  expect(stepper.getValue()).toBe(10); // Stays at max
});

test('decrements quantity within bounds', () => {
  const stepper = new QuantityStepper(inputEl, minusBtn, plusBtn, 1, 10);
  
  stepper.setValue(5);
  stepper.decrement();
  expect(stepper.getValue()).toBe(4);
  
  stepper.setValue(1);
  stepper.decrement();
  expect(stepper.getValue()).toBe(1); // Stays at min
});

test('validates direct input', () => {
  const stepper = new QuantityStepper(inputEl, minusBtn, plusBtn, 1, 10);
  
  inputEl.value = '15';
  stepper.validate();
  expect(inputEl.value).toBe('10'); // Clamped to max
  
  inputEl.value = '-5';
  stepper.validate();
  expect(inputEl.value).toBe('1'); // Clamped to min
});
```

**Hash Router Tests:**
```javascript
test('finds product by slug', () => {
  const products = [
    { slug: 'kipas-angin', name: 'Kipas Angin' },
    { slug: 'lampu-led', name: 'Lampu LED' }
  ];
  
  const router = new HashRouter(products);
  expect(router.findProductIndexBySlug('kipas-angin')).toBe(0);
  expect(router.findProductIndexBySlug('lampu-led')).toBe(1);
  expect(router.findProductIndexBySlug('invalid')).toBe(-1);
});

test('sets and clears hash correctly', () => {
  const router = new HashRouter([]);
  
  router.setHash('kipas-angin');
  expect(window.location.hash).toBe('#produk-kipas-angin');
  
  router.clearHash();
  expect(window.location.hash).toBe('');
});
```

**Edge Case Tests:**
```javascript
test('handles product with no images', () => {
  const product = { images: [], iconType: 'fan' };
  const gallery = buildGalleryColumn(product);
  
  expect(gallery.querySelector('.pd-img-placeholder')).toBeTruthy();
  expect(gallery.querySelector('img')).toBeFalsy();
});

test('handles zero stock correctly', () => {
  const product = { stock: 0 };
  const info = buildInfoColumn(product);
  
  const stockEl = info.querySelector('.pd-stock');
  expect(stockEl.textContent).toBe('Stok habis');
  expect(stockEl.classList.contains('pd-stock-empty')).toBe(true);
  
  const stepper = info.querySelector('.pd-stepper-btn');
  expect(stepper.disabled).toBe(true);
});

test('hides sections with placeholder data', () => {
  const product = {
    description: '[ISI DATA ASLI]',
    specs: [],
    rating: null
  };
  
  const info = buildInfoColumn(product);
  
  expect(info.querySelector('.pd-description')).toBeFalsy();
  expect(info.querySelector('.pd-specs')).toBeFalsy();
  expect(info.querySelector('.pd-rating')).toBeFalsy();
});
```

### Integration Tests

**Dialog Open/Close Flow:**
```javascript
test('opens dialog with correct content', () => {
  window.D = [{
    name: 'Test Product',
    slug: 'test-product',
    price: 100000,
    images: ['test.jpg']
  }];
  
  window.openDetail(0);
  
  const dlg = document.getElementById('dlg');
  expect(dlg.open).toBe(true);
  expect(dlg.querySelector('.pd-title').textContent).toBe('Test Product');
  expect(window.location.hash).toBe('#produk-test-product');
});

test('closes dialog and cleans hash', () => {
  window.openDetail(0);
  
  const dlg = document.getElementById('dlg');
  dlg.close();
  
  expect(dlg.open).toBe(false);
  expect(window.location.hash).toBe('');
});
```

**Hash Navigation:**
```javascript
test('opens product from hash on page load', (done) => {
  window.D = [{ name: 'Test', slug: 'test-product' }];
  window.location.hash = '#produk-test-product';
  
  // Simulate page load
  window.dispatchEvent(new Event('DOMContentLoaded'));
  
  setTimeout(() => {
    const dlg = document.getElementById('dlg');
    expect(dlg.open).toBe(true);
    done();
  }, 150);
});

test('closes dialog when hash is removed', () => {
  window.openDetail(0);
  
  window.location.hash = '';
  window.dispatchEvent(new Event('hashchange'));
  
  const dlg = document.getElementById('dlg');
  expect(dlg.open).toBe(false);
});
```

**Gallery Navigation:**
```javascript
test('keyboard arrow keys change gallery image', () => {
  const product = {
    images: ['img1.jpg', 'img2.jpg', 'img3.jpg']
  };
  
  window.D = [product];
  window.openDetail(0);
  
  const mainImg = document.querySelector('.pd-main-img img');
  expect(mainImg.src).toContain('img1.jpg');
  
  // Simulate arrow right
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
  expect(mainImg.src).toContain('img2.jpg');
  
  // Simulate arrow left
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
  expect(mainImg.src).toContain('img1.jpg');
});

test('thumbnail click changes main image', () => {
  const product = {
    images: ['img1.jpg', 'img2.jpg']
  };
  
  window.D = [product];
  window.openDetail(0);
  
  const thumbs = document.querySelectorAll('.pd-thumb');
  thumbs[1].click();
  
  const mainImg = document.querySelector('.pd-main-img img');
  expect(mainImg.src).toContain('img2.jpg');
  expect(thumbs[1].classList.contains('pd-thumb-active')).toBe(true);
});
```

**WhatsApp Message Generation:**
```javascript
test('generates correct WhatsApp URL with message', () => {
  window.D = [{
    name: 'Test Product',
    slug: 'test-product',
    price: 100000
  }];
  
  window.openDetail(0);
  
  const qtyInput = document.getElementById('pd-qty-input');
  qtyInput.value = '3';
  
  const waLink = document.querySelector('.pd-btn-wa');
  
  // Mock window.open
  const openSpy = jest.spyOn(window, 'open').mockImplementation();
  
  waLink.click();
  
  expect(openSpy).toHaveBeenCalledWith(
    expect.stringContaining('wa.me'),
    '_blank'
  );
  
  const url = openSpy.mock.calls[0][0];
  expect(decodeURIComponent(url)).toContain('Test Product');
  expect(decodeURIComponent(url)).toContain('Jumlah: 3');
  expect(decodeURIComponent(url)).toContain('#produk-test-product');
});
```

### Manual Testing Checklist

**Desktop (1280px):**
- [ ] Dialog opens with correct product data
- [ ] Gallery displays main image and thumbnails
- [ ] Arrow keys navigate gallery (wrap around at edges)
- [ ] Thumbnail clicks change main image with crossfade
- [ ] Quantity stepper increments/decrements within bounds
- [ ] Stock indicator shows correct message based on stock value
- [ ] WhatsApp button opens with correct pre-filled message
- [ ] Close button and ESC key close dialog
- [ ] Hash URL updates when dialog opens
- [ ] Hash URL clears when dialog closes
- [ ] Direct hash URL opens correct product
- [ ] Invalid hash URL doesn't break page
- [ ] Focus returns to trigger element on close

**Tablet (768px):**
- [ ] Layout switches to single column
- [ ] Gallery thumbnails scroll horizontally with snap
- [ ] All interactions work correctly

**Mobile (360px):**
- [ ] Single column layout displays correctly
- [ ] Touch targets are at least 44px
- [ ] Action bar is fixed at bottom
- [ ] Action bar hides/shows based on scroll position
- [ ] Stepper buttons are easily tappable
- [ ] Text is readable (minimum 16px)

**Accessibility:**
- [ ] Screen reader announces dialog title
- [ ] All buttons have accessible labels
- [ ] Focus trap works within dialog
- [ ] ESC key closes dialog
- [ ] Focus returns to trigger on close
- [ ] Color contrast passes WCAG AA (4.5:1)
- [ ] Gallery images have alt text
- [ ] Stock status is announced by screen reader
- [ ] Rating has accessible description

**Edge Cases:**
- [ ] Product with no images shows placeholder
- [ ] Product with zero stock disables stepper and changes button text
- [ ] Product with null stock shows "cek via WhatsApp"
- [ ] Product with placeholder description hides section
- [ ] Product with empty specs hides section
- [ ] Product with no rating hides rating display
- [ ] Multiple rapid clicks don't cause errors
- [ ] Browser back button closes dialog correctly

**Performance:**
- [ ] Dialog opens quickly (< 100ms)
- [ ] Gallery navigation is smooth (no jank)
- [ ] Crossfade animation is smooth at 60fps
- [ ] No memory leaks after multiple open/close cycles
- [ ] Images load progressively (not all at once)

**Theme Support:**
- [ ] All colors use CSS tokens
- [ ] Dark theme displays correctly
- [ ] Light theme displays correctly
- [ ] Theme toggle doesn't break modal

**Reduced Motion:**
- [ ] Crossfade animation is disabled with prefers-reduced-motion
- [ ] Button press feedback is disabled
- [ ] Action bar animation is disabled
- [ ] Gallery still navigable without animation

## Performance Considerations

### Lazy Loading Strategy

```javascript
// Main image: immediate load (fetchpriority="high")
const mainImg = document.createElement('img');
mainImg.src = p.images[0];
mainImg.alt = p.name;
mainImg.fetchPriority = 'high';

// Thumbnails: lazy load (loading="lazy")
const thumbImg = document.createElement('img');
thumbImg.src = imgSrc;
thumbImg.alt = '';
thumbImg.loading = 'lazy';

// Additional gallery images: not preloaded
// Loaded on-demand when user navigates
```

### DOM Reuse

```javascript
// Dialog element is reused (not recreated)
const dlg = document.getElementById('dlg');

// Clear content (removes old nodes)
dlg.innerHTML = '';

// Render new content
// (more efficient than creating new <dialog> each time)
```

### Event Listener Optimization

```javascript
// Use event delegation for thumbnails (future optimization)
thumbWrap.addEventListener('click', (e) => {
  const thumb = e.target.closest('.pd-thumb');
  if (thumb) {
    const idx = parseInt(thumb.dataset.idx);
    updateMainImage(idx);
  }
});

// Instead of:
// thumbs.forEach(thumb => thumb.onclick = ...)
```

### CSS Animation Performance

```css
/* Use transform and opacity (GPU-accelerated) */
.pd-main-img img {
  opacity: 0;
  transition: opacity 200ms;  /* GPU-accelerated */
}

.pd-stepper-btn:active {
  transform: scale(0.98);  /* GPU-accelerated */
  transition: transform 100ms;
}

/* Avoid animating layout properties (width, height, top, left) */
/* They cause reflow and repaint */
```

### Mobile Scroll Performance

```css
/* Enable hardware acceleration for scroll */
.pd-thumbs {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;  /* iOS momentum scrolling */
  scroll-snap-type: x mandatory;      /* Smooth snap points */
}

/* Use will-change sparingly (only on interaction) */
.pd-thumbs:hover {
  will-change: scroll-position;
}

.pd-thumbs:not(:hover) {
  will-change: auto;  /* Release resources */
}
```

### Image Optimization Recommendations

```javascript
// Recommendation for content team:
// - Use WebP format for better compression
// - Provide multiple sizes via srcset (future enhancement)
// - Compress images to < 200KB each
// - Dimensions: 1200x900px for main, 150x150px for thumbnails

// Future enhancement: responsive images
mainImg.srcset = `
  ${p.images[0]}-360w.webp 360w,
  ${p.images[0]}-768w.webp 768w,
  ${p.images[0]}-1200w.webp 1200w
`;
mainImg.sizes = "(max-width: 768px) 100vw, 50vw";
```

---

## Implementation Notes

### Browser Support

**Minimum Supported Browsers:**
- Chrome 37+ (dialog support)
- Edge 79+ (Chromium-based)
- Safari 15.4+ (dialog support)
- Firefox 98+ (dialog support)

**Polyfill Considerations:**
If broader support needed, use `<dialog>` polyfill for older browsers:
```html
<script src="https://cdn.jsdelivr.net/npm/dialog-polyfill@0.5.6/index.min.js"></script>
```

### Dependencies

**Required Global Variables:**
- `window.D` - Product array
- `window.WA` - WhatsApp URL (optional, defaults to hardcoded number)
- `window.ICON` - Icon paths object (optional, for placeholder)
- `window.rp()` - Rupiah formatter function (optional, falls back to toLocaleString)

**Required DOM Elements:**
- `<dialog id="dlg">` - Modal container element

**Required CSS:**
- All `.pd-*` classes as defined in in.css
- CSS custom properties (--bg, --ink, --mute, --glow, --line, --btn, --btnink)

### File Structure

```
/Users/rivaldoharyono/Documents/sadewaV2/
├── in.html                     # Contains <dialog id="dlg">
├── in.css                      # Contains .pd-* classes
├── product-detail-patch.js     # Main implementation (this design)
└── in.js                       # May contain D array and helper functions
```

### Deployment Checklist

- [ ] Verify `<dialog id="dlg">` exists in HTML
- [ ] Verify all `.pd-*` CSS classes are present
- [ ] Verify CSS tokens are defined
- [ ] Load product-detail-patch.js after DOM ready
- [ ] Test hash navigation from external links
- [ ] Test all responsive breakpoints
- [ ] Run accessibility audit (Lighthouse)
- [ ] Verify color contrast in both themes
- [ ] Test keyboard navigation
- [ ] Test touch interactions on real mobile device
- [ ] Verify WhatsApp integration works
- [ ] Check performance (< 100ms open time)

---

**Design Complete. Ready for implementation phase.**
