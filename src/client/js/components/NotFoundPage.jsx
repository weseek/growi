import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import PageListIcon from './Icons/PageListIcon';
import TimeLineIcon from './Icons/TimeLineIcon';
import CustomNavAndContents from './CustomNavigation/CustomNavAndContents';
import { PageList } from '~/components/PageAccessory/PageList';

const NotFoundPage = (props) => {
  const { t } = props;

  const navTabMapping = useMemo(() => {
    return {
      pagelist: {
        Icon: PageListIcon,
        Content: PageList,
        i18n: t('page_list'),
        index: 0,
      },
      timeLine: {
        Icon: TimeLineIcon,
        Content: <PageList isTimeLine />,
        i18n: t('Timeline View'),
        index: 1,
      },
    };
  }, [t]);


  return (
    <div className="mt-5 d-edit-none">
      <CustomNavAndContents navTabMapping={navTabMapping} />
    </div>
  );
};

NotFoundPage.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
};

export default withTranslation()(NotFoundPage);
