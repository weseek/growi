import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import FormGroup from 'react-bootstrap/es/FormGroup';
import FormControl from 'react-bootstrap/es/FormControl';

/**
 * Delete User Group Select component
 *
 * @export
 * @class GrantSelector
 * @extends {React.Component}
 */
class GroupDeleteModal extends React.Component {

  constructor(props) {
    super(props);

    this.actionForPages = {
      public: 'public',
      delete: 'delete',
      transfer: 'transfer',
    };

    this.availableOptions = [
      {
        id: 1, actionForPages: this.actionForPages.public, iconClass: 'icon-people', styleClass: '', label: 'Publish all private pages',
      },
      {
        id: 2, actionForPages: this.actionForPages.delete, iconClass: 'icon-trash', styleClass: 'text-danger', label: 'Delete all private pages',
      },
      {
        id: 3, actionForPages: this.actionForPages.transfer, iconClass: 'icon-options', styleClass: '', label: 'Transfer ownership to another group',
      },
    ];

    this.state = {
      deleteGroupId: '',
      deleteGroupName: '',
      groups: [],
      actionForPages: this.actionForPages.public,
      selectedGroupId: '',
    };

    // retrieve xss library from window
    this.xss = window.xss;

    this.getGroupName = this.getGroupName.bind(this);
    this.changeActionHandler = this.changeActionHandler.bind(this);
    this.changeGroupHandler = this.changeGroupHandler.bind(this);
    this.renderPageActionSelector = this.renderPageActionSelector.bind(this);
    this.renderGroupSelector = this.renderGroupSelector.bind(this);
    this.disableSubmit = this.disableSubmit.bind(this);
  }

  componentDidMount() {
    this.retrieveUserGroupRelations();

    $('#admin-delete-user-group-modal').on('show.bs.modal', (button) => {
      const data = $(button.relatedTarget);
      const deleteGroupId = data.data('user-group-id');
      const deleteGroupName = data.data('user-group-name');

      this.setState({ deleteGroupId, deleteGroupName });
    });
  }

  getGroupName(group) {
    return this.xss.process(group.name);
  }

  async retrieveUserGroupRelations() {
    const res = await this.props.crowi.apiGet('/admin/user-groups');
    if (res.ok) {
      this.setState({ groups: res.userGroups });
    }
  }

  changeActionHandler(e) {
    const actionForPages = e.target.value;
    this.setState({ actionForPages });
  }

  changeGroupHandler(e) {
    const selectedGroupId = e.target.value;
    this.setState({ selectedGroupId });
  }

  renderPageActionSelector() {
    const { t } = this.props;

    const optoins = this.availableOptions.map((opt) => {
      const dataContent = `<i class="icon icon-fw ${opt.iconClass} ${opt.styleClass}"></i> <span class="${opt.styleClass}">${t(opt.label)}</span>`;
      return <option key={opt.id} value={opt.actionForPages} data-content={dataContent}>{t(opt.label)}</option>;
    });

    const bsClassName = 'form-control-dummy'; // set form-control* to shrink width
    return (
      <FormGroup className="grant-selector m-b-0">
        <FormControl
          name="actionForPages"
          componentClass="select"
          placeholder="select"
          defaultValue={this.actionForPages.public}
          bsClass={bsClassName}
          className="btn-group-sm selectpicker"
          onChange={this.changeActionHandler}
        >
          {optoins}
        </FormControl>
      </FormGroup>
    );
  }

  renderGroupSelector() {
    const options = this.state.groups.map((group) => {
      if (group._id !== this.state.deleteGroupId) {
        const dataContent = `<i class="icon icon-fw icon-organization"></i> ${this.getGroupName(group)}`;
        return <option key={group._id} value={group._id} data-content={dataContent}>{this.getGroupName(group)}</option>;
      }

      return;
    });

    return (
      <select
        name="selectedGroupId"
        className={this.state.actionForPages === this.actionForPages.transfer ? '' : 'd-none'}
        value={this.state.selectedGroupId}
        onChange={this.changeGroupHandler}
      >
        <option value="" disabled>{this.state.groups.length === 0 ? 'No groups to select' : 'Choose a group'}</option>
        {options}
      </select>
    );
  }

  disableSubmit() {
    if (this.state.actionForPages === this.actionForPages.transfer) {
      return this.state.selectedGroupId === '';
    }

    return false;
  }

  render() {
    return (
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header bg-danger">
            <button type="button" className="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <div className="modal-title">
              <i className="icon icon-fire"></i> グループの削除
            </div>
          </div>

          <div className="modal-body">
            <dl>
              <dt>グループ名</dt>
              <dd>{this.state.deleteGroupName}</dd>
            </dl>
            <span className="text-danger">
              グループ及び限定公開のページの削除を行うと元に戻すことはできませんのでご注意ください。
            </span>
          </div>
          <div className="modal-footer">
            <form action="/admin/user-group.remove" method="post" id="admin-user-groups-delete" className="d-flex justify-content-between">
              <div className="d-flex">
                {this.renderPageActionSelector()}
                {this.renderGroupSelector()}
              </div>
              <input type="hidden" id="deleteGroupId" name="deleteGroupId" value={this.state.deleteGroupId} onChange={() => {}} />
              <input type="hidden" name="_csrf" defaultValue={this.props.crowi.csrfToken} />
              <button type="submit" value="" className="btn btn-sm btn-danger" disabled={this.disableSubmit()}>
                <i className="icon icon-fire"></i> 削除
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

}

GroupDeleteModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  crowi: PropTypes.object.isRequired,
};

export default withTranslation()(GroupDeleteModal);
