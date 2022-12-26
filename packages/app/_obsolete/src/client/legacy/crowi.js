/* eslint-disable react/jsx-filename-extension */
require('jquery.cookie');

const Crowi = {};

if (!window) {
  window = {};
}
window.Crowi = Crowi;

Crowi.setCaretLine = function(line) {
  // eslint-disable-next-line no-undef
  globalEmitter.emit('setCaretLine', line);
};

// original: middleware.swigFilter
Crowi.userPicture = function(user) {
  if (!user) {
    return '/images/icons/user.svg';
  }

  return user.image || '/images/icons/user.svg';
};

Crowi.initClassesByOS = function() {
  // add classes to cmd-key by OS
  const platform = navigator.platform.toLowerCase();
  const isMac = (platform.indexOf('mac') > -1);

  document.querySelectorAll('.system-version .cmd-key').forEach((element) => {
    if (isMac) {
      element.classList.add('mac');
    }
    else {
      element.classList.add('win');
    }
  });

  document.querySelectorAll('#shortcuts-modal .cmd-key').forEach((element) => {
    if (isMac) {
      element.classList.add('mac');
    }
    else {
      element.classList.add('win', 'key-longer');
    }
  });
};

// adjust min-height of page for print temporarily
window.onbeforeprint = function() {
  $('#page-wrapper').css('min-height', '0px');
};
