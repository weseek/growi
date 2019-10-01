/* eslint-disable max-len */
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';

class WhiteListInput extends React.Component {

  render() {
    const { t, customizable } = this.props;

    return (
      <>
        <div className="m-t-15">
          { t('markdown_setting.Tag names') }
          {/* TODO GW-304 fetch correct defaultValue */}
          <textarea className="form-control xss-list" name="recommendedTags" rows="6" cols="40" readOnly={customizable} defaultValue="recommendedWhitelist.tags" />
        </div>
        <div className="m-t-15">
          { t('markdown_setting.Tag attributes') }
          {/* TODO GW-304 fetch correct defaultValue */}
          <textarea className="form-control xss-list" name="recommendedAttrs" rows="6" cols="40" readOnly={customizable} defaultValue="recommendedWhitelist.attrs" />
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

};

export default withTranslation()(WhiteListWrapper);
