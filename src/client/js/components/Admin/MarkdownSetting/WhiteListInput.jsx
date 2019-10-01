/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';

class WhiteListInput extends React.Component {

  renderRecommendBtn() {
    const { t } = this.props;

    return (
      <p id="btn-import-tags" className="btn btn-xs btn-primary">
        { t('markdown_setting.import_recommended', 'tags') }
      </p>
    );
  }

  render() {
    const { t, customizable } = this.props;


    return (
      <>
        <div className="m-t-15">
          <div className="d-flex justify-content-between">
            { t('markdown_setting.Tag names') }
            {customizable && this.renderRecommendBtn()}
          </div>
          {/* TODO GW-304 fetch correct defaultValue */}
          <textarea className="form-control xss-list" name="recommendedTags" rows="6" cols="40" readOnly={!customizable} defaultValue="recommendedWhitelist.tags" />
        </div>
        <div className="m-t-15">
          <div className="d-flex justify-content-between">
            { t('markdown_setting.Tag attributes') }
            {customizable && this.renderRecommendBtn()}
          </div>
          {/* TODO GW-304 fetch correct defaultValue */}
          <textarea className="form-control xss-list" name="recommendedAttrs" rows="6" cols="40" readOnly={!customizable} defaultValue="recommendedWhitelist.attrs" />
        </div>
      </>
    );
  }

}

const WhiteListWrapper = (props) => {
  return createSubscribedElement(WhiteListInput, props, [AppContainer]);
};

WhiteListInput.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,

  customizable: PropTypes.bool.isRequired,
};

export default withTranslation()(WhiteListWrapper);
