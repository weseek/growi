const mediaQueryListForDarkMode = window.matchMedia('(prefers-color-scheme: dark)');

function isUserPreferenceExists() {
  return localStorage.preferDarkModeByUser != null;
}

function isPreferedDarkModeByUser() {
  return localStorage.preferDarkModeByUser === 'true';
}

function isDarkMode() {
  if (isUserPreferenceExists()) {
    return isPreferedDarkModeByUser();
  }
  return mediaQueryListForDarkMode.matches;
}

/**
 * Apply color scheme as 'dark' attribute of <html></html>
 */
function applyColorScheme() {
  let isDarkMode = mediaQueryListForDarkMode.matches;
  if (isUserPreferenceExists()) {
    isDarkMode = isPreferedDarkModeByUser();
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
 * Remove color scheme preference
 */
function removeUserPreference() {
  if (isUserPreferenceExists()) {
    delete localStorage.removeItem('preferDarkModeByUser');
  }
}

/**
 * Set color scheme preference
 * @param {boolean} isDarkMode
 */
function updateUserPreference(isDarkMode) {
  // store settings to localStorage
  localStorage.preferDarkModeByUser = isDarkMode;
}

/**
 * Set color scheme preference with OS settings
 */
function updateUserPreferenceWithOsSettings() {
  localStorage.preferDarkModeByUser = mediaQueryListForDarkMode.matches;
}

// add event listener
mediaQueryListForDarkMode.addEventListener('change', () => applyColorScheme());

export {
  mediaQueryListForDarkMode,
  isUserPreferenceExists,
  isPreferedDarkModeByUser,
  isDarkMode,
  applyColorScheme,
  removeUserPreference,
  updateUserPreference,
  updateUserPreferenceWithOsSettings,
};
