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

  $('#admin-password-reset-modal').on('show.bs.modal', function(button) {
    var data = $(button.relatedTarget);
    var userId = data.data('user-id');
    var email = data.data('user-email');

    $('#admin-password-reset-user').text(email);
    $('#admin-users-reset-password input[name=user_id]').val(userId);
  });

  $('form#admin-users-reset-password').on('submit', function(e) {
    $.post('/_api/admin/users.resetPassword', $(this).serialize(), function(res) {
      if (res.ok) {
        // TODO Fix
        //location.reload();
        $('#admin-password-reset-modal').modal('hide');
        $('#admin-password-reset-modal-done').modal('show');

        $("#admin-password-reset-done-user").text(res.user.email);
        $("#admin-password-reset-done-password").text(res.newPassword);
        return ;
      }

      // fixme
      alert('Failed to reset password');
    });

    return false;
  });
});
