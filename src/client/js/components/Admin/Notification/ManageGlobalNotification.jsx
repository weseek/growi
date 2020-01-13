import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';


class ManageGlobalNotification extends React.Component {

  render() {
    return (
      <p>hoge</p>
    );
  }

}

ManageGlobalNotification.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(ManageGlobalNotification);
