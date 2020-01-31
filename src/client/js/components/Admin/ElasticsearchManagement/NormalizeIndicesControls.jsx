import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

class NormalizeIndicesControls extends React.PureComponent {

  render() {
    const { t, isNormalized, isRebuildingProcessing } = this.props;

    const isEnabled = (isNormalized != null) && !isNormalized && !isRebuildingProcessing;

    return (
      <>
        <button
          type="submit"
          className={`btn btn-outline ${isEnabled ? 'btn-info' : 'btn-default'}`}
          onClick={() => { this.props.onNormalizingRequested() }}
          disabled={!isEnabled}
        >
          { t('full_text_search_management.normalize_button') }
        </button>

        <p className="help-block">
          { t('full_text_search_management.normalize_description') }<br />
        </p>
      </>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const NormalizeIndicesControlsWrapper = (props) => {
  return createSubscribedElement(NormalizeIndicesControls, props, []);
};

NormalizeIndicesControls.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  isRebuildingProcessing: PropTypes.bool.isRequired,
  onNormalizingRequested: PropTypes.func.isRequired,
  isNormalized: PropTypes.bool,
};

export default withTranslation()(NormalizeIndicesControlsWrapper);
