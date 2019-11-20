
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import AppContainer from '../../../services/AppContainer';

import { createSubscribedElement } from '../../UnstatedUtils';
import CustomizeLayoutSetting from './CustomizeLayoutSetting';
import CustomizeBehaviorSetting from './CustomizeBehaviorSetting';
import CustomizeFunctionSetting from './CustomizeFunctionSetting';
import CustomizeHighlightSetting from './CustomizeHighlightSetting';
import CustomizeTitle from './CustomizeTitle';
import CustomizeCssSetting from './CustomizeCssSetting';
import CustomizeScriptSetting from './CustomizeScriptSetting';
import CustomizeHeaderSetting from './CustomizeHeaderSetting';

class Customize extends React.Component {

  render() {

    return (
      <Fragment>
        <div className="my-3">
          <CustomizeLayoutSetting />
        </div>
        <div className="my-3">
          <CustomizeBehaviorSetting />
        </div>
        <div className="my-3">
          <CustomizeFunctionSetting />
        </div>
        <div className="my-3">
          <CustomizeHighlightSetting />
        </div>
        <div className="my-3">
          <CustomizeTitle />
        </div>
        <div className="my-3">
          <CustomizeHeaderSetting />
        </div>
        <div className="my-3">
          <CustomizeCssSetting />
        </div>
        <div className="my-3">
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
