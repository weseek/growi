import React from 'react';
import PropTypes from 'prop-types';

import FormGroup from 'react-bootstrap/es/FormGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import ControlLabel from 'react-bootstrap/es/ControlLabel';
import Button from 'react-bootstrap/es/Button';

import OverlayTrigger  from 'react-bootstrap/es/OverlayTrigger';
import Tooltip from 'react-bootstrap/es/Tooltip';

export default class OptionsSelector extends React.Component {

  constructor(props) {
    super(props);

    const config = this.props.crowi.getConfig();
    const isMathJaxEnabled = !!config.env.MATHJAX;

    this.state = {
      editorOptions: this.props.editorOptions || new EditorOptions(),
      previewOptions: this.props.previewOptions || new PreviewOptions(),
      isMathJaxEnabled,
    }

    this.availableThemes = [
      'elegant', 'neo', 'mdn-like', 'material', 'monokai', 'twilight'
    ]

    this.onChangeTheme = this.onChangeTheme.bind(this);
    this.onClickStyleActiveLine = this.onClickStyleActiveLine.bind(this);
    this.onClickRenderMathJaxInRealtime = this.onClickRenderMathJaxInRealtime.bind(this);
  }

  componentDidMount() {
    this.init();
  }

  init() {
    this.themeSelectorInputEl.value = this.state.editorOptions.theme;
  }

  onChangeTheme() {
    const newValue = this.themeSelectorInputEl.value;
    const newOpts = Object.assign(this.state.editorOptions, {theme: newValue});
    this.setState({editorOptions: newOpts});

    // dispatch event
    this.dispatchOnChange();
  }

  onClickStyleActiveLine(event) {
    const newValue = !this.state.editorOptions.styleActiveLine;
    const newOpts = Object.assign(this.state.editorOptions, {styleActiveLine: newValue});
    this.setState({editorOptions: newOpts});

    // dispatch event
    this.dispatchOnChange();
  }

  onClickRenderMathJaxInRealtime(event) {
    const newValue = !this.state.previewOptions.renderMathJaxInRealtime;
    const newOpts = Object.assign(this.state.previewOptions, {renderMathJaxInRealtime: newValue});
    this.setState({previewOptions: newOpts});

    // dispatch event
    this.dispatchOnChange();
  }

  /**
   * dispatch onChange event
   */
  dispatchOnChange() {
    if (this.props.onChange != null) {
      this.props.onChange(this.state.editorOptions, this.state.previewOptions);
    }
  }

  renderThemeSelector() {
    const optionElems = this.availableThemes.map((theme) => {
      return <option key={theme} value={theme}>{theme}</option>;
    });

    return (
      <FormGroup controlId="formControlsSelect">
        <ControlLabel>Theme:</ControlLabel>
        <FormControl componentClass="select" placeholder="select"
            onChange={this.onChangeTheme}
            inputRef={ el => this.themeSelectorInputEl=el }>

          {optionElems}

        </FormControl>
      </FormGroup>
    )
  }

  renderStyleActiveLineSelector() {
    const bool = this.state.editorOptions.styleActiveLine;
    return (
      <FormGroup controlId="formControlsSelect">
        <Button active={bool} className="btn-style-active-line"
            onClick={this.onClickStyleActiveLine}>
          Active Line
        </Button>
      </FormGroup>
    )
  }

  renderRealtimeMathJaxSelector() {
    if (!this.state.isMathJaxEnabled) {
      return;
    }

    // tooltip
    const tooltip = (
      <Tooltip id="tooltip-realtime-mathjax-rendering">Realtime MathJax Rendering</Tooltip>
    );

    const isEnabled = this.state.isMathJaxEnabled;
    const isActive = isEnabled && this.state.previewOptions.renderMathJaxInRealtime;
    return (
      <FormGroup controlId="formControlsSelect">
        <OverlayTrigger placement="top" overlay={tooltip}>
          <Button active={isActive} className="btn-render-mathjax-in-realtime"
              onClick={this.onClickRenderMathJaxInRealtime}>
            <i className="fa fa-superscript" aria-hidden="true"></i>
          </Button>
        </OverlayTrigger>
      </FormGroup>
    )
  }

  render() {
    return <span>{this.renderThemeSelector()} {this.renderStyleActiveLineSelector()} {this.renderRealtimeMathJaxSelector()}</span>
  }
}

export class EditorOptions {
  constructor(props) {
    this.theme = 'elegant';
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
  crowi: PropTypes.object.isRequired,
  editorOptions: PropTypes.instanceOf(EditorOptions),
  previewOptions: PropTypes.instanceOf(PreviewOptions),
  onChange: PropTypes.func,
};
