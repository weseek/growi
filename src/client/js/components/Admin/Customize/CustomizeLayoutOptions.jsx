import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import CustomizeLayoutOption from './CustomizeLayoutOption';

class CustomizeLayoutOptions extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      // TODO GW-477 save setting at customizeContainer
      currentLayout: 'growi',
    };

    this.selectLayout = this.selectLayout.bind(this);
  }

  selectLayout(lauoutName) {
    this.setState({ currentLayout: lauoutName });
  }

  render() {
    return (
      <React.Fragment>
        <CustomizeLayoutOption
          layoutType="crowi-plus"
          isSelected={this.state.currentLayout === 'growi'}
          onSelected={() => this.selectLayout('growi')}
          labelHtml={'GROWI Enhanced Layout <small className="text-success">(Recommended)</small>'}
        >
          {/* TODO i18n */}
          <h4>Simple and Clear</h4>
          <ul>
            <li>Full screen layout and thin margins/paddings</li>
            <li>Show and post comments at the bottom of the page</li>
            <li>Affix Table-of-contents</li>
          </ul>
        </CustomizeLayoutOption>

        <CustomizeLayoutOption
          layoutType="kibela"
          isSelected={this.state.currentLayout === 'kibela'}
          onSelected={() => this.selectLayout('kibela')}
          labelHtml=" Kibela Like Layout"
        >
          {/* TODO i18n */}
          <h4>Easy Viewing Structure</h4>
          <ul>
            <li>Center aligned contents</li>
            <li>Show and post comments at the bottom of the page</li>
            <li>Affix Table-of-contents</li>
          </ul>
        </CustomizeLayoutOption>

        <CustomizeLayoutOption
          layoutType="classic"
          isSelected={this.state.currentLayout === 'crowi'}
          onSelected={() => this.selectLayout('crowi')}
          labelHtml="Crowi Classic Layout"
        >
          {/* TODO i18n */}
          <h4>Separated Functions</h4>
          <ul>
            <li>Collapsible Sidebar</li>
            <li>Show and post comments in Sidebar</li>
            <li>Collapsible Table-of-contents</li>
          </ul>
        </CustomizeLayoutOption>
      </React.Fragment>
    );
  }

}

CustomizeLayoutOptions.propTypes = {
  t: PropTypes.func.isRequired, // i18next

};

export default withTranslation()(CustomizeLayoutOptions);
