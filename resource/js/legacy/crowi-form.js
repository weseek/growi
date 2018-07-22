const pageId = $('#content-main').data('page-id');
const pagePath= $('#content-main').data('path');

require('bootstrap-select');

// for new page
if (!pageId) {
  if (!pageId && pagePath.match(/(20\d{4}|20\d{6}|20\d{2}_\d{1,2}|20\d{2}_\d{1,2}_\d{1,2})/)) {
    $('#page-warning-modal').modal('show');
  }
}

$('a[data-toggle="tab"][href="#edit"]').on('show.bs.tab', function() {
  $('body').addClass('on-edit');
  $('body').addClass('builtin-editor');
});

$('a[data-toggle="tab"][href="#edit"]').on('hide.bs.tab', function() {
  $('body').removeClass('on-edit');
  $('body').removeClass('builtin-editor');
});
$('a[data-toggle="tab"][href="#hackmd"]').on('show.bs.tab', function() {
  $('body').addClass('on-edit');
  $('body').addClass('hackmd');
});

$('a[data-toggle="tab"][href="#hackmd"]').on('hide.bs.tab', function() {
  $('body').removeClass('on-edit');
  $('body').removeClass('hackmd');
});

/**
 * DOM ready
 */
$(function() {

  $('#page-form').on('submit', function(e) {
    // avoid message
    // isFormChanged = false;
    window.crowi.clearDraft(pagePath);
  });

});
