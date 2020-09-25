
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

class Drafts extends React.Component {

  render() {
    return (
      <div>hoge</div>
    );
  }

}


Drafts.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(Drafts);
