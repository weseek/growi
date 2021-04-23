import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const CustomBotIntegrationCard = (props) => {

  const { t } = useTranslation();

  return (
  <>

    <p>CustomBotIntegrationCardCompornent</p>

  </>
  );
};

CustomBotIntegrationCard.PropTypes = {
  currentBotType: PropTypes.string,
  siteName: PropTypes.string,
  slackWSNameInWithoutProxy: PropTypes.string,
  isSetupSlackBot: PropTypes.bool
}

export default CustomBotIntegrationCard;
