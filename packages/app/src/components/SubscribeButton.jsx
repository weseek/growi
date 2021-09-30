import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';


const WatchButton = (props) => {

  const [isWatching, setIsWatching] = useState(true);

  const handleClick = () => {
    setIsWatching(!isWatching);
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
};

WatchButton.defaultProps = {
  size: 'md',
};

export default withTranslation()(WatchButton);
