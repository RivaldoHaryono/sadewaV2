/* ===== PATCH: HALAMAN DETAIL PRODUK MARKETPLACE V2 ===== */
(function () {
  // Convert legacy D array to new format dengan lazy loading
  const originalD = window.D || [];
  window.D = originalD.map(([name, category, price, iconType, iconValue, label]) => ({
    name,
    category,
    price,
    iconType,
    iconValue,
    label,
    stock: null,
    description: "[ISI DATA ASLI]",
    specs: [],
    rating: null,
    ratingCount: null,
    images: [],
    slug: name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }));

  // Module state untuk keyboard navigation
  let currentImageIndex = 0;
  let currentProduct = null;
  let galleryElements = null;
  let focusedElementBeforeModal = null;

  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Helper function untuk navigasi gambar dengan crossfade
  function navigateToImage(newIndex) {
    if (!galleryElements || !currentProduct || !currentProduct.images || currentProduct.images.length === 0) {
      return;
    }

    const totalImages = currentProduct.images.length;
    currentImageIndex = ((newIndex % totalImages) + totalImages) % totalImages;

    const mainImg = galleryElements.mainImgWrap.querySelector("img");
    if (mainImg) {
      // Crossfade animation (skip jika reduced-motion)
      if (!prefersReducedMotion) {
        mainImg.classList.remove("pd-img-active");
        setTimeout(() => {
          mainImg.src = currentProduct.images[currentImageIndex];
          mainImg.classList.add("pd-img-active");
        }, 10);
      } else {
        mainImg.src = currentProduct.images[currentImageIndex];
      }
    }

    // Update active thumbnail
    if (galleryElements.thumbWrap) {
      galleryElements.thumbWrap.querySelectorAll(".pd-thumb").forEach((t, idx) => {
        if (idx === currentImageIndex) {
          t.classList.add("pd-thumb-active");
        } else {
          t.classList.remove("pd-thumb-active");
        }
      });
    }
  }

  // Helper function untuk validasi quantity input
  function validateQuantity(input) {
    const val = parseInt(input.value) || 1;
    const min = parseInt(input.min) || 1;
    const max = parseInt(input.max) || 999;
    
    if (val < min) {
      input.value = min;
    } else if (val > max) {
      input.value = max;
    } else if (isNaN(val)) {
      input.value = min;
    } else {
      input.value = val;
    }
  }

  // Replace openDetail function
  window.openDetail = function openDetailMarketplace(index) {
    const p = window.D[index];
    if (!p) {
      console.warn(`Product at index ${index} not found`);
      return;
    }

    // Store focus element untuk restoration
    focusedElementBeforeModal = document.activeElement;

    // Initialize module state
    currentProduct = p;
    currentImageIndex = 0;
    galleryElements = null;

    const dlg = document.getElementById("dlg");
    if (!dlg) {
      console.error("Dialog element #dlg not found");
      return;
    }

    // Update hash URL
    window.location.hash = `produk-${p.slug}`;

    // Bersihkan dialog
    dlg.innerHTML = "";

    // === HEADER CLOSE ===
    const closeForm = document.createElement("form");
    closeForm.method = "dialog";
    const closeBtn = document.createElement("button");
    closeBtn.className = "x pd-close";
    closeBtn.textContent = "Tutup";
    closeBtn.setAttribute("aria-label", "Tutup detail produk");
    closeForm.appendChild(closeBtn);
    dlg.appendChild(closeForm);

    // === CONTAINER 2-KOLOM ===
    const container = document.createElement("div");
    container.className = "pd-container";

    // === KOLOM KIRI: GALERI ===
    const galleryCol = document.createElement("div");
    galleryCol.className = "pd-gallery";

    // Main image
    const mainImgWrap = document.createElement("div");
    mainImgWrap.className = "pd-main-img";
    mainImgWrap.setAttribute("role", "img");
    mainImgWrap.setAttribute("aria-label", "Foto produk " + p.name);
    mainImgWrap.setAttribute("aria-live", "polite");

    // Check for valid images array
    const hasImages = p.images && Array.isArray(p.images) && p.images.length > 0;

    if (hasImages) {
      const mainImg = document.createElement("img");
      mainImg.src = p.images[0];
      mainImg.alt = p.name;
      mainImg.className = "pd-img-active";
      mainImg.loading = "eager";
      
      // Error handling untuk image load failure
      mainImg.onerror = () => {
        console.warn(`Failed to load image: ${mainImg.src}`);
        // Replace dengan placeholder
        const placeholder = document.createElement("div");
        placeholder.className = "pd-img-placeholder";
        const iconPath = window.ICON ? window.ICON[p.iconType] || window.ICON.qty : "";
        placeholder.innerHTML = `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="${iconPath}"/></svg>`;
        mainImgWrap.innerHTML = "";
        mainImgWrap.appendChild(placeholder);
      };
      
      mainImgWrap.appendChild(mainImg);
    } else {
      // Placeholder SVG when no images available
      const placeholder = document.createElement("div");
      placeholder.className = "pd-img-placeholder";
      const iconPath = window.ICON ? window.ICON[p.iconType] || window.ICON.qty : "";
      placeholder.innerHTML = `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="${iconPath}"/></svg>`;
      mainImgWrap.appendChild(placeholder);
    }

    galleryCol.appendChild(mainImgWrap);

    // Thumbnails - only show when multiple images exist
    let thumbWrap = null;
    if (hasImages && p.images.length > 1) {
      thumbWrap = document.createElement("div");
      thumbWrap.className = "pd-thumbs";
      thumbWrap.setAttribute("role", "group");
      thumbWrap.setAttribute("aria-label", "Thumbnail gambar");

      p.images.slice(0, 5).forEach((imgSrc, idx) => {
        const thumbBtn = document.createElement("button");
        thumbBtn.type = "button";
        thumbBtn.className =
          "pd-thumb" + (idx === 0 ? " pd-thumb-active" : "");
        thumbBtn.setAttribute("aria-label", `Lihat gambar ${idx + 1}`);
        thumbBtn.setAttribute("aria-pressed", idx === 0 ? "true" : "false");
        thumbBtn.dataset.idx = idx;

        const thumbImg = document.createElement("img");
        thumbImg.src = imgSrc;
        thumbImg.alt = "";
        thumbImg.loading = "lazy";
        thumbBtn.appendChild(thumbImg);

        thumbBtn.onclick = () => {
          currentImageIndex = idx;
          navigateToImage(idx);
          
          // Update aria-pressed
          thumbWrap.querySelectorAll(".pd-thumb").forEach((t, i) => {
            t.setAttribute("aria-pressed", i === idx ? "true" : "false");
          });
        };

        thumbWrap.appendChild(thumbBtn);
      });

      galleryCol.appendChild(thumbWrap);
    }

    // Store gallery elements untuk keyboard navigation
    galleryElements = {
      mainImgWrap: mainImgWrap,
      thumbWrap: thumbWrap
    };

    container.appendChild(galleryCol);

    // === KOLOM KANAN: INFO ===
    const infoCol = document.createElement("div");
    infoCol.className = "pd-info";

    // Label kategori
    const categoryLabel = document.createElement("small");
    categoryLabel.className = "pd-category";
    categoryLabel.textContent = p.label || p.category;
    infoCol.appendChild(categoryLabel);

    // Nama produk
    const title = document.createElement("h2");
    title.className = "pd-title";
    title.id = "dt";
    title.textContent = p.name;
    infoCol.appendChild(title);

    // Rating (jika ada) dengan screen reader support
    if (p.rating && p.ratingCount) {
      const ratingWrap = document.createElement("div");
      ratingWrap.className = "pd-rating";
      ratingWrap.setAttribute("role", "group");
      ratingWrap.setAttribute("aria-label", `Rating ${p.rating} dari 5 bintang, ${p.ratingCount} ulasan`);
      
      const stars = "★".repeat(Math.floor(p.rating)) + "☆".repeat(5 - Math.floor(p.rating));
      const ratingStars = document.createElement("span");
      ratingStars.className = "pd-rating-stars";
      ratingStars.setAttribute("aria-hidden", "true");
      ratingStars.textContent = stars;
      
      const ratingText = document.createElement("span");
      ratingText.className = "pd-rating-text";
      ratingText.textContent = `${p.rating} (${p.ratingCount} ulasan)`;
      
      ratingWrap.appendChild(ratingStars);
      ratingWrap.appendChild(ratingText);
      infoCol.appendChild(ratingWrap);
    }

    // Harga
    const priceEl = document.createElement("div");
    priceEl.className = "pd-price";
    priceEl.textContent = window.rp ? window.rp(p.price) : `Rp ${p.price.toLocaleString("id-ID")}`;
    infoCol.appendChild(priceEl);

    // Deskripsi (hide jika placeholder)
    if (p.description && p.description !== "[ISI DATA ASLI]") {
      const descTitle = document.createElement("h3");
      descTitle.className = "pd-section-title";
      descTitle.textContent = "Deskripsi";
      infoCol.appendChild(descTitle);

      const descText = document.createElement("p");
      descText.className = "pd-description";
      descText.textContent = p.description;
      infoCol.appendChild(descText);
    }

    // Spesifikasi (hide jika kosong)
    if (p.specs && Array.isArray(p.specs) && p.specs.length > 0) {
      const specsTitle = document.createElement("h3");
      specsTitle.className = "pd-section-title";
      specsTitle.textContent = "Spesifikasi";
      infoCol.appendChild(specsTitle);

      const specsList = document.createElement("ul");
      specsList.className = "pd-specs";
      p.specs.forEach((spec) => {
        const li = document.createElement("li");
        li.textContent = spec;
        specsList.appendChild(li);
      });
      infoCol.appendChild(specsList);
    }

    // Stepper jumlah
    const qtyWrap = document.createElement("div");
    qtyWrap.className = "pd-qty-wrap";

    const qtyLabel = document.createElement("label");
    qtyLabel.className = "pd-qty-label";
    qtyLabel.htmlFor = "pd-qty-input";
    qtyLabel.textContent = "Jumlah";
    qtyWrap.appendChild(qtyLabel);

    const stepperWrap = document.createElement("div");
    stepperWrap.className = "pd-stepper";

    const minusBtn = document.createElement("button");
    minusBtn.type = "button";
    minusBtn.className = "pd-stepper-btn";
    minusBtn.setAttribute("aria-label", "Kurangi jumlah");
    minusBtn.textContent = "−";

    const qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.id = "pd-qty-input";
    qtyInput.className = "pd-qty-input";
    qtyInput.value = "1";
    qtyInput.min = "1";
    qtyInput.max = p.stock && p.stock > 0 ? p.stock.toString() : "999";
    qtyInput.setAttribute("aria-label", "Jumlah produk");

    const plusBtn = document.createElement("button");
    plusBtn.type = "button";
    plusBtn.className = "pd-stepper-btn";
    plusBtn.setAttribute("aria-label", "Tambah jumlah");
    plusBtn.textContent = "+";

    // Handle zero stock - disable stepper
    if (p.stock === 0) {
      minusBtn.disabled = true;
      plusBtn.disabled = true;
      qtyInput.disabled = true;
      qtyInput.value = "0";
    }

    minusBtn.onclick = () => {
      const val = parseInt(qtyInput.value) || 1;
      if (val > 1) qtyInput.value = val - 1;
    };

    plusBtn.onclick = () => {
      const val = parseInt(qtyInput.value) || 1;
      const max = parseInt(qtyInput.max) || 999;
      if (val < max) qtyInput.value = val + 1;
    };

    // Input validation on blur
    qtyInput.onblur = () => validateQuantity(qtyInput);
    qtyInput.oninput = () => {
      // Real-time validation
      const val = parseInt(qtyInput.value);
      const max = parseInt(qtyInput.max) || 999;
      if (val > max) {
        qtyInput.value = max;
      }
    };

    stepperWrap.appendChild(minusBtn);
    stepperWrap.appendChild(qtyInput);
    stepperWrap.appendChild(plusBtn);
    qtyWrap.appendChild(stepperWrap);
    infoCol.appendChild(qtyWrap);

    // Info stok
    const stockInfo = document.createElement("p");
    stockInfo.className = "pd-stock";
    if (p.stock === null) {
      stockInfo.textContent = "Stok: cek langsung lewat WhatsApp";
    } else if (p.stock === 0) {
      stockInfo.textContent = "Stok habis";
      stockInfo.classList.add("pd-stock-empty");
    } else if (p.stock < 10) {
      stockInfo.textContent = `Stok tersisa ${p.stock} unit`;
      stockInfo.classList.add("pd-stock-low");
    } else {
      stockInfo.textContent = `Stok tersedia`;
    }
    infoCol.appendChild(stockInfo);

    // Tombol aksi
    const actionsRow = document.createElement("div");
    actionsRow.className = "pd-actions";

    const waLink = document.createElement("a");
    waLink.className = "btn pd-btn-wa";
    waLink.href = "#";
    
    // Handle zero stock - change button text
    if (p.stock === 0) {
      waLink.textContent = "Tanya ketersediaan";
    } else {
      waLink.textContent = "Pesan lewat WhatsApp";
    }
    
    waLink.onclick = (e) => {
      e.preventDefault();
      const qty = p.stock === 0 ? 0 : (parseInt(qtyInput.value) || 1);
      const url =
        window.location.origin +
        window.location.pathname +
        "#produk-" +
        p.slug;
      
      let msg;
      if (p.stock === 0) {
        msg = `Halo, saya mau tanya ketersediaan:\n${p.name}\nLink: ${url}`;
      } else {
        msg = `Halo, saya mau pesan:\n${p.name}\nJumlah: ${qty}\nLink: ${url}`;
      }
      
      const waUrl = window.WA || "https://wa.me/6285872189172";
      window.open(waUrl + "?text=" + encodeURIComponent(msg), "_blank");
    };

    actionsRow.appendChild(waLink);
    infoCol.appendChild(actionsRow);

    container.appendChild(infoCol);
    dlg.appendChild(container);

    // Show modal
    dlg.showModal();
    
    // Focus on close button after modal opens
    setTimeout(() => {
      if (closeBtn) closeBtn.focus();
    }, 100);
  };

  // Hash navigation
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.substring(1);
    if (hash.startsWith("produk-")) {
      const slug = hash.replace("produk-", "");
      const idx = window.D.findIndex((p) => p.slug === slug);
      if (idx !== -1) {
        window.openDetail(idx);
      } else {
        console.warn(`Product with slug "${slug}" not found`);
        // Clean up invalid hash
        if (window.location.hash.startsWith("#produk-")) {
          history.replaceState(null, "", window.location.pathname + window.location.search);
        }
      }
    }
  });

  // Close modal pada click backdrop & ESC handling
  document.addEventListener("DOMContentLoaded", () => {
    const dlg = document.getElementById("dlg");
    if (dlg) {
      dlg.addEventListener("click", (e) => {
        if (e.target === dlg) {
          dlg.close();
        }
      });

      dlg.addEventListener("close", () => {
        // Clean up hash
        if (window.location.hash.startsWith("#produk-")) {
          history.replaceState(
            null,
            "",
            window.location.pathname + window.location.search
          );
        }
        
        // Restore focus
        if (focusedElementBeforeModal && focusedElementBeforeModal.focus) {
          focusedElementBeforeModal.focus();
        }
      });
    }

    // Global keyboard navigation untuk gallery & ESC key
    document.addEventListener("keydown", (e) => {
      const dlg = document.getElementById("dlg");
      if (!dlg || !dlg.open) return;

      // ESC key handling (native dialog already handles this, but we add explicit support)
      if (e.key === "Escape") {
        dlg.close();
        return;
      }

      // Arrow navigation only if has images
      if (!currentProduct || !currentProduct.images || currentProduct.images.length <= 1) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        const nextIndex = (currentImageIndex + 1) % currentProduct.images.length;
        navigateToImage(nextIndex);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIndex = (currentImageIndex - 1 + currentProduct.images.length) % currentProduct.images.length;
        navigateToImage(prevIndex);
      }
    });
  });

  // Check hash on load
  if (window.location.hash.startsWith("#produk-")) {
    const hash = window.location.hash.substring(1);
    const slug = hash.replace("produk-", "");
    const idx = window.D.findIndex((p) => p.slug === slug);
    if (idx !== -1) {
      setTimeout(() => window.openDetail(idx), 100);
    } else {
      // Clean up invalid hash on page load
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }
})();
