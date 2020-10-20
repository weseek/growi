import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import PageListIcon from './Icons/PageListIcon';
import TimeLineIcon from './Icons/TimeLineIcon';
import CustomNavigation from './CustomNavigation';
import PageList from './PageList';
import PageTimeline from './PageTimeline';
import { withUnstatedContainers } from './UnstatedUtils';
import NavigationContainer from '../services/NavigationContainer';


const NotFoundPage = (props) => {
  const { t, navigationContainer } = props;
  const { editorMode } = navigationContainer.state;

  const navTabMapping = {
    pagelist: {
      icon: <PageListIcon />,
      i18n: t('page_list'),
      tabContent: <PageList />,
      index: 0,
    },
    timeLine: {
      icon: <TimeLineIcon />,
      i18n: t('Timeline View'),
      tabContent: <PageTimeline />,
      index: 1,
    },
  };

  if (editorMode === 'view') {
    return (
      <div className="grw-custom-navigation mt-5">
        <CustomNavigation navTabMapping={navTabMapping} />
      </div>
    );
  }
  return null;
};

/**
 * Wrapper component for using unstated
 */
const NotFoundPageWrapper = withUnstatedContainers(NotFoundPage, [NavigationContainer]);

NotFoundPage.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};

export default withTranslation()(NotFoundPageWrapper);
