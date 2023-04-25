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
import { useRendererConfig } from '~/stores/context';
import { useDrawioModal } from '~/stores/modal';
import { usePersonalSettings } from '~/stores/personal-settings';
import loggerFactory from '~/utils/logger';

import { type DrawioConfig, DrawioCommunicationHelper } from './DrawioCommunicationHelper';

const logger = loggerFactory('growi:components:DrawioModal');

const headerColor = '#334455';
const fontFamily = "Lato, -apple-system, BlinkMacSystemFont, 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif";

const drawioConfig: DrawioConfig = {
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
  compressXml: true,
};


export const DrawioModal = (): JSX.Element => {
  const { data: rendererConfig } = useRendererConfig();
  const { data: personalSettingsInfo } = usePersonalSettings({
    // make immutable
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const { data: drawioModalData, close: closeDrawioModal } = useDrawioModal();
  const isOpened = drawioModalData?.isOpened ?? false;

  const drawioUriWithParams = useMemo(() => {
    if (rendererConfig == null) {
      return undefined;
    }

    let url;
    try {
      url = new URL(rendererConfig.drawioUri);
    }
    catch (err) {
      logger.debug(err);
      return undefined;
    }

    // refs: https://desk.draw.io/support/solutions/articles/16000042546-what-url-parameters-are-supported-
    url.searchParams.append('spin', '1');
    url.searchParams.append('embed', '1');
    url.searchParams.append('lang', getDiagramsNetLangCode(personalSettingsInfo?.lang || 'en'));
    url.searchParams.append('ui', 'atlas');
    url.searchParams.append('configure', '1');

    return url;
  }, [rendererConfig, personalSettingsInfo?.lang]);

  const drawioCommunicationHelper = useMemo(() => {
    if (rendererConfig == null) {
      return undefined;
    }

    return new DrawioCommunicationHelper(
      rendererConfig.drawioUri,
      drawioConfig,
      { onClose: closeDrawioModal, onSave: drawioModalData?.onSave },
    );
  }, [closeDrawioModal, drawioModalData?.onSave, rendererConfig]);

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
