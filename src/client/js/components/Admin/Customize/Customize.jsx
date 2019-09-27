
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import AppContainer from '../../../services/AppContainer';

import { createSubscribedElement } from '../../UnstatedUtils';

class Customize extends React.Component {

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        {/* fieldset + legend ではなく、row + header + フォームコンポーネントに書き換える(GC244着手時に対応) */}
        <fieldset>
          <legend>{t('customize_page.Layout')}</legend>
          {/* レイアウトフォームの react componentをここで呼ぶ(GW-244) */}
          <legend>{t('customize_page.Theme')}</legend>
          {/* テーマフォームの react componentをここで呼ぶ(GW-245) */}
          <legend>{t('customize_page.Behavior')}</legend>
          {/* 挙動フォームの react componentをここで呼ぶ(GW-246) */}
          <legend>{t('customize_page.Function')}</legend>
          {/* 機能フォームの react componentをここで呼ぶ(GW-276) */}
          <legend>{t('customize_page.Code Highlight')}</legend>
          {/* コードハイライトフォームの react componentをここで呼ぶ(GW-277) */}
          <legend>{t('customize_page.custom_title')}</legend>
          {/* カスタムタイトルフォームの react componentをここで呼ぶ(GW-278) */}
          <legend>{t('customize_page.Custom CSS')}</legend>
          {/* カスタムCSSフォームの react componentをここで呼ぶ(GW-279) */}
          <legend>{t('customize_page.Custom script')}</legend>
          {/* カスタムスクリプトフォームの react componentをここで呼ぶ(GW-280) */}
        </fieldset>
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
