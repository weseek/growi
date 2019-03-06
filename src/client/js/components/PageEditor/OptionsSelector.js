import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import FormGroup from 'react-bootstrap/es/FormGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import ControlLabel from 'react-bootstrap/es/ControlLabel';

import Dropdown from 'react-bootstrap/es/Dropdown';
import MenuItem from 'react-bootstrap/es/MenuItem';

class OptionsSelector extends React.Component {
  constructor(props) {
    super(props);

    const config = this.props.crowi.getConfig();
    const isMathJaxEnabled = !!config.env.MATHJAX;

    this.state = {
      editorOptions: this.props.editorOptions || new EditorOptions(),
      previewOptions: this.props.previewOptions || new PreviewOptions(),
      isCddMenuOpened: false,
      isMathJaxEnabled,
    };

    this.availableThemes = [
      'eclipse', 'elegant', 'neo', 'mdn-like', 'material', 'dracula', 'monokai', 'twilight',
    ];
    this.keymapModes = {
      default: 'Default',
      vim: 'Vim',
      emacs: 'Emacs',
      sublime: 'Sublime Text',
    };

    this.onChangeTheme = this.onChangeTheme.bind(this);
    this.onChangeKeymapMode = this.onChangeKeymapMode.bind(this);
    this.onClickStyleActiveLine = this.onClickStyleActiveLine.bind(this);
    this.onClickRenderMathJaxInRealtime = this.onClickRenderMathJaxInRealtime.bind(this);
    this.onToggleConfigurationDropdown = this.onToggleConfigurationDropdown.bind(this);
  }

  componentDidMount() {
    this.init();
  }

  init() {
    this.themeSelectorInputEl.value = this.state.editorOptions.theme;
    this.keymapModeSelectorInputEl.value = this.state.editorOptions.keymapMode;
  }

  onChangeTheme() {
    const newValue = this.themeSelectorInputEl.value;
    const newOpts = Object.assign(this.state.editorOptions, { theme: newValue });
    this.setState({ editorOptions: newOpts });

    // dispatch event
    this.dispatchOnChange();
  }

  onChangeKeymapMode() {
    const newValue = this.keymapModeSelectorInputEl.value;
    const newOpts = Object.assign(this.state.editorOptions, { keymapMode: newValue });
    this.setState({ editorOptions: newOpts });

    // dispatch event
    this.dispatchOnChange();
  }

  onClickStyleActiveLine(event) {
    // keep dropdown opened
    this._cddForceOpen = true;

    const newValue = !this.state.editorOptions.styleActiveLine;
    const newOpts = Object.assign(this.state.editorOptions, { styleActiveLine: newValue });
    this.setState({ editorOptions: newOpts });

    // dispatch event
    this.dispatchOnChange();
  }

  onClickRenderMathJaxInRealtime(event) {
    // keep dropdown opened
    this._cddForceOpen = true;

    const newValue = !this.state.previewOptions.renderMathJaxInRealtime;
    const newOpts = Object.assign(this.state.previewOptions, { renderMathJaxInRealtime: newValue });
    this.setState({ previewOptions: newOpts });

    // dispatch event
    this.dispatchOnChange();
  }

  /*
   * see: https://github.com/react-bootstrap/react-bootstrap/issues/1490#issuecomment-207445759
   */
  onToggleConfigurationDropdown(newValue) {
    if (this._cddForceOpen) {
      this.setState({ isCddMenuOpened: true });
      this._cddForceOpen = false;
    }
    else {
      this.setState({ isCddMenuOpened: newValue });
    }
  }

  /**
   * dispatch onChange event
   */
  dispatchOnChange() {
    this.props.onChange(this.state.editorOptions, this.state.previewOptions);
  }

  renderThemeSelector() {
    const optionElems = this.availableThemes.map((theme) => {
      return <option key={theme} value={theme}>{theme}</option>;
    });

    const bsClassName = 'form-control-dummy'; // set form-control* to shrink width

    return (
      <FormGroup controlId="formControlsSelect" className="my-0">
        <ControlLabel>Theme:</ControlLabel>
        <FormControl
          componentClass="select"
          placeholder="select"
          bsClass={bsClassName}
          className="btn-group-sm selectpicker"
          onChange={this.onChangeTheme}
          inputRef={(el) => { return this.themeSelectorInputEl = el }}
        >

          {optionElems}

        </FormControl>
      </FormGroup>
    );
  }

