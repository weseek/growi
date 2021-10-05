import React, { FC } from 'react';

import { useTranslation } from 'react-i18next';
import { UncontrolledTooltip } from 'reactstrap';
import { withUnstatedContainers } from './UnstatedUtils';

import { toastError } from '~/client/util/apiNotification';
import AppContainer from '~/client/services/AppContainer';
import PageContainer from '~/client/services/PageContainer';

type Props = {
  appContainer: AppContainer,
  pageContainer: PageContainer,
};

const SubscruibeButton: FC<Props> = (props: Props) => {
  const { t } = useTranslation();

  const { appContainer, pageContainer } = props;

  const handleClick = async() => {
    if (appContainer.isGuestUser) {
      return;
    }

    try {
      pageContainer.toggleSubscribe();
    }
    catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <button
        type="button"
        id="subscribe-button"
        onClick={handleClick}
        className={`btn btn-subscribe border-0 ${pageContainer.state.isSubscribing ? 'active' : ''}  ${appContainer.isGuestUser ? 'disabled' : ''}`}
      >
        <i className={pageContainer.state.isSubscribing ? 'fa fa-eye' : 'fa fa-eye-slash'}></i>
      </button>

      {appContainer.isGuestUser && (
        <UncontrolledTooltip placement="top" target="subscribe-button" fade={false}>
          {t('Not available for guest')}
        </UncontrolledTooltip>
      )}
    </>
  );

};

/**
 * Wrapper component for using unstated
 */
const SubscruibeButtonWrapper = withUnstatedContainers(SubscruibeButton, [AppContainer, PageContainer]);
export default SubscruibeButtonWrapper;
