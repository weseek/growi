const pagePath= $('#content-main').data('path');

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