  renderKeymapModeSelector() {
    const optionElems = [];
    for (const mode in this.keymapModes) {
      const label = this.keymapModes[mode];
      const dataContent = (mode === 'default')
        ? label
        : `<img src='/images/icons/${mode}.png' width='16px' class='m-r-5'></img> ${label}`;
      optionElems.push(
        <option key={mode} value={mode} data-content={dataContent}>{label}</option>,
      );
    }

    const bsClassName = 'form-control-dummy'; // set form-control* to shrink width

    return (
      <FormGroup controlId="formControlsSelect" className="my-0">
        <ControlLabel>Keymap:</ControlLabel>
        <FormControl
          componentClass="select"
          placeholder="select"
          bsClass={bsClassName}
          className="btn-group-sm selectpicker"
          onChange={this.onChangeKeymapMode}
          inputRef={(el) => { return this.keymapModeSelectorInputEl = el }}
        >

          {optionElems}

        </FormControl>
      </FormGroup>
    );
  }

  renderConfigurationDropdown() {
    return (
      <FormGroup controlId="formControlsSelect" className="my-0">

        <Dropdown
          dropup
          id="configurationDropdown"
          className="configuration-dropdown"
          open={this.state.isCddMenuOpened}
          onToggle={this.onToggleConfigurationDropdown}
        >

          <Dropdown.Toggle bsSize="sm">
            <i className="icon-settings" />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {this.renderActiveLineMenuItem()}
            {this.renderRealtimeMathJaxMenuItem()}
            {/* <MenuItem divider /> */}
          </Dropdown.Menu>

        </Dropdown>

      </FormGroup>
    );
  }

  renderActiveLineMenuItem() {
    const { t } = this.props;
    const isActive = this.state.editorOptions.styleActiveLine;

    const iconClasses = ['text-info'];
    if (isActive) {
      iconClasses.push('ti-check');
    }
    const iconClassName = iconClasses.join(' ');

    return (
      <MenuItem onClick={this.onClickStyleActiveLine}>
        <span className="icon-container" />
        <span className="menuitem-label">{ t('page_edit.Show active line') }</span>
        <span className="icon-container"><i className={iconClassName} /></span>
      </MenuItem>
    );
  }

  renderRealtimeMathJaxMenuItem() {
    if (!this.state.isMathJaxEnabled) {
      return;
    }

    const isEnabled = this.state.isMathJaxEnabled;
    const isActive = isEnabled && this.state.previewOptions.renderMathJaxInRealtime;

    const iconClasses = ['text-info'];
    if (isActive) {
      iconClasses.push('ti-check');
    }
    const iconClassName = iconClasses.join(' ');

    return (
      <MenuItem onClick={this.onClickRenderMathJaxInRealtime}>
        <span className="icon-container"><img src="/images/icons/fx.svg" width="14px" /></span>
        <span className="menuitem-label">MathJax Rendering</span>
        <i className={iconClassName} />
      </MenuItem>
    );
  }

  render() {
    return (
      <div className="d-flex flex-row">
        <span className="m-l-5">{this.renderThemeSelector()}</span>
        <span className="m-l-5">{this.renderKeymapModeSelector()}</span>
        <span className="m-l-5">{this.renderConfigurationDropdown()}</span>
      </div>
    );
  }
}

export class EditorOptions {
  constructor(props) {
    this.theme = 'elegant';
    this.keymapMode = 'default';
    this.styleActiveLine = false;

    Object.assign(this, props);
  }
}

export class PreviewOptions {
  constructor(props) {
    this.renderMathJaxInRealtime = false;

    Object.assign(this, props);
  }
}

OptionsSelector.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  crowi: PropTypes.object.isRequired,
  editorOptions: PropTypes.instanceOf(EditorOptions).isRequired,
  previewOptions: PropTypes.instanceOf(PreviewOptions).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default translate()(OptionsSelector);
