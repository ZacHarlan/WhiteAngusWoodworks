document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // HEADER & MOBILE NAV
    // =========================================
    const header = document.querySelector('.site-header');
    const navToggle = document.querySelector('.nav-toggle');
    const primaryNav = document.querySelector('#primary-nav');

    // Create overlay element and insert it into the header (same stacking context as nav)
    const navOverlay = document.createElement('div');
    navOverlay.classList.add('nav-overlay');
    // Insert overlay as first child of body so it's behind everything but visible
    document.body.insertBefore(navOverlay, document.body.firstChild);

    // Sticky Header Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Nav Toggle
    navToggle.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        toggleNav(!isExpanded);
    });

    // Close nav when clicking overlay
    navOverlay.addEventListener('click', () => {
        toggleNav(false);
    });

    // Close nav when clicking a link - but allow time for scroll
    primaryNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            // Close menu first
            toggleNav(false);
            // Allow the default anchor navigation to proceed
            // The browser will handle the scroll after overflow is restored
        });
    });

    function toggleNav(show) {
        navToggle.setAttribute('aria-expanded', show);
        primaryNav.setAttribute('data-visible', show);

        if (show) {
            navOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }


    // =========================================
    // SCROLL ANIMATIONS (IntersectionObserver)
    // =========================================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-section, .reveal-item').forEach(el => {
        revealObserver.observe(el);
    });

    // =========================================
    // GALLERY FILTERING
    // =========================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const loadMoreBtn = document.getElementById('load-more');

    // Load saved filter from localStorage
    const savedFilter = localStorage.getItem('galleryFilter') || 'all';

    // Apply initial filter
    applyFilter(savedFilter);
    updateActiveButton(savedFilter);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterValue = btn.getAttribute('data-filter');
            applyFilter(filterValue);
            updateActiveButton(filterValue);
            localStorage.setItem('galleryFilter', filterValue);
        });
    });

    function applyFilter(filter) {
        let visibleCount = 0;
        galleryItems.forEach(item => {
            const category = item.getAttribute('data-category');
            if (filter === 'all' || category === filter) {
                item.classList.remove('hidden');
                // Re-trigger animation if needed, or simple display block
                item.style.display = 'block';

                // Add staggered animation delay for visible items
                // Simple version: just default CSS transition handles opacity if we toggle classes
                // here we just ensure they are visible
                visibleCount++;
            } else {
                item.classList.add('hidden');
                item.style.display = 'none';
            }
        });

        // Hiding load more if few items (Simulation)
        if (loadMoreBtn) {
            loadMoreBtn.style.display = visibleCount > 8 ? 'inline-block' : 'none';
        }
    }

    function updateActiveButton(filter) {
        filterBtns.forEach(btn => {
            if (btn.getAttribute('data-filter') === filter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Load More functionality (Mock)
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            // In a real app, this would fetch specific content.
            // Here we might just reveal hidden pre-loaded items or mock it.
            alert('In a real implementation, this would load the next page of items from the server or JSON file.');
        });
    }

    // =========================================
    // LIGHTBOX
    // =========================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    let currentImageIndex = 0;
    // Get currently visible items for lightbox navigation
    const getVisibleItems = () => Array.from(document.querySelectorAll('.gallery-item:not(.hidden) img'));

    galleryItems.forEach(item => {
        const img = item.querySelector('img');
        img.addEventListener('click', () => {
            const visibleImages = getVisibleItems();
            currentImageIndex = visibleImages.indexOf(img);
            openLightbox(img.src);
        });

        // Keyboard accessibility for grid items
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                img.click();
            }
        });
    });

    function openLightbox(src) {
        lightboxImg.src = src;
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        lightboxClose.focus();
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function showNextImage() {
        const visibleImages = getVisibleItems();
        currentImageIndex = (currentImageIndex + 1) % visibleImages.length;
        lightboxImg.src = visibleImages[currentImageIndex].src;
    }

    function showPrevImage() {
        const visibleImages = getVisibleItems();
        currentImageIndex = (currentImageIndex - 1 + visibleImages.length) % visibleImages.length;
        lightboxImg.src = visibleImages[currentImageIndex].src;
    }

    lightboxClose.addEventListener('click', closeLightbox);

    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showNextImage();
    });

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrevImage();
    });

    // Keyboard Navigation for Lightbox
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNextImage();
        if (e.key === 'ArrowLeft') showPrevImage();
    });

    // =========================================
    // FORM VALIDATION
    // =========================================
    const quoteForm = document.getElementById('quote-form');
    const formStatus = document.getElementById('form-status');

    if (quoteForm) {
        quoteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;

            // Simple validation check
            const inputs = quoteForm.querySelectorAll('input[required], textarea[required]');

            inputs.forEach(input => {
                const formGroup = input.parentElement;
                if (!input.checkValidity()) {
                    formGroup.classList.add('error');
                    isValid = false;
                } else {
                    formGroup.classList.remove('error');
                }

                // Remove error on input
                input.addEventListener('input', () => {
                    formGroup.classList.remove('error');
                });
            });

            if (isValid) {
                const btn = quoteForm.querySelector('button[type="submit"]');
                const originalText = btn.innerText;
                const formData = new FormData(quoteForm);

                // --- CONFIGURATION ---
                // Replace the URL below with your Google Apps Script Web App URL
                const scriptURL = 'https://script.google.com/macros/s/AKfycbwJQVS3qWAHVuaV0ZCruPlsuttMrX5PEzrFr6IcpEZMRzoFlVAasgLd0MfgAzNSkoAAjw/exec';
                // ---------------------

                btn.innerText = 'Sending...';
                btn.disabled = true;

                if (scriptURL === 'https://script.google.com/macros/s/AKfycbwJQVS3qWAHVuaV0ZCruPlsuttMrX5PEzrFr6IcpEZMRzoFlVAasgLd0MfgAzNSkoAAjw/exec') {
                    // Fallback for if they haven't set the URL yet
                    setTimeout(() => {
                        formStatus.textContent = 'Configuration needed: Please set your Google Apps Script URL in script.js.';
                        formStatus.style.color = 'orange';
                        btn.innerText = originalText;
                        btn.disabled = false;
                    }, 500);
                    return;
                }

                fetch(scriptURL, {
                    method: 'POST',
                    body: formData,
                    mode: 'no-cors' // Google Apps Script requires no-cors for simple redirects
                })
                    .then(response => {
                        formStatus.textContent = 'Message sent successfully! We will be in touch soon.';
                        formStatus.style.color = 'green';
                        quoteForm.reset();
                        btn.innerText = originalText;
                        btn.disabled = false;
                    })
                    .catch(error => {
                        console.error('Error!', error.message);
                        formStatus.textContent = 'Oops! There was an error sending your message. Please try again or email directly.';
                        formStatus.style.color = 'red';
                        btn.innerText = originalText;
                        btn.disabled = false;
                    });
            }
        });
    }

    // Dynamic Year
    document.getElementById('year').textContent = new Date().getFullYear();

});
