// ============================================================
// Supabase Configuration
// ============================================================
const SUPABASE_URL = "https://sedebhmfreuasjnnsjzn.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZGViaG1mcmV1YXNqbm5zanpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNDE4NDgsImV4cCI6MjA5ODcxNzg0OH0.jtNLYqa4objmzxhRoeq3iAYmkChp29n83I6tWDt5prI";

// Safely create the client — SDKs are deferred so may load slightly after script.js
let supabaseClient = null;
function initSDKs() {
  if (window.supabase && !supabaseClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  if (window.emailjs) {
    try { emailjs.init("PhWpDktqqyb-g3RyQ"); } catch(e) {}
  }
  if (!supabaseClient) {
    setTimeout(initSDKs, 50);
  }
}
initSDKs();

// Authorized admin emails
const AUTHORIZED_EMAILS = [
  "murugesan13081978@gmail.com",
  "murugesankumaresan00@gmail.com",
  "kumaresan.ai.421@gmail.com",
];

// Safe helper to resolve product image URLs with fallbacks for missing/invalid database entries
function resolveProductImage(item) {
  let url = (item && item.img_url) ? String(item.img_url).trim() : "";

  // Valid HTTP/HTTPS or base64 data URLs
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }

  // Known local slide / asset files
  if (/^slide[1-7]\.(png|jpg|jpeg|webp)$/i.test(url)) {
    return url.replace(/\.(png|jpg|jpeg)$/i, ".webp");
  }
  if (/^logo\.(png|jpg|jpeg|webp)$/i.test(url) || /^about-bg\.(png|jpg|jpeg|webp)$/i.test(url)) {
    return url.replace(/\.(png|jpg|jpeg)$/i, ".webp");
  }

  // Other valid image filenames
  if (/\.(png|jpg|jpeg|webp|gif|svg)$/i.test(url)) {
    return url.replace(/\.(png|jpg|jpeg)$/i, ".webp");
  }

  // Title-based fallback heuristics if img_url is empty, invalid, or non-image text
  const title = ((item && item.title) || "").toLowerCase();
  if (title.includes("4ft") || title.includes("4 ft")) return "slide1.webp";
  if (title.includes("3ft") || title.includes("3 ft")) return "slide2.webp";
  if (title.includes("2ft") || title.includes("2 ft")) return "slide3.webp";
  if (title.includes("fence") || title.includes("post")) return "slide5.webp";
  if (title.includes("cover")) return "slide6.webp";
  if (title.includes("digging") || title.includes("well") || title.includes("sinking") || title.includes("residential") || title.includes("drainage")) return "slide7.webp";

  return "slide1.webp";
}

// ============================================================
// Default Light Theme Initialization
// ============================================================
document.documentElement.removeAttribute("data-theme");
localStorage.removeItem("theme");
const siteLogo = document.querySelector(".site-logo");
if (siteLogo) siteLogo.src = "logo.png";

// ============================================================
// Mobile Navigation Toggle & Backdrop
// ============================================================
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navMenu = document.getElementById("navMenu");
const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");

function closeMobileMenu() {
  if (navMenu) navMenu.classList.remove("open");
  if (mobileMenuOverlay) mobileMenuOverlay.classList.remove("open");
  if (mobileMenuBtn) mobileMenuBtn.querySelector("i").className = "fas fa-bars";
}

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener("click", () => {
    const isOpen = navMenu.classList.contains("open");
    if (isOpen) {
      closeMobileMenu();
    } else {
      navMenu.classList.add("open");
      if (mobileMenuOverlay) mobileMenuOverlay.classList.add("open");
      mobileMenuBtn.querySelector("i").className = "fas fa-times";
    }
  });
}

if (mobileMenuOverlay) {
  mobileMenuOverlay.addEventListener("click", closeMobileMenu);
}

// Close menu when link is clicked
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    closeMobileMenu();

    // Set Active State
    document
      .querySelectorAll(".nav-link")
      .forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
  });
});

// Smooth scrolling for all anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const targetId = this.getAttribute("href");
    if (targetId === "#") return;
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      e.preventDefault();

      // Update active state in nav-menu if it is a nav-link
      if (this.classList.contains("nav-link")) {
        document
          .querySelectorAll(".nav-link")
          .forEach((l) => l.classList.remove("active"));
        this.classList.add("active");
      }

      targetElement.scrollIntoView({ behavior: "smooth" });
      history.pushState(null, null, targetId);
    }
  });
});

// ============================================================
// Slider scrolling helper
// ============================================================
function scrollGrid(gridId, direction) {
  const container = document.getElementById(gridId);
  if (!container) return;
  const scrollAmount = 350;
  if (direction === "left") {
    container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  } else {
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }
}

// ============================================================
// Announcement Bar / Welcome Notification Control
// ============================================================
function dismissWelcomeBar() {
  const welcomeBar = document.getElementById("welcomeBar");
  if (welcomeBar) welcomeBar.style.display = "none";
  localStorage.setItem("welcomeDismissed", "true");
}

// ============================================================
// Category Filter Logic for Materials
// ============================================================
function filterCategory(cat, btnElement) {
  document
    .querySelectorAll(".filter-btn")
    .forEach((btn) => btn.classList.remove("active"));

  if (btnElement) {
    btnElement.classList.add("active");
  } else if (window.event && window.event.target) {
    window.event.target.classList.add("active");
  }

  const cards = document.querySelectorAll(".material-card");
  cards.forEach((card) => {
    const cardCat = card.getAttribute("data-cat");
    if (cat === "all" || cardCat === cat) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}

// ============================================================
// Update Form Fields Visibility based on Upload Category
// ============================================================
function updateFormFieldsVisibility() {
  const uploadTypeSelect = document.getElementById("uploadType");
  const titleGroup = document.getElementById("titleGroup");
  const priceGroup = document.getElementById("priceGroup");
  const descGroup = document.getElementById("descGroup");
  const metaGroup = document.getElementById("metaGroup");
  const titleLabel = document.getElementById("titleLabel");
  const metaLabel = document.getElementById("metaLabel");

  const itemTitle = document.getElementById("itemTitle");
  const itemPrice = document.getElementById("itemPrice");
  const itemDesc = document.getElementById("itemDesc");
  const itemMeta = document.getElementById("itemMeta");
  const fileInput = document.getElementById("itemImage");
  const itemImageUrl = document.getElementById("itemImageUrl");

  if (!uploadTypeSelect) return;

  const cat = uploadTypeSelect.value;

  if (priceGroup) {
    if (cat === "materials-only" || cat === "installation") {
      priceGroup.classList.remove("hidden");
    } else {
      priceGroup.classList.add("hidden");
      if (itemPrice && !window.editingItem) itemPrice.value = "";
    }
  }

  if (cat === "slideshow") {
    // Hide description and metadata for slideshow
    if (descGroup) descGroup.classList.add("hidden");
    if (itemDesc) {
      itemDesc.removeAttribute("required");
      if (!window.editingItem) itemDesc.value = "";
    }

    if (metaGroup) metaGroup.classList.add("hidden");
    if (itemMeta) {
      itemMeta.removeAttribute("required");
      if (!window.editingItem) itemMeta.value = "";
    }

    // Title is optional for slides (alt text)
    if (titleLabel) titleLabel.innerText = "Slide Title / Alt Text (Optional)";
    if (itemTitle) {
      itemTitle.placeholder = "e.g. Yard view, Rings stack...";
      itemTitle.removeAttribute("required");
    }
  } else {
    // Show everything for other categories
    if (descGroup) descGroup.classList.remove("hidden");
    if (itemDesc) itemDesc.setAttribute("required", "");

    if (metaGroup) metaGroup.classList.remove("hidden");
    if (itemMeta) itemMeta.setAttribute("required", "");

    if (titleLabel) titleLabel.innerText = "Item Title";
    if (itemTitle) {
      itemTitle.placeholder = "e.g., 6ft Heavy Concrete Ring";
      itemTitle.setAttribute("required", "");
    }

    // Customize metadata labels
    if (cat === "project") {
      if (metaLabel) metaLabel.innerText = "Location";
      if (itemMeta) itemMeta.placeholder = "e.g. Kovilpathagai, Chennai";
    } else if (cat === "service") {
      if (metaLabel) metaLabel.innerText = "Metadata (Optional)";
      if (itemMeta) {
        itemMeta.placeholder = "e.g. Service details or stats";
        itemMeta.removeAttribute("required");
      }
    } else {
      if (metaLabel) metaLabel.innerText = "Metadata (Dimensions / Location)";
      if (itemMeta) itemMeta.placeholder = "e.g. 6ft x 1.5ft or Kovilpathagai";
    }
  }

  // Handle image required status based on active photo source and editing state
  if (fileInput) fileInput.removeAttribute("required");
  if (itemImageUrl) itemImageUrl.removeAttribute("required");

  if (!window.editingItem) {
    if (window.photoSource === "url") {
      if (itemImageUrl) itemImageUrl.setAttribute("required", "");
    } else {
      if (fileInput) fileInput.setAttribute("required", "");
    }
  }
}

// ============================================================
// DOMContentLoaded — Load data from Supabase
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("welcomeDismissed") === "true") {
    const bar = document.getElementById("welcomeBar");
    if (bar) bar.style.display = "none";
  }
  initCustomerSession();
  updateDeliveryRateBadges();

  // Start hero slideshow immediately for static slides
  if (window.startHeroSlideshow) {
    window.startHeroSlideshow();
  }

  // Defer Supabase data loading until after first paint (improves LCP/FCP).
  // Use requestIdleCallback if available, otherwise fall back to 1.5s setTimeout.
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => loadDynamicContent(), { timeout: 3000 });
  } else {
    setTimeout(loadDynamicContent, 1500);
  }

  const uploadTypeSelect = document.getElementById("uploadType");
  if (uploadTypeSelect) {
    uploadTypeSelect.addEventListener("change", updateFormFieldsVisibility);
  }
  updateFormFieldsVisibility();

  // Setup live preview for external URLs
  const imageUrlInput = document.getElementById("itemImageUrl");
  const previewContainer = document.getElementById("imagePreviewContainer");
  const previewImg = document.getElementById("imagePreview");

  if (imageUrlInput) {
    imageUrlInput.addEventListener("input", () => {
      const val = imageUrlInput.value.trim();
      if (val && val.startsWith("http")) {
        if (previewImg) previewImg.src = val;
        if (previewContainer) previewContainer.classList.remove("hidden");
      } else {
        if (!window.editingItem) {
          if (previewContainer) previewContainer.classList.add("hidden");
          if (previewImg) previewImg.src = "";
        } else {
          if (previewImg)
            previewImg.src = window.editingItem.originalImgUrl || "";
        }
      }
    });
  }
});

// ============================================================
// In-session data cache — prevents repeated Supabase fetches
// within the same browser session / page load.
// ============================================================
const _dynamicCache = {
  loaded: false,
  materials: null,
  projects: null,
  services: null,
  slideshows: null,
};

