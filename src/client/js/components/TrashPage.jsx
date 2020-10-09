import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import PageListIcon from './Icons/PageListIcon';

import { withUnstatedContainers } from './UnstatedUtils';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';
import CustomNavbar from './CustomNavbar';

// import PaginationWrapper from './PaginationWrapper';[TODO]

const navTabMapping = {
  pagelist: {
    icon: <PageListIcon />,
    i18n: 'page_list',
    // [TODO: show trash page list by gw4064]
    tabContent: 'This is a page list of Trash pages',
    index: 0,
  },
  timeline:  {
    icon: '',
    i18n: 'Timeline View',
    tabContent: 'bbb',
    index: 1,
  },
};

const TrashPage = () => {
  return (
    <div className="grw-trash-page-list">
      <CustomNavbar navTabMapping={navTabMapping} />
    </div>
  );
};

const PageListWrapper = withUnstatedContainers(TrashPage, [AppContainer, PageContainer]);


TrashPage.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer),
  pageContainer: PropTypes.instanceOf(PageContainer),
};

export default withTranslation()(PageListWrapper);
