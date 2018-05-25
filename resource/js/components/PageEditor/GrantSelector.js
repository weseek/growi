import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import FormGroup from 'react-bootstrap/es/FormGroup';
import FormControl from 'react-bootstrap/es/FormControl';
// import ControlLabel from 'react-bootstrap/es/ControlLabel';
import Button from 'react-bootstrap/es/Button';

import Modal from 'react-bootstrap/es/Modal';

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

    this.availableGrants = [1, 2, /*3, */4, 5];
    this.availableGrantLabels = {
      1: 'Public',
      2: 'Anyone with the link',
      // 3:'Specified users only',
      4: 'Just me',
      5: 'Only inside the group',
    };

    this.state = {
      isSelectGroupModalShown: false,
    };

    this.changeGrantHandler = this.changeGrantHandler.bind(this);
    this.hideSelectGroupModalHandler = this.hideSelectGroupModalHandler.bind(this);
  }

  // Init component when the component did mount.
  componentDidMount() {
    this.init();
  }

  // Initialize the component.
  init() {
    this.grantSelectorInputEl.value = this.props.pageGrant;
  }

  /**
   * On change event handler for pagegrant.
   * @param {any} grant page grant
   * @memberof GrantSelector
   */
  changeGrantHandler(grant) {
    const pageGrant = +this.grantSelectorInputEl.value;

    // show modal
    if (pageGrant === 5) {
      this.setState({ isSelectGroupModalShown: true });
    }
    else {
      // TODO unset pageGrantGroup
    }

    // dispatch event
    this.dispatchOnChange(pageGrant);
  }

  hideSelectGroupModalHandler() {
    this.setState({ isSelectGroupModalShown: false });
  }

  /**
   * dispatch onChange event
   * @memberof GrantSelector
   */
  dispatchOnChange(pageGrant) {
    if (this.props.onChangePageGrant != null) {
      this.props.onChangePageGrant(pageGrant);
    }
  }

  dispatchOnDeterminePageGrantGroup(pageGrantGroup) {
    if (this.props.onDeterminePageGrantGroupId != null) {
      this.props.onDeterminePageGrantGroupId(pageGrantGroup);
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

    const pageGrant = this.props.pageGrant || 1;  // default: 1

    const bsClassName = 'form-control-dummy'; // set form-control* to shrink width
    return (
      <FormGroup controlId="formControlsSelect" className="m-b-0">
        <FormControl componentClass="select" placeholder="select" defaultValue={pageGrant} bsClass={bsClassName} className="btn-group-sm selectpicker"
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
    // TODO fetch from API
    const userRelatedGroups = [
      { _id: 1, name: 'hoge' },
      { _id: 2, name: 'fuga' },
      { _id: 3, name: 'foo' },
    ];

    const groupList = userRelatedGroups.map((group) => {
      return <li key={group._id}>
          <Button onClick={this.dispatchOnDeterminePageGrantGroup(group._id)} bsClass="btn btn-sm btn-primary">{group.name}</Button>
        </li>;
    });
    return (
        <Modal className="select-grant-group"
          container={this} show={this.state.isSelectGroupModalShown} onHide={this.hideSelectGroupModalHandler}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Select a Group
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <ul className="list-inline">
              {groupList}
            </ul>
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
  pageGrantGroup: PropTypes.object,
  onChangePageGrant: PropTypes.func,
  onDeterminePageGrantGroupId: PropTypes.func,
};

export default translate()(GrantSelector);
