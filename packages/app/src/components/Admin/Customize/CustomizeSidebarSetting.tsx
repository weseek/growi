import React from 'react';

import { useTranslation } from 'react-i18next';

const CustomizeSidebarsetting = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <React.Fragment>
      <div className="row">
        <div className="col-12">
          <h2 className="admin-setting-header">{t('admin:customize_setting.default_sidebar_mode')}</h2>
        </div>
      </div>
    </React.Fragment>
  );
};

export default CustomizeSidebarsetting;
