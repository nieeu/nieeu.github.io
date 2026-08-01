'use strict';

let animationTimeoutIds = [];

/**
 * Store an animation timeout so it can be cancelled if the user
 * navigates away before the animation has finished.
 *
 * @param {Function} callback
 * @param {number} delay
 */
function scheduleAnimation(callback, delay) {
    const timeoutId = window.setTimeout(callback, delay);
    animationTimeoutIds.push(timeoutId);
}

/**
 * Cancel any terminal animation that is currently running.
 */
export function stopTerminalAnimation() {
    animationTimeoutIds.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
    });

    animationTimeoutIds = [];
}

/**
 * Run the home-page terminal animation.
 */
export function runTerminalAnimation() {
    stopTerminalAnimation();

    const line1 = document.getElementById('term-line-1');
    const commandSpan = document.getElementById('term-command');
    const cursorSpan = document.getElementById('term-cursor');
    const terminal = document.querySelector('.terminal-window');
    const outputs = document.querySelectorAll('.terminal-output');

    if (!line1 || !commandSpan) {
        return;
    }

    document
        .querySelectorAll('.terminal-final-prompt')
        .forEach((prompt) => {
            prompt.remove();
        });

    line1.style.display = 'none';
    commandSpan.textContent = '';

    if (cursorSpan) {
        cursorSpan.style.display = 'inline-block';
    }

    outputs.forEach((output) => {
        output.style.display = 'none';
    });

    const commandText = 'python optimize_portfolio.py --engine=ai';
    let charIndex = 0;

    scheduleAnimation(() => {
        line1.style.display = 'block';

        const typeNextCharacter = () => {
            if (charIndex < commandText.length) {
                commandSpan.textContent += commandText[charIndex];
                charIndex += 1;

                scheduleAnimation(typeNextCharacter, 45);
                return;
            }

            if (cursorSpan) {
                cursorSpan.style.display = 'none';
            }

            showTerminalOutputs(outputs, terminal);
        };

        typeNextCharacter();
    }, 400);
}

/**
 * Display terminal output lines sequentially.
 *
 * @param {NodeListOf<Element>} outputs
 * @param {Element | null} terminal
 */
function showTerminalOutputs(outputs, terminal) {
    outputs.forEach((output, index) => {
        scheduleAnimation(() => {
            output.style.display = 'block';

            if (index === outputs.length - 1) {
                addFinalPrompt(terminal);
            }
        }, 400 * (index + 1));
    });
}

/**
 * Add a final prompt once the terminal output has finished.
 *
 * @param {Element | null} terminal
 */
function addFinalPrompt(terminal) {
    if (!terminal) {
        return;
    }

    const prompt = document.createElement('div');
    prompt.className = 'terminal-final-prompt';
    prompt.textContent = '$';

    terminal.appendChild(prompt);
}