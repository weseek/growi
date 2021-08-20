import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';


const WatchButton = (props) => {

  const handleClick = () => {
    console.log('watch button clicked!');
  };

  return (
    <>
      <button
        type="button"
        id="bookmark-button"
        onClick={handleClick}
        className={`btn btn-bookmark border-0 ${`btn-${props.size}`}`}
      >
        <i className="fa fa-eye"></i>
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
