import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';


const CustomBotWithouProxySettomgSlackCard = (props) => {
  return (
  <>

    <p>{props.slackWorkSpaceName}</p>
    <p>{props.siteName}</p>

  </>
  );
};

CustomBotWithouProxySettomgSlackCard.PropTypes = {
  slackWorkSpaceName: PropTypes.string,
  siteName: PropTypes.string,
}


export default CustomBotWithouProxySettomgSlackCard;
