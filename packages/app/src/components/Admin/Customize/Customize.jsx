
import React from 'react';

import PropTypes from 'prop-types';

import AdminCustomizeContainer from '~/client/services/AdminCustomizeContainer';
import { toastError } from '~/client/util/apiNotification';
import { toArrayIfNot } from '~/utils/array-utils';
import loggerFactory from '~/utils/logger';

import { withUnstatedContainers } from '../../UnstatedUtils';

import CustomizeCssSetting from './CustomizeCssSetting';
import CustomizeFunctionSetting from './CustomizeFunctionSetting';
import CustomizeHeaderSetting from './CustomizeHeaderSetting';
import CustomizeHighlightSetting from './CustomizeHighlightSetting';
import CustomizeLayoutSetting from './CustomizeLayoutSetting';
import CustomizeLogoSetting from './CustomizeLogoSetting';
import CustomizeScriptSetting from './CustomizeScriptSetting';
import CustomizeSidebarSetting from './CustomizeSidebarSetting';
import CustomizeThemeSetting from './CustomizeThemeSetting';
import CustomizeTitle from './CustomizeTitle';

const logger = loggerFactory('growi:services:AdminCustomizePage');

const retrieveErrors = null;
function Customize(props) {
  const { adminCustomizeContainer } = props;

  // if (adminCustomizeContainer.state.currentTheme === adminCustomizeContainer.dummyCurrentTheme) {
  //   throw (async() => {
  //     try {
  //       await adminCustomizeContainer.retrieveCustomizeData();
  //     }
  //     catch (err) {
  //       const errs = toArrayIfNot(err);
  //       toastError(errs);
  //       logger.error(errs);
  //       retrieveErrors = errs;
  //       adminCustomizeContainer.setState({ currentTheme: adminCustomizeContainer.dummyCurrentThemeForError });
  //     }
  //   })();
  // }

  // if (adminCustomizeContainer.state.currentTheme === adminCustomizeContainer.dummyCurrentThemeForError) {
  //   throw new Error(`${retrieveErrors.length} errors occured`);
  // }

  return (
    <div data-testid="admin-customize">
      <div className="mb-5">
        <CustomizeLayoutSetting />
      </div>
      <div className="mb-5">
        <CustomizeThemeSetting />
      </div>
      <div className="mb-5">
        {/* TODO: [resolve browser err] A component is changing an uncontrolled input to be controlled. by https://redmine.weseek.co.jp/issues/101155
          <CustomizeSidebarSetting />
        */}
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
      {/* TODO: show CustomizeHeaderSetting, CustomizeCssSetting and CustomizeScriptSetting by https://redmine.weseek.co.jp/issues/100534
      <div className="mb-5">
        <CustomizeHeaderSetting />
      </div>
      <div className="mb-5">
        <CustomizeCssSetting />
      </div>
      <div className="mb-5">
        <CustomizeScriptSetting />
      </div>
    */}
      <div className="mb-5">
        <CustomizeLogoSetting />
      </div>
    </div>
  );
}

const CustomizePageWithUnstatedContainer = withUnstatedContainers(Customize, [AdminCustomizeContainer]);

Customize.propTypes = {
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default CustomizePageWithUnstatedContainer;
