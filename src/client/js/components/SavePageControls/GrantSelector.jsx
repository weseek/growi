import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';


import {
  FormGroup,
  UncontrolledDropdown,
  DropdownToggle, DropdownMenu, DropdownItem,

  Modal, ModalHeader, ModalBody,
} from 'reactstrap';


import AppContainer from '../../services/AppContainer';

import { createSubscribedElement } from '../UnstatedUtils';

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
        grant: 1, iconClass: 'icon-people', styleClass: '', label: 'Public',
      },
      {
        grant: 2, iconClass: 'icon-link', styleClass: 'text-info', label: 'Anyone with the link',
      },
      // { grant: 3, iconClass: '', label: 'Specified users only' },
      {
        grant: 4, iconClass: 'icon-lock', styleClass: 'text-danger', label: 'Just me',
      },
      {
        grant: 5, iconClass: 'icon-options', styleClass: '', label: 'Only inside the group', reselectLabel: 'Reselect the group',
      },
    ];

    this.state = {
      userRelatedGroups: [],
      isSelectGroupModalShown: false,
      grant: this.props.grant,
      grantGroup: null,
    };
    if (this.props.grantGroupId != null) {
      this.state.grantGroup = {
        _id: this.props.grantGroupId,
        name: this.props.grantGroupName,
      };
    }

    // retrieve xss library from window
    this.xss = window.xss;

    this.showSelectGroupModal = this.showSelectGroupModal.bind(this);
    this.hideSelectGroupModal = this.hideSelectGroupModal.bind(this);

    this.getGroupName = this.getGroupName.bind(this);

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

  getGroupName() {
    const grantGroup = this.state.grantGroup;
    return grantGroup ? this.xss.process(grantGroup.name) : '';
  }

  /**
   * Retrieve user-group-relations data from backend
   */
  retrieveUserGroupRelations() {
    this.props.appContainer.apiGet('/me/user-group-relations')
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

    this.setState({ grant, grantGroup: null });

    if (this.props.onUpdateGrant != null) {
      this.props.onUpdateGrant({ grant, grantGroupId: null, grantGroupName: null });
    }
  }

  groupListItemClickHandler(grantGroup) {
    this.setState({ grant: 5, grantGroup });

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
    const { grantGroup } = this.state;

    let dropdownToggleLabelElm = null;

    let index = 0;
    const dropdownMenuElems = this.availableGrants.map((opt) => {
      let label = opt.label;
      // rewrite label when grantGroup is selected
      if (opt.grant === 5 && grantGroup != null) {
        label = opt.reselectLabel;
      }
      const labelElm = <><i className={`icon icon-fw ${opt.iconClass} ${opt.styleClass}`}></i> <span className={opt.styleClass}>{t(label)}</span></>;

      // set dropdownToggleLabelElm
      if (this.state.grant === opt.grant) {
        dropdownToggleLabelElm = labelElm;
      }

      return (
        <DropdownItem key={index++} onClick={() => this.changeGrantHandler(opt.grant)}>
          {labelElm}
        </DropdownItem>
      );
    });

    // add specified group option
    if (grantGroup != null) {
      dropdownMenuElems.push(
        <DropdownItem>
          <i className="icon icon-fw icon-organization text-success"></i> <span className="group-name text-success">{this.getGroupName()}</span>
        </DropdownItem>,
      );
    }

    return (
      <FormGroup className="grant-selector mb-0">
        <UncontrolledDropdown direction="up" size="sm">
          <DropdownToggle caret disabled={this.props.disabled}>
            {dropdownToggleLabelElm}
          </DropdownToggle>
          <DropdownMenu>
            {dropdownMenuElems}
          </DropdownMenu>
        </UncontrolledDropdown>
      </FormGroup>
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
          <ListGroupItem key={group._id} header={group.name} onClick={() => { this.groupListItemClickHandler(group) }}>
            (TBD) List group members
          </ListGroupItem>
        );
      });
    };

    const content = this.state.userRelatedGroups.length === 0
      ? (
        <div>
          <h4>There is no group to which you belong.</h4>
          { this.props.appContainer.isAdmin
            && <p><a href="/admin/user-groups"><i className="icon icon-fw icon-login"></i> Manage Groups</a></p>
          }
        </div>
      )
      : (
        <ListGroup>
          {generateGroupListItems()}
        </ListGroup>
      );

    return (
      <Modal
        className="select-grant-group"
        container={this}
        isOpen={this.state.isSelectGroupModalShown}
        toggle={this.hideSelectGroupModal}
      >
        <ModalHeader toggle={this.hideSelectGroupModal}>
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

/**
 * Wrapper component for using unstated
 */
const GrantSelectorWrapper = (props) => {
  return createSubscribedElement(GrantSelector, props, [AppContainer]);
};

GrantSelector.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  disabled: PropTypes.bool,
  grant: PropTypes.number.isRequired,
  grantGroupId: PropTypes.string,
  grantGroupName: PropTypes.string,

  onUpdateGrant: PropTypes.func,
};

export default withTranslation()(GrantSelectorWrapper);
