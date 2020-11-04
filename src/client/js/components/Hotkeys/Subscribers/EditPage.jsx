import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const EditPage = (props) => {

  // setup effect
  useEffect(() => {
    // ignore when dom that has 'modal in' classes exists
    if (document.getElementsByClassName('modal in').length > 0) {
      return;
    }

    // remove this
    props.onDeleteRender(this);
  }, [props]);

  return <></>;
};

EditPage.propTypes = {
  onDeleteRender: PropTypes.func.isRequired,
};

EditPage.getHotkeyStrokes = () => {
  return [['e']];
};

export default EditPage;
