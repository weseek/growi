import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';


import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';

const SlackGrowiBridging = (props) => {
  const { appContainer, adminAppContainer } = props;
  const [siteName, setSiteName] = useState('');

  const fetchData = useCallback(async() => {
    try {
      await adminAppContainer.retrieveAppSettingsData();
      setSiteName(adminAppContainer.state.title);
      const res = await appContainer.apiv3.get('/slack-bot/');
      console.log(res);

    }
    catch (err) {
      toastError(err);
    }
  }, [appContainer, adminAppContainer]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  return (
    <>
      {siteName}
    </>
  );
};
const SlackGrowiBridgingWrapper = withUnstatedContainers(SlackGrowiBridging, [AppContainer, AdminAppContainer]);

SlackGrowiBridging.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer),
  adminAppContainer: PropTypes.instanceOf(AdminAppContainer),
};
export default SlackGrowiBridgingWrapper;