// ============================================================
// Load Material, Project, and Service data from Supabase
// ============================================================
async function loadDynamicContent(forceRefresh) {
  const materialsGrid = document.getElementById("materialsGrid");
  const projectsGrid = document.getElementById("projectsGrid");
  const servicesGrid = document.getElementById("servicesGrid");

  let materials = [];
  let projects = [];
  let services = [];

  // ── Session cache: skip re-fetching if data was already loaded this page session.
  // Pass forceRefresh=true (e.g. after admin edits) to bypass the cache.
  if (_dynamicCache.loaded && !forceRefresh) {
    materials = _dynamicCache.materials || [];
    projects  = _dynamicCache.projects  || [];
    services  = _dynamicCache.services  || [];
  } else {
    // Fetch only needed columns — reduces DB transfer size and egress
    try {
      const [materialsRes, projectsRes, servicesRes] = await Promise.all([
        supabaseClient
          .from("materials")
          .select("id,title,desc,meta,tag,icon,img_url,category,price")
          .order("created_at", { ascending: true }),
        supabaseClient
          .from("projects")
          .select("id,title,desc,meta,img_url")
          .order("created_at", { ascending: true }),
        supabaseClient
          .from("services")
          .select("id,title,desc,meta,img_url")
          .order("created_at", { ascending: true }),
      ]);

      if (materialsRes.error)
        console.error("Error fetching materials:", materialsRes.error);
      else materials = materialsRes.data || [];

      if (projectsRes.error)
        console.error("Error fetching projects:", projectsRes.error);
      else projects = projectsRes.data || [];

      if (servicesRes.error)
        console.error("Error fetching services:", servicesRes.error);
      else services = servicesRes.data || [];

      // Store in session cache
      _dynamicCache.materials = materials;
      _dynamicCache.projects  = projects;
      _dynamicCache.services  = services;
      _dynamicCache.loaded = true;
    } catch (err) {
      console.error("Failed to connect to database. Using fallback data.", err);
    }
  }

  // Fallbacks if data is empty or fails to load
  if (materials.length === 0) {
    materials = [
      {
        id: "mat_4ft",
        title: "4 FT-Concrete Well Ring",
        desc: "used for septitank,water well, rainwater harvesting...etc",
        meta: "4ft outerDia / 11 inch height / 1.5 inch thickness",
        tag: "4ft outerDia / 11 inch height / 1.5 inch thickness",
        icon: "fas fa-info-circle",
        img_url: "slide1.webp",
        category: "materials-only",
        price: 500,
      },
      {
        id: "mat_3ft",
        title: "3 FT-Concrete Well Ring",
        desc: "used for sokepet,kitchen waste water,washroom water......etc",
        meta: "3ft outerDia / 11 inch height / 1.5 inch thickness",
        tag: "3ft outerDia / 11 inch height / 1.5 inch thickness",
        icon: "fas fa-info-circle",
        img_url: "slide2.webp",
        category: "materials-only",
        price: 500,
      },
      {
        id: "mat_2ft",
        title: "2 FT-Concrete Well Ring",
        desc: "small space we can install this size and to extend the depth well",
        meta: "2 ft outerDia / 11 inch height / 1.5 inch thickness",
        tag: "2 ft outerDia / 11 inch height / 1.5 inch thickness",
        icon: "fas fa-info-circle",
        img_url: "slide3.webp",
        category: "materials-only",
        price: 500,
      },
      {
        id: "mat_3ft_inst",
        title: "3ft Well Ring + Installation",
        desc: "Standard 3ft concrete ring package including manual digging, lowering, and safety alignment.",
        meta: "Material + Manual Digging",
        tag: "Digging + Supply",
        icon: "fas fa-tools",
        img_url: "logo.webp",
        category: "installation",
        price: 1200,
      },
      {
        id: "mat_4ft_inst",
        title: "4ft Well Ring + Installation",
        desc: "Complete commercial setup with 4ft rings, manual excavation, alignment support, and sandbed packing.",
        meta: "Material + Manual Digging",
        tag: "Digging + Supply",
        icon: "fas fa-tools",
        img_url: "logo.webp",
        category: "installation",
        price: 1800,
      },
    ];
  }

  if (projects.length === 0) {
    projects = [
      {
        title: "Residential Well Sinking",
        desc: "Completed 35ft manual digging and reinforcement setup for clean water retrieval.",
        meta: "Kovilpathagai, Chennai",
        img_url: "logo.webp",
      },
      {
        title: "Drainage Well Ring Installation",
        desc: "Supplied and lowered 20 heavy concrete rings for stormwater drainage systems.",
        meta: "Avadi, Chennai",
        img_url: "logo.webp",
      },
    ];
  }

  if (services.length === 0) {
    services = [
      {
        title: "Material Manufacturing",
        desc: "We manufacture reinforced concrete rings using premium cement and strong iron grids to prevent cracking.",
        meta: "",
        img_url: "logo.webp",
      },
      {
        title: "Manual Digging",
        desc: "Traditional hands-on manual digging by seasoned experts, achieving perfect vertical alignment.",
        meta: "",
        img_url: "logo.webp",
      },
    ];
  }

  if (materialsGrid) {
    materialsGrid.innerHTML = "";
    const customPrices = JSON.parse(
      localStorage.getItem("wellrings_custom_prices") || "{}",
    );
    materials.forEach((item, idx) => {
      const itemId = item.id || "mat_" + idx;
      const card = document.createElement("div");
      const dataCat = item.category || "materials-only";
      card.className = "glass-card material-card";
      card.setAttribute("data-cat", dataCat);

      const isInstallation = dataCat === "installation";
      const categoryBadge = isInstallation
        ? `<span style="background: rgba(37, 99, 235, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); padding: 3px 8px; border-radius: 12px; font-size: 0.72rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"><i class="fas fa-tools"></i> Material + Installation</span>`
        : `<span style="background: rgba(13, 148, 136, 0.15); color: var(--primary-teal); border: 1px solid rgba(13, 148, 136, 0.3); padding: 3px 8px; border-radius: 12px; font-size: 0.72rem; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;"><i class="fas fa-cube"></i> Material Only</span>`;

      // Determine item price (database item.price -> localStorage override -> title heuristic -> 500)
      let itemPrice = item.price;
      if (customPrices[itemId] !== undefined) {
        itemPrice = parseFloat(customPrices[itemId]);
      } else if (customPrices[item.title] !== undefined) {
        itemPrice = parseFloat(customPrices[item.title]);
      }

      if (itemPrice === undefined || itemPrice === null || isNaN(itemPrice)) {
        const titleLower = (item.title || "").toLowerCase();
        if (titleLower.includes("3ft") && titleLower.includes("installation"))
          itemPrice = 1200;
        else if (
          titleLower.includes("4ft") &&
          titleLower.includes("installation")
        )
          itemPrice = 1800;
        else if (titleLower.includes("3ft")) itemPrice = 500;
        else if (titleLower.includes("4ft")) itemPrice = 500;
        else if (titleLower.includes("2ft") || titleLower.includes("2 ft"))
          itemPrice = 500;
        else if (titleLower.includes("post") || titleLower.includes("fence"))
          itemPrice = 250;
        else if (titleLower.includes("cover")) itemPrice = 350;
        else itemPrice = 500;
      }

      const escapedTitle = (item.title || "")
        .replace(/'/g, "\\'")
        .replace(/"/g, "&quot;");
      const escapedMeta = (item.meta || "")
        .replace(/'/g, "\\'")
        .replace(/"/g, "&quot;");

      const itemImgUrl = resolveProductImage(item);

      card.innerHTML = `
        <div class="material-img-wrapper">
          <img src="${itemImgUrl}" alt="${item.title}" class="card-image" width="400" height="300" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='logo.png';">
          <span class="material-tag">${item.tag || item.meta}</span>
        </div>
        <div class="material-details">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <h3 style="margin: 0; font-size: 1.1rem;">${item.title}</h3>
            <span class="material-price-badge">₹${itemPrice.toLocaleString("en-IN")}<small>/pc</small></span>
          </div>
          <div style="margin-bottom: 10px;">
            ${categoryBadge}
          </div>
          <p>${item.desc}</p>
          <div class="material-meta">
            <span><i class="${item.icon || (isInstallation ? "fas fa-tools" : "fas fa-info-circle")}"></i> ${item.meta || "Custom Added Material"}</span>
          </div>
          <div class="card-cart-controls">
            <div class="piece-selector">
              <button type="button" class="qty-btn" onclick="adjustCardQty('${itemId}', -1)" aria-label="Decrease quantity for ${escapedTitle}">-</button>
              <label for="cardQty_${itemId}" class="sr-only">Quantity for ${escapedTitle}</label>
              <input type="number" id="cardQty_${itemId}" value="1" min="1" max="999" class="qty-input" aria-label="Quantity for ${escapedTitle}">
              <button type="button" class="qty-btn" onclick="adjustCardQty('${itemId}', 1)" aria-label="Increase quantity for ${escapedTitle}">+</button>
              <span class="qty-unit">pcs</span>
            </div>
            <button type="button" class="btn btn-sm btn-primary add-to-cart-btn" aria-label="Add ${escapedTitle} to cart" onclick="addMaterialToCart('${itemId}', '${escapedTitle}', ${itemPrice}, '${itemImgUrl}', '${escapedMeta}')">
              <i class="fas fa-cart-plus"></i> Add to Cart
            </button>
          </div>
        </div>
      `;
      materialsGrid.appendChild(card);
    });
  }

  if (projectsGrid) {
    projectsGrid.innerHTML = "";
    projects.forEach((item) => {
      const card = document.createElement("div");
      card.className = "glass-card project-card";
      const itemImgUrl = resolveProductImage(item);
      card.innerHTML = `
        <div class="material-img-wrapper">
          <img src="${itemImgUrl}" alt="${item.title}" class="card-image" width="400" height="300" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='logo.png';">
        </div>
        <div class="project-info" style="padding: 20px 15px;">
          <span class="project-location"><i class="fas fa-map-marker-alt"></i> ${item.meta}</span>
          <h3>${item.title}</h3>
          <p>${item.desc}</p>
        </div>
      `;
      projectsGrid.appendChild(card);
    });
  }

  if (servicesGrid) {
    servicesGrid.innerHTML = "";
    services.forEach((item) => {
      const card = document.createElement("div");
      card.className = "glass-card service-card";
      const itemImgUrl = resolveProductImage(item);
      card.innerHTML = `
        <div class="material-img-wrapper">
          <img src="${itemImgUrl}" alt="${item.title}" class="card-image" width="400" height="300" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='logo.png';">
        </div>
        <div style="padding: 20px 15px;">
          <h3>${item.title}</h3>
          <p>${item.desc}</p>
        </div>
      `;
      servicesGrid.appendChild(card);
    });
  }

  // Fetch slideshow images dynamically from Supabase (use session cache if available)
  let slideshows = [];
  if (_dynamicCache.slideshows && !forceRefresh) {
    slideshows = _dynamicCache.slideshows;
  } else {
    try {
      // Fetch only needed columns; limit to 8 slides to cap Supabase Storage egress.
      // Each additional slide with a Supabase Storage URL adds to bandwidth on every visit.
      const { data, error } = await supabaseClient
        .from("slideshow")
        .select("id,title,img_url")
        .order("created_at", { ascending: true })
        .limit(8);
      if (!error) {
        slideshows = data || [];
        _dynamicCache.slideshows = slideshows;
      }
    } catch (err) {
      console.warn("Slideshow table could not be loaded, using defaults:", err);
    }
  }

  // Fallback to static slides if database is empty or errors
  if (slideshows.length === 0) {
    slideshows = [
      { id: "default3", title: "Concrete Well Rings Yard",         img_url: "slide3.webp" },
      { id: "default4", title: "Reinforced Concrete Rings Stack",   img_url: "slide4.webp" },
      { id: "default5", title: "Concrete Fencing Posts",            img_url: "slide5.webp" },
      { id: "default6", title: "Concrete Well Covers",              img_url: "slide6.webp" },
      { id: "default7", title: "Deep Well Sinking Site",            img_url: "slide7.webp" },
    ];
  }

  const slideshowTrack = document.getElementById("slideshowTrack");
  const slideshowDots = document.getElementById("slideshowDots");

  if (slideshowTrack && slideshowDots) {
    // IMPORTANT: Do NOT reset slideshowTrack.innerHTML — the first 2 static slides
    // (slide1.webp LCP + slide2.webp) are already rendered in HTML. Resetting them
    // would destroy the painted LCP element and cause CLS/LCP regression.
    // Instead, remove only previously appended dynamic slides (those without id).
    const existingDynamic = slideshowTrack.querySelectorAll('.slideshow-img:not(:nth-child(1)):not(:nth-child(2))');
    existingDynamic.forEach(el => el.remove());

    // Append custom dynamic slides after the 2 static ones
    slideshows.forEach((slide) => {
      const slideDiv = document.createElement('div');
      slideDiv.className = 'slideshow-img';
      const img = document.createElement('img');
      img.src = slide.img_url
        ? slide.img_url.replace(/\.(png|jpg|jpeg)$/i, '.webp')
        : (slide.img_url || 'slide3.webp');
      img.alt = slide.title || 'Well Ring Slide';
      img.loading = 'lazy';
      img.width = 560;
      img.height = 420;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      slideDiv.appendChild(img);
      slideshowTrack.appendChild(slideDiv);
    });

    // Generate indicator dots
    slideshowDots.innerHTML = '';
    const totalSlides = 2 + slideshows.length;
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('span');
      dot.className = i === 0 ? 'dot active' : 'dot';
      dot.setAttribute('data-index', i);
      slideshowDots.appendChild(dot);
    }

    // Start auto-rotation logic with the new slides
    if (window.startHeroSlideshow) {
      window.startHeroSlideshow();
    }
  }
}

// ============================================================
// Contact Form submission via EmailJS
// ============================================================
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const serviceType = document.getElementById("serviceType").value;
    const message = document.getElementById("message").value;

    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = "Sending...";
    btn.disabled = true;

    const templateParams = {
      from_name: name,
      reply_to: email,
      phone_number: phone,
      service_type: serviceType,
      message_details: message,
    };

    emailjs.send("service_34ugknd", "template_hecta5f", templateParams).then(
      () => {
        btn.innerText = originalText;
        btn.disabled = false;
        alert("Message sent successfully!");
        contactForm.reset();
      },
      (err) => {
        btn.innerText = originalText;
        btn.disabled = false;
        alert("Failed to send message: " + JSON.stringify(err));
      },
    );
  });
}

