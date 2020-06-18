const mediaQueryListForDarkMode = window.matchMedia('(prefers-color-scheme: dark)');

/**
 * Apply color scheme as 'dark' attribute of <html></html>
 */
function applyColorScheme() {
  const { preferDarkModeByUser } = localStorage;

  let isDarkMode = mediaQueryListForDarkMode.matches;
  if (preferDarkModeByUser != null) {
    isDarkMode = preferDarkModeByUser === 'true';
  }

  // switch to dark mode
  if (isDarkMode) {
    document.documentElement.removeAttribute('light');
    document.documentElement.setAttribute('dark', 'true');
  }
  // switch to light mode
  else {
    document.documentElement.setAttribute('light', 'true');
    document.documentElement.removeAttribute('dark');
  }
}

/**
 * Set color scheme preference by user
 * @param {boolean} isDarkMode
 */
function savePreferenceByUser(isDarkMode) {
  // store settings to localStorage
  const { localStorage } = window;
  if (isDarkMode == null) {
    delete localStorage.removeItem('preferDarkModeByUser');
  }
  else {
    localStorage.preferDarkModeByUser = isDarkMode;
  }
}

export {
  mediaQueryListForDarkMode,
  applyColorScheme,
  savePreferenceByUser,
};
