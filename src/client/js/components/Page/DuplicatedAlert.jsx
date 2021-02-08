import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withUnstatedContainers } from '../UnstatedUtils';
import PageContainer from '../../services/PageContainer';


const DuplicatedAlert = (props) => {
  const { t, pageContainer } = props;
  const { beforePathDuplicated } = pageContainer.state;

  return (
    <div className="alert alert-success py-3 px-4">
      <strong>
        { t('Duplicated') }: <code>{beforePathDuplicated}</code> {t('page_page.notice.duplicated')}
      </strong>
    </div>
  );
};

const DuplicatedAlertlWrapper = withUnstatedContainers(DuplicatedAlert, [PageContainer]);


DuplicatedAlert.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(DuplicatedAlertlWrapper);
