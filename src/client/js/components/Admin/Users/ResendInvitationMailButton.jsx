import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AppContainer from '../../../services/AppContainer';
import AdminUsersContainer from '../../../services/AdminUsersContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';

const ResendInvitationEmailButton = (props) => {

  const { user } = props;

  return (
    <button className="dropdown-item" type="button" onClick={() => { }}>
      <i className="icon-fw icon-envelope"></i> 招待メールの送信
    </button>
  );
};


const ResendInvitationEmailButtonWrapper = withUnstatedContainers(ResendInvitationEmailButton, [AppContainer, AdminUsersContainer]);

ResendInvitationEmailButton.propTypes = {
  user: PropTypes.object.isRequired,
};

export default ResendInvitationEmailButtonWrapper;
