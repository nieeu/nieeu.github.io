'use strict';

import { runTerminalAnimation } from './terminal-animation.js';
import { loadResearchPost } from './research-post.js';

/**
 * Registry mapping page names to their specific post-load handlers.
 */
export const routeActions = {
    home: () => {
        runTerminalAnimation();
    },
    post: async (postSlug) => {
        if (postSlug) {
            await loadResearchPost(postSlug);
        }
    }
};