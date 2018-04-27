import React from 'react';
import PropTypes from 'prop-types';

import FormGroup from 'react-bootstrap/es/FormGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import ControlLabel from 'react-bootstrap/es/ControlLabel';
import Button from 'react-bootstrap/es/Button';

import Dropdown from 'react-bootstrap/es/Dropdown';
import MenuItem from 'react-bootstrap/es/MenuItem';
import Modal from 'react-bootstrap/es/Modal';

import OverlayTrigger  from 'react-bootstrap/es/OverlayTrigger';
import Tooltip from 'react-bootstrap/es/Tooltip';

export default class GrantSelector extends React.Component {

  constructor(props) {
    super(props);

    const config = this.props.crowi.getConfig();

    this.state = {
      pageGrant: this.props.pageGrant || new PageGrant(),
      isGroupModalShown: false,
    }

    this.availableGrants = {
      1:'Public',
      2:'Anyone with the linc',
      // 3:'Specified users only',
      4:'Just me',
      5:'Only inside the group',
    }
    this.onChangeGrant = this.onChangeGrant.bind(this);
  }

  componentDidMount() {
    this.init();
  }

  init() {
    this.grantSelectorInputEl.value = this.state.editorOptions.theme;
  }

  onChangeGrant(userGroup) {
    const newValue = userGroup;
    const newGrant = Object.assign(this.state.pageGrant, {grant: newValue});
    this.setState({ pageGrant: newGrant });

    // dispatch event
    this.dispatchOnChange();
  }

  onClickGrantGroup() {
    const newValue = this.groupSelectorInputEl.value;
    const newGrant = Object.assign(this.state.pageGrant, { grantGroup: newValue });
    this.setState({ pageGrant: newGrant });

    // dispatch event
    this.dispatchOnChange();
    // close group select modal
    if (this.state.isModalShown) {
      this.setState({ isGroupModalShown: false });
    }
  }

  /**
   * dispatch onChange event
   */
  dispatchOnChange() {
    if (this.props.onChange != null) {
      this.props.onChange(this.state.pageGrant);
    }
  }

  renderGrantSelector() {
    const optionElems = this.availableGrants.map((entry) => {
      return <option key={entry.key} value={entry.key}>{entry.value}</option>;
    });

    const bsClassName = 'form-control-dummy'; // set form-control* to shrink width

    return (
      <FormGroup controlId="formControlsSelect">
        <ControlLabel>Theme:</ControlLabel>
        <FormControl componentClass="select" placeholder="select" bsClass={bsClassName} className="btn-group-sm selectpicker"
            onChange={this.onChangeGrant}
            inputRef={ el => this.grantSelectorInputEl=el }>

          {optionElems}

        </FormControl>
      </FormGroup>
    )
  }

  renderConfigurationDropdown() {
    return (
      <FormGroup controlId="formControlsSelect">

        <Dropdown dropup id="configurationDropdown" className="configuration-dropdown"
            open={this.state.isCddMenuOpened} onToggle={this.onToggleConfigurationDropdown}>

          <Dropdown.Toggle bsSize="sm">
            <i className="icon-settings"></i>
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {this.renderActiveLineMenuItem()}
            {this.renderRealtimeMathJaxMenuItem()}
            {/* <MenuItem divider /> */}
          </Dropdown.Menu>

        </Dropdown>

      </FormGroup>
    )
  }

  renderActiveLineMenuItem() {
    const isActive = this.state.editorOptions.styleActiveLine;

    const iconClasses = ['text-info']
    if (isActive) {
      iconClasses.push('ti-check')
    }
    const iconClassName = iconClasses.join(' ');

    return (
      <MenuItem onClick={this.onClickStyleActiveLine}>
        <span className="icon-container"></span>
        <span className="menuitem-label">Show active line</span>
        <span className="icon-container"><i className={iconClassName}></i></span>
      </MenuItem>
    )
  }

  renderRealtimeMathJaxMenuItem() {
    if (!this.state.isMathJaxEnabled) {
      return;
    }

    const isEnabled = this.state.isMathJaxEnabled;
    const isActive = isEnabled && this.state.previewOptions.renderMathJaxInRealtime;

    const iconClasses = ['text-info']
    if (isActive) {
      iconClasses.push('ti-check')
    }
    const iconClassName = iconClasses.join(' ');

    return (
      <MenuItem onClick={this.onClickRenderMathJaxInRealtime}>
        <span className="icon-container"><img src="/images/icons/fx.svg" width="14px"></img></span>
        <span className="menuitem-label">MathJax Rendering</span>
        <i className={iconClassName}></i>
      </MenuItem>
    )
  }

  renderSelectGroupModal() {
    const userRelatedGroups = this.props.userRelatedGroups;
    const groupList = this.userRelatedGroups.map((group) => {
      return
      <li>
        <Button onClick={this.onClickGrantGroup(group)} bsClass="btn btn-sm btn-primary">{group.name}</Button>
      </li>
    });
    return (
      <Modal show={this.props.isGroupModalShown} onHide={this.props.cancel} className="select-grant-group">
        <Modal.Header closeButton>
          <Modal.Title>
            Select a Group
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <ul class="list-inline">
            {groupList}
          </ul>
        </Modal.Body>
      </Modal>
    );
  }

  render() {
    return <span>
      <span className="m-l-5">{this.renderThemeSelector()}</span>
    </span>
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
    this.userGroup

    Object.assign(this, props);
  }
}

GrantSelector.propTypes = {
  crowi: PropTypes.object.isRequired,
  userRelatedGroups: PropTypes.object,
  pageGrant: PropTypes.instanceOf(PageGrant),
  onChange: PropTypes.func,
};
