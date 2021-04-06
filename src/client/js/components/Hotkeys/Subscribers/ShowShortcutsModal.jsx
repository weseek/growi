import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const ShowShortcutsModal = (props) => {

  // setup effect
  useEffect(() => {
    // show modal to create a page
    $('#shortcuts-modal').modal('toggle');

    // remove this
    props.onDeleteRender(this);
  }, [props]);

  return <></>;
};

ShowShortcutsModal.propTypes = {
  onDeleteRender: PropTypes.func.isRequired,
};

ShowShortcutsModal.getHotkeyStrokes = () => {
  return [['/+ctrl'], ['/+meta']];
};

export default ShowShortcutsModal;
