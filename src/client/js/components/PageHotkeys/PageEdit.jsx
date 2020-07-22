import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const PageEdit = (props) => {

  // setup effect
  useEffect(() => {
    // ignore when dom that has 'modal in' classes exists
    if (document.getElementsByClassName('modal in').length > 0) {
      return;
    }
    // show editor
    $('a[data-toggle="tab"][href="#edit"]').tab('show');

    // remove this
    props.onDeleteRender(this);
  }, [props]);

  return <></>;
};

PageEdit.propTypes = {
  onDeleteRender: PropTypes.func.isRequired,
};

PageEdit.getHotkeyStrokes = () => {
  return [['e']];
};

export default PageEdit;
