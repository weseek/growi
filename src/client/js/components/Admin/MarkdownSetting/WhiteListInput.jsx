import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import { tags, attrs } from '../../../../../lib/service/xss/recommended-whitelist';

import AppContainer from '../../../services/AppContainer';
import MarkDownSettingContainer from '../../../services/MarkDownSettingContainer';

class WhiteListInput extends React.Component {

  renderRecommendTagBtn() {
    const { t, markDownSettingContainer } = this.props;

    return (
      <p id="btn-import-tags" className="btn btn-xs btn-primary" onClick={() => { markDownSettingContainer.setState({ tagWhiteList: tags }) }}>
        { t('markdown_setting.import_recommended', 'tags') }
      </p>
    );
  }

  renderRecommendAttrBtn() {
    const { t, markDownSettingContainer } = this.props;

    return (
      <p id="btn-import-tags" className="btn btn-xs btn-primary" onClick={() => { markDownSettingContainer.setState({ attrWhiteList: attrs }) }}>
        { t('markdown_setting.import_recommended', 'Attrs') }
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
        <div className="m-t-15">
          <div className="d-flex justify-content-between">
            { t('markdown_setting.Tag names') }
            {customizable && this.renderRecommendTagBtn()}
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
        <div className="m-t-15">
          <div className="d-flex justify-content-between">
            { t('markdown_setting.Tag attributes') }
            {customizable && this.renderRecommendAttrBtn()}
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
