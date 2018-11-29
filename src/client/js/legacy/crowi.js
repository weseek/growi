/* jshint browser: true, jquery: true */
/* Author: Sotaro KARASAWA <sotarok@crocos.co.jp>
*/

/* global crowi: true */
/* global crowiRenderer: true */

import React from 'react';
import ReactDOM from 'react-dom';

import { debounce } from 'throttle-debounce';

const pagePathUtils = require('@commons/util/page-path-utils');
const entities = require('entities');
const escapeStringRegexp = require('escape-string-regexp');
require('jquery.cookie');
require('bootstrap-select');

import GrowiRenderer from '../util/GrowiRenderer';
import Page from '../components/Page';

require('./thirdparty-js/agile-admin');

let Crowi = {};

if (!window) {
  window = {};
}
window.Crowi = Crowi;

/**
 * render Table Of Contents
 * @param {string} tocHtml
 */
Crowi.renderTocContent = (tocHtml) => {
  $('#revision-toc-content').html(tocHtml);
};

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

  const line = pageEditorDom.getAttribute('data-caret-line') || 0;
  crowi.setCaretLine(+line);
  // reset data-caret-line attribute
  pageEditorDom.removeAttribute('data-caret-line');

  // focus
  crowi.focusToEditor();
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
  setTimeout(function() {
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

Crowi.handleKeyCHandler = (event) => {
  // ignore when dom that has 'modal in' classes exists
  if (document.getElementsByClassName('modal in').length > 0) {
    return;
  }
  // show modal to create a page
  $('#create-page').modal();
  event.preventDefault();
};

Crowi.handleKeyCtrlSlashHandler = (event) => {
  // show modal to create a page
  $('#shortcuts-modal').modal('toggle');
  event.preventDefault();
};

Crowi.initAffix = () => {
  const $affixContent = $('#page-header');
  if ($affixContent.length > 0) {
    const $affixContentContainer = $('.row.bg-title');
    const containerHeight = $affixContentContainer.outerHeight(true);
    $affixContent.affix({
      offset: {
        top: function() {
          return $('.navbar').outerHeight(true) + containerHeight;
        }
      }
    });
    $('[data-affix-disable]').on('click', function(e) {
      const $elm = $($(this).data('affix-disable'));
      $(window).off('.affix');
      $elm.removeData('affix').removeClass('affix affix-top affix-bottom');
      return false;
    });
    $affixContentContainer.css({'min-height': containerHeight});
  }
};

Crowi.initSlimScrollForRevisionToc = () => {
  const revisionTocElem = document.querySelector('.growi .revision-toc');
  const tocContentElem = document.querySelector('.growi .revision-toc .markdownIt-TOC');

  // growi layout only
  if (revisionTocElem == null || tocContentElem == null) {
    return;
  }

  function getCurrentRevisionTocTop() {
    // calculate absolute top of '#revision-toc' element
    return revisionTocElem.getBoundingClientRect().top;
  }

  function resetScrollbar(revisionTocTop) {
    // window height - revisionTocTop - .system-version height
    let h = window.innerHeight - revisionTocTop - 20;

    const tocContentHeight = tocContentElem.getBoundingClientRect().height + 15;  // add margin

    h = Math.min(h, tocContentHeight);

    $('#revision-toc-content').slimScroll({
      railVisible: true,
      position: 'right',
      height: h,
    });
  }

  const resetScrollbarDebounced = debounce(100, resetScrollbar);

  // initialize
  const revisionTocTop = getCurrentRevisionTocTop();
  resetScrollbar(revisionTocTop);

  /*
   * set event listener
   */
  // resize
  window.addEventListener('resize', (event) => {
    resetScrollbarDebounced(getCurrentRevisionTocTop());
  });
  // affix on
  $('#revision-toc').on('affixed.bs.affix', function() {
    resetScrollbar(getCurrentRevisionTocTop());
  });
  // affix off
  $('#revision-toc').on('affixed-top.bs.affix', function() {
    // calculate sum of height (.navbar-header + .bg-title) + margin-top of .main
    const sum = 138;
    resetScrollbar(sum);
  });
};

Crowi.findHashFromUrl = function(url) {
  let match;
  /* eslint-disable no-cond-assign */
  if (match = url.match(/#(.+)$/)) {
    return `#${match[1]}`;
  }
  /* eslint-enable */

  return '';
};

Crowi.findSectionHeader = function(hash) {
  if (hash.length == 0) {
    return;
  }

  // omit '#'
  const id = hash.replace('#', '');
  // don't use jQuery and document.querySelector
  //  because hash may containe Base64 encoded strings
  const elem = document.getElementById(id);
  if (elem != null && elem.tagName.match(/h\d+/i)) {  // match h1, h2, h3...
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

/**
 * Return editor mode string
 * @return 'builtin' or 'hackmd' or null (not editing)
 */
Crowi.getCurrentEditorMode = function() {
  const isEditing = $('body').hasClass('on-edit');
  if (!isEditing) {
    return null;
  }

  if ($('body').hasClass('builtin-editor')) {
    return 'builtin';
  }
  else {
    return 'hackmd';
  }
};

$(function() {
  const config = JSON.parse(document.getElementById('crowi-context-hydrate').textContent || '{}');

  const pageId = $('#content-main').data('page-id');
  // const revisionId = $('#content-main').data('page-revision-id');
  // const revisionCreatedAt = $('#content-main').data('page-revision-created');
  // const currentUser = $('#content-main').data('current-user');
  const isSeen = $('#content-main').data('page-is-seen');
  const pagePath= $('#content-main').data('path');
  const isSavedStatesOfTabChanges = config['isSavedStatesOfTabChanges'];

  $('[data-toggle="popover"]').popover();
  $('[data-toggle="tooltip"]').tooltip();
  $('[data-tooltip-stay]').tooltip('show');

  $('#toggle-sidebar').click(function(e) {
    const $mainContainer = $('.main-container');
    if ($mainContainer.hasClass('aside-hidden')) {
      $('.main-container').removeClass('aside-hidden');
      $.cookie('aside-hidden', 0, { expires: 30, path: '/' });
    }
    else {
      $mainContainer.addClass('aside-hidden');
      $.cookie('aside-hidden', 1, { expires: 30, path: '/' });
    }
    return false;
  });

  if ($.cookie('aside-hidden') == 1) {
    $('.main-container').addClass('aside-hidden');
  }

  $('.copy-link').on('click', function() {
    $(this).select();
  });


  $('#create-page').on('shown.bs.modal', function(e) {
    // quick hack: replace from server side rendering "date" to client side "date"
    const today = new Date();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    const dateString = today.getFullYear() + '/' + month + '/' + day;
    $('#create-page-today .page-today-suffix').text('/' + dateString + '/');
    $('#create-page-today .page-today-input2').data('prefix', '/' + dateString + '/');

    // focus
    $('#create-page-today .page-today-input2').eq(0).focus();
  });

  $('#create-page-today').submit(function(e) {
    let prefix1 = $('input.page-today-input1', this).data('prefix');
    let prefix2 = $('input.page-today-input2', this).data('prefix');
    const input1 = $('input.page-today-input1', this).val();
    const input2 = $('input.page-today-input2', this).val();
    if (input1 === '') {
      prefix1 = 'メモ';
    }
    if (input2 === '') {
      prefix2 = prefix2.slice(0, -1);
    }
    top.location.href = prefix1 + input1 + prefix2 + input2 + '#edit';
    return false;
  });

  $('#create-page-under-tree').submit(function(e) {
    let name = $('input', this).val();
    if (!name.match(/^\//)) {
      name = '/' + name;
    }
    if (name.match(/.+\/$/)) {
      name = name.substr(0, name.length - 1);
    }
    top.location.href = pagePathUtils.encodePagePath(name) + '#edit';
    return false;
  });

  // rename/unportalize
  $('#renamePage, #unportalize').on('shown.bs.modal', function(e) {
    $('#renamePage #newPageName').focus();
    $('#renamePage .msg-already-exists, #unportalize .msg-already-exists').hide();
  });
  $('#renamePageForm, #unportalize-form').submit(function(e) {
    // create name-value map
    let nameValueMap = {};
    $(this).serializeArray().forEach((obj) => {
      nameValueMap[obj.name] = obj.value;
    });

    const data = $(this).serialize() + `&socketClientId=${crowi.getSocketClientId()}`;

    $.ajax({
      type: 'POST',
      url: '/_api/pages.rename',
      data: data,
      dataType: 'json'
    })
    .done(function(res) {
      if (!res.ok) {
        // if already exists
        $('#renamePage .msg-already-exists, #unportalize .msg-already-exists').show();
        $('#renamePage #linkToNewPage, #unportalize #linkToNewPage').html(`
          <a href="${nameValueMap.new_path}">${nameValueMap.new_path} <i class="icon-login"></i></a>
        `);
      }
      else {
        const page = res.page;
        top.location.href = page.path + '?renamed=' + pagePath;
      }
    });

    return false;
  });

  // duplicate
  $('#duplicatePage').on('shown.bs.modal', function(e) {
    $('#duplicatePage #duplicatePageName').focus();
    $('#duplicatePage .msg-already-exists').hide();
  });
  $('#duplicatePageForm, #unportalize-form').submit(function(e) {
    // create name-value map
    let nameValueMap = {};
    $(this).serializeArray().forEach((obj) => {
      nameValueMap[obj.name] = obj.value;
    });

    $.ajax({
      type: 'POST',
      url: '/_api/pages.duplicate',
      data: $(this).serialize(),
      dataType: 'json'
    }).done(function(res) {
      if (!res.ok) {
        // if already exists
        $('#duplicatePage .msg-already-exists').show();
        $('#duplicatePage #linkToNewPage').html(`
          <a href="${nameValueMap.new_path}">${nameValueMap.new_path} <i class="icon-login"></i></a>
        `);
      }
      else {
        const page = res.page;
        top.location.href = page.path + '?duplicated=' + pagePath;
      }
    });

    return false;
  });

  // delete
  $('#delete-page-form').submit(function(e) {
    $.ajax({
      type: 'POST',
      url: '/_api/pages.remove',
      data: $('#delete-page-form').serialize(),
      dataType: 'json'
    }).done(function(res) {
      if (!res.ok) {
        $('#delete-errors').html('<i class="fa fa-times-circle"></i> ' + res.error);
        $('#delete-errors').addClass('alert-danger');
      }
      else {
        const page = res.page;
        top.location.href = page.path;
      }
    });

    return false;
  });
  $('#revert-delete-page-form').submit(function(e) {
    $.ajax({
      type: 'POST',
      url: '/_api/pages.revertRemove',
      data: $('#revert-delete-page-form').serialize(),
      dataType: 'json'
    }).done(function(res) {
      if (!res.ok) {
        $('#delete-errors').html('<i class="fa fa-times-circle"></i> ' + res.error);
        $('#delete-errors').addClass('alert-danger');
      }
      else {
        const page = res.page;
        top.location.href = page.path;
      }
    });

    return false;
  });
  $('#unlink-page-form').submit(function(e) {
    $.ajax({
      type: 'POST',
      url: '/_api/pages.unlink',
      data: $('#unlink-page-form').serialize(),
      dataType: 'json'
    })
    .done(function(res) {
      if (!res.ok) {
        $('#delete-errors').html('<i class="fa fa-times-circle"></i> ' + res.error);
        $('#delete-errors').addClass('alert-danger');
      }
      else {
        top.location.href = res.path + '?unlinked=true';
      }
    });

    return false;
  });

  $('#create-portal-button').on('click', function(e) {
    $('a[data-toggle="tab"][href="#edit"]').tab('show');

    $('body').addClass('on-edit');
    $('body').addClass('builtin-editor');

    const path = $('.content-main').data('path');
    if (path != '/' && $('.content-main').data('page-id') == '') {
      const upperPage = path.substr(0, path.length - 1);
      $.get('/_api/pages.get', {path: upperPage}, function(res) {
        if (res.ok && res.page) {
          $('#portal-warning-modal').modal('show');
        }
      });
    }
  });
  $('#portal-form-close').on('click', function(e) {
    $('#edit').removeClass('active');
    $('body').removeClass('on-edit');
    $('body').removeClass('builtin-editor');
    location.hash = '#';
  });

  /*
   * wrap short path with <strong></strong>
   */
  $('#view-list .page-list-ul-flat .page-list-link').each(function() {
    const $link = $(this);
    /* eslint-disable no-unused-vars */
    const text = $link.text();
    /* eslint-enable */
    let path = decodeURIComponent($link.data('path'));
    const shortPath = decodeURIComponent($link.data('short-path')); // convert to string

    if (path == null || shortPath == null) {
      // continue
      return;
    }

    path = entities.encodeHTML(path);
    const pattern = escapeStringRegexp(entities.encodeHTML(shortPath)) + '(/)?$';

    $link.html(path.replace(new RegExp(pattern), '<strong>' + shortPath + '$1</strong>'));
  });

  // for list page
  let growiRendererForTimeline = null;
  $('a[data-toggle="tab"][href="#view-timeline"]').on('show.bs.tab', function() {
    const isShown = $('#view-timeline').data('shown');

    if (growiRendererForTimeline == null) {
      growiRendererForTimeline = new GrowiRenderer(crowi, crowiRenderer, {mode: 'timeline'});
    }

    if (isShown == 0) {
      $('#view-timeline .timeline-body').each(function() {
        const id = $(this).attr('id');
        const contentId = '#' + id + ' > script';
        const revisionBody = '#' + id + ' .revision-body';
        const revisionBodyElem = document.querySelector(revisionBody);
        /* eslint-disable no-unused-vars */
        const revisionPath = '#' + id + ' .revision-path';
        /* eslint-enable */
        const pagePath = document.getElementById(id).getAttribute('data-page-path');
        const markdown = entities.decodeHTML($(contentId).html());

        ReactDOM.render(<Page crowi={crowi} crowiRenderer={growiRendererForTimeline} markdown={markdown} pagePath={pagePath} />, revisionBodyElem);
      });

      $('#view-timeline').data('shown', 1);
    }
  });

  if (pageId) {

    // for Crowi Template LangProcessor
    $('.template-create-button', $('#revision-body')).on('click', function() {
      const path = $(this).data('path');
      const templateId = $(this).data('template');
      const template = $('#' + templateId).html();

      crowi.saveDraft(path, template);
      top.location.href = `${path}#edit`;
    });

    // Like
    const $likeButton = $('.like-button');
    const $likeCount = $('#like-count');
    $likeButton.click(function() {
      const liked = $likeButton.data('liked');
      const token = $likeButton.data('csrftoken');
      if (!liked) {
        $.post('/_api/likes.add', {_csrf: token, page_id: pageId}, function(res) {
          if (res.ok) {
            MarkLiked();
          }
        });
      }
      else {
        $.post('/_api/likes.remove', {_csrf: token, page_id: pageId}, function(res) {
          if (res.ok) {
            MarkUnLiked();
          }
        });
      }

      return false;
    });
    const $likerList = $('#liker-list');
    const likers = $likerList.data('likers');
    if (likers && likers.length > 0) {
      const users = crowi.findUserByIds(likers.split(','));
      if (users) {
        AddToLikers(users);
      }
    }

    /* eslint-disable no-inner-declarations */
    function AddToLikers(users) {
      $.each(users, function(i, user) {
        $likerList.append(CreateUserLinkWithPicture(user));
      });
    }

    function MarkLiked() {
      $likeButton.addClass('active');
      $likeButton.data('liked', 1);
      $likeCount.text(parseInt($likeCount.text()) + 1);
    }

    function MarkUnLiked() {
      $likeButton.removeClass('active');
      $likeButton.data('liked', 0);
      $likeCount.text(parseInt($likeCount.text()) - 1);
    }

    function CreateUserLinkWithPicture(user) {
      const $userHtml = $('<a>');
      $userHtml.data('user-id', user._id);
      $userHtml.attr('href', '/user/' + user.username);
      $userHtml.attr('title', user.name);

      const $userPicture = $('<img class="picture picture-xs img-circle">');
      $userPicture.attr('alt', user.name);
      $userPicture.attr('src',  Crowi.userPicture(user));

      $userHtml.append($userPicture);
      return $userHtml;
    }
    /* eslint-enable */

    if (!isSeen) {
      $.post('/_api/pages.seen', {page_id: pageId}, function(res) {
        // ignore unless response has error
        if (res.ok && res.seenUser) {
          $('#content-main').data('page-is-seen', 1);
        }
      });
    }

    // presentation
    let presentaionInitialized = false
      , $b = $('body');

    $(document).on('click', '.toggle-presentation', function(e) {
      const $a = $(this);

      e.preventDefault();
      $b.toggleClass('overlay-on');

      if (!presentaionInitialized) {
        presentaionInitialized = true;

        $('<iframe />').attr({
          src: $a.attr('href')
        }).appendTo($('#presentation-container'));
      }
    }).on('click', '.fullscreen-layer', function() {
      $b.toggleClass('overlay-on');
    });

  } // end if pageId

  // tab changing handling
  $('a[href="#edit"]').on('show.bs.tab', function() {
    $('body').addClass('on-edit');
    $('body').addClass('builtin-editor');
  });
  $('a[href="#edit"]').on('hide.bs.tab', function() {
    $('body').removeClass('on-edit');
    $('body').removeClass('builtin-editor');
  });
  $('a[href="#hackmd"]').on('show.bs.tab', function() {
    $('body').addClass('on-edit');
    $('body').addClass('hackmd');
  });

  $('a[href="#hackmd"]').on('hide.bs.tab', function() {
    $('body').removeClass('on-edit');
    $('body').removeClass('hackmd');
  });

  // hash handling
  if (isSavedStatesOfTabChanges) {
    $('a[data-toggle="tab"][href="#revision-history"]').on('show.bs.tab', function() {
      window.location.hash = '#revision-history';
      window.history.replaceState('', 'History', '#revision-history');
    });
    $('a[data-toggle="tab"][href="#edit"]').on('show.bs.tab', function() {
      window.location.hash = '#edit';
      window.history.replaceState('', 'Edit', '#edit');
    });
    $('a[data-toggle="tab"][href="#hackmd"]').on('show.bs.tab', function() {
      window.location.hash = '#hackmd';
      window.history.replaceState('', 'HackMD', '#hackmd');
    });
    $('a[data-toggle="tab"][href="#revision-body"]').on('show.bs.tab', function() {
      // couln't solve https://github.com/weseek/crowi-plus/issues/119 completely -- 2017.07.03 Yuki Takei
      window.location.hash = '#';
      window.history.replaceState('', '', location.href);
    });
  }
  else {
    $('a[data-toggle="tab"][href="#revision-history"]').on('show.bs.tab', function() {
      window.history.replaceState('', 'History', '#revision-history');
    });
    $('a[data-toggle="tab"][href="#edit"]').on('show.bs.tab', function() {
      window.history.replaceState('', 'Edit', '#edit');
    });
    $('a[data-toggle="tab"][href="#hackmd"]').on('show.bs.tab', function() {
      window.history.replaceState('', 'HackMD', '#hackmd');
    });
    $('a[data-toggle="tab"][href="#revision-body"]').on('show.bs.tab', function() {
      window.history.replaceState('', '',  location.href.replace(location.hash, ''));
    });
    // replace all href="#edit" link behaviors
    $(document).on('click', 'a[href="#edit"]', function() {
      window.location.replace('#edit');
    });
  }

  // focus to editor when 'shown.bs.tab' event fired
  $('a[href="#edit"]').on('shown.bs.tab', function(e) {
    Crowi.setCaretLineAndFocusToEditor();
  });
});

window.addEventListener('load', function(e) {
  // hash on page
  if (location.hash) {
    if (location.hash === '#edit' || location.hash === '#edit-form') {
      $('a[data-toggle="tab"][href="#edit"]').tab('show');
      $('body').addClass('on-edit');
      $('body').addClass('builtin-editor');

      // focus
      Crowi.setCaretLineAndFocusToEditor();
    }
    else if (location.hash == '#hackmd') {
      $('a[data-toggle="tab"][href="#hackmd"]').tab('show');
      $('body').addClass('on-edit');
      $('body').addClass('hackmd');
    }
    else if (location.hash == '#revision-history') {
      $('a[data-toggle="tab"][href="#revision-history"]').tab('show');
    }
  }

  if (crowi && crowi.users || crowi.users.length == 0) {
    const totalUsers = crowi.users.length;
    const $listLiker = $('.page-list-liker');
    $listLiker.each(function(i, liker) {
      const count = $(liker).data('count') || 0;
      if (count/totalUsers > 0.05) {
        $(liker).addClass('popular-page-high');
        // 5%
      }
      else if (count/totalUsers > 0.02) {
        $(liker).addClass('popular-page-mid');
        // 2%
      }
      else if (count/totalUsers > 0.005) {
        $(liker).addClass('popular-page-low');
        // 0.5%
      }
    });
    const $listSeer = $('.page-list-seer');
    $listSeer.each(function(i, seer) {
      const count = $(seer).data('count') || 0;
      if (count/totalUsers > 0.10) {
        // 10%
        $(seer).addClass('popular-page-high');
      }
      else if (count/totalUsers > 0.05) {
        // 5%
        $(seer).addClass('popular-page-mid');
      }
      else if (count/totalUsers > 0.02) {
        // 2%
        $(seer).addClass('popular-page-low');
      }
    });
  }

  Crowi.highlightSelectedSection(location.hash);
  Crowi.modifyScrollTop();
  Crowi.initSlimScrollForRevisionToc();
  Crowi.initAffix();
});

window.addEventListener('hashchange', function(e) {
  Crowi.unhighlightSelectedSection(Crowi.findHashFromUrl(e.oldURL));
  Crowi.highlightSelectedSection(Crowi.findHashFromUrl(e.newURL));
  Crowi.modifyScrollTop();

  // hash on page
  if (location.hash) {
    if (location.hash === '#edit') {
      $('a[data-toggle="tab"][href="#edit"]').tab('show');
    }
    else if (location.hash == '#hackmd') {
      $('a[data-toggle="tab"][href="#hackmd"]').tab('show');
    }
    else if (location.hash == '#revision-history') {
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
    case 'c':
      if (!event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
        Crowi.handleKeyCHandler(event);
      }
      break;
    case '/':
      if (event.ctrlKey || event.metaKey) {
        Crowi.handleKeyCtrlSlashHandler(event);
      }
      break;
  }

});

// adjust min-height of page for print temporarily
window.onbeforeprint = function () {
  $("#page-wrapper").css("min-height", "0px");
};
