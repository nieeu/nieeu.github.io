'use strict';

/**
 * Change the navbar style based on the current route
 * and the user's scroll position.
 */
export function handleNavbarStyle() {
    const navbar = document.getElementById('mainNav');

    if (!navbar) {
        return;
    }

    const hash = window.location.hash.substring(1) || 'home';
    const isHomePage = hash === 'home';

    if (isHomePage && window.scrollY <= 50) {
        navbar.classList.add('navbar-trans');
        navbar.classList.remove('navbar-reduce');
    } else {
        navbar.classList.add('navbar-reduce');
        navbar.classList.remove('navbar-trans');
    }
}