/* eslint-disable react/jsx-filename-extension */
require('jquery.cookie');

require('./thirdparty-js/waves');

const Crowi = {};

if (!window) {
  window = {};
}
window.Crowi = Crowi;

/**
 * set 'data-caret-line' attribute that will be processed when 'shown.bs.tab' event fired
 * @param {number} line
 */
Crowi.setCaretLineData = function(line) {
  const { appContainer } = window;
  const navigationContainer = appContainer.getContainer('NavigationContainer');
  navigationContainer.setEditorMode('edit');
  const pageEditorDom = document.querySelector('#page-editor');
  pageEditorDom.setAttribute('data-caret-line', line);
};

/**
 * invoked when;
 *
 * 1. 'shown.bs.tab' event fired
 */
Crowi.setCaretLineAndFocusToEditor = function() {
  // get 'data-caret-line' attributes
  const pageEditorDom = document.querySelector('#page-editor');

  if (pageEditorDom == null) {
    return;
  }

  const { appContainer } = window;
  const editorContainer = appContainer.getContainer('EditorContainer');
  const line = pageEditorDom.getAttribute('data-caret-line') || 0;
  editorContainer.setCaretLine(+line);
  // reset data-caret-line attribute
  pageEditorDom.removeAttribute('data-caret-line');

  // focus
  editorContainer.focusToEditor();
};

// original: middleware.swigFilter
Crowi.userPicture = function(user) {
  if (!user) {
    return '/images/icons/user.svg';
  }

  return user.image || '/images/icons/user.svg';
};

Crowi.modifyScrollTop = function() {
  const offset = 10;

  const hash = window.location.hash;
  if (hash === '') {
    return;
  }

  const pageHeader = document.querySelector('#page-header');
  if (!pageHeader) {
    return;
  }
  const pageHeaderRect = pageHeader.getBoundingClientRect();

  const sectionHeader = Crowi.findSectionHeader(hash);
  if (sectionHeader === null) {
    return;
  }

  let timeout = 0;
  if (window.scrollY === 0) {
    timeout = 200;
  }
  setTimeout(() => {
    const sectionHeaderRect = sectionHeader.getBoundingClientRect();
    if (sectionHeaderRect.top >= pageHeaderRect.bottom) {
      return;
    }

    window.scrollTo(0, (window.scrollY - pageHeaderRect.height - offset));
  }, timeout);
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

Crowi.findHashFromUrl = function(url) {
  let match;
  /* eslint-disable no-cond-assign */
  if (match = url.match(/#(.+)$/)) {
    return `#${match[1]}`;
  }
  /* eslint-enable no-cond-assign */

  return '';
};

Crowi.findSectionHeader = function(hash) {
  if (hash.length === 0) {
    return;
  }

  // omit '#'
  const id = hash.replace('#', '');
  // don't use jQuery and document.querySelector
  //  because hash may containe Base64 encoded strings
  const elem = document.getElementById(id);
  if (elem != null && elem.tagName.match(/h\d+/i)) { // match h1, h2, h3...
    return elem;
  }

  return null;
};

Crowi.unhighlightSelectedSection = function(hash) {
  const elem = Crowi.findSectionHeader(hash);
  if (elem != null) {
    elem.classList.remove('highlighted');
  }
};

Crowi.highlightSelectedSection = function(hash) {
  const elem = Crowi.findSectionHeader(hash);
  if (elem != null) {
    elem.classList.add('highlighted');
  }
};

$(() => {
  const pageId = $('#content-main').data('page-id');
  // const revisionId = $('#content-main').data('page-revision-id');
  // const revisionCreatedAt = $('#content-main').data('page-revision-created');
  // const currentUser = $('#content-main').data('current-user');
  const isSeen = $('#content-main').data('page-is-seen');

  $('[data-toggle="popover"]').popover();
  $('[data-toggle="tooltip"]').tooltip();
  $('[data-tooltip-stay]').tooltip('show');

  $('#toggle-crowi-sidebar').click((e) => {
    const $body = $('body');
    if ($body.hasClass('aside-hidden')) {
      $body.removeClass('aside-hidden');
      $.cookie('aside-hidden', 0, { expires: 30, path: '/' });
    }
    else {
      $body.addClass('aside-hidden');
      $.cookie('aside-hidden', 1, { expires: 30, path: '/' });
    }
    return false;
  });

  if ($.cookie('aside-hidden') === 1) {
    $('body').addClass('aside-hidden');
  }

  $('.copy-link').on('click', function() {
    $(this).select();
  });

  if (pageId) {

    if (!isSeen) {
      $.post('/_api/pages.seen', { page_id: pageId }, (res) => {
        // ignore unless response has error
        if (res.ok && res.seenUser) {
          $('#content-main').data('page-is-seen', 1);
        }
      });
    }
  } // end if pageId
});

window.addEventListener('load', (e) => {
  const { appContainer } = window;

  // hash on page
  if (window.location.hash) {
    const navigationContainer = appContainer.getContainer('NavigationContainer');

    if (window.location.hash === '#edit') {
      navigationContainer.setEditorMode('edit');

      // focus
      Crowi.setCaretLineAndFocusToEditor();
    }
    else if (window.location.hash === '#hackmd') {
      navigationContainer.setEditorMode('hackmd');
    }
  }
});

window.addEventListener('load', (e) => {
  const crowi = window.crowi;
  if (crowi && crowi.users && crowi.users.length !== 0) {
    const totalUsers = crowi.users.length;
    const $listLiker = $('.page-list-liker');
    $listLiker.each((i, liker) => {
      const count = $(liker).data('count') || 0;
      if (count / totalUsers > 0.05) {
        $(liker).addClass('popular-page-high');
        // 5%
      }
      else if (count / totalUsers > 0.02) {
        $(liker).addClass('popular-page-mid');
        // 2%
      }
      else if (count / totalUsers > 0.005) {
        $(liker).addClass('popular-page-low');
        // 0.5%
      }
    });
    const $listSeer = $('.page-list-seer');
    $listSeer.each((i, seer) => {
      const count = $(seer).data('count') || 0;
      if (count / totalUsers > 0.10) {
        // 10%
        $(seer).addClass('popular-page-high');
      }
      else if (count / totalUsers > 0.05) {
        // 5%
        $(seer).addClass('popular-page-mid');
      }
      else if (count / totalUsers > 0.02) {
        // 2%
        $(seer).addClass('popular-page-low');
      }
    });
  }

  Crowi.highlightSelectedSection(window.location.hash);
  Crowi.modifyScrollTop();
  Crowi.initClassesByOS();
});

window.addEventListener('hashchange', (e) => {
  Crowi.unhighlightSelectedSection(Crowi.findHashFromUrl(e.oldURL));
  Crowi.highlightSelectedSection(Crowi.findHashFromUrl(e.newURL));
  Crowi.modifyScrollTop();
  const { appContainer } = window;
  const navigationContainer = appContainer.getContainer('NavigationContainer');


  // hash on page
  if (window.location.hash) {
    if (window.location.hash === '#edit') {
      navigationContainer.setEditorMode('edit');
      Crowi.setCaretLineAndFocusToEditor();
    }
    else if (window.location.hash === '#hackmd') {
      navigationContainer.setEditorMode('hackmd');
    }
  }
});

// adjust min-height of page for print temporarily
window.onbeforeprint = function() {
  $('#page-wrapper').css('min-height', '0px');
};
