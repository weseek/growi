import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';

import AdminUsersContainer from '~/client/services/AdminUsersContainer';
import { toastError } from '~/client/util/apiNotification';

import PaginationWrapper from '../PaginationWrapper';
import { withUnstatedContainers } from '../UnstatedUtils';

import InviteUserControl from './Users/InviteUserControl';
import PasswordResetModal from './Users/PasswordResetModal';
import UserTable from './Users/UserTable';

import styles from './UserManagement.module.scss';
