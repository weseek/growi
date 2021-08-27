import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
import { withUnstatedContainers } from './UnstatedUtils';

import { toastError } from '~/client/util/apiNotification';
import AppContainer from '~/client/services/AppContainer';
import PageContainer from '~/client/services/PageContainer';


const WatchButton = (props) => {

  const { appContainer, pageContainer } = props;
  const [isWatching, setIsWatching] = useState(true);

  const handleClick = () => {
    try {
      pageContainer.toggleWatch(isWatching);
      setIsWatching(!isWatching);
    }
    catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <button
        type="button"
        id="watch-button"
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

WatchButton.propTypes = {
  size: PropTypes.string,
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

WatchButton.defaultProps = {
  size: 'md',
};

const WatchButtonWrapper = withUnstatedContainers(WatchButton, [AppContainer, PageContainer]);

export default withTranslation()(WatchButtonWrapper);
