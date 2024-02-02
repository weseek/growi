import { useEffect } from 'react';

import { useSearchModal } from '~/features/search/client/stores/search';
import { useIsEditable } from '~/stores/context';


const FocusToGlobalSearch = (props) => {
  const { data: isEditable } = useIsEditable();
  const { open: openSearchModal } = useSearchModal();

  // setup effect
  useEffect(() => {
    if (!isEditable) {
      return;
    }

    openSearchModal();

  }, [isEditable, openSearchModal, props]);

  return null;
};

FocusToGlobalSearch.getHotkeyStrokes = () => {
  return [['/']];
};

export default FocusToGlobalSearch;
