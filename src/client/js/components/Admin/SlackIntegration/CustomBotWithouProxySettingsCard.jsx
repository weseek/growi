import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';


const CustomBotWithouProxySettomgSlackCard = (props) => {

  const { t } = useTranslation();

  return (
  <>

    <p>{props.currentBotType}</p>
    <p>{props.slackWSNameInWithoutProxy}</p>
    <p>{props.siteName}</p>
    <p>{props.isSetupSlackBot}</p>

  </>
  );
};

CustomBotWithouProxySettomgSlackCard.PropTypes = {
  currentBotType: PropTypes.string,
  slackWSNameInWithoutProxy: PropTypes.string,
  siteName: PropTypes.string,
  isSetupSlackBot: PropTypes.bool,
}

export default CustomBotWithouProxySettomgSlackCard;
