/* jshint browser: true, jquery: true */
/* Author: Sotaro KARASAWA <sotarok@crocos.co.jp>
*/

var io = require('socket.io-client');

//require('bootstrap-sass');
//require('jquery.cookie');

var Crowi = {};

if (!window) {
  window = {};
}
window.Crowi = Crowi;

Crowi.createErrorView = function(msg) {
  $('#main').prepend($('<p class="alert-message error">' + msg + '</p>'));
};

Crowi.linkPath = function(revisionPath) {
  var $revisionPath = revisionPath || '#revision-path';
  var $title = $($revisionPath);
  var pathData = $('#content-main').data('path');

  if (!pathData) {
    return ;
  }

  var realPath = pathData.trim();
  if (realPath.substr(-1, 1) == '/') {
    realPath = realPath.substr(0, realPath.length - 1);
  }

  var path = '';
  var pathHtml = '';
  var splittedPath = realPath.split(/\//);
  splittedPath.shift();
  splittedPath.forEach(function(sub) {
    path += '/';
    pathHtml += ' <a href="' + Crowi.escape(path) + '">/</a> ';
    if (sub) {
      path += sub;
      pathHtml += '<a href="' + Crowi.escape(path) + '">' + Crowi.escape(sub) + '</a>';
    }
  });
  if (path.substr(-1, 1) != '/') {
    path += '/';
    pathHtml += ' <a href="' + Crowi.escape(path) + '" class="last-path">/</a>';
  }
  $title.html(pathHtml);
};

Crowi.correctHeaders = function(contentId) {
  // h1 ~ h6 の id 名を補正する
  var $content = $(contentId || '#revision-body-content');
  var i = 0;
  $('h1,h2,h3,h4,h5,h6', $content).each(function(idx, elm) {
    var id = 'head' + i++;
    $(this).attr('id', id);
    $(this).addClass('revision-head');
    $(this).append('<span class="revision-head-link"><a href="#' + id +'"><i class="fa fa-link"></i></a></span>');
  });
};

Crowi.revisionToc = function(contentId, tocId) {
  var $content = $(contentId || '#revision-body-content');
  var $tocId = $(tocId || '#revision-toc');

  var $tocContent = $('<div id="revision-toc-content" class="revision-toc-content collapse"></div>');
  $tocId.append($tocContent);

  $('h1', $content).each(function(idx, elm) {
    var id = $(this).attr('id');
    var title = $(this).text();
    var selector = '#' + id + ' ~ h2:not(#' + id + ' ~ h1 ~ h2)';

    var $toc = $('<ul></ul>');
    var $tocLi = $('<li><a href="#' + id +'">' + title + '</a></li>');


    $tocContent.append($toc);
    $toc.append($tocLi);

    $(selector).each(function()
    {
      var id2 = $(this).attr('id');
      var title2 = $(this).text();
      var selector2 = '#' + id2 + ' ~ h3:not(#' + id2 + ' ~ h2 ~ h3)';

      var $toc2 = $('<ul></ul>');
      var $tocLi2 = $('<li><a href="#' + id2 +'">' + title2 + '</a></li>');

      $tocLi.append($toc2);
      $toc2.append($tocLi2);

      $(selector2).each(function()
      {
        var id3 = $(this).attr('id');
        var title3 = $(this).text();

        var $toc3 = $('<ul></ul>');
        var $tocLi3 = $('<li><a href="#' + id3 +'">' + title3 + '</a></li>');

        $tocLi2.append($toc3);
        $toc3.append($tocLi3);
      });
    });
  });
};


Crowi.escape = function(s) {
  s = s.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;')
    ;
  return s;
};
Crowi.unescape = function(s) {
  s = s.replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, '\'')
    .replace(/&quot;/g, '"')
    ;
  return s;
};

