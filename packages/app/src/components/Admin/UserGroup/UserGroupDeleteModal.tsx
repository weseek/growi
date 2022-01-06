import React from 'react';
import { TFunction } from 'i18next';
import { withTranslation } from 'react-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import AppContainer from '~/client/services/AppContainer';
import { IUserGroup } from '~/interfaces/user';
import { CustomWindow } from '~/interfaces/global';
import Xss from '~/services/xss';

/**
 * Delete User Group Select component
 *
 * @export
 * @class GrantSelector
 * @extends {React.Component}
 */
type Props = {
  t: TFunction, // i18next
  appContainer: AppContainer,

  userGroups: IUserGroup[],
  deleteUserGroup?: IUserGroup,
  onDelete?: (deleteGroupId: string, actionName: string, transferToUserGroupId: string) => Promise<void> | void,
  isShow: boolean,
  onShow?: (group: IUserGroup) => Promise<void> | void,
  onHide?: () => Promise<void> | void,
};
type State = {
  actionName: string,
  transferToUserGroupId: string,
};

class UserGroupDeleteModal extends React.Component<Props, State> {

  actionForPages: any;

  availableOptions: any;

  xss: Xss;

  state: State;

  private initialState: State;

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
        id: 1,
        actionForPages: this.actionForPages.public,
        iconClass: 'icon-people',
        styleClass: '',
        label: t('admin:user_group_management.delete_modal.publish_pages'),
      },
      {
        id: 2,
        actionForPages: this.actionForPages.delete,
        iconClass: 'icon-trash',
        styleClass: 'text-danger',
        label: t('admin:user_group_management.delete_modal.delete_pages'),
      },
      {
        id: 3,
        actionForPages: this.actionForPages.transfer,
        iconClass: 'icon-options',
        styleClass: '',
        label: t('admin:user_group_management.delete_modal.transfer_pages'),
      },
    ];

    this.initialState = {
      actionName: '',
      transferToUserGroupId: '',
    };

    this.state = this.initialState;

    this.xss = (window as CustomWindow).xss;

    this.onHide = this.onHide.bind(this);
    this.handleActionChange = this.handleActionChange.bind(this);
    this.handleGroupChange = this.handleGroupChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.renderPageActionSelector = this.renderPageActionSelector.bind(this);
    this.renderGroupSelector = this.renderGroupSelector.bind(this);
    this.validateForm = this.validateForm.bind(this);
  }

  onHide() {
    if (this.props.onHide == null) {
      return;
    }

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
    if (this.props.onDelete == null || this.props.deleteUserGroup == null) {
      return;
    }

    e.preventDefault();

    this.props.onDelete(
      this.props.deleteUserGroup._id,
      this.state.actionName,
      this.state.transferToUserGroupId,
    );
  }

  renderPageActionSelector() {
    const { t } = this.props;

    const optoins = this.availableOptions.map((opt) => {
      const dataContent = `<i class="icon icon-fw ${opt.iconClass} ${opt.styleClass}"></i> <span class="action-name ${opt.styleClass}">${opt.label}</span>`;
      return <option key={opt.id} value={opt.actionForPages} data-content={dataContent}>{opt.label}</option>;
    });

    return (
      <select
        name="actionName"
        className="form-control"
        placeholder="select"
        value={this.state.actionName}
        onChange={this.handleActionChange}
      >
        <option value="" disabled>{t('admin:user_group_management.delete_modal.dropdown_desc')}</option>
        {optoins}
      </select>
    );
  }

  renderGroupSelector() {
    const { t, deleteUserGroup } = this.props;

    if (deleteUserGroup == null) {
      return;
    }

    const groups = this.props.userGroups.filter((group) => {
      return group._id !== deleteUserGroup._id;
    });

    const options = groups.map((group) => {
      const dataContent = `<i class="icon icon-fw icon-organization"></i> ${this.xss.process(group.name)}`;
      return <option key={group._id} value={group._id} data-content={dataContent}>{this.xss.process(group.name)}</option>;
    });

    const defaultOptionText = groups.length === 0 ? t('admin:user_group_management.delete_modal.no_groups')
      : t('admin:user_group_management.delete_modal.select_group');

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
      <Modal className="modal-md" isOpen={this.props.isShow} toggle={this.props.onHide}>
        <ModalHeader tag="h4" toggle={this.props.onHide} className="bg-danger text-light">
          <i className="icon icon-fire"></i> {t('admin:user_group_management.delete_modal.header')}
        </ModalHeader>
        <ModalBody>
          <div>
            <span className="font-weight-bold">{t('admin:user_group_management.group_name')}</span> : &quot;{this.props?.deleteUserGroup?.name || ''}&quot;
          </div>
          <div className="text-danger mt-5">
            {t('admin:user_group_management.delete_modal.desc')}
          </div>
        </ModalBody>
        <ModalFooter>
          <form className="d-flex justify-content-between w-100" onSubmit={this.handleSubmit}>
            <div className="d-flex form-group mb-0">
              {this.renderPageActionSelector()}
              {this.renderGroupSelector()}
            </div>
            <button type="submit" value="" className="btn btn-sm btn-danger text-nowrap" disabled={!this.validateForm()}>
              <i className="icon icon-fire"></i> {t('Delete')}
            </button>
          </form>
        </ModalFooter>
      </Modal>
    );
  }

}

export default withTranslation()(UserGroupDeleteModal);
