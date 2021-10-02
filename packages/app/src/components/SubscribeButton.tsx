import React, { useState, FC } from 'react';

import { withUnstatedContainers } from './UnstatedUtils';

import { toastError } from '~/client/util/apiNotification';
import AppContainer from '~/client/services/AppContainer';
import PageContainer from '~/client/services/PageContainer';

type Props = {
  appContainer: AppContainer,
  pageContainer: PageContainer,
};

const SubscruibeButton: FC<Props> = (props: Props) => {

  const [isWatching, setIsWatching] = useState(true);

  const { appContainer, pageContainer } = props;

  const handleClick = async() => {
    try {
      const res = await appContainer.apiv3Put('page/subscribe', { pageId: pageContainer.state.pageId, status: !isWatching });
      if (res) {
        const { subscription } = res.data;
        setIsWatching(subscription.status === 'WATCH');
      }
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
        className={`btn btn-watch border-0 ${isWatching ? 'active' : ''} `}
      >
        {isWatching && (
          <i className="fa fa-eye"></i>
        )}

        {!isWatching && (
          <i className="fa fa-eye-slash"></i>
        )}
      </button>
    </>
  );

};

/**
 * Wrapper component for using unstated
 */
const SubscruibeButtonWrapper = withUnstatedContainers(SubscruibeButton, [AppContainer, PageContainer]);

export default SubscruibeButtonWrapper;
