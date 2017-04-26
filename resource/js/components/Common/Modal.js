import React from 'react';

export default class Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modalShown: false,
    };
  }

  render() {
    if (!this.state.modalShown) {
      return '';
    }

    return (
      <div class="modal in" id="renamePage" style="display: block;">
        <div class="modal-dialog">
          <div class="modal-content">

          <form role="form" id="renamePageForm" onsubmit="return false;">

            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
              <h4 class="modal-title">Rename page</h4>
            </div>
            <div class="modal-body">
                <div class="form-group">
                  <label for="">Current page name</label><br>
                  <code>/user/sotarok/memo/2017/04/24</code>
                </div>
                <div class="form-group">
                  <label for="newPageName">New page name</label><br>
                  <div class="input-group">
                    <span class="input-group-addon">http://localhost:3000</span>
                    <input type="text" class="form-control" name="new_path" id="newPageName" value="/user/sotarok/memo/2017/04/24">
                  </div>
                </div>
                <div class="checkbox">
                   <label>
                     <input name="create_redirect" value="1" type="checkbox"> Redirect
                   </label>
                   <p class="help-block"> Redirect to new page if someone accesses <code>/user/sotarok/memo/2017/04/24</code>
                   </p>
                </div>







            </div>
            <div class="modal-footer">
              <p><small class="pull-left" id="newPageNameCheck"></small></p>
              <input type="hidden" name="_csrf" value="RCs7uFdR-4nacCnqKfREe8VIlcYLP2J8xzpU">
              <input type="hidden" name="path" value="/user/sotarok/memo/2017/04/24">
              <input type="hidden" name="page_id" value="58fd0bd74c844b8f94c2e5b3">
              <input type="hidden" name="revision_id" value="58fd126385edfb9d8a0c073a">
              <input type="submit" class="btn btn-primary" value="Rename!">
            </div>

          </form>
          </div><!-- /.modal-content -->
        </div><!-- /.modal-dialog -->
      </div>
  );
}