// original: middleware.swigFilter
Crowi.userPicture = function (user) {
  if (!user) {
    return '/images/userpicture.png';
  }

  if (user.image && user.image != '/images/userpicture.png') {
    return user.image;
  } else {
    return '/images/userpicture.png';
  }
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

  var sectionHeader = document.querySelector(hash);
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


$(function() {
  var pageId = $('#content-main').data('page-id');
  var revisionId = $('#content-main').data('page-revision-id');
  var revisionCreatedAt = $('#content-main').data('page-revision-created');
  var currentUser = $('#content-main').data('current-user');
  var isSeen = $('#content-main').data('page-is-seen');
  var pagePath= $('#content-main').data('path');

  Crowi.linkPath();

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

    var input2Width = $('#create-page-today .col-xs-10').outerWidth();
    var newWidth = input2Width
      - $('#create-page-today .page-today-prefix').outerWidth()
      - $('#create-page-today .page-today-input1').outerWidth()
      - $('#create-page-today .page-today-suffix').outerWidth()
      - 40
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
    top.location.href = prefix1 + input1 + prefix2 + input2;
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
    top.location.href = name;
    return false;
  });

  // rename
  $('#renamePage').on('shown.bs.modal', function (e) {
    $('#newPageName').focus();
  });
  $('#renamePageForm, #unportalize-form').submit(function(e) {
    $.ajax({
      type: 'POST',
      url: '/_api/pages.rename',
      data: $(this).serialize(),
      dataType: 'json'
    }).done(function(res) {
      if (!res.ok) {
        $('#newPageNameCheck').html('<i class="fa fa-times-circle"></i> ' + res.error);
        $('#newPageNameCheck').addClass('alert-danger');
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

  // list-link
  $('.page-list-link').each(function() {
    var $link = $(this);
    var text = $link.text();
    var path = $link.data('path');
    var shortPath = new String($link.data('short-path'));

    var escape = function(s) {
      return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    };
    path = Crowi.escape(path);
    var pattern = escape(Crowi.escape(shortPath)) + '(/)?$';

    $link.html(path.replace(new RegExp(pattern), '<strong>' + shortPath + '$1</strong>'));
  });

  // for list page
  $('a[data-toggle="tab"][href="#view-timeline"]').on('show.bs.tab', function() {
    var isShown = $('#view-timeline').data('shown');
    if (isShown == 0) {
      $('#view-timeline .timeline-body').each(function()
      {
        var id = $(this).attr('id');
        var contentId = '#' + id + ' > script';
        var revisionBody = '#' + id + ' .revision-body';
        var revisionPath = '#' + id + ' .revision-path';

        var markdown = Crowi.unescape($(contentId).html());
        var parsedHTML = crowiRenderer.render(markdown);
        $(revisionBody).html(parsedHTML);

        $('.template-create-button', revisionBody).on('click', function() {
          var path = $(this).data('path');
          var templateId = $(this).data('template');
          var template = $('#' + templateId).html();

          crowi.saveDraft(path, template);
          top.location.href = path;
        });
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

    // if page exists
    var $rawTextOriginal = $('#raw-text-original');
    if ($rawTextOriginal.length > 0) {
      var markdown = Crowi.unescape($('#raw-text-original').html());
      var parsedHTML = crowiRenderer.render(markdown);
      $('#revision-body-content').html(parsedHTML);


      $('.template-create-button').on('click', function() {
        var path = $(this).data('path');
        var templateId = $(this).data('template');
        var template = $('#' + templateId).html();

        crowi.saveDraft(path, template);
        top.location.href = path;
      });

      Crowi.correctHeaders('#revision-body-content');
      Crowi.revisionToc('#revision-body-content', '#revision-toc');
    }

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
        .text(commentedAt + ' ')
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
        $button.removeAttr('disabled');
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
  $('a[data-toggle="tab"][href="#revision-history"]').on('show.bs.tab', function() {
    window.history.pushState('', 'History', '#revision-history');
  });
  $('a[data-toggle="tab"][href="#edit-form"]').on('show.bs.tab', function() {
    window.history.pushState('', 'Edit', '#edit-form');
  });
  $('a[data-toggle="tab"][href="#revision-body"]').on('show.bs.tab', function() {
    window.history.pushState('', '',  location.href.replace(location.hash, ''));
  });
});

Crowi.findHashFromUrl = function(url)
{
  var match;
  if (match = url.match(/#(.+)$/)) {
    return '#' + match[1];
  }

  return "";
}

Crowi.unhighlightSelectedSection = function(hash)
{
  if (!hash || hash == "" || !hash.match(/^#head.+/)) {
    // とりあえず head* だけ (検索結果ページで副作用出た
    return true;
  }
  $(hash).removeClass('highlighted');
}

Crowi.highlightSelectedSection = function(hash)
{
  if (!hash || hash == "" || !hash.match(/^#head.+/)) {
    // とりあえず head* だけ (検索結果ページで副作用出た
    return true;
  }
  $(hash).addClass('highlighted');
}

window.addEventListener('load', function(e) {
  // hash on page
  if (location.hash) {
    if (location.hash == '#edit-form') {
      $('a[data-toggle="tab"][href="#edit-form"]').tab('show');
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
  if (location.hash == '' || location.hash.match(/^#head.+/)) {
    $('a[data-toggle="tab"][href="#revision-body"]').tab('show');
  }
});
