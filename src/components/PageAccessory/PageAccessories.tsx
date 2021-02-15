import React, { FC } from 'react';
import { useIsSharedUser, useCurrentUser } from '~/stores/context';

export const PageAccessories:FC = () => {
  const { data: currentUser } = useCurrentUser();
  const { data: isSharedUser } = useIsSharedUser();

  return <p>hoge</p>;
};

// const DeprecatePageAccessories = (props) => {
//   return (
//     <>
//       <PageAccessoriesModalControl
//         isGuestUser={isGuestUser}
//         isSharedUser={isSharedUser}
//       />
//       <PageAccessoriesModal
//         isGuestUser={isGuestUser}
//         isSharedUser={isSharedUser}
//         isOpen={pageAccessoriesContainer.state.isPageAccessoriesModalShown}
//         onClose={pageAccessoriesContainer.closePageAccessoriesModal}
//       />
//     </>
//   );
// };
