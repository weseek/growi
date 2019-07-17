import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';

class NewUsers extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <p>
          <button type="button" data-toggle="collapse" className="btn btn-default">
            { t('user_management.invite_users') }
          </button>
          <a className="btn btn-default btn-outline ml-2" href="/admin/users/external-accounts">
            <i className="icon-user-follow" aria-hidden="true"></i>
            { t('user_management.external_account') }
          </a>
        </p>
      </Fragment>
    );
  }

}

const NewUsersWrapper = (props) => {
  return createSubscribedElement(NewUsers, props, [AppContainer]);
};

NewUsers.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(NewUsersWrapper);
