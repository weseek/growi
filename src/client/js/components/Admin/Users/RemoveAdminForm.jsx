import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class AdminMenuForm extends React.Component {

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
            <form name="removeadmin" action="/admin/user/+ {user._id} +/removeFromAdmin" method="post">
              <input type="hidden" />
              <i type="submit" className="icon-fw icon-user-unfollow mb-2"></i> { t('user_management.remove_admin_access') }
            </form>

          )
          : (
            <div>
              <i className="icon-fw icon-user-unfollow mb-2"></i>{ t('user_management.remove_admin_access') }
              <p className="alert alert-danger">{ t('user_management.cannot_remove') }</p>
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
const AdminMenuFormWrapper = (props) => {
  return createSubscribedElement(AdminMenuForm, props, [AppContainer]);
};

AdminMenuForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  user: PropTypes.object.isRequired,
};

export default withTranslation()(AdminMenuFormWrapper);
