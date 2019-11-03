import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

class CustomizeBehaviorOption extends React.Component {

  render() {

    return (
      <div className="col-sm-4">
        <p>hoge</p>
      </div>
    );
  }

}

CustomizeBehaviorOption.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  layoutType: PropTypes.string.isRequired,
  labelHtml: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelected: PropTypes.func.isRequired,
  children: PropTypes.array.isRequired,
};

export default withTranslation()(CustomizeBehaviorOption);
