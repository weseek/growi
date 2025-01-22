import React, { useEffect } from 'react';

import { useShortcutsModal } from '~/stores/modal';

type Props = {
  onDeleteRender: () => void,
}
const ShowShortcutsModal = (props: Props): React.ReactElement => {

  const { data: status, open } = useShortcutsModal();

  const { onDeleteRender } = props;

  // setup effect
  useEffect(() => {
    if (status == null) {
      return;
    }

    if (!status.isOpened) {
      open();
      // remove this
      onDeleteRender();
    }
  }, [onDeleteRender, open, status]);

  return <></>;
};

ShowShortcutsModal.getHotkeyStrokes = () => {
  return [['/+ctrl'], ['/+meta']];
};

export default ShowShortcutsModal;
