import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import PaginationWrapper from '../../PaginationWrapper';


import { createSubscribedElement } from '../../UnstatedUtils';
import { toastError } from '../../../util/apiNotification';

import AppContainer from '../../../services/AppContainer';

class SecurityManagement extends React.Component {

  constructor(props) {
    super();

  }

  render() {
    const { t } = this.props;
    return (
      <Fragment>
      </Fragment>
    );
  }

}

SecurityManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

const SecurityManagementWrapper = (props) => {
  return createSubscribedElement(SecurityManagement, props, [AppContainer]);
};

export default withTranslation()(SecurityManagementWrapper);
