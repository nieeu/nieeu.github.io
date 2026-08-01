'use strict';

/**
 * Apply MathJax to dynamically loaded page content.
 */
export async function renderMathJax() {
    const content = document.getElementById('content-placeholder');

    if (
        !content ||
        !window.MathJax ||
        typeof window.MathJax.typesetPromise !== 'function'
    ) {
        return;
    }

    try {
        if (typeof window.MathJax.typesetClear === 'function') {
            window.MathJax.typesetClear([content]);
        }

        await window.MathJax.typesetPromise([content]);
    } catch (error) {
        console.warn('MathJax warning:', error);
    }
}