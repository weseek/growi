import dynamic from 'next/dynamic';
import React from 'react';

import { useCustomizeSettingsSWR } from '~/stores/admin';

import { CustomizeThemeSetting } from '~/components/Admin/Customize/CustomizeThemeSetting';
import { CustomizeFunctionSetting } from '~/components/Admin/Customize/CustomizeFunctionSetting';
import { CustomizeHighlightSetting } from '~/components/Admin/Customize/CustomizeHighlightSetting';
import { CustomizeTitle } from '~/components/Admin/Customize/CustomizeTitle';
// import CustomizeHeaderSetting from '~/client/js/components/Admin/Customize/CustomizeHeaderSetting';
// import CustomizeCssSetting from '~/client/js/components/Admin/Customize/CustomizeCssSetting';
// import CustomizeScriptSetting from '~/client/js/components/Admin/Customize/CustomizeScriptSetting';

import { useTranslation } from '~/i18n';

const CustomizeSettingContents = (): JSX.Element => {
  const { t }= useTranslation()

  // disable SSR to check dark mode at CustomizeLayoutSetting
  const CustomizeLayoutSetting = dynamic(() => import('../../../client/js/components/Admin/Customize/CustomizeLayoutSetting'), { ssr: false });

  const { error, data } = useCustomizeSettingsSWR();

  // TODO impl alert for display error message
  if (error != null) {
    return <></>;
  }

  if (data == null) {
    return (
      <div className="my-5 text-center">
        <i className="fa fa-lg fa-spinner fa-pulse mx-auto text-muted" />
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="mb-5">
        <CustomizeLayoutSetting t={t} />
      </div>
      <div className="mb-5">
        <CustomizeThemeSetting />
      </div>
      <div className="mb-5">
        <CustomizeFunctionSetting />
      </div>
      <div className="mb-5">
        <CustomizeHighlightSetting />
      </div>
      <div className="mb-5">
        <CustomizeTitle />
      </div>
      {/* <div className="mb-5">
        <CustomizeHeaderSetting />
      </div>
      <div className="mb-5">
        <CustomizeCssSetting />
      </div>
      <div className="mb-5">
        <CustomizeScriptSetting />
      </div> */}
    </React.Fragment>
  );
};

export default CustomizeSettingContents;
