
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import AppContainer from '../../../services/AppContainer';

import { createSubscribedElement } from '../../UnstatedUtils';
import CustomizeLayoutSetting from './CustomizeLayoutSetting';
import CustomizeBehaviorSetting from './CustomizeBehaviorSetting';
import CustomizeFunctionSetting from './CustomizeFunctionSetting';
import CustomizeHighlightSetting from './CustomizeHighlightSetting';
import CustomizeCssSetting from './CustomizeCssSetting';
import CustomizeScriptSetting from './CustomizeScriptSetting';
import CustomizeHeaderSetting from './CustomizeHeaderSetting';
import CustomizeTitle from './CustomizeTitle';

class Customize extends React.Component {

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
  return createSubscribedElement(Customize, props, [AppContainer]);
};

Customize.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(CustomizeWrapper);
