import React from 'react';
import PropTypes from 'prop-types';

import FormGroup from 'react-bootstrap/es/FormGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import ControlLabel from 'react-bootstrap/es/ControlLabel';
import Button from 'react-bootstrap/es/Button';

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

export default class OptionsSelector extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      editorOptions: this.props.editorOptions || new EditorOptions(),
      previewOptions: this.props.previewOptions || new PreviewOptions(),
    }

    this.availableThemes = [
      'elegant', 'neo', 'mdn-like', 'material', 'monokai', 'twilight'
    ]

    this.onChangeTheme = this.onChangeTheme.bind(this);
    this.onClickStyleActiveLine = this.onClickStyleActiveLine.bind(this);
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
    const bool = this.state.editorOptions.styleActiveLine || false;
    return (
      <FormGroup controlId="formControlsSelect">
        <Button active={bool} className="btn-style-active-line"
            onClick={this.onClickStyleActiveLine}
            ref="styleActiveLineButton">
          Active Line
        </Button>
      </FormGroup>
    )
  }

  render() {
    return <span>{this.renderThemeSelector()} {this.renderStyleActiveLineSelector()}</span>
  }
}

OptionsSelector.propTypes = {
  editorOptions: PropTypes.instanceOf(EditorOptions),
  previewOptions: PropTypes.instanceOf(PreviewOptions),
  onChange: PropTypes.func,
};
