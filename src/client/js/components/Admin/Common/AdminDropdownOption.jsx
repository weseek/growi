import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import FormGroup from 'react-bootstrap/es/FormGroup';
import FormControl from 'react-bootstrap/es/FormControl';
import ControlLabel from 'react-bootstrap/es/ControlLabel';

class AdminDropdownOption extends React.PureComponent {

  render() {
    return (
      <React.Fragment>
        <FormGroup controlId="formControlsSelect" className="my-0">
          <ControlLabel>{this.props.label}</ControlLabel>
          <FormControl
            componentClass="select"
            placeholder="select"
            className="btn-group-sm selectpicker"
            onChange={event => this.props.onChange(event.target.value)}
          >
            {this.props.options.map((option) => {
              return <option key={option} value={option}>{option}</option>;
            })}
          </FormControl>
        </FormGroup>
        {this.props.children}
      </React.Fragment>
    );
  }

}

AdminDropdownOption.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  value: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  children: PropTypes.object.isRequired,
};

export default withTranslation()(AdminDropdownOption);
