import React from 'react';
import PropTypes from 'prop-types';

import { FormGroup, FormControl, ControlLabel } from 'react-bootstrap';

export default class ThemeSelector extends React.Component {

  constructor(props) {
    super(props);

    this.availableThemes = [
      'elegant', 'neo', 'mdn-like', 'material', 'monokai', 'twilight'
    ]
    
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    this.init(this.props.value || this.availableThemes[0]);
  }

  init(value) {
    this.inputEl.value = value;
  }

  onChange() {
    if (this.props.onChange != null) {
      this.props.onChange(this.inputEl.value);
    }
  }

  render() {
    const options = this.availableThemes.map((theme) => {
      return <option key={theme} value={theme}>{theme}</option>;
    });

    return (
      <FormGroup controlId="formControlsSelect">
        <ControlLabel>Theme:</ControlLabel>
        <FormControl componentClass="select" placeholder="select"
            onChange={this.onChange}
            inputRef={ el => this.inputEl=el }>

          {options}

        </FormControl>
      </FormGroup>
    )
  }
}

ThemeSelector.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};
