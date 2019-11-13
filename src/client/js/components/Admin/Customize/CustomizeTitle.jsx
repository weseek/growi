import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import loggerFactory from '@alias/logger';

import AppContainer from '../../../services/AppContainer';
import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

const logger = loggerFactory('growi:customizeTitle');

class CustomizeTitle extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, adminCustomizeContainer } = this.props;

    try {
      await adminCustomizeContainer.updateCustomizeTitle();
      toastSuccess(t('customize_page.update_title_success'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  render() {
    const { t, appContainer, adminCustomizeContainer } = this.props;

    return (
      <div className="row">
        <div className="col-sm-4">
          <React.Fragment>
            <h2>{t('customize_page.custom title')}</h2>
            <p className="well">
              { t('customize_page.custom title') }<br />
              { t('customize_page.custom title') }
            </p>
            {/* TODO i18n */}
            <h4>title</h4>

            <ul>
              <li>aaaaaaaaaaaaaaa</li>
              <li>bbbbbbbbbbbbbbb</li>
              <li>ccccccccccccccc</li>
            </ul>
            <div className="form-group">
              <div className="col-xs-12">
                <input
                  id="customTitleSettingForm"
                  value={appContainer.config.customizeTitle}
                  onChange={(inputValue) => { adminCustomizeContainer.changeCustomizeTitle(inputValue) }}
                />
              </div>
            </div>
            <AdminUpdateButtonRow onClick={this.onClickSubmit} />
          </React.Fragment>
        </div>
      </div>
    );
  }

}

const CustomizeTitleWrapper = (props) => {
  return createSubscribedElement(CustomizeTitle, props, [AppContainer, AdminCustomizeContainer]);
};

CustomizeTitle.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default withTranslation()(CustomizeTitleWrapper);