// ============================================================
// Admin State
// ============================================================
window.editingItem = null;
window.photoSource = "upload"; // Default mode is file upload

window.setPhotoSource = function (source) {
  window.photoSource = source;
  const uploadBtn = document.getElementById("sourceUploadBtn");
  const urlBtn = document.getElementById("sourceUrlBtn");
  const uploadContainer = document.getElementById("uploadSourceContainer");
  const urlContainer = document.getElementById("urlSourceContainer");
  const fileInput = document.getElementById("itemImage");
  const urlInput = document.getElementById("itemImageUrl");

  if (source === "upload") {
    if (uploadBtn) {
      uploadBtn.className = "btn btn-sm btn-primary";
    }
    if (urlBtn) {
      urlBtn.className = "btn btn-sm btn-outline";
    }
    if (uploadContainer) uploadContainer.classList.remove("hidden");
    if (urlContainer) urlContainer.classList.add("hidden");

    // Manage input requirements
    if (urlInput) urlInput.removeAttribute("required");
    if (fileInput && !window.editingItem)
      fileInput.setAttribute("required", "");
  } else {
    if (uploadBtn) {
      uploadBtn.className = "btn btn-sm btn-outline";
    }
    if (urlBtn) {
      urlBtn.className = "btn btn-sm btn-primary";
    }
    if (uploadContainer) uploadContainer.classList.add("hidden");
    if (urlContainer) urlContainer.classList.remove("hidden");

    // Manage input requirements
    if (fileInput) fileInput.removeAttribute("required");
    if (urlInput && !window.editingItem) urlInput.setAttribute("required", "");
  }
};

// ============================================================
// Supabase Google Sign-In
// ============================================================
const googleSignInBtn = document.getElementById("googleSignInBtn");
const googleSignOutBtn = document.getElementById("googleSignOutBtn");
const uploadForm = document.getElementById("uploadForm");
const adminManageSection = document.getElementById("adminManageSection");
const loginForm = document.getElementById("loginForm");

// --- Helper: Show/hide admin UI based on auth state ---
function updateAdminUI(user) {
  const isAdminPage = !!(
    document.getElementById("adminManageSection") ||
    document.getElementById("googleSignInBtn")
  );

  if (user) {
    // 1. Establish customer session for ANY Gmail account
    const userEmail = user.email;
    const userName = user.user_metadata?.full_name || userEmail.split("@")[0];

    if (!customerSession || customerSession.email !== userEmail) {
      customerSession = {
        email: userEmail,
        name: userName,
        photo: user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
        verified: true,
        loginTime: new Date().toISOString(),
      };
      localStorage.setItem(
        "wellrings_customer",
        JSON.stringify(customerSession),
      );

      const savedUserCartStr = localStorage.getItem(
        "wellrings_cart_" + userEmail,
      );
      if (savedUserCartStr) {
        try {
          const savedUserCart = JSON.parse(savedUserCartStr);
          if (Array.isArray(savedUserCart) && savedUserCart.length > 0) {
            cart = savedUserCart;
          }
        } catch (e) {
          console.error("Error restoring customer cart:", e);
        }
      }
      saveCart();
      updateCustomerHeaderUI();
      loadCustomerSessionFromCloud(userEmail);
    }

    // 2. Admin Portal specific permissions check (only on admin page)
    if (isAdminPage) {
      if (AUTHORIZED_EMAILS.includes(user.email)) {
        if (googleSignInBtn) googleSignInBtn.classList.add("hidden");
        if (googleSignOutBtn) googleSignOutBtn.classList.remove("hidden");
        if (uploadForm) uploadForm.classList.remove("hidden");
        if (adminManageSection) adminManageSection.classList.remove("hidden");
        renderAdminManageList();
      } else {
        // Customer account logged in, but not authorized for admin inventory editing
        if (googleSignInBtn) googleSignInBtn.classList.remove("hidden");
        if (googleSignOutBtn) googleSignOutBtn.classList.remove("hidden");
        if (uploadForm) uploadForm.classList.add("hidden");
        if (adminManageSection) adminManageSection.classList.add("hidden");
      }
    }
  } else {
    if (googleSignInBtn) googleSignInBtn.classList.remove("hidden");
    if (googleSignOutBtn) googleSignOutBtn.classList.add("hidden");
    if (uploadForm) uploadForm.classList.add("hidden");
    if (adminManageSection) adminManageSection.classList.add("hidden");
  }
}

// --- Check for existing session on page load (handles OAuth callback) ---
(async function checkSession() {
  try {
    // This also processes any OAuth tokens in the URL hash
    const {
      data: { session },
      error,
    } = await supabaseClient.auth.getSession();
    if (error) {
      console.error("Session check error:", error);
    }
    if (session?.user) {
      console.log("Session found for:", session.user.email);
      updateAdminUI(session.user);
      // Clean up the URL hash after successful OAuth callback
      if (
        window.location.hash &&
        window.location.hash.includes("access_token")
      ) {
        history.replaceState(null, "", window.location.pathname + "#profile");
      }
    }
  } catch (err) {
    console.error("Session check failed:", err);
  }
})();

// --- Sign-In Button ---
if (googleSignInBtn) {
  googleSignInBtn.addEventListener("click", async () => {
    googleSignInBtn.disabled = true;
    googleSignInBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Signing in...';

    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + window.location.pathname,
      },
    });

    if (error) {
      console.error("Sign-in error:", error);
      alert("Sign-in failed: " + error.message);
      googleSignInBtn.disabled = false;
      googleSignInBtn.innerHTML =
        '<i class="fab fa-google"></i> Sign in with Google';
    }
    // If no error, the browser will redirect to Google — button state doesn't matter
  });
}

// --- Sign-Out Button ---
if (googleSignOutBtn) {
  googleSignOutBtn.addEventListener("click", async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      alert("Sign-out failed: " + error.message);
    } else {
      alert("Signed out successfully!");
      window.location.reload();
    }
  });
}

// --- Auth State Change Listener (handles token refresh, Google OAuth, sign-out events) ---
supabaseClient.auth.onAuthStateChange((event, session) => {
  console.log("Auth event:", event);
  updateAdminUI(session?.user || null);

  // If user signed in via Google OAuth, establish customer session & restore cart
  if (session && session.user && session.user.email) {
    const googleEmail = session.user.email;
    const googleName =
      session.user.user_metadata?.full_name || googleEmail.split("@")[0];

    if (!customerSession || customerSession.email !== googleEmail) {
      customerSession = {
        email: googleEmail,
        name: googleName,
        photo: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || "",
        verified: true,
        loginTime: new Date().toISOString(),
      };
      localStorage.setItem(
        "wellrings_customer",
        JSON.stringify(customerSession),
      );

      const savedUserCartStr = localStorage.getItem(
        "wellrings_cart_" + googleEmail,
      );
      if (savedUserCartStr) {
        try {
          const savedUserCart = JSON.parse(savedUserCartStr);
          if (Array.isArray(savedUserCart) && savedUserCart.length > 0) {
            cart = savedUserCart;
          }
        } catch (e) {
          console.error("Error loading Google user cart:", e);
        }
      }
      saveCart();
      updateCustomerHeaderUI();
      loadCustomerSessionFromCloud(googleEmail);
    }
  }
});

