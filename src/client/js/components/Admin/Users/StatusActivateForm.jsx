import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class StatusActivateForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {

    };

  }

  render() {
    const { t, user } = this.props;

    return (
      <div className="px-4">
        {user.status === 1
          ? (
            <form action="/admin/user/{{ sUserId }}/activate" method="post">
              <i className="icon-fw icon-user-following"></i> { t('user_management.accept') }
            </form>
          )
          : (
            <div>
              <form action="/admin/user/{{ sUserId }}/activate" method="post">
                <i className="icon-fw icon-action-redo"></i> { t('Undo') }
              </form>
              <form action="/admin/user/{{ sUserId }}/remove" method="post">
                <i className="icon-fw icon-fire text-danger"></i> { t('Delete') }
              </form>
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
const StatusActivateFormWrapper = (props) => {
  return createSubscribedElement(StatusActivateForm, props, [AppContainer]);
};

StatusActivateForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  user: PropTypes.object.isRequired,
};

export default withTranslation()(StatusActivateFormWrapper);
