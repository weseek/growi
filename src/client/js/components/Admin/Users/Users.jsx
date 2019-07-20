import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import InviteUserControl from './InviteUserControl';
import UserTable from './UserTable';

import AppContainer from '../../../services/AppContainer';
import { createSubscribedElement } from '../../UnstatedUtils';

class UserPage extends React.Component {

  constructor(props) {
    super();

  }

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <p>
          <InviteUserControl />
          <a className="btn btn-default btn-outline ml-2" href="/admin/users/external-accounts">
            <i className="icon-user-follow" aria-hidden="true"></i>
            { t('user_management.external_account') }
          </a>
        </p>
        <UserTable />
      </Fragment>
    );
  }

}

const UserPageWrapper = (props) => {
  return createSubscribedElement(UserPage, props, [AppContainer]);
};

UserPage.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(UserPageWrapper);
