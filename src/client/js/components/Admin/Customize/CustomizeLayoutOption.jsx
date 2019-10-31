import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import CustomizeGrowiLayout from './layout/CustomizeGrowiLayout';
import CustomizeKibelaLayout from './layout/CustomizeKibelaLayout';
import CustomizeCrowiLayout from './layout/CustomizeCrowiLayout';

class CustomizeLayoutOption extends React.Component {

  render() {

    return (
      <React.Fragment>
        <CustomizeGrowiLayout />
        <CustomizeKibelaLayout />
        <CustomizeCrowiLayout />
      </React.Fragment>
    );
  }

}

CustomizeLayoutOption.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(CustomizeLayoutOption);
