import React, {
  useCallback,
  useEffect,
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

import { DrawioCommunicationHelper } from './DrawioCommunicationHelper';


const headerColor = '#334455';
const fontFamily = "Lato, -apple-system, BlinkMacSystemFont, 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif";

const drawioConfig = {
  css: `
  .geMenubarContainer { background-color: ${headerColor} !important; }
  .geMenubar { background-color: ${headerColor} !important; }
  .geEditor { font-family: ${fontFamily} !important; }
  html td.mxPopupMenuItem {
    font-family: ${fontFamily} !important;
    font-size: 8pt !important;
  }
  `,
  customFonts: ['Lato', 'Charter'],
};


type Props = {
  // onSave: (drawioData) => void,
};

export const DrawioModal = (props: Props): JSX.Element => {
  const { data: drawioUri } = useDrawioUri();
  const { data: personalSettingsInfo } = usePersonalSettings();

  const { data: drawioModalData, close: closeDrawioModal } = useDrawioModal();
  const isOpened = drawioModalData?.isOpened ?? false;

  const drawioUriWithParams = useMemo(() => {
    if (drawioUri == null) {
      return undefined;
    }

    const url = new URL(drawioUri);

    // refs: https://desk.draw.io/support/solutions/articles/16000042546-what-url-parameters-are-supported-
    url.searchParams.append('spin', '1');
    url.searchParams.append('embed', '1');
    url.searchParams.append('lang', getDiagramsNetLangCode(personalSettingsInfo?.lang || 'en'));
    url.searchParams.append('ui', 'atlas');
    url.searchParams.append('configure', '1');

    return url;
  }, [drawioUri, personalSettingsInfo?.lang]);

  const drawioCommunicationHelper = useMemo(() => {
    if (drawioUri == null) {
      return undefined;
    }

    return new DrawioCommunicationHelper(
      drawioUri,
      drawioConfig,
      { onClose: closeDrawioModal },
    );
  }, [closeDrawioModal, drawioUri]);

  const receiveMessageHandler = useCallback((event: MessageEvent) => {
    if (drawioModalData == null) {
      return;
    }

    drawioCommunicationHelper?.onReceiveMessage(event, drawioModalData.drawioMxFile);
  }, [drawioCommunicationHelper, drawioModalData]);

  useEffect(() => {
    if (isOpened) {
      window.addEventListener('message', receiveMessageHandler);
    }
    else {
      window.removeEventListener('message', receiveMessageHandler);
    }

    // clean up
    return function() {
      window.removeEventListener('message', receiveMessageHandler);
    };
  }, [isOpened, receiveMessageHandler]);

  return (
    <Modal
      isOpen={isOpened}
      toggle={() => closeDrawioModal()}
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
        { drawioUriWithParams != null && (
          <div className="w-100 h-100 position-absolute d-flex">
            { isOpened && (
              <iframe
                src={drawioUriWithParams.href}
                className="border-0 flex-grow-1"
              >
              </iframe>
            ) }
          </div>
        ) }
      </ModalBody>
    </Modal>
  );
};
