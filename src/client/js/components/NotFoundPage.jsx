import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import PageListIcon from './Icons/PageListIcon';
import TimeLineIcon from './Icons/TimeLineIcon';
import CustomNavigation from './CustomNavigation';
import PageList from './PageList';
import PageTimeline from './PageTimeline';

const NotFoundPage = (props) => {
  const { t } = props;

  const navTabMapping = {
    pagelist: {
      Icon: PageListIcon,
      Content: PageList,
      i18n: t('page_list'),
      index: 0,
    },
    timeLine: {
      Icon: TimeLineIcon,
      Content: PageTimeline,
      i18n: t('Timeline View'),
      index: 1,
    },
  };

  return (
    <div className="grw-custom-navigation mt-5 on-edit">
      <CustomNavigation navTabMapping={navTabMapping} />
    </div>
  );
};

NotFoundPage.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
};

export default withTranslation()(NotFoundPage);
