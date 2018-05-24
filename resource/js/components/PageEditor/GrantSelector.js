import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import FormGroup from 'react-bootstrap/es/FormGroup';
import FormControl from 'react-bootstrap/es/FormControl';
// import ControlLabel from 'react-bootstrap/es/ControlLabel';
// import Button from 'react-bootstrap/es/Button';

// import Modal from 'react-bootstrap/es/Modal';

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

    this.state = {
      pageGrant: this.props.pageGrant,
      isGroupModalShown: false,
    };

    this.availableGrants = [1, 2, /*3, */4, 5];

    this.availableGrantLabels = {
      1: 'Public',
      2: 'Anyone with the link',
      // 3:'Specified users only',
      4: 'Just me',
      5: 'Only inside the group',
    };

    this.onChangeGrant = this.onChangeGrant.bind(this);
  }

  // Init component when the component did mount.
  componentDidMount() {
    this.init();
  }

  // Initialize the component.
  init() {
    this.grantSelectorInputEl.value = this.state.pageGrant.grant;
  }

  /**
   * On change event handler for pagegrant.
   * @param {any} grant page grant
   * @memberof GrantSelector
   */
  onChangeGrant(grant) {
    const newValue = this.grantSelectorInputEl.value;
    const newGrant = Object.assign(this.state.pageGrant, {grant: newValue});
    this.setState({ pageGrant: newGrant });

    // dispatch event
    this.dispatchOnChange();
  }

  // (TBD)
  // /**
  //  * On click event handler for grant usergroup.
  //  *
  //  * @memberof GrantSelector
  //  */
  // onClickGrantGroup() {
  //   const newValue = this.groupSelectorInputEl.value;
  //   const newGrant = Object.assign(this.state.pageGrant, { grantGroup: newValue });
  //   this.setState({ pageGrant: newGrant });

  //   // dispatch event
  //   this.dispatchOnChange();
  //   // close group select modal
  //   if (this.state.isModalShown) {
  //     this.setState({ isGroupModalShown: false });
  //   }
  // }

  /**
   * dispatch onChange event
   * @memberof GrantSelector
   */
  dispatchOnChange() {
    if (this.props.onChange != null) {
      this.props.onChange(this.state.pageGrant);
    }
  }

  /**
   * Render grant selector DOM.
   * @returns
   * @memberof GrantSelector
   */
  renderGrantSelector() {
    const { t } = this.props;
    const grantElems = this.availableGrants.map((grant) => {
      return <option key={grant} value={grant}>{t(this.availableGrantLabels[grant])}</option>;
    });

    const bsClassName = 'form-control-dummy'; // set form-control* to shrink width

    return (
      <FormGroup controlId="formControlsSelect" className="m-b-0">
        <FormControl componentClass="select" placeholder="select" defaultValue={this.state.pageGrant.grant} bsClass={bsClassName} className="btn-group-sm selectpicker"
          onChange={this.onChangeGrant}
          inputRef={ el => this.grantSelectorInputEl=el }>

          {grantElems}

        </FormControl>
      </FormGroup>
    );
  }

  // (TBD)
  // /**
  //  * Render select grantgroup modal.
  //  *
  //  * @returns
  //  * @memberof GrantSelector
  //  */
  // renderSelectGroupModal() {
  //   // const userRelatedGroups = this.props.userRelatedGroups;
  //   const groupList = this.userRelatedGroups.map((group) => {
  //     return <li>
  //         <Button onClick={this.onClickGrantGroup(group)} bsClass="btn btn-sm btn-primary">{group.name}</Button>
  //       </li>;
  //   });
  //   return (
  //     <Modal show={this.props.isGroupModalShown} className="select-grant-group">
  //       <Modal.Header closeButton>
  //         <Modal.Title>
  //           Select a Group
  //         </Modal.Title>
  //       </Modal.Header>
  //       <Modal.Body>

  //         <ul className="list-inline">
  //           {groupList}
  //         </ul>
  //       </Modal.Body>
  //     </Modal>
  //   );
  // }

  render() {
    return <div className="m-r-5">{this.renderGrantSelector()}</div>;
  }
}

export class PageGrant {
  constructor(props) {
    this.grant = '';
    this.grantGroup = null;

    Object.assign(this, props);
  }
}

export class UserGroup {
  constructor(props) {
    this.userGroupId = '';
    this.userGroup;

    Object.assign(this, props);
  }
}

GrantSelector.propTypes = {
  t: PropTypes.func.isRequired,               // i18next
  crowi: PropTypes.object.isRequired,
  isGroupModalShown: PropTypes.bool,
  userRelatedGroups: PropTypes.object,
  pageGrant: PropTypes.instanceOf(PageGrant),
  onChange: PropTypes.func,
};

export default translate()(GrantSelector);
