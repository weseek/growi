const pagePath= $('#content-main').data('path');

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
