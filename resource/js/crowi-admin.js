$(function() {
  var UpdatePost = {};

  $('#slackNotificationForm').on('submit', function(e) {
    $.post('/_api/admin/notification.add', $(this).serialize(), function(res) {
      if (res.ok) {
        // TODO Fix
        location.reload();
      }
    });

    return false;
  });

  $('form.admin-remove-updatepost').on('submit', function(e) {
    $.post('/_api/admin/notification.remove', $(this).serialize(), function(res) {
      if (res.ok) {
        // TODO Fix
        location.reload();
      }
    });
    return false;
  });

  $('#createdUserModal').modal('show');
});
