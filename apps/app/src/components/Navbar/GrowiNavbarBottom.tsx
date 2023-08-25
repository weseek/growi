import React from 'react';

import { useIsSearchPage } from '~/stores/context';
import { usePageCreateModal } from '~/stores/modal';
import { useCurrentPagePath } from '~/stores/page';
import { useIsDeviceSmallerThanMd, useDrawerOpened } from '~/stores/ui';

import { GlobalSearch } from './GlobalSearch';

import styles from './GrowiNavbarBottom.module.scss';


export const GrowiNavbarBottom = (): JSX.Element => {

  const { data: isDrawerOpened, mutate: mutateDrawerOpened } = useDrawerOpened();
  const { data: isDeviceSmallerThanMd } = useIsDeviceSmallerThanMd();
  const { open: openCreateModal } = usePageCreateModal();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: isSearchPage } = useIsSearchPage();

  const additionalClasses = ['grw-navbar-bottom', styles['grw-navbar-bottom']];
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
          <li className="nav-item me-auto">
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
                  data-bs-toggle="collapse"
                >
                  <i className="icon-magnifier"></i>
                </a>
              </li>
            )
          }
          <li className="nav-item ms-auto">
            <a
              role="button"
              className="nav-link btn-lg"
              onClick={() => openCreateModal(currentPagePath || '')}
            >
              <i className="icon-pencil"></i>
            </a>
          </li>
        </ul>
      </div>

    </div>
  );
};
