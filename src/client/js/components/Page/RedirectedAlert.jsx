import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withUnstatedContainers } from '../UnstatedUtils';
import PageContainer from '../../services/PageContainer';

const RedirectedAlert = (props) => {
  const { t, pageContainer } = props;
  const { beforePathRedirected } = pageContainer.state;

  return (
    <>
      <strong>{ t('Redirected') }:</strong>{ t('page_page.notice.redirected')} <code>{beforePathRedirected}</code>
    </>
  );
};

const RedirectedAlertlWrapper = withUnstatedContainers(RedirectedAlert, [PageContainer]);


RedirectedAlert.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

};

export default withTranslation()(RedirectedAlertlWrapper);