// ============================================================
// Render Admin Manage List (from Supabase)
// ============================================================
async function renderAdminManageList() {
  const listContainer = document.getElementById("adminEntriesList");
  if (!listContainer) return;
  updateDeliveryRateBadges();
  listContainer.innerHTML =
    '<p style="color: var(--text-muted); text-align: center;"><i class="fas fa-spinner fa-spin"></i> Loading entries...</p>';

  const categories = [
    { key: "materials", label: "Materials & Installations", select: "id,title,desc,img_url,price,category" },
    { key: "projects", label: "Projects", select: "id,title,desc,img_url" },
    { key: "services", label: "Services", select: "id,title,desc,img_url" },
    { key: "slideshow", label: "Homepage Slideshow", select: "id,title,desc,img_url" },
  ];

  listContainer.innerHTML = "";

  for (const cat of categories) {
    let items = [];
    try {
      // Select only the columns needed for each table — avoids requesting non-existent columns
      const { data, error } = await supabaseClient
        .from(cat.key)
        .select(cat.select)
        .order("created_at", { ascending: true });
      if (!error) {
        items = data || [];
      }
    } catch (err) {
      console.error(`Error loading ${cat.key}:`, err);
    }

    if (cat.key === "slideshow" && (!items || items.length === 0)) {
      const seedCard = document.createElement("div");
      seedCard.className = "admin-entry-card";
      seedCard.style.border = "1px dashed var(--primary-teal)";
      seedCard.style.padding = "20px";
      seedCard.style.display = "flex";
      seedCard.style.flexDirection = "column";
      seedCard.style.gap = "12px";
      seedCard.style.alignItems = "center";
      seedCard.style.justifyContent = "center";
      seedCard.style.width = "100%";
      seedCard.style.textAlign = "center";
      seedCard.innerHTML = `
        <div style="font-size: 1.5rem; color: var(--primary-teal); margin-bottom: 5px;"><i class="fas fa-magic"></i></div>
        <h4 style="margin: 0; color: var(--text-color);">Import Default Slideshow</h4>
        <p style="color: var(--text-muted); font-size: 0.85rem; max-width: 320px; margin: 0 0 10px 0;">
          No slideshow items exist in the database. The homepage is currently running static fallback slides. Load them to update/remove them.
        </p>
        <button type="button" class="btn btn-sm btn-outline" onclick="seedDefaultSlides()" style="margin: 0; font-size: 0.8rem; padding: 8px 16px;">
          Seed Default Slides to Database
        </button>
      `;
      listContainer.appendChild(seedCard);
    }

    (items || []).forEach((item) => {
      const card = document.createElement("div");
      card.className = "admin-entry-card";

      let catBadgeText = cat.label;
      let badgeStyle =
        "background: rgba(255, 255, 255, 0.1); color: var(--text-muted);";

      let priceBadge = "";
      if (cat.key === "materials") {
        const customPrices = JSON.parse(
          localStorage.getItem("wellrings_custom_prices") || "{}",
        );
        const p =
          item.price !== undefined && item.price !== null
            ? item.price
            : customPrices[item.id] || customPrices[item.title];
        if (p !== undefined && p !== null && p !== "") {
          priceBadge = `<span style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 2px 8px; border-radius: 10px; font-size: 0.72rem; font-weight: 700;">₹${parseFloat(p).toLocaleString("en-IN")}/pc</span>`;
        }
      }

      card.innerHTML = `
        <img src="${item.img_url || "logo.png"}" alt="Item photo">
        <div class="admin-entry-info">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <h4 style="margin: 0;">${item.title}</h4>
            <span style="${badgeStyle} padding: 2px 8px; border-radius: 10px; font-size: 0.72rem; font-weight: 600;">${catBadgeText}</span>
            ${priceBadge}
          </div>
          <p style="margin-top: 4px; font-size: 0.8rem; color: var(--text-muted);">${item.desc || ""}</p>
        </div>
        <div class="admin-entry-actions">
          <button type="button" class="btn-icon edit" onclick="editEntry('${cat.key}', ${item.id})" title="Edit Category / Details"><i class="fas fa-edit"></i></button>
          <button type="button" class="btn-icon delete" onclick="deleteEntry('${cat.key}', ${item.id})" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      `;
      listContainer.appendChild(card);
    });
  }
}

// ============================================================
// Delete Entry (from Supabase)
// ============================================================
window.deleteEntry = async function (table, id) {
  if (confirm("Are you sure you want to remove this entry?")) {
    try {
      // If the item has a storage image, attempt to delete it
      const { data: item } = await supabaseClient
        .from(table)
        .select("img_url")
        .eq("id", id)
        .single();
      if (
        item &&
        item.img_url &&
        item.img_url.includes("/storage/v1/object/public/images/")
      ) {
        const storagePath = item.img_url.split(
          "/storage/v1/object/public/images/",
        )[1];
        if (storagePath) {
          await supabaseClient.storage.from("images").remove([storagePath]);
        }
      }
    } catch (e) {}

    const { error } = await supabaseClient.from(table).delete().eq("id", id);
    if (error) {
      alert("Failed to delete: " + error.message);
    } else {
      alert("Item removed successfully!");
      // Invalidate session cache so next loadDynamicContent re-fetches fresh data
      _dynamicCache.loaded = false;
      _dynamicCache.slideshows = null;
      renderAdminManageList();
      // Use forceRefresh=true so the public grid reflects the deletion
      loadDynamicContent(true);
    }
  }
};

// ============================================================
// Edit Entry (load into form)
// ============================================================
window.editEntry = async function (table, id) {
  // Fetch only the columns we populate in the edit form — avoids pulling unused data
  const editSelectMap = {
    materials: "id,title,desc,meta,img_url,category,price,icon,tag",
    projects:  "id,title,desc,meta,img_url",
    services:  "id,title,desc,meta,img_url",
    slideshow: "id,title,img_url",
  };
  const selectCols = editSelectMap[table] || "id,title,desc,meta,img_url,category,price";
  const { data: item, error } = await supabaseClient
    .from(table)
    .select(selectCols)
    .eq("id", id)
    .single();
  if (error || !item) {
    alert("Failed to load item for editing.");
    return;
  }

  // Determine the upload category value
  let uploadTypeVal;
  if (table === "projects") uploadTypeVal = "project";
  else if (table === "services") uploadTypeVal = "service";
  else if (table === "slideshow") uploadTypeVal = "slideshow";
  else uploadTypeVal = item.category || "materials-only";

  document.getElementById("uploadType").value = uploadTypeVal;
  document.getElementById("itemTitle").value = item.title || "";
  document.getElementById("itemDesc").value = item.desc || "";
  document.getElementById("itemMeta").value = item.meta || "";

  const priceInput = document.getElementById("itemPrice");
  if (priceInput) {
    const customPrices = JSON.parse(
      localStorage.getItem("wellrings_custom_prices") || "{}",
    );
    const p =
      item.price !== undefined && item.price !== null
        ? item.price
        : customPrices[item.id] || customPrices[item.title];
    priceInput.value = p !== undefined && p !== null && p !== "" ? p : "";
  }

  // Set editing state
  window.editingItem = { table, id, originalImgUrl: item.img_url };

  // Set photo source type based on existing image URL format
  const imageUrlInput = document.getElementById("itemImageUrl");
  const isExternalUrl =
    item.img_url &&
    item.img_url.startsWith("http") &&
    !item.img_url.includes("/storage/v1/object/public/images/");
  if (isExternalUrl) {
    setPhotoSource("url");
    if (imageUrlInput) imageUrlInput.value = item.img_url;
  } else {
    setPhotoSource("upload");
    if (imageUrlInput) imageUrlInput.value = "";
  }

  // Trigger field visibility and required adjustments based on edit category
  updateFormFieldsVisibility();

  // Show preview of current image
  const previewContainer = document.getElementById("imagePreviewContainer");
  const previewImg = document.getElementById("imagePreview");
  if (previewContainer && previewImg && item.img_url) {
    previewImg.src = item.img_url;
    previewContainer.classList.remove("hidden");
  }

  // Show Cancel Edit button
  const cancelBtn = document.getElementById("cancelEditBtn");
  if (cancelBtn) cancelBtn.classList.remove("hidden");

  const submitBtn = document.getElementById("submitBtn");
  if (submitBtn) submitBtn.innerText = "Save Changes";

  document.getElementById("uploadForm").scrollIntoView({ behavior: "smooth" });
};

// ============================================================
// Cancel Editing Mode
// ============================================================
window.cancelEditing = function () {
  window.editingItem = null;

  const form = document.getElementById("uploadForm");
  if (form) form.reset();

  // Reset photo source to upload default
  setPhotoSource("upload");
  const imageUrlInput = document.getElementById("itemImageUrl");
  if (imageUrlInput) imageUrlInput.value = "";

  const previewContainer = document.getElementById("imagePreviewContainer");
  const previewImg = document.getElementById("imagePreview");
  if (previewContainer) previewContainer.classList.add("hidden");
  if (previewImg) previewImg.src = "";

  const cancelBtn = document.getElementById("cancelEditBtn");
  if (cancelBtn) cancelBtn.classList.add("hidden");

  const submitBtn = document.getElementById("submitBtn");
  if (submitBtn) submitBtn.innerText = "Publish Update";

  // Restore fields visibility and required attributes
  updateFormFieldsVisibility();
};

// ============================================================
// Seed Default Slides to Supabase Database
// ============================================================
window.seedDefaultSlides = async function () {
  const confirmSeed = confirm(
    "Do you want to load the 5 default slideshow images into the database so you can manage, edit, or remove them?",
  );
  if (!confirmSeed) return;

  const defaults = [
    { title: "Concrete Well Rings Yard", img_url: "slide3.png" },
    { title: "Reinforced Concrete Rings Stack", img_url: "slide4.png" },
    { title: "Concrete Fencing Posts", img_url: "slide5.png" },
    { title: "Concrete Well Covers", img_url: "slide6.png" },
    { title: "Deep Well Sinking Site", img_url: "slide7.jpg" },
  ];

  try {
    const { error } = await supabaseClient.from("slideshow").insert(defaults);
    if (error) {
      alert("Failed to seed default slides: " + error.message);
    } else {
      alert("Default slideshow images successfully loaded into database!");
      // Invalidate session cache so the slideshow refreshes with the new seeds
      _dynamicCache.loaded = false;
      _dynamicCache.slideshows = null;
      renderAdminManageList();
      loadDynamicContent(true);
    }
  } catch (err) {
    alert("Error seeding slides: " + (err.message || err));
  }
};

