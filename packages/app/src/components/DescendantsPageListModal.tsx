
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Modal, ModalHeader, ModalBody,
} from 'reactstrap';
import DescendantsPageList from './DescendantsPageList';
import ExpandOrContractButton from './ExpandOrContractButton';
import { CustomNavTab } from './CustomNavigation/CustomNav';
import PageListIcon from './Icons/PageListIcon';
import CustomTabContent from './CustomNavigation/CustomTabContent';
import { useDescendantsPageListModal } from '~/stores/ui';


type Props = {
}

export const DescendantsPageListModal = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const [isWindowExpanded, setIsWindowExpanded] = useState(false);

  const { data: status, close } = useDescendantsPageListModal();

  const navTabMapping = useMemo(() => {
    return {
      pagelist: {
        Icon: PageListIcon,
        Content: () => {
          if (status == null || status.path == null || !status.isOpened) {
            return <></>;
          }
          return <DescendantsPageList path={status.path} />;
        },
        i18n: t('page_list'),
        index: 0,
      },
    };
  }, [status, t]);

  const buttons = useMemo(() => (
    <div className="d-flex flex-nowrap">
      <ExpandOrContractButton
        isWindowExpanded={isWindowExpanded}
        expandWindow={() => setIsWindowExpanded(true)}
        contractWindow={() => setIsWindowExpanded(false)}
      />
      <button type="button" className="close" onClick={close} aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  ), [close, isWindowExpanded]);


  if (status == null) {
    return <></>;
  }

  const { isOpened } = status;

  return (
    <Modal
      size="xl"
      isOpen={isOpened}
      toggle={close}
      className={`grw-page-accessories-modal ${isWindowExpanded ? 'grw-modal-expanded' : ''} `}
    >
      <ModalHeader className="p-0" toggle={close} close={buttons}>
        <CustomNavTab
          activeTab="pagelist"
          navTabMapping={navTabMapping}
          breakpointToHideInactiveTabsDown="md"
          hideBorderBottom
        />
      </ModalHeader>
      <ModalBody>
        <CustomTabContent activeTab="pagelist" navTabMapping={navTabMapping} />
      </ModalBody>
    </Modal>
  );

};
