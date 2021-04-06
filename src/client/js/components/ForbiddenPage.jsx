import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import PageListIcon from './Icons/PageListIcon';
import CustomNavAndContents from './CustomNavigation/CustomNavAndContents';
import PageList from './PageList';


const ForbiddenPage = (props) => {
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
    <>
      <div className="row not-found-message-row mb-4">
        <div className="col-lg-12">
          <h2 className="text-muted">
            <i className="icon-ban mr-2" aria-hidden="true" />
            Forbidden
          </h2>
        </div>
      </div>


      <div className="row row-alerts d-edit-none">
        <div className="col-sm-12">
          <p className="alert alert-primary py-3 px-4">
            <i className="icon-fw icon-lock" aria-hidden="true" />
            {t('Browsing of this page is restricted')}
          </p>
        </div>
      </div>
      <div className="mt-5">
        <CustomNavAndContents navTabMapping={navTabMapping} />
      </div>
    </>
  );
};

ForbiddenPage.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation()(ForbiddenPage);
