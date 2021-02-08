import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withUnstatedContainers } from '../UnstatedUtils';
import PageContainer from '../../services/PageContainer';


const RenamedAlert = (props) => {
  const { t, pageContainer } = props;
  const { beforePathRenamed } = pageContainer.state;

  return (
    <>
      <strong>{ t('Moved') }: {beforePathRenamed} </strong>{t('page_page.notice.moved')}
    </>
  );
};

const RenamedAlertlWrapper = withUnstatedContainers(RenamedAlert, [PageContainer]);


RenamedAlert.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

};

export default withTranslation()(RenamedAlertlWrapper);
