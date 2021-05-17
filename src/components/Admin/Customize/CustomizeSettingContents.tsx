import React from 'react';

import { useCustomizeSettingsSWR } from '~/stores/admin';

// import CustomizeLayoutSetting from '~/client/js/components/Admin/Customize/CustomizeLayoutSetting';
import { CustomizeThemeSetting } from '~/components/Admin/Customize/CustomizeThemeSetting';
import { CustomizeFunctionSetting } from '~/components/Admin/Customize/CustomizeFunctionSetting';
import { CustomizeHighlightSetting } from '~/components/Admin/Customize/CustomizeHighlightSetting';
import { CustomizeTitle } from '~/components/Admin/Customize/CustomizeTitle';
// import CustomizeHeaderSetting from '~/client/js/components/Admin/Customize/CustomizeHeaderSetting';
// import CustomizeCssSetting from '~/client/js/components/Admin/Customize/CustomizeCssSetting';
// import CustomizeScriptSetting from '~/client/js/components/Admin/Customize/CustomizeScriptSetting';

const CustomizeSettingContents = (): JSX.Element => {
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
      {/* <div className="mb-5">
        <CustomizeLayoutSetting />
      </div> */}
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
