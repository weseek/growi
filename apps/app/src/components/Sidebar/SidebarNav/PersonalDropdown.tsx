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
            <h5 className="username ms-1">{currentUser.name}</h5>
            <div className="d-flex align-items-center my-2">
              <span className="item-icon material-symbols-outlined me-1">person</span>
              <span className="item-text">{currentUser.username}</span>
            </div>
            <div className="d-flex align-items-center">
              <span className="item-icon material-symbols-outlined me-1">mail</span>
              <span className="item-text-email">{currentUser.email}</span>
            </div>
          </DropdownItem>

          <DropdownItem className="my-3" divider />

          <DropdownItem className={`my-1 ${styles['personal-dropdown-item']}`}>
            <Link
              href={pagePathUtils.userHomepagePath(currentUser)}
              data-testid="grw-personal-dropdown-menu-user-home"
            >
              <span className="text-muted d-flex align-items-center">
                <span className="item-icon material-symbols-outlined me-2">home</span>
                <span className="item-text">{t('personal_dropdown.home')}</span>
              </span>
            </Link>
          </DropdownItem>

          <DropdownItem className={`my-1 ${styles['personal-dropdown-item']}`}>
            <Link
              href="/me"
              data-testid="grw-personal-dropdown-menu-user-settings"
            >
              <span className="text-muted d-flex align-items-center">
                <span className="item-icon material-symbols-outlined me-2">discover_tune</span>
                <span className="item-text">{t('personal_dropdown.settings')}</span>
              </span>
            </Link>
          </DropdownItem>

          <DropdownItem
            data-testid="grw-proactive-questionnaire-modal-toggle-btn"
            onClick={() => setQuestionnaireModalOpen(true)}
            className={`my-1 ${styles['personal-dropdown-item']}`}
          >
            <span className="text-muted d-flex align-items-center">
              <span className="item-icon material-symbols-outlined me-2">edit_note</span>
              <span className="item-text">{t('personal_dropdown.feedback')}</span>
            </span>
          </DropdownItem>

          <DropdownItem onClick={logoutHandler} className={`my-1 ${styles['personal-dropdown-item']}`}>
            <span className="text-muted d-flex align-items-center">
              <span className="item-icon material-symbols-outlined me-2">logout</span>
              <span className="item-text">{t('Sign out')}</span>
            </span>
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>

      <ProactiveQuestionnaireModal isOpen={isQuestionnaireModalOpen} onClose={() => setQuestionnaireModalOpen(false)} />
    </>
  );

};
