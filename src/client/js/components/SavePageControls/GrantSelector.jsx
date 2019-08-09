import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import FormGroup from 'react-bootstrap/es/FormGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import ListGroup from 'react-bootstrap/es/ListGroup';
import ListGroupItem from 'react-bootstrap/es/ListGroupItem';
import Modal from 'react-bootstrap/es/Modal';

import AppContainer from '../../services/AppContainer';

import { createSubscribedElement } from '../UnstatedUtils';

const SPECIFIED_GROUP_VALUE = 'specifiedGroup';

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
        grant: 5, iconClass: 'icon-options', styleClass: '', label: 'Only inside the group',
      }, // appeared only one of these 'grant: 5'
      {
        grant: 5, iconClass: 'icon-options', styleClass: '', label: 'Reselect the group',
      }, // appeared only one of these 'grant: 5'
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

  componentDidUpdate(prevProps, prevState) {
    /*
     * set SPECIFIED_GROUP_VALUE to grant selector
     *  cz: bootstrap-select input element has the defferent state to React component
     */
    if (this.state.grantGroup != null) {
      this.grantSelectorInputEl.value = SPECIFIED_GROUP_VALUE;
    }

    // refresh bootstrap-select
    // see https://silviomoreto.github.io/bootstrap-select/methods/#selectpickerrefresh
    $('.grant-selector .selectpicker').selectpicker('refresh');
    // // DIRTY HACK -- 2018.05.25 Yuki Takei
    // set group name to the bootstrap-select options
    //  cz: .selectpicker('refresh') doesn't replace data-content
    $('.grant-selector .group-name').text(this.getGroupName());

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
  changeGrantHandler() {
    const grant = +this.grantSelectorInputEl.value;

    // select group
    if (grant === 5) {
      this.showSelectGroupModal();
      /*
       * reset grant selector to state
       */
      this.grantSelectorInputEl.value = this.state.grant;
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

    let index = 0;
    let selectedValue = this.state.grant;
    const grantElems = this.availableGrants.map((opt) => {
      const dataContent = `<i class="icon icon-fw ${opt.iconClass} ${opt.styleClass}"></i> <span class="${opt.styleClass}">${t(opt.label)}</span>`;
      return <option key={index++} value={opt.grant} data-content={dataContent}>{t(opt.label)}</option>;
    });

    const grantGroup = this.state.grantGroup;
    if (grantGroup != null) {
      selectedValue = SPECIFIED_GROUP_VALUE;
      // DIRTY HACK -- 2018.05.25 Yuki Takei
      // remove 'Only inside the group' item
      //  cz: .selectpicker('refresh') doesn't replace data-content
      grantElems.splice(3, 1);
    }
    else {
      // DIRTY HACK -- 2018.05.25 Yuki Takei
      // remove 'Reselect the group' item
      //  cz: .selectpicker('refresh') doesn't replace data-content
      grantElems.splice(4, 1);
    }

    /*
     * react-bootstrap couldn't be rendered only with React feature.
     * see also 'componentDidUpdate'
     */

    // add specified group option
    grantElems.push(
      <option
        key="specifiedGroupKey"
        value={SPECIFIED_GROUP_VALUE}
        style={{ display: grantGroup ? 'inherit' : 'none' }}
        data-content={`<i class="icon icon-fw icon-organization text-success"></i> <span class="group-name text-success">${this.getGroupName()}</span>`}
      >
        {this.getGroupName()}
      </option>,
    );

    const bsClassName = 'form-control-dummy'; // set form-control* to shrink width
    return (
      <FormGroup className="grant-selector m-b-0">
        <FormControl
          disabled={this.props.disabled}
          componentClass="select"
          placeholder="select"
          defaultValue={selectedValue}
          bsClass={bsClassName}
          className="btn-group-sm selectpicker"
          onChange={this.changeGrantHandler}
          inputRef={(el) => { this.grantSelectorInputEl = el }}
        >

          {grantElems}

        </FormControl>
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
        show={this.state.isSelectGroupModalShown}
        onHide={this.hideSelectGroupModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>
              Select a Group
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {content}
        </Modal.Body>
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
