import React from 'react';
import PropTypes from 'prop-types';
import { createSubscribedElement } from './UnstatedUtils';
import AppContainer from '../services/AppContainer';

class LoginForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    };

  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  render() {

    return (
      <div className="main container-fluid">
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const LoginFormWrapper = (props) => {
  return createSubscribedElement(LoginForm, props, [AppContainer]);
};

LoginForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  keyword: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  onInputChange: PropTypes.func,
};

LoginForm.defaultProps = {
  onInputChange: () => { },
};

export default LoginFormWrapper;
