import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';

class StatusActivateForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {

    };

  }

  render() {
    const { t, user }= this.props;
    const me = this.props.appContainer.me;

    return ();
  }

}

/**
 * Wrapper component for using unstated
 */
const StatusActivateFormWrapper = (props) => {
  return createSubscribedElement(StatusActivateForm, props, [AppContainer]);
};

StatusActivateForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  user: PropTypes.object.isRequired,
};

export default withTranslation()(StatusActivateFormWrapper);
