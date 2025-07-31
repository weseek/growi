import { useEffect, useLayoutEffect } from 'react';

import type { CommonProps } from '../../pages/utils/commons';
import {
  useCurrentPathname,
  useCurrentUser,
  useCsrfToken,
} from '../global';

/**
 * Hook for auto-updating global UI state atoms with server-side data
 *
 * @param commonProps - Server-side common properties from getServerSideCommonProps
 */
export const useAutoUpdateGlobalAtoms = (commonProps: CommonProps): void => {
  // Update pathname and user atoms
  const [, setCurrentPathname] = useCurrentPathname();
  useLayoutEffect(() => {
    setCurrentPathname(commonProps.currentPathname);
  }, [setCurrentPathname, commonProps.currentPathname]);

  // Update user atom
  const [, setCurrentUser] = useCurrentUser();
  useLayoutEffect(() => {
    setCurrentUser(commonProps.currentUser);
  }, [setCurrentUser, commonProps.currentUser]);

  // Update CSRF token atom
  const [, setCsrfToken] = useCsrfToken();
  useEffect(() => {
    setCsrfToken(commonProps.csrfToken);
  }, [setCsrfToken, commonProps.csrfToken]);

};
