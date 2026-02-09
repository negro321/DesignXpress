// Global variables for libraries (safe access)
let lenis;
let gsapLib = (typeof gsap !== 'undefined') ? gsap : null;
let ScrollTriggerLib = (typeof ScrollTrigger !== 'undefined') ? ScrollTrigger : null;

// Initialize Lenis for smooth scrolling (Safe Init)
function initLenis() {
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
    } else {
        console.warn('Lenis library not loaded. Smooth scrolling disabled.');
    }
}

// Integrate GSAP ScrollTrigger with Lenis
function initScrollTrigger() {
    if (gsapLib && ScrollTriggerLib) {
        gsapLib.registerPlugin(ScrollTriggerLib);
    }
}

// Mobile Menu Logic - ROBUST IMPLEMENTATION
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navOverlay = document.querySelector('.mobile-nav-overlay');
    const navLinks = document.querySelectorAll('.mobile-nav-links a');

    if (menuBtn && navOverlay) {
        // Toggle Menu
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent bubbling issues
            menuBtn.classList.toggle('active');
            navOverlay.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navOverlay.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Get target
                const targetId = link.getAttribute('href');

                // Handle Anchor Links
                if (targetId && targetId.startsWith('#') && targetId.length > 1) {
                    e.preventDefault();
                    
                    // Close menu immediately
                    menuBtn.classList.remove('active');
                    navOverlay.classList.remove('active');
                    document.body.style.overflow = '';

                    // Small delay to allow layout to restabilize (keyboard close, address bar, etc.)
                    setTimeout(() => {
                        const target = document.querySelector(targetId);
                        if (target) {
                            // On mobile/touch, native scrollIntoView is often more reliable than library scroll
                            // when complex layout shifts happen (like closing a full-screen menu).
                            // We check for touch capability or small screen width.
                            const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;

                            if (lenis && !isMobile) {
                                // Use Lenis on desktop
                                lenis.scrollTo(targetId);
                            } else {
                                // Use Native Smooth Scroll on mobile
                                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        } else {
                            console.warn("Target not found:", targetId);
                            window.location.hash = targetId;
                        }
                    }, 100);
                } else {
                    // For non-anchor links (like Login), just close the menu
                    menuBtn.classList.remove('active');
                    navOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });

        // Close menu if clicking outside (optional UX improvement)
        navOverlay.addEventListener('click', (e) => {
            if (e.target === navOverlay) {
                menuBtn.classList.remove('active');
                navOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    } else {
        console.error("Mobile menu elements not found in DOM.");
    }
}

function fallbackScroll(targetId) {
    const target = document.querySelector(targetId);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    } else {
        window.location.hash = targetId;
    }
}

// Hero Section Animations
function initHeroAnimations() {
    if (!gsapLib) return;

    const tl = gsapLib.timeline({ defaults: { ease: "power3.out" } });

    // Initial set states to avoid FOUC (Flash of Unstyled Content) handled by 'from'
    tl.from(".hero-content h1 span", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        skewY: 7,
        clearProps: "all"
    })
    .from(".hero-sub", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        clearProps: "all"
    }, "-=0.5")
    .from(".hero-cta-group", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        clearProps: "all"
    }, "-=0.6")
    .from(".hero-visual", {
        scale: 0.8,
        opacity: 0,
        duration: 1.2,
        ease: "back.out(1.7)",
        clearProps: "all"
    }, "-=1");

    // Continuous Ring Rotation
    gsapLib.to(".ring-1", { rotation: 360, duration: 20, repeat: -1, ease: "linear" });
    gsapLib.to(".ring-2", { rotation: -360, duration: 25, repeat: -1, ease: "linear" });
    gsapLib.to(".ring-3", { rotation: 360, duration: 30, repeat: -1, ease: "linear" });

    // Floating Orbit Items
    if (gsapLib.utils) {
        gsapLib.utils.toArray(".orbit-item").forEach((item, i) => {
            gsapLib.to(item, {
                y: "random(-10, 10)",
                x: "random(-10, 10)",
                rotation: "random(-10, 10)",
                duration: "random(2, 4)",
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        });
    }
}

// Scroll Animations for Sections
function initScrollAnimations() {
    if (!gsapLib || !ScrollTriggerLib) return;

    // Reveal Sections Title & Content
    gsapLib.utils.toArray(".section-container").forEach(section => {
        const title = section.querySelector(".section-title") || section.querySelector("h2");
        const content = section.querySelectorAll("p, .lead-text, .shield-box");
        
        if (title) {
            gsapLib.from(title, {
                scrollTrigger: {
                    trigger: section,
                    start: "top 85%", // Trigger earlier on scroll (better for mobile)
                    toggleActions: "play none none reverse"
                },
                y: 50,
                opacity: 0,
                duration: 1,
                clearProps: "all" // Ensure visibility after animation prevents 'stuck' hidden states
            });
        }

        if (content.length > 0) {
            gsapLib.from(content, {
                scrollTrigger: {
                    trigger: section,
                    start: "top 75%",
                    toggleActions: "play none none reverse"
                },
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                clearProps: "all" // Added Safety
            });
        }
    });

    // Staggered Grids (Only Partners strip animated now, Services/Packages are static)
    const grids = [".partners-strip"];
    
    grids.forEach(gridSelector => {
        const grid = document.querySelector(gridSelector);
        if (!grid) return;
        
        const children = grid.children;
        gsapLib.from(children, {
            scrollTrigger: {
                trigger: grid,
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            clearProps: "all" // Added Safety to prevent stuck elements
        });
    });
}

// Magnetic Button Effect
function initMagneticButtons() {
    if (!gsapLib) return;
    // Only enable on devices that support hover (mouse)
    if (window.matchMedia("(hover: hover)").matches) {
        const buttons = document.querySelectorAll(".btn-primary, .btn-hero, .btn-pkg");
        
        buttons.forEach(btn => {
            btn.addEventListener("mousemove", (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                gsapLib.to(btn, {
                    x: x * 0.3,
                    y: y * 0.3,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            btn.addEventListener("mouseleave", () => {
                gsapLib.to(btn, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        });
    }
}

// 3D Tilt Effect for Cards
function init3DTilt() {
    if (!gsapLib) return;
    // Only enable on devices that support hover (mouse)
    if (window.matchMedia("(hover: hover)").matches) {
        // Exclude .full-width cards (like Manifiesto) from tilt effect
        const cards = document.querySelectorAll(".service-card, .pkg-card, .glass-card:not(.full-width)");

        cards.forEach(card => {
            card.addEventListener("mousemove", (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -10; // Max rotation deg
                const rotateY = ((x - centerX) / centerX) * 10;

                gsapLib.to(card, {
                    rotationX: rotateX,
                    rotationY: rotateY,
                    transformPerspective: 1000,
                    scale: 1.02,
                    duration: 0.4,
                    ease: "power2.out"
                });
            });

            card.addEventListener("mouseleave", () => {
                gsapLib.to(card, {
                    rotationX: 0,
                    rotationY: 0,
                    scale: 1,
                    duration: 0.7,
                    ease: "elastic.out(1, 0.5)"
                });
            });
        });
    }
}

// Parallax Effect
function initParallax() {
    if (!gsapLib || !ScrollTriggerLib) return;
    gsapLib.to(".ambient-bg", {
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1
        },
        y: 200,
        ease: "none"
    });
}

// Statistics Counter Animation
function initStatsCounter() {
    if (!gsapLib || !ScrollTriggerLib) return;

    const statsSection = document.querySelector(".stats-section");
    if (!statsSection) return;

    const counters = document.querySelectorAll(".stat-counter");

    // Create a ScrollTrigger for the entire section
    ScrollTriggerLib.create({
        trigger: statsSection,
        start: "top 80%", // Start animation when section is visible
        once: true, // Run only once
        onEnter: () => {
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute("data-target"));
                
                // Animate object property
                const obj = { value: 0 };
                
                gsapLib.to(obj, {
                    value: target,
                    duration: 2,
                    ease: "power2.out",
                    onUpdate: () => {
                        // Update DOM content formatted
                        counter.innerText = Math.floor(obj.value);
                    }
                });
            });
        }
    });
}

// Preloader Logic
function initPreloader() {
    const preloader = document.getElementById('preloader');
    const video = document.getElementById('preloader-video');

    if (preloader && video) {
        // Prevent scrolling
        document.body.style.overflow = 'hidden';

        // When video ends, fade out
        video.onended = () => {
            if (gsapLib) {
                gsapLib.to(preloader, {
                    opacity: 0,
                    duration: 0.8,
                    ease: "power2.inOut",
                    onComplete: () => {
                        preloader.style.display = 'none';
                        document.body.style.overflow = ''; // Restore scrolling
                        
                        // Force refresh ScrollTrigger after preloader is gone to correct offsets
                        if (ScrollTriggerLib) ScrollTriggerLib.refresh();
                    }
                });
            } else {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                    document.body.style.overflow = '';
                }, 800);
            }
        };
    }
}

// Initialize all animations when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    initLenis();
    initScrollTrigger();
    initPreloader();
    initMobileMenu();
    initHeroAnimations();
    initScrollAnimations();
    initMagneticButtons();
    init3DTilt();
    initParallax();
    initStatsCounter();
});

// Window Load Event (Safety Net)
window.addEventListener("load", () => {
    // Refresh ScrollTrigger calculations after all resources (images, fonts) are loaded
    if (ScrollTriggerLib) {
        ScrollTriggerLib.refresh();
    }
});
