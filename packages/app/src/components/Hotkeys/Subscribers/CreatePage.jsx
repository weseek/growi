import React, { useEffect } from 'react';

import PropTypes from 'prop-types';

import { useCurrentPathname } from '~/stores/context';
import { usePageCreateModal } from '~/stores/modal';
import { useSWRxCurrentPage } from '~/stores/page';

const CreatePage = React.memo((props) => {

  const { open: openCreateModal } = usePageCreateModal();
  const { data: currentPathname = '' } = useCurrentPathname();
  const { data: currentPage } = useSWRxCurrentPage();

  const basePath = currentPage?.path ?? currentPathname ?? '';


  // setup effect
  useEffect(() => {
    openCreateModal(basePath);

    // remove this
    props.onDeleteRender(this);
  }, [openCreateModal, props, basePath]);

  return <></>;
});

CreatePage.propTypes = {
  onDeleteRender: PropTypes.func.isRequired,
};

CreatePage.getHotkeyStrokes = () => {
  return [['c']];
};

export default CreatePage;
