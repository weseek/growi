import dynamic from 'next/dynamic';
import React, { useCallback } from 'react';
import { usePageCreateModalOpened, useDrawerOpened, useIsDeviceSmallerThanMd } from '~/stores/ui';


const GrowiNavbarBottom = () => {

  const { mutate: mutatePageCreateModalOpened } = usePageCreateModalOpened();
  const { data: isDeviceSmallerThanMd } = useIsDeviceSmallerThanMd();
  const { data: isDrawerOpened, mutate: mutateDrawerOpened } = useDrawerOpened();

  // dynamic import to skip rendering at SSR
  const GlobalSearch = dynamic(() => import('./GlobalSearch'), { ssr: false });

  const openPageCreateModal = useCallback(() => mutatePageCreateModalOpened(true), [mutatePageCreateModalOpened]);

  const toggleDrawer = useCallback(() => mutateDrawerOpened(!isDrawerOpened), [isDrawerOpened, mutateDrawerOpened]);

  const additionalClasses = ['grw-navbar-bottom'];
  if (isDrawerOpened) {
    additionalClasses.push('grw-navbar-bottom-drawer-opened');
  }

  return (
    <div className="d-md-none d-edit-none fixed-bottom">

      { isDeviceSmallerThanMd && (
        <div id="grw-global-search-collapse" className="grw-global-search collapse bg-dark">
          <div className="p-3">
            <GlobalSearch dropup />
          </div>
        </div>
      ) }

      <div className={`navbar navbar-expand navbar-dark bg-primary px-0 ${additionalClasses.join(' ')}`}>

        <ul className="navbar-nav w-100">
          <li className="nav-item">
            <a
              role="button"
              className="nav-link btn-lg"
              onClick={toggleDrawer}
            >
              <i className="icon-menu"></i>
            </a>
          </li>
          <li className="nav-item mx-auto">
            <a
              role="button"
              className="nav-link btn-lg"
              data-target="#grw-global-search-collapse"
              data-toggle="collapse"
            >
              <i className="icon-magnifier"></i>
            </a>
          </li>
          <li className="nav-item">
            <a
              role="button"
              className="nav-link btn-lg"
              onClick={openPageCreateModal}
            >
              <i className="icon-pencil"></i>
            </a>
          </li>
        </ul>
      </div>

    </div>
  );
};


export default GrowiNavbarBottom;
