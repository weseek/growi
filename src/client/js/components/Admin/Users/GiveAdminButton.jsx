import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import { toastSuccess, toastError } from '../../../util/apiNotification';

class GiveAdminButton extends React.Component {

  constructor(props) {
    super(props);

    this.onClickGiveAdminBtn = this.onClickGiveAdminBtn.bind(this);
  }

  onClickGiveAdminBtn() {
    const { t } = this.props;

    try {
      const username = 'gest';
      toastSuccess(t('user_management.give_user_admin', { username }));
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t } = this.props;

    return (
      <a className="px-4" onClick={() => { this.onClickGiveAdminBtn() }}>
        <i className="icon-fw icon-user-following"></i> { t('user_management.give_admin_access') }
      </a>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const GiveAdminButtonWrapper = (props) => {
  return createSubscribedElement(GiveAdminButton, props, [AppContainer]);
};

GiveAdminButton.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  user: PropTypes.object.isRequired,
};

export default withTranslation()(GiveAdminButtonWrapper);
