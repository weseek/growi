
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

class Customize extends React.Component {

  render() {
    const { t } = this.props;

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
        <legend>{t('customize_page.custom_title')}</legend>
        {/* カスタムタイトルフォームの react componentをここで呼ぶ(GW-278) */}
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
