import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

class CustomizeFunctionOption extends React.PureComponent {

  render() {
    const { t } = this.props;

    return (
      <div>
        <label htmlFor="settingForm[customize:isEnabledTimeline]" className="col-xs-3 control-label">{ t('customize_page.Timeline function') }</label>
      </div>
    );
  }

}

CustomizeFunctionOption.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  behaviorType: PropTypes.string.isRequired,
  labelHtml: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelected: PropTypes.func.isRequired,
  children: PropTypes.object.isRequired,
};

export default withTranslation()(CustomizeFunctionOption);
