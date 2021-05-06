import React from 'react';
import PropTypes from 'prop-types';

import {
  UncontrolledDropdown,
  DropdownToggle, DropdownMenu, DropdownItem,

  Modal, ModalHeader, ModalBody,
} from 'reactstrap';

import { useTranslation } from '~/i18n';
import { useCurrentUser } from '~/stores/context';

import { apiGet } from '../../util/apiv1-client';

/**
 * Page grant select component
 *
 * @export
 * @class GrantSelector
 * @extends {React.Component}
 */
class GrantSelector extends React.Component {

  constructor(props) {
    super(props);

    this.availableGrants = [
      {
        grant: 1, iconClass: 'icon-people', btnStyleClass: 'outline-info', label: 'Public',
      },
      {
        grant: 2, iconClass: 'icon-link', btnStyleClass: 'outline-teal', label: 'Anyone with the link',
      },
      // { grant: 3, iconClass: '', label: 'Specified users only' },
      {
        grant: 4, iconClass: 'icon-lock', btnStyleClass: 'outline-danger', label: 'Only me',
      },
      {
        grant: 5, iconClass: 'icon-options', btnStyleClass: 'outline-purple', label: 'Only inside the group', reselectLabel: 'Reselect the group',
      },
    ];

    this.state = {
      userRelatedGroups: [],
      isSelectGroupModalShown: false,
    };

    this.showSelectGroupModal = this.showSelectGroupModal.bind(this);
    this.hideSelectGroupModal = this.hideSelectGroupModal.bind(this);

    this.changeGrantHandler = this.changeGrantHandler.bind(this);
    this.groupListItemClickHandler = this.groupListItemClickHandler.bind(this);
  }

  showSelectGroupModal() {
    this.retrieveUserGroupRelations();
    this.setState({ isSelectGroupModalShown: true });
  }

  hideSelectGroupModal() {
    this.setState({ isSelectGroupModalShown: false });
  }

  /**
   * Retrieve user-group-relations data from backend
   */
  retrieveUserGroupRelations() {
    apiGet('/me/user-group-relations')
      .then((res) => {
        return res.userGroupRelations;
      })
      .then((userGroupRelations) => {
        const userRelatedGroups = userGroupRelations.map((relation) => {
          return relation.relatedGroup;
        });
        this.setState({ userRelatedGroups });
      });
  }

  /**
   * change event handler for grant selector
   */
  changeGrantHandler(grant) {
    // select group
    if (grant === 5) {
      this.showSelectGroupModal();
      return;
    }

    if (this.props.onUpdateGrant != null) {
      this.props.onUpdateGrant({ grant, grantGroupId: null, grantGroupName: null });
    }
  }

  groupListItemClickHandler(grantGroup) {
    if (this.props.onUpdateGrant != null) {
      this.props.onUpdateGrant({ grant: 5, grantGroupId: grantGroup._id, grantGroupName: grantGroup.name });
    }

    // hide modal
    this.hideSelectGroupModal();
  }

  /**
   * Render grant selector DOM.
   * @returns
   * @memberof GrantSelector
   */
  renderGrantSelector() {
    const { t } = this.props;
    const { grant: currentGrant, grantGroupId } = this.props;

    let dropdownToggleBtnColor = null;
    let dropdownToggleLabelElm = null;

    const dropdownMenuElems = this.availableGrants.map((opt) => {
      const label = (opt.grant === 5 && grantGroupId != null)
        ? opt.reselectLabel // when grantGroup is selected
        : opt.label;

      const labelElm = (
        <span>
          <i className={`icon icon-fw ${opt.iconClass}`}></i>
          <span className="label">{t(label)}</span>
        </span>
      );

      // set dropdownToggleBtnColor, dropdownToggleLabelElm
      if (opt.grant === 1 || opt.grant === currentGrant) {
        dropdownToggleBtnColor = opt.btnStyleClass;
        dropdownToggleLabelElm = labelElm;
      }

      return <DropdownItem key={opt.grant} onClick={() => this.changeGrantHandler(opt.grant)}>{labelElm}</DropdownItem>;
    });

    // add specified group option
    if (grantGroupId != null) {
      const labelElm = (
        <span>
          <i className="icon icon-fw icon-organization"></i>
          <span className="label">{this.props.grantGroupName}</span>
        </span>
      );

      // set dropdownToggleLabelElm
      dropdownToggleLabelElm = labelElm;

      dropdownMenuElems.push(<DropdownItem key="groupSelected">{labelElm}</DropdownItem>);
    }

    return (
      <div className="form-group grw-grant-selector mb-0">
        <UncontrolledDropdown direction="up">
          <DropdownToggle color={dropdownToggleBtnColor} caret className="d-flex justify-content-between align-items-center" disabled={this.props.disabled}>
            {dropdownToggleLabelElm}
          </DropdownToggle>
          <DropdownMenu>
            {dropdownMenuElems}
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    );
  }

  /**
   * Render select grantgroup modal.
   *
   * @returns
   * @memberof GrantSelector
   */
  renderSelectGroupModal() {
    const generateGroupListItems = () => {
      return this.state.userRelatedGroups.map((group) => {
        return (
          <button key={group._id} type="button" className="list-group-item list-group-item-action" onClick={() => { this.groupListItemClickHandler(group) }}>
            <h5>{group.name}</h5>
            <div className="small">(TBD) List group members</div>
          </button>
        );
      });
    };

    const content = this.state.userRelatedGroups.length === 0
      ? (
        <div>
          <h4>There is no group to which you belong.</h4>
          { this.props.isAdmin
            && <p><a href="/admin/user-groups"><i className="icon icon-fw icon-login"></i> Manage Groups</a></p>
          }
        </div>
      )
      : (
        <div className="list-group">
          {generateGroupListItems()}
        </div>
      );

    return (
      <Modal
        className="select-grant-group"
        isOpen={this.state.isSelectGroupModalShown}
        toggle={this.hideSelectGroupModal}
      >
        <ModalHeader tag="h4" toggle={this.hideSelectGroupModal} className="bg-purple text-light">
          Select a Group
        </ModalHeader>
        <ModalBody>
          {content}
        </ModalBody>
      </Modal>
    );
  }

  render() {
    return (
      <React.Fragment>
        { this.renderGrantSelector() }
        { !this.props.disabled && this.renderSelectGroupModal() }
      </React.Fragment>
    );
  }

}

GrantSelector.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  isAdmin: PropTypes.bool.isRequired,

  disabled: PropTypes.bool,
  grant: PropTypes.number.isRequired,
  grantGroupId: PropTypes.string,
  grantGroupName: PropTypes.string,

  onUpdateGrant: PropTypes.func,
};

const GrantSelectorWrapper = (props) => {
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();

  return <GrantSelector {...props} t={t} isAdmin={currentUser?.admin} />;
};

export default GrantSelectorWrapper;
