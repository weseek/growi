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

Crowi.handleKeyEHandler = (event) => {
  // ignore when dom that has 'modal in' classes exists
  if (document.getElementsByClassName('modal in').length > 0) {
    return;
  }
  // show editor
  $('a[data-toggle="tab"][href="#edit"]').tab('show');
  event.preventDefault();
};

Crowi.handleKeyCtrlSlashHandler = (event) => {
  // show modal to create a page
  $('#shortcuts-modal').modal('toggle');
  event.preventDefault();
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
  const appContainer = window.appContainer;
  const config = appContainer.getConfig();

  const pageId = $('#content-main').data('page-id');
  // const revisionId = $('#content-main').data('page-revision-id');
  // const revisionCreatedAt = $('#content-main').data('page-revision-created');
  // const currentUser = $('#content-main').data('current-user');
  const isSeen = $('#content-main').data('page-is-seen');
  const isSavedStatesOfTabChanges = config.isSavedStatesOfTabChanges;

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

    // presentation
    let presentaionInitialized = false;


    const $b = $('body');

    $(document).on('click', '.toggle-presentation', function(e) {
      const $a = $(this);

      e.preventDefault();
      $b.toggleClass('overlay-on');

      if (!presentaionInitialized) {
        presentaionInitialized = true;

        $('<iframe />').attr({
          src: $a.attr('href'),
        }).appendTo($('#presentation-container'));
      }
    }).on('click', '.fullscreen-layer', () => {
      $b.toggleClass('overlay-on');
    });
  } // end if pageId

  // tab changing handling
  $('a[href="#revision-body"]').on('show.bs.tab', () => {
    const navigationContainer = appContainer.getContainer('NavigationContainer');
    navigationContainer.setEditorMode(null);
  });
  $('a[href="#edit"]').on('show.bs.tab', () => {
    const navigationContainer = appContainer.getContainer('NavigationContainer');
    navigationContainer.setEditorMode('builtin');
    $('body').addClass('on-edit');
    $('body').addClass('builtin-editor');
  });
  $('a[href="#edit"]').on('hide.bs.tab', () => {
    $('body').removeClass('on-edit');
    $('body').removeClass('builtin-editor');
  });
  $('a[href="#hackmd"]').on('show.bs.tab', () => {
    const navigationContainer = appContainer.getContainer('NavigationContainer');
    navigationContainer.setEditorMode('hackmd');
    $('body').addClass('on-edit');
    $('body').addClass('hackmd');
  });

  $('a[href="#hackmd"]').on('hide.bs.tab', () => {
    $('body').removeClass('on-edit');
    $('body').removeClass('hackmd');
  });

  // hash handling
  if (isSavedStatesOfTabChanges) {
    $('a[data-toggle="tab"][href="#revision-history"]').on('show.bs.tab', () => {
      window.location.hash = '#revision-history';
      window.history.replaceState('', 'History', '#revision-history');
    });
    $('a[data-toggle="tab"][href="#edit"]').on('show.bs.tab', () => {
      window.location.hash = '#edit';
      window.history.replaceState('', 'Edit', '#edit');
    });
    $('a[data-toggle="tab"][href="#hackmd"]').on('show.bs.tab', () => {
      window.location.hash = '#hackmd';
      window.history.replaceState('', 'HackMD', '#hackmd');
    });
    $('a[data-toggle="tab"][href="#revision-body"]').on('show.bs.tab', () => {
      // couln't solve https://github.com/weseek/crowi-plus/issues/119 completely -- 2017.07.03 Yuki Takei
      window.location.hash = '#';
      window.history.replaceState('', '', window.location.href);
    });
  }
  else {
    $('a[data-toggle="tab"][href="#revision-history"]').on('show.bs.tab', () => {
      window.history.replaceState('', 'History', '#revision-history');
    });
    $('a[data-toggle="tab"][href="#edit"]').on('show.bs.tab', () => {
      window.history.replaceState('', 'Edit', '#edit');
    });
    $('a[data-toggle="tab"][href="#hackmd"]').on('show.bs.tab', () => {
      window.history.replaceState('', 'HackMD', '#hackmd');
    });
    $('a[data-toggle="tab"][href="#revision-body"]').on('show.bs.tab', () => {
      window.history.replaceState('', '', window.location.href.replace(window.location.hash, ''));
    });
    // replace all href="#edit" link behaviors
    $(document).on('click', 'a[href="#edit"]', () => {
      window.location.replace('#edit');
    });
  }

  // focus to editor when 'shown.bs.tab' event fired
  $('a[href="#edit"]').on('shown.bs.tab', (e) => {
    Crowi.setCaretLineAndFocusToEditor();
  });
});

window.addEventListener('load', (e) => {
  const { appContainer } = window;

  // do nothing if user is guest
  if (appContainer.currentUser == null) {
    return;
  }

  // hash on page
  if (window.location.hash) {
    const navigationContainer = appContainer.getContainer('NavigationContainer');

    if ((window.location.hash === '#edit' || window.location.hash === '#edit-form') && $('.tab-pane#edit').length > 0) {
      navigationContainer.setEditorMode('builtin');

      $('a[data-toggle="tab"][href="#edit"]').tab('show');
      $('body').addClass('on-edit');
      $('body').addClass('builtin-editor');

      // focus
      Crowi.setCaretLineAndFocusToEditor();
    }
    else if (window.location.hash === '#hackmd' && $('.tab-pane#hackmd').length > 0) {
      navigationContainer.setEditorMode('hackmd');

      $('a[data-toggle="tab"][href="#hackmd"]').tab('show');
      $('body').addClass('on-edit');
      $('body').addClass('hackmd');
    }
    else if (window.location.hash === '#revision-history' && $('.tab-pane#revision-history').length > 0) {
      $('a[data-toggle="tab"][href="#revision-history"]').tab('show');
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

  // hash on page
  if (window.location.hash) {
    if (window.location.hash === '#edit') {
      $('a[data-toggle="tab"][href="#edit"]').tab('show');
    }
    else if (window.location.hash === '#hackmd') {
      $('a[data-toggle="tab"][href="#hackmd"]').tab('show');
    }
    else if (window.location.hash === '#revision-history') {
      $('a[data-toggle="tab"][href="#revision-history"]').tab('show');
    }
  }
  else {
    $('a[data-toggle="tab"][href="#revision-body"]').tab('show');
  }
});

window.addEventListener('keydown', (event) => {
  const target = event.target;

  // ignore when target dom is input
  const inputPattern = /^input|textinput|textarea$/i;
  if (inputPattern.test(target.tagName) || target.isContentEditable) {
    return;
  }

  switch (event.key) {
    case 'e':
      if (!event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
        Crowi.handleKeyEHandler(event);
      }
      break;
    case '/':
      if (event.ctrlKey || event.metaKey) {
        Crowi.handleKeyCtrlSlashHandler(event);
      }
      break;
    default:
  }
});

// adjust min-height of page for print temporarily
window.onbeforeprint = function() {
  $('#page-wrapper').css('min-height', '0px');
};
