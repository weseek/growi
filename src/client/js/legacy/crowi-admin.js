/* global Switchery */
/* eslint-disable no-restricted-globals */

require('./thirdparty-js/jQuery.style.switcher');

// see https://github.com/abpetkov/switchery/issues/120
// see https://github.com/abpetkov/switchery/issues/120#issuecomment-286337221
require('./thirdparty-js/switchery/switchery');
require('./thirdparty-js/switchery/switchery.css');

$(() => {
  $('#slackNotificationForm').on('submit', function(e) {
    $.post('/_api/admin/notification.add', $(this).serialize(), (res) => {
      if (res.ok) {
        // TODO Fix
        location.reload();
      }
    });

    return false;
  });

  $('form.admin-remove-updatepost').on('submit', function(e) {
    $.post('/_api/admin/notification.remove', $(this).serialize(), (res) => {
      if (res.ok) {
        // TODO Fix
        location.reload();
      }
    });
    return false;
  });

  $('#createdUserModal').modal('show');

  $('#admin-password-reset-modal').on('show.bs.modal', (button) => {
    const data = $(button.relatedTarget);
    const userId = data.data('user-id');
    const email = data.data('user-email');

    $('#admin-password-reset-user').text(email);
    $('#admin-users-reset-password input[name=user_id]').val(userId);
  });

  $('form#admin-users-reset-password').on('submit', function(e) {
    $.post('/_api/admin/users.resetPassword', $(this).serialize(), (res) => {
      if (res.ok) {
        // TODO Fix
        // location.reload();
        $('#admin-password-reset-modal').modal('hide');
        $('#admin-password-reset-modal-done').modal('show');

        $('#admin-password-reset-done-user').text(res.user.email);
        $('#admin-password-reset-done-password').text(res.newPassword);
        return;
      }

      // fixme
      alert('Failed to reset password');
    });

    return false;
  });

  $('form#user-group-relation-create').on('submit', function(e) {
    $.post('/admin/user-group-relation/create', $(this).serialize(), (res) => {
      $('#admin-add-user-group-relation-modal').modal('hide');
      return;
    });
  });


  $('#pictureUploadForm input[name=userGroupPicture]').on('change', function() {
    const $form = $('#pictureUploadForm');
    const fd = new FormData($form[0]);
    if ($(this).val() !== '') {
      return false;
    }

    $('#pictureUploadFormProgress').html('<img src="/images/loading_s.gif"> アップロード中...');
    $.ajax($form.attr('action'), {
      type: 'post',
      processData: false,
      contentType: false,
      data: fd,
      dataType: 'json',
      success(data) {
        if (data.status) {
          $('#settingUserPicture').attr('src', `${data.url}?time=${new Date()}`);
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
      },
    });
    return false;
  });

  // style switcher
  $('#styleOptions').styleSwitcher();

  // switchery
  const elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));
  elems.forEach((elem) => {
    const color = elem.dataset.color;
    const size = elem.dataset.size;
    // eslint-disable-next-line no-new
    new Switchery(elem, { color, size });
  });
});
