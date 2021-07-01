import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AppContainer from '../../../services/AppContainer';
import AdminUsersContainer from '../../../services/AdminUsersContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';

const ResendInvitationEmailButton = (props) => {

  return (
    <p>ResendInvitationEmailButton</p>
  );
};


const ResendInvitationEmailButtonWrapper = withUnstatedContainers(ResendInvitationEmailButton, [AppContainer, AdminUsersContainer]);

ResendInvitationEmailButton.propTypes = {};

export default ResendInvitationEmailButtonWrapper;