// ============================================================
// Upload Image to Supabase Storage
// ============================================================
async function uploadImageToStorage(file) {
  // ── Egress guard: warn admin if image file is too large.
  // Large images (> 500 KB) dramatically increase Supabase Cached Egress because
  // every site visitor downloads them on each page load.
  // Recommended max: 300 KB per image (WebP/JPEG compressed).
  const FILE_SIZE_WARN_BYTES = 500 * 1024; // 500 KB
  if (file.size > FILE_SIZE_WARN_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const proceed = confirm(
      `⚠️ Supabase Bandwidth Warning\n\n` +
      `This image is ${sizeMB} MB.\n\n` +
      `Large images increase Supabase Storage bandwidth (egress). With many visitors, ` +
      `a ${sizeMB} MB image can consume hundreds of MB to GBs of your 5 GB free quota.\n\n` +
      `✅ Recommended: Compress to < 300 KB using WebP format before uploading.\n` +
      `   Free tools: squoosh.app, tinypng.com, or use your phone's photo editor.\n\n` +
      `Proceed anyway with this ${sizeMB} MB image?`
    );
    if (!proceed) {
      throw new Error(`Upload cancelled. Please compress the image below 300 KB before uploading to reduce Supabase bandwidth usage.`);
    }
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = fileName;

  // Use 1-year cache-control so browsers and CDN cache these images long-term,
  // dramatically reducing repeated Supabase cached egress.
  const { data, error } = await supabaseClient.storage
    .from("images")
    .upload(filePath, file, {
      cacheControl: "31536000", // 1 year (was 3600 = 1 hour)
      upsert: false,
    });

  if (error) {
    if (
      error.message &&
      error.message.toLowerCase().includes("row-level security")
    ) {
      throw new Error(
        'Storage Upload Error: Row-Level Security policy blocked this upload.\n\nSolution 1: Run the updated storage policy script in your Supabase SQL Editor.\nSolution 2: Switch "Photo Source" to "Google Maps / Web URL" to insert a direct image URL.',
      );
    }
    throw new Error("Image upload failed: " + error.message);
  }

  // Get public URL
  const { data: urlData } = supabaseClient.storage
    .from("images")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

// ============================================================
// Admin Upload Handler (Supabase insert/update)
// ============================================================
async function handleAdminUpload(event) {
  event.preventDefault();

  const cat = document.getElementById("uploadType").value;
  const title = document.getElementById("itemTitle").value;
  const desc = document.getElementById("itemDesc").value;
  const meta = document.getElementById("itemMeta").value;
  const priceInput = document.getElementById("itemPrice");
  const fileInput = document.getElementById("itemImage");
  const imageUrlInput = document.getElementById("itemImageUrl");

  const priceVal =
    priceInput && priceInput.value.trim() !== ""
      ? parseFloat(priceInput.value)
      : null;

  const submitBtn = document.querySelector('#uploadForm button[type="submit"]');
  const originalBtnText = submitBtn.innerText;
  submitBtn.innerText = "Uploading...";
  submitBtn.disabled = true;

  try {
    let imgUrl = null;

    // Determine if we use local file upload or external URL
    const isUrlSource = window.photoSource === "url";
    if (isUrlSource) {
      if (imageUrlInput && imageUrlInput.value.trim()) {
        imgUrl = imageUrlInput.value.trim();
      } else if (!window.editingItem) {
        alert("Please enter a Google Maps or web image URL.");
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
        return;
      }
    } else {
      // Upload new image if provided
      if (fileInput.files && fileInput.files[0]) {
        imgUrl = await uploadImageToStorage(fileInput.files[0]);
      }
    }

    // Determine target table
    let table = "materials";
    if (cat === "project") table = "projects";
    if (cat === "service") table = "services";
    if (cat === "slideshow") table = "slideshow";

    if (window.editingItem) {
      // ── UPDATE existing entry ──
      const updateData = { title, desc, meta };

      if (table === "materials") {
        updateData.category = cat;
        if (priceVal !== null && !isNaN(priceVal)) {
          updateData.price = priceVal;
          const customPrices = JSON.parse(
            localStorage.getItem("wellrings_custom_prices") || "{}",
          );
          if (window.editingItem.id)
            customPrices[window.editingItem.id] = priceVal;
          customPrices[title] = priceVal;
          localStorage.setItem(
            "wellrings_custom_prices",
            JSON.stringify(customPrices),
          );
        }
      }

      if (imgUrl) {
        updateData.img_url = imgUrl;

        // Clean up old storage image if it was from our bucket
        if (
          window.editingItem.originalImgUrl &&
          window.editingItem.originalImgUrl.includes(
            "/storage/v1/object/public/images/",
          )
        ) {
          const oldPath = window.editingItem.originalImgUrl.split(
            "/storage/v1/object/public/images/",
          )[1];
          if (oldPath) {
            await supabaseClient.storage.from("images").remove([oldPath]);
          }
        }
      }

      // Handle category/table change during edit
      if (window.editingItem.table !== table) {
        // Delete from old table
        await supabaseClient
          .from(window.editingItem.table)
          .delete()
          .eq("id", window.editingItem.id);
        // Insert into new table
        const insertData = {
          title,
          desc,
          meta,
          img_url: imgUrl || window.editingItem.originalImgUrl || "logo.png",
        };
        if (table === "materials") {
          insertData.category = cat;
          insertData.icon = "fas fa-info-circle";
          insertData.tag = meta;
          if (priceVal !== null && !isNaN(priceVal))
            insertData.price = priceVal;
        }
        let { error } = await supabaseClient.from(table).insert(insertData);
        if (
          error &&
          error.message &&
          error.message.includes("'price' column")
        ) {
          delete insertData.price;
          const retryRes = await supabaseClient.from(table).insert(insertData);
          error = retryRes.error;
        }
        if (error) throw error;
      } else {
        // Normal update in same table
        let { error } = await supabaseClient
          .from(table)
          .update(updateData)
          .eq("id", window.editingItem.id);
        if (
          error &&
          error.message &&
          error.message.includes("'price' column")
        ) {
          delete updateData.price;
          const retryRes = await supabaseClient
            .from(table)
            .update(updateData)
            .eq("id", window.editingItem.id);
          error = retryRes.error;
        }
        if (error) throw error;
      }

      alert("Item successfully updated!");
    } else {
      // ── INSERT new entry ──
      if (!imgUrl) {
        alert(
          isUrlSource
            ? "Please enter a Google Maps or web image URL."
            : "Please select a photo to upload.",
        );
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
        return;
      }

      const insertData = { title, desc, meta, img_url: imgUrl };
      if (table === "materials") {
        insertData.category = cat;
        insertData.icon = "fas fa-info-circle";
        insertData.tag = meta;
        if (priceVal !== null && !isNaN(priceVal)) {
          insertData.price = priceVal;
          const customPrices = JSON.parse(
            localStorage.getItem("wellrings_custom_prices") || "{}",
          );
          customPrices[title] = priceVal;
          localStorage.setItem(
            "wellrings_custom_prices",
            JSON.stringify(customPrices),
          );
        }
      }

      let { error } = await supabaseClient.from(table).insert(insertData);
      if (error && error.message && error.message.includes("'price' column")) {
        delete insertData.price;
        const retryRes = await supabaseClient.from(table).insert(insertData);
        error = retryRes.error;
      }
      if (error) throw error;

      alert("Item successfully uploaded!");
    }

    // Reset form and reload
    window.editingItem = null;
    document.getElementById("uploadForm").reset();

    // Hide preview
    const previewContainer = document.getElementById("imagePreviewContainer");
    const previewImg = document.getElementById("imagePreview");
    if (previewContainer) previewContainer.classList.add("hidden");
    if (previewImg) previewImg.src = "";

    // Hide cancel button
    const cancelBtn = document.getElementById("cancelEditBtn");
    if (cancelBtn) cancelBtn.classList.add("hidden");

    submitBtn.innerText = "Publish Update";
    submitBtn.disabled = false;

    // Refresh visibility state of fields
    updateFormFieldsVisibility();

    // Invalidate session cache so the public grid reloads with the new entry
    _dynamicCache.loaded = false;
    _dynamicCache.slideshows = null;
    renderAdminManageList();
    loadDynamicContent(true);
  } catch (err) {
    console.error("Upload error:", err);
    alert("Error: " + (err.message || JSON.stringify(err)));
    submitBtn.innerText = originalBtnText;
    submitBtn.disabled = false;
  }
}

// ============================================================
// Hero Slideshow Auto-rotation
// ============================================================
// ============================================================
// Hero Slideshow Auto-rotation (Controls dynamic / 3D slideshow elements)
// ============================================================
window.startHeroSlideshow = function () {
  const images = document.querySelectorAll(".slideshow-img");
  const dots = document.querySelectorAll(".slideshow-dots .dot");
  if (!images.length) return;

  // Clear any existing autoplay intervals to prevent overlapping
  if (window.heroSlideshowIntervalId) {
    clearInterval(window.heroSlideshowIntervalId);
  }

  let currentIndex = 0;
  const INTERVAL_MS = 3000;

  function goToSlide(index) {
    if (!images[currentIndex] || !dots[currentIndex]) return;
    images[currentIndex].classList.remove("active");
    dots[currentIndex].classList.remove("active");
    currentIndex = index % images.length;
    if (images[currentIndex] && dots[currentIndex]) {
      images[currentIndex].classList.add("active");
      dots[currentIndex].classList.add("active");
    }
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  // Attach event click listeners to dots
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      goToSlide(parseInt(dot.getAttribute("data-index")));
      if (window.heroSlideshowIntervalId)
        clearInterval(window.heroSlideshowIntervalId);
      window.heroSlideshowIntervalId = setInterval(nextSlide, INTERVAL_MS);
    });
  });

  const slideshow = document.getElementById("heroSlideshow");
  if (slideshow && !window.slideshowListenersAdded) {
    slideshow.addEventListener("mouseenter", () => {
      if (window.heroSlideshowIntervalId)
        clearInterval(window.heroSlideshowIntervalId);
    });
    slideshow.addEventListener("mouseleave", () => {
      if (window.heroSlideshowIntervalId)
        clearInterval(window.heroSlideshowIntervalId);
      window.heroSlideshowIntervalId = setInterval(nextSlide, INTERVAL_MS);
    });
    window.slideshowListenersAdded = true;
  }

  window.heroSlideshowIntervalId = setInterval(nextSlide, INTERVAL_MS);
};

// ============================================================
// System Diagram Light-box Modal
// ============================================================
function openDiagramModal() {
  const modal = document.getElementById("diagramModal");
  if (modal) modal.classList.add("open");
}

function closeDiagramModal() {
  const modal = document.getElementById("diagramModal");
  if (modal) modal.classList.remove("open");
}

// ============================================================
// About & System Design Tab Switcher
// ============================================================
function switchAboutTab(tabName, evt) {
  const tabs = document.querySelectorAll(".about-tab-btn");
  const contents = document.querySelectorAll(".about-tab-content");

  tabs.forEach((btn) => btn.classList.remove("active"));
  contents.forEach((content) => content.classList.add("hidden"));

  if (evt && evt.currentTarget) {
    evt.currentTarget.classList.add("active");
  }

  if (tabName === "overview") {
    const target = document.getElementById("about-tab-overview");
    if (target) target.classList.remove("hidden");
  } else if (tabName === "diagram") {
    const target = document.getElementById("about-tab-diagram");
    if (target) target.classList.remove("hidden");
  }
}

// ============================================================
// Customer Auth & Gmail / Google Verification State Management
// ============================================================
let customerSession = JSON.parse(
  localStorage.getItem("wellrings_customer") || "null",
);
let cart = JSON.parse(localStorage.getItem("wellrings_cart") || "[]");
window.pendingEmail = "";
window.pendingName = "";
window.generatedOtp = "4826";
window.otpTimerId = null;
function getDeliveryRate() {
  const saved = localStorage.getItem("wellrings_delivery_rate");
  if (saved && !isNaN(parseFloat(saved))) {
    return parseFloat(saved);
  }
  return 50; // Default ₹50 per km rate
}

