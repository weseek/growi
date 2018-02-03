/* jshint browser: true, jquery: true */
/* Author: Sotaro KARASAWA <sotarok@crocos.co.jp>
*/

import React from 'react';
import ReactDOM from 'react-dom';

import GrowiRenderer from '../util/GrowiRenderer';
import Page from '../components/Page';

const io = require('socket.io-client');
const entities = require("entities");
const escapeStringRegexp = require('escape-string-regexp');
require('bootstrap-sass');
require('jquery.cookie');

var Crowi = {};

if (!window) {
  window = {};
}
window.Crowi = Crowi;

Crowi.createErrorView = function(msg) {
  $('#main').prepend($('<p class="alert-message error">' + msg + '</p>'));
};

/**
 * render Table Of Contents
 * @param {string} tocHtml
 */
Crowi.renderTocContent = (tocHtml) => {
  $('#revision-toc-content').html(tocHtml);
}

/**
 * append buttons to section headers
 */
Crowi.appendEditSectionButtons = function(parentElement) {
  $('h1,h2,h3,h4,h5,h6', parentElement).each(function(idx, elm) {
    const line = +elm.getAttribute('data-line');

    // add button
    $(this).append(`
      <span class="revision-head-edit-button">
        <a href="#edit-form" onClick="Crowi.setCaretLineData(${line})">
          <i class="fa fa-edit"></i>
        </a>
      </span>
      `
    );
  });
};

/**
 * set 'data-caret-line' attribute that will be processed when 'shown.bs.tab' event fired
 * @param {number} line
 */
Crowi.setCaretLineData = function(line) {
  const pageEditorDom = document.querySelector('#page-editor');
  pageEditorDom.setAttribute('data-caret-line', line);
}

/**
 * invoked when;
 *
 * 1. window loaded
 * 2. 'shown.bs.tab' event fired
 */
Crowi.setCaretLineAndFocusToEditor = function() {
  // get 'data-caret-line' attributes
  const pageEditorDom = document.querySelector('#page-editor');

  if (pageEditorDom == null) {
    return;
  }

  const line = pageEditorDom.getAttribute('data-caret-line');

  if (line != null) {
    crowi.setCaretLine(line);
    // reset data-caret-line attribute
    pageEditorDom.removeAttribute('data-caret-line');
  }

  // focus
  crowi.focusToEditor();
}

// original: middleware.swigFilter
Crowi.userPicture = function (user) {
  if (!user) {
    return '/images/userpicture.png';
  }

  return user.image || '/images/userpicture.png';
};

Crowi.modifyScrollTop = function() {
  var offset = 10;

  var hash = window.location.hash;
  if (hash === "") {
    return;
  }

  var pageHeader = document.querySelector('#page-header');
  if (!pageHeader) {
    return;
  }
  var pageHeaderRect = pageHeader.getBoundingClientRect();

  var sectionHeader = Crowi.findSectionHeader(hash);
  if (sectionHeader === null) {
    return;
  }

  var timeout = 0;
  if (window.scrollY === 0) {
    timeout = 200;
  }
  setTimeout(function() {
    var sectionHeaderRect = sectionHeader.getBoundingClientRect();
    if (sectionHeaderRect.top >= pageHeaderRect.bottom) {
      return;
    }

    window.scrollTo(0, (window.scrollY - pageHeaderRect.height - offset));
  }, timeout);
}

Crowi.updateCurrentRevision = function(revisionId) {
  $('#page-form [name="pageForm[currentRevision]"]').val(revisionId);
}

Crowi.handleKeyEHandler = (event) => {
  // ignore when dom that has 'modal in' classes exists
  if (document.getElementsByClassName('modal in').length > 0) {
    return;
  }
  // show editor
  $('a[data-toggle="tab"][href="#edit-form"]').tab('show');
  event.preventDefault();
}

Crowi.handleKeyCHandler = (event) => {
  // ignore when dom that has 'modal in' classes exists
  if (document.getElementsByClassName('modal in').length > 0) {
    return;
  }
  // show modal to create a page
  $('#create-page').modal();
  event.preventDefault();
}

Crowi.handleKeyCtrlSlashHandler = (event) => {
  // show modal to create a page
  $('#shortcuts-modal').modal('toggle');
  event.preventDefault();
}

