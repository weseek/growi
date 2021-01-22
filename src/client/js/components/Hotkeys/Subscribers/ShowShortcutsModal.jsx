import React from 'react';
import PropTypes from 'prop-types';
import ShortcutsModal from '~/components/ShortcutsModal';

const ShowShortcutsModal = (props) => {

  return <ShortcutsModal onClosed={() => props.onDeleteRender(this)} />;

};

ShowShortcutsModal.propTypes = {
  onDeleteRender: PropTypes.func.isRequired,
};

ShowShortcutsModal.getHotkeyStrokes = () => {
  return [['/+ctrl'], ['/+meta']];
};

export default ShowShortcutsModal;
