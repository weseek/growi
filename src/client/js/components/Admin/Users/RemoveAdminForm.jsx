import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';

class RemoveAdminForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    };

    this.onClickRemoveAdminBtn = this.onClickRemoveAdminBtn.bind(this);
  }

  onClickRemoveAdminBtn() {
    const { t } = this.props;

    try {
      const username = 'gest';
      toastSuccess(t('user_management.remove_user_admin', { username }));
    }
    catch (err) {
      toastError(err);
    }
  }


  renderRemoveAdminBtn() {
    const { t } = this.props;

    return (
      <a className="px-4" onClick={() => { this.onClickRemoveAdminBtn() }}>
        <i className="icon-fw icon-user-unfollow"></i> { t('user_management.remove_admin_access') }
      </a>
    );
  }

  renderRemoveAdminAlert() {
    const { t } = this.props;

    return (
      <div className="px-4">
        <i className="icon-fw icon-user-unfollow mb-2"></i>{ t('user_management.remove_admin_access') }
        <p className="alert alert-danger">{ t('user_management.cannot_remove') }</p>
      </div>
    );
  }

  render() {
    const { user } = this.props;
    const me = this.props.appContainer.me;

    return (
      <Fragment>
        {user.username !== me ? this.renderRemoveAdminBtn()
          : this.renderRemoveAdminAlert()}
      </Fragment>
    );
  }

}

/**
* Wrapper component for using unstated
*/
const RemoveAdminFormWrapper = (props) => {
  return createSubscribedElement(RemoveAdminForm, props, [AppContainer]);
};

RemoveAdminForm.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  user: PropTypes.object.isRequired,
};

export default withTranslation()(RemoveAdminFormWrapper);
