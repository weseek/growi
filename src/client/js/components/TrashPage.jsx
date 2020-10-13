import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import PageListIcon from './Icons/PageListIcon';
import CustomNavigation from './CustomNavigation';


const TrashPage = (props) => {
  const { t } = props;

  const navTabMapping = {
    pagelist: {
      icon: <PageListIcon />,
      i18n: t('page_list'),
      // [TODO: show trash page list by gw4064]
      tabContent: t('Trash page list'),
      index: 0,
    },
  };

  return (
    <div className="grw-trash-page mt-5">
      <CustomNavigation navTabMapping={navTabMapping} />
    </div>
  );
};

TrashPage.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
};

export default withTranslation()(TrashPage);
