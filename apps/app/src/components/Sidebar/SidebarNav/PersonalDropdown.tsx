import { useState } from 'react';

import { pagePathUtils } from '@growi/core/dist/utils';
import { UserPicture } from '@growi/ui/dist/components';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import { apiv3Post } from '~/client/util/apiv3-client';
import { toastError } from '~/client/util/toastr';
import { useCurrentUser } from '~/stores/context';

import { SkeletonItem } from './SkeletonItem';

import styles from './PersonalDropdown.module.scss';

const ProactiveQuestionnaireModal = dynamic(() => import('~/features/questionnaire/client/components/ProactiveQuestionnaireModal'), { ssr: false });

export const PersonalDropdown = (): JSX.Element => {
  const { t } = useTranslation('commons');
  const { data: currentUser } = useCurrentUser();

  const [isQuestionnaireModalOpen, setQuestionnaireModalOpen] = useState(false);

  if (currentUser == null) {
    return <SkeletonItem />;
  }

  const logoutHandler = async() => {
    try {
      await apiv3Post('/logout');
      window.location.reload();
    }
    catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <UncontrolledDropdown
        direction="end"
      >
        <DropdownToggle
          className="btn btn-primary"
          data-testid="personal-dropdown-button"
        >
          <UserPicture user={currentUser} noLink noTooltip />
        </DropdownToggle>

        <DropdownMenu
          container="body"
          data-testid="personal-dropdown-menu"
        >
          <DropdownItem className={styles['personal-dropdown-header']} header>
            <div className="mt-2 mb-3">
              <UserPicture user={currentUser} size="lg" noLink noTooltip />
            </div>
            <h5 className="ms-1">{currentUser.name}</h5>
            <div className="d-flex align-items-center">
              <span className="material-symbols-outlined me-1">person</span>
              {currentUser.username}
            </div>
            <div className="d-flex align-items-center">
              <span className="material-symbols-outlined me-1">mail</span>
              <span className="grw-email-sm">{currentUser.email}</span>
            </div>
          </DropdownItem>

          <DropdownItem divider />

          <DropdownItem className={styles['personal-dropdown-item']}>
            <Link
              href={pagePathUtils.userHomepagePath(currentUser)}
              data-testid="grw-personal-dropdown-menu-user-home"
            >
              <span className="text-muted">
                <span className="material-symbols-outlined me-1">home</span>{t('personal_dropdown.home')}
              </span>
            </Link>
          </DropdownItem>

          <DropdownItem className={styles['personal-dropdown-item']}>
            <Link
              href="/me"
              data-testid="grw-personal-dropdown-menu-user-settings"
            >
              <span className="text-muted">
                <span className="material-symbols-outlined me-1">build</span>{t('personal_dropdown.settings')}
              </span>
            </Link>
          </DropdownItem>

          <DropdownItem
            data-testid="grw-proactive-questionnaire-modal-toggle-btn"
            onClick={() => setQuestionnaireModalOpen(true)}
            className={styles['personal-dropdown-item']}
          >
            <span className="text-muted">
              <span className="material-symbols-outlined me-1">edit</span>{t('personal_dropdown.feedback')}
            </span>
          </DropdownItem>

          <DropdownItem onClick={logoutHandler} className={styles['personal-dropdown-item']}>
            <span className="text-muted">
              <span className="material-symbols-outlined me-1">logout</span>{t('Sign out')}
            </span>
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>

      <ProactiveQuestionnaireModal isOpen={isQuestionnaireModalOpen} onClose={() => setQuestionnaireModalOpen(false)} />
    </>
  );

};
