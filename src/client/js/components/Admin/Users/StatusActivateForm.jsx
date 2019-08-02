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

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // これは将来的にapiにするので。あとボタンにするとデザインがよくなかったので。
  handleSubmit(event) {
    $(event.currentTarget).parent().submit();
  }

  render() {
    const { t, user, appContainer } = this.props;

    return (
      <Fragment>
        {user.status === 1
          ? (
            <a>
              <form action={`/admin/user/${user._id}/activate`} method="post">
                <input type="hidden" name="_csrf" value={appContainer.csrfToken} />
                <span onClick={this.handleSubmit}>
                  <i className="icon-fw icon-user-following"></i> { t('user_management.accept') }
                </span>
              </form>
            </a>
          )
          : (
            <a className="px-4">
              <form action={`/admin/user/${user._id}/activate`} method="post">
                <input type="hidden" />
                <span onClick={this.handleSubmit}>
                  <i className="icon-fw icon-user-following"></i> { t('user_management.accept') }
                </span>
              </form>
            </a>
          )
        }
      </Fragment>
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
