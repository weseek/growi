import React, {
  useState, useMemo,
} from 'react';

import i18next from 'i18next';
import {
  Modal,
  ModalBody,
} from 'reactstrap';


import { getDiagramsNetLangCode } from '~/client/util/locale-utils';
import { useGrowiHydratedEnv } from '~/stores/context';
import { useDrawioModal } from '~/stores/modal';

const headerColor = '#334455';
const fontFamily = "Lato, -apple-system, BlinkMacSystemFont, 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif";


type Props = {
  // onSave: (drawioData) => void,
};

export const DrawioModal = React.forwardRef((props: Props, ref: React.LegacyRef<Modal>): JSX.Element => {
  const { data: growiHydratedEnv } = useGrowiHydratedEnv();
  // const [isShown, setIsShown] = useState(false);

  const { data: drawioModalData, close: closeDrawioModal } = useDrawioModal();
  const isOpened = drawioModalData?.isOpened ?? false;
  const drawioMxFile = drawioModalData?.drawioMxFile ?? '';
  // const { isOpened, drawioMxFile } = drawioModalData;
  // const [drawioMxFile, setDrawioMxFile] = useState('');

  // const init = (drawioMxFile) => {
  //   const initDrawioMxFile = drawioMxFile;
  //   setDrawioMxFile(initDrawioMxFile);
  // };

  // const show = (drawioMxFile) => {
  //   init(drawioMxFile);

  //   window.addEventListener('message', receiveFromDrawio);
  //   setIsShown(true);
  // };

  const hide = () => {
    // setIsShown(false);
    closeDrawioModal();
  };

  const cancel = () => {
    hide();
  };

  const receiveFromDrawio = (event) => {
    if (event.data === 'ready') {
      event.source.postMessage(drawioMxFile, '*');
      return;
    }

    if (event.data === '{"event":"configure"}') {
      if (event.source == null) {
        return;
      }

      // refs:
      //  * https://desk.draw.io/support/solutions/articles/16000103852-how-to-customise-the-draw-io-interface
      //  * https://desk.draw.io/support/solutions/articles/16000042544-how-does-embed-mode-work-
      //  * https://desk.draw.io/support/solutions/articles/16000058316-how-to-configure-draw-io-
      event.source.postMessage(JSON.stringify({
        action: 'configure',
        config: {
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
        },
      }), '*');

      return;
    }

    if (typeof event.data === 'string' && event.data.match(/mxfile/)) {
      if (event.data.length > 0) {
        const parser = new DOMParser();
        const dom = parser.parseFromString(event.data, 'text/xml');
        const drawioData = dom.getElementsByTagName('diagram')[0].innerHTML;

        // if (props.onSave != null) {
        //   props.onSave(drawioData);
        // }
      }

      window.removeEventListener('message', receiveFromDrawio);
      hide();

      return;
    }

    if (typeof event.data === 'string' && event.data.length === 0) {
      window.removeEventListener('message', receiveFromDrawio);
      hide();

      return;
    }

    // NOTHING DONE. (Receive unknown iframe message.)
  };

  const drawioUrl = useMemo(() => {
    const drawioUri = growiHydratedEnv?.DRAWIO_URI || 'https://embed.diagrams.net/';
    const url = new URL(drawioUri);

    // refs: https://desk.draw.io/support/solutions/articles/16000042546-what-url-parameters-are-supported-
    url.searchParams.append('spin', '1');
    url.searchParams.append('embed', '1');
    url.searchParams.append('lang', getDiagramsNetLangCode(i18next.language));
    url.searchParams.append('ui', 'atlas');
    url.searchParams.append('configure', '1');

    return url.toString();
  }, [growiHydratedEnv?.DRAWIO_URI]);

  return (
    <Modal
      ref={ref}
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
              src={drawioUrl}
              className="border-0 flex-grow-1"
            >
            </iframe>
          ) }
        </div>
      </ModalBody>
    </Modal>
  );
});

DrawioModal.displayName = 'DrawioModal';