function updateDeliveryRateBadges() {
  const rate = getDeliveryRate();
  const rateBadge = document.getElementById("deliveryRateBadge");
  const summaryRate = document.getElementById("summaryRateDisplay");
  const adminInput = document.getElementById("adminDeliveryRate");

  if (rateBadge) rateBadge.innerText = `₹${rate} / km`;
  if (summaryRate) summaryRate.innerText = rate;
  if (adminInput && document.activeElement !== adminInput)
    adminInput.value = rate;
}

window.saveDeliveryRateFromAdmin = function () {
  const input = document.getElementById("adminDeliveryRate");
  if (!input) return;
  const rate = parseFloat(input.value);
  if (isNaN(rate) || rate < 0) {
    alert("Please enter a valid delivery rate per km.");
    return;
  }
  localStorage.setItem("wellrings_delivery_rate", rate);
  updateDeliveryRateBadges();
  updateDeliveryCalculation();
  alert(`Delivery rate successfully updated to ₹${rate} / km!`);
};

function initCustomerSession() {
  if (customerSession && (customerSession.email || customerSession.phone)) {
    const userKey = customerSession.email || customerSession.phone;
    const savedUserCartStr = localStorage.getItem("wellrings_cart_" + userKey);
    if (savedUserCartStr) {
      try {
        const savedUserCart = JSON.parse(savedUserCartStr);
        if (Array.isArray(savedUserCart) && savedUserCart.length > 0) {
          cart = savedUserCart;
          localStorage.setItem("wellrings_cart", JSON.stringify(cart));
        }
      } catch (e) {
        console.error("Error restoring saved cart:", e);
      }
    }
  }
  updateCustomerHeaderUI();
  updateCartBadges();
}

function updateCustomerHeaderUI() {
  const authBtn = document.getElementById("customerAuthBtn");
  const authIcon = document.getElementById("customerAuthIcon");
  const authText = document.getElementById("customerAuthText");
  if (!authBtn) return;

  if (customerSession && (customerSession.email || customerSession.phone)) {
    const userLabel =
      customerSession.name || customerSession.email || customerSession.phone;
    if (authIcon) authIcon.className = "fas fa-user-check";
    if (authText) authText.innerText = userLabel;
    authBtn.classList.add("logged-in");
    authBtn.title = `Logged in: ${userLabel}`;
  } else {
    if (authIcon) authIcon.className = "fas fa-user-circle";
    if (authText) authText.innerText = "Login";
    authBtn.classList.remove("logged-in");
    authBtn.title = "Customer Login";
  }
}

// ============================================================
// Supabase Cross-Device Sync for Customer Profiles & Cart
// ============================================================
async function syncCustomerSessionToCloud() {
  if (!customerSession || !customerSession.email) return;
  try {
    const payload = {
      email: customerSession.email.toLowerCase(),
      name: customerSession.name || "",
      phone: customerSession.phone || "",
      place: customerSession.place || "",
      photo: customerSession.photo || "",
      cart: cart || [],
      updated_at: new Date().toISOString(),
    };
    await supabaseClient
      .from("customer_profiles")
      .upsert(payload, { onConflict: "email" });
  } catch (err) {
    console.warn("Supabase profile sync notice:", err);
  }
}

async function loadCustomerSessionFromCloud(email) {
  if (!email) return;
  try {
    // Select only the columns we actually use — avoids fetching extra data.
    // In particular avoids fetching large JSONB fields if schema grows later.
    const { data, error } = await supabaseClient
      .from("customer_profiles")
      .select("email,name,phone,place,photo,cart")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (error) {
      console.warn("Cloud profile fetch notice:", error);
      return;
    }

    if (data) {
      customerSession = {
        email: data.email,
        name: data.name || customerSession?.name || data.email.split("@")[0],
        phone: data.phone || customerSession?.phone || "",
        place: data.place || customerSession?.place || "",
        photo: data.photo || customerSession?.photo || "",
        verified: true,
        loginTime: new Date().toISOString(),
      };
      localStorage.setItem("wellrings_customer", JSON.stringify(customerSession));

      if (Array.isArray(data.cart) && data.cart.length > 0) {
        cart = data.cart;
        localStorage.setItem("wellrings_cart", JSON.stringify(cart));
      }

      updateCustomerHeaderUI();
      renderCartUI();
    }
  } catch (err) {
    console.warn("Cloud profile sync error:", err);
  }
}

function openCustomerAuthModal() {
  const modal = document.getElementById("customerAuthModal");
  const loginView = document.getElementById("customerLoginFormView");
  const otpView = document.getElementById("customerOtpFormView");
  const profileView = document.getElementById("customerProfileView");
  const editView = document.getElementById("customerEditProfileView");
  if (!modal) return;

  if (editView) editView.classList.add("hidden");

  if (customerSession && (customerSession.email || customerSession.phone)) {
    if (loginView) loginView.classList.add("hidden");
    if (otpView) otpView.classList.add("hidden");
    if (profileView) profileView.classList.remove("hidden");

    const nameEl = document.getElementById("loggedInCustName");
    const emailEl = document.getElementById("loggedInCustEmail");
    const phoneEl = document.getElementById("loggedInCustPhone");
    const placeEl = document.getElementById("loggedInCustPlace");
    const photoEl = document.getElementById("loggedInCustPhoto");
    const placeholderEl = document.getElementById("loggedInCustPhotoPlaceholder");

    if (nameEl) nameEl.innerText = customerSession.name || "Customer Account";
    if (emailEl) emailEl.innerText = customerSession.email || "";

    if (phoneEl) {
      phoneEl.innerHTML = customerSession.phone
        ? `<i class="fas fa-phone-alt"></i> ${customerSession.phone}`
        : `<i class="fas fa-phone-alt"></i> Phone not set`;
    }
    if (placeEl) {
      placeEl.innerHTML = customerSession.place
        ? `<i class="fas fa-map-marker-alt"></i> ${customerSession.place}`
        : `<i class="fas fa-map-marker-alt"></i> Place not set`;
    }

    if (photoEl && placeholderEl) {
      if (customerSession.photo) {
        photoEl.src = customerSession.photo;
        photoEl.style.display = "block";
        placeholderEl.style.display = "none";
      } else {
        photoEl.style.display = "none";
        placeholderEl.style.display = "block";
      }
    }
  } else {
    if (loginView) loginView.classList.remove("hidden");
    if (otpView) otpView.classList.add("hidden");
    if (profileView) profileView.classList.add("hidden");
  }

  modal.classList.add("open");
}

function closeCustomerAuthModal() {
  const modal = document.getElementById("customerAuthModal");
  if (modal) modal.classList.remove("open");
  if (window.otpTimerId) clearInterval(window.otpTimerId);
}

// 1-Click Google OAuth Sign-In for Customers
async function loginWithGoogle() {
  showToast("Connecting to Google Auth...");
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + window.location.pathname,
    },
  });
  if (error) {
    console.error("Google Sign-In error:", error);
    showToast("Google login error: " + error.message);
  }
}

// Request Gmail Verification Code
async function requestCustomerEmailOtp(e) {
  if (e) e.preventDefault();
  const emailInput = document.getElementById("custEmailInput");
  const nameInput = document.getElementById("custNameInput");
  const phoneInput = document.getElementById("custPhoneInput");
  const placeInput = document.getElementById("custPlaceInput");
  const photoInput = document.getElementById("custPhotoInput");

  const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
  const name = nameInput ? nameInput.value.trim() : "";
  const phone = phoneInput ? phoneInput.value.trim() : "";
  const place = placeInput ? placeInput.value.trim() : "";

  if (!email || !email.includes("@")) {
    alert("Please enter a valid Gmail / Email address.");
    return;
  }
  if (!name) {
    alert("Please enter your name.");
    return;
  }

  window.pendingEmail = email;
  window.pendingName = name;
  window.pendingPhone = phone;
  window.pendingPlace = place;
  window.pendingPhoto = "";

  const proceedWithOtp = () => {
    // Generate dynamic 4-digit verification code
    window.generatedOtp = Math.floor(
      1000 + Math.floor(Math.random() * 9000),
    ).toString();

    try {
      supabaseClient.auth.signInWithOtp({
        email: email,
        options: { shouldCreateUser: true },
      }).catch(() => {});
    } catch (err) {
      console.warn("Supabase OTP notice:", err);
    }

    try {
      if (typeof emailjs !== "undefined") {
        const otpCode = window.generatedOtp;
        console.log("📧 Sending OTP", otpCode, "to", email);
        emailjs
          .send("service_34ugknd", "template_gsaz3ad", {
            to_name: window.pendingName,
            from_name: "Murugesan Well Rings Verification",
            to_email: email,
            user_email: email,
            recipient_email: email,
            email: email,
            reply_to: email,
            phone_number: otpCode,
            otp_code: otpCode,
            verification_code: otpCode,
            code: otpCode,
            service_type: "Gmail Verification Code",
            message_details: `Your Murugesan Well Rings Gmail Verification Code is: ${otpCode}. Please enter this 4-digit code in the app to complete verification.`,
          })
          .catch((e) => console.error("❌ EmailJS OTP send failed:", e));
      }
    } catch (err) {
      console.error("❌ EmailJS dispatch error:", err);
    }

    const otpSubtitle = document.getElementById("otpPhoneSubtitle");
    const loginView = document.getElementById("customerLoginFormView");
    const otpView = document.getElementById("customerOtpFormView");
    const otpInput = document.getElementById("custOtpInput");

    if (otpSubtitle)
      otpSubtitle.innerText = `Enter the 4-digit verification code sent to ${email}`;
    if (otpInput) otpInput.value = "";

    if (loginView) loginView.classList.add("hidden");
    if (otpView) otpView.classList.remove("hidden");

    startOtpTimer();
    showToast(
      `📩 4-Digit Verification Code sent to ${email}! Check your Gmail.`,
    );
  };

  if (photoInput && photoInput.files && photoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function (evt) {
      window.pendingPhoto = evt.target.result;
      proceedWithOtp();
    };
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    proceedWithOtp();
  }
}

function startOtpTimer() {
  if (window.otpTimerId) clearInterval(window.otpTimerId);

  let seconds = 30;
  const timerText = document.getElementById("otpCountdownSec");
  const resendBtn = document.getElementById("resendOtpBtn");
  if (resendBtn) resendBtn.disabled = true;

  window.otpTimerId = setInterval(() => {
    seconds--;
    if (timerText) timerText.innerText = seconds;
    if (seconds <= 0) {
      clearInterval(window.otpTimerId);
      if (resendBtn) resendBtn.disabled = false;
    }
  }, 1000);
}

