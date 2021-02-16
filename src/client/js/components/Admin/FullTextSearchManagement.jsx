import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import ElasticsearchManagement from './ElasticsearchManagement/ElasticsearchManagement';


class FullTextSearchManagement extends React.Component {

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <h2> { t('full_text_search_management.elasticsearch_management') } </h2>
        <ElasticsearchManagement />
      </Fragment>
    );
  }

}

FullTextSearchManagement.propTypes = {
  t: PropTypes.func.isRequired, // i18next
};

export default withTranslation()(FullTextSearchManagement);
