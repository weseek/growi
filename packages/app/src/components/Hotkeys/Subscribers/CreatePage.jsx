import React, { useEffect } from 'react';

import PropTypes from 'prop-types';

import { usePageCreateModal } from '~/stores/modal';
import { useCurrentPagePath } from '~/stores/page';

const CreatePage = React.memo((props) => {

  const { open: openCreateModal } = usePageCreateModal();
  const { data: currentPath = '' } = useCurrentPagePath();

  // setup effect
  useEffect(() => {
    openCreateModal(currentPath);

    // remove this
    props.onDeleteRender(this);
  }, [openCreateModal, props]);

  return <></>;
});

CreatePage.propTypes = {
  onDeleteRender: PropTypes.func.isRequired,
};

CreatePage.getHotkeyStrokes = () => {
  return [['c']];
};

CreatePage.displayName = 'CreatePage';

export default CreatePage;
