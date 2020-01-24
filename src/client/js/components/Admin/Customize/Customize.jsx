
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import loggerFactory from '@alias/logger';

import AppContainer from '../../../services/AppContainer';
import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';

import { createSubscribedElement } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import CustomizeLayoutSetting from './CustomizeLayoutSetting';
import CustomizeBehaviorSetting from './CustomizeBehaviorSetting';
import CustomizeFunctionSetting from './CustomizeFunctionSetting';
import CustomizeHighlightSetting from './CustomizeHighlightSetting';
import CustomizeCssSetting from './CustomizeCssSetting';
import CustomizeScriptSetting from './CustomizeScriptSetting';
import CustomizeHeaderSetting from './CustomizeHeaderSetting';
import CustomizeTitle from './CustomizeTitle';

const logger = loggerFactory('growi:Customize');

class Customize extends React.Component {

  async componentDidMount() {
    const { adminCustomizeContainer } = this.props;

    try {
      await adminCustomizeContainer.retrieveCustomizeData();
    }
    catch (err) {
      toastError(err);
      adminCustomizeContainer.setState({ retrieveError: err.message });
      logger.error(err);
    }

  }

  render() {

    return (
      <Fragment>
        <div className="mb-5">
          <CustomizeLayoutSetting />
        </div>
        <div className="mb-5">
          <CustomizeBehaviorSetting />
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

}

const CustomizeWrapper = (props) => {
  return createSubscribedElement(Customize, props, [AppContainer, AdminCustomizeContainer]);
};

Customize.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default withTranslation()(CustomizeWrapper);
