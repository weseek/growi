import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class StatusSuspendedForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {

    };

  }

  render() {
    const { t, user } = this.props;
    const me = this.props.appContainer.me;

    return (
      <div className="px-4">
        {user.username !== me
          ? (
            <form id="form_suspend_user" action="/admin/user/{{ sUserId }}/suspend" method="post">
              <i className="icon-fw icon-ban"></i>{ t('user_management.deactivate_account') }
            </form>
          )
          : (
            <div>
              <i className="icon-fw icon-ban mb-2"></i>{ t('user_management.deactivate_account') }
              <p className="alert alert-danger">{ t('user_management.your_own') }</p>
            </div>
          )
        }
      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const StatusSuspendedFormWrapper = (props) => {
  return createSubscribedElement(StatusSuspendedForm, props, [AppContainer]);
};

StatusSuspendedForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  user: PropTypes.object.isRequired,
};

export default withTranslation()(StatusSuspendedFormWrapper);
