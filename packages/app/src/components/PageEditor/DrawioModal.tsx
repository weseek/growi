import React, {
  useMemo,
} from 'react';

import {
  Modal,
  ModalBody,
} from 'reactstrap';


import { getDiagramsNetLangCode } from '~/client/util/locale-utils';
import { useDrawioUri } from '~/stores/context';
import { useDrawioModal } from '~/stores/modal';
import { usePersonalSettings } from '~/stores/personal-settings';


type Props = {
  // onSave: (drawioData) => void,
};

export const DrawioModal = (props: Props): JSX.Element => {
  const { data: growiDrawioUri } = useDrawioUri();
  const { data: personalSettingsInfo } = usePersonalSettings();


  const { data: drawioModalData, close: closeDrawioModal } = useDrawioModal();
  const isOpened = drawioModalData?.isOpened ?? false;

  const cancel = () => {
    closeDrawioModal();
  };

  const drawioUrl = useMemo(() => {
    const drawioUri = growiDrawioUri || 'https://embed.diagrams.net/';
    const url = new URL(drawioUri);

    // refs: https://desk.draw.io/support/solutions/articles/16000042546-what-url-parameters-are-supported-
    url.searchParams.append('spin', '1');
    url.searchParams.append('embed', '1');
    url.searchParams.append('lang', getDiagramsNetLangCode(personalSettingsInfo?.lang || 'en'));
    url.searchParams.append('ui', 'atlas');
    url.searchParams.append('configure', '1');

    return url;
  }, [growiDrawioUri, personalSettingsInfo?.lang]);


  return (
    <Modal
      isOpen={isOpened}
      toggle={cancel}
      backdrop="static"
      className="drawio-modal grw-body-only-modal-expanded"
      size="xl"
      keyboard={false}
    >
      <ModalBody className="p-0">
        {/* Loading spinner */}
        <div className="w-100 h-100 position-absolute d-flex">
          <div className="mx-auto my-auto">
            <i className="fa fa-3x fa-spinner fa-pulse mx-auto text-muted"></i>
          </div>
        </div>
        {/* iframe */}
        <div className="w-100 h-100 position-absolute d-flex">
          { isOpened && (
            <iframe
              src={drawioUrl.href}
              className="border-0 flex-grow-1"
            >
            </iframe>
          ) }
        </div>
      </ModalBody>
    </Modal>
  );
};
