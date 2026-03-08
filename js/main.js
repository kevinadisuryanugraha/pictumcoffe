/* ==========================================
   PICTUM COFFEE & KITCHEN
   Main JavaScript - Interactions & Analytics
   ========================================== */

document.addEventListener("DOMContentLoaded", function () {
  // ==================== HEADER SCROLL ====================
  const header = document.getElementById("header");

  function handleScroll() {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", handleScroll);
  handleScroll(); // Initial check

  // ==================== MOBILE MENU ====================
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("nav");
  const navLinks = document.querySelectorAll(".nav-link");

  hamburger.addEventListener("click", function () {
    this.classList.toggle("active");
    nav.classList.toggle("active");
    document.body.style.overflow = nav.classList.contains("active")
      ? "hidden"
      : "";
  });

  // Close menu when clicking nav link
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      hamburger.classList.remove("active");
      nav.classList.remove("active");
      document.body.style.overflow = "";
    });
  });

  // ==================== SMOOTH SCROLL ====================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#") return;

      e.preventDefault();
      const target = document.querySelector(href);

      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        // Track navigation click
        trackEvent("navigation", "click", href);
      }
    });
  });

  // ==================== ACTIVE NAV LINK ====================
  const sections = document.querySelectorAll("section[id]");

  function updateActiveNav() {
    const scrollPos = window.scrollY + 100;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute("id");
      const link = document.querySelector(`.nav-link[href="#${id}"]`);

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((l) => l.classList.remove("active"));
        if (link) link.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", updateActiveNav);

  // ==================== SCROLL REVEAL ANIMATION ====================
  const revealElements = document.querySelectorAll(
    ".reveal-fade, .reveal-up, .reveal-left, .reveal-right"
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // ==================== MENU MODAL ====================
  const menuCards = document.querySelectorAll(".menu-card");
  const menuModal = document.getElementById("menuModal");
  const modalClose = document.getElementById("modalClose");
  const modalBody = document.getElementById("modalBody");

  menuCards.forEach((card) => {
    card.addEventListener("click", function () {
      const img = this.querySelector(".menu-image img").src;
      const name = this.querySelector(".menu-name").textContent;
      const desc = this.querySelector(".menu-desc").textContent;
      const tag = this.querySelector(".menu-tag").textContent;

      modalBody.innerHTML = `
                <img src="${img}" alt="${name}" style="width:100%; height:250px; object-fit:cover; border-radius:8px; margin-bottom:1rem;">
                <h3 style="font-family:'Playfair Display',serif; font-size:1.5rem; margin-bottom:0.5rem;">${name}</h3>
                <span style="display:inline-block; font-size:0.75rem; color:#2D5A3C; background:#F5F0E8; padding:0.25rem 0.5rem; border-radius:4px; margin-bottom:1rem;">${tag}</span>
                <p style="color:#6B6B6B; line-height:1.6;">${desc}</p>
                <a href="#reservasi" class="btn btn-primary" style="margin-top:1.5rem; width:100%;" onclick="closeMenuModal()">
                    <i class="fas fa-calendar-check"></i> Reservasi Sekarang
                </a>
            `;

      menuModal.classList.add("active");
      document.body.style.overflow = "hidden";

      // Track menu view
      trackEvent("menu", "view", name);
    });
  });

  modalClose.addEventListener("click", closeMenuModal);
  menuModal.addEventListener("click", function (e) {
    if (e.target === this) closeMenuModal();
  });

  // ==================== FORM HANDLING ====================
  const reservasiForm = document.getElementById("reservasiForm");
  const successModal = document.getElementById("successModal");

  if (reservasiForm) {
    reservasiForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get form data
      const formData = new FormData(this);
      const data = Object.fromEntries(formData);

      // Basic validation
      if (!data.nama || !data.tanggal || !data.waktu || !data.jumlah) {
        alert("Mohon lengkapi semua field yang diperlukan.");
        return;
      }

      // Track form submission
      trackEvent("form", "submit", "reservasi");

      // Show success modal
      successModal.classList.add("active");
      document.body.style.overflow = "hidden";

      // Reset form
      this.reset();

      // In production, you would send this to a server
      console.log("Reservasi Data:", data);
    });
  }

  // ==================== CTA CLICK TRACKING ====================
  document.querySelectorAll("[data-track]").forEach((el) => {
    el.addEventListener("click", function () {
      const action = this.dataset.track;
      const label = this.dataset.menu || this.textContent.trim();
      trackEvent("cta", "click", action, label);
    });
  });

  // ==================== SCROLL DEPTH TRACKING ====================
  let scrollMilestones = [25, 50, 75, 100];
  let trackedMilestones = [];

  function trackScrollDepth() {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);

    scrollMilestones.forEach((milestone) => {
      if (
        scrollPercent >= milestone &&
        !trackedMilestones.includes(milestone)
      ) {
        trackedMilestones.push(milestone);
        trackEvent("scroll", "depth", `${milestone}%`);
      }
    });
  }

  window.addEventListener("scroll", debounce(trackScrollDepth, 250));

  // ==================== KEYBOARD ACCESSIBILITY ====================
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeMenuModal();
      closeSuccessModal();
      hamburger.classList.remove("active");
      nav.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
});

// ==================== UTILITY FUNCTIONS ====================

function closeMenuModal() {
  const menuModal = document.getElementById("menuModal");
  menuModal.classList.remove("active");
  document.body.style.overflow = "";
}

function closeSuccessModal() {
  const successModal = document.getElementById("successModal");
  successModal.classList.remove("active");
  document.body.style.overflow = "";
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ==================== ANALYTICS TRACKING ====================

function trackEvent(category, action, label, value) {
  // Google Analytics 4
  if (typeof gtag === "function") {
    gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }

  // Console log for debugging (remove in production)
  console.log(`[Analytics] ${category} - ${action}: ${label}`, value || "");
}

// Track page view on load
if (typeof gtag === "function") {
  gtag("event", "page_view", {
    page_title: document.title,
    page_location: window.location.href,
  });
}

// ==================== HEATMAP READINESS (Hotjar/Clarity) ====================
// Placeholder for heatmap integration
// In production, add Hotjar or Microsoft Clarity snippet here

/*
// Example Hotjar snippet:
(function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:YOUR_HOTJAR_ID,hjsv:6};
    // ... rest of snippet
})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
*/
