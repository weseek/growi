import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

class LoginForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {

    return (
      <div className="aaaaa"></div>
    );
  }

}

LoginForm.propTypes = {
  // i18next
  t: PropTypes.func.isRequired,
};

export default withTranslation()(LoginForm);
