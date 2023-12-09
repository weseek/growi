import React from 'react';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { ListGroupItem } from 'reactstrap';

import { useCurrentPagePath } from '~/stores/page';


type MenuItemProps = {
  children: React.ReactNode
  href: string
}

const MenuItem = (props: MenuItemProps): JSX.Element => {
  const { children, href } = props;
  const router = useRouter();

  return (
    <ListGroupItem className="border-0 text-muted p-1 d-flex" tag="a" href={href} onClick={() => { router.push(href) }}>
      <span className="material-symbols-outlined fs-4 me-3">search</span>
      { children }
    </ListGroupItem>
  );
};


type SearchMethodMenuItemProps = {
  searchKeyword: string
}

export const SearchMethodMenuItem = (props: SearchMethodMenuItemProps): JSX.Element => {
  const { t } = useTranslation('commons');

  const { data: currentPagePath } = useCurrentPagePath();

  const { searchKeyword } = props;

  const shouldShowButton = searchKeyword.length > 0;

  return (
    <div>
      { shouldShowButton && (
        <MenuItem href={`/_search?q=${searchKeyword}`}>
          <span>{searchKeyword}</span>
          <div className="ms-auto">
            <span>{t('search_method_menu_item.search_in_all')}</span>
          </div>
        </MenuItem>
      )}

      <MenuItem href={`/_search?q=prefix:${currentPagePath} ${searchKeyword}`}>
        <code>prefix: {currentPagePath}</code>
        <span className="ms-2">{searchKeyword}</span>
        <div className="ms-auto">
          <span>{t('search_method_menu_item.only_children_of_this_tree')}</span>
        </div>
      </MenuItem>

      { shouldShowButton && (
        <MenuItem href={`/_search?q="${searchKeyword}"`}>
          <span>{`"${searchKeyword}"`}</span>
          <div className="ms-auto">
            <span>{t('search_method_menu_item.exact_mutch')}</span>
          </div>
        </MenuItem>
      ) }
    </div>
  );
};
