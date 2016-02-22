/* jshint browser: true, jquery: true */
/* global FB, marked */
/* Author: Sotaro KARASAWA <sotarok@crocos.co.jp>
*/

var hljs = require('highlight.js');
var marked = require('marked');
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
  if (!$title.get(0)) {
    return;
  }
  var realPath = $title.text().trim();
  if (realPath.substr(-1, 1) == '/') {
    realPath = realPath.substr(0, realPath.length - 1);
  }

  var path = '';
  var pathHtml = '';
  var splittedPath = realPath.split(/\//);
  splittedPath.shift();
  splittedPath.forEach(function(sub) {
    path += '/';
    pathHtml += ' <a href="' + path + '">/</a> ';
    if (sub) {
      path += sub;
      pathHtml += '<a href="' + path + '">' + sub + '</a>';
    }
  });
  if (path.substr(-1, 1) != '/') {
    path += '/';
    pathHtml += ' <a href="' + path + '" class="last-path">/</a>';
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

Crowi.getRendererType = function() {
  return new Crowi.rendererType.markdown();
};

Crowi.rendererType = {};
Crowi.rendererType.markdown = function(){};
Crowi.rendererType.markdown.prototype = {
  render: function(contentText) {
    marked.setOptions({
      gfm: true,
      highlight: function (code, lang, callback) {
        var result, hl;
        if (lang) {
          try {
            hl = hljs.highlight(lang, code);
            result = hl.value;
          } catch (e) {
            result = code;
          }
        } else {
          //result = hljs.highlightAuto(code);
          //callback(null, result.value);
          result = code;
        }
        return callback(null, result);
      },
      tables: true,
      breaks: true,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: false,
      langPrefix: 'lang-'
    });

    var contentHtml = Crowi.unescape(contentText);
    contentHtml = this.expandImage(contentHtml);
    contentHtml = this.link(contentHtml);

    var $body = this.$revisionBody;
    // Using async version of marked
    marked(contentHtml, {}, function (err, content) {
      if (err) {
        throw err;
      }
      $body.html(content);
    });
  },
  link: function (content) {
    return content
      //.replace(/\s(https?:\/\/[\S]+)/g, ' <a href="$1">$1</a>') // リンク
      .replace(/\s<((\/[^>]+?){2,})>/g, ' <a href="$1">$1</a>') // ページ間リンク: <> でかこまれてて / から始まり、 / が2個以上
      ;
  },
  expandImage: function (content) {
    return content.replace(/\s(https?:\/\/[\S]+\.(jpg|jpeg|gif|png))/g, ' <a href="$1"><img src="$1" class="auto-expanded-image"></a>');
  }
};

Crowi.renderer = function (contentText, revisionBody) {
  var $revisionBody = revisionBody || $('#revision-body-content');

  this.contentText = contentText;
  this.$revisionBody = $revisionBody;
  this.format = 'markdown'; // とりあえず
  this.renderer = Crowi.getRendererType();
  this.renderer.$revisionBody = this.$revisionBody;
};
Crowi.renderer.prototype = {
  render: function() {
    this.renderer.render(this.contentText);
  }
};

// original: middleware.swigFilter
Crowi.userPicture = function (user) {
  if (!user) {
    return '/images/userpicture.png';
  }

  if (user.image && user.image != '/images/userpicture.png') {
    return user.image;
  } else if (user.fbId) {
    return '//graph.facebook.com/' + user.fbId + '/picture?size=square';
  } else {
    return '/images/userpicture.png';
  }
};


$(function() {
  var pageId = $('#content-main').data('page-id');
  var revisionId = $('#content-main').data('page-revision-id');
  var revisionCreatedAt = $('#content-main').data('page-revision-created');
  var currentUser = $('#content-main').data('current-user');
  var isSeen = $('#content-main').data('page-is-seen');

  Crowi.linkPath();

  $('[data-toggle="tooltip"]').tooltip();
  $('[data-tooltip-stay]').tooltip('show');

  $('.copy-link').on('click', function () {
    $(this).select();
  });

  $('#createMemo').on('shown.bs.modal', function (e) {
    $('#memoName').focus();
  });
  $('#createMemoForm').submit(function(e)
  {
    var prefix = $('[name=memoNamePrefix]', this).val();
    var name = $('[name=memoName]', this).val();
    if (name === '') {
      prefix = prefix.slice(0, -1);
    }
    top.location.href = prefix + name;

    return false;
  });

  $('#renamePage').on('shown.bs.modal', function (e) {
    $('#newPageName').focus();
  });
  $('#renamePageForm').submit(function(e) {
    var path = $('#pagePath').html();
    $.ajax({
      type: 'POST',
      url: '/_api/page_rename' + path,
      data: $('#renamePageForm').serialize(),
      dataType: 'json'
    }).done(function(data) {
      if (!data.status) {
        $('#newPageNameCheck').html('<i class="fa fa-times-circle"></i> ' + data.message);
        $('#newPageNameCheck').addClass('alert-danger');
      } else {
        $('#newPageNameCheck').removeClass('alert-danger');

        $('#newPageNameCheck').html('<img src="/images/loading_s.gif"> 移動しました。移動先にジャンプします。');

        setTimeout(function() {
          top.location.href = data.page.path + '?renamed=' + path;
        }, 1000);
      }
    });

    return false;
  });

  $('#create-portal-button').on('click', function(e) {
    $('.content-main').addClass('on-edit');
  });
  $('#portal-form-close').on('click', function(e) {
    $('.content-main').removeClass('on-edit');
  });


  if (pageId) {

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
      $button = $('#commenf-form-button');
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

    // attachment
    var $pageAttachmentList = $('.page-attachments ul');
    $.get('/_api/attachment/page/' + pageId, function(res) {
      var attachments = res.data.attachments;
      var urlBase = res.data.fileBaseUrl;
      if (attachments.length > 0) {
        $.each(attachments, function(i, file) {
          $pageAttachmentList.append(
          '<li><a href="' + urlBase + file.filePath + '">' + (file.originalName || file.fileName) + '</a> <span class="label label-default">' + file.fileFormat + '</span></li>'
          );
        })
      } else {
        $('.page-attachments').remove();
      }
    });

    // bookmark
    var $bookmarkButton = $('#bookmark-button');
    $.get('/_api/bookmarks.get', {page_id: pageId}, function(res) {
      if (res.ok) {
        if (res.bookmark) {
          MarkBookmarked();
        }
      }
    });

    $bookmarkButton.click(function() {
      var bookmarked = $bookmarkButton.data('bookmarked');
      if (!bookmarked) {
        $.post('/_api/bookmarks.add', {page_id: pageId}, function(res) {
          if (res.ok && res.bookmark) {
            MarkBookmarked();
          }
        });
      } else {
        $.post('/_api/bookmarks.remove', {page_id: pageId}, function(res) {
          if (res.ok) {
            MarkUnBookmarked();
          }
        });
      }

      return false;
    });

    function MarkBookmarked()
    {
      $('i', $bookmarkButton)
        .removeClass('fa-star-o')
        .addClass('fa-star');
      $bookmarkButton.data('bookmarked', 1);
    }

    function MarkUnBookmarked()
    {
      $('i', $bookmarkButton)
        .removeClass('fa-star')
        .addClass('fa-star-o');
      $bookmarkButton.data('bookmarked', 0);
    }

    // Like
    var $likeButton = $('#like-button');
    var $likeCount = $('#like-count');
    $likeButton.click(function() {
      var liked = $likeButton.data('liked');
      if (!liked) {
        $.post('/_api/likes.add', {page_id: pageId}, function(res) {
          if (res.ok) {
            MarkLiked();
          }
        });
      } else {
        $.post('/_api/likes.remove', {page_id: pageId}, function(res) {
          if (res.ok) {
            MarkUnLiked();
          }
        });
      }

      return false;
    });

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
        console.log(pageId, res);
        if (res.ok && res.seenUser) {
          $('#content-main').data('page-is-seen', 1);
        }
      });
    }
  }
});

