import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { tags, attrs } from '~/service/xss/recommended-whitelist';

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
    this.props.onTagWhiteListChange(tags);
  }

  onClickRecommendAttrButton() {
    this.attrWhiteList.current.value = attrs;
    this.props.onAttrWhiteListChange(attrs);
  }

  render() {
    const { t } = this.props;

    return (
      <>
        <div className="mt-4">
          <div className="d-flex justify-content-between">
            {t('admin:markdown_setting.xss_options.tag_names')}
            <p id="btn-import-tags" className="btn btn-sm btn-primary mb-0" onClick={this.onClickRecommendTagButton}>
              {t('admin:markdown_setting.xss_options.import_recommended', { target: 'Tags' })}
            </p>
          </div>
          <textarea
            className="form-control xss-list"
            name="recommendedTags"
            rows="6"
            cols="40"
            ref={this.tagWhiteList}
            defaultValue={this.props.tagWhiteList}
            onChange={(e) => { this.props.onTagWhiteListChange(e.target.value) }}
          />
        </div>
        <div className="mt-4">
          <div className="d-flex justify-content-between">
            {t('admin:markdown_setting.xss_options.tag_attributes')}
            <p id="btn-import-tags" className="btn btn-sm btn-primary mb-0" onClick={this.onClickRecommendAttrButton}>
              {t('admin:markdown_setting.xss_options.import_recommended', { target: 'Attrs' })}
            </p>
          </div>
          <textarea
            className="form-control xss-list"
            name="recommendedAttrs"
            rows="6"
            cols="40"
            ref={this.attrWhiteList}
            defaultValue={this.props.attrWhiteList}
            onChange={(e) => { this.props.onAttrWhiteListChange(e.target.value) }}
          />
        </div>
      </>
    );
  }

}

WhiteListInput.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  tagWhiteList: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]),
  attrWhiteList: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]),
  onTagWhiteListChange: PropTypes.func,
  onAttrWhiteListChange: PropTypes.func,
};

export default withTranslation()(WhiteListInput);
