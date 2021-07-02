import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import * as toastr from 'toastr';
import { toastError } from '../../../util/apiNotification';
import AppContainer from '../../../services/AppContainer';
import AdminUsersContainer from '../../../services/AdminUsersContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';

const ResendInvitationEmailButton = (props) => {
  const { appContainer, user } = props;
  const { t } = useTranslation();

  const onClickSendInvitationEmailButton = async() => {
    try {
      const res = await appContainer.apiv3Put('users/send-invitation-email', { id: user._id });
      const { failedToSendEmail } = res.data;
      if (failedToSendEmail == null) {
        const msg = `・${user.email}`;
        toastr.success(msg, 'Successfully sent invitation mail', {
          closeButton: true,
          progressBar: true,
          newestOnTop: false,
          showDuration: '100',
          hideDuration: '100',
          timeOut: '3000',
        });
      }
      else {
        const msg = `email: ${failedToSendEmail.email}<br>reason: ${failedToSendEmail.reason}`;
        toastr.error(msg, 'Failure to send invitation mail', {
          closeButton: true,
          progressBar: true,
          newestOnTop: false,
          showDuration: '100',
          hideDuration: '100',
          timeOut: '0',
        });
      }
    }
    catch (err) {
      toastError(err);
    }
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
