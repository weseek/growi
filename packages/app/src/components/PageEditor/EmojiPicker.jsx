import React from 'react';
import PropTypes from 'prop-types';
import { Picker } from 'emoji-mart';
import { withTranslation } from 'react-i18next';

class EmojiPicker extends React.Component {

  render() {
    const { t } = this.props;

    return (
      <div className="overlay">
        <Picker />
      </div>
    );
  }

}

EmojiPicker.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation()(EmojiPicker);
