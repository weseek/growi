import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { useCreateModalStatus } from '~/stores/ui';

const CreatePage = React.memo((props) => {

  const { open: openCreateModal } = useCreateModalStatus();

  // setup effect
  useEffect(() => {
    openCreateModal();

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

export default CreatePage;
