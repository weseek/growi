/* eslint-disable react/no-multi-comp */
import React from 'react';
import PropTypes from 'prop-types';
import { Subscribe } from 'unstated';
import { withTranslation } from 'react-i18next';

import FormGroup from 'react-bootstrap/es/FormGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import ControlLabel from 'react-bootstrap/es/ControlLabel';

import Dropdown from 'react-bootstrap/es/Dropdown';
import MenuItem from 'react-bootstrap/es/MenuItem';

import EditorContainer from '../../services/EditorContainer';


export const defaultEditorOptions = {
  theme: 'elegant',
  keymapMode: 'default',
  styleActiveLine: false,
};

export const defaultPreviewOptions = {
  renderMathJaxInRealtime: false,
};

class OptionsSelector extends React.Component {

  constructor(props) {
    super(props);

    const config = this.props.crowi.getConfig();
    const isMathJaxEnabled = !!config.env.MATHJAX;

    this.state = {
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
    const { editorContainer } = this.props;

    this.themeSelectorInputEl.value = editorContainer.state.editorOptions.theme;
    this.keymapModeSelectorInputEl.value = editorContainer.state.editorOptions.keymapMode;
  }

  onChangeTheme() {
    const { editorContainer } = this.props;

    const newValue = this.themeSelectorInputEl.value;
    const newOpts = Object.assign(editorContainer.state.editorOptions, { theme: newValue });
    editorContainer.setState({ editorOptions: newOpts });

    // save to localStorage
    editorContainer.saveToLocalStorage();
  }

  onChangeKeymapMode() {
    const { editorContainer } = this.props;

    const newValue = this.keymapModeSelectorInputEl.value;
    const newOpts = Object.assign(editorContainer.state.editorOptions, { keymapMode: newValue });
    editorContainer.setState({ editorOptions: newOpts });

    // save to localStorage
    editorContainer.saveToLocalStorage();
  }

  onClickStyleActiveLine(event) {
    const { editorContainer } = this.props;

    // keep dropdown opened
    this._cddForceOpen = true;

    const newValue = !editorContainer.state.editorOptions.styleActiveLine;
    const newOpts = Object.assign(editorContainer.state.editorOptions, { styleActiveLine: newValue });
    editorContainer.setState({ editorOptions: newOpts });

    // save to localStorage
    editorContainer.saveToLocalStorage();
  }

  onClickRenderMathJaxInRealtime(event) {
    const { editorContainer } = this.props;

    // keep dropdown opened
    this._cddForceOpen = true;

    const newValue = !editorContainer.state.previewOptions.renderMathJaxInRealtime;
    const newOpts = Object.assign(editorContainer.state.previewOptions, { renderMathJaxInRealtime: newValue });
    editorContainer.setState({ previewOptions: newOpts });

    // save to localStorage
    editorContainer.saveToLocalStorage();
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
          // eslint-disable-next-line no-return-assign
          inputRef={(el) => { return this.themeSelectorInputEl = el }}
        >

          {optionElems}

        </FormControl>
      </FormGroup>
    );
  }

  renderKeymapModeSelector() {
    const optionElems = [];
    // eslint-disable-next-line guard-for-in, no-restricted-syntax
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
          // eslint-disable-next-line no-return-assign
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
            <i className="icon-settings"></i>
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
    const { t, editorContainer } = this.props;
    const isActive = editorContainer.state.editorOptions.styleActiveLine;

    const iconClasses = ['text-info'];
    if (isActive) {
      iconClasses.push('ti-check');
    }
    const iconClassName = iconClasses.join(' ');

    return (
      <MenuItem onClick={this.onClickStyleActiveLine}>
        <span className="icon-container"></span>
        <span className="menuitem-label">{ t('page_edit.Show active line') }</span>
        <span className="icon-container"><i className={iconClassName}></i></span>
      </MenuItem>
    );
  }

  renderRealtimeMathJaxMenuItem() {
    if (!this.state.isMathJaxEnabled) {
      return;
    }

    const { editorContainer } = this.props;

    const isEnabled = this.state.isMathJaxEnabled;
    const isActive = isEnabled && editorContainer.state.previewOptions.renderMathJaxInRealtime;

    const iconClasses = ['text-info'];
    if (isActive) {
      iconClasses.push('ti-check');
    }
    const iconClassName = iconClasses.join(' ');

    return (
      <MenuItem onClick={this.onClickRenderMathJaxInRealtime}>
        <span className="icon-container"><img src="/images/icons/fx.svg" width="14px" alt="fx"></img></span>
        <span className="menuitem-label">MathJax Rendering</span>
        <i className={iconClassName}></i>
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

/**
 * Wrapper component for using unstated
 */
class OptionsSelectorWrapper extends React.Component {

  render() {
    return (
      <Subscribe to={[EditorContainer]}>
        { editorContainer => (
          // eslint-disable-next-line arrow-body-style
          <OptionsSelector editorContainer={editorContainer} {...this.props} />
        )}
      </Subscribe>
    );
  }

}


OptionsSelector.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  crowi: PropTypes.object.isRequired,
  editorContainer: PropTypes.instanceOf(EditorContainer).isRequired,
};
OptionsSelectorWrapper.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  crowi: PropTypes.object.isRequired,
};

export default withTranslation()(OptionsSelectorWrapper);
