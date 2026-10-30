"use strict";

/* =========================================
   STAYNEST - CONFIGURATION
========================================= */

/*
  IMPORTANT: These are example phone numbers, not real owners.
  Replace with real WhatsApp numbers in international format,
  digits only (e.g. 91XXXXXXXXXX).
*/
const pgOwners = {
    sunrise: { name: "Sunrise PG", phone: "919353652369" },
    "green-nest": { name: "Green Nest PG", phone: "919353652369" },
    "city-comfort": { name: "City Comfort PG", phone: "919353652369" }
};

// Replace with the real StayNest support WhatsApp number before launch.
const stayNestWhatsApp = "919353652369";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


/* =========================================
   MOBILE NAVIGATION
========================================= */

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

function closeMobileMenu() {
    if (!menuToggle || !navLinks) return;
    navLinks.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
}

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
        const isOpen = navLinks.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", closeMobileMenu);
    });

    document.addEventListener("click", function (event) {
        if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) {
            closeMobileMenu();
        }
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth > 800) closeMobileMenu();
    });
}


/* =========================================
   PROPERTY ENQUIRY / BOOK A VISIT
========================================= */

const bookingPanel = document.getElementById("bookingPanel");
const selectedPgName = document.getElementById("selectedPgName");
const bookingDescription = document.getElementById("bookingDescription");
const whatsappLink = document.getElementById("whatsappLink");
const callLink = document.getElementById("callLink");
const closeBooking = document.getElementById("closeBooking");

function openPropertyEnquiry(propertyKey) {
    const pg = pgOwners[propertyKey];

    if (!pg || !bookingPanel || !selectedPgName || !bookingDescription || !whatsappLink || !callLink) {
        return;
    }

    selectedPgName.textContent = pg.name;
    bookingDescription.textContent =
        `Contact the owner of ${pg.name} to ask about availability, ` +
        "facilities, rent, and suitable visit timings.";

    const message =
        `Hello, I'm interested in ${pg.name} listed on StayNest.\n` +
        "I would like to know about the current availability and rent. " +
        "I would also like to schedule a visit. " +
        "Please share the available timings.";

    whatsappLink.href = `https://wa.me/${pg.phone}?text=${encodeURIComponent(message)}`;
    callLink.href = `tel:+${pg.phone}`;

    // Re-trigger the opening animation each time a PG is selected.
    bookingPanel.hidden = true;
    void bookingPanel.offsetWidth;
    bookingPanel.hidden = false;

    bookingPanel.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "center"
    });
}

document.querySelectorAll(".book-visit-btn").forEach(function (button) {
    button.addEventListener("click", function () {
        openPropertyEnquiry(button.dataset.pg);
    });
});

if (closeBooking && bookingPanel) {
    closeBooking.addEventListener("click", function () {
        bookingPanel.hidden = true;
    });
}


/* =========================================
   CONTACT FORM -> WHATSAPP
========================================= */

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("contactName").value.trim();
        const phone = document.getElementById("contactPhone").value.trim();
        const message = document.getElementById("contactMessage").value.trim();

        if (!name || !phone || !message) {
            if (formStatus) formStatus.textContent = "Please complete all fields before continuing.";
            return;
        }

        // Demo guard: do not send customer details to a placeholder number.
        if (!/^91\d{10}$/.test(stayNestWhatsApp)) {
            if (formStatus) formStatus.textContent = "Please configure a valid support WhatsApp number.";
            return;
        }

        const contactMessage =
            "Hello StayNest!\n\n" +
            `Name: ${name}\n` +
            `Phone: ${phone}\n` +
            `Message: ${message}`;

        const whatsappURL =
            `https://wa.me/${stayNestWhatsApp}?text=` + encodeURIComponent(contactMessage);

        const whatsappWindow = window.open(whatsappURL, "_blank", "noopener,noreferrer");

        if (formStatus) {
            formStatus.textContent = whatsappWindow
                ? "WhatsApp opened. Review your message and send it there."
                : "If WhatsApp did not open, check your browser's pop-up settings.";
        }
    });
}


/* =========================================
   FOOTER YEAR
========================================= */

const currentYear = document.getElementById("currentYear");
if (currentYear) currentYear.textContent = new Date().getFullYear();


/* =========================================
   ACTIVE NAVIGATION LINK
========================================= */

const sectionLinks = document.querySelectorAll('.nav-links a[href^="#"]:not(.nav-cta)');
const pageSections = document.querySelectorAll("main section[id]");

if ("IntersectionObserver" in window && sectionLinks.length && pageSections.length) {
    const sectionObserver = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;

                const currentId = entry.target.id;

                sectionLinks.forEach(function (link) {
                    const isActive = link.getAttribute("href") === `#${currentId}`;
                    link.classList.toggle("active", isActive);
                    if (isActive) {
                        link.setAttribute("aria-current", "location");
                    } else {
                        link.removeAttribute("aria-current");
                    }
                });
            });
        },
        { rootMargin: "-25% 0px -60% 0px", threshold: 0 }
    );

    pageSections.forEach(function (section) {
        sectionObserver.observe(section);
    });
}


