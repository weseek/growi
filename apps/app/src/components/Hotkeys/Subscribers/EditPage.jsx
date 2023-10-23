import { useEffect } from 'react';

import PropTypes from 'prop-types';

import { useIsEditablePage } from '~/stores/page';
import { EditorMode, useEditorMode } from '~/stores/ui';

const EditPage = (props) => {
  const { data: isEditablePage } = useIsEditablePage();
  const { mutate: mutateEditorMode } = useEditorMode();

  // setup effect
  useEffect(() => {
    if (!isEditablePage) {
      return;
    }

    // ignore when dom that has 'modal in' classes exists
    if (document.getElementsByClassName('modal in').length > 0) {
      return;
    }

    mutateEditorMode(EditorMode.Editor);

    // remove this
    props.onDeleteRender(this);
  }, [isEditablePage, mutateEditorMode, props]);

  return null;
};

EditPage.propTypes = {
  onDeleteRender: PropTypes.func.isRequired,
};

EditPage.getHotkeyStrokes = () => {
  return [['e']];
};

export default EditPage;
