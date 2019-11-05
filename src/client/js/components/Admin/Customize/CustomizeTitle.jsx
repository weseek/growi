import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import AdminCustomizeContainer from '../../../services/AdminCustomizeContainer';

class CustomizeTitle extends React.Component {

  render() {
    const { adminCustomizeContainer } = this.props;

    return (
      <div className="row">
        <div className="col-sm-4">
          <CustomizeTitle>
            {/* TODO i18n */}
            <h4>Simple and Clear</h4>
            <ul>
              <li>Full screen layout and thin margins/paddings</li>
              <li>Show and post comments at the bottom of the page</li>
              <li>Affix Table-of-contents</li>
            </ul>
          </CustomizeTitle>
        </div>
      </div>
    );
  }

}

CustomizeTitle.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  adminCustomizeContainer: PropTypes.instanceOf(AdminCustomizeContainer).isRequired,
};

export default withTranslation()(CustomizeTitleWrapper);
