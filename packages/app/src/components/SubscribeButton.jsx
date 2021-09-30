import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
import { withUnstatedContainers } from './UnstatedUtils';

import { toastError } from '~/client/util/apiNotification';
import AppContainer from '~/client/services/AppContainer';
import PageContainer from '~/client/services/PageContainer';

const SubscruibeButton = (props) => {

  const [isWatching, setIsWatching] = useState(true);

  const { appContainer } = props;

  const handleClick = async() => {
    setIsWatching(!isWatching);
    await appContainer.apiv3Put('page/subscribe', {});
  };

  return (
    <>
      <button
        type="button"
        id="subscribe-button"
        onClick={handleClick}
        className={`btn btn-watch border-0 ${`btn-${props.size}`} ${isWatching ? 'active' : ''} `}
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


const SubscruibeButtonWrapper = withUnstatedContainers(SubscruibeButton, [AppContainer, PageContainer]);

SubscruibeButton.propTypes = {
  size: PropTypes.string,
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

SubscruibeButton.defaultProps = {
  size: 'md',
};

export default withTranslation()(SubscruibeButtonWrapper);
