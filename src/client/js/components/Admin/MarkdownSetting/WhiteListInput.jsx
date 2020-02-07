import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';
import { tags, attrs } from '../../../../../lib/service/xss/recommended-whitelist';

import AppContainer from '../../../services/AppContainer';
import AdminMarkDownContainer from '../../../services/AdminMarkDownContainer';

class WhiteListInput extends React.Component {

  constructor(props) {
    super(props);

    this.tagWhiteList = React.createRef();
    this.attrWhiteList = React.createRef();

    this.onClickRecommendTagButton = this.onClickRecommendTagButton.bind(this);
    this.onClickRecommendAttrButton = this.onClickRecommendAttrButton.bind(this);
  }

  onClickRecommendTagButton() {
    this.tagWhiteList.current.value = tags;
    this.props.adminMarkDownContainer.setState({ tagWhiteList: tags });
  }

  onClickRecommendAttrButton() {
    this.attrWhiteList.current.value = attrs;
    this.props.adminMarkDownContainer.setState({ attrWhiteList: attrs });
  }

  render() {
    const { t, adminMarkDownContainer } = this.props;

    return (
      <>
        <div className="m-t-15">
          <div className="d-flex justify-content-between">
            {t('admin:markdown_setting.xss_options.tag_names')}
            <p id="btn-import-tags" className="btn btn-xs btn-primary" onClick={this.onClickRecommendTagButton}>
              {t('admin:markdown_setting.xss_options.import_recommended', { target: 'Tags' })}
            </p>
          </div>
          <textarea
            className="form-control xss-list"
            name="recommendedTags"
            rows="6"
            cols="40"
            ref={this.tagWhiteList}
            defaultValue={adminMarkDownContainer.state.tagWhiteList}
            onChange={(e) => { adminMarkDownContainer.setState({ tagWhiteList: e.target.value }) }}
          />
        </div>
        <div className="m-t-15">
          <div className="d-flex justify-content-between">
            {t('admin:markdown_setting.xss_options.tag_attributes')}
            <p id="btn-import-tags" className="btn btn-xs btn-primary" onClick={this.onClickRecommendAttrButton}>
              {t('admin:markdown_setting.xss_options.import_recommended', { target: 'Attrs' })}
            </p>
          </div>
          <textarea
            className="form-control xss-list"
            name="recommendedAttrs"
            rows="6"
            cols="40"
            ref={this.attrWhiteList}
            defaultValue={adminMarkDownContainer.state.attrWhiteList}
            onChange={(e) => { adminMarkDownContainer.setState({ attrWhiteList: e.target.value }) }}
          />
        </div>
      </>
    );
  }

}

const WhiteListWrapper = (props) => {
  return createSubscribedElement(WhiteListInput, props, [AppContainer, AdminMarkDownContainer]);
};

WhiteListInput.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminMarkDownContainer: PropTypes.instanceOf(AdminMarkDownContainer).isRequired,

};

export default withTranslation()(WhiteListWrapper);
