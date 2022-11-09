import React, { FC } from 'react';

import { useTranslation } from 'next-i18next';
import Link from 'next/link';

type SidebarHeaderProps = {
  title: string,
  hasButton?: boolean,
  isCustom?: boolean,
  onClick?,
  children?
}

export const SidebarHeader: FC<SidebarHeaderProps> = (props: SidebarHeaderProps) => {

  const { t } = useTranslation();

  return (
    <div className="grw-sidebar-content-header p-3 d-flex">
      <h3 className="mb-0 text-nowrap">
        {t(props.title)}
        { props.isCustom && (<Link href="/Sidebar"><a className="h6 ml-2"><i className="icon-pencil"></i></a></Link>) }
      </h3>
      { props.hasButton && (<button type="button" className="btn btn-sm ml-auto grw-btn-reload" onClick={() => props.onClick()}>
        <i className="icon icon-reload"></i>
      </button>) }
      { props.children }
    </div>
  );
};
