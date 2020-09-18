import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withUnstatedContainers } from '../UnstatedUtils';

import NavigationContainer from '../../services/NavigationContainer';

const ThreeStrandedButton = (props) => {
  const { t, navigationContainer } = props;

  function threeStrandedButtonClickedHandler(viewType) {
    navigationContainer.setEditorMode(viewType);
  }

  return (
    <div className="btn-group grw-three-stranded-button" role="group " aria-label="three-stranded-button">
      <button type="button" className="btn btn-outline-primary view-button" onClick={() => { threeStrandedButtonClickedHandler('view') }}>
        <i className="icon-control-play icon-fw" />
        { t('view') }
      </button>
      <button type="button" className="btn btn-outline-primary edit-button" onClick={() => { threeStrandedButtonClickedHandler('edit') }}>
        <i className="icon-note icon-fw" />
        { t('Edit') }
      </button>
      <button type="button" className="btn btn-outline-primary hackmd-button" onClick={() => { threeStrandedButtonClickedHandler('hackmd') }}>
        <i className="fa fa-fw fa-file-text-o" />
        { t('hackmd.hack_md') }
      </button>
    </div>
  );

};

/**
 * Wrapper component for using unstated
 */
const ThreeStrandedButtonWrapper = withUnstatedContainers(ThreeStrandedButton, [NavigationContainer]);

ThreeStrandedButton.propTypes = {
  t: PropTypes.func.isRequired, //  i18next

  navigationContainer: PropTypes.object.isRequired,
  onThreeStrandedButtonClicked: PropTypes.func,
};

export default withTranslation()(ThreeStrandedButtonWrapper);
