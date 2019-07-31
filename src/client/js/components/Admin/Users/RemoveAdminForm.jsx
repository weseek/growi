import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';

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
      <Fragment>
          <p>
            {user.username !== me
              ? (
                <a data-toggle="collapse" href="#removeAdminForm">
                  <i className="icon-fw icon-user-unfollow mb-2"></i> { t('user_management.remove_admin_access') }
                </a>

              )
              : (
                <div className="mx-4">
                  <i className="icon-fw icon-user-unfollow mb-2"></i>{ t('user_management.remove_admin_access') }
                  <p className="alert alert-danger">{ t('user_management.cannot_remove') }</p>
                </div>
              )
            }
          </p>
          <form onSubmit={this.handleSubmit}>
            <div id="removeAdminForm" className="collapse">
              <div className="form-group">
                <label htmlFor="name">{ t('user_group_management.group_name') }</label>
                <textarea
                  id="name"
                  name="name"
                  className="form-control"
                  placeholder={t('user_group_management.group_example')}
                  value={this.state.name}
                  onChange={this.handleChange}
                >
                </textarea>
              </div>
            </div>
          </form>
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
