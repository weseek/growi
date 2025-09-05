import React, { useEffect } from 'react';

import PropTypes from 'prop-types';

import { useCurrentPagePath } from '~/states/page';
import { usePageCreateModal } from '~/states/ui/modal/page-create';

const CreatePage = React.memo((props) => {

  const { open: openCreateModal } = usePageCreateModal();
  const currentPath = useCurrentPagePath();

  // setup effect
  useEffect(() => {
    openCreateModal(currentPath ?? '');

    // remove this
    props.onDeleteRender(this);
  }, [currentPath, openCreateModal, props]);

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
