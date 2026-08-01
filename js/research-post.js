'use strict';

/**
 * Validate a research-post slug before using it in a file path.
 *
 * @param {string} postSlug
 * @returns {string}
 */
function validatePostSlug(postSlug) {
    const normalizedSlug = postSlug.trim();

    if (!/^[a-zA-Z0-9_-]+$/.test(normalizedSlug)) {
        throw new Error(`Invalid research post slug: "${postSlug}".`);
    }

    return normalizedSlug;
}

/**
 * Set text content when the target element exists.
 *
 * @param {HTMLElement | null} element
 * @param {string} value
 */
function setOptionalText(element, value) {
    if (element && value) {
        element.textContent = value;
    }
}

/**
 * Read and render a LaTeX research post.
 *
 * @param {string} postSlug
 */
export async function loadResearchPost(postSlug) {
    const latexContainer = document.getElementById('latex-content');
    const titleContainer = document.getElementById('post-title');
    const categoryContainer = document.getElementById('post-category');
    const dateContainer = document.getElementById('post-date');
    const pdfContainer = document.getElementById('pdf-download-container'); // New

    if (!latexContainer) {
        console.error('Post page is missing #latex-content.');
        return;
    }

    const safeSlug = validatePostSlug(postSlug);
    const postPath = `posts/${safeSlug}.tex`;

    try {
        const response = await fetch(postPath, { cache: 'no-store' });

        if (!response.ok) {
            throw new Error(`Could not load "${postPath}" (status: ${response.status}).`);
        }

        let rawText = await response.text();

        // Helper function to extract metadata comments
        const extractMeta = (key) => {
            const regex = new RegExp(`<!--\\s*${key}:\\s*(.*?)\\s*-->`, 'i');
            const match = rawText.match(regex);
            return match ? match[1] : '';
        };

        const postTitle = extractMeta('TITLE');
        const postCategory = extractMeta('CATEGORY');
        const postDate = extractMeta('DATE');
        const pdfPath = extractMeta('PDF'); // New

        // Remove the metadata comment lines from the text body
        const cleanHtml = rawText.replace(/<!--[\s\S]*?-->/g, '').trim();

        // Populate text fields
        setOptionalText(titleContainer, postTitle);
        setOptionalText(categoryContainer, postCategory);
        setOptionalText(dateContainer, postDate);

        // Render PDF download button if a path is provided
        if (pdfContainer) {
            if (pdfPath) {
                pdfContainer.innerHTML = `
                    <a href="${pdfPath}" target="_blank" class="button button-a button-rouded btn-sm">
                        <i class="fa fa-file-pdf-o mr-2"></i> Download Full PDF Paper
                    </a>
                `;
            } else {
                pdfContainer.innerHTML = ''; // Clear if no PDF exists for this post
            }
        }

        // Render the LaTeX content
        latexContainer.innerHTML = cleanHtml;

    } catch (error) {
        console.error('Could not load research post:', error);

        latexContainer.innerHTML = `
            <div class="alert alert-danger" role="alert">
                The requested research post could not be loaded.
            </div>
        `;
    }
}