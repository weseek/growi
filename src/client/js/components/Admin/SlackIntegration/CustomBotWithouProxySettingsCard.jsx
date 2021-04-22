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

  </>
  );
};

CustomBotWithouProxySettomgSlackCard.PropTypes = {
  currentBotType: PropTypes.string,
  slackWSNameInWithoutProxy: PropTypes.string,
  siteName: PropTypes.string,
}

export default CustomBotWithouProxySettomgSlackCard;
