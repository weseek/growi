import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class StatusActivateForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {

    };

    this.onClickAcceptBtn = this.onClickAcceptBtn.bind(this);
  }

  onClickAcceptBtn() {
    console.log('hello');
  }

  render() {
    const { t } = this.props;

    return (
      <a className="px-4" onClick={() => { this.onClickAcceptBtn() }}>
        <i className="icon-fw icon-user-following"></i> { t('user_management.accept') }
      </a>
    );
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
