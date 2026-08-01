'use strict';

import {
    loadComponent,
    loadSharedComponents,
    updateFooterYear
} from './components.js';

import { handleNavbarStyle } from './navbar.js';
import { initPagePlugins } from './page-plugins.js';
import { renderMathJax } from './math-renderer.js';
import { stopTerminalAnimation } from './terminal-animation.js';
import { routeActions } from './routes.js';

/**
 * Return the current application route.
 *
 * @returns {string}
 */
function getCurrentRoute() {
    return window.location.hash.substring(1).trim() || 'home';
}

/**
 * Convert a route into the page name and optional post slug.
 *
 * @param {string} hash
 * @returns {{ pageName: string, postSlug: string | null }}
 */
function parseRoute(hash) {
    // Treat both 'post/' and 'my-work/' as routing to the 'post' page template
    if (hash.startsWith('post/') || hash.startsWith('my-work/')) {
        const prefix = hash.startsWith('post/') ? 'post/' : 'my-work/';
        const postSlug = hash.substring(prefix.length).trim();

        if (!postSlug) {
            throw new Error('The post route does not contain a post slug.');
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(postSlug)) {
            throw new Error(`Invalid post slug: "${postSlug}".`);
        }

        return {
            pageName: 'post', // Always loads pages/post.html
            postSlug
        };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(hash)) {
        throw new Error(`Invalid page route: "${hash}".`);
    }

    return {
        pageName: hash,
        postSlug: null
    };
}
/**
 * Display a user-friendly routing error.
 *
 * @param {unknown} error
 */
function showRouterError(error) {
    console.error('Critical error inside router():', error);

    const content = document.getElementById('content-placeholder');

    if (!content) {
        return;
    }

    content.innerHTML = `
        <section class="container py-5">
            <h1>Page could not be loaded</h1>
            <p>Please check the browser console for more information.</p>
            <p><a href="#home">Return to the home page</a></p>
        </section>
    `;
}

/**
 * Main hash router.
 */
export async function router() {
    try {
        const hash = getCurrentRoute();
        console.log('Router executing for hash:', hash);

        // Stop previous animations before clearing content
        stopTerminalAnimation();

        // Ensure shared navbar/footer components are loaded
        await loadSharedComponents();
        updateFooterYear();

        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'auto'
        });

        const { pageName, postSlug } = parseRoute(hash);
        const pagePath = `pages/${pageName}.html`;

        console.log('Fetching page template:', pagePath);
        await loadComponent('content-placeholder', pagePath);

        // Execute specific route action if it exists
        if (routeActions[pageName]) {
            await routeActions[pageName](postSlug);
        }

        await renderMathJax();
        initPagePlugins();
        handleNavbarStyle();

        updateFooterYear();
    } catch (error) {
        showRouterError(error);
    }
}