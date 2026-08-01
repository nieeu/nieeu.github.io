'use strict';

/**
 * Initialise plugins used by dynamically loaded pages.
 */
export function initPagePlugins() {
    initialiseTypedText();
    initialiseCounters();
    initialiseCodeBlocks();
    loadPortfolioItems();
    initLightbox(); // Added here
}

/**
 * Initialise the Typed.js text animation.
 */
function initialiseTypedText() {
    const textSlider = document.querySelector('.text-slider');
    const sliderItems = document.querySelector('.text-slider-items');

    if (
        !textSlider ||
        !sliderItems ||
        !window.Typed ||
        textSlider.dataset.typedInitialized === 'true'
    ) {
        return;
    }

    const typedStrings = sliderItems.textContent
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

    if (typedStrings.length === 0) {
        return;
    }

    new window.Typed(textSlider, {
        strings: typedStrings,
        typeSpeed: 80,
        backSpeed: 40,
        backDelay: 1500,
        loop: true
    });

    textSlider.dataset.typedInitialized = 'true';
}

/**
 * Initialise Counter-Up when jQuery and the plugin are available.
 */
function initialiseCounters() {
    if (!window.jQuery) {
        return;
    }

    const $ = window.jQuery;

    if (
        $('.counter').length > 0 &&
        typeof $.fn.counterUp === 'function'
    ) {
        $('.counter').counterUp({
            delay: 15,
            time: 2000
        });
    }
}

/**
 * Highlight code blocks and add a copy button to each block.
 */
function initialiseCodeBlocks() {
    if (window.Prism) {
        window.Prism.highlightAll();
    }

    document.querySelectorAll('pre > code').forEach((codeBlock) => {
        const pre = codeBlock.parentElement;

        if (!pre || pre.querySelector('.code-copy-button')) {
            return;
        }

        pre.classList.add('code-block-wrapper');

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'code-copy-button';
        button.textContent = 'Copy';
        button.setAttribute('aria-label', 'Copy code to clipboard');

        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(
                    codeBlock.textContent || ''
                );

                button.textContent = 'Copied';

                window.setTimeout(() => {
                    button.textContent = 'Copy';
                }, 1500);
            } catch (error) {
                console.error('Could not copy the code block:', error);
                button.textContent = 'Copy failed';
            }
        });

        pre.prepend(button);
    });
}

/**
 * Dynamically fetch and render portfolio items from posts.json
 */
async function loadPortfolioItems() {
    const grid = document.getElementById('portfolio-grid');
    if (!grid) {
        return; // Not on the portfolio/my-work page
    }

    try {
        const response = await fetch('posts.json', { cache: 'no-store' });
        
        if (!response.ok) {
            throw new Error(`Failed to load posts manifest (status: ${response.status})`);
        }

        const posts = await response.json();

        if (posts.length === 0) {
            grid.innerHTML = '<div class="col-md-12 text-center"><p>No work published yet.</p></div>';
            return;
        }

        grid.innerHTML = posts.map(post => `
            <div class="col-md-4 mb-4">
                <div class="work-box">
                    <a href="#my-work/${post.slug}">
                        <div class="work-img">
                            <img src="${post.image}" alt="${post.title}" class="img-fluid">
                        </div>
                        <div class="work-content">
                            <h2 class="w-title">${post.title}</h2>
                            <div class="w-more">
                                <span class="w-ctegory">${post.category}</span>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Could not load portfolio items:', error);
        grid.innerHTML = `
            <div class="col-md-12 text-center">
                <p class="text-danger">Failed to load portfolio items.</p>
            </div>
        `;
    }
}
/**
 * Initialise a full-screen image lightbox with arrows and keyboard support
 */
function initLightbox() {
    const triggers = document.querySelectorAll('.lightbox-trigger');
    if (triggers.length === 0) return;

    // Check if lightbox container already exists in DOM to avoid duplicates
    let lightbox = document.getElementById('image-lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'image-lightbox';
        lightbox.className = 'custom-lightbox';
        lightbox.innerHTML = `
            <button class="lightbox-close" aria-label="Close">&times;</button>
            <button class="lightbox-prev" aria-label="Previous">&#10094;</button>
            <img src="" alt="Enlarged view">
            <button class="lightbox-next" aria-label="Next">&#10095;</button>
        `;
        document.body.appendChild(lightbox);
    }

    const imgElement = lightbox.querySelector('img');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');

    let currentIndex = 0;
    const imagesArray = Array.from(triggers).map(el => el.href);

    function showImage(index) {
        if (index < 0) {
            currentIndex = imagesArray.length - 1;
        } else if (index >= imagesArray.length) {
            currentIndex = 0;
        } else {
            currentIndex = index;
        }
        imgElement.src = imagesArray[currentIndex];
    }

    // Attach click events to triggers
    triggers.forEach((trigger, index) => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            showImage(index);
            lightbox.classList.add('active');
        });
    });

    // Close controls
    closeBtn.addEventListener('click', () => lightbox.classList.remove('active'));
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('active');
        }
    });

    // Arrow controls
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showImage(currentIndex - 1);
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showImage(currentIndex + 1);
    });

    // Keyboard support (Escape to close, Left/Right arrows to navigate)
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') lightbox.classList.remove('active');
        if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
        if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    });
}