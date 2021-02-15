import React, { FC, useState } from 'react';
import { useIsSharedUser, useCurrentUser } from '~/stores/context';
import { PageAccessoriesModalControl } from '~/components/PageAccessory/PageAccessoriesModalControl';
import { PageAccessoriesModal } from '~/components/PageAccessory/PageAccessoriesModal';

export const PageAccessories:FC = () => {
  const { data: currentUser } = useCurrentUser();
  const { data: isSharedUser = false } = useIsSharedUser();
  const [isOpenModal, setIsOpenModal] = useState(false);

  const openPageAccessoriesModal = (accessoryName:string) => {
    setIsOpenModal(true);
  };

  const closePageAccessoriesModal = () => {
    setIsOpenModal(false);
  };

  return (
    <>
      <PageAccessoriesModalControl
        isGuestUser={currentUser == null}
        isSharedUser={isSharedUser}
        onOpen={openPageAccessoriesModal}
      />
      <PageAccessoriesModal
        isGuestUser={currentUser == null}
        isSharedUser={isSharedUser}
        isOpen={isOpenModal}
        onClose={closePageAccessoriesModal}
      />
    </>
  );
};
