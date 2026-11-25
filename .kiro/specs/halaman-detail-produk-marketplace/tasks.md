# Implementation Plan: Halaman Detail Produk Marketplace

## Overview

Halaman Detail Produk Marketplace adalah sistem modal interaktif yang menampilkan informasi lengkap produk dengan galeri foto navigable, kontrol jumlah pemesanan, indikator stok real-time, dan integrasi WhatsApp. Implementasi menggunakan pendekatan patch yang menggantikan fungsi `openDetail()` legacy dan menambahkan fitur interaktif modern.

**Base implementation sudah lengkap** (Task 1). Tasks berikut fokus pada interactive enhancements, mobile optimizations, edge cases, dan accessibility improvements.

## Tasks

- [x] 1. Base Structure & Layout
  - [x] 1.1 Create data converter and slug generator
    - Convert legacy array `[name, category, price, iconType, iconValue, label]` to extended object format
    - Generate URL-friendly slug from product name (lowercase, hyphen-separated, no leading/trailing hyphens)
    - Apply conversion to `window.D` array on module load
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
    - _Status: COMPLETED in `product-detail-patch.js` lines 2-23_
  - [x] 1.2 Build main render function with 2-column layout
    - Replace `window.openDetail(index)` function
    - Create dialog container with close button (form method="dialog")
    - Build 2-column grid container (5fr gallery : 7fr info)
    - Implement gallery column with main image display and thumbnails (up to 5)
    - Implement info column with category, title, rating, price, description, specs
    - _Requirements: 1.1, 2.1, 4.6_
    - _Status: COMPLETED in `product-detail-patch.js` lines 25-278_
  - [x] 1.3 Implement quantity stepper component
    - Create stepper UI with minus button, number input, plus button
    - Implement plus button handler (increment with max boundary)
    - Implement minus button handler (decrement with min boundary of 1)
    - Set input min=1, max=stock or 999
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
    - _Status: COMPLETED in `product-detail-patch.js` lines 185-220_
  - [x] 1.4 Implement stock indicator display
    - Render stock message based on stock value: null → "cek via WhatsApp", 0 → "Stok habis" + empty class, <10 → "tersisa X unit" + low class, ≥10 → "tersedia"
    - Apply appropriate CSS classes for styling (pd-stock-empty, pd-stock-low)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
    - _Status: COMPLETED in `product-detail-patch.js` lines 222-236_
  - [x] 1.5 Create WhatsApp integration with basic message
    - Build WhatsApp action button
    - Generate message with product name, quantity, and URL with hash
    - Open WhatsApp in new tab with pre-filled message using `window.WA` or fallback number
    - _Requirements: 3.1, 3.2, 3.3_
    - _Status: COMPLETED in `product-detail-patch.js` lines 238-256_
  - [x] 1.6 Implement CSS styling for all components
    - Create `.pd-*` classes for all product detail components
    - Use CSS tokens (var(--bg), var(--ink), var(--mute), var(--glow), var(--line), var(--btn), var(--btnink))
    - Implement 2-column desktop layout with sticky gallery
    - Create pill-shaped buttons (border-radius: 999px)
    - _Requirements: 9.4, 9.5_
    - _Status: COMPLETED in `in.css` lines 1268-1602_
  - [x] 1.7 Implement responsive mobile layout
    - Switch to single-column layout on max-width: 768px
    - Make gallery position static (remove sticky)
    - Create fixed bottom action bar with appropriate spacing
    - Adjust thumbnail sizes for mobile (60px)
    - Add padding-bottom to info column for fixed bar clearance
    - _Requirements: 4.1, 4.3_
    - _Status: COMPLETED in `in.css` lines 1541-1597_

- [x] 2. Gallery Interactive Navigation
  - [x] 2.1 Implement keyboard arrow navigation for gallery
    - Add global keydown listener that checks if dialog is open
    - Implement ArrowRight handler to show next image with wrap-around to first
    - Implement ArrowLeft handler to show previous image with wrap-around to last
    - Prevent default page scroll behavior when arrow keys are pressed
    - Track current image index in closure or module state
    - _Requirements: 1.3, 1.4, 1.5, 1.6_
    - _File: `product-detail-patch.js`_
  - [x] 2.2 Implement crossfade animation for image transitions
    - Create updateMainImage() function that removes pd-img-active class
    - Use setTimeout 10ms before updating src and re-adding pd-img-active class
    - Check prefers-reduced-motion media query before applying animation
    - If reduced-motion is preferred, update src directly without animation
    - Apply animation to both keyboard navigation and thumbnail clicks
    - _Requirements: 1.2, 1.7_
    - _File: `product-detail-patch.js`, `in.css` (lines 1297-1308)_
  - [x] 2.3 Update active thumbnail styling during navigation
    - Create updateActiveThumbnail(index) helper function
    - Remove pd-thumb-active class from all thumbnails
    - Add pd-thumb-active class to thumbnail at current index
    - Call this function from keyboard handlers and thumbnail click handlers
    - _Requirements: 9.2_
    - _File: `product-detail-patch.js`_

