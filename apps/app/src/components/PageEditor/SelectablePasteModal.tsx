import React, {
  useEffect,
  useState,
} from 'react';

import { useTranslation } from 'next-i18next';
import {
  Modal,
  ModalBody,
  ModalHeader,
  Button,
  Card,
  CardHeader,
  CardBody,
} from 'reactstrap';

import { useSelectablePasteModal } from '~/stores/modal';
import loggerFactory from '~/utils/logger';

import {
  YOUTUBE_URL_REGEX, GOOGLE_DOCS_URL_REGEX, GOOGLE_SPREAD_SHEET_URL_REGEX, GOOGLE_SLIDE_URL_REGEX, CACOO_URL_REGEX,
} from './SelectablePasteHelper';

const logger = loggerFactory('growi:components:SelectablePasteModal');

const getLink = (url: string | undefined): string => {
  if (url == null) {
    return '';
  }

  return `[(Page Title)](${url})`;
};

const getContentByUrl = (url: string | undefined): string => {
  if (url == null) {
    return '';
  }

  switch (true) {
    case YOUTUBE_URL_REGEX.test(url): {
      // refs: https://gist.github.com/afeld/1254889
      const YOUTUBE_ID_REGEX = /(youtu\.be\/|youtube\.com\/(watch\?(.*&)?v=|(embed|v)\/))([^?&"'>]+)/;
      const found = url.match(YOUTUBE_ID_REGEX);
      if (found == null) {
        return '';
      }
      const videoId = found[5];

      return `
      <figure>
        <div class="embed-responsive embed-responsive-4by3">
          <iframe src="https://www.youtube.com/embed/${videoId}" class="embed-responsive-item"></iframe>
        </div>
        <figcaption>
          <a href="${url}" target="_blank">Youtube へのリンク</a>
        </figcaption>
      </figure>
      `.split('\n').map(line => line.trim()).join('');
    }
    case (GOOGLE_SPREAD_SHEET_URL_REGEX.test(url) || GOOGLE_DOCS_URL_REGEX.test(url) || GOOGLE_SLIDE_URL_REGEX.test(url)): {
      const replacedUrl = url.replace(/\/edit/, '/preview');
      return `
      <figure>
        <div class="embed-responsive embed-responsive-4by3">
          <iframe src="${replacedUrl}" class="embed-responsive-item" frameborder="0" scrolling="no"></iframe>
        </div>
        <figcaption>
          <a href="${url}" target="_blank">ドキュメントへのリンク</a>
        </figcaption>
      </figure>
      `.split('\n').map(line => line.trim()).join('');
    }
    case CACOO_URL_REGEX.test(url): {
      const replacedUrl = `${url}/view?w=400&h=300`;
      return `
      <figure>
        <div class="embed-responsive embed-responsive-4by3">
          <iframe src="${replacedUrl}" class="embed-responsive-item" frameborder="0" scrolling="no"></iframe>
        </div>
        <figcaption>
          <a href="${url}" target="_blank">ドキュメントへのリンク</a>
        </figcaption>
      </figure>
      `.split('\n').map(line => line.trim()).join('');
    }
  }

  return '';
};

export const SelectablePasteModal = (): JSX.Element => {
  const { t } = useTranslation('commons');
  const { data: selectablePasteData, close: closeSelectablePasteModal, mutate } = useSelectablePasteModal();
  const isOpened = selectablePasteData?.isOpened ?? false;
  const [embedHtml, setEmbedHtml] = useState<string>('');

  useEffect(() => {
    const content = getContentByUrl(selectablePasteData?.url);
    if (content != null) {
      setEmbedHtml(content);
    }
  }, [selectablePasteData]);

  const close = () => {
    closeSelectablePasteModal();
  };

  const closeButton = (
    <span>
      {/* change order because of `float: right` by '.close' class */}
      <button type="button" className="close" onClick={close} aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </span>
  );

  const submitUrl = (type: string) => {
    let contents;
    switch (type) {
      case 'text':
        contents = selectablePasteData?.url;
        break;
      case 'link':
        contents = getLink(selectablePasteData?.url);
        break;
      case 'embed':
        contents = getContentByUrl(selectablePasteData?.url);
        break;
    }
    if (selectablePasteData != null && selectablePasteData.onSubmit != null) {
      selectablePasteData.onSubmit(contents);
      closeSelectablePasteModal();
    }
  };

  const handleChangeUrlInput = (value: string) => {
    if (selectablePasteData == null) {
      return;
    }

    mutate({ isOpened: selectablePasteData.isOpened, url: value, onSubmit: selectablePasteData.onSubmit });
  };

  return (
    <Modal
      isOpen={isOpened}
      toggle={close}
      backdrop="static"
      className="selectable-paste-modal grw-body-only-modal-expanded"
      size="lg"
      keyboard={false}
    >
      <ModalHeader tag="h4" toggle={close} close={closeButton} className="bg-primary text-light">
        {t('selectable_paste_modal.title')}
      </ModalHeader>
      <ModalBody className="overflow-auto">
        {/* Loading spinner */}
        <div className="container">
          <div className="form-group my-3">
            <div className="input-group flex-nowrap">
              <div className="input-group-prepend">
                <span className="input-group-text">URL</span>
              </div>
              <input
                type="text"
                className="form-control"
                id="label"
                value={selectablePasteData?.url}
                onChange={e => handleChangeUrlInput(e.target.value)}
              />
            </div>
          </div>
          { selectablePasteData?.url != null && selectablePasteData?.url !== ''
            ? (
              <>
                <Card className="card">
                  <CardHeader className="card-header d-flex align-items-center">
                    <div className="flex-grow-1">テキスト形式</div>
                    <Button onClick={() => submitUrl('text')}>この形式で貼り付ける</Button>
                  </CardHeader>
                  <CardBody className="card-body">{selectablePasteData?.url}</CardBody>
                </Card>
                <Card className="card">
                  <CardHeader className="card-header d-flex align-items-center">
                    <div className="flex-grow-1">リンク形式</div>
                    <Button onClick={() => submitUrl('link')}>この形式で貼り付ける</Button>
                  </CardHeader>
                  <CardBody className="card-body">
                    {getLink(selectablePasteData?.url)}
                  </CardBody>
                </Card>
                <Card className="card">
                  <CardHeader className="card-header d-flex align-items-center">
                    <div className="flex-grow-1">埋め込み形式</div>
                    <Button onClick={() => submitUrl('embed')}>この形式で貼り付ける</Button>
                  </CardHeader>
                  <CardBody className="card-body">
                    { /* eslint-disable-next-line react/no-danger */ }
                    <strong>HTML</strong>
                    <pre className="p-2 bg-light rounded">
                      {embedHtml}
                    </pre>
                    <strong>プレビュー</strong>
                    <div dangerouslySetInnerHTML={{ __html: embedHtml }}></div>
                  </CardBody>
                </Card>
              </>
            )
            : <div className="alert alert-info">URL を入力してください</div>
          }
        </div>
      </ModalBody>
    </Modal>
  );
};
