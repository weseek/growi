import { useState } from 'react';

import { pagePathUtils } from '@growi/core/dist/utils';
import { UserPicture } from '@growi/ui/dist/components';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Link from 'next/link';

import { apiv3Post } from '~/client/util/apiv3-client';
import { toastError } from '~/client/util/toastr';
import { useCurrentUser } from '~/stores/context';

const ProactiveQuestionnaireModal = dynamic(() => import('~/features/questionnaire/client/components/ProactiveQuestionnaireModal'), { ssr: false });

export const PersonalDropdown = (): JSX.Element => {
  const { t } = useTranslation('commons');
  const { data: currentUser } = useCurrentUser();

  const [isQuestionnaireModalOpen, setQuestionnaireModalOpen] = useState(false);

  if (currentUser == null) {
    return (
      <div className="text-muted text-center mb-5">
        <i className="fa fa-2x fa-spinner fa-pulse me-1" />
      </div>
    );
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
      <div className="dropend">
        {/* Button */}
        {/* remove .dropdown-toggle for hide caret */}
        {/* See https://stackoverflow.com/a/44577512/13183572 */}
        <button
          type="button"
          className="btn btn-primary"
          data-bs-toggle="dropdown"
          data-testid="personal-dropdown-button"
          aria-expanded="false"
        >
          <UserPicture user={currentUser} noLink noTooltip />
        </button>

        {/* Menu */}
        <ul className="dropdown-menu" data-testid="personal-dropdown-menu">
          <li className="px-4 pt-3 pb-2">
            <UserPicture user={currentUser} size="lg" noLink noTooltip />
            <h5>{currentUser.name}</h5>
            <div className="d-flex align-items-center">
              <i className="icon-user icon-fw"></i>{currentUser.username}
            </div>
            <div className="d-flex align-items-center">
              <i className="icon-envelope icon-fw"></i><span className="grw-email-sm">{currentUser.email}</span>
            </div>
          </li>

          <li className="dropdown-divider"></li>

          <li>
            <Link
              href={pagePathUtils.userHomepagePath(currentUser)}
              className="dropdown-item"
              data-testid="grw-personal-dropdown-menu-user-home"
            >
              <i className="icon-fw icon-home"></i>{t('personal_dropdown.home')}
            </Link>
          </li>
          <li>
            <Link
              href="/me"
              className="dropdown-item"
              data-testid="grw-personal-dropdown-menu-user-settings"
            >
              <i className="icon-fw icon-wrench"></i>{t('personal_dropdown.settings')}
            </Link>
          </li>
          <li>
            <button
              data-testid="grw-proactive-questionnaire-modal-toggle-btn"
              type="button"
              className="dropdown-item"
              onClick={() => setQuestionnaireModalOpen(true)}
            >
              <i className="icon-fw icon-pencil"></i>{t('personal_dropdown.feedback')}
            </button>
          </li>
          <li>
            <button type="button" className="dropdown-item" onClick={logoutHandler}>
              <i className="icon-fw icon-power"></i>{t('Sign out')}
            </button>
          </li>
        </ul>

      </div>

      <ProactiveQuestionnaireModal isOpen={isQuestionnaireModalOpen} onClose={() => setQuestionnaireModalOpen(false)} />
    </>
  );

};
