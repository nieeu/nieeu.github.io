async function loadComponent(elementId, filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Could not load ${filePath}`);
    const html = await response.text();
    document.getElementById(elementId).innerHTML = html;
  } catch (error) {
    console.error("Error loading component:", error);
  }
}

function initPagePlugins() {
  if (window.$) {
    if ($('.text-slider').length == 1) {
      $('.text-slider').empty(); 
      var typed_strings = $('.text-slider-items').text();
      new Typed('.text-slider', {
        strings: typed_strings.split(','),
        typeSpeed: 80,
        loop: true,
        backDelay: 1100,
        backSpeed: 30
      });
    }
    if ($('.counter').length) {
      $('.counter').counterUp({ delay: 15, time: 2000 });
    }
  }
}

function runTerminalAnimation() {
  const line1 = document.getElementById('term-line-1');
  const commandSpan = document.getElementById('term-command');
  const cursorSpan = document.getElementById('term-cursor');
  const outputs = document.querySelectorAll('.terminal-output');

  if (!line1 || !commandSpan) return;

  // 1. Reset everything in case the user navigates back to the home page
  line1.style.display = 'none';
  commandSpan.textContent = '';
  if (cursorSpan) cursorSpan.style.display = 'inline-block';
  outputs.forEach(out => out.style.display = 'none');

  const commandText = "python optimize_portfolio.py --engine=ai";
  let charIndex = 0;

  // 2. Start the animation sequence
  setTimeout(() => {
    // Show the prompt instantly
    line1.style.display = 'block';
    
    // 3. Type the command very quickly (30ms per character)
    const typingInterval = setInterval(() => {
      if (charIndex < commandText.length) {
        commandSpan.textContent += commandText.charAt(charIndex);
        charIndex++;
      } else {
        // Typing finished
        clearInterval(typingInterval);
        
        // Hide the cursor to make it look like the program is running
        if (cursorSpan) cursorSpan.style.display = 'none';
        
        // 4. Reveal the output lines sequentially
        const outputDelays = [400, 1100, 1800, 2600];
        outputs.forEach((out, index) => {
          setTimeout(() => {
            out.style.display = 'block';
            
            // Bring the blinking cursor back at the very end
            if (index === outputs.length - 1) {
              setTimeout(() => {
                const finalPrompt = document.createElement('p');
                finalPrompt.className = 'mb-1 mt-1';
                finalPrompt.innerHTML = '<span class="text-success">riley@quant-research</span><span class="text-white">:</span><span class="text-primary">~/models</span>$ <span style="animation: blink 1s step-end infinite;">_</span>';
                out.parentNode.appendChild(finalPrompt);
              }, 500);
            }
          }, outputDelays[index]);
        });
      }
    }, 30); 
  }, 400); // Initial delay before the animation starts
}

// Dynamic Navbar Scroll Logic
function handleNavbarStyle() {
  const navbar = document.getElementById('mainNav');
  if (!navbar) return;

  let hash = window.location.hash.substring(1) || 'home';

  if (hash === 'home') {
    // On the Home page: transparent at the top, solid when scrolled past 50px
    if (window.scrollY > 50) {
      navbar.classList.add('navbar-reduce');
      navbar.classList.remove('navbar-trans');
    } else {
      navbar.classList.add('navbar-trans');
      navbar.classList.remove('navbar-reduce');
    }
  } else {
    // On Blog/Projects/Gallery pages: always keep the solid background
    navbar.classList.add('navbar-reduce');
    navbar.classList.remove('navbar-trans');
  }
}

async function router() {
  const navPlaceholder = document.getElementById('navbar-placeholder');
  const footerPlaceholder = document.getElementById('footer-placeholder');
  
  if (navPlaceholder && navPlaceholder.innerHTML === '') {
    await loadComponent('navbar-placeholder', 'components/navbar.html');
  }
  if (footerPlaceholder && footerPlaceholder.innerHTML === '') {
    await loadComponent('footer-placeholder', 'components/footer.html');
  }

  let hash = window.location.hash.substring(1); 
  if (!hash) hash = 'home'; 

  // Snap window to top on route change
  window.scrollTo(0, 0);

  // Load the page HTML
  await loadComponent('content-placeholder', `pages/${hash}.html`);

  // Trigger the terminal animation if we are on the home page
  if (hash === 'home') {
    runTerminalAnimation();
  }

  // Handle LaTeX File Fetching
  const latexContainer = document.getElementById('latex-content');
  if (latexContainer) {
    const texFileName = hash.replace('post-', '') + '.tex';
    try {
      const texResponse = await fetch(`latex-posts/${texFileName}`);
      if (!texResponse.ok) throw new Error("LaTeX file not found");
      latexContainer.innerHTML = await texResponse.text();
    } catch (err) {
      latexContainer.innerHTML = "<p>Could not load the research content. Ensure the .tex file exists.</p>";
    }
  }

  // Render LaTeX math
  if (window.MathJax) {
    MathJax.typesetPromise([document.getElementById('content-placeholder')]);
  }
// Render syntax highlighting for code blocks & embed copy button inside
  if (window.Prism) {
    Prism.highlightAll();
    
    document.querySelectorAll('pre > code').forEach((codeBlock) => {
      const pre = codeBlock.parentNode;
      
      // Ensure we only add one button per code block
      if (!pre.querySelector('.copy-code-btn')) {
        pre.style.position = 'relative';
        
        const button = document.createElement('button');
        button.className = 'copy-code-btn';
        button.title = 'Copy code';
        
        // Default copy icon (overlapping rectangles)
        button.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
        
        button.addEventListener('click', () => {
          navigator.clipboard.writeText(codeBlock.innerText).then(() => {
            // Success checkmark icon
            button.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            
            setTimeout(() => {
              // Revert back to copy icon after 2 seconds
              button.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
            }, 2000);
          });
        });

        pre.appendChild(button);
      }
    });
  }
  // Initialize the typing animation and counters
  initPagePlugins(); 
  
  // Apply correct navbar styling immediately upon route change
  handleNavbarStyle(); 
}

// Event Listeners
window.addEventListener('load', router);
window.addEventListener('hashchange', router);
window.addEventListener('scroll', handleNavbarStyle);