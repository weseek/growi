import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import CustomizeGrowiLayout from './layout/CustomizeGrowiLayout';
import CustomizeKibelaLayout from './layout/CustomizeKibelaLayout';
import CustomizeCrowiLayout from './layout/CustomizeCrowiLayout';

class CustomizeLayoutOption extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      // TODO GW-477 save setting at customizeContainer
      currentLayout: 'growi',
    };

    this.onChangeLayout = this.onChangeLayout.bind(this);
  }

  onChangeLayout(lauoutName) {
    this.setState({ currentLayout: lauoutName });
  }

  render() {

    return (
      <React.Fragment>
        <CustomizeGrowiLayout currentLayout={this.state.currentLayout} onChangeLayout={this.onChangeLayout} />
        <CustomizeKibelaLayout currentLayout={this.state.currentLayout} onChangeLayout={this.onChangeLayout} />
        <CustomizeCrowiLayout currentLayout={this.state.currentLayout} onChangeLayout={this.onChangeLayout} />
      </React.Fragment>
    );
  }

}

CustomizeLayoutOption.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(CustomizeLayoutOption);
