
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import AppContainer from '../../../services/AppContainer';

import { createSubscribedElement } from '../../UnstatedUtils';
import CustomizeLayoutSetting from './CustomizeLayoutSetting';
import CustomizeBehaviorSetting from './CustomizeBehaviorSetting';
<<<<<<< HEAD
import CustomizeTitle from './CustomizeTitle';
=======
import CustomizeFunctionSetting from './CustomizeFunctionSetting';
import CustomizeHighlightSetting from './CustomizeHighlightSetting';
import CustomizeCssSetting from './CustomizeCssSetting';
import CustomizeScriptSetting from './CustomizeScriptSetting';
import CustomizeHeaderSetting from './CustomizeHeaderSetting';
>>>>>>> origin/reactify-admin/CustomizePage

class Customize extends React.Component {

  render() {
    const { t } = this.props;

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
        <legend>{t('customize_page.custom_title')}</legend>
        {/* カスタムタイトルフォームの react componentをここで呼ぶ(GW-278) */}
        <div className="my-3">
<<<<<<< HEAD
          <CustomizeTitle />
        </div>
        <legend>{t('customize_page.Custom CSS')}</legend>
        {/* カスタムCSSフォームの react componentをここで呼ぶ(GW-279) */}
        <legend>{t('customize_page.Custom script')}</legend>
        {/* カスタムスクリプトフォームの react componentをここで呼ぶ(GW-280) */}
=======
          <CustomizeHeaderSetting />
        </div>
        <div className="my-3">
          <CustomizeCssSetting />
        </div>
        <div className="my-3">
          <CustomizeScriptSetting />
        </div>
>>>>>>> origin/reactify-admin/CustomizePage
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
