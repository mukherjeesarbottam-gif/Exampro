// Theme System — Dark/Light Mode Toggle
(function () {
  'use strict';

  // Theme storage key
  const THEME_KEY = 'exampro-theme';

  // Get the current theme preference
  function getSavedTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }

  // Get system preference
  function getSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Determine initial theme
  function getInitialTheme() {
    const saved = getSavedTheme();
    if (saved === 'dark' || saved === 'light') return saved;
    return getSystemTheme();
  }

  // Apply theme to the document
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    // Update toggle button icon if present
    const toggleBtn = document.querySelector('.theme-toggle');
    if (toggleBtn) {
      const icon = toggleBtn.querySelector('.theme-toggle-icon');
      if (icon) {
        icon.className = 'theme-toggle-icon fa-solid ' + (theme === 'dark' ? 'fa-sun' : 'fa-moon');
      }
      toggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
    // Update Chart.js if present
    updateCharts(theme);
  }

  // Update chart colors based on theme
  function updateCharts(theme) {
    if (typeof Chart === 'undefined') return;
    const isDark = theme === 'dark';
    const textColor = isDark ? '#94A3B8' : '#4B5563';
    const gridColor = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(229, 231, 235, 1)';
    Chart.defaults.color = textColor;
    Chart.defaults.borderColor = gridColor;

    document.querySelectorAll('canvas').forEach(canvas => {
      const chart = Chart.getChart(canvas);
      if (chart) {
        chart.options.plugins.legend.labels.color = textColor;
        chart.options.scales.x.ticks.color = textColor;
        chart.options.scales.y.ticks.color = textColor;
        chart.options.scales.x.grid.color = gridColor;
        chart.options.scales.y.grid.color = gridColor;
        chart.update();
      }
    });
  }

  // Toggle between light and dark
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (e) { /* ignore */ }
    applyTheme(next);
  }

  // Initialize on DOM ready
  function init() {
    const initialTheme = getInitialTheme();
    applyTheme(initialTheme);

    // Add click handler to toggle buttons
    document.addEventListener('click', function (e) {
      const toggleBtn = e.target.closest('.theme-toggle');
      if (toggleBtn) {
        toggleTheme();
      }
    });

    // Listen for system theme changes if no saved preference
    if (!getSavedTheme() && window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        applyTheme(e.matches ? 'dark' : 'light');
      });
    }
  }

  // Init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for console debugging
  window.ExamProTheme = {
    toggle: toggleTheme,
    getTheme: function () { return document.documentElement.getAttribute('data-theme'); },
    setTheme: applyTheme
  };
})();