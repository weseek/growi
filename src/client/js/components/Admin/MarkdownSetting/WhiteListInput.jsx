import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import { tags, attrs } from '../../../../../lib/service/xss/recommended-whitelist';

import AppContainer from '../../../services/AppContainer';
import MarkDownSettingContainer from '../../../services/MarkDownSettingContainer';

class WhiteListInput extends React.Component {

  renderRecommendBtn() {
    const { t } = this.props;

    return (
      <p id="btn-import-tags" className="btn btn-xs btn-primary">
        { t('markdown_setting.import_recommended', 'tags') }
      </p>
    );
  }

  renderTagValue() {
    const { customizable, markDownSettingContainer } = this.props;

    if (customizable) {
      return markDownSettingContainer.state.tagWhiteList;
    }

    return tags;
  }

  renderAttrValue() {
    const { customizable, markDownSettingContainer } = this.props;

    if (customizable) {
      return markDownSettingContainer.state.attrWhiteList;
    }

    return attrs;
  }

  render() {
    const { t, customizable, markDownSettingContainer } = this.props;

    return (
      <>
        <div className="mt-4">
          <div className="d-flex justify-content-between">
            { t('markdown_setting.Tag names') }
            {customizable && this.renderRecommendBtn()}
          </div>
          <textarea
            className="form-control xss-list"
            name="recommendedTags"
            rows="6"
            cols="40"
            readOnly={!customizable}
            value={this.renderTagValue()}
            onChange={(e) => { markDownSettingContainer.setState({ tagWhiteList: e.target.value }) }}
          />
        </div>
        <div className="mt-4">
          <div className="d-flex justify-content-between">
            { t('markdown_setting.Tag attributes') }
            {customizable && this.renderRecommendBtn()}
          </div>
          <textarea
            className="form-control xss-list"
            name="recommendedAttrs"
            rows="6"
            cols="40"
            readOnly={!customizable}
            value={this.renderAttrValue()}
            onChange={(e) => { markDownSettingContainer.setState({ attrWhiteList: e.target.value }) }}
          />
        </div>
      </>
    );
  }

}

const WhiteListWrapper = (props) => {
  return createSubscribedElement(WhiteListInput, props, [AppContainer, MarkDownSettingContainer]);
};

WhiteListInput.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  markDownSettingContainer: PropTypes.instanceOf(MarkDownSettingContainer).isRequired,

  customizable: PropTypes.bool.isRequired,
};

export default withTranslation()(WhiteListWrapper);
