import React from 'react';
import PropTypes from 'prop-types';

const SlackGrowiBridging = (props) => {
  return (
    <>
      {props.slackWorkSpaceName}{props.siteName}
    </>
  );
};

SlackGrowiBridging.propTypes = {
  slackWorkSpaceName: PropTypes.string,
  siteName: PropTypes.string,
};

export default SlackGrowiBridging;
