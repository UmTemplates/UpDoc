// Bootstraps example theme toggler
(() => {
    'use strict';

    const themes = ['light', 'dark', 'auto']; // Define the theme states
    const getStoredTheme = () => localStorage.getItem('theme'); // Retrieve the saved theme
    const setStoredTheme = theme => localStorage.setItem('theme', theme); // Save the theme

    // Multiple toggle buttons can exist on the page (e.g. one in the
    // navbar for desktop and one inside the offcanvas for mobile). All
    // share the .theme-toggle-btn class so they can be wired up together.
    const getButtons = () => document.querySelectorAll('.theme-toggle-btn');

    const setTheme = theme => {
        if (theme === 'auto') {
            document.documentElement.setAttribute(
                'data-bs-theme',
                window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
            );
        } else {
            document.documentElement.setAttribute('data-bs-theme', theme);
        }
    };

    const toggleTheme = () => {
        const currentTheme = getStoredTheme() || 'auto';
        const nextTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length]; // Cycle to the next theme
        setStoredTheme(nextTheme); // Save the new theme
        setTheme(nextTheme); // Apply the new theme
        updateButtons(nextTheme); // Update every toggle button on the page
    };

    const updateButtons = theme => {
        const buttons = getButtons();
        const config = {
            light: { icon: 'bi bi-sun', label: ' Light' },
            dark: { icon: 'bi bi-moon', label: ' Dark' },
            auto: { icon: 'bi bi-circle-half', label: ' Auto' }
        }[theme];
        if (!config) return;

        buttons.forEach(button => {
            const icon = button.querySelector('.themeIcon');
            if (!icon) return;
            icon.className = `themeIcon ${config.icon}`;
            button.textContent = config.label;
            button.prepend(icon);
        });
    };

    // Initialize the theme on page load
    document.addEventListener('DOMContentLoaded', () => {
        const preferredTheme = getStoredTheme() || 'auto';
        setTheme(preferredTheme); // Apply the preferred theme
        updateButtons(preferredTheme); // Reflect the current theme on every toggle

        // Wire up every toggle button on the page
        getButtons().forEach(button => button.addEventListener('click', toggleTheme));
    });
})();
