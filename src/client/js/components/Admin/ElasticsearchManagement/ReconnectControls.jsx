import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

class ReconnectControls extends React.PureComponent {

  render() {
    const { t, isEnabled, isProcessing } = this.props;

    return (
      <>
        <button
          type="submit"
          className={`btn ${isEnabled ? 'btn-outline-success' : 'btn-outline-secondary'}`}
          onClick={() => { this.props.onReconnectingRequested() }}
          disabled={!isEnabled}
        >
          { isProcessing && <i className="fa fa-spinner fa-pulse mr-2"></i> }
          { t('full_text_search_management.reconnect_button') }
        </button>

        <p className="form-text text-muted">
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

  isEnabled: PropTypes.bool,
  isProcessing: PropTypes.bool,
  onReconnectingRequested: PropTypes.func.isRequired,
};

export default withTranslation()(ReconnectControlsWrapper);