- [x] 3. URL Hash Router Implementation
  - [x] 3.1 Implement hash update on dialog open
    - Update window.location.hash with format `#produk-[slug]` when dialog opens
    - Use product slug generated from data converter
    - _Requirements: 2.1_
    - _Status: PARTIAL - Hash is set, but needs integration with crossfade_
    - _File: `product-detail-patch.js` line 32_
  - [x] 3.2 Implement hash navigation on page load and hashchange
    - Add hashchange event listener to window
    - Parse hash to extract slug (remove "produk-" prefix)
    - Find product index by matching slug in window.D array
    - Call openDetail(index) if product is found
    - Add initial hash check after DOM ready with 100ms delay
    - _Requirements: 2.2_
    - _Status: COMPLETED in `product-detail-patch.js` lines 259-293_
    - _File: `product-detail-patch.js`_
  - [x] 3.3 Implement hash cleanup on dialog close
    - Add close event listener to dialog element
    - Use history.replaceState to remove hash without creating history entry
    - Preserve pathname and search parameters
    - Handle both explicit close button and ESC key (native dialog behavior)
    - _Requirements: 2.3_
    - _Status: COMPLETED in `product-detail-patch.js` lines 269-289_
    - _File: `product-detail-patch.js`_
  - [x] 3.4 Handle invalid hash navigation gracefully
    - Check if slug exists in window.D array before opening dialog
    - If slug not found, do nothing (dialog stays closed)
    - Optionally clean invalid hash from URL using replaceState
    - _Requirements: 2.4_
    - _File: `product-detail-patch.js`_

- [x] 4. Mobile Enhancements
  - [x] 4.1 Implement horizontal scroll-snap for mobile gallery
    - Add scroll-snap-type: x mandatory to .pd-thumbs for mobile
    - Add scroll-snap-align: start to .pd-thumb
    - Enable -webkit-overflow-scrolling: touch for iOS momentum
    - _Requirements: 4.2_
    - _File: `in.css`_
  - [x] 4.2 Implement IntersectionObserver for action bar visibility
    - Create observer targeting top of info section
    - Add/remove "hidden" class on action bar based on intersection
    - Configure rootMargin to trigger before element is fully out of view
    - Only initialize observer on mobile viewport (max-width: 768px)
    - Clean up observer on dialog close
    - _Requirements: 4.4, 4.5_
    - _File: `product-detail-patch.js`, `in.css`_
  - [x] 4.3 Add slide animation for mobile action bar
    - Create CSS transition for transform: translateY
    - Apply transform: translateY(100%) when .hidden class is present
    - Use cubic-bezier(0.2, 0.8, 0.2, 1) easing and 250ms duration
    - Respect prefers-reduced-motion preference (disable animation)
    - _Requirements: 4.4, 4.5_
    - _File: `in.css`_

- [x] 5. Edge Cases & Data Validation
  - [x] 5.1 Handle zero stock products
    - Disable quantity stepper buttons and input when stock === 0
    - Change WhatsApp button text to "Tanya ketersediaan"
    - Modify WhatsApp message to inquiry format (remove quantity)
    - Apply pd-stock-empty class to stock indicator
    - _Requirements: 5.2, 5.5, 5.6_
    - _File: `product-detail-patch.js`_
  - [x] 5.2 Handle products with no images
    - Check if images array is empty or null
    - Render placeholder SVG div with iconType from product data
    - Use window.ICON object to get SVG path, fallback to window.ICON.qty
    - Apply pd-img-placeholder class for styling
    - _Requirements: 8.1, 8.2_
    - _Status: COMPLETED in `product-detail-patch.js` lines 69-74_
    - _File: `product-detail-patch.js`_
  - [x] 5.3 Hide sections with placeholder or missing data
    - Skip description section if value is "[ISI DATA ASLI]" or null
    - Skip specs section if array is empty or null
    - Skip rating section if rating or ratingCount is null
    - Ensure clean UI without empty sections
    - _Requirements: 8.3, 8.4, 8.5_
    - _Status: PARTIAL - Checks exist but need testing_
    - _File: `product-detail-patch.js` lines 125-173_
  - [x] 5.4 Implement quantity input validation
    - Add input event listener to quantity input
    - Validate that value is between 1 and max stock
    - Clamp invalid values to nearest boundary
    - Handle NaN by resetting to minimum value of 1
    - _Requirements: 6.5_
    - _File: `product-detail-patch.js`_
  - [x] 5.5 Handle product not found error
    - Add null check at start of openDetail(index)
    - Return early with console.warn if product doesn't exist
    - Do not attempt to render dialog
    - _Requirements: 8.6_
    - _Status: COMPLETED in `product-detail-patch.js` line 26_
    - _File: `product-detail-patch.js`_
  - [x] 5.6 Implement image load error handling
    - Add onerror handler to main image element
    - Replace failed image with placeholder SVG on error
    - Use same placeholder logic as no-images case
    - _File: `product-detail-patch.js`_

