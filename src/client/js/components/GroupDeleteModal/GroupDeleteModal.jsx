import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import * as toastr from 'toastr';

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

    const { t } = this.props;

    // actionName master constants
    this.actionForPages = {
      public: 'public',
      delete: 'delete',
      transfer: 'transfer',
    };

    this.availableOptions = [
      {
        id: 1, actionForPages: this.actionForPages.public, iconClass: 'icon-people', styleClass: '', label: t('user_group_management.publish_pages'),
      },
      {
        id: 2, actionForPages: this.actionForPages.delete, iconClass: 'icon-trash', styleClass: 'text-danger', label: t('user_group_management.delete_pages'),
      },
      {
        id: 3, actionForPages: this.actionForPages.transfer, iconClass: 'icon-options', styleClass: '', label: t('user_group_management.transfer_pages'),
      },
    ];

    this.initialState = {
      deleteGroupId: '',
      deleteGroupName: '',
      groups: [],
      actionName: '',
      selectedGroupId: '',
      isFetching: false,
    };

    this.state = this.initialState;

    // logger
    this.logger = require('@alias/logger')('growi:GroupDeleteModal:GroupDeleteModal');

    // retrieve xss library from window
    this.xss = window.xss;

    this.getGroupName = this.getGroupName.bind(this);
    this.changeActionHandler = this.changeActionHandler.bind(this);
    this.changeGroupHandler = this.changeGroupHandler.bind(this);
    this.renderPageActionSelector = this.renderPageActionSelector.bind(this);
    this.renderGroupSelector = this.renderGroupSelector.bind(this);
    this.validateForm = this.validateForm.bind(this);
  }

  componentDidMount() {
    // bootstrap and this jQuery opens/hides the modal.
    // let React handle it in the future.
    $('#admin-delete-user-group-modal').on('show.bs.modal', async(button) => {
      this.setState({ isFetching: true });

      const groups = await this.fetchAllGroups();

      const data = $(button.relatedTarget);
      const deleteGroupId = data.data('user-group-id');
      const deleteGroupName = data.data('user-group-name');

      this.setState({
        groups,
        deleteGroupId,
        deleteGroupName,
        isFetching: false,
      });
    });

    $('#admin-delete-user-group-modal').on('hide.bs.modal', (button) => {
      this.setState(this.initialState);
    });
  }

  getGroupName(group) {
    return this.xss.process(group.name);
  }

  async fetchAllGroups() {
    let groups = [];

    try {
      const res = await this.props.crowi.apiGet('/admin/user-groups');
      if (res.ok) {
        groups = res.userGroups;
      }
      else {
        throw new Error('Unable to fetch groups from server');
      }
    }
    catch (err) {
      this.handleError(err);
    }

    return groups;
  }

  handleError(err) {
    this.logger.error(err);
    toastr.error(err, 'Error occured', {
      closeButton: true,
      progressBar: true,
      newestOnTop: false,
      showDuration: '100',
      hideDuration: '100',
      timeOut: '3000',
    });
  }

  changeActionHandler(e) {
    const actionName = e.target.value;
    this.setState({ actionName });
  }

  changeGroupHandler(e) {
    const selectedGroupId = e.target.value;
    this.setState({ selectedGroupId });
  }

  renderPageActionSelector() {
    const { t } = this.props;

    const optoins = this.availableOptions.map((opt) => {
      const dataContent = `<i class="icon icon-fw ${opt.iconClass} ${opt.styleClass}"></i> <span class="action-name ${opt.styleClass}">${t(opt.label)}</span>`;
      return <option key={opt.id} value={opt.actionForPages} data-content={dataContent}>{t(opt.label)}</option>;
    });

    return (
      <select
        name="actionName"
        className="form-control"
        placeholder="select"
        value={this.state.actionName}
        onChange={this.changeActionHandler}
      >
        <option value="" disabled>{t('user_group_management.choose_action')}</option>
        {optoins}
      </select>
    );
  }

  renderGroupSelector() {
    const { t } = this.props;

    const groups = this.state.groups.filter((group) => {
      return group._id !== this.state.deleteGroupId;
    });

    const options = groups.map((group) => {
      const dataContent = `<i class="icon icon-fw icon-organization"></i> ${this.getGroupName(group)}`;
      return <option key={group._id} value={group._id} data-content={dataContent}>{this.getGroupName(group)}</option>;
    });

    const defaultOptionText = groups.length === 0 ? t('user_group_management.no_groups') : t('user_group_management.select_group');

    return (
      <select
        name="selectedGroupId"
        className={`form-control ${this.state.actionName === this.actionForPages.transfer ? '' : 'd-none'}`}
        value={this.state.selectedGroupId}
        onChange={this.changeGroupHandler}
      >
        <option value="" disabled>{defaultOptionText}</option>
        {options}
      </select>
    );
  }

  validateForm() {
    let isValid = true;

    if (this.state.actionName === '') {
      isValid = false;
    }
    else if (this.state.actionName === this.actionForPages.transfer) {
      isValid = this.state.selectedGroupId !== '';
    }

    return isValid;
  }

  render() {
    const { t } = this.props;

    return (
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header bg-danger">
            <button type="button" className="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <div className="modal-title">
              <i className="icon icon-fire"></i> {t('user_group_management.delete_group')}
            </div>
          </div>

          <div className="modal-body">
            <div>
              <span className="font-weight-bold">{t('user_group_management.group_name')}</span> : &quot;{this.state.deleteGroupName}&quot;
            </div>
            {this.state.isFetching
              ? (
                <div className="mt-5">
                  {t('user_group_management.is_loading_data')}
                </div>
              )
              : (
                <div className="text-danger mt-5">
                  {t('user_group_management.group_and_pages_not_retrievable')}
                </div>
              )
            }
          </div>

          {this.state.isFetching
            ? (
              null
            )
            : (
              <div className="modal-footer">
                <form action="/admin/user-group.remove" method="post" id="admin-user-groups-delete" className="d-flex justify-content-between">
                  <div className="d-flex">
                    {this.renderPageActionSelector()}
                    {this.renderGroupSelector()}
                  </div>
                  <input type="hidden" id="deleteGroupId" name="deleteGroupId" value={this.state.deleteGroupId} onChange={() => {}} />
                  <input type="hidden" name="_csrf" defaultValue={this.props.crowi.csrfToken} />
                  <button type="submit" value="" className="btn btn-sm btn-danger" disabled={!this.validateForm()}>
                    <i className="icon icon-fire"></i> {t('Delete')}
                  </button>
                </form>
              </div>
            )
          }
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
