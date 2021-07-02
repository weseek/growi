import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AppContainer from '../../../services/AppContainer';
import AdminUsersContainer from '../../../services/AdminUsersContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';

const ResendInvitationEmailButton = (props) => {
  const { appContainer, user } = props;
  const { t } = useTranslation();

  const onClickSendInvitationEmailButton = async() => {
    const res = await appContainer.apiv3Put('users/send-invitation-email', { id: user._id });
    console.log(res);
  };

  return (
    <button className="dropdown-item" type="button" onClick={() => { onClickSendInvitationEmailButton() }}>
      <i className="icon-fw icon-envelope"></i> {t('admin:user_management.user_table.send_invitation_email')}
    </button>
  );
};

const ResendInvitationEmailButtonWrapper = withUnstatedContainers(ResendInvitationEmailButton, [AppContainer, AdminUsersContainer]);

ResendInvitationEmailButton.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  user: PropTypes.object.isRequired,
};

export default ResendInvitationEmailButtonWrapper;
