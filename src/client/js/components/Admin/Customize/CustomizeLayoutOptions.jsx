import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import AppContainer from '../../../services/AppContainer';

import CustomizeLayoutOption from './CustomizeLayoutOption';

class CustomizeLayoutOptions extends React.Component {

  render() {
    const { t, adminCustomizeContainer } = this.props;

    return (
      <div className="row row-cols-1 row-cols-md-2">
        <div className="col text-center">
          <CustomizeLayoutOption
            layoutType="crowi-plus"
            isSelected={adminCustomizeContainer.state.currentLayout === 'growi'}
            onSelected={() => adminCustomizeContainer.switchLayoutType('growi')}
            labelHtml={`GROWI enhanced layout <small class="text-success">${t('admin:customize_setting.recommended')}</small>`}
          >
            <h4>{t('admin:customize_setting.layout_desc.growi_title')}</h4>
            <div className="text-justify d-inline-block">
              <ul>
                <li>{t('admin:customize_setting.layout_desc.growi_text1')}</li>
                <li>{t('admin:customize_setting.layout_desc.growi_text2')}</li>
                <li>{t('admin:customize_setting.layout_desc.growi_text3')}</li>
              </ul>
            </div>
          </CustomizeLayoutOption>
        </div>

        <div className="col text-center">
          <CustomizeLayoutOption
            layoutType="kibela"
            isSelected={adminCustomizeContainer.state.currentLayout === 'kibela'}
            onSelected={() => adminCustomizeContainer.switchLayoutType('kibela')}
            labelHtml="Kibela like layout"
          >
            <h4>{t('admin:customize_setting.layout_desc.kibela_title')}</h4>
            <div className="text-justify d-inline-block">
              <ul>
                <li>{t('admin:customize_setting.layout_desc.kibela_text1')}</li>
                <li>{t('admin:customize_setting.layout_desc.kibela_text2')}</li>
                <li>{t('admin:customize_setting.layout_desc.kibela_text3')}</li>
              </ul>
            </div>
          </CustomizeLayoutOption>
        </div>
      </div>
    );
  }

}

const CustomizeLayoutOptionsWrapper = (props) => {
  return createSubscribedElement(CustomizeLayoutOptions, props, [AppContainer, AdminCustomizeContainer]);
};

CustomizeLayoutOptions.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default withTranslation()(CustomizeLayoutOptionsWrapper);
