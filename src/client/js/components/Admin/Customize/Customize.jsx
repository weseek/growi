
import React, { Fragment, Suspense } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import AppContainer from '../../../services/AppContainer';
import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';

import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import CustomizeLayoutSetting from './CustomizeLayoutSetting';
import CustomizeFunctionSetting from './CustomizeFunctionSetting';
import CustomizeHighlightSetting from './CustomizeHighlightSetting';
import CustomizeCssSetting from './CustomizeCssSetting';
import CustomizeScriptSetting from './CustomizeScriptSetting';
import CustomizeHeaderSetting from './CustomizeHeaderSetting';
import CustomizeTitle from './CustomizeTitle';

function Customize(props) {
  return (
    <Suspense
      fallback={(
        <div className="row">
          <i className="fa fa-5x fa-spinner fa-pulse mx-auto text-muted"></i>
        </div>
      )}
    >
      <RenderCustomizeWrapper />
    </Suspense>
  );
}

function RenderCustomizeWrapper(props) {
  if (props.adminCustomizeContainer.state.currentTheme === props.adminAppContainer.dummyCurrentTheme) {
    throw new Promise(async() => {
      try {
        await adminCustomizeContainer.retrieveCustomizeData();
        this.setState({ isRetrieving: false });
      }
      catch (err) {
        toastError(err);
        props.adminAppContainer.setState({ retrieveError: err.message });
        logger.error(err);
      }
    });
  }

  return (
    <Fragment>
      <div className="mb-5">
        <CustomizeLayoutSetting />
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

const RenderCustomizeWrapper = withUnstatedContainers(RenderCustomizePage, [AppContainer, AdminCustomizeContainer]);

RenderCustomizePage.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default Customize;
