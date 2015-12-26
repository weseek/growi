$(function() {
  // preview watch
  var originalContent = $('#form-body').val();
  var prevContent = "";
  var watchTimer = setInterval(function() {
    var content = $('#form-body').val();
    if (prevContent != content) {
      var renderer = new Crowi.renderer($('#form-body').val(), $('#preview-body'));
      renderer.render();

      prevContent = content;
    }
  }, 500);

  // tabs handle
  $('textarea#form-body').on('keydown', function(event){
    var self  = $(this)
    start = this.selectionStart,
    end   = this.selectionEnd
    val   = self.val();

    if (event.keyCode === 9) {
      // tab
      event.preventDefault();
      self.val(
        val.substring(0, start)
          + '    '
          + val.substring(end, val.length)
      );
      this.selectionStart = start + 4;
      this.selectionEnd   = start + 4;
    } else if (event.keyCode === 27) {
      // escape
      self.blur();
    }
  });

  var unbindInlineAttachment = function($form) {
    $form.unbind('.inlineattach');
  };
  var bindInlineAttachment = function($form, attachmentOption) {
    var $this = $form;
    var editor = createEditorInstance($form);
    var inlineattach = new inlineAttachment(attachmentOption, editor);
    $form.bind({
      'paste.inlineattach': function(e) {
        inlineattach.onPaste(e.originalEvent);
      },
      'drop.inlineattach': function(e) {
        e.stopPropagation();
        e.preventDefault();
        inlineattach.onDrop(e.originalEvent);
      },
      'dragenter.inlineattach dragover.inlineattach': function(e) {
        e.stopPropagation();
        e.preventDefault();
      }
    });
  };
  var createEditorInstance = function($form) {
    var $this = $form;

    return {
      getValue: function() {
        return $this.val();
      },
      insertValue: function(val) {
        inlineAttachment.util.insertTextAtCursor($this[0], val);
      },
      setValue: function(val) {
        $this.val(val);
      }
    };
  };

  var $inputForm = $('textarea#form-body');
  if ($inputForm.length > 0) {
    var pageId = $('#content-main').data('page-id') || 0;
    var attachmentOption = {
      uploadUrl: '/_api/attachment/page/' + pageId,
      extraParams: {
        path: location.pathname
      },
      progressText: '(Uploading file...)',
      urlText: "\n![file]({filename})\n"
    };

    attachmentOption.onFileUploadResponse = function(res) {
      var result = JSON.parse(res.response);

      if (result.status && result.pageCreated) {
        var page = result.page,
            pageId = page._id;

        $('#content-main').data('page-id', page._id);
        $('#page-form [name="pageForm[currentRevision]"]').val(page.revision)

        unbindInlineAttachment($inputForm);

        attachmentOption.uploadUrl = '/_api/attachment/page/' + pageId,
        bindInlineAttachment($inputForm, attachmentOption);
      }
      return true;
    };

    bindInlineAttachment($inputForm, attachmentOption);
  }

  $('textarea#form-body').on('dragenter dragover', function() {
    $(this).addClass('dragover');
  });
  $('textarea#form-body').on('drop dragleave dragend', function() {
    $(this).removeClass('dragover');
  });
});
