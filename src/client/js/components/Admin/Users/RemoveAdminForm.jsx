import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class RemoveAdminForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // これは将来的にapiにするので。あとボタンにするとデザインがよくなかったので。
  handleSubmit(event) {
    $(event.currentTarget).parent().submit();
  }

  render() {
    const { t, user } = this.props;
    const me = this.props.appContainer.me;

    return (
      <Fragment>
        {user.username !== me
          ? (
            <a>
              <form action={`/admin/user/${user._id}/removeFromAdmin`} method="post">
                <input type="hidden" />
                <span onClick={this.handleSubmit}>
                  <i className="icon-fw icon-user-unfollow mb-2"></i>{ t('user_management.remove_admin_access') }
                </span>
              </form>
            </a>
          )
          : (
            <div className="px-4">
              <i className="icon-fw icon-user-unfollow mb-2"></i>{ t('user_management.remove_admin_access') }
              <p className="alert alert-danger">{ t('user_management.cannot_remove') }</p>
            </div>
          )
        }
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
