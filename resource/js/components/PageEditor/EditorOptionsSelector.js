import React from 'react';
import PropTypes from 'prop-types';

import FormGroup from 'react-bootstrap/es/FormGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import ControlLabel from 'react-bootstrap/es/ControlLabel';
import Button from 'react-bootstrap/es/Button';

export default class EditorOptionsSelector extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      options: this.props.options,
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
    this.themeSelectorInputEl.value = this.state.options.theme || this.availableThemes[0];
  }

  onChangeTheme() {
    const newValue = this.themeSelectorInputEl.value;
    const newOpts = Object.assign(this.state.options, {theme: newValue});
    this.setState({options: newOpts});

    // dispatch event
    this.dispatchOnChange();
  }

  onClickStyleActiveLine(event) {
    const newValue = !this.state.options.styleActiveLine;
    console.log(newValue);
    const newOpts = Object.assign(this.state.options, {styleActiveLine: newValue});
    this.setState({options: newOpts});

    // dispatch event
    this.dispatchOnChange();
  }

  dispatchOnChange() {
    if (this.props.onChange != null) {
      this.props.onChange(this.state.options);
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
    const bool = this.state.options.styleActiveLine || false;
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

EditorOptionsSelector.propTypes = {
  options: PropTypes.object,
  onChange: PropTypes.func,
};
