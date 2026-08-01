'use strict';

/**
 * Load an HTML component into an existing placeholder.
 *
 * @param {string} elementId - ID of the placeholder element.
 * @param {string} filePath - Path to the HTML component.
 * @returns {Promise<HTMLElement>}
 */
export async function loadComponent(elementId, filePath) {
    const element = document.getElementById(elementId);

    if (!element) {
        throw new Error(
            `Element with id "${elementId}" was not found in index.html.`
        );
    }

    const response = await fetch(filePath, {
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error(
            `Could not load "${filePath}" (status: ${response.status}).`
        );
    }

    const html = await response.text();
    element.innerHTML = html;

    return element;
}

/**
 * Update the copyright year after the footer has loaded.
 */
export function updateFooterYear() {
    const yearElement = document.getElementById('current-year');

    if (!yearElement) {
        console.warn(
            'Footer year was not updated because #current-year was not found.'
        );
        return;
    }

    yearElement.textContent = String(new Date().getFullYear());
}

/**
 * Store the shared-component request so that the navbar and footer
 * are not fetched again during every route change.
 *
 * @type {Promise<void> | null}
 */
let sharedComponentsPromise = null;

/**
 * Load shared components used on every page.
 *
 * @returns {Promise<void>}
 */
export function loadSharedComponents() {
    if (!sharedComponentsPromise) {
        sharedComponentsPromise = Promise.all([
            loadComponent(
                'navbar-placeholder',
                'components/navbar.html'
            ),
            loadComponent(
                'footer-placeholder',
                'components/footer.html'
            )
        ])
            .then(() => {
                updateFooterYear();
                console.log('Navbar and footer loaded successfully.');
            })
            .catch((error) => {
                // Reset the promise so a later router call can retry.
                sharedComponentsPromise = null;
                throw error;
            });
    }

    return sharedComponentsPromise;
}