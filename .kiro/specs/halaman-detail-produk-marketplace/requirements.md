# Requirements Document

## Introduction

Halaman Detail Produk Marketplace adalah fitur yang menampilkan informasi lengkap tentang satu produk dalam dialog modal. Fitur ini meliputi galeri foto interaktif, informasi produk (nama, harga, rating, deskripsi, spesifikasi), kontrol jumlah pemesanan, indikator stok, dan tombol aksi WhatsApp. Halaman detail dapat dibagikan melalui URL dengan hash slug, mendukung navigasi keyboard, dan responsif untuk mobile dan desktop.

## Glossary

- **Product_Detail_System**: Sistem yang menampilkan informasi detail produk dalam dialog modal
- **Gallery_Component**: Komponen yang menampilkan foto produk utama dan thumbnail
- **URL_Router**: Komponen yang mengelola hash URL untuk sharing dan navigation
- **Quantity_Stepper**: Komponen kontrol plus/minus untuk memilih jumlah produk
- **Stock_Indicator**: Komponen yang menampilkan status ketersediaan stok
- **WhatsApp_Action**: Tombol yang membuka WhatsApp dengan pesan pre-filled
- **Main_Image**: Foto produk yang sedang ditampilkan dalam ukuran besar
- **Thumbnail**: Foto produk dalam ukuran kecil untuk navigasi galeri
- **Slug**: String URL-friendly yang dihasilkan dari nama produk
- **Hash_URL**: URL dengan fragment identifier (#produk-[slug])
- **Dialog_Modal**: Elemen `<dialog>` HTML native untuk menampilkan konten
- **Mobile_Action_Bar**: Bar fixed di bottom layar mobile yang berisi tombol aksi
- **Crossfade_Animation**: Transisi opacity saat mengganti foto galeri
- **Focus_Trap**: Mekanisme yang menjaga keyboard focus di dalam dialog

## Requirements

### Requirement 1: Gallery Navigation

**User Story:** As a user, I want to navigate product photos using keyboard or thumbnail clicks, so that I can view all product images easily.

#### Acceptance Criteria

1. WHEN a user clicks a thumbnail, THE Gallery_Component SHALL display the corresponding photo as Main_Image
2. WHEN Main_Image changes, THE Gallery_Component SHALL apply Crossfade_Animation with 200ms duration
3. WHEN a user presses arrow right key, THE Gallery_Component SHALL display the next photo in sequence
4. WHEN a user presses arrow left key, THE Gallery_Component SHALL display the previous photo in sequence
5. WHEN the current photo is the last photo and arrow right is pressed, THE Gallery_Component SHALL wrap to the first photo
6. WHEN the current photo is the first photo and arrow left is pressed, THE Gallery_Component SHALL wrap to the last photo
7. WHILE user has prefers-reduced-motion enabled, THE Gallery_Component SHALL disable Crossfade_Animation

### Requirement 2: URL Sharing and Navigation

**User Story:** As a user, I want to share a direct link to a product, so that others can view the same product immediately.

#### Acceptance Criteria

1. WHEN a product detail is opened, THE URL_Router SHALL update the browser URL with Hash_URL format #produk-[slug]
2. WHEN a page loads with a valid Hash_URL, THE URL_Router SHALL open the corresponding product detail automatically
3. WHEN the Dialog_Modal is closed, THE URL_Router SHALL remove the Hash_URL from browser history
4. WHEN a Hash_URL contains a non-existent slug, THE URL_Router SHALL not open any dialog
5. THE URL_Router SHALL generate Slug by converting product name to lowercase, replacing non-alphanumeric characters with hyphens, and removing leading or trailing hyphens

### Requirement 3: WhatsApp Integration

**User Story:** As a user, I want to order products via WhatsApp with pre-filled message, so that I can complete my order quickly.

#### Acceptance Criteria

1. WHEN a user clicks the WhatsApp button, THE WhatsApp_Action SHALL open WhatsApp with a message containing product name, selected quantity, and Hash_URL
2. WHEN quantity is changed in Quantity_Stepper, THE WhatsApp_Action SHALL reflect the updated quantity in the generated message
3. THE WhatsApp_Action SHALL format the message as: "Halo, saya mau pesan:\n[product name]\nJumlah: [quantity]\nLink: [full URL with hash]"

### Requirement 4: Mobile Responsive Layout

**User Story:** As a mobile user, I want the product detail to display properly on my phone, so that I can view and order products comfortably.

#### Acceptance Criteria

1. WHEN viewport width is less than 768px, THE Product_Detail_System SHALL display layout in single column format
2. WHEN viewport width is less than 768px, THE Gallery_Component SHALL enable horizontal scroll with scroll-snap behavior
3. WHEN viewport width is less than 768px, THE Mobile_Action_Bar SHALL display as fixed position at bottom of viewport
4. WHEN user scrolls down on mobile, THE Mobile_Action_Bar SHALL appear with upward slide animation
5. WHEN user scrolls to top on mobile, THE Mobile_Action_Bar SHALL hide with downward slide animation
6. WHEN viewport width is 768px or greater, THE Product_Detail_System SHALL display two-column layout with gallery on left and info on right

### Requirement 5: Stock Management Display

**User Story:** As a user, I want to see stock availability, so that I can decide whether to order the product.

#### Acceptance Criteria

1. WHEN a product has null stock value, THE Stock_Indicator SHALL display "Stok: cek langsung lewat WhatsApp"
2. WHEN a product has zero stock, THE Stock_Indicator SHALL display "Stok habis" with visual emphasis
3. WHEN a product has stock less than 10 and greater than zero, THE Stock_Indicator SHALL display "Stok tersisa [number] unit" with low stock warning style
4. WHEN a product has stock 10 or greater, THE Stock_Indicator SHALL display "Stok tersedia"
5. WHEN a product has zero stock, THE Quantity_Stepper SHALL be disabled
6. WHEN a product has zero stock, THE WhatsApp_Action SHALL change button text to "Tanya ketersediaan"

### Requirement 6: Quantity Control

**User Story:** As a user, I want to select how many items I want to order, so that I can order the correct quantity.

#### Acceptance Criteria

1. WHEN a user clicks the plus button, THE Quantity_Stepper SHALL increment the quantity by 1
2. WHEN a user clicks the minus button, THE Quantity_Stepper SHALL decrement the quantity by 1
3. WHEN quantity reaches 1 and minus is clicked, THE Quantity_Stepper SHALL maintain quantity at 1
4. WHEN quantity reaches maximum stock and plus is clicked, THE Quantity_Stepper SHALL maintain quantity at maximum stock
5. WHEN a user types directly in the quantity input, THE Quantity_Stepper SHALL validate that value is between 1 and maximum stock
6. THE Quantity_Stepper SHALL initialize with quantity value of 1 when dialog opens

### Requirement 7: Accessibility Compliance

**User Story:** As a user with assistive technology, I want the product detail to be accessible, so that I can browse and order products independently.

#### Acceptance Criteria

1. WHEN Dialog_Modal opens, THE Product_Detail_System SHALL trap keyboard focus within the dialog
2. WHEN a user presses Escape key, THE Dialog_Modal SHALL close
3. WHEN Dialog_Modal closes, THE Product_Detail_System SHALL return focus to the element that triggered the dialog
4. THE Gallery_Component SHALL provide alt text for all Main_Image elements
5. THE Quantity_Stepper SHALL provide aria-label for plus and minus buttons
6. THE Product_Detail_System SHALL ensure all interactive elements have minimum 44px touch target size
7. THE Product_Detail_System SHALL maintain minimum 4.5:1 color contrast ratio for all text
8. WHEN a rating is displayed, THE Product_Detail_System SHALL provide screen reader announcement with rating value and count

### Requirement 8: Edge Case Handling

**User Story:** As a system, I want to handle missing or invalid data gracefully, so that the user experience remains smooth.

#### Acceptance Criteria

1. WHEN a product has no images array, THE Gallery_Component SHALL display placeholder SVG using existing icon
2. WHEN a product has empty images array, THE Gallery_Component SHALL display placeholder SVG using existing icon
3. WHEN a product has description value of "[ISI DATA ASLI]", THE Product_Detail_System SHALL hide the description section
4. WHEN a product has null or empty specs array, THE Product_Detail_System SHALL hide the specifications section
5. WHEN a product has null rating or ratingCount, THE Product_Detail_System SHALL hide the rating display
6. IF product data is completely missing from array, THEN THE Product_Detail_System SHALL not render any dialog content

### Requirement 9: Visual Feedback and Interaction

**User Story:** As a user, I want immediate visual feedback when I interact with buttons, so that I know my action was registered.

#### Acceptance Criteria

1. WHEN a user presses any button, THE Product_Detail_System SHALL apply scale transform to 0.98 for maximum 100ms
2. WHEN a thumbnail is selected, THE Gallery_Component SHALL apply active state visual style
3. WHEN Main_Image loads, THE Gallery_Component SHALL apply fade-in effect
4. THE Product_Detail_System SHALL use CSS tokens var(--bg), var(--ink), var(--mute), var(--line), var(--glow), var(--btn), var(--btnink) for all colors
5. THE Product_Detail_System SHALL apply border-radius 999px for all pill-shaped buttons

### Requirement 10: Data Structure Compatibility

**User Story:** As a system, I want to support both legacy array format and new object format, so that existing product data continues to work.

#### Acceptance Criteria

1. WHEN product data is in legacy array format [name, category, price, iconType, iconValue, label], THE Product_Detail_System SHALL convert it to object format with stock: null, description: "[ISI DATA ASLI]", specs: [], rating: null, ratingCount: null, images: []
2. WHEN product data is already in object format, THE Product_Detail_System SHALL use it directly without conversion
3. THE Product_Detail_System SHALL generate Slug for all products regardless of original format
4. THE Product_Detail_System SHALL maintain backward compatibility with existing openDetail(index) function signature

### Requirement 11: Performance and Resource Management

**User Story:** As a user on a slow connection, I want images to load efficiently, so that I can view product details quickly.

#### Acceptance Criteria

1. WHEN Dialog_Modal opens, THE Gallery_Component SHALL load Main_Image immediately
2. WHEN Dialog_Modal opens, THE Gallery_Component SHALL lazy-load thumbnail images
3. WHEN user has not interacted with gallery, THE Gallery_Component SHALL not preload non-visible photos
4. THE Product_Detail_System SHALL clean up event listeners when dialog closes
5. THE Product_Detail_System SHALL reuse existing dialog element instead of creating new instances