- [x] 6. Accessibility Improvements
  - [x] 6.1 Implement focus trap and restoration
    - Verify native dialog focus trap is working (automatic with <dialog>)
    - Store reference to trigger element before opening dialog
    - Restore focus to trigger element on dialog close
    - Test with Tab and Shift+Tab keyboard navigation
    - _Requirements: 7.1, 7.3_
    - _File: `product-detail-patch.js`_
  - [x] 6.2 Add ESC key handling
    - Verify native dialog ESC key behavior (automatic with <dialog>)
    - Ensure hash cleanup occurs when ESC is pressed
    - Test that focus is restored correctly
    - _Requirements: 7.2_
    - _Status: PARTIAL - Native behavior works, hash cleanup needs verification_
    - _File: `product-detail-patch.js`_
  - [x] 6.3 Add ARIA labels and roles
    - Verify dialog has aria-labelledby="dt" (product title)
    - Verify gallery has role="img" and aria-label
    - Verify thumbnails group has role="group" and aria-label
    - Verify all buttons have aria-label attributes
    - Verify quantity input has proper label association
    - _Requirements: 7.4, 7.5_
    - _Status: COMPLETED in `product-detail-patch.js` lines 36-37, 51-52, 61-62, 93-94, 177-178, 189-194_
    - _File: `product-detail-patch.js`_
  - [x] 6.4 Add screen reader announcement for rating
    - Add role="img" to rating container
    - Add aria-label with format "Rating [X] dari 5, [Y] ulasan"
    - Mark visual stars with aria-hidden="true"
    - _Requirements: 7.8_
    - _File: `product-detail-patch.js`_
  - [x] 6.5 Verify color contrast compliance
    - Test primary text (var(--ink) on var(--bg)) achieves 4.5:1 minimum
    - Test secondary text (var(--mute) on var(--bg)) achieves 4.5:1 minimum
    - Test button borders (var(--line) on var(--bg)) achieves 3:1 for non-text
    - Test focus outline (var(--glow) on var(--bg)) achieves 3:1 minimum
    - Test semantic colors (stock-empty, stock-low) on both light and dark themes
    - _Requirements: 7.7_
    - _File: Manual testing with browser DevTools or WebAIM Contrast Checker_
  - [x] 6.6 Verify touch target sizing
    - Confirm all interactive elements meet 44px minimum
    - Verify stepper buttons are 44x44px on mobile
    - Verify thumbnails are at least 60x60px on mobile
    - Verify WhatsApp button has min-height: 48px
    - _Requirements: 7.6_
    - _Status: COMPLETED in `in.css` lines 1458-1471, 1559-1563, 1526-1531_
    - _File: `in.css`_

- [x] 7. Performance Optimizations
  - [x] 7.1 Implement lazy loading for thumbnails
    - Add loading="lazy" attribute to thumbnail images
    - Keep main image with immediate load (fetchpriority="high")
    - Test that thumbnails only load when in viewport
    - _Requirements: 11.2_
    - _File: `product-detail-patch.js`_
  - [x] 7.2 Add will-change optimization sparingly
    - Only apply will-change to elements during active interaction
    - Remove will-change after interaction completes
    - Avoid persistent will-change declarations
    - _File: `in.css`_
  - [x] 7.3 Verify DOM reuse strategy
    - Confirm dialog element is reused (not recreated) on each open
    - Confirm innerHTML clearing removes old event listeners
    - Test for memory leaks by opening/closing dialog multiple times
    - _Requirements: 11.4, 11.5_
    - _Status: COMPLETED - Dialog element is reused via getElementById_
    - _File: `product-detail-patch.js`_

- [x] 8. Testing & Verification Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- **Task 1 is marked COMPLETED** because all base structure, layout, and styling are already implemented in `product-detail-patch.js` and `in.css`
- Tasks 2-7 focus on interactive enhancements, mobile optimizations, edge cases, and accessibility
- Each task references specific requirements from `requirements.md`
- File paths are provided for each modification
- Hash URL routing (Task 3.2, 3.3) is already implemented but needs integration with crossfade animation
- Mobile responsive CSS is complete, but IntersectionObserver logic needs to be added for action bar animation
- Edge case handlers are partially implemented and need completion/testing
- Accessibility attributes are mostly in place, but need verification and screen reader testing
- All CSS uses design tokens as required by rules-ui.md
- No optional test tasks included per workflow requirements

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["2.1", "3.1", "3.2", "3.3", "5.2", "5.5", "6.3", "6.6", "7.3"]
    },
    {
      "id": 1,
      "tasks": ["2.2", "3.4", "5.3", "6.1"]
    },
    {
      "id": 2,
      "tasks": ["2.3", "4.1", "5.1", "5.4", "6.2", "6.4", "7.1"]
    },
    {
      "id": 3,
      "tasks": ["4.2", "5.6", "6.5", "7.2"]
    },
    {
      "id": 4,
      "tasks": ["4.3"]
    },
    {
      "id": 5,
      "tasks": ["8"]
    }
  ]
}
```
