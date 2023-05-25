import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';
import { defaultSchema as sanitizeDefaultSchema } from 'rehype-sanitize';

import AdminMarkDownContainer from '~/client/services/AdminMarkDownContainer';

import { withUnstatedContainers } from '../../UnstatedUtils';

class WhitelistInput extends React.Component {

  constructor(props) {
    super(props);

    this.tagWhitelist = React.createRef();
    this.attrWhitelist = React.createRef();

    this.tags = sanitizeDefaultSchema.tagNames;
    this.attrs = JSON.stringify(sanitizeDefaultSchema.attributes);

    this.onClickRecommendTagButton = this.onClickRecommendTagButton.bind(this);
    this.onClickRecommendAttrButton = this.onClickRecommendAttrButton.bind(this);
  }

  onClickRecommendTagButton() {
    this.tagWhitelist.current.value = this.tags;
    this.props.adminMarkDownContainer.setState({ tagWhitelist: this.tags });
  }

  onClickRecommendAttrButton() {
    this.attrWhitelist.current.value = this.attrs;
    this.props.adminMarkDownContainer.setState({ attrWhitelist: this.attrs });
  }

  render() {
    const { t, adminMarkDownContainer } = this.props;

    return (
      <>
        <div className="mt-4">
          <div className="d-flex justify-content-between">
            {t('markdown_settings.xss_options.tag_names')}
            <p id="btn-import-tags" className="btn btn-sm btn-primary mb-0" onClick={this.onClickRecommendTagButton}>
              {t('markdown_settings.xss_options.import_recommended', { target: 'Tags' })}
            </p>
          </div>
          <textarea
            className="form-control xss-list"
            name="recommendedTags"
            rows="6"
            cols="40"
            ref={this.tagWhitelist}
            defaultValue={adminMarkDownContainer.state.tagWhitelist}
            onChange={(e) => { adminMarkDownContainer.setState({ tagWhitelist: e.target.value }) }}
          />
        </div>
        <div className="mt-4">
          <div className="d-flex justify-content-between">
            {t('markdown_settings.xss_options.tag_attributes')}
            <p id="btn-import-tags" className="btn btn-sm btn-primary mb-0" onClick={this.onClickRecommendAttrButton}>
              {t('markdown_settings.xss_options.import_recommended', { target: 'Attrs' })}
            </p>
          </div>
          <textarea
            className="form-control xss-list"
            name="recommendedAttrs"
            rows="6"
            cols="40"
            ref={this.attrWhitelist}
            defaultValue={adminMarkDownContainer.state.attrWhitelist}
            onChange={(e) => { adminMarkDownContainer.setState({ attrWhitelist: e.target.value }) }}
          />
        </div>
      </>
    );
  }

}


WhitelistInput.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  adminMarkDownContainer: PropTypes.instanceOf(AdminMarkDownContainer).isRequired,

};

const PresentationFormWrapperFC = (props) => {
  const { t } = useTranslation('admin');

  return <WhitelistInput t={t} {...props} />;
};

const WhitelistWrapper = withUnstatedContainers(PresentationFormWrapperFC, [AdminMarkDownContainer]);

export default WhitelistWrapper;
