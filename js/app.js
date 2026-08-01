'use strict';

import { router } from './router.js';
import { handleNavbarStyle } from './navbar.js';

window.addEventListener('DOMContentLoaded', router);
window.addEventListener('hashchange', router);
window.addEventListener('scroll', handleNavbarStyle);