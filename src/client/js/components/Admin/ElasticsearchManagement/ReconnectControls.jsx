import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

class ReconnectControls extends React.PureComponent {

  render() {
    const { t, isConfigured, isConnected } = this.props;

    const isEnabled = (isConfigured == null || isConfigured === true) && isConnected === false;

    return (
      <>
        <button
          type="submit"
          className={`btn btn-outline ${isEnabled ? 'btn-success' : 'btn-default'}`}
          onClick={() => { this.props.onReconnectingRequested() }}
          disabled={!isEnabled}
        >
          { t('full_text_search_management.reconnect_button') }
        </button>

        <p className="help-block">
          { t('full_text_search_management.reconnect_description') }<br />
        </p>
      </>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const ReconnectControlsWrapper = (props) => {
  return createSubscribedElement(ReconnectControls, props, []);
};

ReconnectControls.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  isConfigured: PropTypes.bool,
  isConnected: PropTypes.bool,
  onReconnectingRequested: PropTypes.func.isRequired,
};

export default withTranslation()(ReconnectControlsWrapper);
