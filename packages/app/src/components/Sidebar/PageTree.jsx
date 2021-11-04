import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

class PageTree extends React.Component {

  static propTypes = {
    t: PropTypes.func.isRequired, // i18next
  };

  render() {
    const { t } = this.props;

    return (
      <>
        <div className="grw-sidebar-content-header p-3 d-flex">
          <h3 className="mb-0">{t('Page Tree')}</h3>
        </div>
        <div className="grw-sidebar-content-body p-3">
          TBD
        </div>
      </>
    );
  }

}

export default withTranslation()(PageTree);