function resendCustomerEmailOtp() {
  window.generatedOtp = Math.floor(
    1000 + Math.floor(Math.random() * 9000),
  ).toString();
  const otpInput = document.getElementById("custOtpInput");
  if (otpInput) otpInput.value = "";

  if (window.pendingEmail) {
    const otpCode = window.generatedOtp;
    supabaseClient.auth
      .signInWithOtp({
        email: window.pendingEmail,
        options: { shouldCreateUser: true },
      })
      .catch(() => {});
    if (typeof emailjs !== "undefined") {
      emailjs
        .send("service_34ugknd", "template_gsaz3ad", {
          to_name: window.pendingName || window.pendingEmail.split("@")[0],
          from_name: "Murugesan Well Rings Verification",
          to_email: window.pendingEmail,
          user_email: window.pendingEmail,
          recipient_email: window.pendingEmail,
          email: window.pendingEmail,
          reply_to: window.pendingEmail,
          phone_number: otpCode,
          otp_code: otpCode,
          verification_code: otpCode,
          code: otpCode,
          service_type: "Gmail Verification Code",
          message_details: `Your new Murugesan Well Rings Gmail Verification Code is: ${otpCode}. Please enter this 4-digit code in the app to complete verification.`,
        })
        .catch(() => {});
    }
  }

  startOtpTimer();
  showToast(
    `📩 New 4-Digit Verification Code sent to ${window.pendingEmail}! Check your Gmail.`,
  );
}

function backToEmailInput() {
  if (window.otpTimerId) clearInterval(window.otpTimerId);
  const loginView = document.getElementById("customerLoginFormView");
  const otpView = document.getElementById("customerOtpFormView");
  if (loginView) loginView.classList.remove("hidden");
  if (otpView) otpView.classList.add("hidden");
}

async function verifyCustomerEmailOtp(e) {
  if (e) e.preventDefault();
  const otpInput = document.getElementById("custOtpInput");
  const enteredOtp = otpInput ? otpInput.value.trim() : "";

  let isOtpValid = false;

  if (enteredOtp.length === 4 && window.pendingEmail && window.generatedOtp) {
    if (enteredOtp === window.generatedOtp) {
      isOtpValid = true;
    }
  }

  if (!isOtpValid) {
    alert(
      `Incorrect code. Please enter the valid verification code sent to ${window.pendingEmail}.`,
    );
    return;
  }

  customerSession = {
    email: window.pendingEmail,
    name: window.pendingName,
    phone: window.pendingPhone || "",
    place: window.pendingPlace || "",
    photo: window.pendingPhoto || "",
    verified: true,
    loginTime: new Date().toISOString(),
  };

  localStorage.setItem("wellrings_customer", JSON.stringify(customerSession));

  // Restore old saved cart data for this email
  const savedUserCartStr = localStorage.getItem(
    "wellrings_cart_" + customerSession.email,
  );
  if (savedUserCartStr) {
    try {
      const savedUserCart = JSON.parse(savedUserCartStr);
      if (Array.isArray(savedUserCart) && savedUserCart.length > 0) {
        if (cart.length > 0) {
          savedUserCart.forEach((savedItem) => {
            const existingIdx = cart.findIndex(
              (item) => item.title === savedItem.title,
            );
            if (existingIdx > -1) {
              cart[existingIdx].quantity = Math.max(
                cart[existingIdx].quantity,
                savedItem.quantity,
              );
            } else {
              cart.push(savedItem);
            }
          });
        } else {
          cart = savedUserCart;
        }
      }
    } catch (err) {
      console.error("Error parsing user cart:", err);
    }
  }

  saveCart();
  updateCustomerHeaderUI();

  const otpView = document.getElementById("customerOtpFormView");
  const profileView = document.getElementById("customerProfileView");
  if (otpView) otpView.classList.add("hidden");
  if (profileView) profileView.classList.remove("hidden");

  openCustomerAuthModal();

  renderCartUI();
  showToast(
    `✓ Account verified for ${customerSession.name}!`,
  );
}

function handleCustomerLogout() {
  const userKey = customerSession
    ? customerSession.email || customerSession.phone
    : null;
  if (userKey) {
    localStorage.setItem("wellrings_cart_" + userKey, JSON.stringify(cart));
  }

  customerSession = null;
  localStorage.removeItem("wellrings_customer");

  cart = [];
  localStorage.removeItem("wellrings_cart");

  const kmInput = document.getElementById("cartDeliveryKm");
  const locInput = document.getElementById("cartDeliveryLocation");
  const gmapInput = document.getElementById("cartGmapLink");
  if (kmInput) kmInput.value = "0";
  if (locInput) locInput.value = "";
  if (gmapInput) gmapInput.value = "";

  updateCustomerHeaderUI();
  updateCartBadges();
  closeCustomerAuthModal();
  renderCartUI();
  showToast("Logged out. Cart saved for your account and cleared for session.");
}

function toggleEditProfileForm() {
  const profileView = document.getElementById("customerProfileView");
  const editView = document.getElementById("customerEditProfileView");
  if (!customerSession) return;

  const nameInput = document.getElementById("editCustName");
  const phoneInput = document.getElementById("editCustPhone");
  const placeInput = document.getElementById("editCustPlace");

  if (nameInput) nameInput.value = customerSession.name || "";
  if (phoneInput) phoneInput.value = customerSession.phone || "";
  if (placeInput) placeInput.value = customerSession.place || "";

  if (profileView) profileView.classList.add("hidden");
  if (editView) editView.classList.remove("hidden");
}

function cancelEditProfile() {
  const profileView = document.getElementById("customerProfileView");
  const editView = document.getElementById("customerEditProfileView");
  if (editView) editView.classList.add("hidden");
  if (profileView) profileView.classList.remove("hidden");
}

function saveCustomerProfile(e) {
  if (e) e.preventDefault();
  if (!customerSession) return;

  const nameVal = document.getElementById("editCustName").value.trim();
  const phoneVal = document.getElementById("editCustPhone").value.trim();
  const placeVal = document.getElementById("editCustPlace").value.trim();
  const photoInput = document.getElementById("editCustPhoto");

  const saveDetails = (photoData) => {
    customerSession.name = nameVal || customerSession.name;
    customerSession.phone = phoneVal;
    customerSession.place = placeVal;
    if (photoData) customerSession.photo = photoData;

    localStorage.setItem("wellrings_customer", JSON.stringify(customerSession));
    updateCustomerHeaderUI();
    cancelEditProfile();
    openCustomerAuthModal();
    syncCustomerSessionToCloud();
    showToast("✓ Profile details saved successfully!");
  };

  if (photoInput && photoInput.files && photoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function (evt) {
      saveDetails(evt.target.result);
    };
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    saveDetails(null);
  }
}

// Card Quantity Controller
window.adjustCardQty = function (id, delta) {
  const input = document.getElementById("cardQty_" + id);
  if (!input) return;
  let val = parseInt(input.value) || 1;
  val += delta;
  if (val < 1) val = 1;
  input.value = val;
};

// Cart Operations
window.addMaterialToCart = function (id, title, price, imgUrl, meta) {
  const qtyInput = document.getElementById("cardQty_" + id);
  let pieces = 1;
  if (qtyInput) {
    pieces = parseInt(qtyInput.value) || 1;
  }

  const numericPrice = parseFloat(price) || 450;

  const existingIndex = cart.findIndex((item) => item.title === title);
  if (existingIndex > -1) {
    cart[existingIndex].quantity += pieces;
  } else {
    cart.push({
      id: id,
      title: title,
      price: numericPrice,
      imgUrl: imgUrl || "logo.png",
      meta: meta || "",
      quantity: pieces,
    });
  }

  saveCart();
  showToast(`Added ${pieces} pc(s) of "${title}" to Cart!`);
};

function changePieces(index, delta) {
  if (!cart[index]) return;
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    removeFromCart(index);
    return;
  }
  saveCart();
}

function updateCartQuantity(index, newQty) {
  if (!cart[index]) return;
  let val = parseInt(newQty) || 1;
  if (val < 1) val = 1;
  cart[index].quantity = val;
  saveCart();
}

function removeFromCart(index) {
  if (!cart[index]) return;
  const removedTitle = cart[index].title;
  cart.splice(index, 1);
  saveCart();
  showToast(`Removed "${removedTitle}" from Cart.`);
}

function clearCart() {
  if (cart.length === 0) return;
  if (confirm("Are you sure you want to clear your cart?")) {
    cart = [];
    saveCart();
    showToast("Cart cleared.");
  }
}

// Debounced cloud sync — prevents a Supabase write on every single cart +/- click.
// Waits 3 seconds of inactivity before syncing, batching rapid cart changes into one write.
let _cartSyncTimer = null;
function saveCart() {
  localStorage.setItem("wellrings_cart", JSON.stringify(cart));
  if (customerSession && customerSession.phone) {
    localStorage.setItem(
      "wellrings_cart_" + customerSession.phone,
      JSON.stringify(cart),
    );
  }
  updateCartBadges();
  renderCartUI();
  // Debounce: only sync to cloud after 3 seconds of no further cart changes
  if (_cartSyncTimer) clearTimeout(_cartSyncTimer);
  _cartSyncTimer = setTimeout(() => {
    syncCustomerSessionToCloud();
  }, 3000);
}

function updateCartBadges() {
  const totalPieces = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById("cartBadge");
  const floatBadge = document.getElementById("floatCartBadge");
  const countPill = document.getElementById("cartHeaderCount");

  if (badge) badge.innerText = totalPieces;
  if (floatBadge) floatBadge.innerText = totalPieces;
  if (countPill)
    countPill.innerText =
      totalPieces + (totalPieces === 1 ? " Piece" : " Pieces");
}

function openCartModal() {
  const modal = document.getElementById("cartModal");
  if (modal) {
    renderCartUI();
    modal.classList.add("open");
  }
}

function closeCartModal() {
  const modal = document.getElementById("cartModal");
  if (modal) modal.classList.remove("open");
}

function scrollToMaterials() {
  closeCartModal();
  const matEl = document.getElementById("materials");
  if (matEl) {
    matEl.scrollIntoView({ behavior: "smooth" });
  } else {
    window.location.href = "index.html#materials";
  }
}

// Delivery Distance Calculator (per KM)
function setDistancePreset(km) {
  const kmInput = document.getElementById("cartDeliveryKm");
  if (kmInput) {
    kmInput.value = km;
    updateDeliveryCalculation();
  }
}

function updateDeliveryCalculation() {
  const kmInput = document.getElementById("cartDeliveryKm");
  const km = kmInput ? Math.max(0, parseFloat(kmInput.value) || 0) : 0;
  const rate = getDeliveryRate();

  const deliveryCharge = Math.round(km * rate);
  const materialsSubtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const grandTotal = materialsSubtotal + deliveryCharge;

  const subtotalEl = document.getElementById("cartMaterialsSubtotal");
  const kmDisplayEl = document.getElementById("summaryKmDisplay");
  const summaryRateEl = document.getElementById("summaryRateDisplay");
  const deliveryChargeEl = document.getElementById("cartDeliveryCharge");
  const totalPriceEl = document.getElementById("cartTotalPrice");

  if (subtotalEl)
    subtotalEl.innerText = "₹" + materialsSubtotal.toLocaleString("en-IN");
  if (kmDisplayEl) kmDisplayEl.innerText = km + " km";
  if (summaryRateEl) summaryRateEl.innerText = rate;
  if (deliveryChargeEl)
    deliveryChargeEl.innerText =
      km > 0
        ? "₹" + deliveryCharge.toLocaleString("en-IN")
        : "₹0 (Free / Pickup)";
  if (totalPriceEl)
    totalPriceEl.innerText = "₹" + grandTotal.toLocaleString("en-IN");
}

