import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../UnstatedUtils';
import AppContainer from '../../services/AppContainer';

import { toastSuccess, toastError } from '../../util/apiNotification';

import RebuildIndex from './FullTextSearchManagement/RebuildIndex';


class FullTextSearchManagement extends React.Component {

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <h2> { t('full_text_search_management.elasticsearch_management') } </h2>
        <RebuildIndex />
      </Fragment>
    );
  }

}

const FullTextSearchManagementWrapper = (props) => {
  return createSubscribedElement(FullTextSearchManagement, props, [AppContainer]);
};

FullTextSearchManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(FullTextSearchManagementWrapper);
