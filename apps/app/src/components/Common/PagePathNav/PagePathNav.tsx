import { DevidedPagePath } from '@growi/core/dist/models';
import { pagePathUtils } from '@growi/core/dist/utils';

import LinkedPagePath from '~/models/linked-page-path';

import { PagePathHierarchicalLink } from '../PagePathHierarchicalLink';

import type { PagePathNavLayoutProps } from './PagePathNavLayout';
import { PagePathNavLayout } from './PagePathNavLayout';

import styles from './PagePathNav.module.scss';


const { isTrashPage } = pagePathUtils;


const Separator = ({ className }: {className?: string}): JSX.Element => {
  return <span className={`separator ${className ?? ''} ${styles['grw-mx-02em']}`}>/</span>;
};

export const PagePathNav = (props: PagePathNavLayoutProps): JSX.Element => {
  const { pagePath } = props;
  const dPagePath = new DevidedPagePath(pagePath, false, true);

  const isInTrash = isTrashPage(pagePath);

  let formerLink;
  let latterLink;

  // one line
  if (dPagePath.isRoot || dPagePath.isFormerRoot) {
    const linkedPagePath = new LinkedPagePath(pagePath);
    latterLink = <PagePathHierarchicalLink linkedPagePath={linkedPagePath} isInTrash={isInTrash} />;
  }
  // two line
  else {
    const linkedPagePathFormer = new LinkedPagePath(dPagePath.former);
    const linkedPagePathLatter = new LinkedPagePath(dPagePath.latter);
    formerLink = (
      <>
        <PagePathHierarchicalLink linkedPagePath={linkedPagePathFormer} isInTrash={isInTrash} />
        <Separator />
      </>
    );
    latterLink = (
      <PagePathHierarchicalLink linkedPagePath={linkedPagePathLatter} basePath={dPagePath.former} isInTrash={isInTrash} />
    );
  }

  return (
    <PagePathNavLayout
      {...props}
      formerLink={formerLink}
      latterLink={latterLink}
    />
  );
};
