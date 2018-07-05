import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import FormGroup from 'react-bootstrap/es/FormGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import ListGroup from 'react-bootstrap/es/ListGroup';
import ListGroupItem from 'react-bootstrap/es/ListGroupItem';
import Modal from 'react-bootstrap/es/Modal';

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
      { pageGrant: 1, iconClass: 'icon-people', styleClass: '', label: 'Public' },
      { pageGrant: 2, iconClass: 'icon-link', styleClass: 'text-info', label: 'Anyone with the link' },
      // { pageGrant: 3, iconClass: '', label: 'Specified users only' },
      { pageGrant: 4, iconClass: 'icon-lock', styleClass: 'text-danger', label: 'Just me' },
      { pageGrant: 5, iconClass: 'icon-options', styleClass: '', label: 'Only inside the group' },  // appeared only one of these 'pageGrant: 5'
      { pageGrant: 5, iconClass: 'icon-options', styleClass: '', label: 'Reselect the group' },     // appeared only one of these 'pageGrant: 5'
    ];

    this.state = {
      pageGrant: this.props.pageGrant || 1,  // default: 1
      userRelatedGroups: [],
      isSelectGroupModalShown: false,
    };
    if (this.props.pageGrantGroupId !== '') {
      this.state.pageGrantGroup = {
        _id: this.props.pageGrantGroupId,
        name: this.props.pageGrantGroupName
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
    if (this.state.pageGrantGroup != null) {
      this.grantSelectorInputEl.value = SPECIFIED_GROUP_VALUE;
    }

    // refresh bootstrap-select
    // see https://silviomoreto.github.io/bootstrap-select/methods/#selectpickerrefresh
    $('.page-grant-selector.selectpicker').selectpicker('refresh');
    //// DIRTY HACK -- 2018.05.25 Yuki Takei
    // set group name to the bootstrap-select options
    //  cz: .selectpicker('refresh') doesn't replace data-content
    $('.page-grant-selector .group-name').text(this.getGroupName());

  }

  showSelectGroupModal() {
    this.retrieveUserGroupRelations();
    this.setState({ isSelectGroupModalShown: true });
  }
  hideSelectGroupModal() {
    this.setState({ isSelectGroupModalShown: false });
  }

  getGroupName() {
    const pageGrantGroup = this.state.pageGrantGroup;
    return pageGrantGroup ? this.xss.process(pageGrantGroup.name) : '';
  }

  /**
   * Retrieve user-group-relations data from backend
   */
  retrieveUserGroupRelations() {
    this.props.crowi.apiGet('/me/user-group-relations')
      .then(res => {
        return res.userGroupRelations;
      })
      .then(userGroupRelations => {
        const userRelatedGroups = userGroupRelations.map(relation => {
          return relation.relatedGroup;
        });
        this.setState({userRelatedGroups});
      });
  }

  /**
   * change event handler for pageGrant selector
   */
  changeGrantHandler() {
    const pageGrant = +this.grantSelectorInputEl.value;

    // select group
    if (pageGrant === 5) {
      this.showSelectGroupModal();
      /*
       * reset grant selector to state
       */
      this.grantSelectorInputEl.value = this.state.pageGrant;
      return;
    }

    this.setState({ pageGrant, pageGrantGroup: null });
    // dispatch event
    this.dispatchOnChangePageGrant(pageGrant);
    this.dispatchOnDeterminePageGrantGroup(null);
  }

  groupListItemClickHandler(pageGrantGroup) {
    this.setState({ pageGrant: 5, pageGrantGroup });

    // dispatch event
    this.dispatchOnChangePageGrant(5);
    this.dispatchOnDeterminePageGrantGroup(pageGrantGroup);

    // hide modal
    this.hideSelectGroupModal();
  }

  dispatchOnChangePageGrant(pageGrant) {
    if (this.props.onChangePageGrant != null) {
      this.props.onChangePageGrant(pageGrant);
    }
  }

  dispatchOnDeterminePageGrantGroup(pageGrantGroup) {
    if (this.props.onDeterminePageGrantGroupId != null) {
      this.props.onDeterminePageGrantGroupId(pageGrantGroup ? pageGrantGroup._id : '');
    }
    if (this.props.onDeterminePageGrantGroupName != null) {
      this.props.onDeterminePageGrantGroupName(pageGrantGroup ? pageGrantGroup.name : '');
    }
  }

  /**
   * Render grant selector DOM.
   * @returns
   * @memberof GrantSelector
   */
  renderGrantSelector() {
    const { t } = this.props;

    let index = 0;
    let selectedValue = this.state.pageGrant;
    const grantElems = this.availableGrants.map((grant) => {
      const dataContent = `<i class="icon icon-fw ${grant.iconClass} ${grant.styleClass}"></i> <span class="${grant.styleClass}">${t(grant.label)}</span>`;
      return <option key={index++} value={grant.pageGrant} data-content={dataContent}>{t(grant.label)}</option>;
    });

    const pageGrantGroup = this.state.pageGrantGroup;
    if (pageGrantGroup != null) {
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
      <option ref="specifiedGroupOption" key="specifiedGroupKey" value={SPECIFIED_GROUP_VALUE} style={{ display: pageGrantGroup ? 'inherit' : 'none' }}
          data-content={`<i class="icon icon-fw icon-organization text-success"></i> <span class="group-name text-success">${this.getGroupName()}</span>`}>
        {this.getGroupName()}
      </option>
    );

    const bsClassName = 'form-control-dummy'; // set form-control* to shrink width
    return (
      <FormGroup className="m-b-0">
        <FormControl componentClass="select" placeholder="select" defaultValue={selectedValue} bsClass={bsClassName} className="btn-group-sm page-grant-selector selectpicker"
          onChange={this.changeGrantHandler}
          inputRef={ el => this.grantSelectorInputEl=el }>

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
        return <ListGroupItem key={group._id} header={group.name} onClick={() => { this.groupListItemClickHandler(group) }}>
            (TBD) List group members
          </ListGroupItem>;
      });
    };

    let content = this.state.userRelatedGroups.length === 0
      ? <div>
          <h4>There is no group to which you belong.</h4>
          { this.props.crowi.isAdmin &&
            <p><a href="/admin/user-groups"><i className="icon icon-fw icon-login"></i> Manage Groups</a></p>
          }
        </div>
      : <ListGroup>
        {generateGroupListItems()}
      </ListGroup>;

    return (
        <Modal className="select-grant-group"
          container={this} show={this.state.isSelectGroupModalShown} onHide={this.hideSelectGroupModal}
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
    return <React.Fragment>
      <div className="m-r-5">{this.renderGrantSelector()}</div>
      {this.renderSelectGroupModal()}
    </React.Fragment>;
  }
}

GrantSelector.propTypes = {
  t: PropTypes.func.isRequired,               // i18next
  crowi: PropTypes.object.isRequired,
  isGroupModalShown: PropTypes.bool,
  pageGrant: PropTypes.number,
  pageGrantGroupId: PropTypes.string,
  pageGrantGroupName: PropTypes.string,
  onChangePageGrant: PropTypes.func,
  onDeterminePageGrantGroupId: PropTypes.func,
  onDeterminePageGrantGroupName: PropTypes.func,
};

export default translate()(GrantSelector);
