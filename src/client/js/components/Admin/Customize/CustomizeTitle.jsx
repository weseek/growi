import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import AppContainer from '../../../services/AppContainer';
import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

class CustomizeTitle extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, adminCustomizeContainer } = this.props;

    try {
      await adminCustomizeContainer.updateCustomizeTitle();
      toastSuccess(t('toaster.update_successed', { target: t('admin:customize_setting.custom_title') }));
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t, adminCustomizeContainer } = this.props;
    const { currentCustomizeTitle } = adminCustomizeContainer.state;

    return (
      <React.Fragment>
        <h2 className="admin-setting-header">{t('admin:customize_setting.custom_title')}</h2>
        <p
          className="well"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: t('admin:customize_setting.custom_title_detail') }}
        />
        {/* TODO i18n */}
        <div className="help-block">
          Default Value: <code>&#123;&#123;page&#125;&#125; - &#123;&#123;sitename&#125;&#125;</code>
          <br />
          Default Output: <pre><code className="xml">&lt;title&gt;/Sandbox - {'GROWI'}&lt;&#047;title&gt;</code></pre>
        </div>
        <div className="form-group">
          <input
            className="form-control"
            defaultValue={currentCustomizeTitle}
            onChange={(e) => { adminCustomizeContainer.changeCustomizeTitle(e.target.value) }}
          />
        </div>

        <AdminUpdateButtonRow onClick={this.onClickSubmit} disabled={adminCustomizeContainer.state.retrieveError != null} />
      </React.Fragment>
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
