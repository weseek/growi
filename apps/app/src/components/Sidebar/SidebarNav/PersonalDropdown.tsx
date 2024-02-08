import { useState } from 'react';

import { pagePathUtils } from '@growi/core/dist/utils';
import { UserPicture } from '@growi/ui/dist/components';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import { apiv3Post } from '~/client/util/apiv3-client';
import { toastError } from '~/client/util/toastr';
import { useCurrentUser } from '~/stores/context';

import { SkeletonItem } from './SkeletonItem';

const ProactiveQuestionnaireModal = dynamic(() => import('~/features/questionnaire/client/components/ProactiveQuestionnaireModal'), { ssr: false });

export const PersonalDropdown = (): JSX.Element => {
  const { t } = useTranslation('commons');
  const { data: currentUser } = useCurrentUser();

  const [isOpen, setIsOpen] = useState(false);
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
      <Dropdown
        direction="end"
        isOpen={isOpen}
        toggle={() => setIsOpen(!isOpen)}
        aria-expanded={false}
      >
        <DropdownToggle
          className="btn btn-primary"
          data-testid="personal-dropdown-button"
        >
          <UserPicture user={currentUser} noLink noTooltip />
        </DropdownToggle>

        <DropdownMenu container="body">
          <DropdownItem className="px-4 pt-3 pb-2">
            <UserPicture user={currentUser} size="lg" noLink noTooltip />
            <h5>{currentUser.name}</h5>
            <div className="d-flex align-items-center">
              <i className="icon-user icon-fw"></i>{currentUser.username}
            </div>
            <div className="d-flex align-items-center">
              <i className="icon-envelope icon-fw"></i><span className="grw-email-sm">{currentUser.email}</span>
            </div>
          </DropdownItem>

          <DropdownItem divider />

          <DropdownItem>
            <Link
              href={pagePathUtils.userHomepagePath(currentUser)}
              data-testid="grw-personal-dropdown-menu-user-home"
            >
              <i className="icon-fw icon-home"></i>{t('personal_dropdown.home')}
            </Link>
          </DropdownItem>

          <DropdownItem>
            <Link
              href="/me"
              data-testid="grw-personal-dropdown-menu-user-settings"
            >
              <i className="icon-fw icon-wrench"></i>{t('personal_dropdown.settings')}
            </Link>
          </DropdownItem>

          <DropdownItem
            data-testid="grw-proactive-questionnaire-modal-toggle-btn"
            onClick={() => setQuestionnaireModalOpen(true)}
          >
            <span className="material-symbols-outlined">edit</span>{t('personal_dropdown.feedback')}
          </DropdownItem>

          <DropdownItem onClick={logoutHandler}>
            <i className="icon-fw icon-power"></i>{t('Sign out')}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <ProactiveQuestionnaireModal isOpen={isQuestionnaireModalOpen} onClose={() => setQuestionnaireModalOpen(false)} />
    </>
  );

};
