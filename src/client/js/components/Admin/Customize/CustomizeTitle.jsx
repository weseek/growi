import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import loggerFactory from '@alias/logger';

import AppContainer from '../../../services/AppContainer';
import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';
import AdminUpdateButtonRow from '../Common/AdminUpdateButtonRow';
import { createSubscribedElement } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

const logger = loggerFactory('growi:Customize');

class CustomizeTitle extends React.Component {

  constructor(props) {
    super(props);

    this.onClickSubmit = this.onClickSubmit.bind(this);
  }

  async onClickSubmit() {
    const { t, adminCustomizeContainer } = this.props;

    try {
      await adminCustomizeContainer.updateCustomizeTitle();
      toastSuccess(t('customize_page.update_customTitle_success'));
    }
    catch (err) {
      toastError(err);
      logger.error(err);
    }
  }

  render() {
    const { t, adminCustomizeContainer } = this.props;
    const { currentCustomizeTitle } = adminCustomizeContainer.state;

    return (
      <React.Fragment>
        <h2 className="admin-setting-header">{t('customize_page.custom_title')}</h2>
        <p
          className="well"
          // eslint-disable-next-line react/no-danger, max-len
          dangerouslySetInnerHTML={{ __html: '<code>&lt;title&gt;</code>タグのコンテンツをカスタマイズできます。<br><code>&#123;&#123;sitename&#125;&#125;</code>がサイト名、<code>&#123;&#123;page&#125;&#125;</code>がページ名またはページパスに置換されます。' }}
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

        <div className="form-group col-12 m-3">
          <div className="offset-4 col-8">
            <AdminUpdateButtonRow onClick={this.onClickSubmit} disabled={adminCustomizeContainer.state.retrieveError != null} />
          </div>
        </div>
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
