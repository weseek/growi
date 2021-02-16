import { FC, useState, useCallback } from 'react';
import { useIsSharedUser, useCurrentUser } from '~/stores/context';
import { PageAccessoriesModalControl } from '~/components/PageAccessory/PageAccessoriesModalControl';
import { PageAccessoriesModal } from '~/components/PageAccessory/PageAccessoriesModal';

export const PageAccessories:FC = () => {
  const { data: currentUser } = useCurrentUser();
  const { data: isSharedUser = false } = useIsSharedUser();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  // Prevent unnecessary rendering
  const [activeComponents, setActiveComponents] = useState(new Set(['']));

  const switchActiveTab = useCallback((accessoryName:string) => {
    setActiveTab(accessoryName);
    setActiveComponents(activeComponents.add(activeTab));
  }, [activeComponents, activeTab]);

  const openPageAccessoriesModal = useCallback((accessoryName:string) => {
    setIsOpenModal(true);
    switchActiveTab(accessoryName);
  }, [switchActiveTab]);


  const closePageAccessoriesModal = useCallback(() => {
    setIsOpenModal(false);
  }, [setIsOpenModal]);

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
        activeTab={activeTab}
        activeComponents={activeComponents}
      />
    </>
  );
};
