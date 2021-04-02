import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';


import AppContainer from '../../../services/AppContainer';
import AdminAppContainer from '../../../services/AdminAppContainer';


const SlackGrowiBridging = (props) => {
  const { WebClient, LogLevel } = require('@slack/web-api');
  const { adminAppContainer } = props;
  const [siteName, setSiteName] = useState('');

  const checkSlackGrowiCommunication = function() {
    return new Promise((resolve, reject) => {
      const client = new WebClient('xoxb-1399660543842-1848670292404-I6OLidkKzn4WPF34ezWmE56r', {
        logLevel: LogLevel.DEBUG,
      });
      client.chat.postMessage({ text: 'hoge', channel: 'C01BAT2LXHV' }, (err, res) => {
        if (err) {
          return reject(err);
        }
        resolve(res);
      });
    });
  };

  const fetchData = useCallback(async() => {
    try {
      await adminAppContainer.retrieveAppSettingsData();
      setSiteName(adminAppContainer.state.title);
      checkSlackGrowiCommunication();

    }
    catch (err) {
      toastError(err);
    }
  }, [adminAppContainer]);

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
