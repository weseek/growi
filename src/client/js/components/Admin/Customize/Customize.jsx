
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import AppContainer from '../../../services/AppContainer';

import { createSubscribedElement } from '../../UnstatedUtils';
import CustomizeLayoutSetting from './CustomizeLayoutSetting';
import CustomizeBehaviorSetting from './CustomizeBehaviorSetting';
import CustomizeFunctionSetting from './CustomizeFunctionSetting';

class Customize extends React.Component {

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <div className="row my-3">
          <CustomizeLayoutSetting />
        </div>
        <div className="row my-3">
          <CustomizeBehaviorSetting />
        </div>
        <div className="row my-3">
          <CustomizeFunctionSetting />
        </div>
        <legend>{t('customize_page.Code Highlight')}</legend>
        {/* コードハイライトフォームの react componentをここで呼ぶ(GW-277) */}
        <legend>{t('customize_page.custom_title')}</legend>
        {/* カスタムタイトルフォームの react componentをここで呼ぶ(GW-278) */}
        <legend>{t('customize_page.Custom CSS')}</legend>
        {/* カスタムCSSフォームの react componentをここで呼ぶ(GW-279) */}
        <legend>{t('customize_page.Custom script')}</legend>
        {/* カスタムスクリプトフォームの react componentをここで呼ぶ(GW-280) */}
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
