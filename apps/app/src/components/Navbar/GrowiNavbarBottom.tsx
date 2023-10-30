import React from 'react';

import { useIsSearchPage } from '~/stores/context';
import { usePageCreateModal } from '~/stores/modal';
import { useCurrentPagePath } from '~/stores/page';
import { useIsDeviceLargerThanMd, useDrawerOpened } from '~/stores/ui';

import { GlobalSearch } from './GlobalSearch';

import styles from './GrowiNavbarBottom.module.scss';


export const GrowiNavbarBottom = (): JSX.Element => {

  const { data: isDrawerOpened, mutate: mutateDrawerOpened } = useDrawerOpened();
  const { data: isDeviceLargerThanMd } = useIsDeviceLargerThanMd();
  const { open: openCreateModal } = usePageCreateModal();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: isSearchPage } = useIsSearchPage();

  const additionalClasses = [styles['grw-navbar-bottom']];
  if (isDrawerOpened) {
    additionalClasses.push('grw-navbar-bottom-drawer-opened');
  }

  return (
    <div className="d-md-none d-edit-none fixed-bottom">

      { !isDeviceLargerThanMd && !isSearchPage && (
        <div id="grw-global-search-collapse" className="grw-global-search collapse bg-dark">
          <div className="p-3">
            <GlobalSearch dropup />
          </div>
        </div>
      ) }

      <div className={`navbar navbar-expand px-4 px-sm-5 ${additionalClasses.join(' ')}`}>

        <ul className="navbar-nav flex-grow-1 d-flex align-items-center justify-content-between">
          <li className="nav-item">
            <a
              role="button"
              className="nav-link btn-lg"
              onClick={() => mutateDrawerOpened(true)}
            >
              <span className="material-symbols-outlined fs-2">reorder</span>
            </a>
          </li>

          <li className="nav-item">
            <a
              role="button"
              className="nav-link btn-lg"
              onClick={() => openCreateModal(currentPagePath || '')}
            >
              <span className="material-symbols-outlined fs-2">edit</span>
            </a>
          </li>

          {
            !isSearchPage && (
              <li className="nav-item">
                <a
                  role="button"
                  className="nav-link btn-lg"
                  data-bs-target="#grw-global-search-collapse"
                  data-bs-toggle="collapse"
                >
                  <span className="material-symbols-outlined fs-2">search</span>
                </a>
              </li>
            )
          }

          <li className="nav-item">
            <a
              role="button"
              className="nav-link btn-lg"
              onClick={() => {}}
            >
              <span className="material-symbols-outlined fs-2">notifications</span>
            </a>
          </li>

        </ul>
      </div>

    </div>
  );
};
