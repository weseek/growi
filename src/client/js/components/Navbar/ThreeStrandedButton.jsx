import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../UnstatedUtils';
import NavigationContainer from '../../services/NavigationContainer';

const ThreeStrandedButton = (props) => {

  // const { t, navigationContainer } = props;
  const { t } = props;

  return (
    <div className="btn-group" role="group " aria-label="three-stranded-button">
      <button type="button" className="btn three-stranded-button view-button">
        <i className="icon-control-play icon-fw" />
        { t('view') }
      </button>
      <button type="button" className="btn three-stranded-button edit-button">
        <i className="icon-note icon-fw" />
        { t('Edit') }
      </button>
      <button type="button" className="btn three-stranded-button hackmd-button">
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
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
};

export default withTranslation()(ThreeStrandedButtonWrapper);