/* =========================================
   SCROLL REVEAL (smooth section transitions)
========================================= */

const revealItems = document.querySelectorAll("[data-reveal]");

revealItems.forEach(function (item) {
    item.style.setProperty("--d", item.dataset.delay || 0);

    // After the reveal finishes, drop the delay so hover effects stay snappy.
    item.addEventListener("transitionend", function handler(event) {
        if (event.target !== item || event.propertyName !== "opacity") return;
        item.classList.add("reveal-done");
        item.removeEventListener("transitionend", handler);
    });
});

if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
        function (entries, observer) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );

    revealItems.forEach(function (item) {
        revealObserver.observe(item);
    });
} else {
    // Fallback: show everything immediately.
    revealItems.forEach(function (item) {
        item.classList.add("is-visible", "reveal-done");
    });
}


/* =========================================
   SCROLL PROGRESS, HEADER STATE, PARALLAX
========================================= */

const scrollProgress = document.getElementById("scrollProgress");
const siteHeader = document.getElementById("siteHeader");
const visitDecoration = document.querySelector(".visit-decoration");
const visitSection = document.getElementById("booking");

let scrollTicking = false;

function updateOnScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    if (scrollProgress) {
        const progress = maxScroll > 0 ? Math.min(scrollTop / maxScroll, 1) : 0;
        scrollProgress.style.transform = `scaleX(${progress})`;
    }

    if (siteHeader) {
        siteHeader.classList.toggle("is-scrolled", scrollTop > 10);
    }

    // Gentle parallax on the large "S" in the call-to-action band.
    if (visitDecoration && visitSection && !prefersReducedMotion) {
        const rect = visitSection.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
            const offset = (rect.top - window.innerHeight / 2) * -0.12;
            visitDecoration.style.setProperty("--parallax", `${offset.toFixed(1)}px`);
        }
    }

    scrollTicking = false;
}

window.addEventListener("scroll", function () {
    if (!scrollTicking) {
        window.requestAnimationFrame(updateOnScroll);
        scrollTicking = true;
    }
}, { passive: true });

window.addEventListener("resize", updateOnScroll);
updateOnScroll();


/* =========================================
   EXACT SECTION ALIGNMENT ON NAV CLICK
   Measures the real header height and scrolls so the
   top edge of the target section sits right under it.
========================================= */

function getHeaderHeight() {
    return siteHeader ? siteHeader.offsetHeight : 0;
}

function syncHeaderHeight() {
    document.documentElement.style.setProperty("--header-h", getHeaderHeight() + "px");
}

function scrollToSection(id) {
    const target = document.getElementById(id);
    if (!target) return;

    const top = id === "home"
        ? 0
        : target.getBoundingClientRect().top + window.scrollY - getHeaderHeight();

    window.scrollTo({
        top: Math.max(top, 0),
        behavior: prefersReducedMotion ? "auto" : "smooth"
    });

    if (window.history && window.history.pushState) {
        window.history.pushState(null, "", "#" + id);
    }
}

document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
        const id = link.getAttribute("href").slice(1);
        if (!id || !document.getElementById(id)) return;

        event.preventDefault();
        scrollToSection(id);
    });
});

syncHeaderHeight();
window.addEventListener("resize", syncHeaderHeight);
window.addEventListener("load", syncHeaderHeight);



/* =========================================
   REPLAY SCROLL ANIMATIONS ON EVERY VISIT
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const animatedElements = document.querySelectorAll("[data-reveal]");

    // Fallback for browsers without IntersectionObserver
    if (!("IntersectionObserver" in window)) {
        animatedElements.forEach((element) => {
            element.classList.add("is-visible");
        });
        return;
    }

    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const element = entry.target;

                if (entry.isIntersecting) {
                    // Restart the entrance animation
                    element.classList.remove("is-visible");

                    // Force the browser to register the reset
                    void element.offsetWidth;

                    element.classList.add("is-visible");

                    // Replay the hero image drop animation
                    if (element.classList.contains("hero-visual")) {
                        const heroFrame =
                            element.querySelector(".hero-image-frame");

                        if (heroFrame) {
                            heroFrame.classList.remove("replay-animation");
                            void heroFrame.offsetWidth;
                            heroFrame.classList.add("replay-animation");
                        }
                    }
                } else {
                    // Reset after leaving the viewport so it can replay
                    // when the user scrolls back to this element.
                    element.classList.remove("is-visible");
                }
            });
        },
        {
            threshold: 0.15,
            rootMargin: "0px 0px -40px 0px"
        }
    );

    animatedElements.forEach((element) => {
        revealObserver.observe(element);
    });
});
