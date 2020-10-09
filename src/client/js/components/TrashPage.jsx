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
    tabContent: 'Trash page list',
    index: 0,
  },
  tab2:  {
    icon: '',
    i18n: 'Nav tab 2',
    tabContent: 'Nav contents 2',
    index: 1,
  },
  tab3:  {
    icon: '',
    i18n: 'Nav tab 3',
    tabContent: 'Nav contents 3',
    index: 2,
  },
};

const TrashPage = () => {
  return (
    <div className="grw-trash-page">
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
