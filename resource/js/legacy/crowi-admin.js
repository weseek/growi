require('bootstrap-select');
require('./thirdparty-js/jQuery.style.switcher');

$(function() {
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

        $('#admin-password-reset-done-user').text(res.user.email);
        $('#admin-password-reset-done-password').text(res.newPassword);
        return ;
      }

      // fixme
      alert('Failed to reset password');
    });

    return false;
  });

  $('#admin-delete-user-group-modal').on('show.bs.modal', function(button) {
    var data = $(button.relatedTarget);
    var userGroupId = data.data('user-group-id');
    var userGroupName = data.data('user-group-name');

    $('#admin-delete-user-group-name').text(userGroupName);
    $('#admin-user-groups-delete input[name=user_group_id]').val(userGroupId);
  });

  $('form#user-group-relation-create').on('submit', function(e) {
    $.post('/admin/user-group-relation/create', $(this).serialize(), function(res) {
      $('#admin-add-user-group-relation-modal').modal('hide');
      return;
    });
  });


  $('#pictureUploadForm input[name=userGroupPicture]').on('change', function() {
    var $form = $('#pictureUploadForm');
    var fd = new FormData($form[0]);
    if ($(this).val() == '') {
      return false;
    }

    $('#pictureUploadFormProgress').html('<img src="/images/loading_s.gif"> アップロード中...');
    $.ajax($form.attr('action'), {
      type: 'post',
      processData: false,
      contentType: false,
      data: fd,
      dataType: 'json',
      success: function(data) {
        if (data.status) {
          $('#settingUserPicture').attr('src', data.url + '?time=' + (new Date()));
          $('#pictureUploadFormMessage')
            .addClass('alert alert-success')
            .html('変更しました');
        }
        else {
          $('#pictureUploadFormMessage')
            .addClass('alert alert-danger')
            .html('変更中にエラーが発生しました。');
        }
        $('#pictureUploadFormProgress').html('');
      }
    });
    return false;
  });

  // style switcher
  $('#styleOptions').styleSwitcher();
});


