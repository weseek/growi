import { useIsomorphicLayoutEffect } from 'usehooks-ts';

import type { CommonEachProps } from '~/pages/common-props';

import {
  useCsrfToken,
  useCurrentPathname,
  useCurrentUser,
  useIsMaintenanceMode,
} from './global';

/**
 * Hook for auto-updating global UI state atoms with server-side data
 *
 * @param props - Server-side common properties from getServerSideCommonEachProps
 */
export const useAutoUpdateGlobalAtoms = (props: CommonEachProps): void => {
  // Update pathname and user atoms
  const [, setCurrentPathname] = useCurrentPathname();
  useIsomorphicLayoutEffect(() => {
    setCurrentPathname(props.currentPathname);
  }, [setCurrentPathname, props.currentPathname]);

  // Update user atom
  const [, setCurrentUser] = useCurrentUser();
  useIsomorphicLayoutEffect(() => {
    setCurrentUser(props.currentUser);
  }, [setCurrentUser, props.currentUser]);

  // Update CSRF token atom
  const [, setCsrfToken] = useCsrfToken();
  useIsomorphicLayoutEffect(() => {
    setCsrfToken(props.csrfToken);
  }, [setCsrfToken, props.csrfToken]);

  // Update maintenance mode atom
  const [, setIsMaintenanceMode] = useIsMaintenanceMode();
  useIsomorphicLayoutEffect(() => {
    setIsMaintenanceMode(props.isMaintenanceMode);
  }, [setIsMaintenanceMode, props.isMaintenanceMode]);
};
