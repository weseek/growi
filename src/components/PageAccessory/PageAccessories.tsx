import React, { FC } from 'react';
import { useIsSharedUser, useCurrentUser } from '~/stores/context';
import { PageAccessoriesModalControl } from '~/components/PageAccessory/PageAccessoriesModalControl';

export const PageAccessories:FC = () => {
  const { data: currentUser } = useCurrentUser();
  const { data: isSharedUser } = useIsSharedUser();

  return (
    <PageAccessoriesModalControl
      isGuestUser={currentUser == null}
      isSharedUser={isSharedUser}
    />
  );
};

// const DeprecatePageAccessories = (props) => {
//   return (
//     <>
//       <PageAccessoriesModal
//         isGuestUser={isGuestUser}
//         isSharedUser={isSharedUser}
//         isOpen={pageAccessoriesContainer.state.isPageAccessoriesModalShown}
//         onClose={pageAccessoriesContainer.closePageAccessoriesModal}
//       />
//     </>
//   );
// };
