import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import {
  FormGroup, Label, Input,
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import { createSubscribedElement } from '../UnstatedUtils';
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
    editorContainer.saveOptsToLocalStorage();
  }

  onChangeKeymapMode() {
    const { editorContainer } = this.props;

    const newValue = this.keymapModeSelectorInputEl.value;
    const newOpts = Object.assign(editorContainer.state.editorOptions, { keymapMode: newValue });
    editorContainer.setState({ editorOptions: newOpts });

    // save to localStorage
    editorContainer.saveOptsToLocalStorage();
  }

  onClickStyleActiveLine(event) {
    const { editorContainer } = this.props;

    // keep dropdown opened
    this._cddForceOpen = true;

    const newValue = !editorContainer.state.editorOptions.styleActiveLine;
    const newOpts = Object.assign(editorContainer.state.editorOptions, { styleActiveLine: newValue });
    editorContainer.setState({ editorOptions: newOpts });

    // save to localStorage
    editorContainer.saveOptsToLocalStorage();
  }

  onClickRenderMathJaxInRealtime(event) {
    const { editorContainer } = this.props;

    const newValue = !editorContainer.state.previewOptions.renderMathJaxInRealtime;
    const newOpts = Object.assign(editorContainer.state.previewOptions, { renderMathJaxInRealtime: newValue });
    editorContainer.setState({ previewOptions: newOpts });

    // save to localStorage
    editorContainer.saveOptsToLocalStorage();
  }

  onToggleConfigurationDropdown(newValue) {
    this.setState({ isCddMenuOpened: !this.state.isCddMenuOpened });
  }

  renderThemeSelector() {
    const optionElems = this.availableThemes.map((theme) => {
      return <option key={theme} value={theme}>{theme}</option>;
    });

    return (
      <FormGroup className="my-0">
        <Label>Theme:</Label>
        <Input
          type="select"
          bsSize="sm"
          placeholder="select"
          className="selectpicker"
          cssModule={{ width: 'unset' }}
          onChange={this.onChangeTheme}
          // eslint-disable-next-line no-return-assign
          innerRef={(el) => { return this.themeSelectorInputEl = el }}
        >

          {optionElems}

        </Input>
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

    return (
      <FormGroup className="my-0">
        <Label>Keymap:</Label>
        <Input
          type="select"
          bsSize="sm"
          placeholder="select"
          className="selectpicker"
          onChange={this.onChangeKeymapMode}
          // eslint-disable-next-line no-return-assign
          innerRef={(el) => { return this.keymapModeSelectorInputEl = el }}
        >

          {optionElems}

        </Input>
      </FormGroup>
    );
  }

  renderConfigurationDropdown() {
    return (
      <FormGroup className="my-0">

        <Dropdown
          direction="up"
          size="sm"
          className="grw-editor-configuration-dropdown"
          isOpen={this.state.isCddMenuOpened}
          toggle={this.onToggleConfigurationDropdown}
        >

          <DropdownToggle caret>
            <i className="icon-settings"></i>
          </DropdownToggle>

          <DropdownMenu>
            {this.renderActiveLineMenuItem()}
            {this.renderRealtimeMathJaxMenuItem()}
            {/* <DropdownItem divider /> */}
          </DropdownMenu>

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
      <DropdownItem toggle={false} onClick={this.onClickStyleActiveLine}>
        <span className="icon-container"></span>
        <span className="menuitem-label">{ t('page_edit.Show active line') }</span>
        <span className="icon-container"><i className={iconClassName}></i></span>
      </DropdownItem>
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
      <DropdownItem toggle={false} onClick={this.onClickRenderMathJaxInRealtime}>
        <span className="icon-container"><img src="/images/icons/fx.svg" width="14px" alt="fx"></img></span>
        <span className="menuitem-label">MathJax Rendering</span>
        <i className={iconClassName}></i>
      </DropdownItem>
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
const OptionsSelectorWrapper = (props) => {
  return createSubscribedElement(OptionsSelector, props, [EditorContainer]);
};

OptionsSelector.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  editorContainer: PropTypes.instanceOf(EditorContainer).isRequired,

  crowi: PropTypes.object.isRequired,
};

export default withTranslation()(OptionsSelectorWrapper);