function renderCartUI() {
  const custBar = document.getElementById("cartCustomerBar");
  const itemsContainer = document.getElementById("cartItemsList");
  const totalPiecesEl = document.getElementById("cartTotalPieces");

  if (custBar) {
    if (customerSession && (customerSession.email || customerSession.phone)) {
      const userLabel = customerSession.email || customerSession.phone;
      custBar.innerHTML = `
        <div class="cart-cust-info">
          <span><i class="fas fa-check-circle" style="color: #22c55e;"></i> Verified Account: <strong>${userLabel}</strong> (${customerSession.name || "Customer"})</span>
          <button class="btn-text-sm" onclick="openCustomerAuthModal()"><i class="fas fa-edit"></i> Account</button>
        </div>
      `;
    } else {
      custBar.innerHTML = `
        <div class="cart-login-prompt">
          <span><i class="fab fa-google" style="color: #ea4335;"></i> Sign in via Gmail / Google for verified order status</span>
          <button class="btn btn-sm btn-secondary" onclick="closeCartModal(); openCustomerAuthModal();">Gmail Login</button>
        </div>
      `;
    }
  }

  if (itemsContainer) {
    if (cart.length === 0) {
      itemsContainer.innerHTML = `
        <div class="cart-empty-state">
          <i class="fas fa-shopping-cart" style="font-size: 2.8rem; color: var(--text-muted); opacity: 0.5; margin-bottom: 12px;"></i>
          <p style="font-weight: 600; font-size: 1.1rem; color: var(--text-main);">Your cart is empty</p>
          <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 16px;">Add well rings, covers or fencing posts to calculate estimate.</p>
          <button class="btn btn-sm btn-primary" onclick="scrollToMaterials()"><i class="fas fa-plus"></i> Explore Products</button>
        </div>
      `;
    } else {
      itemsContainer.innerHTML = cart
        .map(
          (item, index) => `
        <div class="cart-item-row">
          <img src="${resolveProductImage({ title: item.title, img_url: item.imgUrl })}" alt="${item.title}" class="cart-item-img" width="50" height="50" loading="lazy" onerror="this.onerror=null; this.src='logo.png';">
          <div class="cart-item-details">
            <h4 class="cart-item-title">${item.title}</h4>
            <span class="cart-item-meta">${item.meta || "Concrete Material"}</span>
            <span class="cart-item-price">₹${item.price.toLocaleString("en-IN")} / piece</span>
          </div>
          <div class="cart-item-qty-control">
            <button class="qty-btn" onclick="changePieces(${index}, -1)" title="Decrease pieces" aria-label="Decrease quantity for ${item.title}">-</button>
            <input type="number" class="qty-input" value="${item.quantity}" min="1" onchange="updateCartQuantity(${index}, this.value)" aria-label="Quantity for ${item.title}">
            <button class="qty-btn" onclick="changePieces(${index}, 1)" title="Increase pieces" aria-label="Increase quantity for ${item.title}">+</button>
            <span class="qty-label">pcs</span>
          </div>
          <div class="cart-item-total">
            ₹${(item.price * item.quantity).toLocaleString("en-IN")}
          </div>
          <button class="cart-item-remove" onclick="removeFromCart(${index})" title="Remove item" aria-label="Remove ${item.title} from cart">&times;</button>
        </div>
      `,
        )
        .join("");
    }
  }

  const totalPieces = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (totalPiecesEl) totalPiecesEl.innerText = totalPieces + " pcs";

  const cartNameInput = document.getElementById("cartCustomerName");
  const cartPhoneInput = document.getElementById("cartCustomerPhone");
  if (customerSession) {
    if (cartNameInput && !cartNameInput.value && customerSession.name) {
      cartNameInput.value = customerSession.name;
    }
    if (cartPhoneInput && !cartPhoneInput.value && customerSession.phone) {
      cartPhoneInput.value = customerSession.phone;
    }
  }

  updateDeliveryCalculation();
}

function fetchCurrentGpsLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  const gpsBtn = document.querySelector(".gps-btn");
  let origText = "";
  if (gpsBtn) {
    origText = gpsBtn.innerHTML;
    gpsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Locating...';
    gpsBtn.disabled = true;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const gmapsUrl = `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;

      const gmapInput = document.getElementById("cartGmapLink");
      if (gmapInput) {
        gmapInput.value = gmapsUrl;
      }

      if (gpsBtn) {
        gpsBtn.innerHTML = '<i class="fas fa-check-circle"></i> Located!';
        gpsBtn.disabled = false;
        setTimeout(() => {
          gpsBtn.innerHTML = origText;
        }, 3000);
      }

      showToast("📍 GPS Location detected & Google Maps link generated!");
    },
    (error) => {
      if (gpsBtn) {
        gpsBtn.innerHTML = origText;
        gpsBtn.disabled = false;
      }
      let errMessage = "Unable to retrieve GPS location.";
      if (error.code === error.PERMISSION_DENIED) {
        errMessage =
          "Location permission denied. Please paste your Google Maps link manually.";
      }
      alert(errMessage);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
  );
}

function sendCartOrderWhatsApp() {
  if (cart.length === 0) {
    alert("Your cart is empty! Please add materials to cart first.");
    return;
  }

  const cartNameInput = document.getElementById("cartCustomerName");
  const cartPhoneInput = document.getElementById("cartCustomerPhone");

  let custName = cartNameInput ? cartNameInput.value.trim() : "";
  let custPhone = cartPhoneInput ? cartPhoneInput.value.trim() : "";

  if (!custName && customerSession && customerSession.name) {
    custName = customerSession.name;
  }
  if (!custPhone && customerSession && customerSession.phone) {
    custPhone = customerSession.phone;
  }

  if (!custName) {
    alert("Please enter your Full Name in the cart before sending the order.");
    if (cartNameInput) cartNameInput.focus();
    return;
  }

  const cleanPhone = custPhone.replace(/\D/g, "");
  if (!cleanPhone || cleanPhone.length !== 10) {
    alert("Please enter a valid 10-digit Mobile Phone Number (e.g. 9876543210).");
    if (cartPhoneInput) cartPhoneInput.focus();
    return;
  }
  custPhone = cleanPhone;

  let custEmail = customerSession
    ? customerSession.email || customerSession.phone || ""
    : "";
  const deliveryLoc = document.getElementById("cartDeliveryLocation")
    ? document.getElementById("cartDeliveryLocation").value.trim()
    : "";
  const gmapLink = document.getElementById("cartGmapLink")
    ? document.getElementById("cartGmapLink").value.trim()
    : "";
  const deliveryRate = getDeliveryRate();
  const kmInput = document.getElementById("cartDeliveryKm");
  const deliveryKm = kmInput ? Math.max(0, parseFloat(kmInput.value) || 0) : 0;
  const deliveryCharge = Math.round(deliveryKm * deliveryRate);

  // Save phone & name back to session if present
  if (customerSession) {
    customerSession.name = custName;
    customerSession.phone = custPhone;
    localStorage.setItem("wellrings_customer", JSON.stringify(customerSession));
  }

  if (!custEmail) {
    const promptEmail = prompt(
      "Please enter your Gmail / Email address for quote confirmation:",
    );
    if (!promptEmail || !promptEmail.trim().includes("@")) {
      alert(
        "A valid Gmail / Email address is required to place your order query.",
      );
      return;
    }
    custEmail = promptEmail.trim().toLowerCase();
    customerSession = { email: custEmail, name: custName, phone: custPhone, verified: false };
    localStorage.setItem("wellrings_customer", JSON.stringify(customerSession));
    updateCustomerHeaderUI();
  }

  let custPlace = customerSession ? customerSession.place || "" : "";

  let text = `📦 *MURUGESAN WELL RINGS - NEW MATERIAL ORDER*\n`;
  text += `--------------------------------\n`;
  text += `📧 *Customer Gmail:* ${custEmail} ${customerSession && customerSession.verified ? "(✓ Verified)" : ""}\n`;
  if (custName) text += `👤 *Customer Name:* ${custName}\n`;
  if (custPhone) text += `📱 *Phone Number:* ${custPhone}\n`;
  if (custPlace) text += `🏡 *Customer Place:* ${custPlace}\n`;
  if (deliveryLoc) text += `📍 *Delivery Address:* ${deliveryLoc}\n`;
  if (gmapLink) text += `🗺️ *Google Maps Location:* ${gmapLink}\n`;
  text += `🚚 *Delivery Distance:* ${deliveryKm} km from Avadi Yard\n`;
  text += `--------------------------------\n`;
  text += `📋 *ORDERED MATERIALS (PIECES):*\n`;

  let totalPcs = 0;
  let materialsSubtotal = 0;

  cart.forEach((item, idx) => {
    const itemTotal = item.price * item.quantity;
    totalPcs += item.quantity;
    materialsSubtotal += itemTotal;
    text += `${idx + 1}. *${item.title}*\n   Qty: *${item.quantity} pieces* @ ₹${item.price}/pc = ₹${itemTotal.toLocaleString("en-IN")}\n`;
  });

  const grandTotal = materialsSubtotal + deliveryCharge;

  text += `--------------------------------\n`;
  text += `🔢 *Total Pieces:* ${totalPcs} pcs\n`;
  text += `🛒 *Materials Subtotal:* ₹${materialsSubtotal.toLocaleString("en-IN")}\n`;
  text += `🚚 *Delivery Charge (${deliveryKm} km @ ₹${deliveryRate}/km):* ₹${deliveryCharge.toLocaleString("en-IN")}\n`;
  text += `💰 *GRAND TOTAL:* ₹${grandTotal.toLocaleString("en-IN")}\n`;
  text += `--------------------------------\n`;
  text += `Please confirm dispatch schedule and driver contact!`;

  const waUrl = `https://wa.me/918838135069?text=${encodeURIComponent(text)}`;
  
  // Directly navigate to WhatsApp URL - launches WhatsApp app on mobile seamlessly
  window.location.href = waUrl;
}

function showToast(msg) {
  const toast = document.getElementById("toastNotification");
  if (!toast) return;
  toast.innerText = msg;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

// ============================================================
// Google Maps — true lazy loading via IntersectionObserver
// The iframe uses data-src so it doesn't load until the
// contact section approaches the viewport (~200px before).
// ============================================================
(function () {
  const mapIframe = document.getElementById('contactMapIframe');
  if (!mapIframe) return;
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const el = entry.target;
          if (el.dataset.src && !el.src) {
            el.src = el.dataset.src;
          }
          obs.unobserve(el);
        }
      });
    }, { rootMargin: '200px' });
    obs.observe(mapIframe);
  } else {
    // Fallback for browsers without IntersectionObserver
    if (mapIframe.dataset.src) mapIframe.src = mapIframe.dataset.src;
  }
})();
