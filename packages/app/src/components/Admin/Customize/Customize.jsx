
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import loggerFactory from '~/utils/logger';
import AdminCustomizeContainer from '~/client/services/AdminCustomizeContainer';
import AppContainer from '~/client/services/AppContainer';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '~/client/util/apiNotification';
import { toArrayIfNot } from '~/utils/array-utils';
import { withLoadingSppiner } from '../../SuspenseUtils';

import CustomizeLayoutSetting from './CustomizeLayoutSetting';
import CustomizeThemeSetting from './CustomizeThemeSetting';
import CustomizeFunctionSetting from './CustomizeFunctionSetting';
import CustomizeHighlightSetting from './CustomizeHighlightSetting';
import CustomizeCssSetting from './CustomizeCssSetting';
import CustomizeScriptSetting from './CustomizeScriptSetting';
import CustomizeHeaderSetting from './CustomizeHeaderSetting';
import CustomizeTitle from './CustomizeTitle';

const logger = loggerFactory('growi:services:AdminCustomizePage');

let retrieveErrors = null;
function Customize(props) {
  const { appContainer, adminCustomizeContainer } = props;

  if (adminCustomizeContainer.state.currentTheme === adminCustomizeContainer.dummyCurrentTheme) {
    throw (async() => {
      try {
        await adminCustomizeContainer.retrieveCustomizeData();
      }
      catch (err) {
        const errs = toArrayIfNot(err);
        toastError(errs);
        logger.error(errs);
        retrieveErrors = errs;
        adminCustomizeContainer.setState({ currentTheme: adminCustomizeContainer.dummyCurrentThemeForError });
      }
    })();
  }

  if (adminCustomizeContainer.state.currentTheme === adminCustomizeContainer.dummyCurrentThemeForError) {
    throw new Error(`${retrieveErrors.length} errors occured`);
  }

  return (
    <Fragment>
      <div className="mb-5">
        <CustomizeLayoutSetting appContainer={appContainer} />
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
      <div className="mb-5">
        <CustomizeHeaderSetting />
      </div>
      <div className="mb-5">
        <CustomizeCssSetting />
      </div>
      <div className="mb-5">
        <CustomizeScriptSetting />
      </div>
    </Fragment>
  );
}

const CustomizePageWithUnstatedContainer = withUnstatedContainers(withLoadingSppiner(Customize), [AppContainer, AdminCustomizeContainer]);

Customize.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default CustomizePageWithUnstatedContainer;
