import React from 'react';

import { useIsSearchPage, useCurrentPathname } from '~/stores/context';
import { usePageCreateModal } from '~/stores/modal';
import { useSWRxCurrentPage } from '~/stores/page';
import { useIsDeviceSmallerThanMd, useDrawerOpened } from '~/stores/ui';

import GlobalSearch from './GlobalSearch';

const GrowiNavbarBottom = (props) => {

  const { data: isDrawerOpened, mutate: mutateDrawerOpened } = useDrawerOpened();
  const { data: isDeviceSmallerThanMd } = useIsDeviceSmallerThanMd();
  const { open: openCreateModal } = usePageCreateModal();
  const { data: isSearchPage } = useIsSearchPage();
  const { data: currentPathname } = useCurrentPathname();
  const { data: currentPage } = useSWRxCurrentPage();

  const basePath = currentPage?.path ?? currentPathname ?? '';

  const additionalClasses = ['grw-navbar-bottom'];
  if (isDrawerOpened) {
    additionalClasses.push('grw-navbar-bottom-drawer-opened');
  }

  return (
    <div className="d-md-none d-edit-none fixed-bottom">

      { isDeviceSmallerThanMd && !isSearchPage && (
        <div id="grw-global-search-collapse" className="grw-global-search collapse bg-dark">
          <div className="p-3">
            <GlobalSearch dropup />
          </div>
        </div>
      ) }

      <div className={`navbar navbar-expand navbar-dark bg-primary px-0 ${additionalClasses.join(' ')}`}>

        <ul className="navbar-nav w-100">
          <li className="nav-item mr-auto">
            <a
              role="button"
              className="nav-link btn-lg"
              onClick={() => mutateDrawerOpened(true)}
            >
              <i className="icon-menu"></i>
            </a>
          </li>
          {
            !isSearchPage && (
              <li className="nav-item">
                <a
                  role="button"
                  className="nav-link btn-lg"
                  data-target="#grw-global-search-collapse"
                  data-toggle="collapse"
                >
                  <i className="icon-magnifier"></i>
                </a>
              </li>
            )
          }
          <li className="nav-item ml-auto">
            <a
              role="button"
              className="nav-link btn-lg"
              onClick={() => openCreateModal(basePath || '')}
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
