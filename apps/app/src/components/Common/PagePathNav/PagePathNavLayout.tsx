// import type { ReactNode } from 'react';
import React, { useState } from 'react';

import dynamic from 'next/dynamic';

import { useIsNotFound } from '~/stores/page';

import styles from './PagePathNav.module.scss';

const moduleClass = styles['grw-page-path-nav-layout'] ?? '';

export type PagePathNavLayoutProps = {
  className?: string,
  pagePath: string,
  pageId?: string | null,
  isWipPage?: boolean,
  maxWidth?: number,
  formerLinkClassName?: string,
  latterLinkClassName?: string,
}

type Props = PagePathNavLayoutProps & {
  formerLink?: React.ReactNode,
  latterLink?: React.ReactNode,
}

const CopyDropdown = dynamic(() => import('~/client/components/Common/CopyDropdown').then(mod => mod.CopyDropdown), { ssr: false });

export const PagePathNavLayout = (props: Props): JSX.Element => {
  const {
    className = '',
    pageId, pagePath, isWipPage,
    formerLink,
    formerLinkClassName = '',
    latterLink,
    latterLinkClassName = '',
    maxWidth,
  } = props;

  const { data: isNotFound } = useIsNotFound();

  const copyDropdownId = `copydropdown-${pageId}`;

  const [, setIsHovered] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hideTimeout) clearTimeout(hideTimeout); // 非表示タイマーをリセット
    setIsHovered(true); // ボタンを表示
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => setIsHovered(false), 3000); // 3秒後にボタンを非表示
    setHideTimeout(timeout);
  };

  return (
    <div
      className={`${className} ${moduleClass}`}
      style={{ maxWidth }}
    >
      <span className={`${formerLinkClassName ?? ''} ${styles['grw-former-link']}`}>{formerLink}</span>
      <div className="d-flex align-items-center">
        <h1 className={`m-0 ${latterLinkClassName}`}>
          {latterLink}
        </h1>
        { pageId != null && !isNotFound && (
          <div className="d-flex align-items-center ms-2">
            { isWipPage && (
              <span className="badge text-bg-secondary ms-1 me-1">WIP</span>
            )}
            <span
              className=" grw-page-path-nav-copydropdown"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <CopyDropdown pageId={pageId} pagePath={pagePath} dropdownToggleId={copyDropdownId} dropdownToggleClassName="p-2">
                <span className="material-symbols-outlined">content_paste</span>
              </CopyDropdown>
            </span>
          </div>
        ) }
      </div>
    </div>
  );
};
