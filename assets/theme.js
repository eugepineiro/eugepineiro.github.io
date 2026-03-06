(function () {
  var STORAGE_KEY = 'theme-preference';
  var media = window.matchMedia('(prefers-color-scheme: dark)');

  function getStoredTheme() {
    try {
      var value = localStorage.getItem(STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch (error) {
      return null;
    }
  }

  function getSystemTheme() {
    return media.matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  function updateToggle(theme) {
    var button = document.getElementById('theme-toggle');
    if (!button) {
      return;
    }

    var icon = button.querySelector('.theme-icon');
    var text = button.querySelector('.theme-text');
    var dark = theme === 'dark';

    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');

    if (icon) {
      icon.textContent = dark ? '☀️' : '🌙';
    }
    if (text) {
      text.textContent = dark ? 'Light' : 'Dark';
    }
  }

  function setTheme(theme, persist) {
    applyTheme(theme);
    updateToggle(theme);

    if (!persist) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      // Ignore storage errors to keep the UI functional.
    }
  }

  var initialTheme = getStoredTheme() || getSystemTheme();
  applyTheme(initialTheme);

  media.addEventListener('change', function (event) {
    if (getStoredTheme()) {
      return;
    }

    var nextTheme = event.matches ? 'dark' : 'light';
    setTheme(nextTheme, false);
  });

  document.addEventListener('DOMContentLoaded', function () {
    var button = document.getElementById('theme-toggle');
    var activeTheme = getStoredTheme() || getSystemTheme();
    updateToggle(activeTheme);

    if (!button) {
      return;
    }

    button.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') || getSystemTheme();
      var next = current === 'dark' ? 'light' : 'dark';
      setTheme(next, true);
    });
  });
})();
