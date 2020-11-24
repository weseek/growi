import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import PageListIcon from './Icons/PageListIcon';
import CustomNavAndContents from './CustomNavigation/CustomNavAndContents';
import PageList from './PageList';


const TrashPageList = (props) => {
  const { t } = props;

  const navTabMapping = useMemo(() => {
    return {
      pagelist: {
        Icon: PageListIcon,
        Content: PageList,
        i18n: t('page_list'),
        index: 0,
      },
    };
  }, [t]);

  return (
    <div className="mt-5 d-edit-none">
      <CustomNavAndContents navTabMapping={navTabMapping} />
    </div>
  );
};

TrashPageList.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
};

export default withTranslation()(TrashPageList);
