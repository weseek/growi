import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

// import Modal from 'react-bootstrap/es/Modal';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

/**
 * Delete User Group Select component
 *
 * @export
 * @class GrantSelector
 * @extends {React.Component}
 */
class UserGroupDeleteModal extends React.Component {

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
      actionName: '',
      transferToUserGroupId: '',
    };

    this.state = this.initialState;

    this.xss = window.xss;

    this.onHide = this.onHide.bind(this);
    this.handleActionChange = this.handleActionChange.bind(this);
    this.handleGroupChange = this.handleGroupChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.renderPageActionSelector = this.renderPageActionSelector.bind(this);
    this.renderGroupSelector = this.renderGroupSelector.bind(this);
    this.validateForm = this.validateForm.bind(this);
  }

  onHide() {
    this.setState(this.initialState);
    this.props.onHide();
  }

  handleActionChange(e) {
    const actionName = e.target.value;
    this.setState({ actionName });
  }

  handleGroupChange(e) {
    const transferToUserGroupId = e.target.value;
    this.setState({ transferToUserGroupId });
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.onDelete({
      deleteGroupId: this.props.deleteUserGroup._id,
      actionName: this.state.actionName,
      transferToUserGroupId: this.state.transferToUserGroupId,
    });
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
        onChange={this.handleActionChange}
      >
        <option value="" disabled>{t('user_group_management.choose_action')}</option>
        {optoins}
      </select>
    );
  }

  renderGroupSelector() {
    const { t } = this.props;

    const groups = this.props.userGroups.filter((group) => {
      return group._id !== this.props.deleteUserGroup._id;
    });

    const options = groups.map((group) => {
      const dataContent = `<i class="icon icon-fw icon-organization"></i> ${this.xss.process(group.name)}`;
      return <option key={group._id} value={group._id} data-content={dataContent}>{this.xss.process(group.name)}</option>;
    });

    const defaultOptionText = groups.length === 0 ? t('user_group_management.no_groups') : t('user_group_management.select_group');

    return (
      <select
        name="transferToUserGroupId"
        className={`form-control ${this.state.actionName === this.actionForPages.transfer ? '' : 'd-none'}`}
        value={this.state.transferToUserGroupId}
        onChange={this.handleGroupChange}
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
      isValid = this.state.transferToUserGroupId !== '';
    }

    return isValid;
  }

  render() {
    const { t } = this.props;

    return (
      <Modal show={this.props.isShow} onHide={this.onHide}>
        <Modal.Header className="modal-header bg-danger" closeButton>
          <Modal.Title>
            <i className="icon icon-fire"></i> {t('user_group_management.delete_group')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <span className="font-weight-bold">{t('user_group_management.group_name')}</span> : &quot;{this.props.deleteUserGroup.name}&quot;
          </div>
          <div className="text-danger mt-5">
            {t('user_group_management.group_and_pages_not_retrievable')}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <form className="d-flex justify-content-between" onSubmit={this.handleSubmit}>
            <div className="d-flex">
              {this.renderPageActionSelector()}
              {this.renderGroupSelector()}
            </div>
            <button type="submit" value="" className="btn btn-sm btn-danger" disabled={!this.validateForm()}>
              <i className="icon icon-fire"></i> {t('Delete')}
            </button>
          </form>
        </Modal.Footer>
      </Modal>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const UserGroupDeleteModalWrapper = (props) => {
  return createSubscribedElement(UserGroupDeleteModal, props, [AppContainer]);
};

UserGroupDeleteModal.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  userGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
  deleteUserGroup: PropTypes.object,
  onDelete: PropTypes.func.isRequired,
  isShow: PropTypes.bool.isRequired,
  onShow: PropTypes.func.isRequired,
  onHide: PropTypes.func.isRequired,
};

UserGroupDeleteModal.defaultProps = {
  deleteUserGroup: {},
};

export default withTranslation()(UserGroupDeleteModalWrapper);