$(function() {
  var config = JSON.parse(document.getElementById('crowi-context-hydrate').textContent || '{}');

  var pageId = $('#content-main').data('page-id');
  var revisionId = $('#content-main').data('page-revision-id');
  var revisionCreatedAt = $('#content-main').data('page-revision-created');
  var currentUser = $('#content-main').data('current-user');
  var isSeen = $('#content-main').data('page-is-seen');
  var pagePath= $('#content-main').data('path');
  var isSavedStatesOfTabChanges = config['isSavedStatesOfTabChanges'];

  $('[data-toggle="popover"]').popover();
  $('[data-toggle="tooltip"]').tooltip();
  $('[data-tooltip-stay]').tooltip('show');

  $('#toggle-sidebar').click(function(e) {
    var $mainContainer = $('.main-container');
    if ($mainContainer.hasClass('aside-hidden')) {
      $('.main-container').removeClass('aside-hidden');
      $.cookie('aside-hidden', 0, { expires: 30, path: '/' });
    } else {
      $mainContainer.addClass('aside-hidden');
      $.cookie('aside-hidden', 1, { expires: 30, path: '/' });
    }
    return false;
  });

  if ($.cookie('aside-hidden') == 1) {
    $('.main-container').addClass('aside-hidden');
  }

  $('.copy-link').on('click', function () {
    $(this).select();
  });


  $('#create-page').on('shown.bs.modal', function (e) {
    // quick hack: replace from server side rendering "date" to client side "date"
    var today = new Date();
    var month = ('0' + (today.getMonth() + 1)).slice(-2);
    var day = ('0' + today.getDate()).slice(-2);
    var dateString = today.getFullYear() + '/' + month + '/' + day;
    $('#create-page-today .page-today-suffix').text('/' + dateString + '/');
    $('#create-page-today .page-today-input2').data('prefix', '/' + dateString + '/');

    var input2Width = $('#create-page-today .col-xs-10').outerWidth() - 1;
    var newWidth = input2Width
      - $('#create-page-today .page-today-prefix').outerWidth()
      - $('#create-page-today .page-today-input1').outerWidth()
      - $('#create-page-today .page-today-suffix').outerWidth()
      - 42
      ;
    $('#create-page-today .form-control.page-today-input2').css({width: newWidth}).focus();

  });

  $('#create-page-today').submit(function(e) {
    var prefix1 = $('input.page-today-input1', this).data('prefix');
    var input1 = $('input.page-today-input1', this).val();
    var prefix2 = $('input.page-today-input2', this).data('prefix');
    var input2 = $('input.page-today-input2', this).val();
    if (input1 === '') {
      prefix1 = 'メモ';
    }
    if (input2 === '') {
      prefix2 = prefix2.slice(0, -1);
    }
    top.location.href = prefix1 + input1 + prefix2 + input2 + '#edit-form';
    return false;
  });

  $('#create-page-under-tree').submit(function(e) {
    var name = $('input', this).val();
    if (!name.match(/^\//)) {
      name = '/' + name;
    }
    if (name.match(/.+\/$/)) {
      name = name.substr(0, name.length - 1);
    }
    top.location.href = name + '#edit-form';
    return false;
  });

  // rename
  $('#renamePage').on('shown.bs.modal', function (e) {
    $('#newPageName').focus();
  });
  $('#renamePageForm, #unportalize-form').submit(function(e) {
    // create name-value map
    let nameValueMap = {};
    $(this).serializeArray().forEach((obj) => {
      nameValueMap[obj.name] = obj.value;
    })

    $.ajax({
      type: 'POST',
      url: '/_api/pages.rename',
      data: $(this).serialize(),
      dataType: 'json'
    }).done(function(res) {
      if (!res.ok) {
        // if already exists
        $('#newPageNameCheck').html('<i class="fa fa-times-circle"></i> ' + res.error);
        $('#newPageNameCheck').addClass('alert-danger');
        $('#linkToNewPage').html(`
          <i class="fa fa-fw fa-arrow-right"></i><a href="${nameValueMap.new_path}">${nameValueMap.new_path}</a>
        `);
      } else {
        var page = res.page;

        $('#newPageNameCheck').removeClass('alert-danger');
        //$('#newPageNameCheck').html('<img src="/images/loading_s.gif"> 移動しました。移動先にジャンプします。');
        // fix
        $('#newPageNameCheck').html('<img src="/images/loading_s.gif"> Page moved! Redirecting to new page location.');

        setTimeout(function() {
          top.location.href = page.path + '?renamed=' + pagePath;
        }, 1000);
      }
    });

    return false;
  });

  // duplicate
  $('#duplicatePage').on('shown.bs.modal', function (e) {
    $('#duplicatePageName').focus();
  });
  $('#duplicatePageForm, #unportalize-form').submit(function (e) {
    // create name-value map
    let nameValueMap = {};
    $(this).serializeArray().forEach((obj) => {
      nameValueMap[obj.name] = obj.value;
    })

    $.ajax({
      type: 'POST',
      url: '/_api/pages.duplicate',
      data: $(this).serialize(),
      dataType: 'json'
    }).done(function (res) {
      if (!res.ok) {
        // if already exists
        $('#duplicatePageNameCheck').html('<i class="fa fa-times-circle"></i> ' + res.error);
        $('#duplicatePageNameCheck').addClass('alert-danger');
        $('#linkToNewPage').html(`
          <i class="fa fa-fw fa-arrow-right"></i><a href="${nameValueMap.new_path}">${nameValueMap.new_path}</a>
        `);
      } else {
        var page = res.page;

        $('#duplicatePageNameCheck').removeClass('alert-danger');
        $('#duplicatePageNameCheck').html('<img src="/images/loading_s.gif"> Page duplicated! Redirecting to new page location.');

        setTimeout(function () {
          top.location.href = page.path + '?duplicated=' + pagePath;
        }, 1000);
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
      } else {
        var page = res.page;
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
      } else {
        var page = res.page;
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
    }).done(function(res) {
      if (!res.ok) {
        $('#delete-errors').html('<i class="fa fa-times-circle"></i> ' + res.error);
        $('#delete-errors').addClass('alert-danger');
      } else {
        var page = res.page;
        top.location.href = page.path + '?unlinked=true';
      }
    });

    return false;
  });

  $('#create-portal-button').on('click', function(e) {
    $('.portal').removeClass('hide');
    $('.content-main').addClass('on-edit');
    $('.portal a[data-toggle="tab"][href="#edit-form"]').tab('show');

    var path = $('.content-main').data('path');
    if (path != '/' && $('.content-main').data('page-id') == '') {
      var upperPage = path.substr(0, path.length - 1);
      $.get('/_api/pages.get', {path: upperPage}, function(res) {
        if (res.ok && res.page) {
          $('#portal-warning-modal').modal('show');
        }
      });
    }
  });
  $('#portal-form-close').on('click', function(e) {
    $('.portal').addClass('hide');
    $('.content-main').removeClass('on-edit');

    return false;
  });

  /*
   * wrap short path with <strong></strong>
   */
  $('.page-list-link').each(function() {
    var $link = $(this);
    var text = $link.text();
    var path = $link.data('path');
    var shortPath = String($link.data('short-path')); // convert to string

    if (path == null || shortPath == null) {
      // continue
      return;
    }

    path = entities.encodeHTML(path);
    var pattern = escapeStringRegexp(entities.encodeHTML(shortPath)) + '(/)?$';

    $link.html(path.replace(new RegExp(pattern), '<strong>' + shortPath + '$1</strong>'));
  });

  // for list page
  let growiRendererForTimeline = null;
  $('a[data-toggle="tab"][href="#view-timeline"]').on('show.bs.tab', function() {
    var isShown = $('#view-timeline').data('shown');

    if (growiRendererForTimeline == null) {
      growiRendererForTimeline = new GrowiRenderer(crowi, crowiRenderer, {mode: 'timeline'});
    }

    if (isShown == 0) {
      $('#view-timeline .timeline-body').each(function()
      {
        var id = $(this).attr('id');
        var contentId = '#' + id + ' > script';
        var revisionBody = '#' + id + ' .revision-body';
        var revisionBodyElem = document.querySelector(revisionBody);
        var revisionPath = '#' + id + ' .revision-path';
        var pagePath = document.getElementById(id).getAttribute('data-page-path');
        var markdown = entities.decodeHTML($(contentId).html());

        ReactDOM.render(<Page crowi={crowi} crowiRenderer={growiRendererForTimeline} markdown={markdown} pagePath={pagePath} />, revisionBodyElem);
      });

      $('#view-timeline').data('shown', 1);
    }
  });

  // login
  $('#register').on('click', function() {
    $('#login-dialog').addClass('to-flip');
    return false;
  });
  $('#login').on('click', function() {
    $('#login-dialog').removeClass('to-flip');
    return false;
  });

  $('#register-form input[name="registerForm[username]"]').change(function(e) {
    var username = $(this).val();
    $('#input-group-username').removeClass('has-error');
    $('#help-block-username').html("");

    $.getJSON('/_api/check_username', {username: username}, function(json) {
      if (!json.valid) {
        $('#help-block-username').html('<i class="fa fa-warning"></i> This User ID is not available.<br>');
        $('#input-group-username').addClass('has-error');
      }
    });
  });

  if (pageId) {

    /*
     * transplanted to React components -- 2018.02.04 Yuki Takei
     *

    // if page exists
    var $rawTextOriginal = $('#raw-text-original');
    if ($rawTextOriginal.length > 0) {
      var markdown = entities.decodeHTML($('#raw-text-original').html());
      var dom = $('#revision-body-content').get(0);

      // create context object
      var context = {
        markdown,
        dom,
        currentPagePath: decodeURIComponent(location.pathname)
      };

      crowi.interceptorManager.process('preRender', context)
        .then(() => crowi.interceptorManager.process('prePreProcess', context))
        .then(() => {
          context.markdown = crowiRenderer.preProcess(context.markdown);
        })
        .then(() => crowi.interceptorManager.process('postPreProcess', context))
        .then(() => {
          var revisionBody = $('#revision-body-content');
          var parsedHTML = crowiRenderer.render(context.markdown, context.dom);
          context.parsedHTML = parsedHTML;
          Promise.resolve(context);
        })
        .then(() => crowi.interceptorManager.process('postRender', context))
        .then(() => crowi.interceptorManager.process('preRenderHtml', context))
        // render HTML with jQuery
        .then(() => {
          $('#revision-body-content').html(context.parsedHTML);

          $('.template-create-button').on('click', function() {
            var path = $(this).data('path');
            var templateId = $(this).data('template');
            var template = $('#' + templateId).html();

            crowi.saveDraft(path, template);
            top.location.href = path;
          });

          Crowi.appendEditSectionButtons('#revision-body-content', markdown);

          Promise.resolve($('#revision-body-content'));
        })
        // process interceptors for post rendering
        .then((bodyElement) => {
          context = Object.assign(context, {bodyElement})
          return crowi.interceptorManager.process('postRenderHtml', context);
        });


    }
    */

    // header
    var $header = $('#page-header');
    if ($header.length > 0) {
      var headerHeight = $header.outerHeight(true);
      $('.header-wrap').css({height: (headerHeight + 16) + 'px'});
      $header.affix({
        offset: {
          top: function() {
            return headerHeight + 86; // (54 header + 16 header padding-top + 16 content padding-top)
          }
        }
      });
      $('[data-affix-disable]').on('click', function(e) {
        var $elm = $($(this).data('affix-disable'));
        $(window).off('.affix');
        $elm.removeData('affix').removeClass('affix affix-top affix-bottom');
        return false;
      });
    }

    /*
     * transplanted to React components -- 2017.06.02 Yuki Takei
     *

    // omg
    function createCommentHTML(revision, creator, comment, commentedAt) {
      var $comment = $('<div>');
      var $commentImage = $('<img class="picture picture-rounded">')
        .attr('src', Crowi.userPicture(creator));
      var $commentCreator = $('<div class="page-comment-creator">')
        .text(creator.username);

      var $commentRevision = $('<a class="page-comment-revision label">')
        .attr('href', '?revision=' + revision)
        .text(revision.substr(0,8));
      if (revision !== revisionId) {
        $commentRevision.addClass('label-default');
      } else {
        $commentRevision.addClass('label-primary');
      }

      var $commentMeta = $('<div class="page-comment-meta">')
        //日付変換
        .text(moment(commentedAt).format('YYYY/MM/DD HH:mm:ss') + ' ')
        .append($commentRevision);

      var $commentBody = $('<div class="page-comment-body">')
        .html(comment.replace(/(\r\n|\r|\n)/g, '<br>'));

      var $commentMain = $('<div class="page-comment-main">')
        .append($commentCreator)
        .append($commentBody)
        .append($commentMeta)

      $comment.addClass('page-comment');
      if (creator._id === currentUser) {
        $comment.addClass('page-comment-me');
      }
      if (revision !== revisionId) {
        $comment.addClass('page-comment-old');
      }
      $comment
        .append($commentImage)
        .append($commentMain);

      return $comment;
    }

    // get comments
    var $pageCommentList = $('.page-comments-list');
    var $pageCommentListNewer =   $('#page-comments-list-newer');
    var $pageCommentListCurrent = $('#page-comments-list-current');
    var $pageCommentListOlder =   $('#page-comments-list-older');
    var hasNewer = false;
    var hasOlder = false;
    $.get('/_api/comments.get', {page_id: pageId}, function(res) {
      if (res.ok) {
        var comments = res.comments;
        $.each(comments, function(i, comment) {
          var commentContent = createCommentHTML(comment.revision, comment.creator, comment.comment, comment.createdAt);
          if (comment.revision == revisionId) {
            $pageCommentListCurrent.append(commentContent);
          } else {
            if (Date.parse(comment.createdAt)/1000 > revisionCreatedAt) {
              $pageCommentListNewer.append(commentContent);
              hasNewer = true;
            } else {
              $pageCommentListOlder.append(commentContent);
              hasOlder = true;
            }
          }
        });
      }
    }).fail(function(data) {

    }).always(function() {
      if (!hasNewer) {
        $('.page-comments-list-toggle-newer').hide();
      }
      if (!hasOlder) {
        $pageCommentListOlder.addClass('collapse');
        $('.page-comments-list-toggle-older').hide();
      }
    });

    // post comment event
    $('#page-comment-form').on('submit', function() {
      var $button = $('#comment-form-button');
      $button.attr('disabled', 'disabled');
      $.post('/_api/comments.add', $(this).serialize(), function(data) {
        $button.prop('disabled', false);
        if (data.ok) {
          var comment = data.comment;

          $pageCommentList.prepend(createCommentHTML(comment.revision, comment.creator, comment.comment, comment.createdAt));
          $('#comment-form-comment').val('');
          $('#comment-form-message').text('');
        } else {
          $('#comment-form-message').text(data.error);
        }
      }).fail(function(data) {
        if (data.status !== 200) {
          $('#comment-form-message').text(data.statusText);
        }
      });

      return false;
    });

    */

    // Like
    var $likeButton = $('.like-button');
    var $likeCount = $('#like-count');
    $likeButton.click(function() {
      var liked = $likeButton.data('liked');
      var token = $likeButton.data('csrftoken');
      if (!liked) {
        $.post('/_api/likes.add', {_csrf: token, page_id: pageId}, function(res) {
          if (res.ok) {
            MarkLiked();
          }
        });
      } else {
        $.post('/_api/likes.remove', {_csrf: token, page_id: pageId}, function(res) {
          if (res.ok) {
            MarkUnLiked();
          }
        });
      }

      return false;
    });
    var $likerList = $("#liker-list");
    var likers = $likerList.data('likers');
    if (likers && likers.length > 0) {
      var users = crowi.findUserByIds(likers.split(','));
      if (users) {
        AddToLikers(users);
      }
    }

    function AddToLikers (users) {
      $.each(users, function(i, user) {
        $likerList.append(CreateUserLinkWithPicture(user));
      });
    }

    function MarkLiked()
    {
      $likeButton.addClass('active');
      $likeButton.data('liked', 1);
      $likeCount.text(parseInt($likeCount.text()) + 1);
    }

    function MarkUnLiked()
    {
      $likeButton.removeClass('active');
      $likeButton.data('liked', 0);
      $likeCount.text(parseInt($likeCount.text()) - 1);
    }

    if (!isSeen) {
      $.post('/_api/pages.seen', {page_id: pageId}, function(res) {
        // ignore unless response has error
        if (res.ok && res.seenUser) {
          $('#content-main').data('page-is-seen', 1);
        }
      });
    }

    function CreateUserLinkWithPicture (user) {
      var $userHtml = $('<a>');
      $userHtml.data('user-id', user._id);
      $userHtml.attr('href', '/user/' + user.username);
      $userHtml.attr('title', user.name);

      var $userPicture = $('<img class="picture picture-xs picture-rounded">');
      $userPicture.attr('alt', user.name);
      $userPicture.attr('src',  Crowi.userPicture(user));

      $userHtml.append($userPicture);
      return $userHtml;
    }

    // presentation
    var presentaionInitialized = false
      , $b = $('body');

    $(document).on('click', '.toggle-presentation', function(e) {
      var $a = $(this);

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

    //
    var me = $('body').data('me');
    var socket = io();
    socket.on('page edited', function (data) {
      if (data.user._id != me
        && data.page.path == pagePath) {
        $('#notifPageEdited').show();
        $('#notifPageEdited .edited-user').html(data.user.name);
      }
    });
  } // end if pageId

  // hash handling
  if (isSavedStatesOfTabChanges) {
    $('a[data-toggle="tab"][href="#revision-history"]').on('show.bs.tab', function() {
      window.location.hash = '#revision-history';
      window.history.replaceState('', 'History', '#revision-history');
    });
    $('a[data-toggle="tab"][href="#edit-form"]').on('show.bs.tab', function() {
      window.location.hash = '#edit-form';
      window.history.replaceState('', 'Edit', '#edit-form');
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
    $('a[data-toggle="tab"][href="#edit-form"]').on('show.bs.tab', function() {
      window.history.replaceState('', 'Edit', '#edit-form');
    });
    $('a[data-toggle="tab"][href="#revision-body"]').on('show.bs.tab', function() {
      window.history.replaceState('', '',  location.href.replace(location.hash, ''));
    });
    // replace all href="#edit-form" link behaviors
    $(document).on('click', 'a[href="#edit-form"]', function() {
      window.location.replace('#edit-form');
    });
  }

  // focus to editor when 'shown.bs.tab' event fired
  $('a[href="#edit-form"]').on('shown.bs.tab', function(e) {
    Crowi.setCaretLineAndFocusToEditor();
  });
});

Crowi.getRevisionBodyContent = function() {
  return $('#revision-body-content').html();
}

Crowi.replaceRevisionBodyContent = function(html) {
  $('#revision-body-content').html(html);
}

Crowi.findHashFromUrl = function(url)
{
  var match;
  if (match = url.match(/#(.+)$/)) {
    return `#${match[1]}`;
  }

  return "";
}

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
}

Crowi.unhighlightSelectedSection = function(hash)
{
  const elem = Crowi.findSectionHeader(hash);
  if (elem != null) {
    elem.classList.remove('highlighted');
  }
}

Crowi.highlightSelectedSection = function(hash)
{
  const elem = Crowi.findSectionHeader(hash);
  if (elem != null) {
    elem.classList.add('highlighted');
  }
}

window.addEventListener('load', function(e) {
  // hash on page
  if (location.hash) {
    if (location.hash == '#edit-form') {
      $('a[data-toggle="tab"][href="#edit-form"]').tab('show');
      // focus
      Crowi.setCaretLineAndFocusToEditor();
    }
    if (location.hash == '#revision-history') {
      $('a[data-toggle="tab"][href="#revision-history"]').tab('show');
    }
  }

  if (crowi && crowi.users || crowi.users.length == 0) {
    var totalUsers = crowi.users.length;
    var $listLiker = $('.page-list-liker');
    $listLiker.each(function(i, liker) {
      var count = $(liker).data('count') || 0;
      if (count/totalUsers > 0.05) {
        $(liker).addClass('popular-page-high');
        // 5%
      } else if (count/totalUsers > 0.02) {
        $(liker).addClass('popular-page-mid');
        // 2%
      } else if (count/totalUsers > 0.005) {
        $(liker).addClass('popular-page-low');
        // 0.5%
      }
    });
    var $listSeer = $('.page-list-seer');
    $listSeer.each(function(i, seer) {
      var count = $(seer).data('count') || 0;
      if (count/totalUsers > 0.10) {
        // 10%
        $(seer).addClass('popular-page-high');
      } else if (count/totalUsers > 0.05) {
        // 5%
        $(seer).addClass('popular-page-mid');
      } else if (count/totalUsers > 0.02) {
        // 2%
        $(seer).addClass('popular-page-low');
      }
    });
  }

  Crowi.highlightSelectedSection(location.hash);
  Crowi.modifyScrollTop();
  Crowi.setCaretLineAndFocusToEditor();
});

window.addEventListener('hashchange', function(e) {
  Crowi.unhighlightSelectedSection(Crowi.findHashFromUrl(e.oldURL));
  Crowi.highlightSelectedSection(Crowi.findHashFromUrl(e.newURL));
  Crowi.modifyScrollTop();

  // hash on page
  if (location.hash) {
    if (location.hash == '#edit-form') {
      $('a[data-toggle="tab"][href="#edit-form"]').tab('show');
    }
    if (location.hash == '#revision-history') {
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
  if (target.tagName.match(inputPattern)) {
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
