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
      <div className="row">
        <div className="col-sm-4">
          <CustomizeLayoutOption
            layoutType="crowi-plus"
            isSelected={adminCustomizeContainer.state.currentLayout === 'growi'}
            onSelected={() => adminCustomizeContainer.switchLayoutType('growi')}
            labelHtml={'GROWI Enhanced Layout <small class="text-success">(Recommended)</small>'}
          >
            <h4>{t('customize_page.layout_description.growi_title')}</h4>
            <ul>
              <li>{t('customize_page.layout_description.growi_text1')}</li>
              <li>{t('customize_page.layout_description.growi_text2')}</li>
              <li>{t('customize_page.layout_description.growi_text3')}</li>
            </ul>
          </CustomizeLayoutOption>
        </div>

        <div className="col-sm-4">
          <CustomizeLayoutOption
            layoutType="kibela"
            isSelected={adminCustomizeContainer.state.currentLayout === 'kibela'}
            onSelected={() => adminCustomizeContainer.switchLayoutType('kibela')}
            labelHtml="Kibela Like Layout"
          >
            <h4>{t('customize_page.layout_description.kibela_title')}</h4>
            <ul>
              <li>{t('customize_page.layout_description.kibela_text1')}</li>
              <li>{t('customize_page.layout_description.kibela_text2')}</li>
              <li>{t('customize_page.layout_description.kibela_text3')}</li>
            </ul>
          </CustomizeLayoutOption>
        </div>

        <div className="col-sm-4">
          <CustomizeLayoutOption
            layoutType="classic"
            isSelected={adminCustomizeContainer.state.currentLayout === 'crowi'}
            onSelected={() => adminCustomizeContainer.switchLayoutType('crowi')}
            labelHtml="Crowi Classic Layout"
          >
            <h4>{t('customize_page.layout_description.crowi_title')}</h4>
            <ul>
              <li>{t('customize_page.layout_description.crowi_text1')}</li>
              <li>{t('customize_page.layout_description.crowi_text2')}</li>
              <li>{t('customize_page.layout_description.crowi_text3')}</li>
            </ul>
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
