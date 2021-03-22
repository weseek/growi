import { useRouter } from 'next/router';
import {
  FC, useState, useCallback, useEffect,
} from 'react';
import { useIsSharedUser, useCurrentUser, useNotFound } from '~/stores/context';
import { PageAccessoriesModalControl } from '~/components/PageAccessory/PageAccessoriesModalControl';
import { PageAccessoriesModal } from '~/components/PageAccessory/PageAccessoriesModal';
import { AccessoryName } from '~/interfaces/accessory';

export const PageAccessories:FC = () => {
  const router = useRouter();

  const { data: currentUser } = useCurrentUser();
  const { data: isSharedUser = false } = useIsSharedUser();
  const { data: isNotFoundPage = false } = useNotFound();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [activeTab, setActiveTab] = useState<AccessoryName>();
  // Prevent unnecessary rendering
  const [activeComponents, setActiveComponents] = useState<Set<AccessoryName>>(new Set([]));

  const switchActiveTab = useCallback((accessoryName:AccessoryName) => {
    setActiveTab(accessoryName);
    setActiveComponents(activeComponents.add(accessoryName));
  }, [activeComponents]);

  const openPageAccessoriesModal = useCallback((accessoryName:AccessoryName) => {
    setIsOpenModal(true);
    switchActiveTab(accessoryName);
  }, [switchActiveTab]);


  const closePageAccessoriesModal = useCallback(() => {
    setIsOpenModal(false);
  }, [setIsOpenModal]);


  useEffect(() => {
    const { compare } = router.query;
    // show the Page accessory modal when query of "compare" is requested
    if (compare != null) {
      setIsOpenModal(true);
      switchActiveTab(AccessoryName.PAGE_HISTORY);
    }
  }, [router.query, switchActiveTab]);


  return (
    <>
      <PageAccessoriesModalControl
        isGuestUser={currentUser == null}
        isSharedUser={isSharedUser}
        onOpen={openPageAccessoriesModal}
        isNotFoundPage={isNotFoundPage}
      />
      {activeTab && (
        <PageAccessoriesModal
          isGuestUser={currentUser == null}
          isSharedUser={isSharedUser}
          isOpen={isOpenModal}
          onClose={closePageAccessoriesModal}
          activeTab={activeTab}
          activeComponents={activeComponents}
          isNotFoundPage={isNotFoundPage}
          switchActiveTab={switchActiveTab}
        />
      )}
    </>
  );
};
